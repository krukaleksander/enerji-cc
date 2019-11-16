var express = require('express');
var router = express.Router();

router.all('*', (req, res, next) => {
    if (!req.session.admin) {
        res.redirect('/');
        return;
    }

    next();
})
/* GET users listing. */
router.get('/', function (req, res, next) {

    // req.session.admin = 0; - zlikwidowanie sesji
    res.render('panel', {
        title: 'EnerjiCC Panel',

    });
});

router.post('/', function (req, res, next) {
    req.session.admin = 0;
    res.redirect('/');
    return;
});
module.exports = router;