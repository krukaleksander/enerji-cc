var express = require('express');
var router = express.Router();
const Longinus = require('../models/longinus');
let login, password;
/* GET home page. */
router.get('/', function (req, res, next) {

  Longinus.find({}, (err, data) => {
    console.log(data[0].login)
    login = data[0].login;
    password = data[0].password;
    res.render('index', {
      title: 'EnerjiCC Panel',
    });

  });
});
// musisz podać dokładną ścieżkę ulokowania tego!
router.get('javascripts/calculator.js', function (req, res) {
  res.sendfile(__dirname + '/../public/javascripts/calculator.js');
});
router.post('/', function (req, res) {
  const body = req.body;
  if (body.login === login && body.password === password) {
    req.session.admin = 1;
    res.redirect('/panel');
  } else {
    res.redirect('/');
  }
});


module.exports = router;