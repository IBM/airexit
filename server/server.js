/* jshint node:true */


var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    request = require('request'),
    bodyParser = require('body-parser'),
    jwt = require('jsonwebtoken'),
    session = require('express-session');

var goToLogin = function(req, res) {
  var encodedHost = encodeURIComponent(req.headers.host);
  res.redirect('https://w3id.alpha.sso.ibm.com/isam/oidc/endpoint/amapp-runtime-oidcidp/authorize?client_id=MDA4MjIxYTktYmFiMC00&response_type=code&scope=openid&state=' + encodedHost);
}

var authMiddleware = function(req, res, next) {
  if (req.headers.host.indexOf('localhost') != -1 ) {
    next();
    return;
  }
  if (req.session && req.session.token) {
    jwt.verify(req.session.token, 'secretkey', function(err, decoded) {
      var token = decoded._doc || decoded;
      if (err || !token) {
        res.send('Error: ' + "No session invalid token varification with JWT");
      } else {
        next();
      }
    });
  } else {
    if (req.query.code) {
      var hostname = decodeURIComponent(req.query.state);
      request.post({
        url: 'https://w3id.alpha.sso.ibm.com/isam/oidc/endpoint/amapp-runtime-oidcidp/token',
        form: {
          code: req.query.code,
          client_id: 'MDA4MjIxYTktYmFiMC00',
          client_secret: 'ZDEyYjYyODUtZDE0Mi00',
          grant_type: 'authorization_code',
          state: hostname
        },
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'UIServer'
        } 
      }, function(err,httpResponse,body) {
        if (err) {
          console.log('Error:', err);
          res.send('Error: ' + err);
        } else {
          try {
            var tokenResponse = JSON.parse(httpResponse.body);
            var token = jwt.sign(tokenResponse, 'secretkey', {
              expiresIn: 60*60*24 // expires in 24 hours
            });
            req.session.token = token;
            next();
          } catch (e) {
            console.log('Error:', e);
            console.log('Body:', httpResponse.body);
            res.send('Error: ' + httpResponse.body);
          }
        }
      });
    } else {
      goToLogin(req, res);
    }
  }
}

app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));

app.use(authMiddleware, express.static(__dirname + '/../dist'));
//app.use('/secure', authMiddleware, express.static(__dirname + '/../dist'));

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
  console.log('Started at http://' + host + ':' + port);
}

init();