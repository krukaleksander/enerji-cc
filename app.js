var createError = require('http-errors');
var cookieSession = require('cookie-session');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const config = require('./config');
const mongoose = require('mongoose');
mongoose.connect(config.db, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
const mwhRouter = require('./routes/mwh.js');
const crmLoginRouter = require('./routes/crmLogin');
const crmPanelRouter = require('./routes/crmPanel');
const consumptionRouter = require('./routes/consumption');
const gazomierzRouter = require('./routes/gazomierz');
const ofertomatRouter = require('./routes/ofertomat');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use('/favicon.ico', express.static('/favicon.ico'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieSession({
  name: 'session',
  keys: config.keySession,
  maxAge: config.maxAgeSession
}));
app.use('/', crmLoginRouter);
app.use('/panel', crmPanelRouter);
app.use('/mwh', mwhRouter);
app.use('/consumption', consumptionRouter);
app.use('/gazomierz', gazomierzRouter);
app.use('/panel/ofertomat', ofertomatRouter);

// catch 404 and forward to error handler
app.get('*', function (req, res) {
  res.status(404).send('/');
});
// app.use((req, res) => {
//   return res.status(404).render('404', {
//     title: 'nie odnaleziono strony'
//   });
// })

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  if (err) {
    res.status(err.status || 500);
    // return res.render('error');
    console.log('Wystąpił błąd')
    console.log(err);
    next();
  }

});

module.exports = app;