var express = require('express');
var router = express.Router();
const Importantlinks = require('../models/importantlinks');

router.all('*', (req, res, next) => {
    if (!req.session.admin) {
        res.redirect('/');
        return;
    }

    next();
})
/* GET users listing. */
router.get('/', function (req, res, next) {

    Importantlinks.find({}, (err, data) => {
        console.log(data);
        res.render('necessary', {
            title: 'Enerji CC - Przydatne',
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