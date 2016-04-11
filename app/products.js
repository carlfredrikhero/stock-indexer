'use strict';

let fs = require('fs');

let Balance = require('./balance');

let Products = (options) => {

  let path = options.path;
  let balances_config = options.balances_config || undefined;
  let podio = options.podio || undefined;

  let products = [];
  const isNode = typeof phantom === 'undefined';

  let list = () => {
    let files;
    if (isNode){
      files = fs.readdirSync(path);
    } else {
      files = fs.list(path);
    }

    return files
    .map(function(file){
      return path + file;
    })
    .filter(function(file){
      return (file.substr(-5) === '.json' && isFile(file));
    });
  };

  /*
   * Adds either an array of products or one product to existing array
   */
  let add = (args) => {
    if (Array.isArray(args)){
      products = args;
    } else {
      products.push(args);
    }
  };

  let save = () => {
    // 1. Create array of balance objects
    products
    .map((product) => {
      let data = product.to_object();
      console.log(data);
      return Balance({
        podio: podio,
        id: data.item_id,
        app_id: balances_config.app_id,
        balance: data.balance,
        fields: balances_config.fields
      });
    })
    // 2. Iterate through array of balance objects and call save on each
    .forEach((balance) => {
      balance.save();
    });

  };

  let isFile = (file) => {
  if (isNode){
    return fs.statSync(file).isFile();
  } else {
    return fs.isFile(file);
  }
}

  return {
    list,
    add,
    save
  };
};

module.exports = Products;
