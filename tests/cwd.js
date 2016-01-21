var fs = require('fs');

var cwd = fs.absolute("../");

var config = fs.read(cwd + '/config.json');
console.log(config);

phantom.exit();