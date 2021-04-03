var express = require('express');
var router = express.Router();
const loginOfertomat = require('../models/loginOfertomat');
let login, password;
const energyClients = require('../models/experts');
const gaz = require('../models/gazPrice');
/* GET home page. */
router.get('/', function (req, res, next) {

  loginOfertomat.find({}, (err, data) => {
    login = data[0].login;
    password = data[0].password;
    res.render('ofertomatLogin', {
      title: '🔥 P5panel 🔥',
    });

  });
});

router.post('/', function (req, res) {
  const body = req.body;
  if (body.login === login && body.password === password) {
    req.session.admin = 1;
    res.redirect('panel');
  } else {
    res.redirect('/');
  }
});

// fragment energy2000

router.get('/energy/:id/:name/:category/:consumption/:phone/:email/:city/:street/:streetNumber/:postalCode/', function (req, res) {
  const newClient = {
    id: parseInt(req.params.id),
    name: req.params.name,
    category: req.params.category,
    consumption: req.params.consumption,
    phone: req.params.phone,
    email: req.params.email,
    city: req.params.city,
    street: req.params.street,
    streetNumber: req.params.streetNumber,
    postalCode: req.params.postalCode,
    owner: "master",
    description: "",
    tasks: []
  };

  energyClients.updateOne({
    _id: '606823a930a8db65379b35f5'
  }, {
    $push: {
      clients: newClient
    }
  }, (err) => {
    console.log('%c Im working...', ['color: red']);
    if (err) console.log(err);
    res.send('Is ok =)');
  })

});

// koniec fragment energy2000
module.exports = router;