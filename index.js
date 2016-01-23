var fs = require('fs');
var config = JSON.parse(fs.readFileSync('./config.json'));
var express = require('express');
var bodyParser = require('body-parser');
var chokidar = require('chokidar');
var PodioJS = require('podio-js').api;
var Stock = require('./Stock.js');
var sessionStore = require('./sessionStore');

var podio = new PodioJS({
  authType: 'app',
  clientId: config.podio.client_id,
  clientSecret: config.podio.client_secret
}, {
  sessionStore: sessionStore
});

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/hook/15obx191', function (req, res) {
  podio.isAuthenticated().then(function(){
    handlePodioHook(req);
  }, function(){
    podio.authenticateWithApp(config.podio.products.app_id, config.podio.products.app_token, function(err, responseData){
      console.log('app auth success');
      handlePodioHook(req);
    });
  });
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

  var stock = new Stock(config.podio, podio);

  var watcher = chokidar.watch('./data/*.json', {
    ignored: /[\/\\]\./,
    persistent: true
  });

  var log = console.log.bind(console);

  watcher
  .on('change', function(path) {
    log('File', path, 'has been changed');
    var item_id = parseInt(path.substring(path.lastIndexOf('/')+1, path.lastIndexOf('.')));
    var data = JSON.parse(fs.readFileSync(path, 'utf8')) || 0;
    if (data){
      stock.update(item_id, data);
    }
  })
  .on('unlink', function(path) { log('File', path, 'has been removed'); })
  .on('error', function(error) { log('Error happened', error); })
  .on('ready', function() { log('Initial scan complete. Ready for changes'); })
  .on('raw', function(event, path, details) {
    log('Raw event info:', event, path, details);
  });
});

function handlePodioHook(req){
  console.log('handlePodioHook started'); 
  console.log(req.body);
  var type = req.body.type,
  item_id = 0;
  switch(type){
    case 'hook.verify':
    var hook_id = parseInt(req.body.hook_id);
    var code = req.body.code;
    podio.request('POST', '/hook/'+ hook_id +'/verify/validate', {
      code: code
    }).then(function(responseData){
      console.log(responseData);
    }, function(err){
      console.log(err);
    });
    break;
    case 'item.create':
      // add data to file
      item_id = parseInt(req.body.item_id);

      podio.request('GET', '/item/'+ item_id +'/value/'+ config.podio.products.fields.item_number +'/v2', undefined).then(function(responseData){
        var item_number = responseData.values;

        var data = {
          item_number: item_number,
          balance: 0
        };

        fs.writeFile('./data/' + item_id + '.json', JSON.stringify(data), 'utf8', function(err){
          if (err){
            console.log(err);
          } else {
            console.log('The file was saved');
          }
        });
      }, function(err){
        console.log(err);
        console.log('FEL FRÅN PODIO');
        console.err(err.message);
      });
    break;
    case 'item.update':
    break;
    case 'item.delete':
      item_id = parseInt(req.body.item_id);
      fs.unlink('./data/' + item_id + '.txt', function(err){
        if (err && err.code !== 'ENOENT'){ // don't trigger for missing files
          console.log(err);
        } else {
          console.log('The file was deleted');
        }
      });
    break;
  }
}