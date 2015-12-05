var steps = [];
var index = 0;
var loadInProgress = false;//This is set to true when a page is still loading

var fs = require('fs');

var config = JSON.parse(fs.read('config.json'));

var webPage = require('webpage');
var page = webPage.create();
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36';
page.settings.javascriptEnabled = true;
page.settings.loadImages = false;//Script is much faster with this field set to false
phantom.cookiesEnabled = true;
phantom.javascriptEnabled = true;
/*********SETTINGS END*****************/
 
console.log('All settings loaded, start with execution');

steps.push(function(){
  console.log('Step 1 - Visit website');
  page.open(config.website, function(status){
      console.log(status);
  });
});

steps.push(function(){
  console.log('Step 2 - Login');

  page.evaluate(function(username, password){
    document.getElementById("username").value=username;
    document.getElementById("password").value=password;
    document.getElementById("submit").click();
  }, config.username, config.password);
});

steps.push(function(){
  console.log('Step 3 - Go to product');
  page.open('http://webshop.eelab.se/Product?product=103976')

  console.log(title);
});

//Execute steps one by one
interval = setInterval(executeRequestsStepByStep,50);
 
function executeRequestsStepByStep(){
    if (loadInProgress == false && typeof steps[index] == "function") {
        steps[index]();
        index++;
    }
    if (typeof steps[index] != "function") {
        console.log("No more steps!");
        phantom.exit();
    }
}

page.onLoadStarted = function() {
    loadInProgress = true;
    console.log('Loading started');
};
page.onLoadFinished = function() {
    loadInProgress = false;
    console.log('Loading finished');
};