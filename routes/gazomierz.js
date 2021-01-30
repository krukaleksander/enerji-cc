const express = require('express');
const router = express.Router();
const gazPrice = require('../models/gazPrice');

router.all('*', (req, res, next) => {
    if (!req.session.admin) {
        res.redirect('/');
        return;
    }
    next();
});

router.get('/', (req, res) => {
    gazPrice.find({}, (err, data) => {
        res.render('gazomierz', {
            title: 'p5 GazoMierz',
            data
        });
    })

});

router.post('/', (req, res) => {
    req.session.admin = 0;
    res.redirect('/');
    return
});

router.post('/set-price', (req, res) => {
    // start here
    res.redirect('/gazomierz');
    return
});

module.exports = router;