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
    // const login = req.body.login;
    // const password = req.body.password;
    // let loginFlag = true;
    // accounts.forEach(account => {
    //     if (account.login === login && account.password === password) {
    //         //zmień stats na wnętrze panelu!
    //         req.session.userName = login;
    //         req.session.userData = account;
    //         loginFlag = true;
    //         return res.redirect('/panel');

    //     } else {
    //         loginFlag = false;
    //     }
    // });
    // brak obsługi co jeśli nie znajdzie hasła!


    // inna logika logowania
    const login = req.body.login;
    const password = req.body.password;
    const loginFlag = accounts.findIndex(account => account.login === login); // -1 lub większa

    if (loginFlag > -1) {
        // jeśli jest taki login      
        accounts.forEach(account => {
            if (account.login === login && account.password === password) {
                //zmień stats na wnętrze panelu!
                req.session.userName = login;
                req.session.userData = account;
                return res.redirect('/panel');

            }
        });


    } else {
        // jeśli nie ma takiego loginu odsyła na główną
        return res.redirect('/')
    }

    // koniec  inna logika logowania

});

module.exports = router;