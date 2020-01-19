var express = require('express');
var router = express.Router();
const News = require('../models/news')

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
    let time = new Date();
    time.setHours(time.getHours() + 1);
    let timemod = ((time).toString()).slice(4, 25);
    body.time = timemod;
    const newsData = new News(body);
    const errors = newsData.validateSync();
    newsData.save((err) => {
        if (err) {
            res.redirect('/panel/news');
            return;
        }
        res.redirect('/panel/news');

    });
});

module.exports = router;