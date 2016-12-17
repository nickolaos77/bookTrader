'use strict'
const mongoose              = require('mongoose'),
      Schema                = mongoose.Schema;


// create account
var  Book      = new Schema({
     title        : String,
     image        : String,
     link         : String,
     availability : {type: String, default : 'available'}
});

module.exports = mongoose.model('Book', Book); //was 'users'
