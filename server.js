// server.js
// where your node app starts

// init project
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())


// init sqlite db
var fs = require('fs');
var dbFile = './.data/sqlite.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);


app.get('/', function(request, response) {
  db.all('SELECT * FROM users', function(err, rows){
    response.send(rows)
  })

});

app.get('/login', function(request, response) {
  response.sendFile(__dirname + '/views/login.html');

});

app.post('/loggingin', function(req, res){
  let usrname = req.body.uname
  let secret = req.body.pw


  db.all('SELECT * FROM users', function(err, rows){
    console.log(rows[0])

    rows.map(f => {
      if(f.username === usrname && f.password === secret){
        console.log('Success')
        return res.redirect('/login') //This should redirect to a page saying that you're logged in, but it refuses to redirect and seems to be sending raw html?

      }
      else {
        //DO something here
      }
    })


  })
})
app.get('/loggedin', function(req, res){
  res.sendFile(__dirname + '/views/index.html')
})


app.use(express.static('public'));

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
