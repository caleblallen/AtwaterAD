var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var indexRouter = require('./routes/index');
var userExistsRouter = require('./routes/userExists')
var createUserRouter = require('./routes/createUser')

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/userExists', userExistsRouter);
app.use('/createUser', createUserRouter);

//app.listen(3000);

console.log('Server is Online');

module.exports = app;
