let fs = require('fs');
let config = require('./config.js');

let func = () => {
    console.log('from function');
}

console.log('Phantom timed out after 40 seconds.');
phantom.exit();
