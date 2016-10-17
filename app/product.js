'use strict';

const fs = require('fs');

let Product = (options) => {

  let path;
  let filepath;

  let data = {
    'item_id': options.item_id || undefined,
    'item_number': options.item_number || undefined,
    'item_name': options.item_name || undefined,
    'balance': options.balance || undefined
  }

  let fields = options.fields || undefined;

  let podio = options.podio || undefined;

  const isNode = typeof phantom === 'undefined';

  let get_item_id_from_filepath = (path) => {
    return parseInt(path.substring(path.lastIndexOf('/')+1, path.lastIndexOf('.')));
  }

  if (options.path){
    path = options.path;
  } else if (options.filepath) {
    filepath = options.filepath;
    data.item_id = get_item_id_from_filepath(filepath);
  } else {
    throw new Error('No path or filepath set');
  }

  let get_filename = () => {
    if (!filepath){
      filepath = path + data.item_id + '.json';
    }

    return filepath;
  }

  /*
   * read item from Podio
   */
  let fetch = () => {
    return new Promise((resolve, reject) => {
      let url = `/item/${data.item_id}/value/${fields.item_number}/v2`;
      podio.request('GET', url, undefined)
      .then((response) => {
        data.item_number = response.values;
        data.balance = data.balance || 0;
        resolve();
          ;
      }).catch((error) => {
        reject(Error(error));
      });
    });
  }

  /*
   * read item from file
   */
  let read = () => {
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
    data.item_name = file_content.item_name;
    data.balance = file_content.balance;
  }

  /*
   * write item to file
   */
  let write = () => {
    return new Promise((resolve, reject) => {
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

  let write_name_to_podio = () => {
    let new_data = {};

    // TODO break out into mapping function
    new_data[fields.item_name] = data.item_name;

    console.log('NEW_DATA', new_data);
    console.log('DATA', data);

    podio.request('PUT', '/item/' + data.item_id, {
      fields: new_data
    }).then(function(responseData){
      console.log('item create success');
    }, function(e){
      console.error('Error:', e.body.error);
      console.error('Error description:', e.description);
      console.error('HTTP status:', e.status);
      console.error('Requested URL:', e.url);
    });
  }

  let comment = (text) => {
    return new Promise((resolve, reject) => {
      if (!data.item_id){
        reject(Error('No item id'));
      } else {
        let url = `/comment/item/${data.item_id}`;
        podio.request('POST', url, {
          value: text
        })
        .then((response) => {
          resolve();
        })
        .catch((error) => {
          reject(Error(error));
        });
      }
    });
  }

  let remove = () => {
    return new Promise((resolve, reject) => {
      let filename = get_filename();
      fs.unlink(filename, (err) => {
        if (err && err.code !== 'ENOENT'){ // don't trigger for missing files
          reject(Error(err));
        } else {
          resolve('The file was deleted');
        }
      });
    });
  }

  let set = (key, value) => {
    if (key in data){
      data[key] = value;
    } else {
      throw new Error(`There is no ${key} in the product data.`);
    }
  }

  let to_object = () => {
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
    'write': write,
    'write_name_to_podio': write_name_to_podio,
    'comment': comment
  };
};

module.exports = Product;
