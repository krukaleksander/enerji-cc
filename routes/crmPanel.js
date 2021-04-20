const express = require('express');
const router = express.Router();
let accounts = [];
let archiveMessages = [];
const crmAccounts = require('../models/crmAccounts');
// const energyClients = require('../models/experts');
const clientdb = require('../models/clientsdb');
const clientsready = require('../models/clientsready');

router.all('*', (req, res, next) => {
    if (!req.session.userName) {
        return res.redirect('/');
    }

    next();
})

/* GET users listing. */
router.get('/', function (req, res, next) {

    crmAccounts.find({}, (err, data) => {
        accounts = data;
        loggedUser = accounts.filter(account => account.login === req.session.userName);
        const {
            fullName,
            email,
            login,
            password,
            chatName,
            phoneNumber
        } = loggedUser[0];
        return res.render('crmPanel', {
            title: 'energy2000 Panel 🚬 🥃 🍸',
            data,
            fullName,
            email,
            login,
            password,
            chatName,
            phoneNumber,
        });
    });


});
router.get('/get-chat-name', function (req, res, next) {
    return res.send({
        userName: req.session.userData.chatName,
        archiveMessages: archiveMessages
    });
});
router.post('/', function (req, res, next) {
    // req.session.admin = 0; - zlikwidowanie sesji [wylogowanie]
    req.session.userName = '';
    return res.redirect('/');
});

router.post('/chat', function (req, res, next) {
    return res.redirect('/');
});

// obsługa zmian

router.get('/change-user-data/:what/:password/:newData', function (req, res, next) {
    const whatChange = req.params.what;
    const passwordInputed = req.params.password;
    const changeTo = req.params.newData;
    crmAccounts.find({}, (err, data) => {
        const accounts = data;
        const loggedUser = accounts.filter(account => account.login === req.session.userName);
        const {
            _id,
            fullName,
            email,
            login,
            password,
            chatName,
            phoneNumber
        } = loggedUser[0];

        if (whatChange === 'password') {
            if (passwordInputed === password) {
                crmAccounts.updateOne({
                    _id: _id
                }, {
                    password: changeTo

                }, (err) => {
                    console.log('%c Im working...', ['color: red']);
                    if (err) console.log(err);
                    res.send('Hasło zmienione =)');
                });
            } else {
                res.send('Błędne hasło.')
            }
        }
        if (whatChange === 'phone') {
            if (passwordInputed === password) {
                crmAccounts.updateOne({
                    _id: _id
                }, {
                    phoneNumber: changeTo

                }, (err) => {
                    console.log('%c Im working...', ['color: red']);
                    if (err) console.log(err);
                    res.send('Dane zmienione =)');
                });
            } else {
                res.send('Błędne hasło.')
            }
        }
        if (whatChange === 'mail') {
            if (passwordInputed === password) {
                crmAccounts.updateOne({
                    _id: _id
                }, {
                    email: changeTo

                }, (err) => {
                    console.log('%c Im working...', ['color: red']);
                    if (err) console.log(err);
                    res.send('Dane zmienione =)');
                });
            } else {
                res.send('Błędne hasło.')
            }
        }

    });


});


// koniec obsługa zmian

// obsługa wyciągania klientów z bazy


router.get('/get-clients/', (req, res, next) => {
    let clients = [];
    clientsready.find({}, (err, data) => {
        if (err) console.log(err);
        // clients = data[0].clients.splice(0, 10);
        clients = data;
        // const checkDuplicates = [...new Set(clients)];
        res.send(clients);
    })
});

//aktualizacja klienta

router.post('/update-client/', (req, res, next) => {
    const {
        id,
        name,
        owner,
        phone,
        email,
        consumption,
        category,
        postalCode,
        city,
        street,
        streetNumber,
        description,
        status
    } = req.body;

    clientsready.findOneAndUpdate({
        id: id
    }, {
        id,
        name,
        owner,
        phone,
        email,
        consumption,
        category,
        postalCode,
        city,
        street,
        streetNumber,
        description,
        status
    }, () => {
        res.send('dane zmienione');
    })


})


// koniec akualizacja klienta

// koniec obsługa wyciągania klientów z bazy


// przebudowa bazy 
//dodawanie nowej pozycji

// router.get('/rebuild', async (req, res) => {
//     let clients = [];
//     await energyClients.find({}, (err, data) => {
//         if (err) console.log(err);
//         // clients = data[0].clients.splice(0, 10);
//         clients = data[0].clients;
//         // const checkDuplicates = [...new Set(clients)];       
//     });
//     let newClients = clients.map(client => {
//         client.status = 'potencjalny';
//         return client;
//     });
//     energyClients.findByIdAndUpdate('606823a930a8db65379b35f5', {
//         $set: {
//             clients: newClients,
//         }
//     }, () => res.send(clients))
// });

//przebudowa na pojedyńcze dokumenty

// router.get('/rebuild', async (req, res) => {
//     let clients = [];
//     let newClients = [];
//     await energyClients.find({}, (err, data) => {
//         if (err) console.log(err);
//         // clients = data[0].clients.splice(0, 10);
//         clients = Array.from(data[0].clients);
//         // const checkDuplicates = [...new Set(clients)];       
//     });

//     await clientsready.find({}, (err, data) => {
//         if (err) console.log(err);
//         newClients = data;
//     }).then(async () => {
//         console.log(newClients.length);

//         const results = clients.filter(({
//             id: id1
//         }) => !newClients.some(({
//             id: id2
//         }) => id2 == id1));
//         console.log(results.length);
//         if (newClients.length > 0) {
//             results.forEach(async (client, index) => {
//                 const {
//                     id,
//                     name,
//                     owner,
//                     phone,
//                     email,
//                     consumption,
//                     category,
//                     postalCode,
//                     city,
//                     street,
//                     streetNumber,
//                     tasks,
//                     description,
//                     status
//                 } = client;
//                 const newClient = new clientdb({
//                     id,
//                     name,
//                     category,
//                     phone,
//                     email,
//                     consumption,
//                     owner,
//                     city,
//                     street,
//                     streetNumber,
//                     postalCode,
//                     description,
//                     tasks,
//                     status
//                 });
//                 await newClient.save().catch(err => console.log(err));
//                 if (index === results.length - 1) console.log('Done =)');
//             });
//         }
//     });


//     // clients.forEach(async (client, index) => {

//     //     if (index > 0) {
//     //         const {
//     //             id,
//     //             name,
//     //             owner,
//     //             phone,
//     //             email,
//     //             consumption,
//     //             category,
//     //             postalCode,
//     //             city,
//     //             street,
//     //             streetNumber,
//     //             tasks,
//     //             description,
//     //             status
//     //         } = client;
//     //         const newClient = new clientsready({
//     //             id,
//     //             name,
//     //             category,
//     //             phone,
//     //             email,
//     //             consumption,
//     //             owner,
//     //             city,
//     //             street,
//     //             streetNumber,
//     //             postalCode,
//     //             description,
//     //             tasks,
//     //             status
//     //         });
//     //         await newClient.save().catch(err => console.log(err));
//     //     }
//     //     if (index === clients.length - 1) console.log('Done =)');
//     // });
// });

// koniec przebudowa bazy
module.exports = router;