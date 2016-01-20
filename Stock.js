/**
 * Updates the stock values in a Podio app
 * @param object config contains client_id, client_secret, app_id, app_token
 */
var Stock = function(config, podio){
  this.config = config;

  //console.log(config, PodioJS);

  //Setup Podio connection to app
  this.podio = podio;
};

/**
 * Update stock in Podio
 */

Stock.prototype = {

  constructor: Stock
  
  ,update: function(item_id, data){
    // 1. Search by item number in title
    var that = this;
    this.podio.isAuthenticated().then(function(){
      that.put_update(item_id, data.balance);
    }).catch(function(){
      that.podio.authenticateWithApp(that.config.balances.app_id, that.config.balances.app_token, function(err, responseData){
        console.log('app auth success');
        that.put_update(item_id, data.balance);
      });
    });
    // 2. Update balance field
  },
  // get_item: function(item_number, balance, callback){
  //   console.log('start get_item');
  //   var that = this;
  //   this.podio.request('POST', '/item/app/' + this.config.app_id + '/filter/', {
  //     limit: 1,
  //     filters: {
  //       title: item_number
  //     }
  //   }).then(function(responseData){
  //     var item_id = responseData.items[0].item_id || false;

  //     if (item_id){
  //       callback.call(that, item_id, balance);
  //     }
  //   }).catch(function(err){
  //     console.log(err);
  //   });
  // },
  put_update: function(item_id, balance){
    console.log('put update');
    var timestamp = new Date().toISOString(),
      start_date = timestamp.substr(0,10),
      start_time = timestamp.substr(11,5);

    var data = {};

    data[this.config.balances.fields.item_number] = item_id;
    data[this.config.balances.fields.balance] = balance;
    data[this.config.balances.fields.timestamp] = {
      start_date: start_date,
      start_time: start_time
    };

    this.podio.request('POST', '/item/app/' + this.config.balances.app_id + '/', {
      fields: data
    }).then(function(responseData){
      console.log('item create success');
    }, function(e){
      console.error('Error:', e.body.error);
      console.error('Error description:', e.description);
      console.error('HTTP status:', e.status);
      console.error('Requested URL:', e.url);
    });
  }
};

module.exports = Stock;