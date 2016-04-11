'use strict';
let Product = require('../app/product');
// helpers.js

var fs = require('fs');

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
  handlePodioHook: handlePodioHook
};
