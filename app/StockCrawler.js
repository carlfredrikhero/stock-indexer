/*
 * Login function
 * Product page function
 */

let StockCrawler = (config) => {
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
      let url = config.host + config.product_url + item.data.item_number;
      page.open(url, (status) => {
        console.log('OPENED: ' + url);
        console.log('GOT: ' + page.url);
        if (page.url.indexOf(config.login_url) == 0){
          login(item);
        } else {
          get_balance();
        }
      });
  }

  let get_balance = () => {
    let balance = page.evaluate(function(){
      try {
        let el = document.getElementById('detailsBalance');
        let html = el.innerHTML;
        balance = parseInt(html.substr(html.lastIndexOf('>')+1)) || 0;
        return balance;
      } catch (e) {
        return '';
      }
    });

    let item_name = page.evaluate(function(){
      try {
        let item_name = document.querySelector('#img-area h2').innerText;
        return item_name;
      } catch (e){
        return '';
      }

    });

    // Error handling
    if ('' === balance || '' === item_name){
      cb('No details', null);
    } else {
      cb(null, { balance, item_name });
    }
  }

  return {
    navigate_to_item
  }
};

module.exports = StockCrawler;
