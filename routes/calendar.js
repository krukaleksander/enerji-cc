var express = require('express');
var router = express.Router();
const ExpertsCalendar = require('../models/experts');

router.all('*', (req, res, next) => {
    if (!req.session.admin) {
        res.redirect('/');
        return;
    }

    next();
})
/* GET users listing. */
router.get('/', function (req, res, next) {
    let thisMonthNr = new Date().getMonth();
    let today = new Date().getDay();
    let thisMonth = new Date(2019, thisMonthNr, 0).getDate();
    let daysArr = [];
    console.log(today);
    res.render('calendar', {
        title: 'EnerjiCC Kalendarz',
        thisMonth
    })

});

router.get('/eksperci', function (req, res, next) {
    ExpertsCalendar.find({}, (err, data) => {
        res.send(data);

    });
})

router.post('/', function (req, res, next) {
    // req.session.admin = 0; - zlikwidowanie sesji [wylogowanie]
    req.session.admin = 0;
    res.redirect('/');
    return;
});
module.exports = router;