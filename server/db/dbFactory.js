var Q = require('q');
var config = require('../config.json');

var DB_CONFIG = config.databases[config.active_database];
if (!DB_CONFIG) {
  throw "Wrong database configuration."
}

var dbFactory = function(collections) {
  console.log('Creating new DB');
  var defer = Q.defer();
  var DB;
  if (config.active_database === 'MONGODB') {
    DB = require('./mongodb.js');
  }
  if (config.active_database === 'MYSQL') {
    DB = require('./mysql.js');
  }
  if (config.active_database === 'CLOUDANT' || config.active_database === 'CLOUDANT_TEST') {
    DB = require('./cloudantdb.js');
  }
  DB.connect(collections).then(function() {
    defer.resolve(DB);
  }, function(reason) {
    defer.reject('Error connecting to DB:', reason);
  });
  return defer.promise;
};

module.exports = dbFactory;
