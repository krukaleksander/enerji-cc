const express = require('express');
const router = express.Router();

router.all('*', (req, res, next) => {
    if (!req.session.admin) {
        res.redirect('/');
        return;
    }
    next();
});

router.get('/', (req, res) => {
    res.render('gazomierz', {
        title: 'p5 GazoMierz'
    });
});

router.post('/', (req, res) => {
    req.session.admin = 0;
    res.redirect('/');
    return
});

module.exports = router;