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
var indexRouter = require('./routes/index');
var panelRouter = require('./routes/panel');
var tableRouter = require('./routes/table');
var statystykiRouter = require('./routes/statystyki.js');
var mwhRouter = require('./routes/mwh.js');
const crmRouter = require('./routes/crm');
const crmpanelRouter = require('./routes/crmpanel');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

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
app.use('/', indexRouter);
app.use('/panel', panelRouter);
app.use('/panel/table', tableRouter);
app.use('/stats', statystykiRouter);
app.use('/mwh', mwhRouter);
app.use('/crm', crmRouter);
app.use('/crm/panel', crmpanelRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;