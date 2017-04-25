'use strict';

angular.module('app')
  .service('RealtimeNotifier', [function() {
    var socketURL = '/';
    if (window.location.hostname === 'localhost') {
      socketURL = 'http://localhost:8889';
    }
    var socket = io(socketURL, function(error) {
      console.log('Failed socket connection', error);
    });

    this.joinRoom = function(roomId, userId) {
      socket.emit('joinRoom', {
        roomId: roomId,
        userId: userId
      });

      var subscriptions = [];

      return {
        leaveRoom: function(userId) {
          subscriptions.forEach(function(data) {
            socket.removeListener(data.eventName, data.callback);
          });

          socket.emit('leaveRoom', {
            roomId: roomId,
            userId: userId
          });
        },
        on: function(eventName, callback) {
          subscriptions.push({
            eventName: eventName,
            callback: callback
          });
          socket.on(eventName, callback);
        }
      };
    };

}]);
