var fs = require('fs');

var cwd = fs.absolute("../");

var config = JSON.parse(fs.read(cwd + '/config.json'));
console.log(config);

phantom.exit();