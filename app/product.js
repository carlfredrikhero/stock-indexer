"use strict";

const fs = require('fs');

let Product = function(options){

  let path;
  let filepath;
  let podio;
  let item_id = options.item_id || undefined;
  let item_number = options.item_number || undefined;
  let balance = options.balance || undefined;

  let fields = options.fields || undefined;

  if (options.path){
    path = options.path;
  } else if (options.filepath) {
    filepath = options.filepath;
    item_id = get_item_id_from_filepath(filepath);
  } else {
    throw new Error('No path or filepath set');
  }

  if (options.podio){
    podio = options.podio;
  } else {
    throw new Error('No podio object set');
  }

  function get_filename(){
    if (!filepath){
      filepath = path + item_id + '.json';
    }
    
    return filepath;
  }

  function get_item_id_from_filepath(path){
    return parseInt(path.substring(path.lastIndexOf('/')+1, path.lastIndexOf('.')));
  }
  /*
   * read item from Podio
   */ 
  function fetch(){
    return new Promise(function(resolve, reject) {
      let url = `/item/${item_id}/value/${fields.item_number}/v2`;
      podio.request('GET', url, undefined)
      .then(function(response){
        item_number = response.values;
        balance = balance || 0;
        resolve();
          ;
      }).catch(function(error){
        reject(Error(error));
      });
    });
  }

  /*
   * read item from file
   */ 
  function read(){
    let filename = get_filename();
    let data;
    if (isNode){
      data = fs.readFileSync(filename, {
        encoding: "utf8"
      });
    } else {
      data = fs.read(filename);
    }

    data = JSON.parse(data);

    item_number = data.item_number;
    balance = data.balance;
  }

  /*
   * write item to file
   */ 
  function write(){
    return new Promise(function(resolve, reject) {
      try {
        fs.writeFileSync(get_filename(), JSON.stringify(to_object()), 'utf8');
        resolve();
      } catch (err){
        reject(Error(err));
      }
    });
  }

  function remove(){
    return new Promise(function(resolve, reject) {
      let filename = get_filename();
      fs.unlink(filename, function(err){
        if (err && err.code !== 'ENOENT'){ // don't trigger for missing files
          reject(Error(err));
        } else {
          resolve('The file was deleted');
        }
      });
    });
  }

  function to_object(){
    return {
      "item_id": item_id,
      "item_number": item_number,
      "balance": balance
    };
  }

  function isNode(){
    return typeof phantom === "undefined";
  }

  return {
    fetch,
    read,
    write,
    remove,
    to_object,
    get_filename
  };
};

module.exports = Product;