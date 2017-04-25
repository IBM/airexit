var Cloudant = require('cloudant');
var Q = require('q');
var config = require('../config.json');
var uuid = require('uuid');
var Cache = require('./cache.js');
var queue = require('queue');

var DB_CONFIG = config.databases[config.active_database];
if (!DB_CONFIG) {
  throw "Wrong database configuration."
}

var DB = function() {
  this.collections = {};
  this.name = 'cloudant';
  this.db = null;
  this.indexes = null;
}

function getDBCredentials() {
  var cloudantConfig;
  if (config.environment_mode !== 'development') {
    if (!process.env.VCAP_SERVICES) {
      return {error: 'Error: VCAP_SERVICES environment variable expected.'};
    }
    cloudantConfig = JSON.parse(process.env.VCAP_SERVICES).cloudantNoSQLDB[0];
  }
  else { // Development mode

    var env_db_credentials = process.env.DB_TEST_CREDENTIALS;
    if (!env_db_credentials) {
      return {error: 'Error: Please set the Cloudant DB TEST credentials. \n You can copy the value from the settings of the test app in Bluemix, from Runtime/Environment Variables.\n Do "export DB_TEST_CREDENTIALS=<url_taken_from_bluemix>"'};
    }
    cloudantConfig = { credentials: { url: env_db_credentials}};
  }

  if (!cloudantConfig) {
    return {error:'Error: VCAP_SERVICES.cloudantNoSQLDB expected.'};
  }
  if (!cloudantConfig.credentials) {
    return {error:'Error: VCAP_SERVICES.cloudantNoSQLDB.credentials expected.'};
  }
  return {url: cloudantConfig.credentials.url};
}

DB.prototype = {
  connect: function(collections) {
    var defer = Q.defer();
    var self = this;

    var credentials = getDBCredentials();
    if (credentials.error) {
      defer.reject(credentials.error);
      return defer.promise;
    }

    var cloudant = Cloudant(credentials.url, function(err, cloudant) {
      if (err) {
        return Q.reject('Failed to initialize Cloudant: ' + err.message);
      }
      if (!DB_CONFIG.name) {
        return Q.reject('Error: please set database name in config.json');
      }
      self.db = cloudant.db.use(DB_CONFIG.name);
      self.db.index(function(er, result) {
        if (er) {
          defer.reject(er.reason);
        }
        else {
          console.log('The database has %d indexes', result.indexes.length);
          for (var i = 0; i < result.indexes.length; i++) {
            console.log('  %s (%s): %j', result.indexes[i].name, result.indexes[i].type, result.indexes[i].def);
          }
          self.indexes = result.indexes;
          self.setCollections(collections).then(function() {
              defer.resolve({});
          }, function(reason) {
            defer.reject({error: reason});
          });
        }
      });
    });
    return defer.promise;
  },
  insert: function(collection, data) {
    return this.collections[collection].insert(data);
  },
  update: function(collection, id, data) {
    return this.collections[collection].update(id, data).then(function(response) {
      if (response.error) {
        console.log('error in update: ', response.error);
        return Q.reject(response.error);
      }
      else {
        return Q.resolve(response);
      }
    }, function(reason) {
      console.log('failed update');
      return Q.reject({error: reason});
    });
  },
  delete: function(collection, id) {
    return this.collections[collection].remove(id);
  },
  //collection String name of the collection
  //query JSON object defining the query
  //sort JSON object {prop: order} (order: 1=ASC, -1=DESC)
  get: function(collection, query, sort) {
    sort = sort || {_id:1};
    return this.collections[collection].find(query, sort);
  },
  getOne: function(collection, query) {
    var defer = Q.defer();
    this.collections[collection].find(query, null).then(function (items) {
      if (items[0]){
        defer.resolve(items[0]);
      }
      else {
        defer.reject('Not found.');
      }
    }, function(reason) {
      defer.reject(reason);
    });
    return defer.promise;
  },
  setCollection: function(name, definition) {
    var self = this;
    var Collection = function(name, definition, db) {
      this.name = name;
      this.definition = definition;
      this.db = db;
      this.cache = new Cache(name);
      this.queue = queue();
    };
    Collection.prototype.setIndexes = function() {
      var defer = Q.defer();
      var _this = this;
      var exists = function(indexes, name) {
        for(var i = 0; i < indexes.length; i++) {
          if (indexes[i].name === name) {
            return true;
          }
        }
        return false;
      };
      var promises = [];
      for (var prop in _this.definition) {
        if (_this.definition[prop].unique) {
          if (!exists(self.indexes, _this.name + '_' + prop)) {
            var index = {
              name: _this.name + '_' + prop,
              type: 'json',
              index: {fields:[prop]}
            };
            var indexDefer = Q.defer();
            _this.db.index(index, function(er, response) {
              if (er) {
                indexDefer.resolve('Error creating index: ' + index.name);
                return;
              }
              indexDefer.resolve(response);
            });
            promises.push(indexDefer.promise);
          } else {
            console.log('Index exists: '+ _this.name + '_' + prop);
          }
        }
      }
      if (!exists(self.indexes, _this.name + '_all')) {
        console.log('Creating index' + _this.name + '_all');
        var index = {
          name: _this.name + '_all',
          type: 'json',
          index: {fields:['type','_id']}
        };
        var indexDefer = Q.defer();
        _this.db.index(index, function(er, response) {
          if (er) {
            indexDefer.resolve('Error creating index: ' + index.name);
            return;
          }
          indexDefer.resolve(response);
        });
        promises.push(indexDefer.promise);
      } else {
        console.log('Index exists: '+ _this.name + '_all');
      }
      Q.all(promises).then(function(result) {
        defer.resolve(result);
      }, function(reason) {
        defer.reject(reason);
      });
      return defer.promise;
    }
    Collection.prototype.insert = function(data) {
      var defer = Q.defer();
      var _this = this;
      data._id = uuid.v1();
      data.type = _this.name;
      _this.db.insert(data, function(err, newData) {
        if (err) {
            defer.reject(err);
        } else {
          if (_this.cache) {
            _this.cache.clear();
          }
          defer.resolve(newData);
        }
      });
      return defer.promise;
    };
    Collection.prototype.update = function(id, data) {
      var defer = Q.defer();
      var _this = this;

      _this.queue.push(function(next) {
        console.log('running update job');
        _this.find({_id: id}).then(function(items) {
          if (!items.length) {
            defer.reject(err);
            next();
            return;
          }
          var currentData = items[0];
          for (var prop in _this.definition) {
            if (data.hasOwnProperty(prop)) {
              currentData[prop] = data[prop];
            }
          }
          _this.db.insert(currentData, function(err, newData) {
            if (err) {
                console.log('Error cloudantBD update: ', err);
                defer.reject(err);
                next();
            } else {
              if (_this.cache) {
                currentData._rev = newData.rev;
                _this.cache.updateAll(currentData);
              }
              defer.resolve(currentData);
              next();
            }
          });
        }, function(reason) {
          defer.reject(reason);
          next();
        });
      });
      if (_this.queue.length == 1) {
        _this.queue.start();
      }
      return defer.promise;
    };
    Collection.prototype.find = function(query, sort) {
      var defer = Q.defer();
      var _this = this;
      query = query || {};
      if (_this.cache) {
        var cached = _this.cache.get({
          query: query,
          sort:sort
        });
        if (cached) {
          return Q.resolve(cached);
        }
      }
      var originalQuery = {};
      for (var prop in query) {
        originalQuery[prop] = query[prop];
      }
      query.type = _this.name;
      var sortParam = [];
      if (sort) {
        for (var prop in sort) {
          var obj = {};
          obj[prop] = (sort[prop] === 1) ? 'asc' : 'desc';
          sortParam.push(obj);
        }
      }
      _this.db.find({
        selector: query,
        //selector: query,
        //sort: sortParam
      }, function(err, items) {
        if (err) {
            defer.reject(err);
        } else {
          items = items.docs;
          if (_this.cache) {
            _this.cache.add({
              query: originalQuery,
              sort:sort
            }, items);
          }
          defer.resolve(items);
        }
      });
      return defer.promise;
    };
    Collection.prototype.remove = function(id) {
      var defer = Q.defer();
      var _this = this;

      _this.queue.push(function(next) {

        _this.find({_id: id}).then(function(items) {
          if (!items.length) {
            defer.reject(err);
            next();
            return;
          }
          _this.db.destroy(items[0]._id, items[0]._rev, function(err, data) {
            if (err) {
                defer.reject(err);
                next();
            } else {
              if (_this.cache) {
                _this.cache.clear();
              }
              defer.resolve(data);
              next();
            }
          });
        }, function(reason) {
          defer.reject(reason);
          next();
        });

      });
      if (_this.queue.length == 1) {
        _this.queue.start();
      }
      return defer.promise;
    };
    /*Collection.prototype.getCache = function() {
      return this.cache.getData();
    };*/
    console.log('Creating collection ', name);
    self.collections[name] = new Collection(name, definition, self.db);
    return self.collections[name].setIndexes();
  },
  setCollections: function(collections) {
    var promises = [];
    var _this = this;
    collections.forEach(function(collection) {
      promises.push(_this.setCollection(collection.name, collection.definition));
    })
    return Q.all(promises);
  }
};

module.exports = new DB();
