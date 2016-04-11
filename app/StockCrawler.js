/*
 * Login function
 * Product page function
 */

var StockCrawler = (config) => {
  let item;
  let cb;
  let login_attempt = false;
  let webPage = require('webpage');
  let page = webPage.create();

  page.settings.userAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36';
  page.settings.javascriptEnabled = true;
  page.settings.loadImages = false; //Script is much faster with this field set to false

  page.onLoadFinished = () => {
    console.log('LOAD finished');
    console.log('LOGGED IN ' + login_attempt);
    if (login_attempt){
      login_attempt = false;
      navigate_to_item(item);
    }
  }

  let login = (current_item) => {
    console.log('LOGIN');
    item = current_item;
    login_attempt = true;
    page.evaluate(function(username, password){
      document.getElementById('username').value=username;
      document.getElementById('password').value=password;
      document.getElementById('submit').click();
    }, config.username, config.password);
  }

  let navigate_to_item = (item, callback) => {
      cb = callback || cb;
      var url = config.host + config.product_url + item.data.item_number;
      page.open(url, (status) => {
        console.log('OPENED: ' + url);
        console.log('GOT: ' + page.url);
        if (page.url.indexOf(config.login_url) == 0){
          login(item);
        } else {
          console.log('GET DATA');
          get_balance();
        }
      });
  }

  let get_balance = () => {
    var balance = page.evaluate(function(){
      var html = document.getElementById('detailsBalance').innerHTML;
      balance = parseInt(html.substr(html.lastIndexOf('>')+1)) || 0;
      return balance;
    });

    cb(balance);
  }

  return {
    navigate_to_item
  }
};

module.exports = StockCrawler;
