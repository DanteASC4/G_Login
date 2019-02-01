// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
app.set('view engine', 'ejs')
app.set('views', 'views')
app.use(express.json());
app.use(express.urlencoded({extended : true}))
app.use(express.static('public'));
const log = console.log


// init sqlite db
var fs = require('fs');
var dbFile = './.data/sqlite.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);

//POST function
const warden = (req, res, next) =>{
      res.redirect('/loggedin')
}


app.get('/', function(request, response) {
  db.all('SELECT * FROM users', function(err, rows){
    response.send(rows)
  })

});

app.get('/login', function(request, response) {
  response.render('login')
});

app.post('/login', function(req, res){
  let usrname = req.body.email
  let secret = req.body.psw

  log('post data', usrname, secret)

  new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ? AND password = ?;', [usrname, secret], function(err, row){
      log(row);
      if(row){
        resolve()
      }
      else{
        reject()
      }
    })

  })
    .then(() => res.redirect('/loggedin'))
    .catch( error => {
      console.error(error)
      res.redirect('/login')
    })
})

app.get('/loggedin', function(req, res){
  res.sendFile(__dirname + '/views/index.html')
})


const pNumber = process.env.PORT || 8080

// listen for requests :)
var listener = app.listen(pNumber, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
