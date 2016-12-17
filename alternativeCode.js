mongo.connect( url, function( err, db ) {
  if ( err ) {
    console.log( 'Error: Could not connect to DB' );
  } else {
    console.log( 'Success: Connected to DB' );
    // Database Magic happens here...
    app.use( function( req, res, next) {
      req.db = db;
      next();
    });
	// this requires the routes
    app.use( require( './routes' ));
  }
  // the usual stuff to fire your server up
  app.set( 'port', ( process.env.PORT || 5000 ));
  app.set('views', path.join(__dirname, '/views'));
  app.set('view engine', 'ejs');
  app.listen( app.get( 'port' ), function() {
    console.log( 'Node app is running on port ', app.get( 'port' ) );
  });
});