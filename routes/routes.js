'use strict'
const express          = require('express'),
      router           = express.Router();
//      User             = require('../models/user'),
//      City             = require('../models/city'),
//      passportFacebook = require('../auth/facebook'),
//      request          = require('request');

router.get('/',(req,res)=>{
    res.render('homepage')
})

module.exports = router;