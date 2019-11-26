var express = require('express');
var router = express.Router();
const Players = require('../models/players');
let position = 0;
router.all('*', (req, res, next) => {
    if (!req.session.admin) {
        res.redirect('/');
        return;
    }

    next();
})
/* GET users listing. */
router.get('/', function (req, res, next) {
    Players.find({}, (err, data) => {
        let dataMod;
        // fragment z powrównaniem
        function compare(a, b) {

            const numA = a.points;
            const numB = b.points;

            let comparison = 0;
            if (numA < numB) {
                comparison = 1;
            } else if (numA > numB) {
                comparison = -1;
            }
            return comparison;
        }

        dataMod = data.sort(compare);

        // koniec fragment z porównaniem

        res.render('table', {
            title: 'EnerjiCC e-tablica',
            dataMod,
            position
        });

    });


});

router.post('/', function (req, res, next) {
    // req.session.admin = 0; - zlikwidowanie sesji [wylogowanie]
    req.session.admin = 0;
    res.redirect('/');
    return;
});

router.get('/add/:id/:score', function (req, res, next) {
    // console.log(req.params.id)
    const idNr = parseInt(req.params.id)
    const score = parseInt(req.params.score);
    Players.findOneAndUpdate({
        id: idNr
    }, {
        points: score + 1
    }, function (err, player) {
        res.redirect('/panel/table');
    });

});

router.get('/minus/:id/:score', function (req, res, next) {
    // console.log(req.params.id)
    const idNr = parseInt(req.params.id)
    const score = parseInt(req.params.score);
    Players.findOneAndUpdate({
        id: idNr
    }, {
        points: score - 1
    }, function (err, player) {
        res.redirect('/panel/table');
    });


});


module.exports = router;