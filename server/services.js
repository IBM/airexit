var Q = require('q');
var extend = require('util')._extend;

var DB;
var realtimeNotifier;

var service = {};

service.setDB = function(db) {
  console.log('Setting DB in Services');
  DB = db;
};

service.setRealtimeNotifier = function(_realtimeNotifier) {
  console.log('Setting realtimeNotifier in Services');
  realtimeNotifier = _realtimeNotifier;
};

service.getAll = function(collection, query) {
  query = query || {};
  query.deleted = false;
  return DB.get(collection, query, {_id:1});
};

service.getOne = function(collection, id) {
  return DB.getOne(collection, {_id: id});
};

service.getOneBy = function(collection, propKey, propValue) {
  var query = {};
  query[propKey] = propValue;
  return DB.getOne(collection, query);
};

service.save = function(collection, data, key) {
    var entity;
    if (data._id) {
        entity = data;
        entity.updated_at =  new Date();
        return DB.update(collection, data._id, entity);
    }
    else {
      return service.getOneBy(collection, key, data[key]).then(function(response) {
        // console.log('Response: ', response);
        if (response) {
          // TODO, see if removing the following line breaks anything
          // return Q.reject('Entity already exists');
        }
      }, function(reason) {
        if (reason == 'Not found.') {
          entity = extend({}, data);
          entity.created_at = new Date();
          entity.updated_at = new Date();
          entity.deleted = false;
          return DB.insert(collection, entity);
        }
        return Q.reject(reason);
      });
    }
};

service.remove = function(collection, id) {
  return service.getOne(collection, id).then(function (entity) {
    if (!entity) {
        return Q.reject('Not found.');
    } else {
      return DB.delete(collection, id);
    }
  });
};

module.exports = service;
