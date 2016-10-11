Läsa av pris på webbplats

Logga in på webbplats, anvnamn + lösenord
Gå till en viss sida, läsa av antalet, spara i databas

http://code-epicenter.com/how-to-login-amazon-using-phantomjs-working-example/

# TODO
 - [x] Installera PhantomJS : https://github.com/Pyppe/phantomjs2.0-ubuntu14.04x64/blob/master/README.md
 - [x] Installera pm2 för att styra applicationen
 - [x] Skapa cronjob som kör phantomjs varje timme
 - [x] skapa en webbanvändare som pm2 körs av (för att den inte ska ha tillgång till allt)
 - [ ] Bryta ut filhanteringen i ett "store" objekt, store objektet tar hand om att skriva och läsa till
 filsystemet, på så sätt kan man enkelt testa Product utan filssystem + möjlighet att flytta till en DB-lösning senare
 - [x] Lägg till promise support till crawler.js https://github.com/stefanpenner/es6-promise
     require('es6-promise').polyfill();
 - [x] Ändra product.write att ta hänsyn till phantomJS fs.write istället för writeFileSync
 - [ ] i crawler.js måste Podio laddas in i Product

/**
 * 1. Listen to created and deleted items in Podio
 * 2. On new item, add file to data directory (item_number.txt)
 * 3. On deleted item, remove file
 * 4. every hour, run wget on a url to the app to trigger updates into Podio
 */

# HOW TO

Start phantomjs
Start node with pm2
npm start

Node versioner installerade med hjälpa av nvm

https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-an-ubuntu-14-04-server
https://github.com/creationix/nvm

INSTALLERA PM2 GLOBALT IGEN

$ nvm use system
     $ npm uninstall -g a_module

## NGROK
```ngrok http 3000```



