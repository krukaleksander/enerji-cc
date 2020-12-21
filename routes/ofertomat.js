var express = require('express');
var router = express.Router();
const allTariffPrices = require('../models/allTariffPrices');

// api is multiplying price by 1.5% 
const priceMultiplier = 1.015;

router.all('*', (req, res, next) => {
    if (!req.session.admin) {
        res.redirect('/');
        return;
    }

    next();
})
/* GET users listing. */
router.get('/', function (req, res, next) {
    allTariffPrices.find({}, (err, data) => {
        res.render('ofertomat', {
            title: '🔥 P5 Ofertomat 🔥',
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

const higherPricer = (number) => {
    const numberToChange = number;
    return (Number(numberToChange) * priceMultiplier).toFixed(2);
}

router.post('/change-price/', (req, res, next) => {
    const requestBody = req.body;
    console.log(requestBody);
    const removeCommasFn = (expression) => {
        return expression.replace(/\,/g, '.');
    }

    allTariffPrices.findOneAndUpdate({
        id: "0"
    }, {
        "$set": {
            "tariff.price2023": higherPricer(removeCommasFn(requestBody.price2023)),
            "tariff.price2022": higherPricer(removeCommasFn(requestBody.price2022)),
            "tariff.price2021": higherPricer(removeCommasFn(requestBody.price2021))

        }
    }, function () {
        allTariffPrices.findOneAndUpdate({
            id: "1"
        }, {
            "$set": {
                "tariff.price2023.avr": higherPricer(removeCommasFn(requestBody.pricec12a2023Avr)),
                "tariff.price2023.first": higherPricer(removeCommasFn(requestBody.pricec12a2023First)),
                "tariff.price2023.second": higherPricer(removeCommasFn(requestBody.pricec12a2023Second)),
                "tariff.price2022.avr": higherPricer(removeCommasFn(requestBody.pricec12a2022Avr)),
                "tariff.price2022.first": higherPricer(removeCommasFn(requestBody.pricec12a2022First)),
                "tariff.price2022.second": higherPricer(removeCommasFn(requestBody.pricec12a2022Second)),
                "tariff.price2021.avr": higherPricer(removeCommasFn(requestBody.pricec12a2021Avr)),
                "tariff.price2021.first": higherPricer(removeCommasFn(requestBody.pricec12a2021First)),
                "tariff.price2021.second": higherPricer(removeCommasFn(requestBody.pricec12a2021Second))
            }
        }, function () {
            allTariffPrices.findOneAndUpdate({
                id: "2"
            }, {
                "$set": {
                    "tariff.price2023.avr": higherPricer(removeCommasFn(requestBody.pricec12b2023Avr)),
                    "tariff.price2023.first": higherPricer(removeCommasFn(requestBody.pricec12b2023First)),
                    "tariff.price2023.second": higherPricer(removeCommasFn(requestBody.pricec12b2023Second)),
                    "tariff.price2022.avr": higherPricer(removeCommasFn(requestBody.pricec12b2022Avr)),
                    "tariff.price2022.first": higherPricer(removeCommasFn(requestBody.pricec12b2022First)),
                    "tariff.price2022.second": higherPricer(removeCommasFn(requestBody.pricec12b2022Second)),
                    "tariff.price2021.avr": higherPricer(removeCommasFn(requestBody.pricec12b2021Avr)),
                    "tariff.price2021.first": higherPricer(removeCommasFn(requestBody.pricec12b2021First)),
                    "tariff.price2021.second": higherPricer(removeCommasFn(requestBody.pricec12b2021Second))
                }
            }, function () {

                allTariffPrices.findOneAndUpdate({
                        id: "3"
                    }, {
                        "$set": {
                            "tariff.price2023": higherPricer(removeCommasFn(requestBody.c21price2023)),
                            "tariff.price2022": higherPricer(removeCommasFn(requestBody.c21price2022)),
                            "tariff.price2021": higherPricer(removeCommasFn(requestBody.c21price2021))
                        }
                    },
                    function () {

                        allTariffPrices.findOneAndUpdate({
                            id: "4"
                        }, {
                            "$set": {
                                "tariff.price2023.avr": higherPricer(removeCommasFn(requestBody.pricec22a2023Avr)),
                                "tariff.price2023.first": higherPricer(removeCommasFn(requestBody.pricec22a2023First)),
                                "tariff.price2023.second": higherPricer(removeCommasFn(requestBody.pricec22a2023Second)),
                                "tariff.price2022.avr": higherPricer(removeCommasFn(requestBody.pricec22a2022Avr)),
                                "tariff.price2022.first": higherPricer(removeCommasFn(requestBody.pricec22a2022First)),
                                "tariff.price2022.second": higherPricer(removeCommasFn(requestBody.pricec22a2022Second)),
                                "tariff.price2021.avr": higherPricer(removeCommasFn(requestBody.pricec22a2021Avr)),
                                "tariff.price2021.first": higherPricer(removeCommasFn(requestBody.pricec22a2021First)),
                                "tariff.price2021.second": higherPricer(removeCommasFn(requestBody.pricec22a2021Second))
                            }
                        }, function () {

                            allTariffPrices.findOneAndUpdate({
                                id: "5"
                            }, {
                                "$set": {
                                    "tariff.price2023.avr": higherPricer(removeCommasFn(requestBody.pricec22b2023Avr)),
                                    "tariff.price2023.first": higherPricer(removeCommasFn(requestBody.pricec22b2023First)),
                                    "tariff.price2023.second": higherPricer(removeCommasFn(requestBody.pricec22b2023Second)),
                                    "tariff.price2022.avr": higherPricer(removeCommasFn(requestBody.pricec22b2022Avr)),
                                    "tariff.price2022.first": higherPricer(removeCommasFn(requestBody.pricec22b2022First)),
                                    "tariff.price2022.second": higherPricer(removeCommasFn(requestBody.pricec22b2022Second)),
                                    "tariff.price2021.avr": higherPricer(removeCommasFn(requestBody.pricec22b2021Avr)),
                                    "tariff.price2021.first": higherPricer(removeCommasFn(requestBody.pricec22b2021First)),
                                    "tariff.price2021.second": higherPricer(removeCommasFn(requestBody.pricec22b2021Second))
                                }
                            }, function () {

                                allTariffPrices.findOneAndUpdate({
                                    id: "6"
                                }, {
                                    "$set": {
                                        "tariff.price2023": higherPricer(removeCommasFn(requestBody.b21price2023)),
                                        "tariff.price2022": higherPricer(removeCommasFn(requestBody.b21price2022)),
                                        "tariff.price2021": higherPricer(removeCommasFn(requestBody.b21price2021))
                                    }
                                }, function () {

                                    allTariffPrices.findOneAndUpdate({
                                        id: "7"
                                    }, {
                                        "$set": {
                                            "tariff.price2023.avr": higherPricer(removeCommasFn(requestBody.priceb222023Avr)),
                                            "tariff.price2023.first": higherPricer(removeCommasFn(requestBody.priceb222023First)),
                                            "tariff.price2023.second": higherPricer(removeCommasFn(requestBody.priceb222023Second)),
                                            "tariff.price2022.avr": higherPricer(removeCommasFn(requestBody.priceb222022Avr)),
                                            "tariff.price2022.first": higherPricer(removeCommasFn(requestBody.priceb222022First)),
                                            "tariff.price2022.second": higherPricer(removeCommasFn(requestBody.priceb222022Second)),
                                            "tariff.price2021.avr": higherPricer(removeCommasFn(requestBody.priceb222021Avr)),
                                            "tariff.price2021.first": higherPricer(removeCommasFn(requestBody.priceb222021First)),
                                            "tariff.price2021.second": higherPricer(removeCommasFn(requestBody.priceb222021Second))
                                        }
                                    }, function () {


                                        allTariffPrices.findOneAndUpdate({
                                            id: "8"
                                        }, {
                                            "$set": {
                                                "tariff.price2023": higherPricer(removeCommasFn(requestBody.b11price2023)),
                                                "tariff.price2022": higherPricer(removeCommasFn(requestBody.b11price2022)),
                                                "tariff.price2021": higherPricer(removeCommasFn(requestBody.b11price2021))
                                            }
                                        }, function () {


                                            allTariffPrices.findOneAndUpdate({
                                                id: "9"
                                            }, {
                                                "$set": {
                                                    "tariff.price2023": higherPricer(removeCommasFn(requestBody.g11price2023)),
                                                    "tariff.price2022": higherPricer(removeCommasFn(requestBody.g11price2022)),
                                                    "tariff.price2021": higherPricer(removeCommasFn(requestBody.g11price2021))
                                                }
                                            }, function () {

                                                allTariffPrices.findOneAndUpdate({
                                                    id: "10"
                                                }, {
                                                    "$set": {
                                                        "tariff.price2023.avr": higherPricer(removeCommasFn(requestBody.priceg122023Avr)),
                                                        "tariff.price2023.first": higherPricer(removeCommasFn(requestBody.priceg122023First)),
                                                        "tariff.price2023.second": higherPricer(removeCommasFn(requestBody.priceg122023Second)),
                                                        "tariff.price2022.avr": higherPricer(removeCommasFn(requestBody.priceg122022Avr)),
                                                        "tariff.price2022.first": higherPricer(removeCommasFn(requestBody.priceg122022First)),
                                                        "tariff.price2022.second": higherPricer(removeCommasFn(requestBody.priceg122022Second)),
                                                        "tariff.price2021.avr": higherPricer(removeCommasFn(requestBody.priceg122021Avr)),
                                                        "tariff.price2021.first": higherPricer(removeCommasFn(requestBody.priceg122021First)),
                                                        "tariff.price2021.second": higherPricer(removeCommasFn(requestBody.priceg122021Second))
                                                    }
                                                }, function () {

                                                    allTariffPrices.findOneAndUpdate({
                                                        id: "11"
                                                    }, {
                                                        "$set": {
                                                            "tariff.price2023.avr": higherPricer(removeCommasFn(requestBody.priceg12w2023Avr)),
                                                            "tariff.price2023.first": higherPricer(removeCommasFn(requestBody.priceg12w2023First)),
                                                            "tariff.price2023.second": higherPricer(removeCommasFn(requestBody.priceg12w2023Second)),
                                                            "tariff.price2022.avr": higherPricer(removeCommasFn(requestBody.priceg12w2022Avr)),
                                                            "tariff.price2022.first": higherPricer(removeCommasFn(requestBody.priceg12w2022First)),
                                                            "tariff.price2022.second": higherPricer(removeCommasFn(requestBody.priceg12w2022Second)),
                                                            "tariff.price2021.avr": higherPricer(removeCommasFn(requestBody.priceg12w2021Avr)),
                                                            "tariff.price2021.first": higherPricer(removeCommasFn(requestBody.priceg12w2021First)),
                                                            "tariff.price2021.second": higherPricer(removeCommasFn(requestBody.priceg12w2021Second))
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

                        })

                    })

            })

        })

    });




})
router.get('/get-prices', (req, res, next) => {
    allTariffPrices.find({}, (err, data) => {
        res.send(data);
    })
})
module.exports = router;