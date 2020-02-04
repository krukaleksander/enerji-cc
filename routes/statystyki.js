var express = require('express');
var router = express.Router();
const Statsenerga = require('../models/importants');

/* GET users listing. */
router.get('/', function (req, res, next) {
    Statsenerga.find({}, (err, data) => {
        data.sort(function (a, b) {
            return a.id - b.id
        })
        res.render('stats', {
            title: 'EnerjiCC Stats',
            data,
            body: {},
            errors: {}
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