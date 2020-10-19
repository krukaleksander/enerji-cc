var express = require('express');
var router = express.Router();
const Statsenerga = require('../models/stats');

/* GET users listing. */
router.get('/', function (req, res, next) {
    Statsenerga.find({}, (err, data) => {
        data.sort(function (a, b) {
            return a.id - b.id
        })
        let allRecords = 0;
        let notAnsweredCalls = 0;
        let positiveEnd = 0;
        data.forEach(record => {
            allRecords += record.ammount;
            if (record.id === 0 || record.id === 3) {
                notAnsweredCalls += record.ammount
            } else if (record.id === 5 || record.id === 6) {
                positiveEnd += record.ammount
            }

        })
        res.render('statistics', {
            title: 'EnerjiCC Stats',
            data,
            allRecords,
            notAnsweredCalls,
            positiveEnd
        });
    })
});
router.get('/add/:id/:score', function (req, res, next) {
    const idNr = parseInt(req.params.id)
    const score = parseInt(req.params.score);
    Statsenerga.findOneAndUpdate({
        id: idNr
    }, {
        ammount: score + 1
    }, function () {
        res.redirect('/stats');

    });

});
router.get('/minus/:id/:score', function (req, res, next) {
    const idNr = parseInt(req.params.id)
    const score = parseInt(req.params.score);
    Statsenerga.findOneAndUpdate({
        id: idNr
    }, {
        ammount: score - 1
    }, function () {
        res.redirect('/stats');
    });


});

router.get('/zero-stats/', function (req, res, next) {
    Statsenerga.find({}, {}, function (err, stats) {
        const whenCreated = new Date();
        stats.forEach(stats => {

            const archiveToPush = {
                created: whenCreated,
                ammount: stats.ammount
            }
            stats.archive.push(archiveToPush);
            stats.ammount = 0;
            stats.save(function (err) {
                if (err) {
                    console.error('ERROR!');
                }
            });

        })

        res.redirect('/stats');
    });

});

router.get('/fix/', function (req, res, next) {
    Statsenerga.find({}, {}, function (err, stats) {
        stats.forEach(stats => {
            const length = stats.archive.length - 1;
            const number = stats.archive[length].ammount
            stats.ammount = number;
            stats.save(function (err) {
                if (err) {
                    console.error('ERROR!');
                }
            });
        })

        res.redirect('/stats');
    });

});

router.get('/show/', function (req, res, next) {
    const allData = Statsenerga
        .find()
        .sort({
            id: 1
        })

    allData.exec((err, data) => {
        res.json(data)
    });

});

router.get('/addone/:id/:score', function (req, res, next) {
    const idNr = parseInt(req.params.id)
    const score = parseInt(req.params.score);
    const allData = Statsenerga
        .findOneAndUpdate({
            id: idNr
        }, {
            ammount: score + 1
        })
    allData.exec((err, data) => {
        res.json(data)
        // console.log(data)
    });
});
router.get('/removeone/:id/:score', function (req, res, next) {
    const idNr = parseInt(req.params.id)
    const score = parseInt(req.params.score);
    const allData = Statsenerga
        .findOneAndUpdate({
            id: idNr
        }, {
            ammount: score - 1
        })
    allData.exec((err, data) => {
        res.json(data)
        // console.log(data)
    });
});
module.exports = router;