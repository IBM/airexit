'use strict';

angular.module('app')
  .service('ApiService', ['$http','$q','$cookies', function($http, $q, $cookies) {
    // var serverURL = 'https://cbpdemo.mybluemix.net/api';
    //var uiServerURL = 'https://airexit.mybluemix.net/api';
    var serverURL = 'http://localhost:8997/api';
    var chaincodeURL = 'http://localhost:8999/api';
    var uiServerURL = 'http://localhost:8999/api';
    var token = '';
    var authenticated = false;
    var tokenChecked;
    var unathorizedCallback = function() {};
    var self = this;
    var resolve = function(response) {
      if (response.data.error) {
        return $q.reject(response.data.error);
      }
      return response.data;
    };

    var reject = function(response) {
      if (response.status === 401 || response.status === 403) {
        authenticated = false;
        token = '';
        tokenChecked = false;
        self.user = null;
        unathorizedCallback();
      }
      return $q.reject(response.data);
    };

    window.removeToken = function() {
      token = null;
    };

    var cache = {};

    var GET = function(url) {
      if (!cache[url]) {
        cache[url] = $http.get(url, {headers: {'Authorization': 'Bearer '+token, 'Content-Type' : 'application/json'}}).then(resolve, reject);
        setTimeout(function() {
          delete cache[url];
        }, 1000);
      }
      return cache[url];
    };

    var POST = function(url, data) {
      return $http.post(url, data, {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
            // 'Access-Control-Allow-Origin': '*'
          }
        }).success(function (data, status, headers, config) {
            console.log("success")
            console.log(data)
        }).error(function (data, status, headers, config) {
            console.log("error")
            console.log(data)
            console.log(status)
        });

    }
    // resolve, reject);
    // };
    var PUT = function(url, data) {
        if (!data) {
            return $http.put(url, null, {headers: {'Authorization': 'Bearer '+token}}).then(resolve, reject);
        }
        else {
            return $http.put(url, data, {headers: {'Authorization': 'Bearer '+token}}).then(resolve, reject);
        }
    };

    var DELETE = function(url) {
        return $http.delete(url, {headers: {'Authorization': 'Bearer '+token}}).then(resolve, reject);
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

  // this is submitting an "update" or event, a change in the users state
  // adjusting to invoke a smart contract instead of 'request' endpoint
  /*
  this.submit = function(eventType, partnerId, user, faceImage, location) {
    var data = {};
    data.partnerId = 'airline';
    data.requestType = 'write';
    data.data = {
      uuid: user.uuid,
      location: location,
      passportInfo: user.passportInfo,
      reservationInfo: user.reservationInfo,
      tsaPreCheck: user.tsaPreCheck,
      visaInfo: user.visaInfo,
      eventType: eventType,
      partnerId: partnerId,
      cbpInfo: user.cbpInfo,
      tsaInfo: user.tsaInfo,
      faceImage: CryptoJS.MD5(faceImage).toString()
    };
    return POST(serverURL+'/request', {document: data});
  };
  */

  var genRandId = function() {
    return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36)
  }

  this.submit = function(eventType, partnerId, passportId, faceImage, location, reservationNumber) {
    console.log("submitting event")
    var args = [
      genRandId(),
      Date.now().toString(),
      partnerId,
      eventType,
      location, // "LAX", // TODO, where is location set?
      passportId, //user.passportInfo, //user.uuid, // also passport number
      faceImage, // CryptoJS.MD5(faceImage).toString(), // TODO, change this back to store hash in blockchain, full image in cloudant
      reservationNumber //user.reservationNumber
    ]
    var data = {
      "method": "invoke",
      "params": {
        "ctorMsg": {
          "function": "add_event",
          "args": args
        }
      }
    }
    // TODO, also upload faceimage into cloudant?

    return POST(chaincodeURL + "/chaincode", data)
  };


  this.read = function(eventType, partnerId, user, faceImage) {
    var data = {};
    data.partnerId = 'airline';
    data.requestType = 'read';
    return POST(serverURL+'/request', {document: data});
  };

  // difference between passengers and travellers?
  this.getPassengers = function() {
    // return GET(serverURL+'/manifest');
    var data = {
      "method": "query",
      "params": {
        "ctorMsg": {
          "function": "get_all_travellers",
          "args": []
        }
      }
    }
    return POST(chaincodeURL + "/chaincode", data)
  };

  this.getTransaction = function(id) {
    return POST(serverURL+'/transaction', { txid: id });
  };

  this.deleteUser = function(id) {
    return DELETE(serverURL+'/users/'+id);
  };

  this.updateUser = function(data) {
    return PUT(serverURL+'/users/'+data._id, data);
  };

  this.registerTraveller = function(data, faceImage) {
    // return POST(uiServerURL+'/travellers', data);
    console.log("initializing traveller")
    // console.log(data)
    // var imageHash = CryptoJS.MD5(faceImage).toString()
    var args = [
      data.firstName, data.lastName, data.passportNumber, data.nationality, faceImage
    ]
    var data = {
      "method": "invoke",
      "params": {
        "ctorMsg": {
          "function": "init_traveller",
          "args": args
        }
      }
    }

    return POST(chaincodeURL + "/chaincode", data)
  };

  this.createReservation = function(data) {
    // return POST(uiServerURL+'/travellers', data);
    console.log("initializing reservation")
    var args = [
      genRandId(), data.passportNumber, data.partnerID, data.origin, data.destination, data.flightNumber
    ]
    var data = {
      "method": "invoke",
      "params": {
        "ctorMsg": {
          "function": "init_reservation",
          "args": args
        }
      }
    }
    return POST(chaincodeURL + "/chaincode", data)
  };

  this.getTravellers = function() {
    // return GET(uiServerURL+'/travellers');
    var data = {
      "method": "query",
      "params": {
        "ctorMsg": {
          "function": "get_all_travellers",
          "args": []
        }
      }
    }
    return POST(chaincodeURL + "/chaincode", data)
  };

  this.getTravellerReservation = function() {
    // return GET(uiServerURL+'/travellers');
    var data = {
      "method": "query",
      "params": {
        "ctorMsg": {
          "function": "get_traveller",
          "args": []
        }
      }
    }
    return POST(chaincodeURL + "/chaincode", data)
  };



  this.deleteTraveller = function(id) {
    return DELETE(uiServerURL+'/travellers/' + id);
  };

  this.addSession = function(data) {
    return POST(uiServerURL + '/sessions', data);
  };

  this.getSessions = function() {
    return GET(uiServerURL + '/sessions');
  };

  this.getSession = function(id) {
    return GET(uiServerURL + '/sessions/' + id);
  };

  this.updateSession = function(id) {
    return PUT(uiServerURL + '/sessions/' + id);
  };

  this.deleteSession = function(id) {
    return DELETE(uiServerURL + '/sessions/' + id);
  };

}]);
