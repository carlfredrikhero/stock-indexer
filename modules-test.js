var fs = require('fs');
var Product = require('./app/product.js');

var p = Product({
  filepath:'./data/400402566.json'
});

p.read();

p.set('balance', 400);
