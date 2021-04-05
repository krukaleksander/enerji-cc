const express = require('express');
const router = express.Router();
let accounts = [];
let archiveMessages = [];
const crmAccounts = require('../models/crmAccounts');


router.all('*', (req, res, next) => {
    if (!req.session.userName) {
        return res.redirect('/crm');
    }

    next();
})

/* GET users listing. */
router.get('/', function (req, res, next) {
    // updateArchiveMsg();
    crmAccounts.find({}, (err, data) => {
        accounts = data;
        loggedUser = accounts.filter(account => account.login === req.session.userName);
        console.log(typeof (loggedUser));
        console.log(loggedUser);
        const {
            fullName,
            email,
            login,
            password,
            chatName,
            phoneNumber
        } = loggedUser[0];
        console.log(fullName);
        return res.render('crmPanel', {
            title: 'energy2000 Panel 🚬 🥃 🍸',
            data,
            fullName,
            email,
            login,
            password,
            chatName,
            phoneNumber
        });
    });


});
router.get('/get-chat-name', function (req, res, next) {
    return res.send({
        userName: req.session.userData.chatName,
        archiveMessages: archiveMessages
    });
});
router.post('/', function (req, res, next) {
    // req.session.admin = 0; - zlikwidowanie sesji [wylogowanie]
    req.session.userName = '';
    return res.redirect('/crm');
});

router.post('/chat', function (req, res, next) {
    return res.redirect('/crm');
});

// function updateArchiveMsg() {
//     messagesAll.find({}, (err, data) => {
//         archiveMessages = data[0].messages;
//         if (err) {
//             throw ('Błąd!' + err);
//         };
//     });
// }




module.exports = router;