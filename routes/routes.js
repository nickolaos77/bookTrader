'use strict'
const express          = require('express'),
      router           = express.Router(),
      User             = require('../models/user'),
      Book             = require('../models/book'),
      MongoClient      = require('mongodb').MongoClient,
      ObjectId         = require('mongodb').ObjectId,
      myApp            = require('../app.js'),
      mongoose         = require('mongoose'),
      books            = require('google-books-search'),
      gBooksApiKey     = process.env.gBooksApiKey,
      passportLocal    = require('../auth/local');
//      request          = require('request');
//http://stackoverflow.com/questions/18875292/passing-variables-to-the-next-middleware-using-next-in-expressjs
const middleware = {
    isLoggedIn: (req,res,next) => {
        if (req.isAuthenticated()){
            res.locals.logoutMenu = true; //with the res.locals I pass a variable to the next middleware
            return next()
        }
        else { return next() }
    },
    isLoggedInGen : (req,res,next) => {
        if (req.isAuthenticated()){
            res.locals.logoutMenu = true; //with the res.locals I pass a variable to the next middleware
            return next()
        }
        else { res.redirect('/') }
    }
    
}


router.get('/',middleware.isLoggedIn,(req,res)=>{
    res.render('homepage',{logoutMenu:res.locals.logoutMenu}) 
})

router.get('/register',(req,res)=>{
    res.render('register')
})

router.post('/register',(req,res)=>{ //the password will be hashed by the User.register method
    User.register(new User({username: req.body.username}), req.body.password, (err, user)=>{
        if(err) {
            console.log(err)
            res.render('register')    
        }
        else if (!err){
            passportLocal.authenticate('local')(req,res, function(){
                res.render('homepage', {logoutMenu:true})
            })
        }      
    }) 
})

router.get('/login',(req,res)=>{
    res.render('login')
})

router.post('/login',passportLocal.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}), (req,res)=>{
    res.render('login')
})

router.get('/logout',(req,res)=>{
    req.logout() //this destroys all the user data that were in the session
    res.redirect('/')
})

router.get('/settings', middleware.isLoggedInGen, (req,res)=>{
    res.render('settings')   
})

//The problem is that you cant push new fields into mongoose models. All fields have to be defined beforehand.
/*According to the 2.0 node.js native driver documentation, the option that controls whether findOneAndUpdate returns the original or new document is called returnOriginal, not new.
But it would probably be better to do this directly in Mongoose by using Model.findOneAndUpdate where the option is named new:
The docs you link to are for findAndModify in the MongoDB shell, where the option is also named new. Very confusing.*/

router.post('/updateProfile',middleware.isLoggedInGen, (req,res)=>{
    myApp.db.collection('users').findOneAndUpdate({_id:req.user._id},{$set:{city:req.body.city, country:req.body.country}}, {returnOriginal : false}, function(err, user){
        if (err) console.log(err)
        res.send(user)
        })
})
//hashing the same word creates a different hash
router.post('/changePassword',middleware.isLoggedInGen,(req,res)=>{
   User.findOne({_id:req.user._id}, (err,user)=>{
       if (err) console.log(err)
       else {
           user.setPassword(req.body.newPassword, function(err){
               if (err) console.log(err)
               user.save()
               res.redirect('/')    
           })
       }
   }) 
})

router.get('/allBooks',middleware.isLoggedInGen, (req,res)=>{
    myApp.db.collection('books').find({},{"image":1, "availability":1}).toArray( (err,docs) => {
        //console.log(docs)
        res.render('allBooks',{userBooks:docs})
    } )
})


router.get('/mybooks',middleware.isLoggedInGen,(req,res)=>{
    myApp.db.collection('users').findOne({_id:req.user._id},(err,user)=>{
        if (err) console.log(err)
        else{
            if (!user.books){ res.render('mybooks') }
            else {  
            var bookIds = user.books    
            var userBooks = []
            var promises = [] 
            bookIds.forEach(elem =>{
                promises.push ( new Promise( (resolve, reject) => {
                    myApp.db.collection('books').findOne({_id:elem.bookId}, (err,book)=>{
                        if (err) console.log(err)
                        else userBooks.push(book)
                        resolve()
                        } )
                    })
                               )
                })
            if (!user.usertradeReq) {
                Promise.all(promises).then(function() { res.render('mybooks',{userBooks}) }).catch(console.error)
            }
            else {
            var booksRequestedByUser = []    
            user.usertradeReq.forEach(elem =>{
                promises.push ( new Promise( (resolve, reject) => {
                    myApp.db.collection('books').findOne({_id:elem.bookId}, (err,book)=>{
                        if (err) console.log(err)
                        else booksRequestedByUser.push(book)
                        resolve()
                        } )
                    })
                               )
                })
                  if (!user.tradeRequestsforUser){
                        Promise.all(promises).then(function() { res.render('mybooks',{userBooks, booksRequestedByUser}) }).catch(console.error) }
                   else {
                       console.log('I am here')
                       var booksRequestedFromUser = []
                       user.tradeRequestsforUser.forEach(elem=>{
                           promises.push(new Promise((resolve,reject)=>{
                               myApp.db.collection('books').findOne({_id:elem.bookId}, (err,book)=>{
                                   if (err) console.log(err)
                                   else booksRequestedFromUser.push(book)
                                   resolve()
                               })
                           })
                                         )
                       })
                       Promise.all(promises).then(function() { 
                           console.log(booksRequestedByUser)
                           res.render('mybooks',{userBooks, booksRequestedByUser, booksRequestedFromUser}) }).catch(console.error)     
                       }
                       
                   }
            
            }
        }
})
    })
//to refactor with promises
router.post('/mybooks',middleware.isLoggedInGen,(req,res)=>{
    let options = {key:gBooksApiKey, type:'books', offset:0, limit:1}
    books.search(req.body.book,options,(err,book)=>{
        if (err) console.log(err)
        else{ //ok
            myApp.db.collection('books').insert({title : book[0].title , image : book[0].thumbnail, availability : 'available'},   (err, bookdoc)=>{
                if (err) console.log(err)
                else {
                    myApp.db.collection('books').updateOne({_id:bookdoc.insertedIds[0]}, {$set:{link: 'delete/' + bookdoc.insertedIds[0]  }}, (err,r)=>{if (err) console.log(err)
                    
                    //findOneAndUpdate Find a document and update it in one atomic operation, requires a write lock for the duration of the operation.
                    //http://stackoverflow.com/questions/10551499/simplest-way-to-wait-some-asynchronous-tasks-complete-in-javascript
                    myApp.db.collection('users').findOneAndUpdate({_id:req.user._id}, {$push:{books:{bookId : bookdoc.insertedIds[0]}}}, {returnOriginal : false}, (err,userdoc)=>{
                        if (err) console.log(err)
                        else { //res.send(userdoc.value.books)
                            //return the images of all the books of this user
                            let bookIds = userdoc.value.books
                            let userBooks = []
                            let promises = [] 
                             bookIds.forEach((elem)=>{
                                promises.push ( new Promise( (resolve, reject) => {
                                    myApp.db.collection('books').findOne({_id:elem.bookId}, (err,book)=>{
                                        if (err) console.log(err)
                                        else userBooks.push(book)
                                        resolve()
                                    } )
                                })
                                )
                            })
                            Promise.all(promises).then(function() { 
                                res.redirect('/mybooks')
                            }).catch(console.error)
                        }
                    })
                })
                }
            })
        }
    })
})
//http://stackoverflow.com/questions/8233014/how-do-i-search-for-an-object-by-its-objectid-in-the-console
//although the query findOne(_id:elem.bookId) worked above, it did not here
router.get('/delete/:id',middleware.isLoggedInGen, (req,res) => {
    let obj_id = new ObjectId(req.params.id)    
    myApp.db.collection('books').deleteOne({_id:obj_id},(err, r)=> {
        myApp.db.collection('users').updateOne({_id:req.user._id},{$pull : { 'books' : {bookId : obj_id } }}, (err, userDoc)=>{
            res.redirect('/mybooks')
        }) 
    })
    }          
)
//{$push: {"usertradeReq" : { bookId : ObjectId(req.params.id)  } }}

router.get('/request/:id',middleware.isLoggedInGen, (req,res)=>{
    myApp.db.collection('users').updateOne({"books.bookId": ObjectId(req.params.id) } ,{$push : { "tradeRequestsforUser" : {bookId : ObjectId(req.params.id) }}}).then(function( ){
        myApp.db.collection('users').updateOne({_id:req.user._id},{$push : { "usertradeReq" : {bookId : ObjectId(req.params.id) } }})
    }).then(function(){
        myApp.db.collection('books').updateOne({_id:ObjectId(req.params.id)}, {$set : {"availability": "unavailable" }})
        }).then(function(){
        res.redirect('/allBooks')
    }).catch(console.error)
})

router.get('/accept/:id',middleware.isLoggedInGen, (req,res)=>{
    //the first function removes the book from the user who owns the book and the second removes the book from the user requesting it
    myApp.db.collection('users').updateOne({"books.bookId": ObjectId(req.params.id) }, {$pull:{ "tradeRequestsforUser":{bookId : ObjectId(req.params.id)} }}, (err,r)=>{
        myApp.db.collection('users').updateOne({"usertradeReq.bookId": ObjectId(req.params.id) }, {$pull:{"usertradeReq":{bookId :ObjectId(req.params.id) }}}, (err, r)=>{
            if (err) console.log(err)
            res.redirect('/mybooks')
        })
    })
}
)

router.get('/reject/:id',middleware.isLoggedInGen, (req,res)=>{
    //the first function removes the book from the user who owns the book and the second removes the book from the user requesting it
    myApp.db.collection('users').updateOne({"books.bookId": ObjectId(req.params.id) }, {$pull:{ "tradeRequestsforUser":{bookId : ObjectId(req.params.id)} }}, (err,r)=>{
        myApp.db.collection('users').updateOne({"usertradeReq.bookId": ObjectId(req.params.id) }, {$pull:{"usertradeReq":{bookId :ObjectId(req.params.id) }}}, (err, r)=>{
            if (err) console.log(err)
            res.redirect('/mybooks')
        })
    })
}
)


module.exports = router;