var express = require('express');
var router = express.Router();
const login = 'eternit';
const password = 'rachunek50zl';

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'EnerjiCC Panel'
  });
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