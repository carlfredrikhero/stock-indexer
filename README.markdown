Läsa av pris på webbplats

Logga in på webbplats, anvnamn + lösenord
Gå till en viss sida, läsa av antalet, spara i databas

http://code-epicenter.com/how-to-login-amazon-using-phantomjs-working-example/

# TODO
 - [x] Installera PhantomJS : https://github.com/Pyppe/phantomjs2.0-ubuntu14.04x64/blob/master/README.md
 - [x] Installera pm2 för att styra applicationen
 - [ ] Skapa cronjob som kör phantomjs varje timme
 - [x] skapa en webbanvändare som pm2 körs av (för att den inte ska ha tillgång till allt)

/**
 * 1. Listen to created and deleted items in Podio
 * 2. On new item, add file to data directory (item_number.txt)
 * 3. On deleted item, remove file
 * 4. On file change, propagate change up to podio
 */