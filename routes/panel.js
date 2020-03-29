var express = require('express');
var router = express.Router();
const Mamjuzdosc = require('../models/quizzes');
router.all('*', (req, res, next) => {
    if (!req.session.admin) {
        res.redirect('/');
        return;
    }

    next();
})
/* GET users listing. */
router.get('/', function (req, res, next) {
    Mamjuzdosc.find({}, (err, data) => {
        res.render('panel', {
            title: 'EnerjiCC Ofertomat',
            data
        });
    })


});

router.post('/', function (req, res, next) {
    // req.session.admin = 0; - zlikwidowanie sesji [wylogowanie]
    req.session.admin = 0;
    res.redirect('/');
    return;
});

router.post('/change-price/', (req, res, next) => {
    const price2022 = req.body.price2022;
    const price2021 = req.body.price2021;
    const price2020 = req.body.price2020;
    const priceArr = [price2022, price2021, price2020];
    const removeCommasFn = (expression) => {
        return expression.replace(/\,/g, '.');
    }

    for (let i = 0; i < priceArr.length; i++) {
        Mamjuzdosc.findOneAndUpdate({
            id: i
        }, {
            price: removeCommasFn(priceArr[i])
        }, function () {
            if (i === priceArr.length - 1) {
                res.redirect('/panel')
            }
        })
    }

    // res.redirect('/panel');

    // Mamjuzdosc.findOneAndUpdate({
    //     id: idNr
    // }, {
    //     price: price
    // }, function () {
    //     res.redirect('/panel');

    // });

})
module.exports = router;