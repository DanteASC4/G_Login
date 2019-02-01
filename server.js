// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

app.set('view engine', 'ejs')
app.set('views', 'views')
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({extended : true}))

const log = console.log
const Dbhandler = require('./dbmaster')


//POST function
const warden = (req, res, next) =>{
  res.redirect('/loggedin')
}


app.get('/', function(request, response) {
  response.send(Dbhandler.showUsers())
});

app.get('/login', function(request, response) {
  response.render('login')
});

app.post('/login', function(req, res){
  //Getting data from request
  let usr = req.body.email
  let secret = req.body.psw

  //In case something goes wrong with Post req data
  log('Post data', usr, secret)

    //Calling the Dbhandler to access the database
    Dbhandler.verifyUser(usr, secret)
    .then(() => res.redirect('/loggedin')) //A successful login will redirect them to the logged in page
    .catch( error => {
      //A failed login will just bring them back to the same page, as well as log the error for us to debug
      console.error(error)
      res.redirect('/login')
    })
})

app.get('/loggedin', function(req, res){
  res.sendFile(__dirname + '/views/index.html')
})

app.get('/signup', (req, res) =>{
  res.render('signup')
})

app.post('/signup', (req, res) => {
  //Getting data from post req
  let usr = req.body.username;
  let secret = req.body.password;

  //Logging form data
  log('Form data:  ', usr, secret)

  Dbhandler.addUser(usr, secret)
  .then(() => res.send('User added')) //On success let user know they've been added
  .catch(error => {
    //If it failed redirect to same page
    console.error(error)
    res.redirect('/signup')
  })
})


app.get('/update', (req, res) => res.render('update'))

app.post('/update', (req, res) =>{
  //Geting data from post req
  let usr = req.body.username;
  let secret = req.body.newPassword;

  //logging form data
  log('Form data:  ', usr, secret)

  Dbhandler.modifyUser(usr,secret)
  .then(() => res.send('Password changed')) //On success let user know their password has been changed
  .catch(error =>{
    //If it fails redirect to same page and let us know what the error was
    console.error(err)
    res.redirect('/update')
  })
})



const pNumber = process.env.PORT || 8080

// listen for requests :)
var listener = app.listen(pNumber, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
