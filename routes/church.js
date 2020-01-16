var express = require('express');
var router = express.Router();
const Donations = require('../models/donations');

router.all('*', (req, res, next) => {
    if (!req.session.admin) {
        res.redirect('/');
        return;
    }

    next();
})
/* GET users listing. */
router.get('/', function (req, res, next) {
    Donations.find({}, (err, data) => {
        res.render('church', {
            title: 'EnerjiCC E-Taca',
            data,
            body: {},
            errors: {}

        });

    })

});
router.get('/rmv/:id', function (req, res, next) {
    console.log(req.params.id);
    Donations.findOneAndDelete({
        _id: req.params.id
    }, function (err) {
        console.log(err);
        res.redirect('/panel/church');
    });

});
router.post('/', function (req, res, next) {
    // req.session.admin = 0; - zlikwidowanie sesji [wylogowanie]
    req.session.admin = 0;
    res.redirect('/');
    return;
});

module.exports = router;