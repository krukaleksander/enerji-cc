const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {

    res.render('crm', {
        title: 'ZajazdCRM'
    });

});
router.post('/', function (req, res, next) {
    // req.session.admin = 0; - zlikwidowanie sesji [wylogowanie]
    req.session.admin = 0;
    res.redirect('/');
    return;
});
module.exports = router;