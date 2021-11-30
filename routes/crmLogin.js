const dotenv = require('dotenv').config()
const express = require('express');
const router = express.Router();
var cors = require('cors');
const nodemailer = require("nodemailer");
let accounts = [];
const crmAccounts = require('../models/crmAccounts');
const korzystnaMsg = require('../models/korzystnamsgs');
const kociasiec = require('../models/kociasiec');

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
        const user = accounts.find(account => account.login === login);
        if (user.password === password) {
            req.session.userName = login;
            req.session.userData = user;
            res.redirect('/panel');
        }
        if (user.password !== password) res.redirect('/');

    } else {
        // jeśli nie ma takiego loginu odsyła na główną
        return res.redirect('/')
    }

    // koniec  inna logika logowania

});

router.use(cors());

router.post('/send-energy-msg', async function (req, res, next) {
    const clientName = req.body.clientName;
    const clientPhone = req.body.clientPhone;
    const clientEmail = req.body.clientEmail;
    const clientMessage = req.body.clientMessage;

    const newMessage = new korzystnaMsg({
        name: clientName,
        phone: clientPhone,
        email: clientEmail,
        msg: clientMessage
    });
    await newMessage.save()
        .then(() => res.send('wiadomość wysłana, dziękujemy :)'))
        .catch(err => res.send(err));

})
router.post('/kociasiec-msg', async function (req, res, next) {
    const clientName = req.body.clientName;
    const clientPhone = req.body.clientPhone;
    const clientMessage = req.body.clientMessage;

    const newMessage = new kociasiec({
        name: clientName,
        phone: clientPhone,
        message: clientMessage
    });

    let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
        },
    });
    let info = await transporter.sendMail({
        from: '"Kociasiec 👻" <kontakt@kociasiec.pl>', // sender address
        to: "kontakt@kociasiec.pl", // list of receivers may by many after comma
        subject: "Nowy kontakt ✔", // Subject line
        text: `Nowy kontakt od: ${clientName}, podany telefon: ${clientPhone}. Treść wiadomości: ${clientMessage}`, // plain text body
        html: `<h1>Nowy kontakt od: ${clientName}</h1><h2>podany telefon: <strong>${clientPhone}</strong></h2><p>${clientMessage}</p>`, // html body
    });

    console.log("Message sennt: %s", info.messageId);

    await newMessage.save()
        .then(() => res.send('Wiadomość wysłana'))
        .catch(err => res.send(err));

})

router.post('/or-msg', async function (req, res, next) {
    const clientName = req.body.clientName;
    const clientEmail = req.body.clientEmail;
    const clientPhone = req.body.clientPhone;
    const clientDate = req.body.clientDate;
    const clientMessage = req.body.clientMessage;

    const newMessage = new kociasiec({
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        date: clientDate,
        message: clientMessage
    });

    let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
        },
    });
    let info = await transporter.sendMail({
        from: '"Kociasiec 👻" <kontakt@kociasiec.pl>', // sender address
        to: "kontakt@kociasiec.pl", // list of receivers may by many after comma
        subject: "Prąd / Gaz Nowy kontakt 🤩", // Subject line
        text: `Nowy kontakt od: ${clientName}, klient prosi o kontakt: ${clientDate} podany telefon: ${clientPhone}, oraz email: ${clientEmail} Treść wiadomości: ${clientMessage}`, // plain text body
        html: `<h1>Nowy kontakt od: ${clientName}</h1><h2>Klient prosi o kontakt: <strong>${clientDate}</strong></h2><h2>podany telefon: <strong>${clientPhone}</strong></h2><h2>podany email: <strong>${clientEmail}</strong></h2><p>${clientMessage}</p>`, // html body
    });

    console.log("Message sennt: %s", info.messageId);

    await newMessage.save()
        .then(() => res.send('Wiadomość wysłana'))
        .catch(err => res.send(err));

})

module.exports = router;