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
        let dataDay = data.slice(); //tworzysz kopie data, inaczej przypisujesz referencje i sie wszystko psuje
        let dataWeek = data.slice();
        let dataMonth = data.slice();
        let dataModDay, dataModWeek, dataModMonth;
        // fragment z powrównaniem
        function compareDay(a, b) {

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

        function compareWeek(a, b) {

            const numA = a.pointsWeek;
            const numB = b.pointsWeek;

            let comparison = 0;
            if (numA < numB) {
                comparison = 1;
            } else if (numA > numB) {
                comparison = -1;
            }
            return comparison;
        }

        function compareMonth(a, b) {

            const numA = a.pointsMonth;
            const numB = b.pointsMonth;

            let comparison = 0;
            if (numA < numB) {
                comparison = 1;
            } else if (numA > numB) {
                comparison = -1;
            }
            return comparison;
        }
        console.log(`Data przed funkcja: ${data}`);


        dataModDay = dataDay.sort(compareDay);
        dataModWeek = dataWeek.sort(compareWeek);
        dataModMonth = dataMonth.sort(compareMonth);
        // console.log(`Data po funkcji: ${data}`);

        // console.log(dataModDay);


        // koniec fragment z porównaniem
        // fragment z sumą
        let allScore = 0;
        data.forEach(e => {
            allScore = allScore + e.points;
        })

        // koniec fragmentu z sumą

        res.render('table', {
            title: 'EnerjiCC e-tablica',
            dataModDay,
            dataModWeek,
            dataModMonth,
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
// zamknięcie sesji tablicy dobowej
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
// zamknięcie sesji tablicy tygodiowej
router.get('/close-session-week/', function (req, res, next) {
    Players.find({}, {}, function (err, player) {
        player.forEach(player => {
            player.pointsWeek = 0;
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