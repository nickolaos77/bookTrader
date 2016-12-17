'use strict'
const mongoose              = require('mongoose'),
      Schema                = mongoose.Schema,
      passportLocalMongoose = require('passport-local-mongoose');


// create account
var  User      = new Schema({
     username              : String,
     password              : String,
     city                  : String,
     country               : String,
     fullName              : String,
     books                 : [],
     usertradeReq          : [],
     tradeRequestsforUser  : []
});
//passportLocalMongoose adds to our User schema a lot of methods and functionality eg it hashes the password with the salt
User.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', User); //was 'users'
