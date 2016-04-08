var config = require('./config');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session')
var PodioMiddleware = require('podio-js').middleware;

var routes = require('./routes');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.use(PodioMiddleware({
  authType: 'app',
  clientId: config.podio.client_id,
  clientSecret: config.podio.client_secret
}));



app.get('/', routes.home);
app.post('/hook/15obx191', routes.hook);
app.get('/trigger', routes.trigger);


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});