var fs = require('fs');
var config = JSON.parse(fs.read('config.json'));

phantom.cookiesEnabled = true;
phantom.javascriptEnabled = true;

var StockCrawler = require('./StockCrawler.js');
var crawler = new StockCrawler(config);

/*********SETTINGS END*****************/
 
console.log('All settings loaded, start with execution');

var items = get_items();
var terminate = undefined;

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
        }, 5000);
      
        iterate(i+1);
      });
  }
}

iterate(0);

// 1. Load all item data
function get_items(){
  var path = './data/';
  var list = fs.list(path);
  var items = [];

  for(var i=0;i<list.length;i++){
    var file = path + list[i];
    if (fs.isFile(file)){
      var data = JSON.parse(fs.read(file));
        var item = {
          file: file,
          data: data
        };

        items.push(item);
    }
  }

  return items;
}

setTimeout(function(){
  phantom.exit();
}, 20000)



