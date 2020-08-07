const express = require('express');
const router = express.Router();
let accounts = [];
let archiveMessages = [];
const crmAccounts = require('../models/crmAccounts');
const messagesAll = require('../models/messages');

router.all('*', (req, res, next) => {
    if (!req.session.userName) {
        res.redirect('/crm');
        return;
    }

    next();
})

/* GET users listing. */
router.get('/', function (req, res, next) {
    crmAccounts.find({}, (err, data) => {
        accounts = data;
        res.render('crmpanel', {
            title: 'ZajazdCRM Panel',

        });
    });
    updateArchiveMsg();

});
router.get('/get-chat-name', function (req, res, next) {
    res.send({
        userName: req.session.userData.chatName,
        archiveMessages: archiveMessages
    });
})
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
    socket.on('send-chat-message-to-db', message => {
        let promises = [];
        const messagesToDb = archiveMessages.concat(message);
        promises.push(messagesAll.findByIdAndUpdate('5f28e4aec5260905397de28b', {
            messages: messagesToDb
        }, (err, data) => {
            console.log('baza została odnaleziona i nadpisana!!!!!!!!!!!')
            if (err) {
                console.log(err);
            }
        }).catch(reject => console.log(reject)));
        Promise.all(promises).then(function () {
            updateArchiveMsg();
        }).catch(err => {

            console.log(err);
        });

        //przeklejone z hogwart game koniec
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

function updateArchiveMsg() {
    messagesAll.find({}, (err, data) => {
        archiveMessages = data[0].messages;
        if (err) {
            throw ('Błąd!' + err);
        };
    });
}
module.exports = router;