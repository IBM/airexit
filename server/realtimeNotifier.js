'use strict';

var UsersConnected = function() {
  this.users = {}; //to store sockets by user
};

UsersConnected.prototype.addUser = function(userId, socket) {
  console.log('User connected to realtime notifier');
  this.users[userId] = this.users[userId] || {};
  var user = this.users[userId];
  user = user || {};
  user[socket.id] = socket;
};


UsersConnected.prototype.getCount = function() {
  var i = 0;
  for (var key in this.users) { i++; }
  return i;
};

UsersConnected.prototype.removeUser = function(userId, socketId) {
  var user = this.users[userId];
  if (user) {
    delete user[socketId];
  }
};

UsersConnected.prototype.notify = function(notification) {
  for (var userId in this.users) {
     if (userId !== notification.whoId) {
       var user = this.users[userId];
       for (var socketId in user) {
         var socket = user[socketId];
         socket.emit(notification.event, notification);
       }
     }
  }
};

UsersConnected.prototype.toString = function() {
  var usersIds = [];
  for (var key in this.users) {
    var socketsIds = [];
    for (var skey in this.users[key]) {
      var socket = this.users[key][skey];
      socketsIds.push(socket.id)
    }
    usersIds.push('#Sockets ' + socketsIds.length + ': [' + socketsIds.join(',') + ']\n');
  }
  return '# Users ' + usersIds.length + ': \n[' + usersIds.join(',') + ']';
};

var Room = function(id) {
  this.id = id;
  this.users = new UsersConnected();
};

Room.prototype.getClientsCount = function() {
  return this.users.getCount();
};

Room.prototype.addClient = function(socket, userId) {
  this.users.addUser(userId, socket);
};

Room.prototype.removeClient = function(socketId, userId) {
  this.users.removeUser(userId, socketId);
};

Room.prototype.notify = function(notification) {
  console.log('Users in room: ', this.users.toString());
  this.users.notify(notification);
};

var RealtimeNotifier = function(SocketIO) {
  var _this = this;
  this.socketio = SocketIO;

  this.rooms = {};
  this.roomsBySocket = {}; //to reference roomId from socketId
  this.userBySocket = {}; //to reference userId from socketId

  var createRoom = function(roomId) {
    var room = new Room(roomId);
    _this.rooms[roomId] = room;
    return room;
  };

  this.socketio.sockets.on('connection', function(socket) {

    socket.on('joinRoom', function(data) {
        _this.roomsBySocket[socket.id] = _this.roomsBySocket[socket.id] || {};
        _this.roomsBySocket[socket.id][data.roomId] = data.roomId;
        _this.userBySocket[socket.id] = data.userId;

        if (_this.rooms[data.roomId]) {
            _this.rooms[data.roomId].addClient(socket, data.userId);
        }
        else {
          createRoom(data.roomId).addClient(socket, data.userId);
        }

        console.log('Room created: ' + data.roomId + '. User joined: ' + data.userId);
    });

    socket.on('leaveRoom', function(data) {
        var room = _this.rooms[data.roomId];
        if (room) {
          room.removeClient(socket.id, data.userId);
          console.log('User ' + data.userId + ' leaved the room ' + data.roomId);
        }
    });

    socket.on('disconnect', function() {
        var userId = _this.userBySocket[socket.id];
        var roomsIds = _this.roomsBySocket[socket.id];
        for (var roomId in roomsIds) {
          var room = _this.rooms[roomId];
          if (room) {
            room.removeClient(socket.id, userId);
          }
        }

        delete _this.roomsBySocket[socket.id];
        delete _this.userBySocket[socket.id];

        console.log('Socket ' +socket.id+ ' Disconnected. User ' + userId );
    });

  });
}

RealtimeNotifier.prototype.notify = function(notification) {
  var room = this.rooms[notification.roomId];
  if (room) {
    room.notify(notification);
  }
};

module.exports = RealtimeNotifier;
