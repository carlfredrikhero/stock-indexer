var fs = require('fs');
var path = require('path');

function get(authType, callback) {
  var fileName = path.join(__dirname, 'tmp/' + authType + '.json');
  var podioOAuth = fs.readFile(fileName, 'utf8', function(err, data) {

    // Throw error, unless it's file-not-found
    if (err && err.code !== 'ENOENT') {
        console.log(err);
        throw new Error('Reading from the sessionStore failed');
    } else if (data && data.length > 0) {
      callback(JSON.parse(data));
    } else {
      callback();
    }
  });
}

function set(podioOAuth, authType, callback) {
  var fileName = path.join(__dirname, 'tmp/' + authType + '.json');

  if (/server|app|client|password/.test(authType) === false) {
    throw new Error('Invalid authType');
  }
  
  fs.writeFile(fileName, JSON.stringify(podioOAuth), 'utf8', function(err) {
    if (err) {
      throw new Error('Writing in the sessionStore failed');
    }

    if (typeof callback === 'function') {
      callback();
    }
  });
}

module.exports = {
  get: get,
  set: set
};