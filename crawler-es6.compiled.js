'use strict';

var fs = require('fs');
var config = require('./config.js');

var func = function func() {
    console.log('from function');
};

console.log('Phantom timed out after 40 seconds.');
phantom.exit();
