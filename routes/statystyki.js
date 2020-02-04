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
        console.log(data);
    })
});

module.exports = router;