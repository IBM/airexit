/* jshint node:true */


var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    SocketIO = require('socket.io').listen(server),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    api = require('./api.js'),
    FileStreamRotator = require('file-stream-rotator'),
    fs = require('fs'),
    morgan = require('morgan'),
    // dbFactory = require('./db/dbFactory.js'),
    collections = require('./db/collections.js');

var service = require('./services.js');
var RealtimeNotifier = require('./realtimeNotifier.js');
var realtimeNotifier = new RealtimeNotifier(SocketIO);
service.setRealtimeNotifier(realtimeNotifier);

api.setService(service);
var setupLogger = function() {
  var logDirectory = __dirname + '/log';
  fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
  // create a rotating write stream
  var accessLogStream = FileStreamRotator.getStream({
    date_format: 'YYYYMMDD',
    filename: logDirectory + '/access-%DATE%.log',
    frequency: 'daily',
    verbose: false
  });
  return accessLogStream;
};

// setup the logger
app.use(morgan('short', {stream: setupLogger()}));

// var DB;
/*dbFactory(collections).then(function(instance) {
  DB = instance;
  service.setDB(instance);
  init();
}, function(reason) {

  var testRouter = express.Router();
  testRouter.get('/', function(req, res){
    res.json(reason);
  });
  app.use('/errors', testRouter);
  console.log('Error connecting to DB: ' + reason);
  console.log('Server NOT started.');
});*/

app.use(express.static(__dirname + '/../dist'));

app.use('/monitor', express.static(__dirname + '/../monitor/dist'));

app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));
app.use(bodyParser.json({limit: '10mb'}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

var port = (process.env.VCAP_APP_PORT || 8999);
var host = (process.env.VCAP_APP_HOST || 'localhost');

server.listen(port);

function init() {

  // init users
  console.log('Initing users...');
  /*service.saveUser({
    name: 'Facundo Crego',
    email: 'facrego@ar.ibm.com',
    admin: true
  }, 'admin').then(function(user) {
    console.log('User facrego@ar.ibm.com added');
  }, function(reason) {
    console.log('User facrego@ar.ibm.com already exists');
  });*/

  var cacheRouter = new express.Router();
  cacheRouter.get('/', function(req, res) {
    var response = [];
    var collections = DB.getCollections();
    for (var key in collections) {
      var collection = collections[key];
      var obj = {};
      obj[collection.name] = collection.cache.responses;
      response.push(obj);
    }
    res.json(response);
  });
  //app.use('/cache', cacheRouter);

  var requestRouter = new express.Router();
  var request = require('request');
  requestRouter.post('/', function(req, res) {
    if (!req.body.url) {
      res.status(400).send('Missing url param');
    }
    request(req.body.url, function (error, response, body) {
      if (error) {
        res.status(404).send('Invalid request or not found.');
        return;
      }
      try {
        res.json(JSON.parse(body));
      } catch(e) {
        res.status(400).send('Invalid request unable to parse response to JSON');
      }
    });
  });
  app.use('/request', requestRouter);

  app.use('/api', api.getRouter());
  console.log('Started at http://' + host + ':' + port);
  console.log('API doc at http://' + host + ':' + port + '/api/doc');
}

init();