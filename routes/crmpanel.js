const express = require('express');
const router = express.Router();
let accounts = [];
const crmAccounts = require('../models/crmAccounts');

router.all('*', (req, res, next) => {
    if (!req.session.userName) {
        res.redirect('/crm');
        return;
    }

    next();
})

/* GET users listing. */
router.get('/', function (req, res, next) {
    console.log(req.session.userName);
    crmAccounts.find({}, (err, data) => {
        accounts = data;
        res.render('crmpanel', {
            title: 'ZajazdCRM Panel',

        });
    })


});

router.post('/', function (req, res, next) {
    // req.session.admin = 0; - zlikwidowanie sesji [wylogowanie]
    req.session.userName = '';
    res.redirect('/crm');
    return;
});
module.exports = router;