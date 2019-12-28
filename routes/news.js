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
router.get('/', function (req, res, next) {
    News.find({}, (err, data) => {
        res.render('news', {
            title: 'EnerjiCC Aktualności',
            data,
            body: {},
            errors: {}

        });

    })

});
router.get('/rmv/:id', function (req, res, next) {
    console.log(req.params.id);
    News.findOneAndDelete({
        _id: req.params.id
    }, function (err) {
        console.log(err);
        res.redirect('/panel/news');
    });

});
router.post('/', function (req, res, next) {
    // req.session.admin = 0; - zlikwidowanie sesji [wylogowanie]
    req.session.admin = 0;
    res.redirect('/');
    return;
});

module.exports = router;