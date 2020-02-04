var express = require('express');
var router = express.Router();
const Statsenerga = require('../models/importants');

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
        res.render('stats', {
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
    // console.log(req.params.id)
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
module.exports = router;