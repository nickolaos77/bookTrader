var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var init = require('./init');

passport.use(new localStrategy(User.authenticate()))

init();

module.exports = passport;