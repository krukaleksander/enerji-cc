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
    const requestBody = req.body;
    const removeCommasFn = (expression) => {
        return expression.replace(/\,/g, '.');
    }

    Mamjuzdosc.findOneAndUpdate({
        id: "0"
    }, {
        "$set": {
            "tariff.price2022": removeCommasFn(requestBody.price2022),
            "tariff.price2021": removeCommasFn(requestBody.price2021),
            "tariff.price2020": removeCommasFn(requestBody.price2020)

        }
    }, function () {
        Mamjuzdosc.findOneAndUpdate({
            id: "1"
        }, {
            "$set": {
                "tariff.price2022.avr": removeCommasFn(requestBody.pricec12a2022Avr),
                "tariff.price2022.first": removeCommasFn(requestBody.pricec12a2022First),
                "tariff.price2022.second": removeCommasFn(requestBody.pricec12a2022Second),
                "tariff.price2021.avr": removeCommasFn(requestBody.pricec12a2021Avr),
                "tariff.price2021.first": removeCommasFn(requestBody.pricec12a2021First),
                "tariff.price2021.second": removeCommasFn(requestBody.pricec12a2021Second),
                "tariff.price2020.avr": removeCommasFn(requestBody.pricec12a2020Avr),
                "tariff.price2020.first": removeCommasFn(requestBody.pricec12a2020First),
                "tariff.price2020.second": removeCommasFn(requestBody.pricec12a2020Second),

            }
        }, function () {
            Mamjuzdosc.findOneAndUpdate({
                id: "2"
            }, {
                "$set": {
                    "tariff.price2022.avr": removeCommasFn(requestBody.pricec12b2022Avr),
                    "tariff.price2022.first": removeCommasFn(requestBody.pricec12b2022First),
                    "tariff.price2022.second": removeCommasFn(requestBody.pricec12b2022Second),
                    "tariff.price2021.avr": removeCommasFn(requestBody.pricec12b2021Avr),
                    "tariff.price2021.first": removeCommasFn(requestBody.pricec12b2021First),
                    "tariff.price2021.second": removeCommasFn(requestBody.pricec12b2021Second),
                    "tariff.price2020.avr": removeCommasFn(requestBody.pricec12b2020Avr),
                    "tariff.price2020.first": removeCommasFn(requestBody.pricec12b2020First),
                    "tariff.price2020.second": removeCommasFn(requestBody.pricec12b2020Second),

                }
            }, function () {

                Mamjuzdosc.findOneAndUpdate({
                    id: "3"
                }, {
                    "$set": {
                        "tariff.price2022": removeCommasFn(requestBody.c21price2022),
                        "tariff.price2021": removeCommasFn(requestBody.c21price2021),
                        "tariff.price2020": removeCommasFn(requestBody.c21price2020)

                    }
                }, function () {

                    Mamjuzdosc.findOneAndUpdate({
                        id: "4"
                    }, {
                        "$set": {
                            "tariff.price2022.avr": removeCommasFn(requestBody.pricec22a2022Avr),
                            "tariff.price2022.first": removeCommasFn(requestBody.pricec22a2022First),
                            "tariff.price2022.second": removeCommasFn(requestBody.pricec22a2022Second),
                            "tariff.price2021.avr": removeCommasFn(requestBody.pricec22a2021Avr),
                            "tariff.price2021.first": removeCommasFn(requestBody.pricec22a2021First),
                            "tariff.price2021.second": removeCommasFn(requestBody.pricec22a2021Second),
                            "tariff.price2020.avr": removeCommasFn(requestBody.pricec22a2020Avr),
                            "tariff.price2020.first": removeCommasFn(requestBody.pricec22a2020First),
                            "tariff.price2020.second": removeCommasFn(requestBody.pricec22a2020Second),

                        }
                    }, function () {

                        Mamjuzdosc.findOneAndUpdate({
                            id: "5"
                        }, {
                            "$set": {
                                "tariff.price2022.avr": removeCommasFn(requestBody.pricec22b2022Avr),
                                "tariff.price2022.first": removeCommasFn(requestBody.pricec22b2022First),
                                "tariff.price2022.second": removeCommasFn(requestBody.pricec22b2022Second),
                                "tariff.price2021.avr": removeCommasFn(requestBody.pricec22b2021Avr),
                                "tariff.price2021.first": removeCommasFn(requestBody.pricec22b2021First),
                                "tariff.price2021.second": removeCommasFn(requestBody.pricec22b2021Second),
                                "tariff.price2020.avr": removeCommasFn(requestBody.pricec22b2020Avr),
                                "tariff.price2020.first": removeCommasFn(requestBody.pricec22b2020First),
                                "tariff.price2020.second": removeCommasFn(requestBody.pricec22b2020Second),

                            }
                        }, function () {

                            Mamjuzdosc.findOneAndUpdate({
                                id: "6"
                            }, {
                                "$set": {
                                    "tariff.price2022": removeCommasFn(requestBody.b21price2022),
                                    "tariff.price2021": removeCommasFn(requestBody.b21price2021),
                                    "tariff.price2020": removeCommasFn(requestBody.b21price2020)

                                }
                            }, function () {

                                Mamjuzdosc.findOneAndUpdate({
                                    id: "7"
                                }, {
                                    "$set": {
                                        "tariff.price2022.avr": removeCommasFn(requestBody.priceb222022Avr),
                                        "tariff.price2022.first": removeCommasFn(requestBody.priceb222022First),
                                        "tariff.price2022.second": removeCommasFn(requestBody.priceb222022Second),
                                        "tariff.price2021.avr": removeCommasFn(requestBody.priceb222021Avr),
                                        "tariff.price2021.first": removeCommasFn(requestBody.priceb222021First),
                                        "tariff.price2021.second": removeCommasFn(requestBody.priceb222021Second),
                                        "tariff.price2020.avr": removeCommasFn(requestBody.priceb222020Avr),
                                        "tariff.price2020.first": removeCommasFn(requestBody.priceb222020First),
                                        "tariff.price2020.second": removeCommasFn(requestBody.priceb222020Second),

                                    }
                                }, function () {

                                    res.redirect('/panel')

                                })

                            })

                        })

                    })

                })

            })

        })

    });




})
router.get('/get-prices', (req, res, next) => {
    Mamjuzdosc.find({}, (err, data) => {
        res.send(data);
    })
})
module.exports = router;