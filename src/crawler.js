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
})
;

items.forEach(p => p.read());

// 2. iterate through all items using a recursive function

let fetch_from_web = (items) => {
  let product = items.shift();

  let item = {
    data: product.to_object()
  };

  let terminate;

  crawler.navigate_to_item(item, (balance) => {
    console.log('Item: ' + item.data.item_id + ', Balance => ', balance);
    product.set('balance', balance);
    product.write().then(() => {
      clearTimeout(terminate);
      terminate = setTimeout(function(){
        var d = new Date();
        console.log(d.toTimeString() + ': exit phantom');
        phantom.exit();
      }, 15000);

      if (items.length){
        fetch_from_web(items);
      }
    }).catch((err) => {
      console.error(err);
    });

  });
};

fetch_from_web(items);

setTimeout(function(){
  console.log('Phantom timed out after 120 seconds.');
  phantom.exit();
}, 120000);
