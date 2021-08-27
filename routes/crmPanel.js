const express = require('express');
const router = express.Router();
const fs = require('fs');
let accounts = [];
const crmAccounts = require('../models/crmAccounts');
// const energyClients = require('../models/experts');
const clientsready = require('../models/clientsready');
const tasks = require('../models/tasks');
const chatMessages = require('../models/chat');
const nodemailer = require("nodemailer");
//fragment socket.io
let activeUsers = [];

const {
    io
} = require('../socketApi');

//koniec fragment socket.io


router.all('*', (req, res, next) => {
    if (!req.session.userName) {
        return res.redirect('/');
    }

    next();
})

/* GET users listing. */
router.get('/', function (req, res, next) {

    // fragment socket test
    io.on('connection', socket => {
        io.removeAllListeners();
        socket.emit('user-logged', req.session.userName);

        socket.on("new-user", async function (user) {
            const isUserActive = activeUsers.findIndex(oldUser => oldUser === user);
            if (isUserActive < 0) {
                activeUsers.push(user);
                io.emit('sent-who-is-logged', activeUsers);
            } else {
                io.emit('sent-who-is-logged', activeUsers);
                return
            }
        });
        socket.on('user-disconnected', userName => {
            activeUsers = activeUsers.filter(user => {
                if (user !== userName) return user;
            });
            io.emit('sent-who-is-logged', activeUsers);
        });
        socket.on('disconnect', function () {
            activeUsers = activeUsers.filter(user => {
                if (user !== req.session.userName) return user;
            });
            io.emit('sent-who-is-logged', activeUsers);
        });
        socket.on('new-message', function (message) {
            // tutaj
            io.emit('new-message-to-everyone', message);
        })

    })


    //koniec fragment socket test

    //fragment chat

    router.get('/get-messages/', async (req, res) => {
        let messages = [];
        await chatMessages.find({}, (err, data) => {
            if (err) console.log(err);
            messages = data;
            res.send(messages);
        })
    })

    router.post('/send-message/', async (req, res, next) => {
        const {
            name,
            date,
            text
        } = req.body;
        const newMessage = new chatMessages({
            name,
            date,
            text
        });
        await newMessage.save()
            .then(() => res.send('ok'))
            .catch(err => res.send(err));


    })


    // koniec fragment chat


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

router.post('/', function (req, res, next) {
    // req.session.admin = 0; - zlikwidowanie sesji [wylogowanie]
    req.session.userName = '';
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
                    return res.send('Hasło zmienione =)');
                });
            } else {
                return res.send('Błędne hasło.')
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
                return res.send('Błędne hasło.')
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
                return res.send('Błędne hasło.')
            }
        }

    });


});


// koniec obsługa zmian

// obsługa wyciągania klientów z bazy


router.get('/get-clients/', async (req, res, next) => {
    let clients = [];
    clientsready.find({}, (err, data) => {
        if (err) console.log(err);
        // clients = data[0].clients.splice(0, 10);
        clients = data;
        // const checkDuplicates = [...new Set(clients)];
        // clientsWithOutP5 = clients.filter(client => client.description != 'Klient zajebany z p5 z Vision');
        if (req.session.userName === 'admin') return res.send(clients);
        return res.send(clients.filter(client => client.owner === req.session.userName));
    })
});

// wyciąganie całej bazy i tasków

router.get('/db/', async (req, res) => {
    await clientsready.find({}, async (err, data) => {
        const dataToSave = JSON.stringify(data);
        if (err) console.log(err)
        const date = new Date();
        const path = `db_${date.getDate()}_${date.getMonth() + 1}.json`;
        fs.writeFile(path, dataToSave, async err => {
            if (err) throw err
            console.log('File was generated..')
        })
        let transporter = nodemailer.createTransport({
            host: "server662911.nazwa.pl",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: 'kontakt@server662911.nazwa.pl',
                pass: 'Pompa1234',
            },
        });
        let info = await transporter.sendMail({
            from: '"CRM" <kontakt@kociasiec.pl>',
            to: "aleksander@korzystnaenergia.pl",
            subject: `Stan bazy danych na dzień ${date.getDate()}_${date.getMonth() + 1}`,
            text: `Migawka bazy danych`,
            html: `<p style='color:green'>Migawka bazy danych</p>`,
            attachments: [{
                path: path
            }]
        });
        fs.unlink(path, (err) => {
            if (err) {
                console.error(err)
                return
            }
        })
        res.send('Migawka zapisana')
        console.log("Message sennt: %s", info.messageId);
    })
})

//aktualizacja klienta

router.post('/update-client/', (req, res, next) => {
    const {
        _id,
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
        status,
        www
    } = req.body;

    clientsready.findOneAndUpdate({
        _id: _id
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
        status,
        www
    }, () => {
        return res.send('dane zmienione');
    })


})


// koniec akualizacja klienta

// koniec obsługa wyciągania klientów z bazy

//dodawanie klienta

router.post('/add-client/', async (req, res, next) => {
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
        status,
        www
    } = req.body;

    // fragment sprawdzenie nip


    await clientsready.find({}, (err, data) => {
        if (err) console.log(err);
        clients = data;
    }).then(async (data) => {
        if (id !== '') {
            const isClientInDb = data.findIndex(client => client.id == id);
            if (isClientInDb >= 0) return res.send('taki nip jest już w bazie');
            // koniec fragment sprawdzenie nip
            const newClient = new clientsready({
                id,
                name,
                category,
                phone,
                email,
                consumption,
                owner,
                city,
                street,
                streetNumber,
                postalCode,
                description,
                tasks: [],
                status,
                www
            });
            await newClient.save()
                .then(() => res.send('dodano'))
                .catch(err => res.send(err));
        } else {
            const newClient = new clientsready({
                id,
                name,
                category,
                phone,
                email,
                consumption,
                owner,
                city,
                street,
                streetNumber,
                postalCode,
                description,
                tasks: [],
                status,
                www
            });
            await newClient.save()
                .then(() => res.send('dodano'))
                .catch(err => res.send(err));
        }



    })




})



// koniec dodawanie klienta

// dodawanie nowego zadania

router.post('/add-task/', async (req, res, next) => {
    const {
        title,
        clientName,
        clientNip,
        description,
        phone,
        date,
        clientId
    } = req.body;

    //funkcja sprawdzająca poprawność daty

    if (date.toString() == 'Invalid Date') return res.send('Wyznacz datę!')

    //koniec funkcja sprawdzająca poprawność daty

    if (title.length < 1) {
        return res.send('Podaj nazwę!')
    }

    // dodanie godziny, narazie zakomentuje

    // Date.prototype.addHours= function(h){
    //     this.setHours(this.getHours()+h);
    //     return this;
    // }

    // alert(new Date().addHours(4));

    // koniec dodanie godziny, narazie zakomentuje

    const newTask = new tasks({
        title,
        clientName,
        clientNip,
        description,
        phone,
        date,
        owner: req.session.userName,
        clientId,
        opened: true
    });
    await newTask.save()
        .then(res.send('Zadanie dodane'))
        .catch(err => {
            res.send('Wystąpił problem z dodaniem zadania')
            console.log(err)
        });
})



// koniec dodawanie nowego zadania

// pobieranie zadań z bazy

router.get('/get-tasks/', async (req, res) => {
    await tasks.find({}, (err, data) => {
        if (err) console.log(err);
        const ownerTasks = data.filter(task => task.owner === req.session.userName);
        return res.send(ownerTasks);
    });
})

// koniec pobieranie zadań z bazy

// kasowanie zadania

router.get('/delete-task/:id', async (req, res) => {
    const id = req.params.id
    await tasks.findByIdAndDelete({
        _id: id
    }, (err) => {
        if (err) {
            console.log(err);
            return res.send('Nie udało się usunąć zadania');
        }
        return res.send('Zadanie skasowane');
    });
})

// koniec kasowanie zadania

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

// dodanie nowej pozycji do dokumentów
// pamiętaj dodać też tą pozycję w schema!

// router.get('/rebuild', async (req, res, next) => {

//     //tutaj

//     let clientsList = [];
//     await clientsready.find({}, (err, data) => {
//             if (err) console.log(err);
//             // clients = data[0].clients.splice(0, 10);
//             clientsList = data;

//         })
//         .then(() => {
//             clientsList.forEach((client, index) => {

//                 clientsready.findOneAndUpdate({
//                     _id: client._id
//                 }, {
//                     $set: {
//                         'www': 'www'
//                     }
//                 }, () => {
//                     return console.log('Zmieniłem ' + index);
//                 })
//             })
//         })

// })


// koniec dodanie nowej pozycji do dokumentów


// koniec przebudowa bazy

// usuwanie z bazy

// router.get('/delete', (req, res) => {
//     clientsready.findOneAndDelete({
//         _id: '60811ff152c5232e07d81cda'
//     }, () => {
//         res.redirect('/panel');
//     })
// })
// koniec usuwanie z bazy

//znalezienie ostatniego klienta

// router.get('/find-last', async (req, res) => {
//     let clients = [];
//     await clientsready.find({}, (err, data) => {
//         if (err) console.log(err);
//         // clients = data[0].clients.splice(0, 10);
//         clients = data;
//         // const checkDuplicates = [...new Set(clients)];
//         res.send(clients);
//     });
//     console.log(clients[clients.length - 1]);
// });

// koniec znalezienie ostatniego klienta

// baza do dodania

const baseToAdd = [];

// koniec baza do dodania




//dodawanie klientów hurt

router.get('/add-client-mass/', async (req, res, next) => {
    let numberIndex = 0;
    let numberOfDubles = 0;
    let clients = [];

    await clientsready.find({}, (err, data) => {
        if (err) console.log(err);
        clients = data;
    }).then(async (base) => {
        baseToAdd.forEach(async (client) => {

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
                status,
                tasks,
                www
            } = client;

            if (id !== '') {
                const isClientInDb = base.findIndex(client => client.id == id);
                if (isClientInDb >= 0) {
                    numberOfDubles++
                    return console.log('taki nip jest już w bazie')
                };

                // koniec fragment sprawdzenie nip
                const newClient = new clientsready({
                    id,
                    name,
                    category,
                    phone,
                    email,
                    consumption,
                    owner,
                    city,
                    street,
                    streetNumber,
                    postalCode,
                    description,
                    tasks: [],
                    status,
                    www
                });
                await newClient.save()
                    .then(() => {
                        numberIndex++
                        console.log(`dodano ${numberIndex}`)
                    })
                    .catch(err => console.log(err));
            } else {
                const isPhoneInDb = base.findIndex(client => client.phone == phone);
                console.log(`Wynik findIndex: ${isPhoneInDb}`)
                if (isPhoneInDb > -1) {
                    numberIndex++
                    numberOfDubles++
                    if (numberIndex === baseToAdd.length) {
                        console.log('**************************')
                        console.log('   Raport z dodawania:')
                        console.log('**************************')
                        console.log(`Łączna liczba rekordów do dodania: ${baseToAdd.length}`)
                        console.log(`Łączna liczba dubli: ${numberOfDubles}`)
                        console.log(`Dodano zatem: ${baseToAdd.length - numberOfDubles}`)
                        console.log('**************************')
                        res.send(`Miałem dodać: ${baseToAdd.length}, wykryłem dubli: ${numberOfDubles}, dodałem zatem: ${baseToAdd.length - numberOfDubles}`)
                    }
                    return console.log('taki numer istnieje już w bazie: ' + phone)
                }
                const newClient = new clientsready({
                    id,
                    name,
                    category,
                    phone,
                    email,
                    consumption,
                    owner,
                    city,
                    street,
                    streetNumber,
                    postalCode,
                    description,
                    tasks: [],
                    status,
                    www
                });
                await newClient.save()
                    .then(() => {
                        numberIndex++
                        console.log(`dodano ${numberIndex}`)
                        if (numberIndex === baseToAdd.length) {
                            console.log('**************************')
                            console.log('   Raport z dodawania:')
                            console.log('**************************')
                            console.log(`Łączna liczba rekordów do dodania: ${baseToAdd.length}`)
                            console.log(`Łączna liczba dubli: ${numberOfDubles}`)
                            console.log(`Dodano zatem: ${baseToAdd.length - numberOfDubles}`)
                            console.log('**************************')
                            res.send(`Miałem dodać: ${baseToAdd.length}, wykryłem dubli: ${numberOfDubles}, dodałem zatem: ${baseToAdd.length - numberOfDubles}`)
                        }
                    })
                    .catch(err => console.log(err));
            }





        })
    })


})



// koniec dodawanie klientów hurt


//start usuwanie klikentów

router.get('/delete-client/:id', async (req, res) => {
    const id = req.params.id
    await clientsready.findByIdAndDelete({
        _id: id
    }, (err) => {
        if (err) {
            console.log(err);
            return res.send('Nie udało się usunąć klienta');
        }
        return res.send('Klient usunięty');
    });
})


// koniec usuwanie klientów

// dodawanie notatek


router.post('/add-note/', (req, res, next) => {
    const {
        _id,
        date,
        title,
        description
    } = req.body;

    const newNote = {
        date,
        title,
        description
    };

    clientsready.findOneAndUpdate({
        _id: _id
    }, {
        $push: {
            tasks: newNote
        }
    }, () => {
        return res.send('notatka dodana');
    })


})


//koniec dodawanie notatek


//edycja notatek


router.post('/edit-note/', (req, res, next) => {
    const {
        _id,
        tasks
    } = req.body;


    clientsready.findOneAndUpdate({
        _id: _id
    }, {
        $set: {
            tasks: JSON.parse(tasks)
        }
    }, () => {
        return res.send('notatka zedytowana');
    })


})

router.post('/remove-note/', (req, res, next) => {
    const {
        _id,
        tasks
    } = req.body;


    clientsready.findOneAndUpdate({
        _id: _id
    }, {
        $set: {
            tasks: JSON.parse(tasks)
        }
    }, () => {
        return res.send('notatka usunięta');
    })


})


//koniec edycja notatek



//start usuwanie klikentów hurt

router.get('/delete-client-mass/', async (req, res) => {
    clientsready.deleteMany({
        status: 'potencjalny',
        city: 'Marki',
        owner: 'damian.wasiak'
    }, function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.send(result);
        }
    });

});


// koniec usuwanie klientów hurt


//start przenoszenie klikentów hurt

router.get('/update-mass/', async (req, res) => {

    clientsready.updateMany({
        status: 'potencjalny',
        owner: 'oleksii.tsymbaliuk',
        category: 'olx',
        city: 'Mińsk Mazowiecki'
    }, {
        $set: {
            owner: 'damian.wasiak'
        }
    }, (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.send(result);
        }
    });


});


// koniec przenoszenie klientów hurt

module.exports = router;