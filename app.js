'use strict'
const express         = require('express'),
      app             = express(),
      mongoose        = require('mongoose'),
      MongoClient     = require('mongodb').MongoClient,
      passport        = require('passport'),
      bodyParser      = require('body-parser'),
      session         = require('express-session'),
      MongoStore      = require('connect-mongo')(session),
      PORT            = process.env.PORT || 3000,
//      url             = 'mongodb://localhost:27017/bookclub',
      init            = require('./auth/init'),
      url             = process.env.MONGOLAB_URI,
      routes          = require('./routes/routes.js');
 
const handlebars      = require('express-handlebars').create({
        defaultLayout: 'main',
        helpers:{
            section:function(name,options){
                if(!this._sections) this._sections ={};
                this._sections[name] = options.fn(this);
                return null;
            }
        }
    });
//http://stackoverflow.com/questions/38138445/node3341-deprecationwarning-mongoose-mpromise
mongoose.Promise = global.Promise;
mongoose.connect(url);

MongoClient.connect(url, (err, database) => {
  if (err) return console.log(err)
  var db = database;
  app.listen(PORT, () => {
    console.log('Express listening on port '+ PORT + '!');
  })
  module.exports.db = db;
})



app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
//https://expressjs.com/en/starter/static-files.html
//To use multiple static assets directories, call the express.static middleware function multiple times:
app.use(express.static(__dirname+ '/public'));
app.use(express.static(__dirname+ '/bower_components'));
//Express looks up the files in the order in which you set the static directories with the express.static middleware function.

app.use(session({
  secret: process.env.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ url: url /*process.env.MONGOLAB_URI*/ })
}));
app.use(passport.initialize());
app.use(passport.session());
init()
/*Instead of calling my own methods to serialize and desiarilize the user 
which are included insided the init() I could use the methods provided by 
the module passport-local-mongoose then to serialize (encode) and deserialize the User
I would simply write the two lines that follow, also see this http://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize*/
//passport.serializeUser(User.serializeUser())
//passport.deserializeUser(User.deserializeUser)
init()
app.use(routes)
