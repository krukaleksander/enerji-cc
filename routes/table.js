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
        // fragment z sumą
        let allScore = 0;
        data.forEach(e => {
            allScore = allScore + e.points;
        })

        // koniec fragmentu z sumą
        // fragment reset all


        // fragment reset all
        res.render('table', {
            title: 'EnerjiCC e-tablica',
            dataMod,
            position,
            allScore
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
router.get('/javascripts/table.js', function (req, res) {
    res.sendfile(__dirname + '/public/javascripts/table.js');
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
router.get('/close-session/', function (req, res, next) {
    Players.find({}, {}, function (err, player) {
        player.forEach(player => {
            player.pointsWeek += player.points;
            player.pointsMonth += player.points;
            player.points = 0;
            player.save(function (err) {
                if (err) {
                    console.error('ERROR!');
                }
            });
        })

        res.redirect('/panel/table');
    });

});

module.exports = router;