var express = require('express');
var router = express.Router();
const Experts = require('../models/experts');

router.all('*', (req, res, next) => {
    if (!req.session.admin) {
        res.redirect('/');
        return;
    }

    next();
})
/* GET users listing. */
router.get('/', function (req, res, next) {
    Experts.find({}, (err, data) => {
        res.render('experts', {
            title: 'EnerjiCC Experts',
            data

        });
    })



});
router.post('/', function (req, res, next) {
    // req.session.admin = 0; - zlikwidowanie sesji [wylogowanie]
    req.session.admin = 0;
    res.redirect('/');
    return;
});
module.exports = router;