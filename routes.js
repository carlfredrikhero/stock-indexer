'use strict';
let config = require('./config');
let handlePodioHook = require('./includes/helpers').handlePodioHook;
let Products = require('./app/products');
let Product = require('./app/product');

module.exports = {
  home: function(req, res){
    res.send('Hello World!');
  },
  hook: function(req, res){
    let podio = req.session.podio;
    let data = req.body;
    podio.isAuthenticated().then(() => {
      handlePodioHook(config, podio, data);
    }).catch((err) => {
      podio.authenticateWithApp(config.podio.products.app_id, config.podio.products.app_token, function() {
        handlePodioHook(config, podio, data);
      });
    });
  },
  trigger: function(req, res){
    let podio = req.session.podio;
    let products = Products({
      path: config.data_path,
      podio: podio,
      balances_config: config.podio.balances
    });

    let product_array = products
                   .list()
                   .map((filepath) => {
                    console.log(filepath);
                    return Product({
                      podio: podio,
                      filepath: filepath
                    });
                   });

      product_array.forEach(p => p.read());

      products.add(product_array);

      podio.isAuthenticated().then(() => {
        products.save();
      }).catch((err) => {
        podio.authenticateWithApp(config.podio.balances.app_id, config.podio.balances.app_token, function() {
          products.save();
        });
      });

    res.send('Items will be updated in Podio. You can close this window.');
  }
};