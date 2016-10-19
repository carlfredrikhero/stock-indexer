'use strict';

const config = require('./config.js');
const Podio = require('podio-js').api;

const podio_create_item = require('./app/podio_create_item.js')

const podio = new Podio({
  authType: 'app',
  clientId: config.podio.client_id,
  clientSecret: config.podio.client_secret
})

const podio_create_product =  podio_create_item(
                                podio,
                                config.podio.products.app_id,
                                config.podio.products.app_token
                              )

const podio_create_tests =  podio_create_item(
                                podio,
                                '17011778',
                                '293595ce65224aafa1648941bdd2e9f4'
                              )

podio_create_product({
  '111827783': 'Artikelnummer'
})
.then(podio_create_tests({
  '132665': 'En liten titel'
})).catch((err) => {
  console.log('ERROR', JSON.stringify(err));
})

