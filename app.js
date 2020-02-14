if (typeof process.env.NODE_ENV === 'undefined') {
    console.log("NODE_ENV is not set. Defaulting to production...");
    process.env.NODE_ENV = 'production';
}

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const config = require('config');

// var aesdLogger = require('./bin/aesdLogger');


var indexRouter = require( './routes/index' );
var userExistsRouter = require( './routes/userExists' );
var createUserRouter = require( './routes/createUser' );
var scratchTestRoute = require( './routes/scratchTest' );


var app = express();

// Mapping the EJS template engine to ".html" files
app.engine( 'html', require( 'ejs' ).renderFile );

app.use( express.json() );
app.use( express.urlencoded( { extended: false } ) );
app.use( cookieParser() );
app.use( express.static( path.join( __dirname, 'public' ) ) );
/*app.use(expressWinston.logger({
    transport: [ winston.transports.MongoDB]
}));*/
// app.use(new aesdLogger().getLogger());

app.use( '/', indexRouter );
app.use( '/scratchTest', scratchTestRoute );
app.use( '/userExists', userExistsRouter );
app.use('/createUser', createUserRouter);

//app.listen(3000);

module.exports = app;
