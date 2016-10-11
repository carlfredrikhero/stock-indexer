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

  let terminate;

  crawler.navigate_to_item(item, (err, data) => {
    if (err){
      console.log(err);
      let data = product.to_object();
      console.log(data);
      let text = `Artikel ${data.item_number} har av någon anledning ingen information på webshop. Ingen balans kommer att uppdateras framöver. Artikeln kan raderas.`;
      console.log(text);
      product
        .comment(text)
        .then(product.remove)
        .catch(console.error);

      return;
    } else {
      console.log(JSON.stringify(data));
      product.set('balance', data.balance);
      product.set('item_name', data.item_name);
    }

    product
      .write()
      .then(next_item)
      .catch(console.error);

  });
};

fetch_from_web(items);

let next_item = () => {
  clearTimeout(terminate);
  terminate = setTimeout(function(){
    var d = new Date();
    console.log(d.toTimeString() + ': exit phantom');
    phantom.exit();
  }, 15000);

  if (items.length){
    fetch_from_web(items);
  }
};

setTimeout(function(){
  console.log('Phantom timed out after 120 seconds.');
  phantom.exit();
}, 120000);

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
