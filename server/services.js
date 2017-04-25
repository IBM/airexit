var Q = require('q');
var config = require('./config.json');

var DB;
var realtimeNotifier;

var env = config.environment[config.environment_mode];
if (!env) {
  throw 'Wrong environment setted.';
}

var HOST = env.SERVER_HOST + (env.SERVER_PORT ? ':' + env.SERVER_PORT: '');

var service = {};

service.setDB = function(db) {
  console.log('Setting DB in Services');
  DB = db;
};

service.setRealtimeNotifier = function(_realtimeNotifier) {
  console.log('Setting realtimeNotifier in Services');
  realtimeNotifier = _realtimeNotifier;
};

service.getUsers = function(query) {
  query = query || {};
  query.deleted = false;
  return DB.get('User', query, {_id:1});
};

service.getUser = function(id) {
  return DB.getOne('User', {_id: id});
};

service.getUserByEmail = function(email) {
  return DB.getOne('User', {email: email});
};

service.saveUser = function(data) {
    var user;
    if (data._id) {
        user = data;
        user.updated_at =  new Date();
        return DB.update('User', data._id, user);
    }
    else {
      return service.getUserByEmail(data.email).then(function(user) {
        if (user) {
          return Q.reject('User already exists');
        }
      }, function(reason) {
        if (reason == 'Not found.') {
          user = {
              name: data.name,
              admin: data.admin,
              email: data.email,
              created_at: new Date(),
              updated_at: new Date(),
              deleted: false
          };
          return DB.insert('User', user);
        }
        return Q.reject(error);
      });
    }
};

service.removeUser = function(id) {
  return service.getUser(id).then(function (user) {
    if (!user) {
        return Q.reject(err);
    }
    else {
      user.deleted = true;
      return DB.update('User', id, user);
    }
  });
};

module.exports = service;
