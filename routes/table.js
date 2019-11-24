var express = require('express');
var router = express.Router();
const Players = require('../models/players');

router.all('*', (req, res, next) => {
    if (!req.session.admin) {
        res.redirect('/');
        return;
    }

    next();
})
/* GET users listing. */
router.get('/', function (req, res, next) {
    Players.find({}, (err, data) => {
        res.render('table', {
            title: 'EnerjiCC e-tablica',
            data
        });

    });


});

router.post('/', function (req, res, next) {
    // req.session.admin = 0; - zlikwidowanie sesji [wylogowanie]
    req.session.admin = 0;
    res.redirect('/');
    return;
});
module.exports = router;