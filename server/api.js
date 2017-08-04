//var service = require('./services0.js');
var express = require('express');
var jwt = require('jsonwebtoken');
var Q = require('q');
var request = require('request');
var extend = require('util')._extend;
var api = {};

var service;

api.setService = function(_service) {
  console.log('Setting services in API');
  service = _service;
}

api.getRouter = function(resources) {
  var router = express.Router();
  var bodyHasRequiredProperties = function(body, properties){
    for (var i in properties) {
      var prop = properties[i];
      if(!body.hasOwnProperty(prop)) {
          return false;
      } else {
        if (body[prop] !== 0 && !body[prop]) {
          return false;
        }
      }
    }
    return true;
  };

  router.use(function(req, res, next) {
    console.log(req.method + ': ' + req.url);
    next();
  });

  // route middleware to verify a token
  router.use(function verifyTokenMiddleware(req, res, next) {
    // avoid authentication in this cases
    if (req.url === '/ssoauthenticate' || req.method == 'OPTIONS'
        || req.url.indexOf('/travellers') != -1
        || req.url.indexOf('/sessions') != -1) {
      next();
      return;
    }

    var token = req.headers.authorization;
    token = token && token.split(' ')[1];
    // decode token
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, 'secretkey', function(err, decoded) {
        if (err) {
          res.statusCode = 401;
          return res.json({ success: false, message: 'Failed to authenticate token.' });
        }
        else {
          var user = decoded._doc || decoded;
          if (!user) {
            res.statusCode = 401;
            return res.json({ success: false, message: 'Failed to authenticate token.' });
          }
          service.getUser(user._id).then(function(response) {
            req.user = response;
            next();
          }, function(reason) {
            res.statusCode = 401;
            return res.json({ success: false, message: 'Failed to authenticate token.' });
          });
        }
      });
    }
    else {
      return res.status(403).send({
          success: false,
          message: 'No token provided.'
      });
    }
  });

  var ssoAuthMiddleware = function(req, res, next) {
    request.post('https://sso-button.stage1.mybluemix.net/api/validate-access-token', {
      form: {
            access_token: req.body.access_token
      }
    }, function (error, response, body) {
      if (!error) {
        var json = JSON.parse(body);
        if (json.success) {
          req.body.email = json.data.sub;
          console.log('NEXT: ');
          next();
        } else {
          console.log('ERROR not success token');
          res.status(401).send('Wrong credentials');
        }
      } else {
        res.status(401).send('Wrong credentials');  
      }
    });
  };

  router.post('/ssoauthenticate', ssoAuthMiddleware, function(req, res) {
    console.log('email: ', req.body.email);
    service.getUserByEmail(req.body.email).then(function(user) {
      console.log('Loggin user: ', user);
      if (!user) {
        res.statusCode = 400;
        res.json({ success: false, message: 'Authentication failed. User not found.' });
      }
      else {
        // create a token
        var token = jwt.sign(user, 'secretkey', {
          expiresIn: 60*60*24 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
          success: true,
          user: user,
          token: token
        });
      }
    }, function(reason) {
       console.log('Error in login: ', reason);
       res.statusCode = 400;
       res.json({
         success: false,
         error: reason
       });
    });
  });

  router.post('/login', function(req, res) {
    console.log('email: ', req.body.passport);
    service.getOneBy('traveller', 'uuid', req.body.passport).then(function(entity) {
      console.log('Loggin user: ', entity);
      if (!entity || req.body.password != entity.uuid) {
        res.statusCode = 400;
        res.json({ success: false, message: 'Authentication failed.' });
      }
      else {
        // create a token
        var token = jwt.sign(user, 'secretkey', {
          expiresIn: 60*60*24 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
          success: true,
          user: user,
          token: token
        });
      }
    }, function(reason) {
       console.log('Error in login: ', reason);
       res.statusCode = 400;
       res.json({
         success: false,
         error: reason
       });
    });
  });

  router.post('/logout', function(req, res) {
    res.json({ success: true, message: 'Logged out' });
  });

  router.get('/checktoken', function(req, res){
    res.json({ success: true, message: 'Token OK.' });
  });

  var addResource = function(collection) {
    
    router.get('/' + collection, function(req, res){
      service.getAll(collection).then(function(response) {
        res.json(response);
      }, function(reason) {
        res.json({error: reason});
      });
    });
    
    router.get('/' + collection + '/:id', function(req, res){
      var id = req.params.id;
      service.getOne(collection, id).then(function(response) {
        res.json(response);
      }, function(reason) {
        res.json({error: reason});
      });
    });

    router.delete('/' + collection + '/:id', function(req, res){
      var id = req.params.id;
      service.remove(collection, id).then(function() {
        res.send('');
      }, function(reason) {
        res.json({error: reason});
      });
    });

    router.put('/' + collection + '/:id', function(req, res){
      var id = req.params.id;
      service.getOne(collection, id).then(function(entity) {
        var updatedEntity = extend(entity, req.body);
        service.save(collection, updatedEntity).then(function(response) {
          res.json(response);
        }, function(reason) {
          res.json({error: reason});
        });
      }, function(reason) {
        res.statusCode = 404;
        res.json('Not found.');
      });
    });

    router.post('/' + collection, function(req, res) {
      service.save(collection, req.body).then(function(entity) {
        res.json(entity);
      }, function(reason) {
        res.statusCode = '400';
        res.json({error: reason});
      });
    });
  }

  resources.forEach(function(resource) {
    addResource(resource);
  });
  
  var routes = [];
  for (var index in router.stack) {
    var layer = router.stack[index];
    if (layer.route) {
        var getMethod = function (methods) {
          if (methods.put) {
            return 'PUT'
          }
          if (methods.get) {
            return 'GET'
          }
          if (methods.post) {
            return 'POST'
          }
          if (methods.delete) {
            return 'DELETE'
          }
        };
        routes.push({ method: getMethod(layer.route.methods) , url: layer.route.path});
    }
  }
  router.get('/doc', function(req, res){
    var html = '';
    routes.forEach(function(route) {
      html+= '<div>' + route.method + ' -> '+ route.url + '</div>'
    });
    res.send(html);
  });

  return router;
};
module.exports = api;
