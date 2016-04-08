var fs = require('fs');
var config = JSON.parse(fs.read('./config.json'));

phantom.cookiesEnabled = true;
phantom.javascriptEnabled = true;

var StockCrawler = require('./StockCrawler.js');
var crawler = new StockCrawler(config);

var get_items = require('./includes/helpers.js').get_items;

/*********SETTINGS END*****************/
 
console.log('All settings loaded, start with execution');

var items = get_items(config.data_path);

console.log(JSON.stringify(items));

var terminate;

function iterate(i){
  if (i<items.length){
      var data = JSON.parse(fs.read(items[i].file));
      crawler.navigate_to_item(items[i], function(balance){
        var d = new Date();
        console.log(d.toTimeString() + ': write "'+balance+'" to ['+i+'] ' + items[i].file);
        data.balance = balance;
        fs.write(items[i].file, JSON.stringify(data), 'w');

        clearTimeout(terminate);
        var terminate = setTimeout(function(){
          var d = new Date();
          console.log(d.toTimeString() + ': exit phantom');
          phantom.exit();
        }, 10000);
      
        iterate(i+1);
      });
  }
}

iterate(0);

setTimeout(function(){
  console.log('Phantom timed out after 40 seconds.');
  phantom.exit();
}, 60000);




