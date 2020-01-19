var express = require('express');
var router = express.Router();
const Donations = require('../models/donations');

router.all('*', (req, res, next) => {
    if (!req.session.admin) {
        res.redirect('/');
        return;
    }

    next();
})
/* GET users listing. */
router.post('/', (req, res) => {
    const body = req.body;
    const time = ((new Date).toString()).slice(4, 25);
    body.created = time;
    body.working = "noworking";
    const donationsData = new Donations(body);
    const errors = donationsData.validateSync();
    donationsData.save((err) => {
        if (err) {
            res.redirect('/panel/church');
            return;
        }
        res.redirect('/panel/church');

    });
});

module.exports = router;