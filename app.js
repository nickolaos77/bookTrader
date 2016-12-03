'use strict'
const express         = require('express'),
      app             = express(),
//    mongoose        = require('mongoose'),
//    passport        = require('passport'),
//    bodyParser      = require('body-parser'),
//    session         = require('express-session'),
//    MongoStore      = require('connect-mongo')(session),
//    //User            = require('./models/user'), uncomment in case of problem
      PORT            = process.env.PORT || 3000,
//    //url             = 'mongodb://localhost:27017/test2',
//    init            = require('./auth/init'),
//    url             = process.env.MONGOLAB_URI,
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
//mongoose.Promise = global.Promise;
//mongoose.connect(url);

//app.use(bodyParser.json()); // for parsing application/json
//app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
//https://expressjs.com/en/starter/static-files.html
app.use(express.static(__dirname+ '/public'));
app.use(express.static(__dirname+ '/bower_components'));
//app.use(session({
//  secret: 'The sun is cloudy',
//  resave: true,
//  saveUninitialized: true,
//  store: new MongoStore({ url: url /*process.env.MONGOLAB_URI*/ })
//}));
//app.use(passport.initialize());
//app.use(passport.session());
app.use(routes);

app.listen(PORT, function(){
    console.log('Express listening on port '+ PORT + '!');
});

