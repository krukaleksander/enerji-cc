const express = require('express');
const router = express.Router();
let accounts = [];
const crmAccounts = require('../models/crmAccounts');

/* GET users listing. */
router.get('/', function (req, res, next) {
    if (req.session.userName) {
        return res.redirect('/panel');
    }
    crmAccounts.find({}, (err, data) => {
        accounts = data;
        return res.render('crmLogin', {
            title: 'energy2000 CRM 🚬 🥃 🍸'
        });
    })


});
router.post('/', function (req, res, next) {
    const login = req.body.login;
    const password = req.body.password;
    let loginFlag = true;
    accounts.forEach(account => {
        if (account.login === login && account.password === password) {
            //zmień stats na wnętrze panelu!
            req.session.userName = login;
            req.session.userData = account;
            loginFlag = true;
            return res.redirect('/panel');

        } else {
            loginFlag = false;
        }
    });
    next();

});

module.exports = router;