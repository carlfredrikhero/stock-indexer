'use strict';

require('es6-promise').polyfill();

let config = require('../config');
let Product = require('../app/product.js');
let Products = require('../app/products.js');

let products = Products({
  path: config.data_path
});

phantom.cookiesEnabled = true;
phantom.javascriptEnabled = true;

var StockCrawler = require('../app/StockCrawler.js');
var crawler = new StockCrawler(config);

var terminate;

// 1. Get all items
let items = products
.list()
.map((filepath) => {
  return Product({
    filepath: filepath
  });
});

items.forEach(p => p.read());

// 2. iterate through all items using a recursive function

let fetch_from_web = (items) => {
  let product = items.shift();

  let item = {
    data: product.to_object()
  };

  crawler.navigate_to_item(item, (err, data) => {
    if (err){
      product.set('active', false)
    } else {
      product.set('balance', data.balance);
      product.set('item_name', data.item_name);
    }

    product
      .write()
      .then(next_item)
      .catch((e) => console.log('ERROR', err));
  });
};

fetch_from_web(items);

let next_item = () => {
  clearTimeout(terminate);
  terminate = setTimeout(() => {
    var d = new Date();
    console.log(d.toTimeString() + ': exit phantom');
    phantom.exit();
  }, 15000);

  if (items.length){
    fetch_from_web(items);
  }
};

const tout = config.phantomjs.timeout || 120;
setTimeout(() => {
  console.log(`Phantom timed out after ${tout} seconds.`);
  phantom.exit();
}, tout*1000);

phantom.onError = (msg, trace) => {
  var msgStack = ['PHANTOM ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
    });
  }
  console.error(msgStack.join('\n'));
  phantom.exit(1);
};
