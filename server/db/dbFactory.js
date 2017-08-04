var Q = require('q');
var DB = require('./cloudantdb.js');

var dbFactory = function(collections) {
  console.log('Creating new DB');
  var defer = Q.defer();
  DB.connect(collections).then(function() {
    defer.resolve(DB);
  }, function(reason) {
    defer.reject('Error connecting to DB:', reason);
  });
  return defer.promise;
};

module.exports = dbFactory;
