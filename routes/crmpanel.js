const express = require('express');
const router = express.Router();
let accounts = [];
const crmAccounts = require('../models/crmAccounts');

router.all('*', (req, res, next) => {
    if (!req.session.userName) {
        res.redirect('/crm');
        return;
    }

    next();
})

/* GET users listing. */
router.get('/', function (req, res, next) {
    console.log(req.session.userName);
    crmAccounts.find({}, (err, data) => {
        accounts = data;
        res.render('crmpanel', {
            title: 'ZajazdCRM Panel',

        });
    })


});

router.post('/', function (req, res, next) {
    // req.session.admin = 0; - zlikwidowanie sesji [wylogowanie]
    req.session.userName = '';
    res.redirect('/crm');
    return;
});

// socket


const io = require('socket.io')(5010);
const users = {};

io.on('connection', socket => {
    socket.on('new-user', name => {
        users[socket.id] = name;
        socket.broadcast.emit('user-connected', name);
    });
    socket.on('send-chat-message', message => {
        socket.broadcast.emit('chat-message', {
            message: message,
            name: users[socket.id]
        });
    });
    socket.on('disconnect', () => {
        socket.broadcast.emit('user-disconnected', users[socket.id]);
        delete users[socket.id];
    });
});


// socket koniec
router.post('/chat', function (req, res, next) {

    res.redirect('/crm');
    return;
});
module.exports = router;