'use strict';

angular.module('app')
  .service('ApiService', ['$http','$q','$cookies', function($http, $q, $cookies) {
    var serverURL = '/api';
    var token = '';
    var authenticated = false;
    var tokenChecked;
    var unathorizedCallback = function() {};
    var self = this;

    var resolve = function(response) {
      return response;
    };

    var reject = function(response) {
      if (response.status === 401 || response.status === 403) {
        authenticated = false;
        token = '';
        tokenChecked = false;
        self.user = null;
        unathorizedCallback();
      }
      return $q.reject(response);
    };

    window.removeToken = function() {
      token = null;
    };

    var cache = {};

    var GET = function(url) {
      if (!cache[url]) {
        cache[url] = $http.get(serverURL+url, {headers: {'Authorization': 'Bearer '+token}}).then(resolve, reject);
        setTimeout(function() {
          delete cache[url];
        }, 1000);
      }
      return cache[url];
    };

    var POST = function(url, data) {
        return $http.post(serverURL+url, data, {headers: {'Authorization': 'Bearer '+token}}).then(resolve, reject);
    };

    var PUT = function(url, data) {
        if (!data) {
            return $http.put(serverURL+url, null, {headers: {'Authorization': 'Bearer '+token}}).then(resolve, reject);
        }
        else {
            return $http.put(serverURL+url, data, {headers: {'Authorization': 'Bearer '+token}}).then(resolve, reject);
        }
    };

    var DELETE = function(url) {
        return $http.delete(serverURL+url, {headers: {'Authorization': 'Bearer '+token}}).then(resolve, reject);
    };

    var buildQuery = function(query) {
        var ret = '';
        for (var param in query) {
            ret+= ret ? '&' : '?';
            ret+=param+'='+encodeURIComponent(query[param]);
        }
        return ret;
    };

  this.user = null;

  this.onUnauthorized = function(callback) {
    unathorizedCallback = callback;
  };

  this.createUser = function(data) {
    return POST('/users', data);
  };

  this.getUsers = function() {
    return GET('/users');
  };

  this.getUser = function(id) {
    return GET('/users/' + id);
  };

  this.deleteUser = function(id) {
    return DELETE('/users/'+id);
  };

  this.updateUser = function(data) {
    return PUT('/users/'+data._id, data);
  };

  this.isAuthenticated = function() {
    return authenticated;
  }

}]);
