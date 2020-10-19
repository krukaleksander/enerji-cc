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
var ofertomatLoginRouter = require('./routes/ofertomatLogin');
var panelRouter = require('./routes/ofertomat');
var tableRouter = require('./routes/eTable');
var statystykiRouter = require('./routes/statistics.js');
var mwhRouter = require('./routes/mwh.js');
const crmLoginRouter = require('./routes/crmLogin');
const crmPanelRouter = require('./routes/crmPanel');



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
app.use('/', ofertomatLoginRouter);
app.use('/panel', panelRouter);
app.use('/panel/table', tableRouter);
app.use('/stats', statystykiRouter);
app.use('/mwh', mwhRouter);
app.use('/crm', crmLoginRouter);
app.use('/crm/panel', crmPanelRouter);

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