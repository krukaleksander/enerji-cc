const express = require('express');
const router = express.Router();
let accounts = [];
const crmAccounts = require('../models/crmAccounts');
// const energyClients = require('../models/experts');
const clientsready = require('../models/clientsready');
const tasks = require('../models/tasks');
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


    })


    //koniec fragment socket test

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
        status
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
        status
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
        status
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
                status
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
                status
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
        owner: req.session.userName
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


// pobieranie nazwy użytkownika dla chatu



// koniec pobieranie nazwy użytkownika dla chatu

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

const baseToAdd = [{
    "id": "",
    "name": "NOBILIS Paweł Smoliński",
    "category": "bazafirm",
    "phone": "kom. 601 183 042",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Otrębusy",
    "street": "ul. Wiejska 38",
    "streetNumber": "",
    "postalCode": "05-805",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "9520000293",
    "name": "ULMER Sp.j.",
    "category": "bazafirm",
    "phone": "tel./fax (22) 615 63 10",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Warszawa",
    "street": "ul. Rosnąca 14",
    "streetNumber": "",
    "postalCode": "04-708",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "FROST-TECH Zakład Usług Chłodniczych",
    "category": "bazafirm",
    "phone": "kom. 601 657 668",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Gdańsk",
    "street": "ul. Cumowników 40",
    "streetNumber": "",
    "postalCode": "80-299",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Dawsongroup Polska Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (22) 877 41 15,fax (22) 877 41 13",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Warszawa",
    "street": "ul. Marywilska 34a",
    "streetNumber": "",
    "postalCode": "03-228",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "7971423830",
    "name": "FROSTICO Chłodnia Warka S.A.",
    "category": "bazafirm",
    "phone": "tel./fax (48) 667 29 09,tel. (48) 667 21 11",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Warka",
    "street": "ul. Gośniewska 51a",
    "streetNumber": "",
    "postalCode": "05-660",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "W.U.H. SERWIS-AC Chłodnictwo, Klimatyzacja, Wentylacja",
    "category": "bazafirm",
    "phone": "kom. 606 956 370",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Brzeźnica",
    "street": "ul. Spokojna 3",
    "streetNumber": "",
    "postalCode": "39-206",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "9372663724",
    "name": "Delico Sp. z o.o. Sp.komandytowa",
    "category": "bazafirm",
    "phone": "tel. (33) 817 74 27,tel. (33) 817 76 30,fax (33) 817 75 17",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Rybarzowice",
    "street": "ul. Wilkowska 740",
    "streetNumber": "",
    "postalCode": "43-378",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "WEST FROST instalacje na dwutlenek węgla CO2 (R744)",
    "category": "bazafirm",
    "phone": "kom. 602 694 652,kom. 604 270 581",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Ostrów Wielkopolski",
    "street": "ul. Krotoszyńska 161",
    "streetNumber": "",
    "postalCode": "63-400",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "6251238765",
    "name": "DIAGONAL Małgorzata Szymonek",
    "category": "bazafirm",
    "phone": "tel. (32) 287 31 17",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Wojkowice",
    "street": "ul. Plaka 56",
    "streetNumber": "",
    "postalCode": "42-580",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "No Problem",
    "category": "bazafirm",
    "phone": "tel. (22) 110 66 22",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Halinów",
    "street": "ul. Bukowa 17",
    "streetNumber": "",
    "postalCode": "05-074",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8981868439",
    "name": "PHU FIRN Urządzenia Chłodnicze i Gastronomiczne",
    "category": "bazafirm",
    "phone": "tel. (71) 717 37 10,tel. (71) 792 33 03,kom. 603 571 283",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Wrocław",
    "street": "plac Staszica 50",
    "streetNumber": "",
    "postalCode": "50-222",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "AIR INVEST Chłodnictwo Klimatyzacja Wentylacja",
    "category": "bazafirm",
    "phone": "kom. 660 903 100",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Warszawa",
    "street": "ul. Solec 81b lok.A-51",
    "streetNumber": "",
    "postalCode": "00-382",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "F.H.U. KLIMARO Robert Rogala",
    "category": "bazafirm",
    "phone": "kom. 600 384 556",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Zbytków",
    "street": "ul. Brzozowa 31",
    "streetNumber": "",
    "postalCode": "43-246",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Vidan - Zamrażalnia Vidansonder",
    "category": "bazafirm",
    "phone": "tel. (22) 725 70 74,tel. (22) 725 72 84,tel./fax (22) 725 70 28",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Brochów",
    "street": "Brochów 120",
    "streetNumber": "",
    "postalCode": "05-088",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Aggreko Polska Sp. z o.o.",
    "category": "bazafirm",
    "phone": "kom. 608 608 419,kom. 784 475 341",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Kazuń Nowy",
    "street": "ul. Fort Ordona 6",
    "streetNumber": "",
    "postalCode": "05-152",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Chłodnia-Mors Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (84) 638 97 25,tel. (84) 638 56 04",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Zamość",
    "street": "ul. Kilińskiego 83",
    "streetNumber": "",
    "postalCode": "22-400",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8680000835",
    "name": "COLD Sp.j.",
    "category": "bazafirm",
    "phone": "tel. (14) 611 15 80,tel. (14) 611 11 78,tel. (14) 611 15 81",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Bochnia",
    "street": "ul. Łany 6",
    "streetNumber": "",
    "postalCode": "32-700",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "7261092513",
    "name": "P.P.U.H. AGRO-REM",
    "category": "bazafirm",
    "phone": "tel. (15) 836 56 65,kom. 608 370 134",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Obrazów",
    "street": "Bilcza 89",
    "streetNumber": "",
    "postalCode": "27-641",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "PHU PRYMUS Grygorczuk Zygmunt",
    "category": "bazafirm",
    "phone": "tel. (52) 376 49 11,tel. (52) 321 23 83,tel. (52) 366 21 12",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Bydgoszcz",
    "street": "ul. Kościuszki 27b",
    "streetNumber": "",
    "postalCode": "85-079",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "1182103946",
    "name": "ECOKLIMAT Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (22) 721 01 67,kom. 511 121 212",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Ożarów Mazowiecki",
    "street": "ul. Poznańska 143",
    "streetNumber": "",
    "postalCode": "05-850",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "7261468579",
    "name": "SiMiKo",
    "category": "bazafirm",
    "phone": "tel. (42) 680 96 17,kom. 601 383 266",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Łódź",
    "street": "ul. Lublinek 45",
    "streetNumber": "",
    "postalCode": "93-469",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "GAS-ELECTRONIC Samulski",
    "category": "bazafirm",
    "phone": "tel. (61) 828 00 06,tel./fax (61) 828 00 70",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Suchy Las",
    "street": "ul. Rolna 32",
    "streetNumber": "",
    "postalCode": "62-002",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "9441149173",
    "name": "AGRO-CHŁODNIA",
    "category": "bazafirm",
    "phone": "tel. (12) 285 86 33,tel./fax (12) 285 86 36",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Węgrzce",
    "street": "ul. Warszawska 26",
    "streetNumber": "",
    "postalCode": "32-086",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Baltic Master Sp. z o.o.",
    "category": "bazafirm",
    "phone": "kom. 518 927 427,kom. 511 758 155",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Warszawa",
    "street": "ul. Gizów 6/329",
    "streetNumber": "",
    "postalCode": "01-249",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Chłodnia BAŁWANEK",
    "category": "bazafirm",
    "phone": "tel. (77) 482 96 07,kom. 601 533 803",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Kędzierzyn-Koźle",
    "street": "ul. Dunikowskiego 24",
    "streetNumber": "",
    "postalCode": "47-200",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Chłodnia MAZOWSZE",
    "category": "bazafirm",
    "phone": "tel. (46) 862 12 04-05,fax (46) 862 12 06,kom. 606 813 505",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Sochaczew",
    "street": "ul. Spartańska 12/14",
    "streetNumber": "",
    "postalCode": "96-500",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5250011183",
    "name": "Chłodnia MORS-WOLA Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (22) 836 74 04,fax (22) 836 74 04 w.28",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Warszawa",
    "street": "aleja Prymasa Tysiąclecia 62",
    "streetNumber": "",
    "postalCode": "01-424",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Chłodnia Składowa KULCZYCKI",
    "category": "bazafirm",
    "phone": "tel. (84) 665 23 16,kom. 603 847 538",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Bełżec",
    "street": "ul. Słoneczna 18",
    "streetNumber": "",
    "postalCode": "22-670",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Chłodnia Składowa LODOM Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (91) 469 01 18",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Szczecin",
    "street": "ul. Pomorska 112a",
    "streetNumber": "",
    "postalCode": "70-812",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Chłodnia Szczecińska Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (91) 462 39 13,fax (91) 462 36 22,kom. 693 720 232",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Szczecin",
    "street": "ul. Bytomska 7",
    "streetNumber": "",
    "postalCode": "70-603",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "F.H.U. GRZYBEX Sp.j.",
    "category": "bazafirm",
    "phone": "tel./fax (32) 263 01 07,kom. 603 778 387,kom. 605 762 696",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Sosnowiec",
    "street": "ul. Morcinka 22",
    "streetNumber": "",
    "postalCode": "41-215",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "FRIGOMAR Sp.j.",
    "category": "bazafirm",
    "phone": "tel. (91) 469 13 60",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Goleniów",
    "street": "ul. Granitowa 14",
    "streetNumber": "",
    "postalCode": "72-100",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "INDUSTRIAL FRIGO Polska Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (12) 372 38 26",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Myślenice",
    "street": "ul. Kazimierza Wielkiego 64",
    "streetNumber": "",
    "postalCode": "32-400",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "MACHNIAK Ryszard Machniak",
    "category": "bazafirm",
    "phone": "tel./fax (67) 282 99 05,kom. 601 757 142",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Chodzież",
    "street": "ul. Armii Poznań 7",
    "streetNumber": "",
    "postalCode": "64-800",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "GRABO PPH i Chłodnie Składowe Sp.j.",
    "category": "bazafirm",
    "phone": "tel. (33) 829 10 10-12,fax (33) 829 10 13",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Bielsko-Biała",
    "street": "ul. Bohaterów Monte Casino 493",
    "streetNumber": "",
    "postalCode": "43-382",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Nowa Chłodnia Łódź Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (42) 652 29 07",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Łódź",
    "street": "ul. Traktorowa 170",
    "streetNumber": "",
    "postalCode": "91-203",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "P.H.U. SABA",
    "category": "bazafirm",
    "phone": "tel. (81) 721 68 23,tel. (81) 721 68 25,fax (81) 721 68 24",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Mełgiew",
    "street": "ul. Piasecka 11 Krępiec",
    "streetNumber": "",
    "postalCode": "21-007",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "P.P.H.U. Hersan",
    "category": "bazafirm",
    "phone": "tel. (46) 875 25 35-36,fax (46) 875 25 40",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Brzeziny",
    "street": "ul. Paprotnia 30a",
    "streetNumber": "",
    "postalCode": "95-060",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "PPH Krimarg Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (22) 836 91 29",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Warszawa",
    "street": "ul. Jana Kazimierza",
    "streetNumber": "",
    "postalCode": "01-248",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5260250127",
    "name": "PHZ SM Lacpol Sp. z o.o. Zakład w Gdyni",
    "category": "bazafirm",
    "phone": "tel. (58) 620 21 91,fax (58) 620 50 02",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Gdynia",
    "street": "ul. Polska 15",
    "streetNumber": "",
    "postalCode": "81-969",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Przedsiębiorstwo Przetwórstwa Mięsnego Firma Marcinkowscy Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel./fax (65) 517 71 07,tel./fax (65) 517 84 10",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Krzywiń",
    "street": "Nowy Dwór 67",
    "streetNumber": "",
    "postalCode": "64-010",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8882420807",
    "name": "RUN-CHŁODNIA we Włocławku Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (54) 412 39 25,fax (54) 236 31 07",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Włocławek",
    "street": "ul. Wysoka 14",
    "streetNumber": "",
    "postalCode": "87-800",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Termo Koncept Chłodnictwo, Urządzenia Chłodnicze, Klimatyzacja",
    "category": "bazafirm",
    "phone": "tel./fax (48) 387 25 00",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Rzeszów",
    "street": "ul. Boya-Żeleńskiego 16/18",
    "streetNumber": "",
    "postalCode": "35-105",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Z.P.D. CEBEA Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (14) 612 24 64,fax (14) 612 27 39",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Bochnia",
    "street": "ul. Krasińskiego 29",
    "streetNumber": "",
    "postalCode": "32-700",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Zakłady Mięsne ŁAGROM Sp. z o.o. Chłodnia Składowa",
    "category": "bazafirm",
    "phone": "tel. (65) 572 92 00,fax (65) 575 19 37,fax (65) 572 92 54",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Gostyń Wielkopolski",
    "street": "Czachorowo 44",
    "streetNumber": "",
    "postalCode": "63-800",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "APEX Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (14) 686 19 90,fax (14) 686 19 91",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Brzesko",
    "street": "ul. Kołłątaja 13a",
    "streetNumber": "",
    "postalCode": "32-800",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "APEX-THERMO KING Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (58) 625 70 75,fax (58) 625 70 78",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Gdańsk",
    "street": "ul.Geodetów 18",
    "streetNumber": "",
    "postalCode": "80-298",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Calfrost Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (62) 764 64 21,tel./fax (62) 764 64 22",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Kalisz",
    "street": "ul. Wrocławska 31",
    "streetNumber": "",
    "postalCode": "62-800",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "BLUE SEVEN Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (91) 463 56 50,fax (91) 462 95 07,tel. (91) 431 37 64,fax (91) 464 41 23",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Szczecin",
    "street": "ul. Struga 15",
    "streetNumber": "",
    "postalCode": "70-777",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "CHŁOD KLIM S.c.",
    "category": "bazafirm",
    "phone": "tel./fax (42) 676 02 33",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Łódź",
    "street": "ul. Piłsudskiego 92",
    "streetNumber": "",
    "postalCode": "92-202",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8721916259",
    "name": "Company Solo Maciej Kizior",
    "category": "bazafirm",
    "phone": "tel./fax (14) 670 50 34,kom. 606 897 023",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Dębica",
    "street": "ul. Polna 6a",
    "streetNumber": "",
    "postalCode": "39-200",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "ESP Serwis Sp. z o.o.",
    "category": "bazafirm",
    "phone": "kom. 794 602 307,kom. 730 525 007,tel. (22) 121 22 31",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Warszawa",
    "street": "ul. Niekłańska 11a/1",
    "streetNumber": "",
    "postalCode": "03-924",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "EKOPOOL",
    "category": "bazafirm",
    "phone": "kom. 609 456 294,kom. 517 540 297",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Radom",
    "street": "ul. Jasna 12",
    "streetNumber": "",
    "postalCode": "26-600",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "9551306219",
    "name": "Ewik Usługi Ewa Etmańska",
    "category": "bazafirm",
    "phone": "kom. 502 996 516,kom. 503 196 508",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Szczecin",
    "street": "ul. K.Napierskiego 75/1",
    "streetNumber": "",
    "postalCode": "70-783",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "F.H.U.P. Bernard Dudek",
    "category": "bazafirm",
    "phone": "tel. (32) 435 80 28,kom. 603 116 130",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Żory",
    "street": "ul. Brodecka 1",
    "streetNumber": "",
    "postalCode": "44-245",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Gastro-Majster",
    "category": "bazafirm",
    "phone": "kom. 793 910 554,kom. 698 645 790",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Zielona Góra",
    "street": "ul. Apartamentowa 21 Łężyca",
    "streetNumber": "",
    "postalCode": "66-016",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5240407620",
    "name": "Hurtownia Meble Sklepowe i Urządzenia Chłodnicze Edward Kozyra",
    "category": "bazafirm",
    "phone": "tel. (22) 782 44 24,fax (22) 782 44 72,kom. 602 240 127",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Warszawa",
    "street": "ul. Modlińska 246",
    "streetNumber": "",
    "postalCode": "03-152",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "6591428855",
    "name": "Klimatyzacja, Chłodnie na Warzywa OCZKOWICZ",
    "category": "bazafirm",
    "phone": "kom. 506 438 028,kom. 602 801 744",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Miechów",
    "street": "ul. Bema 34a",
    "streetNumber": "",
    "postalCode": "32-200",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "6431740319",
    "name": "GRUPA FSP Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (32) 762 90 25",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Siemianowice Śląskie",
    "street": "ul. Powstańców 13",
    "streetNumber": "",
    "postalCode": "41-100",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "7642380321",
    "name": "KLIMBEST Montaż i Serwis Urządzeń Chłodniczych Bartłomiej Wolan",
    "category": "bazafirm",
    "phone": "kom. 790 500 658",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Piła",
    "street": "ul. Miedziana 9",
    "streetNumber": "",
    "postalCode": "64-920",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5341114078",
    "name": "ŁADOŃ TRADE",
    "category": "bazafirm",
    "phone": "tel. (22) 424 20 40,fax (22) 632 61 39,kom. 601 280 288",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Legionowo",
    "street": "aleja Legionów 72",
    "streetNumber": "",
    "postalCode": "05-120",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8842096737",
    "name": "NIVIS",
    "category": "bazafirm",
    "phone": "kom. 888 438 422",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Świdnica",
    "street": "ul. Janusza Kusocińskiego 4",
    "streetNumber": "",
    "postalCode": "58-100",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "PPHU GRZELAK Klimatyzacja Chłodnictwo",
    "category": "bazafirm",
    "phone": "kom. 601 961 887",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Szprotawa",
    "street": "ul. Buczka 24",
    "streetNumber": "",
    "postalCode": "67-300",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "REAL S.A.",
    "category": "bazafirm",
    "phone": "tel. (25) 644 59 39-42,fax (25) 644 59 43",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Siedlce",
    "street": "ul. Brzeska 76",
    "streetNumber": "",
    "postalCode": "08-102",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Spółdzielnia Ogrodnicza w Grójcu",
    "category": "bazafirm",
    "phone": "tel. (48) 664 24 32,fax (48) 664 23 31,kom. 693 666 376",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Grójec",
    "street": "ul. Mogielnicka 28",
    "streetNumber": "",
    "postalCode": "05-600",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "ROZET F.H.U. Klimatyzacja, Wentylacja, Chłodnictwo",
    "category": "bazafirm",
    "phone": "tel./fax (32) 292 15 63,kom. 606 828 289",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Katowice",
    "street": "ul. Sandomierska 6",
    "streetNumber": "",
    "postalCode": "40-216",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Stalgast Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (22) 517 15 75,infolinia 801 40 50 63",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Warszawa",
    "street": "ul. Plac Konesera 9, Budynek O",
    "streetNumber": "",
    "postalCode": "03-736",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "ThermoUniversal",
    "category": "bazafirm",
    "phone": "kom. 501 989 001,kom. 602 333 582",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Kielno",
    "street": "ul. Władysława Szpilmana 11",
    "streetNumber": "",
    "postalCode": "84-208",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "TR Klimat",
    "category": "bazafirm",
    "phone": "kom. 513 500 570",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Warszawa",
    "street": "ul. Kaczeńca 16",
    "streetNumber": "",
    "postalCode": "04-556",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Uren Novaberry Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (81) 742 01 01,fax (81) 742 91 30",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Lublin",
    "street": "ul. Beskidzka 9",
    "streetNumber": "",
    "postalCode": "20-868",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "6222697335",
    "name": "WEST FROST Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (62) 590 30 02",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Ostrów Wielkopolski",
    "street": "ul. Krotoszyńska 161",
    "streetNumber": "",
    "postalCode": "63-400",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "7961806618",
    "name": "Zakład Remontowo-Montażowy SPOMASZ Małgorzata Janek",
    "category": "bazafirm",
    "phone": "tel. (48) 307 00 77,tel. (48) 307 00 78,kom. 505 163 076",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Radom",
    "street": "ul. Odlewnicza 7/9",
    "streetNumber": "",
    "postalCode": "26-600",
    "description": "Chłodnie, mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "GLGroup Spółdzielnia",
    "category": "bazafirm",
    "phone": "kom. 785 040 512",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Huszlew",
    "street": "Kopce 6a",
    "streetNumber": "",
    "postalCode": "08-206",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "WOKAS S.A. Kopalnie Torfu",
    "category": "bazafirm",
    "phone": "tel. (83) 359 05 55",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Łosice",
    "street": "ul. Błonie 5a",
    "streetNumber": "",
    "postalCode": "08-200",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Uprawa Pieczarek Sebastian Markiewicz",
    "category": "bazafirm",
    "phone": "tel. (43) 677 20 75,fax (43) 677 20 88,kom. 607 222 668,kom. 607 222 667,kom. 607 222 936",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Dobroń",
    "street": "ul. Wrocławska 3a",
    "streetNumber": "",
    "postalCode": "95-082",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "9251930669",
    "name": "HAJDUK Grupa Producentów Pieczarek Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (68) 356 72 42,tel. (68) 356 84 59,fax (68) 356 72 41",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Sława",
    "street": "Lipinki 46a",
    "streetNumber": "",
    "postalCode": "67-410",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Gospodarstwo Produkcyjno-Handlowe Grzybek",
    "category": "bazafirm",
    "phone": "kom. 663 750 382,kom. 663 750 381",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Opole",
    "street": "ul. Teligi 6",
    "streetNumber": "",
    "postalCode": "45-627",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Lomania Polsko-Francuska Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (65) 512 39 19,tel. (65) 511 98 41",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Kościan",
    "street": "Szczodrowo 13",
    "streetNumber": "",
    "postalCode": "64-000",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "KOMPOST WRONA Sp. z o.o. Sp.komandytowa",
    "category": "bazafirm",
    "phone": "tel./fax (32) 211 47 04,tel. (32) 211 49 03,tel. (32) 449 10 00-02",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Pszczyna",
    "street": "ul. Polne Domy 52",
    "streetNumber": "",
    "postalCode": "43-200",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Uprawa Pieczarek DAMIAN FIGOŁUSZKA",
    "category": "bazafirm",
    "phone": "kom. 601 962 597",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Pszczyna",
    "street": "ul. Braci Jędrysików 14",
    "streetNumber": "",
    "postalCode": "43-200",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Gortan Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (83) 352 51 86,fax (83) 352 51 86 w. 24",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Warszawa",
    "street": "ul. Nowogrodzka 50/510",
    "streetNumber": "",
    "postalCode": "00-695",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "9680377776",
    "name": "FHU FRUKTUS Lucyna Plota",
    "category": "bazafirm",
    "phone": "kom. 607 308 316,tel./fax (62) 766 71 86,tel. (62) 762 14 75,kom. 607 848 122",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Nowe Skalmierzyce",
    "street": "Gniazdów 26",
    "streetNumber": "",
    "postalCode": "63-460",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5371360362",
    "name": "NIKO Sławomir Mikołaj Nitychoruk",
    "category": "bazafirm",
    "phone": "tel./fax (83) 342 02 53,kom. 504 196 233",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Biała Podlaska",
    "street": "ul. Unitów Podlaskich 8",
    "streetNumber": "",
    "postalCode": "21-500",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "AFIRMA Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (61) 811 13 15,tel. (61) 892 12 15,kom. 502 225 414,kom. 789 124 397",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Murowana Goślina",
    "street": "Wojnowo",
    "streetNumber": "",
    "postalCode": "62-095",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8311638789",
    "name": "AGARIS MYCO POLAND Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (43) 675 14 40",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Łask",
    "street": "Karszew 42",
    "streetNumber": "",
    "postalCode": "98-100",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "7880008255",
    "name": "Agro Team Przedsiębiorstwo Spółdzielcze",
    "category": "bazafirm",
    "phone": "tel./fax (61) 444 11 09,tel./fax (61) 444 11 03",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Rakoniewice",
    "street": "Goździn 1b",
    "streetNumber": "",
    "postalCode": "62-067",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "AGRODOLINA Świerczyńsko",
    "category": "bazafirm",
    "phone": "tel./fax (44) 615 06 99",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Rozprza",
    "street": "Świerczyńsko 20",
    "streetNumber": "",
    "postalCode": "97-340",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "AGROMYCEL Producent Pieczarek",
    "category": "bazafirm",
    "phone": "tel. (87) 425 71 98,kom. 501 544 375",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Ruciane-Nida",
    "street": "Wojnowo 2",
    "streetNumber": "",
    "postalCode": "12-220",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Czesław Biela Pieczarkarnia",
    "category": "bazafirm",
    "phone": "kom. 502 460 940,tel. (32) 448 44 17",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Piasek",
    "street": "ul. Katowicka",
    "streetNumber": "",
    "postalCode": "43-211",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "F.H.U. PERFEKT Jochem Teodor",
    "category": "bazafirm",
    "phone": "tel./fax (32) 211 64 11,kom. 509 616 876,kom. 509 475 062",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Miedźna",
    "street": "ul. Bieruńska 16",
    "streetNumber": "",
    "postalCode": "43-227",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "FHU ROBERT Sp. z o.o. S.K.A.",
    "category": "bazafirm",
    "phone": "tel./fax (25) 633 11 13",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Siedlce",
    "street": "ul. Sokołowska 152e",
    "streetNumber": "",
    "postalCode": "08-110",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "F.W. JODKO",
    "category": "bazafirm",
    "phone": "tel. (68) 384 55 32",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Wolsztyn",
    "street": "Berzyna 70",
    "streetNumber": "",
    "postalCode": "64-200",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "FIMINSKY Sp. z o.o. Sp.komandytowa",
    "category": "bazafirm",
    "phone": "tel. (68) 386 08 95,fax (68) 386 87 47",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Zbąszyń",
    "street": "ul. Żniwna 4 Nądnia",
    "streetNumber": "",
    "postalCode": "64-360",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Doradztwo w Produkcji Pieczarek Nikodem Sakson",
    "category": "bazafirm",
    "phone": "kom. 501 241 232",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Poznań",
    "street": "ul. Buska 3",
    "streetNumber": "",
    "postalCode": "60-476",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8212585647",
    "name": "Grupa Producentów GRZYBOWY RAJ Sp. z o.o.",
    "category": "bazafirm",
    "phone": "kom. 602 682 646,kom. 602 438 916,kom. 512 552 553,kom. 698 117 319",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Skórzec",
    "street": "Grala Dąbrowizna 120",
    "streetNumber": "",
    "postalCode": "08-114",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "FOLKOWIE Uprawa Pieczarek",
    "category": "bazafirm",
    "phone": "kom. 508 172 683",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Pszczyna",
    "street": "ul. Stalowa 6",
    "streetNumber": "",
    "postalCode": "43-200",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "6112418386",
    "name": "Grzybek Białogardzki Mariusz Ziental",
    "category": "bazafirm",
    "phone": "kom. 793 330 307",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Białogard",
    "street": "ul. Szosa Połczyńska 11a",
    "streetNumber": "",
    "postalCode": "78-200",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5372570506",
    "name": "Grzybek Horbowski Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel./fax (83) 375 75 81",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Zalesie",
    "street": "Horbów-Kolonia 6c",
    "streetNumber": "",
    "postalCode": "21-512",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "4960157777",
    "name": "GŁUCHOWSKI GROUP Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (83) 359 05 64",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Łosice",
    "street": "Nowosielec 46a",
    "streetNumber": "",
    "postalCode": "08-200",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "GRZYBMAR Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (61) 443 34 04,fax (61) 443 34 03",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Wielichowo",
    "street": "ul. Łubnicka 1 Wielichowo-Wieś",
    "streetNumber": "",
    "postalCode": "64-050",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8310005846",
    "name": "MYKOGEN Joanna Małuszyńska-Szmytka",
    "category": "bazafirm",
    "phone": "tel. (43) 675 45 45,fax (43) 675 41 77",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Dobroń",
    "street": "Orpelów Numerki 19",
    "streetNumber": "",
    "postalCode": "95-082",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "OBRAKO Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (65) 512 18 94,tel. (65) 512 40 68,fax (65) 511 06 99",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Kościan",
    "street": "ul. Piaskowa 16 Kurza Góra",
    "streetNumber": "",
    "postalCode": "64-000",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "OKECHAMP S.A.",
    "category": "bazafirm",
    "phone": "tel. (61) 846 99 00,fax (61) 846 99 01",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Poznań",
    "street": "ul. Wichrowa 1a",
    "streetNumber": "",
    "postalCode": "60-449",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Karol Kania i Synowie",
    "category": "bazafirm",
    "phone": "tel. (32) 211 45 00",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Piasek",
    "street": "ul. Studzienicka 52",
    "streetNumber": "",
    "postalCode": "43-211",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "9231162948",
    "name": "P.H.U. IMPORT-EXPORT Marek Ciesielski",
    "category": "bazafirm",
    "phone": "tel. (68) 384 41 70,kom. 507 098 012",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Chobienice",
    "street": "Chobienice 7",
    "streetNumber": "",
    "postalCode": "64-214",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "7881442462",
    "name": "P.H.U. SZYMAŃSKI",
    "category": "bazafirm",
    "phone": "tel. (61) 610 75 40,fax (61) 610 75 38",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Kamieniec",
    "street": "ul. Krótka 2",
    "streetNumber": "",
    "postalCode": "64-061",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Pieczarkarnia Wierzbno",
    "category": "bazafirm",
    "phone": "tel. (25) 793 45 15",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Wierzbno",
    "street": "Wierzbno 58",
    "streetNumber": "",
    "postalCode": "07-111",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "PIECZARKI MAZURSKIE Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (89) 742 37 30",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Mrągowo",
    "street": "Użranki 61",
    "streetNumber": "",
    "postalCode": "11-700",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "PMARK Import-Eksport Mariusz Kania",
    "category": "bazafirm",
    "phone": "tel. (32) 449 10 30,kom. 501 040 893",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Pszczyna",
    "street": "ul. Szarych Szeregów 15",
    "streetNumber": "",
    "postalCode": "43-200",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Pieczarkarnia Anna Zdzuj",
    "category": "bazafirm",
    "phone": "tel./fax (77) 440 41 86,kom. 691 062 382",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Luboszyce",
    "street": "ul Zawadzka 12a Kępa",
    "streetNumber": "",
    "postalCode": "46-022",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "POLOK - Grupa Producentów Grzybów Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (32) 750 55 30,kom. 669 916 333",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Suszec",
    "street": "ul. Pszczyńska 117",
    "streetNumber": "",
    "postalCode": "43-267",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "PPUH BOFMAR Sp.j. Bojdoł",
    "category": "bazafirm",
    "phone": "tel. (32) 210 18 51,kom. 794 556 626",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Pszczyna",
    "street": "ul. Studzienicka 57",
    "streetNumber": "",
    "postalCode": "43-200",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "R&amp;J Sztandera Sp.j.",
    "category": "bazafirm",
    "phone": "kom. 602 682 251,kom. 539 972 469,kom. 539 972 467",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Skórzec",
    "street": "Ozorów 143",
    "streetNumber": "",
    "postalCode": "08-114",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "RAWONA Jolanta Piórko, Rafał Piórko Sp.j.",
    "category": "bazafirm",
    "phone": "tel. (32) 210 00 80,fax (32) 447 13 01",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Miedźna",
    "street": "ul. Pszczyńska 2b",
    "streetNumber": "",
    "postalCode": "43-227",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "ROBSON Robert Jóźwiak",
    "category": "bazafirm",
    "phone": "kom. 663 775 521,fax (65) 518 02 67",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Śmigiel",
    "street": "ul. Główna 37a Bruszczewo",
    "streetNumber": "",
    "postalCode": "64-030",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8311633088",
    "name": "STEC Sp. z o.o. Sp.komandytowa",
    "category": "bazafirm",
    "phone": "tel./fax (43) 675 50 73,tel. (43) 675 80 33",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Łask",
    "street": "Aleksandrówek 29a",
    "streetNumber": "",
    "postalCode": "98-100",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8211001029",
    "name": "UNIKOST Sp.j.",
    "category": "bazafirm",
    "phone": "tel. (25) 631 66 92-93,fax (25) 631 66 18",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Skórzec",
    "street": "ul. Osiedlowa 100 Gołąbek",
    "streetNumber": "",
    "postalCode": "08-114",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Uprawa Pieczarek Marek Gołyszny",
    "category": "bazafirm",
    "phone": "tel./fax (32) 449 02 12,kom. 607 301 882",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Radostowice",
    "street": "ul. Pszczyńska 227",
    "streetNumber": "",
    "postalCode": "43-262",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Uprawa Pieczarek mgr inż. Antoni Lenda",
    "category": "bazafirm",
    "phone": "kom. 606 685 249",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Raciborowice",
    "street": "Iwiny 29d",
    "streetNumber": "",
    "postalCode": "59-720",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8311513817",
    "name": "Uprawa Pieczarek TENDERENDA",
    "category": "bazafirm",
    "phone": "tel. (43) 675 45 66,fax (43) 676 22 99",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Łask",
    "street": "Wronowice 25",
    "streetNumber": "",
    "postalCode": "98-100",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Uprawa Pieczarek Pawelec Zdzisław",
    "category": "bazafirm",
    "phone": "kom. 696 040 496",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Świdnik",
    "street": "Kazimierzówka 34",
    "streetNumber": "",
    "postalCode": "21-040",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Wytwórnia Podłoża Zastępczego Sp. z o.o. S.K.A",
    "category": "bazafirm",
    "phone": "tel. (89) 621 89 91,fax (89) 621 89 92",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Wielbark",
    "street": "Kołodziejowy Grąd 1a",
    "streetNumber": "",
    "postalCode": "12-160",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Wytwórnia Grzybni Pieczarek Franciszek i Ludwik Kania",
    "category": "bazafirm",
    "phone": "tel./fax (32) 211 48 80",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Piasek",
    "street": "ul. Wolności 48",
    "streetNumber": "",
    "postalCode": "43-211",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Zakład Produkcji Podłoża Pieczarkowego KOMPOSTPAL Sp. z o.o. Sp.komandytowa",
    "category": "bazafirm",
    "phone": "tel. (65) 513 13 88,tel./fax (65) 513 14 10",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Kościan",
    "street": "ul. Prosta 4 Spytkówki",
    "streetNumber": "",
    "postalCode": "64-000",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Ferma Drobiu i Uprawa Pieczarek w Ćwiklicach",
    "category": "bazafirm",
    "phone": "tel. (32) 211 23 46",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Ćwiklice",
    "street": "ul. Grzybowa 10",
    "streetNumber": "",
    "postalCode": "43-229",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "6381513106",
    "name": "GAR­DE­NIA",
    "category": "bazafirm",
    "phone": "tel./fax (32) 447 88 08",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Pszczyna",
    "street": "ul. Polne Domy 90",
    "streetNumber": "",
    "postalCode": "43-200",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "JANTEX Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (68) 384 82 63",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Stara Tuchorza",
    "street": "Stara Tuchorza 89",
    "streetNumber": "",
    "postalCode": "64-232",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "MAZURSKIE GRZYBKI Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (89) 621 33 00,fax (89) 621 30 97",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Jedwabno",
    "street": "ul. 1 Maja 35a",
    "streetNumber": "",
    "postalCode": "12-122",
    "description": "Pieczarkarnie",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "DEGA S.A.",
    "category": "bazafirm",
    "phone": "tel. (94) 361 51 00,fax (94) 361 51 05",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Sianów",
    "street": "Karnieszewice 5",
    "streetNumber": "",
    "postalCode": "76-004",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "9512027567",
    "name": "Bogmar Traper Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel./fax (22) 858 99 78,tel. (22) 465 52 32",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Warszawa",
    "street": "ul. Przyczółkowa 227",
    "streetNumber": "",
    "postalCode": "02-962",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5841047882",
    "name": "AJTEL Sp.j. Waldemar Ajtel, Jarosław Ajtel",
    "category": "bazafirm",
    "phone": "tel. (58) 308 07 77",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Gdańsk",
    "street": "ul. Czyżyków 8",
    "streetNumber": "",
    "postalCode": "80-680",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5271185391",
    "name": "C.K.- FISH Wędzarnia Ryb Hanna Cymerman-Kärkkäinen",
    "category": "bazafirm",
    "phone": "tel./fax (22) 789 56 01,kom. 601 414 119 (kontakt j. polski)",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Józefów",
    "street": "ul. Klimatyczna 1c",
    "streetNumber": "",
    "postalCode": "05-420",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8681768159",
    "name": "CONTIMAX S.A.",
    "category": "bazafirm",
    "phone": "tel. +48 14 614 96 20",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Bochnia",
    "street": "ul. Partyzantów 12c",
    "streetNumber": "",
    "postalCode": "32-700",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Kapitan Navi E.Stramek i W.Karpiński Sp.j.",
    "category": "bazafirm",
    "phone": "tel. (91) 387 55 20,fax (91) 387 55 30",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Trzebiatów",
    "street": "ul. Kołobrzeska 26a",
    "streetNumber": "",
    "postalCode": "72-320",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "6520006147",
    "name": "PHP KRYBEX",
    "category": "bazafirm",
    "phone": "tel. (32) 215 89 91,tel. (32) 215 57 68,tel. (32) 214 58 32",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Czechowice-Dziedzice",
    "street": "ul. Łężna 10",
    "streetNumber": "",
    "postalCode": "43-502",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "PHU EDAL Centrala Rybna",
    "category": "bazafirm",
    "phone": "tel. (58) 341 57 25,fax (58) 344 08 26",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Gdańsk",
    "street": "ul. Śląska 66a",
    "streetNumber": "",
    "postalCode": "80-389",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "DORAL Sp.j. P.Chmielewski, R.Kalinowski, J.Sierakowski",
    "category": "bazafirm",
    "phone": "tel. (74) 865 10 20-21,fax (74) 865 10 15",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Kłodzko",
    "street": "ul. Półwiejska 8",
    "streetNumber": "",
    "postalCode": "57-300",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "6721746359",
    "name": "Foodmark Poland Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (94) 351 12 70,fax (94) 351 70 03",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Kołobrzeg",
    "street": "ul. Bałtycka 29",
    "streetNumber": "",
    "postalCode": "78-100",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8510107391",
    "name": "SEAMOR International Ltd Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. 91 433 01 72",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Szczecin",
    "street": "Aleja Wojska Polskiego 197B",
    "streetNumber": "",
    "postalCode": "71-334",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "TRANS-MER Sp.j.",
    "category": "bazafirm",
    "phone": "tel. (42) 716 90 80,fax (42) 716 95 14",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Glinnik",
    "street": "aleja Bukowa 51A",
    "streetNumber": "",
    "postalCode": "95-002",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "CERTA-TRZEBIEŻ Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (91) 424 30 93,fax (91) 424 30 94",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Trzebież",
    "street": "ul. Portowa 1",
    "streetNumber": "",
    "postalCode": "72-020",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "6740003240",
    "name": "ZPUH STEBNICKI",
    "category": "bazafirm",
    "phone": "tel./fax (94) 361 57 12,kom. 695 200 700",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Nowe Worowo",
    "street": "ul. Kolonia 24",
    "streetNumber": "",
    "postalCode": "78-523",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "6790145249",
    "name": "F.H. BIG FISH Sp. z o.o. Sp. komandytowa",
    "category": "bazafirm",
    "phone": "tel. (12) 653 01 39,tel. (12) 653 03 91,fax (12) 376 84 79",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Niepołomice",
    "street": "ul. Mokra 15",
    "streetNumber": "",
    "postalCode": "32-005",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Firma AUGUST Hurtownia Lodów i Mrożonek",
    "category": "bazafirm",
    "phone": "tel./fax (87) 643 34 04,kom. 509 703 600",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Augustów",
    "street": "ul. Tytoniowa 7",
    "streetNumber": "",
    "postalCode": "16-300",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Gospodarstwo Rybackie Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel./fax (87) 610 21 71 Ełk,tel./fax (85) 716 70 24 Knyszyn",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Ełk",
    "street": "ul. 11 Listopada 61",
    "streetNumber": "",
    "postalCode": "19-300",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "JALEK Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (68) 400 00 06,tel. (68) 453 73 98,tel. (68) 451 45 58,tel. (68) 452 30 95",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Zielona Góra",
    "street": "ul. Przylep-Zakładowa 27",
    "streetNumber": "",
    "postalCode": "66-015",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "9291846337",
    "name": "IceQB Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (68) 422 74 90,kom. 531 407 837",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Zielona Góra",
    "street": "ul. Sulechowska 6/1",
    "streetNumber": "",
    "postalCode": "65-119",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8510004076",
    "name": "Canada Trading Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel./fax (91) 434 07 99,tel./fax (91) 434 34 88",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Szczecin",
    "street": "ul. Pobożnego 5",
    "streetNumber": "",
    "postalCode": "70-900",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "7260129792",
    "name": "DAR-POL J.D.P.Kuczyńscy Sp.j.",
    "category": "bazafirm",
    "phone": "tel./fax (42) 716 46 59,tel./fax (42) 659 01 76",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Łódź",
    "street": "ul. Okólna 180",
    "streetNumber": "",
    "postalCode": "91-520",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "DELFIN Przetwórnia i Hurtownia Ryb",
    "category": "bazafirm",
    "phone": "tel. (76) 834 27 03",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Głogów",
    "street": "ul. Tęczowa 40 Ruszowice",
    "streetNumber": "",
    "postalCode": "67-200",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Delfin Sp.j. Kędzior",
    "category": "bazafirm",
    "phone": "tel. (13) 448 20 66,fax (13) 448 31 77",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Jasło",
    "street": "ul. Hutnicza 7",
    "streetNumber": "",
    "postalCode": "38-200",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Delikatesy Rybne KREWETKA",
    "category": "bazafirm",
    "phone": "tel. (58) 556 58 70",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Gdańsk",
    "street": "ul. Pilotów 3",
    "streetNumber": "",
    "postalCode": "80-460",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Delikatesy Rybne RYBEX",
    "category": "bazafirm",
    "phone": "tel. (42) 636 01 43,tel. (42) 654 24 91",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Łódź",
    "street": "ul. Piotrkowska 196",
    "streetNumber": "",
    "postalCode": "90-368",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "7261385793",
    "name": "Delikatesy Rybne",
    "category": "bazafirm",
    "phone": "tel. (42) 633 02 05",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Łódź",
    "street": "ul. Legionów 29",
    "streetNumber": "",
    "postalCode": "91-069",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Delikatesy Rybne Wodny Świat",
    "category": "bazafirm",
    "phone": "tel. (42) 236 16 00",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Łódź",
    "street": "ul. Codzienna 2",
    "streetNumber": "",
    "postalCode": "93-323",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "DNHS POLAND Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (91) 812 31 61,fax (91) 812 31 64",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Szczecin",
    "street": "ul. Celna 1",
    "streetNumber": "",
    "postalCode": "70-644",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "DOS Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (59) 866 22 37,fax (59) 866 29 72,kom. 692 782 163",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Łeba",
    "street": "ul. Kopernika 2",
    "streetNumber": "",
    "postalCode": "84-360",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "DROB-FISH P.H. Sp.j.",
    "category": "bazafirm",
    "phone": "tel. (71) 301 53 29,fax (71) 341 32 92",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Wrocław",
    "street": "ul. Wrocławska 7 Suchy Dwór",
    "streetNumber": "",
    "postalCode": "52-200",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8392783448",
    "name": "Es-Ryb Sławomir Bachul",
    "category": "bazafirm",
    "phone": "kom. 511 735 971",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Ustka",
    "street": "Machowino 14",
    "streetNumber": "",
    "postalCode": "76-270",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "6691005166",
    "name": "Espersen Polska Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (94) 346 20 83",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Koszalin",
    "street": "ul. Mieszka I 29",
    "streetNumber": "",
    "postalCode": "75-124",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Eurofish Poland Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (91) 462 49 00,tel. (91) 462 40 64,tel. (91) 462 46 46,tel. (91) 462 42 49,fax (91) 462 35 55",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Szczecin",
    "street": "ul. Nowy Rynek 2",
    "streetNumber": "",
    "postalCode": "70-533",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Fisch Park RYBOŁÓWKA",
    "category": "bazafirm",
    "phone": "kom. 882 575 757",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Mikołów",
    "street": "ul. Kąty 13",
    "streetNumber": "",
    "postalCode": "43-190",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "FISCHLAND",
    "category": "bazafirm",
    "phone": "tel. (74) 814 75 50,kom. 600 453 127",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Lądek-Zdrój",
    "street": "Trzebieszowice 12",
    "streetNumber": "",
    "postalCode": "57-540",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "FIRMA KORA",
    "category": "bazafirm",
    "phone": "tel. (18) 442 78 02",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Nowy Sącz",
    "street": "ul. Magazynowa 6",
    "streetNumber": "",
    "postalCode": "33-300",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "GADUS Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (58) 663 45 26",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Gdynia",
    "street": "ul. Unruga 111",
    "streetNumber": "",
    "postalCode": "81-153",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Fish Team Marcin Echaust",
    "category": "bazafirm",
    "phone": "kom. 693 710 371",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Trzebież",
    "street": "ul. Plażowa 10a",
    "streetNumber": "",
    "postalCode": "72-020",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "7121851226",
    "name": "FUH Agnieszka Franus-Burzec",
    "category": "bazafirm",
    "phone": "kom. 508 135 554",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Lublin",
    "street": "ul. Braci Wieniawskich 4/60",
    "streetNumber": "",
    "postalCode": "20-844",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Gospodarstwo Rybackie Pstrągarnia, Smażalnia Ryb A. i M.Piszczała",
    "category": "bazafirm",
    "phone": "tel. (34) 327 80 76",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Janów",
    "street": "ul. Kościuszki 100 Złoty Potok",
    "streetNumber": "",
    "postalCode": "42-253",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Gospodarstwo Rybackie w Pogórzu Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel./fax (33) 853 38 07",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Skoczów",
    "street": "ul. Dolne Stawy 4 Pogórze",
    "streetNumber": "",
    "postalCode": "43-430",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Handel i Przewóz Artykułów Spożywczych i Przemysłowych Krzysztof Mosak",
    "category": "bazafirm",
    "phone": "kom. 608 360 372",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Karczew",
    "street": "ul. Generała Władysława Andersa 3/28",
    "streetNumber": "",
    "postalCode": "05-480",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "7822332358",
    "name": "Havelland Express Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (22) 357 81 30",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Warszawa",
    "street": "ul. Waliców 25/17",
    "streetNumber": "",
    "postalCode": "00-865",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5882001859",
    "name": "GRAAL S.A.",
    "category": "bazafirm",
    "phone": "tel. (58) 677 58 20,fax (58) 677 28 43",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Wejherowo",
    "street": "ul. Zachodnia 22",
    "streetNumber": "",
    "postalCode": "84-200",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Gospodarstwo Rybackie w Stobnie",
    "category": "bazafirm",
    "phone": "tel. (67) 216 31 11,kom. 607-664-208,kom. 784 548 191",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Trzcianka",
    "street": "Stobno 118",
    "streetNumber": "",
    "postalCode": "64-980",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Hurtownia F.H.U.P Gniłka",
    "category": "bazafirm",
    "phone": "tel./fax (32) 359 41 73",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Katowice",
    "street": "ul. Obroki 130/2",
    "streetNumber": "",
    "postalCode": "40-833",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8441941977",
    "name": "Hurtownia Ryb FALKO",
    "category": "bazafirm",
    "phone": "kom. 500 299 483,kom. 797 092 528",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Suwałki",
    "street": "ul. Bakałarzewska 38",
    "streetNumber": "",
    "postalCode": "16-400",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8571496642",
    "name": "Hurtownia Ryb i Przetworów Rybnych LAGUNA",
    "category": "bazafirm",
    "phone": "tel./fax (32) 359 41 84,fax (32) 359 41 64",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Katowice",
    "street": "ul. Obroki 130",
    "streetNumber": "",
    "postalCode": "40-833",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8790256760",
    "name": "Hurtownia Ryb FLĄDRA",
    "category": "bazafirm",
    "phone": "tel. (56) 648 60 52,fax (56) 648 42 18",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Toruń",
    "street": "ul. Turystyczna 22",
    "streetNumber": "",
    "postalCode": "87-100",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "PPH HERRING Brygida Stachniuk",
    "category": "bazafirm",
    "phone": "tel. (56) 678 12 09,tel. (56) 678 73 20,tel. (56) 678 73 30,fax (56) 678 73 77",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Cierpice",
    "street": "ul. Przemysłowa 23 Wielka Nieszawka",
    "streetNumber": "",
    "postalCode": "87-165",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Hurtownia Ryb USTRYB Henryk Padewski",
    "category": "bazafirm",
    "phone": "tel. (59) 814 58 78",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Ustka",
    "street": "ul. Westerplatte 38",
    "streetNumber": "",
    "postalCode": "76-270",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Hurtownia Ryb SCAMPI Aleksander Ostrowski",
    "category": "bazafirm",
    "phone": "kom. 514 898 208,tel. (94) 341 15 73",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Mielno",
    "street": "ul. Dworcowa 17",
    "streetNumber": "",
    "postalCode": "76-032",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "7421776339",
    "name": "Hurtownia Ryb Tarpon",
    "category": "bazafirm",
    "phone": "kom. 784 088 246,kom. 662 117 081",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Mrągowo",
    "street": "Nowe Bagienice 16",
    "streetNumber": "",
    "postalCode": "11-700",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "6111004145",
    "name": "Hurtownia Rybna DANA Danuta i Janusz Ciuk",
    "category": "bazafirm",
    "phone": "tel. (75) 754 20 70",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Jelenia Góra",
    "street": "ul. Waryńskiego 10",
    "streetNumber": "",
    "postalCode": "58-500",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "9372167787",
    "name": "IDEA Importer Ryb Świeżych i Mrożonych",
    "category": "bazafirm",
    "phone": "tel. (32) 455 36 23,fax (32) 750 87 70,kom. 668 783 596,kom. 602 122 921",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Wodzisław Śląski",
    "street": "ul. Średnia 1",
    "streetNumber": "",
    "postalCode": "44-300",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Hurtownia Rybna RYBKA S.c.",
    "category": "bazafirm",
    "phone": "tel. (62) 766 87 58",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Kalisz",
    "street": "ul. Częstochowska 211",
    "streetNumber": "",
    "postalCode": "62-800",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "IKRA",
    "category": "bazafirm",
    "phone": "kom. 501 280 663",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Suwałki",
    "street": "ul. Ludwika Michała Paca 1b/29",
    "streetNumber": "",
    "postalCode": "16-400",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "IMPERIAL-KOŁOBRZEG A.Łuczka, ZB.Łuczka Sp.j.",
    "category": "bazafirm",
    "phone": "tel. (94) 351 88 52-54,tel./fax (94) 351 88 51",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Kołobrzeg",
    "street": "ul. Albatrosa 11",
    "streetNumber": "",
    "postalCode": "78-100",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "7393358439",
    "name": "Sklep Rybny WIELORYBEK",
    "category": "bazafirm",
    "phone": "kom. 691 616 109",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Olsztyn",
    "street": "ul. Mazurska 6a",
    "streetNumber": "",
    "postalCode": "10-540",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Hurtownia Rybna MARTA",
    "category": "bazafirm",
    "phone": "tel. (44) 647 04 71",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Piotrków Trybunalski",
    "street": "ul. Fabryczna 1/3",
    "streetNumber": "",
    "postalCode": "97-300",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Sklepy Rybne i Smażalnia Krewetka Krzysztof Osiński",
    "category": "bazafirm",
    "phone": "tel. (32) 415 22 32",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Racibórz",
    "street": "ul. Zborowa 5a/11",
    "streetNumber": "",
    "postalCode": "47-400",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Smażalnia i Sklep Rybny Alerybka",
    "category": "bazafirm",
    "phone": "tel. (32) 453 98 17,kom. 502 774 010",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Wodzisław Śląski",
    "street": "ul. Średnia 1",
    "streetNumber": "",
    "postalCode": "44-300",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Smażalnia Ryb i Sklep Rybny IMPULS",
    "category": "bazafirm",
    "phone": "tel. (74) 866 47 50",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Kudowa-Zdrój",
    "street": "ul. Słoneczna 11a",
    "streetNumber": "",
    "postalCode": "57-350",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "6112116260",
    "name": "Sklep Rybny ZDROWA RYBKA",
    "category": "bazafirm",
    "phone": "tel. (75) 718 27 91",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Kowary",
    "street": "ul. 1 Maja 37",
    "streetNumber": "",
    "postalCode": "58-530",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Smażalnia Ryb U ANDRZEJA",
    "category": "bazafirm",
    "phone": "kom. 693 828 350",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Kudowa-Zdrój",
    "street": "ul. Okrzei 19",
    "streetNumber": "",
    "postalCode": "57-350",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Smażalnia Ryb U MIRKA",
    "category": "bazafirm",
    "phone": "kom. 604 647 813,kom. 602 181 133,fax (94) 351 71 71",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Kołobrzeg",
    "street": "ul. Morska 4/8",
    "streetNumber": "",
    "postalCode": "78-100",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Smażalnia Ryb w Pluskach",
    "category": "bazafirm",
    "phone": "kom. 605 224 478,kom. 532 542 822",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Stawiguda",
    "street": "ul. Jeziorna 48/1 Pluski",
    "streetNumber": "",
    "postalCode": "11-034",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "6940007426",
    "name": "Spółka Rybacka NIEDŹWIEDZICE Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel./fax (76) 818 83 91,kom. 604 688 695,tel. (76) 818 82 51,tel. (76) 818 82 41",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Chojnów",
    "street": "Goliszów 92a",
    "streetNumber": "",
    "postalCode": "59-225",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Stanpol Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (59) 848 29 60,tel. (59) 843 18 67,fax (59) 843 18 68",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Słupsk",
    "street": "aleja 3 Maja 44",
    "streetNumber": "",
    "postalCode": "76-200",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Smażalnia Ryb Złoty Lin",
    "category": "bazafirm",
    "phone": "tel. (89) 641 12 64",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Stare Jabłonki",
    "street": "ul. Olsztyńska 1",
    "streetNumber": "",
    "postalCode": "14-133",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "SoNa Sp. z o.o. Przetwórstwo Rybne",
    "category": "bazafirm",
    "phone": "tel. (34) 314 24 35 centrala,fax (34) 314 22 22",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Koziegłowy",
    "street": "ul. Myszkowska 25 Koziegłówki",
    "streetNumber": "",
    "postalCode": "42-350",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Stormbringer Tomasz Ryłko",
    "category": "bazafirm",
    "phone": "kom. 538 478 726",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Chwaszczyno",
    "street": "ul. Oliwska 152",
    "streetNumber": "",
    "postalCode": "80-209",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5432025328",
    "name": "Suempol Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (85) 730 60 24,fax (85) 730 60 26",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Bielsk Podlaski",
    "street": "ul. Białostocka 69a",
    "streetNumber": "",
    "postalCode": "17-100",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "SuperFish S.A.",
    "category": "bazafirm",
    "phone": "tel. (94) 351 52 69,fax (94) 351 53 26",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Ustronie Morskie",
    "street": "Kukinia 43",
    "streetNumber": "",
    "postalCode": "78-111",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5891433127",
    "name": "SULMIN Borkowski Sp.j.",
    "category": "bazafirm",
    "phone": "tel./fax (58) 681 88 00,tel. (58) 685 71 72,tel. (58) 685 15 62",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Przyjaźń",
    "street": "Sulmin 6",
    "streetNumber": "",
    "postalCode": "83-331",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Ternaeben-PL Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (59) 866 42 50,tel. (59) 866 42 77,fax (59) 866 42 52",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Łeba",
    "street": "ul. Wspólna 3",
    "streetNumber": "",
    "postalCode": "84-360",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "6762292688",
    "name": "Tesoro del Mar",
    "category": "bazafirm",
    "phone": "tel. (12) 425 93 63,fax (12) 425 88 59",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Kraków",
    "street": "ul. Łowińskiego 2",
    "streetNumber": "",
    "postalCode": "31-752",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "7821413480",
    "name": "TĘCZOWY PSTRĄG",
    "category": "bazafirm",
    "phone": "tel./fax (61) 874 91 20,tel./fax (61) 639 07 66",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Poznań",
    "street": "osiedle Rusa 34a",
    "streetNumber": "",
    "postalCode": "61-245",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "PPH PIRS Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (94) 314 24 69,tel. (94) 314 53 63,tel./fax (94) 314 22 42",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Darłowo",
    "street": "ul. Conrada 1",
    "streetNumber": "",
    "postalCode": "76-150",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "PPUH MARK M. i K.Szczęsny Sp.j.",
    "category": "bazafirm",
    "phone": "tel. (48) 320 21 18,fax (48) 320 28 10",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Gózd",
    "street": "ul. Radomska 43",
    "streetNumber": "",
    "postalCode": "26-634",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "6391809067",
    "name": "PROFISH Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (32) 415 20 24,fax (32) 419 91 21",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Racibórz",
    "street": "ul. Starowiejska 131",
    "streetNumber": "",
    "postalCode": "47-400",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "6920001840",
    "name": "Przedsiębiorstwo Produkcji Handlu i Usług Gospodarstwo Rybackie Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel./fax (76) 844 81 25,tel./fax (76) 844 82 30",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Miłoradzice",
    "street": "Raszowa Mała 1",
    "streetNumber": "",
    "postalCode": "59-323",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5871523318",
    "name": "Przedsiębiorstwo Handlowe KORYB W.Kołodziejski &amp; I.Stabrowska-Wysocka Sp.j.",
    "category": "bazafirm",
    "phone": "tel. (58) 673 45 69,fax (58) 774 77 05",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Puck",
    "street": "ul. Zamkowa 20",
    "streetNumber": "",
    "postalCode": "84-100",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Przetwórstwo Ryb PIĄTEK Sp.j.",
    "category": "bazafirm",
    "phone": "tel. (68) 384 83 60,fax (68) 384 80 04",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Siedlec",
    "street": "ul. Piaskowa 12",
    "streetNumber": "",
    "postalCode": "64-212",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5870004740",
    "name": "Przedsiębiorstwo Produkcyjno-Handlowo-Usługowe BMC Jerzy Szczepankowski",
    "category": "bazafirm",
    "phone": "tel. (58) 674 02 06,tel. (58) 774 56 56,fax (58) 674 09 35",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Władysławowo",
    "street": "ul. Przemysłowa 14",
    "streetNumber": "",
    "postalCode": "84-120",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8392656721",
    "name": "Przetwórstwo Rybne ŁOSOŚ Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (59) 847 27 00-03,tel./fax (59) 847 27 04",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Słupsk",
    "street": "Włynkówko 49b",
    "streetNumber": "",
    "postalCode": "76-202",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Przetwórstwo Ryb Produkcyjne MORS W.B.Michalak Sp.j.",
    "category": "bazafirm",
    "phone": "tel. (59) 847 13 66,fax (59) 847 13 92",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Słupsk",
    "street": "Bydlino 20e",
    "streetNumber": "",
    "postalCode": "76-200",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Rybhand Sp. z o.o. Sp.komandytowa",
    "category": "bazafirm",
    "phone": "tel. (62) 747 32 38,tel. (62) 747 66 39,fax (62) 747 66 38",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Jarocin",
    "street": "ul. Świętego Ducha 118/120",
    "streetNumber": "",
    "postalCode": "63-200",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "REKIN Sp.j.",
    "category": "bazafirm",
    "phone": "tel. (85) 745 47 57,fax (85) 742 04 32",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Białystok",
    "street": "ul. Handlowa 5",
    "streetNumber": "",
    "postalCode": "15-399",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5270025544",
    "name": "Sea Foods Poland Ltd. Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel./fax (22) 632 99 29,tel./fax (22) 631 33 00,tel. (22) 632 82 98",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Warszawa",
    "street": "ul. Okopowa 29b",
    "streetNumber": "",
    "postalCode": "01-059",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Ryby Zubowicz",
    "category": "bazafirm",
    "phone": "kom. 513 231 013",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Kamień Pomorski",
    "street": "ul. Kilińskiego 8/2",
    "streetNumber": "",
    "postalCode": "72-400",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Sklep Rybno-Spożywczy Halibut Zdzisława Błaszkowska",
    "category": "bazafirm",
    "phone": "kom. 663 025 487",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Piotrków Trybunalski",
    "street": "ul. Kostromska 27",
    "streetNumber": "",
    "postalCode": "97-300",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Rybak S.A.",
    "category": "bazafirm",
    "phone": "tel. (94) 351 11 73,tel./fax (94) 358 83 27",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Siemyśl",
    "street": "Unieradz 3",
    "streetNumber": "",
    "postalCode": "78-123",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Sklep Rybny RYBKA",
    "category": "bazafirm",
    "phone": "tel. (58) 343 45 10,tel./fax (58) 340 45 27,kom. 601 641 200",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Gdańsk",
    "street": "ul. Gen.J.Hallera 233",
    "streetNumber": "",
    "postalCode": "80-502",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5860102990",
    "name": "SEKO S.A.",
    "category": "bazafirm",
    "phone": "tel. (52) 510 81 40,fax (52) 396 73 51",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Chojnice",
    "street": "ul. Zakładowa 3",
    "streetNumber": "",
    "postalCode": "89-620",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "9570763432",
    "name": "Morex Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (58) 340 00 49,fax (58) 345 58 16",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Gdańsk",
    "street": "Ul. Grunwaldzka 82",
    "streetNumber": "",
    "postalCode": "80-244",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Meduza Hurtownia Rybna",
    "category": "bazafirm",
    "phone": "tel. (22) 893 81 91,tel. (22) 893 83 18,fax (22) 612 70 83",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Warszawa",
    "street": "ul. Wał Miedzeszyński 201",
    "streetNumber": "",
    "postalCode": "04-987",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Sklep Rybny Smażalnia i Wędzarnia",
    "category": "bazafirm",
    "phone": "kom. 696 565 656,kom. 662 888 188",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Szczytno",
    "street": "ul. Żwirki i Wigury 1",
    "streetNumber": "",
    "postalCode": "12-100",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Nord Capital Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (58) 625 75 00,fax (58) 625 75 07",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Połchowo",
    "street": "ul. Pucka 4 Rekowo Górne",
    "streetNumber": "",
    "postalCode": "84-123",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "P.H.U. KOMERS-MAG Sp.j.",
    "category": "bazafirm",
    "phone": "tel. (33) 815 56 86,tel. (33) 815 62 77-78,fax (33) 815 57 88",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Międzyrzecze Dolne",
    "street": "Międzyrzecze Dolne 178",
    "streetNumber": "",
    "postalCode": "43-392",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "NORDFISH-FOODMARK Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (94) 358 20 91,fax (94) 358 21 64",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Charzyno",
    "street": "ul. Szkolna 60",
    "streetNumber": "",
    "postalCode": "78-122",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "P.H.U.P. FENICJA",
    "category": "bazafirm",
    "phone": "tel. (61) 425 19 75,fax (61) 428 10 20,kom. 603 871 741",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Gniezno",
    "street": "Aleje Reymonta 26",
    "streetNumber": "",
    "postalCode": "62-200",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5833096920",
    "name": "Pescadero Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (58) 746 35 97",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Gdynia",
    "street": "ul. Hryniewickiego 10",
    "streetNumber": "",
    "postalCode": "81-340",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8481021415",
    "name": "P.W. DORYB",
    "category": "bazafirm",
    "phone": "tel./fax (87) 621 68 68,tel. (87) 621 59 12",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Ełk",
    "street": "ul. Podmiejska 2a",
    "streetNumber": "",
    "postalCode": "19-300",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "P.W. WALDI I Sp. z o.o. Sp.komandytowa",
    "category": "bazafirm",
    "phone": "tel./fax (65) 511 98 75,tel./fax (65) 512 27 80,kom. 601 930 345,kom. 601 779 741",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Kościan",
    "street": "ul. Ignacego Krasickiego 15",
    "streetNumber": "",
    "postalCode": "64-000",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5420301053",
    "name": "Nordfish Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (85) 744 38 02,fax (85) 746 67 94",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Białystok",
    "street": "ul. Handlowa 6d",
    "streetNumber": "",
    "postalCode": "15-399",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8510109585",
    "name": "PESCANOVA Polska Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (91) 462 34 60,tel. (91) 812 77 67,fax (91) 462 43 46",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Szczecin",
    "street": "ul. Św.Ducha 5a/9",
    "streetNumber": "",
    "postalCode": "70-205",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Petropat Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (89) 741 08 79,fax (89) 741 17 31",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Mrągowo",
    "street": "ul. Młodkowskiego 21",
    "streetNumber": "",
    "postalCode": "11-700",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "PHU BASIA Sp.j.",
    "category": "bazafirm",
    "phone": "tel./fax (42) 617 26 78,tel. (42) 617 26 76,tel. (42) 617 22 51",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Łódź",
    "street": "ul. Brzezińska 56",
    "streetNumber": "",
    "postalCode": "92-111",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "PHU ELMAR Lesiuk Sp.j.",
    "category": "bazafirm",
    "phone": "tel./fax (83) 343 98 11,tel./fax (83) 342 53 44",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Biała Podlaska",
    "street": "ul. Handlowa 4",
    "streetNumber": "",
    "postalCode": "21-500",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5470044322",
    "name": "PHU MARTINEK",
    "category": "bazafirm",
    "phone": "tel. (33) 815 76 15,tel. (33) 815 76 25-26,tel. (33) 810 48 37,fax (33) 810 54 06",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Bielsko-Biała",
    "street": "ul. Katowicka 68",
    "streetNumber": "",
    "postalCode": "43-346",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "POL-RYB",
    "category": "bazafirm",
    "phone": "kom. 509 124 800",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Czarnocin",
    "street": "Dalków 162",
    "streetNumber": "",
    "postalCode": "97-318",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "9581328912",
    "name": "PPH MORFISH Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (59) 815 20 56",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Gdynia",
    "street": "ul. Wiklinowa 7/16",
    "streetNumber": "",
    "postalCode": "81-122",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "6690503850",
    "name": "Pommernfisch Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (94) 311 50 41,fax (94) 311 50 71",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Tychowo",
    "street": "ul. Słowackiego 1",
    "streetNumber": "",
    "postalCode": "78-220",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Polska Grupa Rybna Sp. z o.o. Sp.komandytowa",
    "category": "bazafirm",
    "phone": "kom. 790 879 333",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Nowy Sącz",
    "street": "ul. Nawojowska 160",
    "streetNumber": "",
    "postalCode": "33-300",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8761540582",
    "name": "PHU SUKCES",
    "category": "bazafirm",
    "phone": "tel./fax (56) 464 13 99",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Grudziądz",
    "street": "ul. Łużycka 9",
    "streetNumber": "",
    "postalCode": "86-300",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "IMPEXRYB Sp.j. Halina Korkuć",
    "category": "bazafirm",
    "phone": "tel. (91) 487 12 04,tel. (91) 487 27 51,tel. (91) 487 29 18,tel./fax (91) 487 71 78",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Szczecin",
    "street": "ul. Kapitańska 4/2",
    "streetNumber": "",
    "postalCode": "71-602",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Interfood Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (58) 661 32 30,fax (58) 620 75 51",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Sopot",
    "street": "ul. Sobieskiego 35/9a",
    "streetNumber": "",
    "postalCode": "81-781",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8561354544",
    "name": "Internetowy Sklep Rybny irybka.pl",
    "category": "bazafirm",
    "phone": "kom. 664 130 164",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Nowogard",
    "street": "ul. Bohaterów Warszawy 1a",
    "streetNumber": "",
    "postalCode": "72-200",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "J&amp;J Szewczyk",
    "category": "bazafirm",
    "phone": "tel. (22) 462 36 98,tel./fax (22) 462 36 99",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Sulejówek",
    "street": "ul. Kombatantów 130",
    "streetNumber": "",
    "postalCode": "05-070",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "7390104796",
    "name": "INPOL",
    "category": "bazafirm",
    "phone": "tel./fax (89) 527 92 58",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Olsztyn",
    "street": "ul. Dąbrowszczaków 8/9b/1",
    "streetNumber": "",
    "postalCode": "10-539",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "KALMAR Dystrybucja Ryb i Logistyka Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (12) 419 55 00,fax (12) 419 55 05,kom. 693 073 883",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Zielonki",
    "street": "ul. Krakowskie Przedmieście 372 Trojanowice",
    "streetNumber": "",
    "postalCode": "32-087",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "KRYMAR",
    "category": "bazafirm",
    "phone": "tel. (22) 722 05 05,fax (22) 733 11 69",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Warszawa",
    "street": "ul. Marywilska 26",
    "streetNumber": "",
    "postalCode": "03-228",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5870200808",
    "name": "JANTAR Ltd Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (58) 673 82 21,tel. (58) 673 82 67,fax (58) 673 82 68,kom. 601 087 692",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Puck",
    "street": "Zdrada 9",
    "streetNumber": "",
    "postalCode": "84-100",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "La Maree Vins",
    "category": "bazafirm",
    "phone": "kom. 507 207 101",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Warszawa",
    "street": "ul. Hołówki 3",
    "streetNumber": "",
    "postalCode": "00-749",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "LAPS Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (17) 862 93 33,tel. (17) 861 16 43,kom. 604 406 880",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Rzeszów",
    "street": "ul. Trembeckiego 11",
    "streetNumber": "",
    "postalCode": "35-234",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "7790051655",
    "name": "KOVIAN-GROUP Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (25) 640 71 10,tel./fax (25) 640 71 11",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Siedlce",
    "street": "ul. Składowa 27/31",
    "streetNumber": "",
    "postalCode": "08-110",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5830019847",
    "name": "KORAL S.A.",
    "category": "bazafirm",
    "phone": "tel. (58) 531 32 77,fax (58) 531 75 58",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Tczew",
    "street": "ul. Za Dworcem 13",
    "streetNumber": "",
    "postalCode": "83-110",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "LIMITO S.A.",
    "category": "bazafirm",
    "phone": "tel. (58) 352 62 62,fax (58) 672 34 67",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Grudziądz",
    "street": "ul. Droga Graniczna 21",
    "streetNumber": "",
    "postalCode": "86-300",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "9230024807",
    "name": "Lisner Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (61) 849 55 01,fax (61) 849 55 62",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Poznań",
    "street": "ul. Strzeszyńska 38/42",
    "streetNumber": "",
    "postalCode": "60-479",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Mare Foods Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (91) 312 13 00,fax (91) 317 68 55",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Goleniów",
    "street": "ul. Granitowa 14 Łozienica",
    "streetNumber": "",
    "postalCode": "72-100",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "MAZURSKIE RYBY S.c.",
    "category": "bazafirm",
    "phone": "tel./fax (89) 767 00 21",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Lidzbark Warmiński",
    "street": "Markajmy 43",
    "streetNumber": "",
    "postalCode": "11-100",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8520701196",
    "name": "McLean Brothers Poland Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (91) 469 33 77,fax (91) 469 06 84",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Szczecin",
    "street": "ul. Potok 15",
    "streetNumber": "",
    "postalCode": "70-813",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "F.H.P. KOZA",
    "category": "bazafirm",
    "phone": "tel. (32) 286 49 67,tel./fax (32) 286 30 40",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Bytom",
    "street": "ul. Daleka 27",
    "streetNumber": "",
    "postalCode": "41-923",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Koga Maris Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (58) 675 03 36,fax (58) 675 03 84",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Hel",
    "street": "Port Rybacki",
    "streetNumber": "",
    "postalCode": "84-150",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "6821653999",
    "name": "Małopolskie Centrum Dystrybucji Armapol Ewa Przebinda i Sara Przebinda Sp.j.",
    "category": "bazafirm",
    "phone": "kom. 693 670 052,kom. 603 531 234",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Iwanowice",
    "street": "Poskwitów 136a",
    "streetNumber": "",
    "postalCode": "32-095",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "FARIO Sp.j.",
    "category": "bazafirm",
    "phone": "tel. (59) 846 35 89,fax (59) 846 36 30,kom. 606 284 033",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Potęgowo",
    "street": "Żochowo 19/1",
    "streetNumber": "",
    "postalCode": "76-230",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "8511015461",
    "name": "LUX FISH Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel./fax (91) 462 42 48",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Szczecin",
    "street": "ul. Celna 2",
    "streetNumber": "",
    "postalCode": "70-644",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Gospodarstwo Rybackie PRZYBORÓW",
    "category": "bazafirm",
    "phone": "tel. (14) 684 74 00,fax (14) 684 70 30",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Szczepanów",
    "street": "Przyborów 62",
    "streetNumber": "",
    "postalCode": "32-823",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "GIANA Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (22) 715 36 81,fax (22) 715 36 80",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Piaseczno",
    "street": "ul. Nowa 23/215",
    "streetNumber": "",
    "postalCode": "05-500",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Gospodarstwo Rybackie DADOŃ",
    "category": "bazafirm",
    "phone": "tel./fax (94) 318 58 02,tel./fax (94) 317 14 15",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Sianów",
    "street": "ul. Strzelecka 12",
    "streetNumber": "",
    "postalCode": "76-004",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Gospodarstwo Rybackie PSTRĄG TARNOWO Ziemowit Pirtań",
    "category": "bazafirm",
    "phone": "tel. (67) 216 02 36,fax (67) 216 02 39,kom. 602 503 256,kom. 602 660 458",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Piła",
    "street": "Tarnowo 16",
    "streetNumber": "",
    "postalCode": "64-930",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "MEGA Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel./fax (89) 741 17 28,tel. (89) 741 17 29",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Mrągowo",
    "street": "ul. Marii Curie-Skłodowskiej 5",
    "streetNumber": "",
    "postalCode": "11-700",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "PAULA FISH Sp.j. Sławomir Gojdź",
    "category": "bazafirm",
    "phone": "tel. (59) 848 92 34,tel. (59) 848 92 16",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Słupsk",
    "street": "ul. Braci Staniuków 18",
    "streetNumber": "",
    "postalCode": "76-200",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "PERFECTA TRADE Sp. z o.o.",
    "category": "bazafirm",
    "phone": "kom. 665 412 411,tel. (12) 665 00 88,fax (12) 376 88 83",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Modlnica",
    "street": "ul. Ulubiona 9",
    "streetNumber": "",
    "postalCode": "32-085",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "TUNA Sp. z o.o.",
    "category": "bazafirm",
    "phone": "kom. 690 956 560,kom. 791 23 93 85",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Kraków",
    "street": "ul. Na Zakolu Wisły 10",
    "streetNumber": "",
    "postalCode": "30-729",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "PHU Lod-Kot S.c.",
    "category": "bazafirm",
    "phone": "tel. (74) 867 60 71,fax (74) 867 60 70",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Kłodzko",
    "street": "ul. Wyspiańskiego 69",
    "streetNumber": "",
    "postalCode": "57-300",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "TINCA NOVA",
    "category": "bazafirm",
    "phone": "tel. (32) 453 21 47",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Pszów",
    "street": "ul. Żużlowa 55",
    "streetNumber": "",
    "postalCode": "44-370",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "9581257626",
    "name": "TRYLSKI SEAFOOD Andrzej Trylski",
    "category": "bazafirm",
    "phone": "kom. 510 166 785",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Reda",
    "street": "ul. Olchowa 4h",
    "streetNumber": "",
    "postalCode": "84-240",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "4990236501",
    "name": "Wędzarnia i Smażalnia Ryb PIRAT Witold Płoszaj",
    "category": "bazafirm",
    "phone": "kom. 506 915 960,kom. 505 126 800",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Mielno",
    "street": "ul. Rybacka 10",
    "streetNumber": "",
    "postalCode": "75-032",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Wędzarnia Ryb SIAN-RYB",
    "category": "bazafirm",
    "phone": "kom. 602 710 573,kom. 668 935 119",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Sianów",
    "street": "ul. Strzelecka 11a",
    "streetNumber": "",
    "postalCode": "76-004",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "WARZYWKO Hurtownia Warzyw i Owoców",
    "category": "bazafirm",
    "phone": "tel./fax (91) 460 00 06,kom. 501 429 271",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Szczecin",
    "street": "ul. Letnia 12",
    "streetNumber": "",
    "postalCode": "70-813",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "UNIFOOD",
    "category": "bazafirm",
    "phone": "tel./fax (91) 462 49 02,tel./fax (91) 462 33 92",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Szczecin",
    "street": "ul. Celna 1/117",
    "streetNumber": "",
    "postalCode": "70-644",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Zakład Produkcyjno-Handlowy ZPH SOL-FISH Sp.j. Waldemar Kaczmarek, Jacek Kryński",
    "category": "bazafirm",
    "phone": "tel. (95) 748 20 50,tel./fax (95) 748 20 59",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Międzychód",
    "street": "ul. Chrobrego 28",
    "streetNumber": "",
    "postalCode": "64-400",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Wędzarnia Ryb-Tradycyjna ZŁOTA PODKOWA",
    "category": "bazafirm",
    "phone": "tel. (59) 814 49 68",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Ustka",
    "street": "ul. Marynarki Polskiej 3",
    "streetNumber": "",
    "postalCode": "76-270",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Zakład Przetwórstwa Mięsno-Rybnego KARI",
    "category": "bazafirm",
    "phone": "tel. (75) 741 02 61-62,fax (75) 741 01 01,fax (75) 741 09 49",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Marciszów",
    "street": "ul. Piekarska 1",
    "streetNumber": "",
    "postalCode": "58-410",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Wędzenie Ryb, Handel i Przetwórstwo Rybne Wojciech Wojciul",
    "category": "bazafirm",
    "phone": "tel. (87) 427 82 76",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Budry",
    "street": "Grądy Węgorzewskie 12",
    "streetNumber": "",
    "postalCode": "11-606",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Wędzenie i Przetwórstwo Ryb RAFA Sp.j.",
    "category": "bazafirm",
    "phone": "tel. (58) 674 11 42,kom. 600 901 964",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Władysławowo",
    "street": "ul. Skandynawska 14",
    "streetNumber": "",
    "postalCode": "84-120",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "WIK-MAR Wiktor Walczak",
    "category": "bazafirm",
    "phone": "tel./fax (62) 733 33 10,kom. 609 929 555,kom. 607 192 270",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Odolanów",
    "street": "Huta 172",
    "streetNumber": "",
    "postalCode": "63-430",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Zakład Przetwórstwa Ryb MIRKO Bogusław Krasnoborski Sp.j.",
    "category": "bazafirm",
    "phone": "tel. (59) 847 17 20,fax (59) 841 37 24",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Słupsk",
    "street": "Głobino 73",
    "streetNumber": "",
    "postalCode": "76-200",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Zakład Produkcyjno Handlowy DARPOL M.Omylak, Z.Piątkowski Sp.j.",
    "category": "bazafirm",
    "phone": "tel. (94) 314 40 95,fax (94) 315 56 03,kom. 601 997 618",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Darłowo",
    "street": "Barzowice 8a",
    "streetNumber": "",
    "postalCode": "76-150",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Zakład Przetwórstwa Rybnego LARUS",
    "category": "bazafirm",
    "phone": "tel. (62) 740 80 19,tel. (62) 740 80 77,fax (62) 740 81 16",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Jaraczewo",
    "street": "ul. Jarocińska 3",
    "streetNumber": "",
    "postalCode": "63-233",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "AGRO-SZCZUPAK",
    "category": "bazafirm",
    "phone": "tel. (59) 857 33 56,tel. (59) 858 35 26,kom. 601 714 522",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Miastko",
    "street": "Przęsin 26b/3",
    "streetNumber": "",
    "postalCode": "77-200",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "7122306086",
    "name": "PUBLIMAR Centrum Dystrybucji Mięsa i Wędlin Sp.j.",
    "category": "bazafirm",
    "phone": "tel. (81) 747 12 84,fax (81) 742 19 43",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Lublin",
    "street": "ul. Związkowa 10",
    "streetNumber": "",
    "postalCode": "20-148",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Bar Rybny",
    "category": "bazafirm",
    "phone": "tel. (17) 863 24 49,tel. (17) 786 30 07",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Rzeszów",
    "street": "ul. Okulickiego 15a",
    "streetNumber": "",
    "postalCode": "35-322",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "conSup Polska Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (68) 356 60 60,tel. (68) 356 60 66",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Sława",
    "street": "Wróblów 38",
    "streetNumber": "",
    "postalCode": "67-410",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "6721571836",
    "name": "SOLAR Zakład Przetwórstwa Spożywczego Sp.j.",
    "category": "bazafirm",
    "phone": "tel. (94) 365 23 38,tel. (94) 365 59 92,tel. (94) 365 01 92",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Świdwin",
    "street": "ul. Polna 10",
    "streetNumber": "",
    "postalCode": "78-300",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Zakład Wielobranżowy MARTA Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (32) 623 24 86,fax (32) 624 07 00,kom. 601 418 345",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Chrzanów",
    "street": "ul. Stara Huta 5",
    "streetNumber": "",
    "postalCode": "32-500",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "7393868525",
    "name": "Sklep Rybny Zatorzanka",
    "category": "bazafirm",
    "phone": "kom. 502 219 632",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Olsztyn",
    "street": "ul. Kolejowa 13",
    "streetNumber": "",
    "postalCode": "11-041",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5861986904",
    "name": "AAKERMAN Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (58) 690 69 00,fax (58) 690 69 01",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Gdynia",
    "street": "ul. Władysława IV 43",
    "streetNumber": "",
    "postalCode": "81-395",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "9471998439",
    "name": "ZYGA Group S.c.",
    "category": "bazafirm",
    "phone": "kom. 505 135 370,kom. 502 566 944",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Zgierz",
    "street": "ul. Podgórna 2a",
    "streetNumber": "",
    "postalCode": "95-100",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5540240905",
    "name": "ABRAMCZYK Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel./fax (52) 344 56 77",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Bydgoszcz",
    "street": "ul. Witebska 63",
    "streetNumber": "",
    "postalCode": "85-778",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "ADMIRAŁ Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel./fax (32) 216 65 29,tel. (32) 216 79 48,tel. (32) 750 50 47,kom. 660 681 764",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Lędziny",
    "street": "ul. Pokoju 20",
    "streetNumber": "",
    "postalCode": "43-143",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "AjexPol Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (34) 360 80 17,tel. (34) 360 87 15,tel. (34) 360 81 68,tel./fax (34) 363 83 83,kom. 504 280 376",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Częstochowa",
    "street": "ul. Gazowa 14",
    "streetNumber": "",
    "postalCode": "42-202",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "AKWEN Hurtownia Ryb",
    "category": "bazafirm",
    "phone": "tel. (85) 664 10 41,tel. (85) 664 10 61,fax (85) 734 11 41,kom. 608 313 868",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Białystok",
    "street": "ul. Tkacka 9",
    "streetNumber": "",
    "postalCode": "15-689",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5891006537",
    "name": "ALMAR Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (58) 681 13 80,fax (58) 681 47 93,tel. (58) 681 32 55",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Kartuzy",
    "street": "ul. Kościerska 2",
    "streetNumber": "",
    "postalCode": "83-300",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "5831017187",
    "name": "BALT-RYB",
    "category": "bazafirm",
    "phone": "tel./fax (58) 308 05 11",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Gdańsk",
    "street": "ul. Boguckiego 83",
    "streetNumber": "",
    "postalCode": "80-690",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "Atlantex Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (22) 840 89 20,fax (22) 840 89 22",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Warszawa",
    "street": "ul. Parkowa 13/17/123",
    "streetNumber": "",
    "postalCode": "00-759",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "AKWEN II Wojciech Kamiński",
    "category": "bazafirm",
    "phone": "tel. (22) 786 65 39,tel. (22) 771 69 40",
    "email": "",
    "consumption": "",
    "owner": "aleksander.kruk",
    "city": "Marki",
    "street": "ul. Ciurlionisa 4",
    "streetNumber": "",
    "postalCode": "05-270",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "AWARYB Wędzarnia Ryb",
    "category": "bazafirm",
    "phone": "tel. (91) 424 13 75",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Trzebież",
    "street": "ul. Kościuszki 17",
    "streetNumber": "",
    "postalCode": "72-020",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "BALTIC SEAFOOD",
    "category": "bazafirm",
    "phone": "tel. (58) 699 12 33-34,fax (58) 699 12 35,kom. 601 333 526",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Gdynia",
    "street": "ul. Hutnicza 3",
    "streetNumber": "",
    "postalCode": "81-212",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "BALTIMER Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel./fax (59) 810 71 96,kom. 518 257 496,kom. 602 784 183,kom. 604 100 015",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Sławno",
    "street": "ul. Gdańska 46",
    "streetNumber": "",
    "postalCode": "76-100",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "BARKAS Sp.j. E.Świderek, G. Świderek, A.Skorupińska",
    "category": "bazafirm",
    "phone": "tel. (94) 354 38 26",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Kołobrzeg",
    "street": "Obroty 3a",
    "streetNumber": "",
    "postalCode": "78-100",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "9542259213",
    "name": "BIG FISH Sp. z o.o.",
    "category": "bazafirm",
    "phone": "tel. (32) 326 75 29",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Lędziny",
    "street": "ul. Pokoju 5",
    "streetNumber": "",
    "postalCode": "43-143",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "7393452931",
    "name": "BLACK FISH Sp.j.",
    "category": "bazafirm",
    "phone": "tel./fax (89) 533 11 11",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Olsztyn",
    "street": "ul. Hugona Kołłątaja 19",
    "streetNumber": "",
    "postalCode": "10-034",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}, {
    "id": "",
    "name": "BP TRADING Sp. z o.o.",
    "category": "bazafirm",
    "phone": "kom. 516 515 917,kom. 505 312 364",
    "email": "",
    "consumption": "",
    "owner": "oleksii.tsymbaliuk",
    "city": "Gdańsk",
    "street": "ul. Orzechowa 5",
    "streetNumber": "",
    "postalCode": "80-175",
    "description": "Ryby / Mrożonki",
    "tasks": [],
    "status": "potencjalny"
}]




// koniec baza do dodania




//dodawanie klientów hurt

router.get('/add-client-mass/', async (req, res, next) => {
    let numberIndex = 0;
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
            tasks
        } = client;

        await clientsready.find({}, (err, data) => {
            if (err) console.log(err);
            clients = data;
        }).then(async (data) => {
            if (id !== '') {
                const isClientInDb = data.findIndex(client => client.id == id);
                if (isClientInDb >= 0) return console.log('taki nip jest już w bazie');
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
                    status
                });
                await newClient.save()
                    .then(() => {
                        numberIndex++
                        console.log(`dodano ${numberIndex}`)
                    })
                    .catch(err => console.log(err));
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
                    status
                });
                await newClient.save()
                    .then(() => {
                        numberIndex++
                        console.log(`dodano ${numberIndex}`)
                    })
                    .catch(err => console.log(err));
            }



        })


    })
})



// koniec dodawanie klientów hurt





module.exports = router;