/*
 * Login function
 * Product page function
 */

var StockCrawler = function(config){
  this.config = config;
  this.login_attempt = false;
  var webPage = require('webpage');
  this.page = webPage.create();
  this.page.settings.userAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36';
  this.page.settings.javascriptEnabled = true;
  this.page.settings.loadImages = false; //Script is much faster with this field set to false

  var that = this;

  this.page.onLoadFinished = function(){
    //console.log('LOAD finished');
    //console.log('LOGGED IN ' + that.login_attempt);
    if (that.login_attempt){
      that.login_attempt = false;
      that.navigate_to_item(that.item);
    }
  }
};

StockCrawler.prototype = {

  constructor: StockCrawler
  
  ,login: function(item){
    console.log('LOGIN');
    this.item = item;
    this.login_attempt = true;
    this.page.evaluate(function(username, password){
      document.getElementById("username").value=username;
      document.getElementById("password").value=password;
      document.getElementById("submit").click();
    }, this.config.username, this.config.password);
  }

  , navigate_to_item: function(item, callback){
      this.callback = callback || this.callback;
      var url = this.config.host + this.config.product_url + item.data.item_number;
      var that = this;
      this.page.open(url, function(status) {
        console.log('OPENED: ' + url);
        //console.log('GOT: ' + that.page.url);
        if (that.page.url.indexOf(config.login_url) == 0){
          that.login(item);
        } else {
          //console.log('GET DATA!!!');
          that.get_balance();
        }
      });
  }

  , get_balance: function(){
    var balance = this.page.evaluate(function(){
      var html = document.getElementById('detailsBalance').innerHTML;
      balance = parseInt(html.substr(html.lastIndexOf('>')+1)) || 0;
      return balance;
    });

    this.callback(balance);
  }
};

module.exports = StockCrawler;