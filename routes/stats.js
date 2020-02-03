var express = require('express');
var router = express.Router();
const Statystyki = require('../models/statystyki');

/* GET users listing. */
router.get('/', function (req, res, next) {
    Statystyki.find({}, (err, data) => {
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