const dotenv = require('dotenv').config()
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
        console.log(process.env.MAIL_HOST)
        console.log(process.env.MAIL_PORT)
        console.log(process.env.MAIL_USER)
        console.log(process.env.MAIL_PASSWORD)
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
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

const baseToAdd = [{
        "id": "",
        "name": "Cocktailbar Manhattan w Wyszkowie zatrudni Barmana zmianowego",
        "category": "olx",
        "phone": "602340240",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Cocktailbar Manhattan zatrudni Barmana Zmianowego \n\nOferta skierowana do osób pełnoletnich.\n\nPoszukujemy osób do pracy na stanowisko Barman/ kelner\n\nPraca na stałe - pełen etat.\n\nJak również na same weekendy (piątek - niedziela)\n\nSzczegółach i wynagrodzenie omawiamy podczas rozmowy z kandydatami.\n\nPoszukujemy osoby z doświadczeniem .Jeśli jednak nie jesteś doświadczony - przeszkolimy Cię\n\nOczekujemy podstawowej wiedzy z zakresu alkoholi i koktailji klasycznych.\n\nProfesjonalnego podejścia do pracy i powierzonych zadań.\n\nWysokiej jakości serwisu i szeroko rozumianej gościnności .\n\nPozytywnego nastawienia i usposobienia .\n\nOdporności na stres i pracę w godzinach nocnych.\n\nOsoby zainteresowane prosimy o przesyłanie CV ze zdjęciem jako odpowiedź na to ogłoszenie w pliku pdf lub na adres biuro/at/manhattan.net.pl\n\nProszę o zawarcie klauzuli o przetwarzaniu danych osobowych",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca w restauracji",
        "category": "olx",
        "phone": "502578826",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy na stanowisku kelner/barman w restauracji Leśny Dworek w Rybienku Leśnym aleja Wolności 42, 07-201 Wyszków\n\nWymagana znajomość języka angielskiego\n\nKontakt telefoniczny 502578826",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pomocnik kucharza / Kucharz | Hi'loft Restaurant Wyszków",
        "category": "olx",
        "phone": "516414930",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Do nowo powstającej restauracji w centrum Wyszkowa poszukujemy ludzi z pasją, ceniących wysoką jakość i smak. Ideą Hi’loft jest stworzenie przestrzeni dla wielbicieli oryginalnych trendów kulinarnych i miejsca spotkań, które będzie tętniło życiem.\nLubisz pracę w kuchni i naukę nowych smaków? To miejsce dla ludzi, którzy nie stoją w miejscu, stale się rozwijają, a przede wszystkim czerpią fun i satysfakcję z tego co robią. Wchodzisz w to?\nCzego oczekujemy?\n\nDoświadczenia na podobnym stanowisku\nUmiejętności planowania i realizacji produkcji w gastronomii\nWysokiej kultury osobistej i nienagannej prezencji\nAktualnej książeczki sanitarnej\nDyspozycyjności oraz gotowości do pracy zmianowej\nChęci do nauki i ciekawości smaków, bo kroi się coś pysznego\nCo oferujemy?\n\nStałe zatrudnienie w oparciu o umowę o pracę\nUczciwe wynagrodzenie oraz premie motywacyjne\nMożliwość zdobycia dużego doświadczenia\nBycie częścią nowatorskiego projektu\nCzekamy na Ciebie! CV ze zdjęciem wyślij na adres praca(małpa)hiloft.pl\nW tytule maila wpisz stanowisko, na które aplikujesz.\nSkontaktujemy się z wybranymi kandydatami.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnię do lokalu gastronomicznego typu fast food.",
        "category": "olx",
        "phone": "534414717",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Przyjmę do pracy w lokalu gastronomicznym typu fast food. Lokal miesci sie w Wyszkowie. Praca polega na przygotowaniu posiłków typu kebab, zapiekanka, burger itp. Praca w pelnym wymiarze pracy. Komfortowe warunki pracy. Mile widziane Cv.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pomoc kuchenna - Kawiarnia Yummy",
        "category": "olx",
        "phone": "506516492",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Do kawiarni w centrum Wyszkowa poszukujemy osoby na stanowisko pomoc kuchenna.\n\nPoszukujemy osoby do pracy na stałe. Bardzo mile widziane doświadczenie i książeczka sanitarno-epidemiologiczna.\n\nOferujemy:\n\nStałe zatrudnienie w oparciu o umowę o pracę,\n\nSzkolenia,\n\nElastyczny grafik,\n\nPracę w młodym, dynamicznym zespole.\n\nUprzejmie informujemy, że skontaktujemy się wyłącznie z wybranymi kandydatkami\n\nWszystkich chętnych zapraszamy do wysyłania CV poprzez OLX",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "praca Bar Popularny - Wyszków",
        "category": "olx",
        "phone": "504791561",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "szukamy osób chętnych do pracy na kuchni jako kucharz / kucharka - pomoc kuchenna . \n\nmile widziane doświadczenie ;) ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca. Piekarnia.",
        "category": "olx",
        "phone": "503689357",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Praca.Piekarz,cukiernik lub do przyuczenia. Zatrudnimy na ww. stanowisko osobę kulturalną, bez nałogów, sumienną, dyspozycyjną, wykwalifikowaną   lub do przyuczenia. Praca 6 dni w tygodniu od niedzieli do piątku  w godzinach 10-19 lub 18-02. Wynagrodzenie zależne od  umiejętności i zaangażowania od 2600-4000 netto.Tel. 503-689-357 Proszę dzwonić po 15.00",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Szukamy osób na stanowisko Pomoc kuchanna",
        "category": "olx",
        "phone": "605645499",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "W związku z rozwojem firmy poszukujemy osób na stanowisko: \n\nPomoc Kuchenna\n\nWymagania: \n\nAktualna książeczka do celów sanitarno-epidemiologicznych\n\nUmiejętność pracy w zespole\n\nDyspozycyjność\n\nUmiejętność samodzielnej organizacji pracy\n\nZaangażowanie i inicjatywa w wykonywaniu powierzonych zadań\n\nUmiejętność pracy pod presją czasu\n\nObowiązki:\n\nPrzygotowywanie produktów do obróbki w kuchni,\n\nPrzygotowywanie dań zgodnie z opracowanymi recepturami,\n\nPakowanie dań (w przypadku obsługi zamówień \"na wynos\"),\n\nUtrzymywanie czystości miejsca pracy,\n\nZmywanie naczyń,\n\nWydawanie dań na salę.\n\nOferujemy: \n\nUmowę o pracę\n\nMożliwość zdobycia doświadczenia\n\nSatysfakcję z wykonywanej pracy\n\nMiłą atmosferę w pracy\n\nWynagrodzenie adekwatne do umiejętności",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pomoc kuchenna :",
        "category": "olx",
        "phone": "728527671",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy do pracy na stanowisko pomocy kuchennej.\n\nSystem pracy od poniedziałku do piątku. \n\nGodziny pracy: 5.00. - 14.00. \n\nProszę o kontakt telefoniczny. ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca kelner/kelnerka",
        "category": "olx",
        "phone": "508142345",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy pracowników na stanowisko kelnera/kelnerki.\nPraca w renomowanym hotelu w Jachrance. Grafik ustalany z tygodniowym wyprzedzeniem. \n\nDołącz do naszego zespołu jeśli: \n\n- masz doświadczenie w gastronomii lub w pracy w bezpośrednim kontakcie z klientem\n- posiadasz aktualną książeczkę sanitarno-epidemiologiczną  lub wyrażasz chęć, by ją wyrobić\n- jesteś uczniem lub studentem i chcesz dorobić sobie do budżetu \n- swoje obowiązki wykonujesz ze stuprocentową starannością\n- wiesz, że gastronomia rządzi się swoimi prawami i nie przeraża Cię praca w godzinach wieczornych \n\nOferujemy: \n\n- umowę zlecenie na dobry początek\n- pracę stałą lub dorywczą (możliwość wyboru dni)\n- podane widełki godzinowe netto\n- grafik dostosowany do Twoich potrzeb \n- stawkę godzinową uzależnioną od Twojego doświadczenia \n- pracę w przyjaznej atmosferze, ze zgraną ekipą, która służy pomocą w każdej sytuacji! \n\nKoniecznie zadzwoń lub prześlij nam swoje CV za pośrednictwem olx, nie zapominając o dopisaniu klauzuli: \n\nWyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z ustawą z dnia 10 maja 2018 roku o ochronie danych osobowych (Dz. Ustaw z 2018, poz. 1000) oraz zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO).",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Manhattan Chicken & Pizza zatrudni pracownika kuchni",
        "category": "olx",
        "phone": "605404240",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Manhattan Chicken & Pizza zatrudni pracownika kuchni \n\nOferta skierowana do osób pełnoletnich\n\nPraca w barze bistro przy przygotowywaniu posiłków \n\nOd kandydatów oczekujemy: Dyspozycyjności Aktualnych badań lekarskich umiejętność pracy w zespole \n\nZgłoszenia osobiste/ telefoniczne 605404240 lub jako odpowiedź na poniższe ogłoszenie Zgłoszenia proszę kierować w pliku PDF Proszę o dołączanie klauzuli o wyrażeniu zgody na przetwarzanie danych osobowych - celem przeprowadzenia procesu rekrutacji",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pizzer---Pizzerka",
        "category": "olx",
        "phone": "500746180",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Pizzeria DaGrasso poszukuje ambitnej osoby do pracy na stanowisku:\n\n \n\nPizzer/Pizzerka\n\n  \n\n Wymagamy\n\n - Skończone 18 lat\n\n - Dyspozycyjność\n\n \n\n \n\nMile widziane\n\n- Doświadczenie na podobnym stanowisku\n\n \n\n \n\n Oferujemy\n\n - stawkę godzinową\n\n - elastyczny grafik\n\n - premie\n\n - możliwość rozwoju\n\nposiłki pracownicze",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Osoba na kuchnie - Sensei Sushi Wyszków",
        "category": "olx",
        "phone": "505423436",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam poszukujemy dorosłej, odpowiedzialnej osoby ( mężczyzny ) z CHĘCIĄ DO PRACY, na kuchnie do Sensei Sushi Wyszków.\n\nGłównym zajęciem będzie przygotowanie produkcji pod sushi ( ryż, ryby, sałatki, zupy, desery ) . Mile widzana osoba z doświadzczeniem lub zamiłowaniem do kuchni.\n\nWymagamy punktualności , chęci do pracy, książeczki sanepid.\n\nOferujemy godne zarobki za wykonywaną prace, Z ROSNĄCYM DOŚWIADCZENIEM coraz większe. Praca  od 12 -18 dni w miesiącu po 12h, zazwyczaj w systemie dwa dni pracy dwa dni wolne. Umowa, elastyczny grafik, posiłek.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "ETI Polam Sp. z o.o. zatrudni Specjalista ds. administracyjnych",
        "category": "olx",
        "phone": "662121903",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma ETI Polam Sp. z o.o. należy do międzynarodowej grupy ETI. Specjalizujemy się w produkcji i sprzedaży zabezpieczeń prądowych średniego i niskiego napięcia. W grupie ETI działa kilkanaście firm. W Polsce działamy od 1997 roku i obecnie zatrudniamy ponad 400 pracowników.\n\nAktualnie poszukujemy:\n\nSpecjalista ds. administracyjnych\n\nMiejsce pracy: Pułtusk\n\nZakres obowiązków:\n\n• rejestracja, weryfikacja i koordynowanie właściwego przepływu dokumentów,\n\n• gromadzenie, przechowywanie i archiwizacja dokumentacji,\n\n• przygotowywanie pism, raportów i zestawień,\n\n• wykonywanie prac administracyjno-biurowych,\n\n• organizacja i obsługa spotkań,\n\n• dbanie o właściwy przepływ informacji;\n\nWymagania:\n\n• wykształcenie minimum średnie,\n\n• mile widziane doświadczenie w pracy na podobnym stanowisku,\n\n• bardzo dobra organizacja pracy własnej,\n\n• wysoka kultura osobista,\n\n• komunikatywność,\n\n• odpowiedzialność i zaangażowanie w wykonywaniu obowiązków,\n\n• umiejętność obsługi oprogramowania Microsoft Office,\n\n• znajomość języka angielskiego na poziomie średnio zaawansowanym,\n\n• wiedza i doświadczenie z zakresu ochrony środowiska będzie dodatkowym atutem;\n\nOferujemy:\n\n• pracę w firmie międzynarodowej o ugruntowanej pozycji na rynku,\n\n• możliwość zdobywania ciekawego doświadczenia zawodowego,\n\n• możliwość rozwoju zawodowego,\n\n• miłą atmosferę w pracy.\n\nZainteresowane osoby prosimy o składanie CV w siedzibie firmy ETI Polam Sp. z o.o. ul. Jana Pawła II 18, 06-100 Pułtusk lub przesłanie na adres mailowy ,lub kontakt telefoniczny 662121903.\n\nDziękujemy za wszystkie aplikacje. Uprzejmie informujemy, że skontaktujemy się tylko z wybranymi kandydatami. Prosimy o zawarcie w CV klauzuli: „Na podstawie art. 6 ust. 1 lit. a RODO wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w mojej ofercie pracy przez ETI Polam Sp. z o.o. z siedzibą W Pułtusku, ul. Jana Pawła II 18, 06-100 Pułtusk, dla potrzeb niezbędnych do realizacji procesu rekrutacji na stanowisko wskazane w ogłoszeniu. Zapoznałam/em się z informacją i pouczeniem dotyczącym przysługujących mi praw. Wyrażam zgodę na przetwarzanie danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji przyszłych procesów rekrutacji prowadzonych przez ETI Polam Sp. z o.o. w Pułtusku, ul. Jana Pawła II 18, 06-100 Pułtusk. Podanie danych i wyrażenie zgody na przetwarzanie danych osobowych jest dobrowolne, ale niezbędne do wzięcia udziału w rekrutacji. Informujemy, że Administratorem danych jest ETI Polam Sp. z o.o. z siedzibą w Pułtusku przy ul. Jana Pawła II 18. Dane zbierane są dla potrzeb rekrutacji. Dane będą przechowywane przez rok od zgłoszenia kandydatury, a w przypadku wyrażenia zgody tylko na przetwarzanie danych w aktualnym procesie rekrutacji zostaną usunięte zaraz po jego zakończeniu. Ma Pani/Pan prawo dostępu do treści swoich danych oraz ich sprostowania, ograniczenia przetwarzania i cofnięcie zgody na ich przetwarzanie. Podanie danych w zakresie określonym przepisami ustawy z dnia 26 czerwca 1974 r. Kodeks pracy oraz aktów wykonawczych jest obowiązkowe. Podanie dodatkowych danych osobowych jest dobrowolne.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Prawnik/Radca Prawny",
        "category": "olx",
        "phone": "519319303",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "REMBUD Sp. z o.o. poszukuje osoby na stanowisko – Prawnik. \n\nObowiązki: \n\nopracowywanie, opiniowanie i negocjowanie warunków prawnych umów, aneksów i porozumień zawieranych przez kontrakt, \nsprawowanie nadzoru prawnego nad dokumentacją dotyczącą kontraktu, \nweryfikacja od strony formalnej zgłaszanych w procesie budowlanym powiadomień i roszczeń, \nprzygotowywanie korespondencji kontraktowej z zamawiającym, podwykonawcami,\n udział w spotkaniach i negocjacjach, prowadzonych w ramach realizowanych kontraktów/projektów, \nwspółdziałanie w zakresie przygotowywania pism procesowych \nudzielanie porad prawnych w zakresie uregulowań związanych z działalnością firmy i branży budowlanej, \nwspółpraca z wewnętrznymi jednostkami organizacyjnymi firmy oraz organizacjami branżowymi. \n\nWymagania: \n\nwykształcenie wyższe prawnicze \nmile widziane doświadczenie w pracy w branży budowlanej \nrozwinięte umiejętności analityczne, negocjacyjne i komunikacyjne w tym współdziałanie w zespole oraz dobra organizacja pracy własnej, \nrzetelność i samodzielność w działaniu oraz odpowiedzialność za powierzone zadania, \numiejętność pracy równoległej nad wieloma projektami, znajomość obsługi pakietu MS Office; \n\nOferujemy: \n\nstabilne zatrudnienie w prężnie rozwijającej się firmie; \natrakcyjne wynagrodzenie z systemem premiowym; \nniezbędne narzędzia pracy; \nmożliwość rozwoju zawodowego, \npraca w młodym, dynamicznym zespole.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Specjalista ds. Administracji",
        "category": "olx",
        "phone": "791309209",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Jesteśmy polską firmą rodzinną działającą na rynku od 1994 r. Dzięki wieloletniemu doświadczeniu dostarczamy Klientom kompleksowe wsparcie w produkcji rolnej. Indywidualne podejście do klienta, wsparcie specjalistów, doskonała obsługa oraz rodzinna atmosfera pracy to tylko niektóre z naszych atutów. Zajmujemy się sprzedażą\n\nm.in. komponentów paszowych, nawozów mineralnych, materiału siewnego, folii rolniczych. Oferujemy również usługowe mieszanie pasz.\n\nAktualnie do Naszego Zespołu poszukujemy kandydatów na stanowisko:\n\nSpecjalista ds. Administracji\n\nSiedziba Firmy: Krasnosielc, pow. Makowski\n\nJeśli jesteś otwartą, ambitną osobą, która chętnie się rozwija - zapraszamy do Naszego Zespołu! Chętnie zarazimy się Twoją energią oraz wiedzą!\n\nJakie zadania będą wypełniały Twoją codzienność w Naszej firmie?\n\nRozliczanie faktur w systemie z wyciągu bankowego oraz kontrola sumy wpłat i wypłat \nKontrolowanie płatności, tj. przypomnienie o upływającym termie płatności (sms, telefonicznie lub listownie), raportowanie stanu zadłużenia \nPrzygotowywanie oraz zatwierdzanie kontraktów między firmami \nWeryfikacja nowych klientów (sprawdzanie klientów w BIG-u, weryfikacja posiadania dopłat, nadawanie kredytu kupieckiego)\nTworzenie indeksów do systemu handlowego \nWprowadzanie dokumentów oraz faktur do systemu handlowego\nPorządkowanie dokumentacji księgowej oraz archiwizacja dokumentacji w firmie\nZliczanie sprzedaży handlowców\n\nChcemy zasilić Nasz Zespół o osobę, która:\n\nMa doświadczenie w pracy na podobnym stanowisku (administracja biurowa, pomoc księgowa, windykacja) \nPracowała na programie Subiect GT lub Navireo, lecz niekoniecznie! Wszystkiego nauczymy\nBardzo dobrze zna to, czego uczymy się od podstawówki .. czyli Pakiet Office\nAnalitycznie myśli – lubi analizować fakty, dociekać do źródła problemu i znajdywać rozwiązania\nJest samodzielna i dobrze zorganizowana, ale dzieli chętnie wyciąga pomocną dłoń i dzieli się doświadczeniem\nPotrafi wyznaczać sobie cele oraz priorytety, a także efektywnie do nich dążyć\nMa wykształcenie min. średnie \n\nWymagamy też od siebie, więc w zamian za Twój wkład oferujemy:\n\nUmowę o pracę w pełnym wymiarze czasu pracy\nJasne i stabilne warunki wynagrodzenia\nWdrożenie w nowe stanowisko pracy stworzone specjalnie dla Ciebie\nPracę w dynamicznym zespole w firmie rodzinnej\nMożliwość rozwoju zawodowego i osobistego\nMożliwość przystąpienia do dodatkowego ubezpieczenia grupowego za połowę kosztów, resztę ponosi pracodawca\nKomplet odzieży firmowej, jeśli lubisz kolor granatowy\n\nTworzymy Zespół, więc ważne jest dla nas, aby kandydat identyfikował się z wyznawanymi przez nas wartościami:\n\nSumienność, samodyscyplina.\nOdpowiedzialność i zaangażowanie.\nUczciwość, lojalność, poufność.\nGotowość niesienia pomocy kolegom z zespołu.\nSzczerość, wzajemny szacunek.\n\nJeśli odnajdujesz się w powyższym ogłoszeniu zachęcamy do przesłania CV pod adres e-mail: rekrutacja\"małpka\"zielinskiagro.pl w tytule maila proszę wpisać Specjalista ds. Administracji + imię i nazwisko. Prosimy o zawarcie w CV klauzuli “Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji na aplikowane przeze mnie stanowisko.”\n\nInformujemy, iż skontaktujemy się z wybranymi kandydatami.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Szkolenie online! Stypendium od 600 zł dla każdego uczestnika !",
        "category": "olx",
        "phone": "533277239",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "ZAPRASZAMY NA SZKOLENIA !\n\nSTYPENDIUM DLA KAŻDEGO UCZETNIKA OD 600 ZŁ NA RĘKĘ!\n\nE-LEARNING / ok 60 h\n\nZAPRASZAMY do udziału w Projekcie\n\nProjekt pt. „Obierz kierunek na zatrudnienie” Lub „Zaprojektuj swoją zmianę zawodową”\n\nℹ️ mieszkasz na terenie województwa mazowieckiego\n\nℹ️ masz 18 lat – 29 lat\n\nℹ️ nie pracujesz lub masz umowę zlecenie lub umowę krótkoterminową,\n\nFormy wsparcia dla Uczestnika/czki Projektu:\n\nIdentyfikacja potrzeb i diagnozowanie możliwości doskonalenia zawodowego, identyfikacja stopnia oddalenia od rynku pracy (w tym opracowanie IPD)\n\nPoradnictwo zawodowe w wymiarze\n\nSzkolenie zawodowe z stypendium od 600 zł na rękę!\n\nDOPASOWANIE TEMATYKI SZKOLEŃ DO POTRZEB KANDYDATÓW.\n\nKONTAKT ⁉️ :\n\nDaria Twardowska\n\ntel. 533-277-239 lub priv. ‼️\n\nWykonawca : ICT Artur Olesiński\n\nOd 2013 r. - 2017 r. do chwili obecnej zrealizowaliśmy na terenie całego kraju:\n\n- 18 własnych projektów dofinansowanych ze środków EU o łącznej wartości ponad 14 mln złotych, przeszkolonych w ramach projektów zostało około 1900 osób.\n\n- 15 projektów dofinansowanych ze środków EU, dla podmiotów zewnętrznych o łącznej wartości ponad 9,5 mln złotych, przeszkolono w ramach projektów około 2000 osób.\n\n- 2018 zrealizowaliśmy projekty o łącznej wartości ponad 5,5 mln złotych",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Spedytor międzynarodowy",
        "category": "olx",
        "phone": "504298193",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Opis stanowiska:\n\nrozwój spedycji krajowej i międzynarodowej,\npozyskiwanie zleceń transportowych,\nnadzór nad samochodami i ładunkami\nstała współpraca z kierowcami,\nnadzór nad realizacją zleceń transportowych.\n\nWymagania:\n\nkomunikatywna znajomość języka angielskiego lub niemieckiego w mowie i piśmie\ndoświadczenie na podobnym stanowisku,\nsamodzielność,\numiejętność analitycznego myślenia oraz podejmowania szybkich decyzji\nkomunikatywność oraz umiejętność budowania relacji z klientami,\nznajomość giełd transportowych.\n\nOferujemy:\n\nzatrudnienie w stabilnej, dynamicznie rozwijającej się firmie,\numowa o pracę na cały etat,\natrakcyjne warunki wynagrodzenia.\n\nProsimy o przesyłanie CV z poniższą klauzula:\n\nWyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO).",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pracownik administracyjno-biurowy",
        "category": "olx",
        "phone": "533202288",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Twoje zadania:\n\nzapewnienie prawidłowego i terminowego obiegu dokumentów\nobsługa bieżących spraw administracyjno- biurowych\nkomunikacja ze wszystkimi działami firmy\nprzygotowywanie zestawień  i raportów\ndbanie o utrzymanie pozytywnych relacji ze stałymi klientami \ndbanie o pozytywny wizerunek firmy\n\nNasze oczekiwania:\n\nmile widziane doświadczenie na podobnym stanowisku\nwykształcenie min. średnie\nzaangażowanie i determinacja w realizacji powierzonych zadań\nbiegła obsługa komputera\nbardzo dobra znajomość MS Excel\nobsługa podstawowych urządzeń biurowych\notwartość i łatwość w nawiązywaniu kontaktów międzyludzkich\n\nOferujemy:\n\nciekawą pracę w firmie o ugruntowanej pozycji\nmożliwość podnoszenia kwalifikacji i rozwoju zawodowego\nzatrudnienie w oparciu o umowę\nstabilne warunki zatrudnienia\natrakcyjne wynagrodzenie\nniezbędne narzędzia pracy\nmożliwość korzystania z karty MultiSport\nubezpieczenie grupowe\n\nW CV prosimy o dopisanie następującej klauzuli: \"Wyrażam zgodę na przetwarzanie podanych przeze mnie danych osobowych zawartych w aplikacji dla potrzeb niezbędnych do realizacji procesu rekrutacji zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO).” Jednocześnie wyrażam zgodę na przetwarzanie przez ogłoszeniodawcę moich danych osobowych na potrzeby przyszłych rekrutacji. Informujemy, że Administratorem danych jest Polbram Steel Group sp. z o.o. sp. k. z siedzibą w Kleszewo 44, 06-100 Pułtusk. Dane zbierane są dla potrzeb rekrutacji. Ma Pani/Pan prawo dostępu do treści swoich danych oraz ich poprawiania. Podanie danych w zakresie określonym przepisami ustawy z dnia 26 czerwca 1974 r. Kodeks pracy oraz aktów wykonawczych jest obowiązkowe. Podanie dodatkowych danych osobowych jest dobrowolne. ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pracownik biurowy - dział serwisu / części zamiennych",
        "category": "olx",
        "phone": "297527751",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma AGRO-PLUS z siedzibą w Bogate 68, 06-300 Przasnysz zatrudni odpowiedzialną i sumienną osobę, która wspomoże nasz dział serwisu oraz części zamiennych.\n\nOferujemy:\n\nPracę w młodym i dynamicznym zespole w rodzinnej firmie\nStabilność zatrudnienia\nAtrakcyjne warunki finansowe\nUmowę o pracę na czas nieokreślony (po okresie próbnym)\n\nWymagania:\n\nWykształcenie minimum średnie\nZnajomość branży rolniczej\nZnajomość zagadnień technicznych związanych z doborem części oraz doradztwem serwisowym\nWysoka kultura osobista\nPracowitość, sumienność, punktualność\nDobra organizacja czasu pracy\n\nCV ze zdjęciem oraz list motywacyjny prosimy przesyłać w odpowiedzi na niniejsze ogłoszenie wraz z poniższą klauzulą:\n\n\"Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO).\"\n\nZastrzegamy sobie możliwość odpowiedzi tylko na wybrane oferty.\n\nDo zobaczenia!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnię logopedę",
        "category": "olx",
        "phone": "603333207",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Przedszkole niepubliczne w Świerczach zatrudni logopedę. Więcej informacji pod numerem telefonu 603333207.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnię logopedę oraz terapeutę SI",
        "category": "olx",
        "phone": "511644495",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię logopedę oraz terapeutę SI z dostępnością w minimum 1 popołudnie w tygodniu. \n\nWymagania:\n-minimum półroczne doświadczenie w pracy \n-doświadczenie w pracy z dziećmi oraz rodzicami\n-komunikatywność \n-chęć rozwoju zawodowego \n-umiejętność pracy w zespole \n\nOferuję :\n-przyjazna atmosfera pracy w zgranym zespole \n-konkurencyjne wynagrodzenie \n-możliwość rozwoju zawodowego i zdobycia nowych umiejętności \n\nZainteresowane osoby proszę o\n - wysłanie CV we wiadomości prywatnej lub na adres e-mail\n- kontakt telefoniczny 511644495",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "praca z dziećmi Wyszków, Radzymin",
        "category": "olx",
        "phone": "510141861",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Uwaga: NIEZBĘDNY samochód oraz laptop/tablet.\n\n \n\nProwadzimy zajęcia edukacyjne pod marą Edukido. Są to zajęcia z wykorzystaniem klocków Lego, wiek uczniów: 4-10 lat. Poszukujemy osób TYLKO do dłuższej współpracy. Praca w Radzyminie i/lub Wyszkowie (możliwość przypisania konkretnej lokalizacji).\n\n \n\nWymagania:\n\n– wykształcenie min. średnie,\n\n– kreatywność,\n\n– niekaralność,\n\n– punktualność,\n\n– umiejętność pracy z dziećmi,\n\n– zaangażowanie,\n\n– samodzielność,\n\n– dyspozycyjność\n\n \n\nZapewniamy:\n\n– przeszkolenie i bardzo dobre przygotowanie do zajęć (scenariusze, materiały itp.),\n\n– umowę zlecenia z bardzo dobrą stawką (38 do 50zł netto za jedne zajęcia, duża ilość zajęć).\n\n \n\nCV ze zdjęciem i klauzulą „Zgodnie z art.6 ust.1 lit. a ogólnego rozporządzenia o ochronie danych osobowych z dnia 27 kwietnia 2016 r. (Dz. Urz. UE L 119 z 04.05.2016) wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb aktualnej i przyszłych rekrutacji” proszę wysyłać za pomocą aplikacji OLX\n\n \n\nSkontaktujemy się z wybranymi osobami.\n\n ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kelner/kelnerka do Hotelu (K/M) w Hotelu 4*",
        "category": "olx",
        "phone": "798042433",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Hotel Pałac Alexandrinum, to działający od 2016 roku hotel położony w pobliżu Warszawy.\n\nMiejsce pracy: Krubki - Górki 13A, pow. wołomiński/ 13 km od granic Warszawy Stale się rozwijamy i podnosimy standardy funkcjonowania. \n\nW związku z tworzeniem nowego zespołu poszukujemy pracowników na stanowisko:\n\nKelner/Starszy Kelner\n\nOd Kandydatów(Kelner/Starszy Kelner) oczekujemy:\n\nDyspozycyjność\nWysoka kultura osobista\nDoświadczenie na podobnym stanowisku\nPodstawowa znajomość języka angielskiego\nUmiejętność pracy w zespole\nOdporność na stres\n\nOferujemy:\n\n umowę o pracę na pełen etat\n ciekawą pracę w nowym hotelu,\n przyjazną atmosferę pracy,\n wynagradzanie w oparciu o posiadane doświadczenie i osiągane wyniki,\n możliwość samorealizacji i doskonalenia zawodowego( szkolenia i inne).\n\n﻿W ofercie prosimy umieścić klauzulę w pełnym jej brzmieniu: Oświadczam, iż wyrażam zgodę na przetwarzanie moich danych osobowych przez Instytut Studiów Podatkowych – Audyt, Hotel Pałac Alexandrinum na podstawie art. 6 rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych., w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/W, w celu przeprowadzenia procesu rekrutacji do Firmy Hotel Pałac Alexandrinum. ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca do obsługi klienta w kafejce internetowej",
        "category": "olx",
        "phone": "698451880",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam serdecznie, Praca zmianowa lub do uzgodnienia  !!!Zatrudnię osobę do obsługi klienta w kafejce internetowej w Pułtusku Do głównych zadań pracownika należy obsługa gości korzystających z komputerów, utrzymanie porządku w miejscu pracy oraz dyspozycyjność i komunikatywność. Mile widziana i kultura osobista oraz punktualność. PREFERUJEMY OSOBY STARSZE ORAZ RENCISTÓW I EMERYTÓW !!! BEZ NAŁOGÓW !!! Ew. osoby młode bez nałogów! UCZCIWE i chętne do pracy Wynagrodzenie waha się w zależności od liczby przepracowanych godzin, zaangażowania oraz wywiązywania się ze swoich obowiązków, a także stażu pracy. Godzinowa stawka wynosi 10-13 na na rękę, plus napiwki.” Proszę o kontakt telefoniczny lub SMS Osoby konkretnie zainteresowane prosimy o kontakt telefoniczny BĄDŹ SMS Tylko osoby odpowiedzialne bez nałogów. Elastyczny grafik. Z góry dziękuję, pozdrawiam i zapraszam",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kasjer/ sprzedawca na stacji paliw w Świerczach",
        "category": "olx",
        "phone": "882664745",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy osoby chętnej do pracy na stacji paliw w Świerczach .\n\nOFERUJEMY :\n\nelastyczny czas pracy \nzatrudnienie na umowę zlecenie , stawka za godzinę 18,30 brutto + premie uznaniowe \nstabilne zatrudnienie \npłatny okres szkoleniowy i wsparcie podczas wdrążenia do pracy \n\nPODSTAWOWE ZADANIA:\n\nprofesjonalna obsługa klienta oraz aktywna sprzedaż zgodna ze standardami obowiązującymi w firmie\nobsługa systemu kasowego oraz wystawianie dokumentów kasowych zgodnie z obowiązującymi przepisami \ndbałość o powierzone mienie przedsiębiorstwa oraz używanie go zgodnie z przeznaczeniem i zasadami bezpieczeństwa\ndbanie o odpowiednią ekspozycję towarów\n\nWYMAGANIA:\n\ngotowość do pracy w systemie zmianowym (zmiany 12-sto godzinne)\numiejętność pracy w zespole \nzaangażowania i motywacji do pracy \npozytywne nastawienie do ludzi \nłatwość w nawiązywaniu kontaktów \n\nOsoby zainteresowane prosimy o przesyłanie CV \n\nWięcej informacji bezpośrednio u kierownika stacji ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca w Sklepie spożywczym na na Stanowisku Kasjer Sprzedawca",
        "category": "olx",
        "phone": "780064032",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię osobę do sklepu spożywczego na stanowisko kasjer sprzedawca w Latonicach. Praca od Poniedziałku do Soboty sklep czynny w godzinach od 6 do 21 (praca na dwie zmiany).\n\nWięcej informacji udzielę telefonicznie.\n\n Sawka godzinowa od 13,50 netto.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kaufland Wyszków - Sprzedawca/Kasjer ( 3/4 etatu )",
        "category": "olx",
        "phone": "297420001",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Sprzedawca/Kasjer\n\nw Dziale Art. Świeżych\n\nmarket w Wyszkowie, ul. Centralna 2\n\nJesteśmy międzynarodową firmą handlową, której siłę stanowi kilkanaście tysięcy zaangażowanych pracowników. Co sprawia, że jesteśmy wyjątkowi? Efektywność, dynamika i fair play. Codziennie staramy się zapewnić naszym klientom najlepszą jakość produktów i najwyższy poziom obsługi we wszystkich marketach w całej Polsce. Rozwijaj swoją karierę w sprzedaży i daj nam możliwość wykorzystania Twoich mocnych stron.\n\n﻿Jakie będą Twoje zadania:\n\nwykładanie towaru oraz dbanie o jego odpowiednią ekspozycję\nprzygotowywanie i umieszczanie prawidłowych oznaczeń cenowych\ndbanie o uprzejmą, staranną i sprawną obsługę klienta\ndbanie o świeżość i jakość naszych produktów, m.in. poprzez kontrolę terminów przydatności do sprzedaży\ndbanie o właściwą gospodarkę towarową w markecie.\n\n \n\nCo Ci zapewnimy:\n\natrakcyjne wynagrodzenie\numowę o pracę w wymiarze 3/4 etatu\nindywidualne możliwości rozwoju\nciekawe i odpowiedzialne zadania w dynamicznym zespole, gdzie panuje atmosfera wzajemnego szacunku\nbogaty pakiet benefitów (m. in.: prywatną opiekę medyczną, kafeterię MyBenefit, bony oraz upominki z okazji świąt, działania wellbeingowe, program grupowego ubezpieczenia na życie, zniżki u partnerów biznesowych).\n\n \n\nCzego od Ciebie oczekujemy:\n\nznajomości podstawowych zasad obsługi klienta\nenergicznej i przyjaznej osobowości\nsumienności i zaangażowania w wykonywaniu obowiązków\numiejętności pracy w grupie oraz znajomości zasad prawidłowej komunikacji z klientami i współpracownikami\ndoświadczenie na podobnym stanowisku będzie dodatkowym atutem.\n\n \n\nBrzmi ciekawie? Aplikuj!\n\nJeśli przekona nas Twoja aplikacja, zaprosimy Cię do procesu rekrutacyjnego.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Sprzedawca Stylista Loft22/UNISONO Galeria Wyszków",
        "category": "olx",
        "phone": "602328647",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "SPRZEDAWCA STYLISTA SALON Loft22/Unisono Miejsce pracy: GALERIA WyszkÓw ul. Sowińskiego 62 07-200 Wyszków Oferujemy : - umowę o pracę - wymiar etatu dopasowany do twoich potrzeb - atrakcyjne wynagrodzenie plus miesięczna premia - konkursy sprzedażowe z nagrodami - duże zniżki na zakupy - przyjazny program wdrożeniowy - wyjątkową i niekorporacyjną atmosferę pracy Oczekujemy : - otwartości na kontakt z Klientką - motywacji i chęci do pracy - uśmiechu na co dzień - umiejętności pracy w zespole - dokładności i sumienności w codziennych zadaniach - zaangażowania - doświadczenie w sprzedaży mile widziane ale niekonieczne Główne zadania : - przyjazna zgodna ze standardami obsługa Klientek - przygotowanie kolekcji do sprzedaży - ekspozycja i dbałość o prezentację kolekcji w salonie W aplikacji prosimy umieścić następującą klauzulę: Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji zgodnie z Ustawą z dnia 29.08.1997 roku o Ochronie Danych Osobowych Dz. U. 2016 r. poz. 922\"",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "kasjer-sprzedawca - Intermarche Pułtusk",
        "category": "olx",
        "phone": "519502125",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Praca szuka człowieka!\nPoszukujemy osoby na stanowisko kasjer - sprzedawca,  Zainteresowane osoby prosimy o zostawianie CV w biurze pod adresem Kolejowa 10 06-100 Pułtusk lub przesłanie na adres mail.  Wszelkich informacji udzielimy na miejscu w sklepie. Dołącz do nas!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pracownik obsługi klienta na stacji paliw Orlen",
        "category": "olx",
        "phone": "297417011",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Miejsce pracy: Stacja Paliw Orlen nr 7171,\n\n Pniewo, ul. Pułtuska 17\n\n 07-214 Zatory\n\nChcesz pracować na stacji paliw?\nInteresuje Cię elastyczny system pracy?\nLubisz kontakt z ludźmi? Jesteś osobą otwartą i komunikatywną?\nChcesz połączyć pracę z innymi obowiązkami lub nauką?\n\nPraca polega na:\n\nobsłudze klienta w sklepie i na podjeździe zgodnie ze standardem PKN Orlen\ndbaniu o czystość oraz porządek na terenie obiektu\nkomunikowaniu aktualnych promocji \n\nWymagania:\n\nwykształcenie min. średnie,\nkomunikatywność,\nchęć pracy z ludźmi,\nzaangażowanie w realizację zadań, sumienność\numiejętność pracy w grupie\npozytywne nastawienie, entuzjazm,\nwysoka kultura osobista\n\nOferujemy:\n\npracę na stanowisku: Pracownik obsługi klienta\nszeroki zakres szkoleń\nzdobycie doświadczenia zawodowego w oparciu o standardy PKN Orlen\nstabilne warunki pracy\nelastyczny system pracy\npremie za dobre wyniki w pracy\nmiła atmosfera w pracy\n\nZainteresowanych prosimy o przesyłanie CV.\n\nJednocześnie prosimy o zamieszczenie w CV klauzuli:\n\n\"Wyrażam zgodę AB-5 Agnieszka Brzezińska na przetwarzanie moich danych osobowych w celu przeprowadzenia rekrutacji .”\n\nPrzesłane CV nie zawierające powyższej klauzuli nie będą brane pod uwagę .\n\nUprzejmie informujemy, że skontaktujemy się tylko z wybranymi Kandydatami.\n\n* KLAUZULA INFORMACYJNA\n\nZgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady Unii Europejskiej 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (dalej: „RODO”) a w szczególności art. 13 RODO, uprzejmie informujemy co następuje. z art. 13 ust. 1 i ust. 2 : Administratorem Pana/Pani danych osobowych jest AB-5 Agnieszka Brzezińska z siedzibą w Pniewie.\n\nZ Administratorem danych można się skontaktować:\n\nlistownie na adres: AB-5 Agnieszka Brzezińska Pniewo , ul. Pułtuska 17, 07-214 Zatory\n\n1.Pana/Pani dane osobowe przetwarzane będą w celu Pani/Pana uczestnictwa w realizowanym w AB-5 Agnieszka Brzezińska procesie rekrutacyjnym oraz w celu oceny Pana/Pani kwalifikacji zawodowych, aby wybrać odpowiedniego Kandydata na dane stanowisko.\n\n2.Podstawą prawną przetwarzania Pana/Pani danych osobowych są:\n\nPrzepisy prawa (art. 221 § 1 kodeksu pracy) i przetwarzanie potrzebne do zawarcia umowy o pracę – w zakresie następujących danych: imię i nazwisko;nr telefonu, adres e-mail\n\nPana/Pani zgoda na przetwarzanie danych przekazanych w CV, liście motywacyjnym, formularzu rekrutacyjnym, jeżeli przekazuje Pan/Pani dane inne niż: imię i nazwisko;nr telefonu, adres e-mail takie jak: imiona rodziców; data urodzenia; miejsce zamieszkania (adres do korespondencji); wykształcenie; przebieg dotychczasowego zatrudnienia.\n\nUzasadniony interes AB-5 Agnieszka Brzezińska – w zakresie danych zebranych podczas rozmowy kwalifikacyjnej. AB-5 Agnieszka Brzezińska ma uzasadniony interes w tym, aby sprawdzić Pana/Pani umiejętności i zdolności – jest to potrzebne do oceny, czy Pan/Pani jest odpowiednią osobą na stanowisko, którego dotyczy rekrutacja.\n\n3.Pana/Pani dane osobowe będą przechowywane przez okres 3 miesięcy od daty przesłania aplikacji w ramach danego procesu rekrutacyjnego.\n\n4.Przysługują Panu/Pani prawa związane z przetwarzaniem danych osobowych:\n\nprawo do cofnięcia zgody w dowolnym momencie, prawo dostępu do treści swoich danych, prawo sprostowania danych osobowych, prawo do usunięcia danych osobowych, prawo do ograniczenia przetwarzania danych osobowych, prawo do przenoszenia danych, prawo wniesienia sprzeciwu, prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych osobowych, gdy uzna Pan/Pani, iż przetwarzanie danych osobowych Pana/Pani dotyczących, narusza przepisy RODO;\n\n5. Konieczność podania przez Pana/Panią danych osobowych wynika z 221 § 1 kodeksu pracy. Konsekwencją niepodania danych osobowych będzie brak możliwości uczestniczenia w realizowanych w AB-5 Agnieszka Brzezińska Pniewo, ul. Pułtuska 17, 07-214 Zatory, procesach rekrutacyjnych. Podanie danych osobowych w zakresie szerszym niż to wynika z 221 § 1 kodeksu pracy jest dobrowolne, aczkolwiek niezbędne do pełnej weryfikacji Pana/Pani profilu zawodowego w odniesieniu do oczekiwań zdefiniowanych w ogłoszeniu rekrutacyjnym.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca Sklep Spożywczy",
        "category": "olx",
        "phone": "517185777",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnie osobe do pracy w sklepie spoywczym.\nSzukam osoby z doswiadczeniem\n-Umowa o prace\nZainteresowane osoby prosze o kontakt  pod numetem telefonu 517725375 lub 517185777",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Piekarnia cukiernia szuka sprzedawcy",
        "category": "olx",
        "phone": "601475097",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam. Poszukuję ekspedientki/ta do sprzedaży produktów piekarniczych oraz cukierniczych w piekarni cukierni Oskroba. Praca na dwie zmiany, wynagrodzenie stałe miesięcznie, wymagana książeczka sanepidu. CV proszę wysyłać przez OLX lub kontakt tel. nie odpisuję na sms.\n\nPozdrawiam",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Sprzedawca w sklepie Pink Moodo w Wyszkowie",
        "category": "olx",
        "phone": "608046389",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "POSZUKUJEMY NA STANOWISKO DORADCA KLIENTA DO SKLEPU PINK, MOODO\n\nMiejsce pracy:\n\nWyszków, ul. Sowińskiego 64\n\nOd kandydatów oczekujemy spełnienia następujących wymagań:\n\n- umiejętność samodzielnego podejmowania szybkich decyzji,\n\n- dynamizm, inicjatywa i zaangażowanie,\n\n- znajomość mody i rynku odzieżowego będzie dodatkowym atutem,\n\n- chęci do pracy i dyspozycyjności\n\nWybranym kandydatom oferujemy pracę w ciekawej, dynamicznie rozwijającej się firmie. Możliwość wykonywania odpowiedzialnej i samodzielnej pracy, współtworzenia standardów obsługi Klienta.\n\nZainteresowane osoby prosimy o przesyłanie ofert zawierających CV ze zdjęciem i list motywacyjny poprzez OLX\n\nBędziemy kontaktować się tylko z wybranymi osobami.\n\nCzekamy na Ciebie !!!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnię osobę na stanowisko pomoc mechanika do aut dostawczych",
        "category": "olx",
        "phone": "502702472",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam\n\nPoszukuję osoby na stanowisko Pomocnik Mechanika aut dostawczych w Wyszkowie.\n\nDobre warunki pracy.\n\nMożliwość rozwoju.\n\nWymagana dyspozycyjność\n\nKat. B\n\nSumienność\n\nPracowitość\n\nW zamian oferuję zarobki w wysokości 3-4tys zł na początek",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "praca dla mechanika samochodowego",
        "category": "olx",
        "phone": "690093131",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firama BestDrive poszukuje mechanika do samochodów osobowych, oraz osób do wymiany opon.\n\nPraca w godzinach od 8.00 do 17.00 (pon-pt.), soboty od 8.00 do 15.00\n\nWięcej informacji udzielę pod numerem tel: 607-239-371",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pomocnik lakiernika proszkowego",
        "category": "olx",
        "phone": "506970344",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy osoby na stanowisko :\n\nPomocnik lakiernika proszkowego\n\nMożliwość przyuczenia , zapewniamy szkolenie\n\nOferujemy pracę w stabilnej firmie o ugruntowanej pozycji na rynku\n\nZainteresowanych proszę o kontakt telefoniczny oraz wysłanie CV",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pomocnik mechanika",
        "category": "olx",
        "phone": "660671274",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma zatrudni na stanowisko: pomocnik mechanika\n\nMiejsce pracy: Krzynowłoga Mała\n\nObowiązki:\n\n- bieżąca konserwacja i przeglądy\n\n- naprawy mechaniczne\n\n- bieżące prace zlecone\n\nWymagania:\n\n- doświadczenie na podobnym stanowisku\n\n- znajomość zagadnień mechaniki samochodowej\n\n- odpowiedzialność, zaangażowanie, terminowość\n\n- Umiejętność pracy w zespole\n\nOferujemy:\n\n- zatrudnienie na umowę o pracę\n\n- atrakcyjne wynagrodzenie\n\n- bardzo dobre warunki pracy\n\nWięcej informacji pod nr tel. 660 671 274\n\nZainteresowane osoby prosimy o przesłanie CV przez portal OLX.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnimy Mechanika Samochodowego - Maków Mazowiecki",
        "category": "olx",
        "phone": "501331892",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy mechanika samochodowego . \nZapewniamy Atrakcyjne wynagrodzenie.\nKontakt przez olx lub sms 506184874",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Mechanik/opiekun floty",
        "category": "olx",
        "phone": "793615110",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma Ekoinstal poszukuje pracownika na stanowisko mechanika floty. \n\nTwój zakres obowiązków:\n\n-Konserwacja busów oraz samochodów osobowych (wymiana klocków, oleju, filtrów, opon, bieżące naprawy)\n\n-Prowadzenie raportów prac.\n\n-Stały monitoring floty, dbanie o stan pojazdów oraz regularne serwisy elementów eksploatacyjnych. \n\nCzego wymagamy?\n\n-Doświadczenie w pracy na stanowisku samodzielnego mechanika samochodowego.\n\n-Prawo jazdy kat. B \n\n-Rzetelność \n\nCo oferujemy?\n\n-Zatrudnienie w oparciu o umowę o pracę.\n\n-Atrakcyjne wynagrodzenie podstawowe + premie.\n\n-Możliwość rozwoju zawodowego\n\n-Perspektywa długiej współpracy\n\n-Wszystkie niezbędne do pracy narzędzia\n\nCzekamy właśnie na Ciebie!\n\nJeśli jesteś osobą chętną podjąć nowe wyzwania w stabilnej firmie o dużym potencjale rozwoju.\nJeśli jesteś osobą sumienną, dokładną i wykazujesz się dbałością o jakość wykonywanej pracy.\n\nOsoby zainteresowane prosimy o przesłanie CV. W przysłanych dokumentach prosimy zawrzeć klauzulę:\n\nWyrażam zgodę na przetwarzanie danych osobowych zawartych w niniejszym dokumencie do realizacji przyszłych procesów rekrutacyjnych zgodnie z ustawą z dnia 10 maja 2018 roku o ochronie danych osobowych (Dz. Ustaw z 2018, poz. 1000) oraz zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnię mechanika samochodów ciężarowych",
        "category": "olx",
        "phone": "607239342",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię mechanika samochodów ciężarowych lub pomocnika mechanika. Stawka godzinowa.\n\nWięcej informacji pod numerem 607 239 342\n\n wynagrodzenie podane w kwocie netto",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Mechanik pojazdów samochodowych",
        "category": "olx",
        "phone": "501474617",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy - Mechanika pojazdów samochodowych\n\nZatrudnienie na podstawie umowy o pracę.\n\nDogodne warunki pracy.\n\nDobrze wyposażony warsztat. \n\nPraca w młodym i dynamicznym zespole. \n\nMiejsce pracy – Maków Mazowiecki, ul. Duńskiego Czerwonego Krzyża 32.\n\nCV można wysłać poprzez formularz OLX lub bezpośrednio na adres email. \n\nZachęcamy również do kontaktu telefonicznego: 501-474-617\n\nChcesz poznać nas bliżej ? \n\nFacebook: OSKPWMA\n\nwww: wma012.business.site/",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Lakiernik/pomocnik lakiernika",
        "category": "olx",
        "phone": "519056108",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Praca w warsztacie samochodowym/motocyklowym. Szukamy lakiernika/pomocnika lakiernika. Oferujemy: bardzo dobre warunki pracy; (kabina lakiernicza, bardzo dobrze wyposażony warsztat, duży metraż), stałe zatrudnienie, atrakcyjne zarobki, terminowe płatności, dogodny system pracy. \n\nMile widziane doświadczenie w zawodzie. \n\nLokalizacja-5 km od Pułtuska.\n\nW celu uzyskania szczegółowych informacji zapraszamy do kontaktu telefonicznego: 519-056-108",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnię Mechanika",
        "category": "olx",
        "phone": "506284579",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię mechanika oczekiwania wiedza w zakresie mechaniki samochodów osobowych i dostawczych wynagrodzenie jest do ustalenia podczas rozmowy kwalifikacyjnej \n506284579",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca Sklep Ogrodniczy Pułtusk elastyczny czas pracy magazynier",
        "category": "olx",
        "phone": "505491672",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Przyjmę osobę chetną do pomocy w sklepie ogrodniczym wiek do 30 lat (oferta skierowana do mężczyzn) mile widziane prawo jazdy kat.B elastyczne godziny pracy możliwość zorganizowania stażu więcej informacji: Pultusku ul. 17-go Sierpnia 19 lub Tel. 505 491 672",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Magazynier bez doświadczenia 06:00 do 09:00",
        "category": "olx",
        "phone": "576447352",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam.\n\nZatrudnię pracowników magazynowych do sortowania przesyłek w firmie kurierskiej\n\nPraca w miejscowości Płock ul przemysłowa\ndo Poniedziałku do Piątku w godz 06:00 do 09:00\nWynagrodzenie od 1000 do 1200 netto\nUmowa o pracę\nZatrudnienie na stałe\nPraca głównie dla Panów\nPraca od zaraz\n\nPozdrawiam Rafał\n\nkontakt tylko telefoniczny 576447352",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kierowca / Magazynier",
        "category": "olx",
        "phone": "517938852",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma Web Truck Sp. z o.o. Sp.k., zajmująca się handlem częściami do samochodów ciężarowych poszukuje pracownika na stanowisko:\n\nKierowcy / Magazyniera\n\nOferujemy:\n\n- stabilne zatrudnienie w dynamicznie rozwijającej się firmie z realną możliwością rozwoju zawodowego i awansu,\n\n- umowę zlecenie w początkowym okresie zatrudnienia (1-3 miesięcy), później umowę o pracę,\n\n- wynagrodzenie uzależnione od kompetencji\n\nOczekujemy:\n\n- solidnego pracownika, skrupulatnie wykonującego swoje obowiązki,\n\n- nienagannej kultury osobistej,\n\n- uczciwości i zaangażowania\n\n-umiejętności obsługi komputera\n\n- prawa jazdy kat. B\n\n- wykształcenie techniczne lub handlowe będzie dodatkowym atutem\n\nOsoba zatrudniona na stanowisku Kierowcy / Magazyniera będzie odpowiedzialna za:\n\n- przyjmowanie towaru,\n\n- dostarczanie towaru do klienta,\n\n- obsługę zamówień internetowych\n\n- pakowanie i wysyłkę towaru\n\nOsoby zainteresowane prosimy o przesłanie CV z klauzulą o ochronie danych osobowych.\n\n\"Wyrażam\n\nzgodę na przetwarzanie danych osobowych zawartych w mojej ofercie pracy dla\n\npotrzeb niezbędnych do realizacji procesu rekrutacji prowadzonej przez Firma\n\nWeb Truck Sp. z o.o. Sp.k, zgodnie z ustawą z dnia\n\n29 sierpnia 1997r. o ochronie danych osobowych ( t.j. Dz. U. z 2016r., poz.\n\n922)\"",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca magazynier/kierowca",
        "category": "olx",
        "phone": "608050787",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię pracownika za stanowisko magazynier/kierowca. Wymagane prawo jazdy kat.B.\nMiejsce pracy: \nSanitex \n06-200 Maków Mazowiecki \nUl. Moniuszki 117a",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Magazynier - Getmor sp. z o.o. sp. k.",
        "category": "olx",
        "phone": "530802260",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Jesteśmy rodzinną firmą, która w sposób szczególny ceni takie wartości jak szacunek, uczciwość i zamiłowanie do tradycji. Jako pracodawca dbamy o dobrą atmosferę w zespole, nie tworząc żadnych podziałów. Jesteśmy zgrani a nasza pasja i zaangażowanie to codzienność.\n\nJeśli takie podejście jest bliskie również Tobie dołącz do naszego Zespołu!\n\nW związku z intensywnym rozwojem firmy aktualnie prowadzimy rekrutację na  stanowisko:\n\nMagazynier nr ref. MAG/8/OLX\n\nOd kandydatów oczekujemy:\n\n- zaangażowania w realizację powierzonych zadań\n\n- sumienności i uczciwości\n\n- bardzo dobrej organizacji czasu pracy\n\n- umiejętności pracy w zespole\n\n- mile widziane doświadczenie w pracy na podobnym stanowisku\n\nOferujemy:\n\n- pracę w firmie o ugruntowanej pozycji na rynku w przyjaznym i pomocnym zespole\n\n- stabilne warunki zatrudnienia na podstawie umowy o pracę i atrakcyjne wynagrodzenie\n\n- możliwość zakwaterowania opłaconego przez pracodawcę\n\nAplikacje z, podaniem numeru referencyjnego, prosimy przesyłać mailem, pocztą tradycyjną: Chrzanowo 28, 06-225 Rzewnie, poprzez opcję KONTAKT na www.getmor.pl lub składać bezpośrednio w siedzibie firmy.\n\nMogą Państwo skontaktować się również telefonicznie, tel. +48 530802260.\n\nProsimy o zamieszczenie w CV klauzuli ze zgodą na przetwarzanie danych osobowych na potrzeby procesu rekrutacji.\n\nInformację o przetwarzaniu danych osobowych mogą Państwo uzyskać na stronie internetowej www.getmor.pl.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Magazynier Magazynier",
        "category": "olx",
        "phone": "501455390",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": " \n\nNowoczesne Centrum Budowlane zatrudni osobę do pracy na stanowisku:\n\n \n\nMagazynier\n\n \n\n \n\nMiejsce pracy: Glaz-Bud w Pułtusku, ul. Mickiewicza 45/51, \n\nZatrudniona osoba odpowiedzialna będzie m.in. za: \n\nobsługa klienta - przyjmowanie i wydawanie towaru zgodnie z dokumentacją,\nkontrolowanie realizacji dostaw, sprawdzanie dostaw pod względem ilościowym i jakościowym,\ndbanie o prawidłowy obieg dokumentów magazynowych, przyjęcia i wydania towarów, \nprace załadunkowo – rozładunkowe,\n\nWymagania:                                                                             \n\nuczciwość i rzetelność,\nzaangażowanie i chęć do pracy,\nmile widziane uprawnienia do obsługi wózków widłowych,\n\nOferujemy:\n\n·                    atrakcyjny system wynagrodzeń, \n\n·                    rozwój zawodowy, szkolenia, \n\n·                    ciekawą pracę w firmie o ugruntowanej pozycji na rynku, \n\n·                    przyjazną atmosferę w pracy.\n\n \n\nOsoby zainteresowane prosimy o przesłanie aplikacji – CV.\n\nTel 501 455 390\n\nZastrzegamy sobie prawo odpowiedzi tylko na wybrane oferty.\n\n Prosimy o dopisanie następującej klauzuli: Wyrażam zgodę na przetwarzanie przez P.H. GLAZBUD BIS Sp. z o.o. Sp.K., moich danych osobowych, zawartych w mojej ofercie pracy, dla potrzeb niezbędnych do realizacji procesu rekrutacji zgodnie z ustawą z dnia 29 sierpnia 1997 r. o ochronie danych osobowych (t.j. Dz. U. z 2016 r., poz. 922). Jednocześnie wyrażam zgodę na przetwarzanie P.H. GLAZBUD BIS Sp. z o.o. Sp.K., moich danych osobowych na potrzeby przyszłych rekrutacji.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Magazynier - kierowca samochodów ciężar. kat. C - Centrobud -Przasnysz",
        "category": "olx",
        "phone": "600923095",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma CENTROBUD to sieć placówek handlowych sprzedających materiały budowlane i wykończeniowe w 8 lokalizacjach województwa mazowieckiego. Aktualnie poszukujemy pracowników na stanowisko MAGAZYNIER - KIEROWCA samochodów ciężarowych i dostawczych w oddziale w Przasnyszu.\n\nOpis stanowiska:\n\n- Praca w magazynie, obsługa wózków widłowych\n\n- Przewóz towarów samochodami wymagającymi kategorii C z obsługą HDS\n\nOczekujemy:\n\n- Zaangażowania w powierzone obowiązki;\n\n- Gotowości do pracy w systemie zmianowym;\n\n- Odpowiedzialności za powierzony samochód / sprzęt;\n\nProponujemy:\n\n- Stabilne zatrudnienie na umowę o pracę;\n\n- Wynagrodzenie podstawowe + premie ;\n\n- Możliwość rozwoju zawodowego - szkolenia wewnętrzne;\n\n- Możliwość wdrażania nowych pomysłów w ramach obowiązujących procedur;\n\n- Pakiet medyczny;\n\n- Bardzo dobrą atmosferę pracy.\n\nZainteresowanych zapraszamy do aplikowania poprzez wysłanie CV, ewentualnie kontakt telefoniczny.\n\nProszę o zawarcie w aplikacji zgody o następującej treści:\n\nWyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z ustawą z dnia 10 maja 2018 roku o ochronie danych osobowych (Dz. Ustaw z 2018, poz. 1000) oraz zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO)). Wyrażam zgodę na przetwarzanie danych osobowych zawartych w mojej aplikacji przez CENTROBUD CENTRALA Sp. z o.o., Sp. k., ul. Przyrzecze 20, Konstancin-Jeziorna, na potrzeby przeprowadzenia procesu rekrutacji.\n\nDane osobowe będą przetwarzane do momentu zakończenia prowadzenia rekrutacji, nie dłużej jednak niż przez trzy miesiące.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnię stolarza",
        "category": "olx",
        "phone": "661600000",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnę osobę z doświadczeniem na stanowisku stolarza.\n\n \n\nProdukcja :\n\n- meble na wymiar,\n\n- zabudowy meblowe restauracji,\n\nWymagania:\n\n- doświadczenie na podobnym stanowisku,\n\n- umiejętność precyzyjnego wykończenia, dokładność, dbałość o szczegóły,\n\n- umiejętność czytania rysunków technicznych i samodzielnej pracy,\n\n- umiejętność pracy w zespole,\n\n-umiejętność obsługi maszyn stolarskich i elektronarzędzi,\n\n \n\nOferujemy:\n\n- stabilne zatrudnienie, umowa o pracę,\n\n- zarobki adekwatne do umiejętności,\n\n- pracę przy ciekawych/nietypowych projektach stolarskich,",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Робота в Польщі! Praca! Різноробочий! 18 злотих нетто!",
        "category": "olx",
        "phone": "668132164",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Польська компанія HUMAN PRO LOGISTIKS (NIP 8992782612, REGON 363650372) (W Krajowym Rejestrze Agencji zatrudnienia widniejemy pod numerem 14341) терміново потребує чоловіків на оцинковку металевих виробів. \n\nРоботи, що виконуються на фабриці – підвішування різних металевих виробів на лінію, дальше виріб іде по лінії в ізольовану кімнату для оцинковки (де немає працівників), звідки виходить вже сухим. Дальше потрібно забрати виріб з лінії і пообчищати, якщо є якісь засохлі потьоки.\n\nОплата 18 злотих за годину тільки денна зміна.\n\nДля осіб до 26 років оплата на 1 злотий на годину більше.\n\nМожна працювати або 10 або 12 годин 6 днів в тиждень.\n\nм. Wyszków (50 км від Варшави)\n\nДзвоніть +380970797803 - Христина, +380986670159 - Марія — тел. і Viber\n\nТелефон польського офісу - +48784995207 Vera, +48668132164 Катя.\n\nВакансія безкоштовна.\n\nDo oferty prosimy dołączyć oświadczenie:\n\n \n\nWyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z ustawą z dnia 10 maja 2018 roku o ochronie danych osobowych (Dz. Ustaw z 2018, poz. 1000) oraz zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnie Pana do Pralni dywanow",
        "category": "olx",
        "phone": "509712529",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnie Pana do obslugi maszyn na Pralni- przyuczymy\n\nPraca polega na mierzeniu dywanow i wprowadzaniu ich do wewnetrznego systemu \nWymagana uniejetnosc obslugi koputera\n\nPraca od poniedzialku do piatku 7h dziennie za 2500zl do reki\n\nMiejsce pracy: wyszkow swietojanska 181\n\nOferujemy:\n-wolne weekendy\n-praca w milej atmosferze\n\nPoszukujemy rowniez kierowcy!\n\nZadzwon i umow sie na rozmowe! \n\nNie czytamy wiadomosci olx\nProsze nie dzwonic do biura",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Brygadzista praca na produkcji",
        "category": "olx",
        "phone": "502182792",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Solutions 4 You Sp. z o.o. to firma specjalizująca się w dostarczaniu rozwiązań z obszaru HR optymalizujących koszty zarządzania zasobami ludzkimi przy zapewnieniu ciągłości funkcjonowania wszystkich procesów.\n\nDla naszego Klienta renomowanej firmy z branży rolniczej istniejącej od wielu lat na rynku polskim poszukujemy:\n\nBRYGADZISTĘ _ ŚLUSARZA \n\n﻿\n\nZadania, które na Ciebie czekają:\n\nNadzór i kontrola bieżącej produkcji\nZapewnienie realizacji procesu produkcyjnego\nNadzór nad przestrzeganiem przepisów BHP\nRaportowanie w systemie ERP\nWspółpraca z innymi wydziałami\nZapewnienie terminowości dostaw\nZapewnienie należytej jakości produkowanych konstrukcji\nAktywne uczestnictwo przy usprawnianiu procesu produkcji\n\nDoświadczenie i umiejętności, których oczekujemy:\n\nMin 3-letnie doświadczenie na podobnym stanowisku w firmie produkcyjnej\nZnajomość procesów produkcyjnych\nDoświadczenie w pracy i znajomość maszyn CNC- mile widziane\nBardzo dobra umiejętność czytania rysunków technicznych \nUmiejętność organizacji procesów produkcji dla równolegle realizowanych projektów\nUmiejętność zarządzania zespołem pracowników i delegowania zadań\nUmiejętność rozwiązywanie problemów produkcyjnych i personalnych\nObsługa komputera, Pakiet MS Office, Word, Excel\nKomunikatywności i umiejętności pracy w zespole\nUmiejętności pracy pod presją czasu\nZaangażowania i kreatywności\nChęci do pracy i dalszego rozwoju\n\nMamy dla Ciebie:\n\nUmowę o pracę w renomowanej firmie bezpośrednio z Pracodawcą\nStałe i atrakcyjne wynagrodzenie\nPraca w systemie 4 brygadowym\nKomfortowe warunki pracy\nOdzież ochronną\n\nAplikuj już dziś, czekamy na CIEBIE\n\nProsimy o zawarcie w CV klauzuli: „Wyrażam zgodę na przetwarzanie danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji prowadzonego przez Solutions 4 You Sp. z o.o. z siedzibą w Piasecznie przy ul. Poniatowskiego 12D zgodnie z ustawą z dnia 29 sierpnia 1997 r. o ochronie danych osobowych (t.j. Dz. U. z 2016 r., poz. 922)”.\n\nJednocześnie wyrażam zgodę na przetwarzanie przez ogłoszeniodawcę moich danych osobowych na potrzeby przyszłych rekrutacji.\n\nInformujemy, że Administratorem danych jest Solutions 4 You Sp. z o.o. z siedzibą w Piasecznie przy ul. Poniatowskiego 12D. Dane zbierane są dla potrzeb rekrutacji. Ma Pani/Pan prawo dostępu do treści swoich danych oraz ich poprawiania. Podanie danych w zakresie określonym przepisami ustawy z dnia 26 czerwca 1974 r. Kodeks pracy oraz aktów wykonawczych jest obowiązkowe. Podanie dodatkowych danych osobowych jest dobrowolne.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pracownik produkcji okien",
        "category": "olx",
        "phone": "512257215",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy  pracownika na stanowisko:\n\nPracownik produkcji stolarki okiennej. \n\n-Osoba z doświadczeniem/ bez doświadczenia \n\n-Znajomość obsługi podstawowych narzędzi \n\n-Dyspozycyjność, dbałość i rzetelność na stanowisku pracy.\n\nStawka godzinowa do ustalenia | stabilna praca przez cały rok.\n\nZainteresowane osoby prosimy o kontakt telefoniczny. ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Operator maszyn CNC - obróbka metalu oraz drewna",
        "category": "olx",
        "phone": "784688762",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "OPERATOR MASZYN I URZĄDZEŃ/ CNC\n\nMiejsce pracy: Ciechanów / Sońsk\n\n \n\nDo zadań osoby zatrudnionej należeć będzie:\n\n \n\n·       obsługa maszyn CNC metal i drewno\n\n·       okleiniarki, piły panelowe\n\n·       obsługa maszyn i urządzeń,\n\n \n\nOd kandydatów oczekujemy:\n\n \n\n \n\n·       znajomości technologii obróbki materiałów drewnopochodnych lub metalowych\n\n·       umiejętności czytania rysunków technicznych\n\n·       doświadczenia w pracy na produkcji\n\n·       wykształcenia – mile widziane kierunki techniczne\n\n·       odpowiedzialności, samodzielności, umiejętności pracy w zespole\n\nOferujemy:\n\n \n\n·       pracę w innowacyjnej międzynarodowej firmie\n\n·       przyjazną atmosferę pracy nastawioną na współpracę\n\n·       dobre i bezpieczne warunki pracy, wysokie standardy BHP\n\n·       stabilne zatrudnienie na umowę o pracę, terminowość wypłaty wynagrodzenia\n\n·       możliwość rozwoju, awansu i ponoszenia kompetencji zawodowych\n\n·       zapewniamy transport firmowy na trasie Ciechanów - Sońsk\n\n \n\n \n\nAdministratorem Pani/Pana danych osobowych jest Norcospectra Industries Sp. z o.o.. z siedzibą w Sońsku (06-430) przy ul. Ciechanowskiej 30a. Podane przez Panią/Pana dane osobowe będą przetwarzane w celu realizacji procesu rekrutacyjnego, a w razie wyrażenia w tym zakresie zgody, także dla celów przyszłych procesów rekrutacyjnych.\n\n \n\n ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca na Produkcji oraz montażu Ogrodzeń Betonowych i Panelowych",
        "category": "olx",
        "phone": "500333013",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię dwie osoby do Praca na Produkcji oraz montażu Ogrodzeń Betonowych i Panelowych. Praca produkcyjna znajduje się w Przasnyszu , a jeśli chodzi o montaże to firma wykonuje montaże w Przasnyszu i okolicach . Praca głównie Akordowa .\n\n  Miła atmosfera w pracy . Mile widziane prawo jazdy kat. B. zapraszamy do kontaktu.\n\nBestBet Przasnysz ul. Królewiecka 1",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Робота в Польщі! Друкарня! Типография!",
        "category": "olx",
        "phone": "784995207",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Польська компанія HUMAN PRO LOGISTIKS (NIP 8992782612, REGON 363650372) (W Krajowym Rejestrze Agencji zatrudnienia widniejemy pod numerem 14341) терміново потребує працівників на друкарню.\n\nРобоче місце: Вишкув (біля Варшави)\nвкидання в газети рекламок, візиток, пакування картонів...\nупаковка газет, журналів в кульочки..\nподача паперу на друкарські станки, складання готових газет та журналів та інші допоміжні роботи.\n\nОплата 13,80 злотих за годину денна зміна, 16,50 – нічна (нетто)\n\nОсоби до 26 років отримують приблизно на 1 злотий на годину більше\n\nРобота по 12 годин.\nРобота на години може чергуватися з роботою на акорд (від виробітку) (для жінок)\n\nПеревага для власників відкритої робочої візи.\n\nМожна по біометричних паспортах.\n\nДзвоніть +380970797803 - Христина, +380986670159 - Марія — тел. і Viber\n\nТелефон польського офісу - +48784995207 Vera, +48668132164 Катя.\n\nНаші послуги для Вас безплатні.\n\nDo oferty prosimy dołączyć oświadczenie:\n\n \n\nWyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z ustawą z dnia 10 maja 2018 roku o ochronie danych osobowych (Dz. Ustaw z 2018, poz. 1000) oraz zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Ustawiacz maszyn i urządzeń produkcyjnych",
        "category": "olx",
        "phone": "693564670",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Twoja odpowiedzialność:\n\nprzygotowanie maszyn do wykonywania zaplanowanych zadań produkcyjnych (przezbrajanie);\nostrzenie i wymiana narzędzi;\nnadzorowanie pracy maszyn i urządzeń pod kątem jakości i wydajności\n\nNasze oczekiwania:\n\ngotowość do pracy w systemie 3-zmianowym\n wykształcenia min. zawodowego, mile widziane średnie techniczne\ndoświadczenia na podobnym stanowisku (operator, mechanik) w firmie produkcyjnej\n znajomości budowy maszyn\n\nNasza oferta:\n\n praca od poniedziałku do piątku w systemie 3 zmianowym (godziny nocne dodatkowo płatne)\n umowa o pracę, stawka zasadnicza + premia\n wstępne szkolenia jakościowe i technologiczne oraz możliwość rozwoju zawodowego\ndarmowy dojazd z Pułtuska, Makowa Mazowieckiego oraz Sońska",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Miletis Polska Sp.z o.o. Kontroler Jakości",
        "category": "olx",
        "phone": "539819217",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Miletis Polska Sp. z o.o., firma zajmująca się projektowaniem i wytwarzaniem displayów reklamowych, poszukuje osoby na stanowisko:\n\nKONTROLER JAKOŚCI\n\nMiejsce pracy: TURZYN k. Wyszkowa (woj. mazowieckie)\n\nZakres obowiązków:\n\n·       Analiza dokumentacji projektowej\n\n·       Sprawdzenie zgodności cech produktu z wymaganiami technicznymi projektu\n\n·       Weryfikacja elementów dostarczonych przez klientów zewnętrznych\n\n·       Ocena funkcjonalności projektowanych rozwiązań\n\n·       Bieżące raportowanie/współpraca z Szefami Projektów w zakresie kontroli produktów\n\n·       Przygotowywanie raportów pokontrolnych\n\nWymagania:\n\n·       Wykształcenie techniczne\n\n·       Znajomość zasad rysunku technicznego\n\n·       Podstawowa umiejętność rysowania odręcznego\n\n·       znajomość narzędzi i przyrządów pomiarowych\n\n·       Znajomość podstawowych procesów technologicznych w obróbce metalu, tworzyw sztucznych, surowców drewnopochodnych\n\n·       Zmysł techniczny i pomysłowe podejście do rozwiązywania problemów technologicznych\n\n·       Dokładność, sumienność i terminowość\n\n·       Mile widziane doświadczenie na podobnym stanowisku lub w branży POS\n\n·       Gotowość do podróży służbowych\n\n·       Znajomość języka angielskiego będzie dodatkowym atutem\n\n \n\nOferujemy:\n\n \n\n·       Umowę o pracę (pensja podstawowa + premia)\n\n·       Możliwość uczenia się od doświadczonych specjalistów\n\n·       Szkolenia\n\n·       Pracę w młodym zgranym zespole\n\n·       Oferujemy też bonusy socjalne\n\n \n\nZainteresowanych kandydatów uprzejmie prosimy o przesyłanie swoich aplikacji ( CV ze zdjęciem, list motywacyjny) z zamieszczoną klauzulą: „ Zgodnie z ustawą o ochronie danych osobowych z dnia 29.08.1997 wyrażam zgodę na przetwarzanie danych osobowych zawartych w mojej ofercie pracy dla potrzeb procesu rekrutacji”.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "ŚLUSARZ - pomocnik spawacza",
        "category": "olx",
        "phone": "505077425",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy osoby na stanowisko :\n\nŚLUSARZ - POMOCNIK SPAWACZA\n\nDo obowiązków należy :\n\nszlifowanie\nwiercenie\ncięcie na wymiar na pile\n\nMile widziane uprawnienia na wózek widłowy. \n\nOsoby zainteresowane prosimy o przesłanie CV przez portal olx oraz kontakt telefoniczny.\n\nW CV prosimy o dołączenie klauzuli :\n\nZgodnie z art.6 ust.1 lit.a ogólnego rozporządzenia o ochronie danych osobowych z dnia 27 kwietnia 2016 r. (Dz.Urz. UE L 119 Z 04.05.2016) wyrażam zgodę na przetwarzanie przez firmę Cynklak konstrukcje s.c. moich danych osobowych dla potrzeb aktualnej oraz przyszłych rekrutacji.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Stolarz meblowy z doświadczeniem",
        "category": "olx",
        "phone": "505574765",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy stolarza meblowego z doświadczeniem, Głównie składanie, skręcanie mebli na hali. Zajmujemy się produkcją mebli na wymiar (kuchnie, szafy, garderoby, wszystkie zabudowy nietypowe).\n\nOferujemy:\nStała pracę w zgranym zespole,\nUmowę o pracę, \nMiłą atmosferę pracy,\nWynagrodzenie adekwatne do umiejętności,\nMożliwość rozwoju.\n\nOczekujemy:\nUmiejetnosc posługiwania się elektronarzędziami,\nSumienność i precyzyjność w wykonywanej pracy,\nBrak nałogów,\nMile widziane prawo jazdy kat. B\nI doświadczenie w skręcaniu mebli.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Tokarz/frezer- obróbka metali",
        "category": "olx",
        "phone": "297425011",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Pomel Sp. z o.o., firma produkcyjna o zasięgu międzynarodowym, dostawca części dla przemysłu motoryzacyjnego, budowlanego i rolniczego zatrudni:\n\nTOKARZA/ FREZERA\n\nWymagania:\n\n·        wykształcenie techniczne/zawodowe o kierunku mechanicznym,\n\nwiedza z zakresu obróbki skrawaniem (umiejętność doboru narzędzi, parametrów obróbki),\ndoświadczenie na podobnym stanowisku, \numiejętność czytania rysunku technicznego,\nsamodzielność,\nzdolności manualne i organizatorskie.\n\n”Wyrażam zgodę na przetwarzanie moich danych osobowych w procesie rekrutacji na stanowisko……….. prowadzonej przez firmę POMEL Sp. z o.o. z siedzibą w Wyszkowie zgodnie z art. 13 ust. 1 i 2 rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (Dz. Urz. UE L 119/1 z 4.5.2016 r.).\n\nPonadto wyrażam zgodę na wykorzystanie mojego CV w przyszłych procesach rekrutacyjnych organizowanych przez firmę POMEL Sp. z o.o.” ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnię pracownika fizycznego na tartak",
        "category": "olx",
        "phone": "608014428",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię pracownika fizycznego do prac przy obróbce drewna oraz wycince drzew",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Operator maszyn produkcyjnych",
        "category": "olx",
        "phone": "882189793",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Miejsce pracy: Legionowo\n\nManpower (Agencja zatrudnienia nr 412) to globalna firma o ponad 70-letnim doświadczeniu, działająca w 82 krajach. Na polskim rynku jesteśmy od 2001 roku i obecnie posiadamy prawie 35 oddziałów w całym kraju. Naszym celem jest otwieranie przed kandydatami nowych możliwości, pomoc w znalezieniu pracy odpowiadającej ich kwalifikacjom i doświadczeniu. Skontaktuj się z nami - to nic nie kosztuje, możesz za to zyskać profesjonalne doradztwo i wymarzoną pracę!\n\nDla jednego z naszych klientów poszukujemy osoby na stanowisko:\n\nOperator maszyn produkcyjnych\n\nZakres obowiązków\n• Bieżąca obsługa maszyn i urządzeń sterowanych komputerowo\n• Konserwacja i kontrola stanu technicznego maszyn\n• Usuwanie drobnych awarii maszyn i urządzeń produkcyjnych\n\nOczekiwania\n• Doświadczenie na analogicznym stanowisku\n• Umiejętność obsługi narzędzi kontrolno-pomiarowych\n• Mile widziane wykształcenie zawodowe techniczne\n\nOferta\n• Bezpośrednie zatrudnienie u klienta na podstawie umowy o pracę\n• Atrakcyjne wynagrodzenie: podstawa + premie\n• Pakiet benefitów: opieka medyczna, ubezpieczenie, karta MultiSport, dofinansowanie wczasów, nagrody świąteczne\n• Praca w systemie 2-zmianowym (6-18,18-6)\n \nNumer ref.: OMP/057/DSI\nOferta dotyczy pracy stałej",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca w tartaku Nowy Krasnosielc",
        "category": "olx",
        "phone": "608036516",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię do pracy w tartaku w Nowym Krasnosielcu, więcej informacji pod numerem telefonu: 608-036-516",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Mechanik/Elektryk/Pracownik Fizyczny",
        "category": "olx",
        "phone": "506642425",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Jesteśmy rodzinną firmą, która w sposób szczególny ceni takie wartości jak szacunek, uczciwość i zamiłowanie do tradycji. Jako pracodawca dbamy o dobrą atmosferę w zespole, nie tworząc żadnych podziałów. Jesteśmy zgrani a nasza pasja i zaangażowanie to codzienność.\n\nJeśli takie podejście jest bliskie również Tobie dołącz do naszego Zespołu!\n\nW związku z intensywnym rozwojem firmy aktualnie prowadzimy rekrutację na następujące stanowiska:\n\nMechanik nr ref. MECH/0012/OLX\n\nElektryk nr ref. ELE/0012/OLX\n\nPracownik Fizyczny ref. PFM/008/OLX\n\nOd kandydatów oczekujemy:\n\n- zaangażowania w realizację powierzonych zadań\n\n- sumienności i uczciwości\n\n- bardzo dobrej organizacji czasu pracy\n\n- umiejętności pracy w zespole\n\n- mile widziane doświadczenie w pracy na podobnym stanowisku\n\n- w przypadku elektryka mile widziane uprawnienia SEP\n\nOferujemy:\n\n- pracę w firmie o ugruntowanej pozycji na rynku w przyjaznym i pomocnym zespole\n\n- stabilne warunki zatrudnienia na podstawie umowy o pracę i atrakcyjne wynagrodzenie\n\n- możliwość zakwaterowania opłaconego przez pracodawcę\n\nAplikacje, z podaniem numeru referencyjnego, prosimy przesyłać mailem, pocztą tradycyjną: Getmor sp. z o.o. sp. k., Chrzanowo 28, 06-225 Rzewnie, poprzez opcję KONTAKT na www.getmor.pl lub składać bezpośrednio w siedzibie firmy.\n\nMogą Państwo skontaktować się również telefonicznie, tel. 506 642 425.\n\nInformację o przetwarzaniu danych osobowych mogą Państwo uzyskać na stronie internetowej www.getmor.pl.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca - Operator maszyny",
        "category": "olx",
        "phone": "297173711",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Mazowiecka Spółka Mleczarska S.A. poszukuje kandydata na stanowisko\n\n                                                    OPERATOR MASZYNY PAKUJĄCEJ\n\n                                  Miejsce pracy: Zakład Produkcyjny w Makowie Mazowieckim\n\nGłówne zadania:\n\n1. odpowiedzialność za bieżącą obsługę urządzeń produkcyjnych\n\n2. kontrola pracy urządzeń produkcyjnych\n\n3. wykonywanie planu produkcyjnego\n\nWymagania:\n\n1.    doświadczenie zawodowe mile widziane\n\n2.   gotowość do pracy w systemie zmianowym\n\n3.  książeczka do celów sanitarno - epidemiologicznych\n\nOferujemy:\n\n 1. atrakcyjną i kreatywną pracę w rozwijającej się firmie\n\n 2. możliwość rozwoju zawodowego oraz poszerzania wiedzy i umiejętności poprzez udział w szkoleniach i realizowanych projektach\n\n 3. wynagrodzenie adekwatne do posiadanych umiejętności\n\nProsimy o zawarcie w CV klauzuli: „Wyrażam zgodę na przetwarzanie danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji prowadzonego przez Mazowiecka Spółka Mleczarska S.A. z siedzibą w Warszawie ul. Hoża 51, 00-681 Warszawa zgodnie z ustawą z dnia 29 sierpnia 1997 r. o ochronie danych osobowych (t.j. Dz. U. z 2016 r., poz. 922)”.\n\nJednocześnie wyrażam zgodę na przetwarzanie przez ogłoszeniodawcę moich danych osobowych na potrzeby przyszłych rekrutacji w tym również na inne stanowiska.\n\nInformujemy, że Administratorem danych jest Mazowiecka Spółka Mleczarska S.A. z siedzibą w Warszawie przy ul. Hoża 51. Dane zbierane są dla potrzeb rekrutacji. Ma Pani/Pan prawo dostępu do treści swoich danych oraz ich poprawiania. Podanie danych w zakresie określonym przepisami ustawy z dnia 26 czerwca 1974 r. Kodeks pracy oraz aktów wykonawczych jest obowiązkowe. Podanie dodatkowych danych osobowych jest dobrowolne",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca w zakładzie kamieniarskim",
        "category": "olx",
        "phone": "602800827",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Przyjmę do pracy w zakładzie kamieniarskim.\n\nWymagane:\n\n-prawo jazdy kat. B.\n\nGłówne obowiązki:\n\n- polerowanie kamienia, montaż/demontaż nagrobka \n\nMile widziane doświadczenie (jednak nie wymagane, możliwość przyuczenia).\n\nWięcej informacji pod numerem tel: 602-800-827.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "stolarz meblowy montażysta",
        "category": "olx",
        "phone": "605578407",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię stolarza meblowego, z doświadczeniem. Wyszków. \n\nProdukcja i montaż mebli kuchennych, szafy i zabudowy. \n\nDobre zarobki. \n\nTel. 605-578-407",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Работа на СКЛАДЕ Бедронки от 4000 зл на руки+ Жилье",
        "category": "olx",
        "phone": "48515204200",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Ищешь высокооплачиваемую и стабильную работу в Польше?\n\nПозвони сейчас или напиши на вайбер “работа”, перезвоним в течение дня.\n\nГоворим на русском и украинском языках\n\nПодробности по телефону:\n\nTeл./ Вайбер: +48 517 589 300 \n\nTeл./ Вайбер: +48 515 204 200\n\n(можно писать в Вайбер)\n\n \n\nВсем привет :)\n\nДля начала кратко расскажу, куда ты попал/а. Мы большая дружная команда, в большинстве своем из Украины, работаем в фирме PartWork. Каждый день, на протяжении нескольких лет, встречаемся на нашем месте работы. Наше жилье находится недалеко от работы, поэтому без проблем добираемся пешком. Условия в домах хорошие, есть все необходимое оборудование, поэтому довольно давно здесь живем и не планируем переселяться.\n\nВ процессе работы, конечно, есть перерывы, так что можем спокойно перекусить и пообщаться, появилось здесь немало знакомых. Есть также ночные смены каждой второй недели, задачи те же самые.\n\nЗарплата приходит вовремя, раз в месяц. Когда нужно, можно взять аванс. Это помогает в ситуациях срочных и неотложных. Мы довольны зарплатой. Многие из нас благодаря этому содержат семьи в Украине, Беларуси уже длительный период времени.\n\nЗа вакансии или помощь с оформлением документов ничего не платим. В период работы бесплатно получаем все документы, такие, как приглашение, воеводская виза, карта побыта\n\nНа работе занимаемся комплектацией и загрузкой товаров на поддоны в соответствии с инструкцией от руководства. Подробнее об этом напишем в разделе \"обязанности\".\n\nЗа выполнением заданий следит руководитель, но он отличный, как человек и, если что-то нужно, то всегда можем у него спросить, ну, или у других работников. Еще у нас есть координатор, который подсказывает и помогает во всех остальных делах.\n\nИзначально, в первые дни, будешь работать с одним из нас, пройдешь обучение, возможно у руководителя, так что без проблем разберешься что к чему на практике.\n\nСейчас поступает очень много заказов на склад, поэтому рассчитываем, что ты нам поможешь. Рабочее место уже ждет тебя, можем выслать фото;)\n\nВ целом, это все, что мы хотели рассказать о работе, более подробно расскажем уже лично. Рассчитываем на то, что ты готов работать и зарабатывать вместе с нами!\n\nЕсли тебе интересно, звони прямо сейчас или напиши кратко “работа” на вайбер и отдел рекрутации свяжется с тобой в течение дня.\n\nTeл./ Вайбер: +48 517 589 300 или +48 515 204 200 (можешь писать в вайбер)\n\n \n\nА теперь немного серьезнее :)\n\n \n\nТвоя будущая должность называется:\n\nРАБОТНИК НА СКЛАДЕ\n\nМесто работы в Польше: Вышкув ( возле Варшавы)\n\nМы предлагаем:\n\nCтавка при выполнении нормы 15,50 зл / час;\nЗа перевополнение нормы ставка может возрасти до 20 зл /час на руки;\nСредняя зарплата 3500 – 4000 зл. нетто, работники с опытом зарабатывают 4000 и выше;\nРаботник до 26 лет будет получать к ставке +7 %;\nМы организовываем и оплачиваем курсы для получения прав на управление погрузчиком;\nБесплатный обед на работе;\nПредоставляем жилье ( 250 zł за первый месяц, со второго месяца 400 zł за месяц);\nГибкий график работы (устанавляется лично с руководителем отдела);\nОплачиваемый перерыв;\nРабота 19-23 дня в месяц;\nСмены по 9-11 часов. В месяц выходит около 210 рабочих часов;\nДаем авансы.\n\nТребования:\n\nНе Требуется удостоверение на водителя вилочного погрузчика;\nЖелание долгосрочного сотрудничества ( от 6 месяцев и дольше);\nРабочая виза (D05 или D06) или безвиз на 3 месяца.\n\n.. остальному научим\n\nВаши основные задачи:\n\nКомплектация и погрузка товара в соответствии с заказом магазинов;\nУправление подъемной тележкой до 30 см;\nРабота со сканером;\nУчастие в процессе инвентаризации запасов в соответствии со стандартами компании;\nПомогаем Остаться в Польше на длительное время!\nПостоянное трудоустройство. Даже после окончания визы, мы поможем в открытии годовой визы. Бесплатно готовим документы на карты побыта\n\n.\n\nДополнительные преимущества:\n\nБесплатная медицинская страховка\nВозможность брать авансы\nДостойные комфортные жилищные условия\nБесплатное оформление документов: приглашение, воевудская виза, карта побуту\nДаже после использования всех дней на рабочей полугодовой визе, поможем открыть годовую\nБесплатные вакансии\nБез посредников\nСтабильное трудоустройство\nВозврат переплаты по налогам на твой банковский счет в конце года\nПомогаем оформить семью и детей\nПроживание в новом хорошем и интересном месте :)\n\nЕсли тебе интересно, звони прямо сейчас или напиши кратко “работа” на вайбер и отдел рекрутации свяжется с тобой в течение дня.\n\nTeл./ Вайбер: +48 517 589 300 (можешь писать в вайбер)\n\nTeл./ Вайбер: +48 515 204 200 (можешь писать в вайбер)\n\n \n\nЖдём именно тебя!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "zatrudnię koordynatora produkcji",
        "category": "olx",
        "phone": "797383149",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię na stanowisko koordynatora produkcji, studenta 4 roku lub absolwenta zarządzania, inżynierii produkcji, logistyki lub kierunków ekonomicznych. Praca biurowa,  stanowisko samodzielne w małym zespole. Gwarantujemy szkolenia wdrożeniowe, stabilne zatrudnienie, możliwość rozwoju i awansu. Praca w Wyszkowie pon-piątek 8-16. \n\nKonieczna  dobra znajomość MS Office, umiejętność pracy w zespole, kreatywność i elastyczność działania, umiejętność organizacji pracy i zarządzania czasem, dokładność. Osoba niepaląca  ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Spawacz spawanie konstrukcji lekkich z MOŻLIWOŚCIĄ ZAKWATEROWANIA",
        "category": "olx",
        "phone": "505600502",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy osoby na stanowisko :\n\nSpawacz MIG lekkich konstrukcji\n\nz możliwością zakwaterowania \n\nU Nas zdobędziesz uprawnienia spawalnicze.\n\n \n\nDo obowiązków należy :\n\nprzygotowanie elementów stalowych do spawania\nspawanie lekkich konstrukcji takich jak :\n\nogrodzenia, elementy według zamówienia klienta\n\ndbanie o stanowisko pracy i powierzony towar/sprzęt\n\nOsoby zainteresowane prosimy o przesłanie CV przez portal olx oraz kontakt telefoniczny.\n\n \n\nW CV prosimy o dołączenie klauzuli :\n\nZgodnie z art.6 ust.1 lit.a ogólnego rozporządzenia o ochronie danych osobowych z dnia 27 kwietnia 2016 r. (Dz.Urz. UE L 119 Z 04.05.2016) wyrażam zgodę na przetwarzanie przez firmę Cynklak konstrukcje s.c. moich danych osobowych dla potrzeb aktualnej oraz przyszłych rekrutacji.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pracownik fizyczny do produkcji w Wyszkowie",
        "category": "olx",
        "phone": "602675342",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam \n\n Poszukuje pracownika do pracy fizycznej na produkcji w Wyszkowie\n\n - 5 dni w tygodniu \n\n - praca zmianowa 6-14 14-22\n\n - umowa o pracę \n\n \n\n Wymagania:\n\n -Chęci do pracy",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zakład w Turzynie zatrudni pracownika na halę produkcyjną.",
        "category": "olx",
        "phone": "501172577",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukuję pracownika na stanowisko; operator linii  do granulacji - tworzywa sztuczne Oferujemy: - umowę o pracę - wypłaty zawsze w terminie - elastyczny grafik - premię uzależnioną od wyników pracy - miłą atmosferę pracy -praca dla mężczyzn zaświadczenie o niekaralności Osoby zainteresowane prosimy o wysyłanie CV za pośrednictwem portalu bądź kontakt pod nr tel. 501 -172 -577 tel 512- 349 757\n\nTURZYN  196 C  2  HALA  ZA  CPN  ORLEN  \n\nNie zatrudniamy  z  orzeczeniem .",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnię osoby do prac fizycznych oraz pakowania mięsa",
        "category": "olx",
        "phone": "297437980",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Fima ,,Tadex'' Tadeusz Wiśniewski zatrudni osoby do prostych prac fizycznych, w tym do pakowania mięsa.\n\nOferujemy stabilność zatrudnienia.\n\nIstnieje możliwość zakwaterowania dla osób poza miejscem pracy.\n\nZainteresowanych prosimy o wysłanie CV na adres e-mail: prezes(at)tadex.org lub za pośrednictwem OLX",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca spawacz/ślusarz",
        "category": "olx",
        "phone": "506226755",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Praca polega na spawaniu z elementów metalowych bram, furtek i przęseł ogrodzeniowych oraz innych konstrukcji stalowych z prostych rysunków technicznych jak również montaż u klienta. Do obowiązków należy również przygotowanie materiału (cięcie, szlifowanie)\n\nMile widziane uprawnienia MIG/MAG",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Tartak zatrudni pracowników na różne stanowiska produkcyjne",
        "category": "olx",
        "phone": "574719658",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy pracowników na różne stanowiska produkcyjne. Operator traka taśmowego oraz pomocnik operatora. Nie oczekujemy wyłącznie młodych kandydatów.\n\nOd pracowników oczekujemy:\n\n- rzetelnego i sumiennego wykonywania pracy\n\n- wykazywania minimum inwencji\n\n- przestrzegania dyscypliny pracy i BHP\n\nOferujemy:\n\n- przyuczenie, szkolenie, kursy wg. zajmowanego stanowiska\n\n- pracę na pełny etat\n\n- terminowe i rzetelne wypłaty poborów\n\n- pracę od poniedziałku do piątku, najczęściej na I zmianie\n\n - wynagrodzenie adekwatne do posiadanych kwalifikacji i wkładu pracy\n\nPraca fizyczna. Na początku proponujemy 3 miesięczny okres próbny.\n\nZainteresowanych prosimy o przesłanie CV bądź o kontakt pod nr tel. 574 719 658 ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pracownik fizyczny do prac ogrodniczych",
        "category": "olx",
        "phone": "733242678",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukuję pracownika do prostych prac ogrodniczych - nasadzenia, przygotowanie gruntu pod nawodnienie, grabienie itp. Umiarkowana praca fizyczna. Najchętniej osoba z Przasnysza i najblizszych okolic. Proszę nie pisać, tylko dzwonic. Szczegóły pod numerem tel 733242678, Michał.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca w gospodarstwie",
        "category": "olx",
        "phone": "500863467",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam, \n\nOferuje pracę w gospodarstwie rolnym o profilu mlecznym, do obowiązków należeć będzie pomoc przy dojeniu krów oraz innych codziennych pracach na gospodarstwie.\n Wynagrodzenie ustalamy indywidualnie.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca w gospodarstwie rolnym , Робота на фермі !",
        "category": "olx",
        "phone": "698588514",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam, \n\nOferuję pracę w gospodarstwie rolnym o profilu mlecznym, do obowiązków należeć będzie pomoc przy dojeniu krów oraz innych codziennych pracach.\n\nOferuję zakwaterowanie (oddzielne mieszkanie), wyżywienie. Wynagrodzenie ustalamy indywidualnie.\n\nPraca od zaraz!\n\nWięcej informacji udzielę pod numerem telefonu: 698 588 514\n\nЗдравствуйте,\n\nЯ пропоную роботу на молочній фермі, мої обов’язки включатимуть допомогу з доїнням корів та інші повсякденні справи.\n\nПропоную проживання (окрема квартира), харчування. Винагорода ми встановлюємо індивідуально.\n\nПрацюйте негайно!\n\nЗа додатковою інформацією звертайтесь за телефоном: 698 588 514.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnię do pracy przy zieleni",
        "category": "olx",
        "phone": "603364706",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię do prac fizycznych przy zakładaniu zieleni . Zgłoszenia przez olx lub telefonicznie  . Praca od zaraz",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca w gospodarstwie - dojarz",
        "category": "olx",
        "phone": "533508509",
        "email": "",
        "consumption": "",
        "owner": "damian.wasiak",
        "city": "Maków Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy do pracy w gospodarstwie rolnym.,\n\nStanowisko: dojarz\n\nDój odbywa się przy wykorzystaniu robotów udojowych.\n\nDo obowiązków należeć będzie nadzór nad dojem oraz obserwacja stada.\n\nPraca z możliwością zamieszkania.\n\nGwarantujemy wyżywienie.\n\nMile widziane doświadczenie w gospodarstwie rolnym.\n\nWięcej informacji pod numerem telefonu 534389213 lub 530515518",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    }
];

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