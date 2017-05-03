'use strict';

angular.module('app')
  .service('ApiService', ['$http','$q','$cookies', function($http, $q, $cookies) {
    var serverURL = 'https://cbpdemo.mybluemix.net/api';
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
        cache[url] = $http.get(serverURL+url, {headers: {'Authorization': 'Bearer '+token, 'Content-Type' : 'application/json'}}).then(resolve, reject);
        setTimeout(function() {
          delete cache[url];
        }, 1000);
      }
      return cache[url];
    };

    var POST = function(url, data) {
        return $http.post(serverURL+url, data, {headers: {'Authorization': 'Bearer '+token, 'Content-Type' : 'application/json'}}).then(resolve, reject);
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

  this.submit = function(eventType, partnerId, user, faceImage) {
    var data = {};
    data.partnerId = 'airline'
    data.requestType = 'write'
    data.data = {
      uuid: user.uuid,
      passportInfo: user.passportInfo,
      reservationInfo: user.reservationInfo,
      tsaPreCheck: user.tsaPreCheck,
      visaInfo: user.visaInfo,
      eventType: eventType,
      partnerId: partnerId,
      faceImage: 'testimage',//faceImage
    };
    /*data.data['eventType'] = eventType; //"CheckIn";
    data.data['partnerId'] = partnerId; //"airline";
    data.data['uuid'] = "582349291";
    data.data['passportInfo']['passportNumber'] = '582349291';
    data.data['passportInfo']['dateOfExpiration'] = '08/03/2021';
    data.data['passportInfo']['firstName'] = 'Gary';
    data.data['passportInfo']['lastName'] = 'Lac';
    data.data['passportInfo']['sex'] = 'M';
    data.data['reservationInfo']['ticketNumber'] = 'F82349';
    data.data['reservationInfo']['operatingCarrierCode'] = 'BAW';
    data.data['reservationInfo']['fromCityAirportCode'] = 'IAD';
    data.data['reservationInfo']['toCityAirportCode'] = 'LHR';
    data.data['reservationInfo']['flightNumber'] = '1523';
    data.data['reservationInfo']['dateOfFlight'] = '05/08/2017';
    data.data['reservationInfo']['frequentFlyerNumber'] = 'F29480J';
    data.data['tsaPreCheck']['indicator'] = 'Y';
    data.data['tsaPreCheck']['currentStatus'] = 'Green';
    data.data['visaInfo']['controlNumber'] = '9538453';
    data.data['visaInfo']['dateOfExpiration'] = '05/18/2020'; */

    return POST('/request', {document: data});
  };

  this.getPassengers = function() {
    return GET('/manifest');
  };

  this.getTransaction = function(id) {
    return POST('/transaction', { txid: id });
  };

  this.deleteUser = function(id) {
    return DELETE('/users/'+id);
  };

  this.updateUser = function(data) {
    return PUT('/users/'+data._id, data);
  };

}]);
