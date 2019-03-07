require("dotenv").load()

//Will deal with all db communication
const Dbhandler = require('./dbmaster')

//More logs less characters
const log = console.log

//Chalk for distinct console logs colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']
const chalk = require('chalk')

// init project
var express = require('express');
var app = express();

//Packages for managing and creating sessions
const uuid = require('uuid/v4')
const session = require('express-session')
const FileStore = require('session-file-store')(session)

//Passport packages
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy; //Using a local strategy because we're verifying users on our end, not through any other service

//Configuring passport local strat

passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password'
  },
  (username, password, done) => {
    const u = username;
    const p = password;
    log(chalk.red(u, p))

    Dbhandler.verifyUser(u, p)
      .then((val) =>{
        // log(chalk.magenta(val))
        if(!val){
          return done(null, false)
        }

        let user = JSON.stringify(val);
        done(null, user)
      })
      .catch(err =>{
        done(err)
      })

  }
))

//Telling passport how to serialze the user, which is basically just giving them the 'ok'

passport.serializeUser((user, done) =>{
  // log(chalk.cyan('Serializing user... \n'))
  let pUser = JSON.parse(user)
  done(null, pUser.id);
})

passport.deserializeUser((id, done) =>{
  // log(chalk.red(id))
  Dbhandler.getUser(id)
    .then(res => done(null, res))
    .catch(err => {
      //Unexpected behavior: if you change the done to just done(err) it gets weird
      done(err)
    })
})

app.set('view engine', 'ejs')
app.set('views', 'views')
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({extended : true}))

//Telling express session middleware so we can make our own sessions with our own unique session id,
app.use(session({
  genid: (req) => {
    return uuid() //Generating and returning unique string
  },
  store: new FileStore(),
  secret: process.env.SECRET, //Required, used to sign session
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());


log(process.env.SUCCESS)



// PUBLIC PERMISSION START
app.get('/', function(req, res) {
  res.render('home')

});


app.get('/login', function(req, rez) {
  if(req.isAuthenticated()) rez.redirect('/loggedin')
  else rez.render('login')
});

app.post('/login', function(req, res, next){

  passport.authenticate('local', (err, user, info) =>{
    log(chalk.cyan(user))

    if(info){
      return res.send(info.message)
    }

    if(err){
      return next(err)
    }

    if(!user){
      return  res.redirect('/login')
    }

    req.login(user, (err) =>{
      log(chalk.yellow(JSON.stringify(user.access_level)))
      if(err) {
        return next(err)
      }

      res.redirect('/loggedin')
    })
  })(req, res, next)
})

app.get('/signup', (req, res) =>{
  res.render('signup')
})

app.post('/signup', (req, res) => {
  //Getting data from post req
  let usr = req.body.username;
  let secret = req.body.password;


  Dbhandler.addUser(usr, secret)
  .then(() => res.send('User added')) //On success let user know they've been added
  .catch(error => {
    //If it failed redirect to same page
    console.error(error)
    res.redirect('/login')
  })
})

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// PUBLIC PERMISSION END

const gateKeeper = (req, rez, next) => {
  log(chalk.magenta(req.user))
  req.isAuthenticated() ? next() : rez.redirect('/login');
}



app.use(gateKeeper)

// VALID START
app.get('/loggedin', function(req, res){
  res.render('index')
})


app.get('/update', (req, res) => res.render('update'))

app.post('/update', (req, res) =>{
  //Geting data from post req
  let usr = req.body.username;
  let secret = req.body.newPassword;


  Dbhandler.modifyUser(usr,secret)
  .then(() => res.send('Password changed')) //On success let user know their password has been changed
  .catch(error =>{
    //If it fails redirect to same page and let us know what the error was
    console.error(err)
    res.redirect('/update')
  })
})

app.get('/index_denied', (req, res) => res.render('index_denied'))

//VALID END

//ADMIN START
const adminGatekeeping = (req, res, next) => {
  const aLevel = parseInt(JSON.stringify(req.user.access_level))

  if(aLevel == 1){
    next()
  } else{
    res.redirect('/index_denied')
  }
}

app.get('/admin', adminGatekeeping, (req, res)=>{


  Dbhandler.showUsers()
  .then((val) => {
    const data = JSON.stringify(val);
    res.render('admin', {
      data: data
    })
    return
  })
  .catch((err) => {
    console.error(err)
  })


})


//ADMIN END

const pNumber = process.env.PORT || 8080

//npm run ss
// listen for requests :)
var listener = app.listen(pNumber, function() {
  log(chalk.magenta('Your app is listening on port ' + listener.address().port));

});
