var express = require('express');
var router = express.Router();
const Players = require('../models/players');
let position = 0;

// const gettingDay = new Date().getDay();
// const gettingHour = new Date().getHours();
// let dayToAv = 1;
// let hourToAv = 0;
// let resNum = 0;

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

        dataModDay = dataDay.sort(compareDay);
        dataModWeek = dataWeek.sort(compareWeek);
        dataModMonth = dataMonth.sort(compareMonth);

        // koniec fragment z porównaniem
        // fragment z sumą

        // SUMA DNIA
        let allScore = 0;
        data.forEach(e => {
            allScore = allScore + e.points;
        })
        // KONIEC SUMA DNIA

        //SUMA TYDZIEŃ
        let allScoreWeek = 0;
        data.forEach(e => {
            allScoreWeek = allScoreWeek + e.pointsWeek;
        })

        //koniec suma tydzień

        // suma miesiąc

        let allScoreMonth = 0;

        data.forEach(e => {
            allScoreMonth = allScoreMonth + e.pointsMonth;
        })

        // koniec suma miesiąc


        // koniec fragmentu z sumą

        //  średnia

        // const gettingHour = 12;
        // const gettingDay = 6;


        // const countAverage = (e) => {
        //     let score = 0;
        //     switch (dayToAv) {
        //         case 0:
        //             score = e / 5;
        //             break;
        //         case 1:
        //             score = e;
        //             break;
        //         case 2:
        //             score = e;
        //             break;
        //         case 3:
        //             score = e / 2;
        //             break;
        //         case 4:
        //             score = e / 3;
        //             break;
        //         case 5:
        //             core = e / 4;
        //         case 6:
        //             score = e / 5;
        //         default:
        //             break;


        //     }

        //     return score.toFixed(1);

        // }
        // const aver = (i) => (i / avrNum).toFixed(1);
        // koniec fragment średnia

        res.render('table', {
            title: 'EnerjiCC e-tablica',
            dataModDay,
            dataModWeek,
            dataModMonth,
            position,
            allScore,
            allScoreWeek,
            allScoreMonth

            // countAverage

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
router.get('/javascripts/christmas.js', function (req, res) {
    res.sendfile(__dirname + '/public/javascripts/christmas.js');
})
router.get('/javascripts/snow.js', function (req, res) {
    res.sendfile(__dirname + '/public/javascripts/snow.js');
})
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
            if (player.points > 0) {
                player.days++;
            }
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
            player.days = 0;
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