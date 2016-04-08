'use strict';
let Product = require('../app/product');
// helpers.js

var fs = require('fs');

let isNode = typeof phantom === "undefined";

var readDirSync = function(path){
  if (isNode){
    return fs.readdirSync(path);
  } else {
    return fs.list(path);
  }
}

var isFile = function(file){
  if (isNode){
    return fs.statSync(file).isFile();
  } else {
    return fs.isFile(file);
  }
}

var readFileSync = function(file){
  if (isNode){
    return fs.readFileSync(file, {
      encoding: "utf8"
    });
  } else {
    return fs.read(file);
  }
}

var get_files = function(path){
  return readDirSync(path)
  .map(function(file){
    return path + file;
  })
  .filter(function(file){
    return (file.substr(-5) === ".json" && isFile(file));
  });
}

var get_item_id = function(file){
  return parseInt(
    file.substring(
      file.lastIndexOf('/')+1, 
      file.lastIndexOf('.')
    )
  );
}

var get_items = function(files){
  var items = files.map(function(file){
    var data = JSON.parse(readFileSync(file));
    var item = {
      item_id: get_item_id(file),
      file: file,
      data: data
    };

    return item;
  });

   return items;
}

/**
 * podio
 * body (hook_id, type, item_id)
 */

// var oldhandlePodioHook = function(podio, type, config){
//   var type = req.body.type,
//   item_id = 0;
//   switch(type){
//     case 'hook.verify':
//     var hook_id = parseInt(req.body.hook_id);
//     var code = req.body.code;
//     podio.request('POST', '/hook/'+ hook_id +'/verify/validate', {
//       code: code
//     }).then(function(responseData){
//       console.log('PODIO HOOK VALIDATE SUCCESSFULL');
//     }).catch(function(error){
//       console.log('ERROR WITH HOOK VALIDATE');
//       console.log(error);
//     });
//     break;
//     case 'item.create':
//       // add data to file
//       item_id = parseInt(req.body.item_id);

//       podio.request('GET', '/item/'+ item_id +'/value/'+ config.podio.products.fields.item_number +'/v2', undefined).then(function(responseData){
//         var item_number = responseData.values;

//         console.log('item_number: ' + item_number);

//         var data = {
//           item_number: item_number,
//           balance: 0
//         };

//         fs.writeFile(config.data_path + item_id + '.json', JSON.stringify(data), 'utf8', function(err){
//           if (err){
//             console.log(err);
//           } else {
//             podio.request('POST', '/comment/item/' + item_id, {
//               value: 'Artikel ' + item_number + ' har lagt till i listan och kommer att få lagersaldo kontrollerat varje timme.'
//             }).then(function(responseData){
//               console.log('comment added');
//             }, function(err){
//               console.err(err);
//             });
//           }
//         });
//       }, function(err){
//         console.log(err);
//         console.log('FEL FRÅN PODIO');
//         console.err(err.body);
//       });
//     break;
//     case 'item.update':
//     break;
//     case 'item.delete':
//       item_id = parseInt(req.body.item_id);
//       fs.unlink('./data/' + item_id + '.json', function(err){
//         if (err && err.code !== 'ENOENT'){ // don't trigger for missing files
//           console.log(err);
//         } else {
//           console.log('The file was deleted');
//         }
//       });
//     break;
//   }
// }

let handlePodioHook = (config, podio, data) => {
  switch(data.type){
      case 'hook.verify':
        var hook_id = parseInt(data.hook_id);
        var code = data.code;
        podio.request('POST', '/hook/'+ hook_id +'/verify/validate', {
          code: code
        }).then(function(responseData){
          console.log('PODIO HOOK VALIDATE SUCCESSFULL');
        }).catch(function(error){
          console.log('ERROR WITH HOOK VALIDATE');
          console.log(error);
        });
      break;
      case 'item.create':
        var item_id = data.item_id;
        var product = Product({
          path: config.data_path,
          podio: podio,
          item_id: data.item_id,
          fields: config.podio.products.fields
        });

        product.fetch()
        .then(product.write)
        .then(() => {
          let data = product.to_object();
          let url = `/comment/item/${data.item_id}`;
          let text = `Artikel ${data.item_number} har lagt till i listan och kommer att få lagersaldo kontrollerat varje timme.`
          console.log(url, text);
          return podio.request('POST', url, {
            value: text
          });
        })
        .catch((error) => {
          console.error(error);
        });
      break;
      case 'item.delete':
        var item_id = data.item_id;
        var product = Product({
          path: config.data_path,
          podio: podio,
          item_id: data.item_id,
          fields: config.podio.products.fields
        });

        product.remove();
      break;
    }

};

module.exports = {
  get_files: get_files,
  get_items: get_items, 
  get_item_id: get_item_id, 
  handlePodioHook: handlePodioHook
};