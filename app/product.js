'use strict';

const fs = require('fs');

let Product = function(options){

  let path;
  let filepath;
  let podio = options.podio || undefined;

  let data = {
    'item_id': options.item_id || undefined,
    'item_number': options.item_number || undefined,
    'balance': options.balance || undefined
  }

  let fields = options.fields || undefined;

  const isNode = typeof phantom === 'undefined';

  if (options.path){
    path = options.path;
  } else if (options.filepath) {
    filepath = options.filepath;
    data.item_id = get_item_id_from_filepath(filepath);
  } else {
    throw new Error('No path or filepath set');
  }

  function get_filename(){
    if (!filepath){
      filepath = path + data.item_id + '.json';
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
      let url = `/item/${data.item_id}/value/${fields.item_number}/v2`;
      podio.request('GET', url, undefined)
      .then(function(response){
        data.item_number = response.values;
        data.balance = data.balance || 0;
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
    let file_content;
    if (isNode){
      file_content = fs.readFileSync(filename, {
        encoding: 'utf8'
      });
    } else {
      file_content = fs.read(filename);
    }

    file_content = JSON.parse(file_content);

    data.item_number = file_content.item_number;
    data.balance = file_content.balance;
  }

  /*
   * write item to file
   */
  function write(){
    return new Promise(function(resolve, reject) {
      try {
        if (isNode){
          fs.writeFileSync(get_filename(), JSON.stringify(to_object()), 'utf8');
        } else {
          fs.write(get_filename(), JSON.stringify(to_object()), 'w');
        }

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

  function set(key, value){
    if (key in data){
      data[key] = value;
    } else {
      throw new Error(`There is no ${key} in the product data.`);
    }
  }

  function to_object(){
    return data;
  }

  return {
    'fetch': fetch,
    'get_filename': get_filename,
    'isNode': isNode,
    'read': read,
    'remove': remove,
    'set': set,
    'to_object': to_object,
    'write': write
  };
};

module.exports = Product;
