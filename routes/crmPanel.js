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
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kelner/ ka praca od zaraz - Ursynów/ Służew",
        "phone": "721199121",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Jeżeli szukasz pracy jako Kelner/ka lub Barista, dołącz do nas. \n\nMiejsce pracy jest na Ursynowie w pięknym, zabytkowym Forcie Służew.\n\nSpotkanie ws pracy, możliwe jest jeszcze w tym tygodniu - napisz kiedy możesz. \n\nRobimy szkolenia z przygotowania kawy (włoski ekspres), dobierania i serwowania wina i efektywnej sprzedaży. \n\nGwarantujemy stałą pracę, wynagrodzenie na czas i dobrą atmosferę w zespole. \n\nZatrudnienie na umowę o pracę, zlecenie lub inna dogodna forma. \n\nGrafik ustalamy indywidualnie więc wyślij CV, a my odezwiemy się by zaprosić Cię na spotkanie.”",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Restauracja zatrudni szefa kuchni",
        "phone": "605310383",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma gastronomiczna o ugruntowanej pozycji na rynku poszukuje Szefa kuchni \n\nOczekiwania:\n\n- doświadczenie na ww. stanowisku\n\n- dobra organizacja pracy własnej i zespołu\n\n- zaangażowanie w wykonywanie swoich obowiązków \n\n- znajomość kuchni międzynarodowej i polskiej\n\n- znajomość programu Gastro Szef\n\nDo obowiązków osoby zatrudnionej na ww. stanowisku będzie należało:\n\n- organizacja, koordynowanie, planowanie i nadzorowanie pracy zespołu\n\n- przygotowywanie dań oraz nadzór nad ich przygotowywaniem zgodnie z recepturami\n\n- dbanie o najwyższą jakość serwowanych dań\n\n- opracowywanie menu i ofert sezonowych \n\n- przygotowywanie zaopatrzenia na kuchnie\n\n- kontrola dostaw \n\n- obsługa systemu komputerowego \n\nOferujemy:\n\n- stabilne zatrudnienie na umowę o pracę\n\n- atrakcyjne wynagrodzenie\n\n- pracę w profesjonalnym zespole\n\n- przyjemną atmosferę pracy\n\nMiejsce pracy Restauracja Rozdroże, Aleje Ujazdowskie\n\nZapraszamy do składania aplikacji",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kucharz Stacja Grawitacja Bistro",
        "phone": "607246666",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy osoby, która pomoże nam utrzymywać standardy prostych, ale smacznych przekąsek i menu typowego dla kawiarni oraz, która będzie potrafiła utrzymywać porządek i dobrą organizacje zespołu. Fajnie, jeśli posiadasz doświadczenie, ale najważniejsze to dobry smak, zaangażowanie i komunikatywność.\n\nWymagania:\n\nBardzo dobra organizacja pracy,\nAktualne badania sanitarno-epidemiologiczne,\nDyspozycyjność (również w weekendy),\nWysoka dokładność,\nMile widziane doświadczenie w zawodzie,\nKomunikatywność.\n\nObowiązki:\n\nTworzenie nowych pomysłów do menu\nPrzygotowywanie:\n\n Kanapki,\n\n Sałatki,\n\n Pasty – hummus, twarożki,\n\n Frytura – frytki, nuggetsy,\n\n Naleśniki,\n\n Zupy,\n\nOrganizacja pracy na kuchni\n\n Układanie i nadzór nad procesami,\n\n Sprawdzanie stanu magazynowego,\n\n Zamówienia i przyjmowanie dostaw,\n\n Nadzór nad pracownikami,\n\n Współpraca z managerem,\n\n Utrzymywanie porządku i czystości, dbanie i zgłaszanie potrzeb sprzętowych.\n\nZapewniamy:\n\nZatrudnienie na umowę o pracę/zlecenie lub B2B.\nWynagrodzenie stałe 25zł/h + % od obrotu,\nPrzyjazną atmosferę i jasno sprecyzowane wymagania,\nPracę w stabilnej i ciekawej firmie,\nSzkolenia w ramach potrzeb,\nPartnerskie relacje.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Poszukiwany kucharz kuchni azjatyckiej",
        "phone": "516020326",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Sushimania w pod Warszawskich Łomiankach poszukuje pracownika ciepłej kuchni azjatyckiej z doświadczeniem. \nStawka w zależności od doswidecznia. Zapraszamy do kontaktu.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Pomoc kuchenna w kuchni szpitala, ul. Banacha, Warszawa",
        "phone": "507147684",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Rekeep Polska to firma otwarta na różnorodność pracowników i zatrudnienie osób z niepełnosprawnościami. Jesteśmy Liderem w świadczeniu usług cateringu i żywienia zbiorowego w szpitalach na terenie całej Polski. Poszukujemy osób, które dołączą do nas na stanowisku: Pomoc kuchenna\n\nMiejsce pracy: Kuchnia przy Szpitalu, ul. Banacha 1a\n\nZatrudnienie od: 1 lutego 2022\n\nGodziny pracy: do uzgodnienia z kierowniczką obiektu \n\nOferujemy:\n\ndowolną formę zatrudnienia, up/uz\nlunch w dniu pracy\nwsparcie ze strony zespołu\nstały grafik pracy\nstabilne zatrudnienie u lidera w branży cateringu i żywienia\n\n \n\nZakres obowiązków:\n\nobieranie warzyw i owoców\npomoc w przygotowywaniu posiłków\nzmywanie i dezynfekcja naczyń\nsprzątanie pomieszczeń kuchni i ich dezynfekcja\n\n \n\nWymagania:\n\naktualna książeczka sanepidu - warunek konieczny\ngotowość do pracy zmianowej\nuczciwość\nchęć do pracy\n\nOsoby zainteresowane prosimy o kontakt z Kierownikiem Produkcji pod numerem telefonu: 50*******84.\n\nAdministratorem Twoich danych osobowych będzie Rekeep Polska S. A.  z siedzibą w Łodzi przy ulicy Traktorowej 126/202, 91-204 Łódź. W sprawie przetwarzania Twoich danych osobowych możesz się skontaktować z Inspektorem Ochrony Danych Osobowych za pomocą adresu mailowego. Administrator może przekazać Twoje dane osobowe do Spółki (Współadministratora), z którą współtworzy Grupę Kapitałową Rekeep Polska S.A. Przetwarzanie odbędzie się w celu przeprowadzenia rekrutacji i dążenia do zawarcia z Tobą umowy o pracy lub innej umowy cywilno - prawnej. Masz prawo żądania dostępu do danych, sprostowania, usunięcia, wniesienia sprzeciwu, przenoszenia lub ograniczenia ich przetwarzania. Konsekwencją niepodania danych osobowych będzie brak możliwości udziału w procesie rekrutacyjnym. Pełne informacje związane z przetwarzaniem Twoich danych osobowych znajdziesz w Polityce prywatności na stronie internetowej www.rekeep.pl",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Pracownik Pakowalni - Charlie F&F (catering dietetyczny) od lutego",
        "phone": "733111114",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Charlie Food & Friends dzięki swoim wartością działamy w segmencie gastronomi od 12 lat i prężnie rozwijamy naszą działalność. Od 2020 r. uruchomiliśmy catering dietetyczny dla naszych klientów obsługując największe miasta w Polsce i nie tylko.\n\nWięcej informacji o nas www.charliedelivery.pl/o-nas/\n\nW związku z prężnym rozwojem uruchamiamy nową lokalizację dla naszej działalności cateringu. Do nowo powstającego zespołu poszukujemy :\n\nPracownik pakowalni\n\nZakres obowiązków :\n\n• przestrzeganie gramatur posiłków;\n\n• dbanie o aspekt wizualny posiłków\n\n• utrzymywanie czystości i porządku w magazynach oraz chłodniach.\n\n• wpisywanie temperatur kontrolnych\n\n• dbanie o czystość i prawidłowe użycie sprzętów\n\n• prawidłowe zabezpieczanie, półproduktów i wyrobów gotowych.\n\n• bieżące zmywanie\n\nOczekiwania :\n\n• umiejętność pracy w zespole\n\n• samodzielność oraz odpowiedzialne podejście do pracy\n\n• znajomość systemu HACCP, BHP\n\n• punktualność\n\n• pasja i zamiłowanie do gotowania,\n\n• książeczka sanitarno-epidemiologicznej\n\n• gotowość do pracy zmianowej również w święta i weekendy\n\nOferujemy :\n\n• wynagrodzenie od 15 – 17 zł/h netto\n\n• praca zmianowa\n\n• umowa zlecenie, umowa o pracę\n\n• odzież służbowa,\n\n• praca w dobrze wyposażonej kuchni z nowoczesnymi sprzętami,\n\n• możliwość rozwoju zawodowego,\n\n• multisport\n\n• posiłek pracowniczy\n\n• szkolenia\n\nAdministratorem Twoich danych osobowych jest Food Fighters Sp. z o.o. ul.Kościuszki 227 Katowice 40-950. Twoje dane osobowe przetwarzamy wyłącznie w celu przeprowadzenia rekrutacji wskazanej w ofercie pracy oraz do celów przyszłych rekrutacji, jeśli wyraziłeś stosowną zgodę w treści swojej aplikacji",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Kelnerka/Kelner Tutto pizza Ochota",
        "phone": "696420066",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Mała włoska pizzeria na warszawskiej Ochocie poszukuje komunikatywnej, uśmiechniętej osoby na stanowisko Kelner/Kelnerka w pełnym wymiarze czasu, ewentualnie na piątki, soboty, niedziele.\n\nOd kandydatów oczekujemy:\n\nkultury osobistej\n\ndobrej organizacji pracy\n\nodpowiedzialności\n\npunktualności\n\npozytywnego nastawienia\n\nenergii i chęci do pracy\n\ndoświadczenie nie jest wymagane, lecz będzie mile widziane\n\nZe swojej strony oferujemy atrakcyjne wynagrodzenie, stałą, stabilną pracę w zgranym zespole i przyjemnej atmosferze\n\nJeżeli chcesz dołączyć do naszej załogi prześlij nam swoje CV na nasz adres mailowy lub skontaktuj się telefonicznie 69*****66",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Kucharz / pomocnik kucharza w restauracji wege",
        "phone": "690113190",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Opis\n\nDo nowo otwierającej się sieci restauracji Veggie's poszukujemy kucharza oraz pomocy kuchennej!\n\nDo Twoich obowiązków będzie należało:\n\nprzygotowywanie healthy food w ramach usług gastronomicznych\nobsługa urządzeń kuchennych\nutrzymanie czystości w restauracji\nwspółpraca z innymi pracownikami restauracji\n\nNasze wymagania:\n\nkażda osoba przechodzi pełne szkolenie\ndoświadczenie na danym stanowisku - będzie atutem\nwykształcenie gastronomiczne - będzie dodatkowym atutem\numiejętność pracy w zespole\naktualna książeczka sanitarna bądź gotowość do jej wyrobienia\notwartość i komunikatywność\npozytywna energia i pomysłowość\n\nOferujemy:\n\npracę w oparciu o umowę o pracę\npraca bez presji czasu, 8 godzin dziennie\ngwarancję pracy w czasie pandemii lub możliwego lockdown'u\nbardzo atrakcyjne wynagrodzenie + premie\nnauka od doświadczonych kucharzy\nterminowo wypłacane wynagrodzenie\nmożliwość zdobycia praktyki w profesjonalnej kuchni\nmożliwość przyuczenia\nbezpieczeństwo w pracy",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Kelner/kelnerka restauracja Józefów",
        "phone": "608217319",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Praca szuka kelnera. \n\nDzień dobry, poszukujemy kelnera/kelnerki do restauracji sushi w Józefowie \nMiłe widziana znajomość kuchni japońskiej i doświadczenie w pracy kelnera/kelnerki. \nUmiejętność pracy w zespole, łatwe nawiązywanie kontaktów. \nWięcej info pod telefonem 60*******19\nCv można kierować na adres: zarzad.tilia(małpa)gmail.com",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pomoc kuchenna. Centrum Warszawy. Praca w godzinach 6:00 -16:00",
        "phone": "723527729",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Realizujemy zamówienia garmażeryjne do sieci sklepowych, pracujemy 12 miesięcy w roku, podczas pandemii pracowaliśmy regularnie bez przerw.\n\nJesteśmy stałym zespołem pracowników, pracujemy w centrum Warszawy.\n\nOferujemy ciepłe posiłki pracownicze.\n\nZatrudniamy na umowach i płacimy podatki od pracowników.\n\nStałe godziny pracy od poniedziałku do piątku w godzinach 6:00-16:00.\n\nФіксований графік роботи з понеділка по п’ятницю з 6:00 до 16:00.\n\nМи виконуємо замовлення делікатесів у мережах магазинів, працюємо 12 місяців на рік, під час пандемії ми працювали регулярно без перерв. Ми - постійна команда співробітників, ми працюємо в центрі Варшави.\n\nМи пропонуємо гаряче харчування для співробітників.\n\nМи наймаємо за контрактами і сплачуємо податки на працівників.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Osoba do pakowania w cateringu dietetycznym",
        "phone": "508659538",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Catering na Woli zatrudni osobę do pakowania posiłków:\n\nPracujemy:\n\nponiedziałek - piątek 10-18 oraz soboty 10-18\n\nZakres obowiązków:\n\nważenie i porcjowanie posiłków do opakowań\nkompletowanie toreb z gotowymi posiłkami\nutrzymywanie w czystości stanowiska pracy\nkrojenie warzyw i owoców, przygotowanie prostych koktajli z przepisu w czasie, kiedy nie ma gotowych dań do spakowania\n\nWymagania:\n\nważna książeczka sanepidowska\nznajomość polskiego obowiązkowa (mówienie/czytanie), bo tylko to pozwala samodzielnie wykonywać pracę\ndoświadczenie w pracy w cateringu będzie wielkim atutem. Powiedz o tym koniecznie, jeśli już pracowałaś/eś na podobnym stanowisku.\ndyspozycyjność w soboty również\n\nWynagrodzenie 19 PLN netto/h\n\nPraca od ZARAZ.\n\nKuchnia znajduje się przy ul Jana Kaziemierza, na Warszawskiej Woli.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Pilnie zatrudnie piekarza ciastowego oraz piecowego",
        "phone": "602595135",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Piekarnia w Pruszkowie pilnie zatrudni piekarza ciastowego oraz piecowego.Możliwość zakwaterowania.Wysokie zarobki. Zainteresowane osoby proszę o kontakt telefoniczny : 60*******35.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Praca kucharz/pizzer",
        "phone": "660741213",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy osób energicznych, odpowiedzialnych, dyspozycyjnych min.4 dni w tygodniu. Doświadczenie w gastronomii będzie niewątpliwym atutem. Gwarantujemy elastyczny grafik i pracę w miłym zespole.\nPraca w pizzerii w Grójcu.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Samodzielny kucharz z dobrym smakiem i doświadczeniem w cateringu",
        "phone": "511900800",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma BESTCATERING.PL \n\nPoszukujemy SAMODZIELNEGO KUCHARZA do stałej współpracy. Zajmujemy się żywieniem ZBIOROWYM oraz cateringiem wysokobudżetowym.\n\nJeśli posiadasz:\n\nksiążeczkę sanepidu\nznajomością kuchni polskiej i europejskiej,\ndoświadczenie w żywieniu zbiorowym ,\nchęć do pracy i nauki\nzdolności komunikowania oraz ambicję by tworzyć i podnosić swoje umiejętności w cateringu eventowym.\n\nKONIECZNIE DOŁĄCZ DO NAS !!!\n\nOferujemy:\n\n-umowę o pracę\n\n- wynagrodzenie wypłacane na czas.\n\n- zarobki (STAWKA GODZINOWA) uzależnione od doświadczenia lub wynagrodzenie stałe\n\n- zgrany zespół\n\n- wiele pozytywnej energii\n\n- świeże smaczne posiłki\n\nNasza kuchnia znajduje się w Warszawie - Radości.\n\nDla zainteresowanych zapewniamy bezpłatny dojazd do miejsca pracy z PKP Radość!\n\nPracujemy od poniedziałku do piątku plus możliwość pracy w weekendy – dodatkowe wynagrodzenie.\n\nCzekamy zapraszamy!!!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kelnerka/Kelner - Zdrowa Krowa - kuchnia amerykańska, steki, burgery",
        "phone": "605984030",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Jeśli masz doświadczenie albo chciałabyś/chciałbyś zacząć w gastronomii bo lubisz pracę z ludźmi to ta oferta jest dla Ciebie.\n\nSzukamy osób, które umieją sprzedawać, są uśmiechnięte i lubią ludzi. Doświadczenie jest wtórne choć mile widziane.\n\nOferujemy pracę w młodym zespole, elastyczny grafik, punktualne rozliczenia.\n\nPensja na poziomie 17 - 18 zł za godzinę + napiwki i serwis. Umowa zlecenie na początek.\n\nStudenci mile widziani!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kelnerka Restauracja Orientalna na Bemowie",
        "phone": "799945660",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Mała restauracja orientalna na Bemowie poszukuje młodej i energicznej osoby do obsługi gości.\nDoswiadczenie w gastronomii jest mile widziane.\n\nPraca 5 dni w tygodniu (w weekendy również)\n\nOczekujemy:\n- miłej aparycji i uśmiechu\n- dyspozycyjności \n- badania sanepidu \n\nOferujemy:\n- stawkę dzienną 200 zł + tipy\n- elastyczny grafik\n- umowę zlecenie/ o prace \n- prace w miłym zespole \n- posiłek pracowniczy \n\nWypłata raz w tygodniu (wtorek/środa )\n\nDo obowiązków należy:\n- przygotowanie sali do otwarcia \n- przyjmowanie zamówień ( na miejscu i w dostawie)\nPraca w godzinach 9:45-21:45\n\nZainteresowanych prosimy o przesyłanie CV ze zdjęciem",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Bufetowa sprzedawca",
        "phone": "501778780",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię bufetową - sprzedawcę do stołówki pracowniczej Warszawa Wola Park.\n\nPraca w systemie 2 dni pracy 2 dni wolnego 7-19.30 niedziele wolne od pracy.\n\nUmowa o pracę",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kucharz / Pomoc kuchenna",
        "phone": "48535802888",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Nowo otwierająca się restauracja The Spirit w Żyrardowie poszukuje kucharzy z doświadczeniem i bez (do przyuczenia).\n\nLokal- The Spirit- ukierunkowany na fine dining oraz catering.\n\nWszystkie szczegóły względem umowy i zarobków do uzgodnienia na miejscu, a także zależne od doświadczenia.\n\nOferujemy:\n\nMożliwość rozwoju\n\nUniform od butów aż po czapkę :)\n\nMiłą atmosferę\n\nPracę bez awantur i kosmicznych wymagań\n\nStabilną pensję wypłacaną zawsze na czas\n\nPosiłek pracowniczy\n\nZniżki dla pracowników Pałacyku Tyrolskiego\n\nUmowę o pracę/zlecenie.\n\nOczekujemy:\n\nChęci do nauki i zapału do pracy\n\nPoszanowania powierzonego sprzętu\n\nPoszanowania dla drugiej osoby\n\nOsób, które wiedzą że do pracy przychodzimy trzeźwi i bez używek (papierosy dopuszczalne) Książeczki sanitarno-epidemiologicznej\n\nPoważnego podejścia do pracy i ludzi.\n\nCv prosimy przesyłać na adres mailowy: daniel(małpka)palacyktyrolski.com\n\nW dokumentach aplikacyjnych prosimy o umieszczenie zapisu:\n\n„Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z ustawą z dnia 10 maja 2018 roku o ochronie danych osobowych (Dz. Ustaw z 2018, poz. 1000) oraz zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO)).”",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Poszukujemy głównego piekarza do piekarni rzemieślniczej.",
        "phone": "884321180",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Do bałkańskiej piekarni rzemieślniczej poszukujemy głównego piekarza. Praca w godzinach nocnych. Wymagana umiejętność robienia ciasta filo. ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Praca w LODZIARNI Mamma Mia ale Lody Grodzisk Mazowiecki",
        "phone": "502735515",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "LODZIARNIA \" Mamma Mia ale LODY\" poszukuje osób do pracy w sezonie 2022 w naszych punktach w miejscowościach :\n\nPodkowie Leśna, dworzec WKD\nMilanówek, ul. Dworcowa\nGrodzisk Mazowiecki, ul. Bairda\n\nPraca od KWIETNIA do PAŹDZIERNIKA.\n\ndogodna forma zatrudnienia\nelastyczny grafik\n\nZainteresowanych prosimy o kontakt telefoniczny : 50*******15\n\nZatrudnimy chętnie Studentów.  ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pracownik Gastronomii - Pomoc Kuchenna_ Warszawa",
        "phone": "513338158",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Dussmann Polska Sp z o.o. zatrudni do swojego Zespołu.\n\nJesteśmy dobrą, stabilną firmą.\n\nZatrudnimy osoby z doświadczeniem i bez, przyuczymy.\n\nMile widziane osoby z orzeczeniem o niepełnosprawności\n\nPracownik Gastronomii - Pomoc Kuchenna\n\nMiejsce pracy: Warszawa\n\nKontakt telefoniczny: 51*******58\n\nZostaw nam kontakt do siebie - przycisk APLIKUJ!\n\nOferujemy:\n\nDobra, stabilna praca - umowa o pracę\n\nDarmowy posiłek \n\nElastyczny grafik\n\nZwrot kosztów za dojazdy\n\nTERMINOWE WYPŁATY!\n\nWsparcie Zespołu i przełożonego,\n\nOczekujemy:\n\nChęci do podjęcia pracy na stałe,\n\nMile widziane doświadczenie na podobnym stanowisku.\n\nKsiążeczki do celów sanitarno-epidemiologicznych\n\nZadania:\n\nPrzygotowanie prostych dań, pomaganie kucharzom, zmywanie, dystrybucja posiłków na oddziały, utrzymywanie porządku na kuchni\n\nPrzestrzeganie procedur, zasad i obowiązków związanych z utrzymaniem standardów usług.\n\nKontakt telefoniczny: 51*******58\n\nZostaw nam kontakt do siebie - przycisk APLIKUJ!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kucharz / Kucharka do punktu gastronomicznego w Fabryce Norblina",
        "phone": "503064334",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Droga Kucharko, Drogi Kucharzu!\n\nZapraszamy do punktu gastronomicznego PICKNIK w Fabryce Norblina na warszawskiej Woli. Do naszego zespołu poszukujemy osoby komunikatywnej, która odnajdzie się na stanowisku kucharki / kucharza w kuchni ciepłej i zimnej, w realizacji zamówień na miejscu i na wynos.\n\nSpecjalizujemy się w pożywnych śniadaniach, ciepłych bajglach, chrupiących flamach, pierogach z pieca, sałatkach, świeżych lemoniadach, sokach i ciepłych napojach. \n\nObiekt jest czynny 7 dni w tygodniu, codziennie od godziny 9:00 do 22:00, w weekendy do 24:00.\n\nW zakresie Twoich obowiązków będzie:\n\nprzygotowywanie potraw zgodnie z przepisem i kartą menu\nwspółtworzenie receptur\nobsługa klienta (przyjmowanie i wydawanie zamówień)\ntroska o najwyższe standardy świadczonych usług, dobre imię firmy i serdeczną atmosferę w pracy\n\nNasze jedyne wymagania to:\n\ndoświadczenie na podobnym stanowisku\ndyspozycyjność, sumienność, punktualność, zaangażowanie\nbardzo dobra organizacja pracy\numiejętność utrzymania czystości w miejscu pracy\nschludna aparycja i wysoka kultura osobista\nznajomość języka angielskiego mile widziana\naktualna książeczka sanepidu\n\nGwarantujemy:\n\nwynagrodzenie uzależnione od doświadczenia, stawka godzinowa\nsystem bonusowy\nmożliwość rozwoju zawodowego\nmiłą atmosferę\npracę w systemie zmianowym\n\nCzekamy na Twoje zgłoszenie :) \n\nDo zobaczenia!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Restauracja zatrudni barmankę/barmana",
        "phone": "519020888",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja Soul Kitchen zatrudni barmankę/barmana z doświadczeniem.\n\nOferujemy:\n\n-możliwość rozwoju\n\n-pracę w dynamicznie rozwijającym się miejscu\n\n-wynagrodzenie zawsze na czas\n\n-codzienne premie sprzedażowe\n\nOczekujemy:\n\n-dobrej organizacja czasu i miejsca pracy\n\n-zaangażowania\n\n-przestrzegania standardów założonych przez firmę\n\n-komunikatywnej znajomości języka angielskiego\n\nOsoby zainteresowane prosimy o przesyłanie CV na adres mailowy dostępny na stronie restauracji.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Pracownik kawiarni | Warszawa | Praca od zaraz",
        "phone": "783626463",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Pracownik kawiarni.\n\n21 zł brutto/h. Wypłata wynagrodzenia przelewem zaraz po realizacji zlecenia.\n\nMiejsce: Warszawa - różne lokalizacje\n\nData: od zaraz - różne terminy, różne godziny pracy\n\nZakres obowiązków: \n\n- Dbanie o czystość na sali/hali\n\n- Mycie naczyń/ obsługa zmywarki\n\nWymagania:\n\n- zabranie ze sobą i okazanie w kawiarni aktualnego orzeczenia Sanepid\n\n- ubiór zgodny ze standardem\n\n- zadbane dłonie, krótkie paznokcie umożliwiające pracę\n\n. \n\nZarejestruj się klikając przycisk Aplikuj lub zadzwoń 78*****63/6******76",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kucharz / Pomoc kuchenna / Osoba do gotowania",
        "phone": "516072018",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Pizzeria na Nowolipkach zatrudni Osobę do przyrządzania kilku prostych makaronów i sałatek.\n\nGłównym produktem jest u nas pizza, a kuchnia stanowi dodatek do tego miejsca.\n\nPraca jest przyjemna.\n\nGrafik do ustalenia.\n\nMłody zespół.\n\nStawka 17zł. na rękę.\n\nZapraszam do kontaktu.\n\ntel. 51*******18",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Stan Surowy na Warszawskim Wawrze Szuka kucharza!!",
        "phone": "664823527",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Jeśli chcesz dołączyć do młodego i zgranego zespołu zadzwoń lub po prostu wpadnij do nas! \nPoszukujemy osób z pasją do gotowania, uśmiechniętych i takich, które wiedzą co robią i po co to robią. \nCo oferujemy? Wynagrodzenie zawsze na czas, elastyczny grafik, luźną i przyjacielską atmosferę, posiłek pracowniczy oraz pracowniczą zniżkę. Czego oczekujemy? Doświadczenia na stanowisku kucharza, zaangażowania i odpowiedzialności.\nMile widziana aktualna książeczka sanepidowska (jej brak Cię nie wyklucza, w razie potrzeby pomożemy Ci ją wyrobić), wykształcenie zawodowe, zamiłowanie do gotowania.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Pomoc kuchenna w przedszkolu prywatnym",
        "phone": "602761556",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię do pomocy w kuchni przedszkolnej Panią, która:\n- ma doświadczenie w podobnej pracy\n- będzie mogła w razie potrzeby zastąpić kucharkę \n\nPraca na pełen etat. Przedszkole prywatne, znajduje się w okolicy Prima Park. \n\nPoszukuje osoby energicznej, chętnej do pracy, odpowiedzialnej. Najlepiej w wieku 30-49 lat. \n\nPraca od zaraz. Informacje pod nr tel 60*****56.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "kelnerka/kelner na weekendy",
        "phone": "510164038",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja LOFT food&music zatrudni kelnera/kelnerkę na weekendy.\n\nWymagane doświadczenie.\n\nOsoby zainteresowane proszę o wysłanie CV bądź kontakt telefoniczny 51*******38.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Restauracja na Targówku zatrudni pizzera",
        "phone": "501078245",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja na Targówku zatrudni pizzera  lub osobę , która chce się nauczyć tego fachu. Praca może być na cały etat lub dorywczo 1,2 dni w tygodniu. Proponujemy pracę w spokojnej atmosferze. Grafik ustalany indywidualnie.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Zatrudnię osobę na stanowisko zmywające.",
        "phone": "731000521",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię osobę na stanowisko zmywające.\n\nWszelkie informacje udzielone zostaną poprzez kontakt telefoniczny.\n\nZainteresowane osoby zachęcam do podsyłania cv.\n\nMiejsce pracy ul: Wawelska Warszawa.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Poszukujemy szefa kuchni - Qchnia Artystyczna",
        "phone": "226257627",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja Qchnia Artystyczna w Zamku Ujazdowskim, w Centrum Sztuki Współczesnej,\n\nz 30 letnią obecnością na rynku, zatrudni:\n\nszefa kuchni z doświadczeniem, który stworzy zespół.\n\nWynagrodzenie do ustalenia- uzależnione od obowiązków, zaangażowania i formy współpracy.\n\nDla osób spoza Warszawy możliwe zakwaterowanie.\n\nDuża kuchnia z klimatyzacją i potrzebnym sprzętem.\n\nProsimy o przesyłanie CV na qchnia(małpa)qchnia.pl bądź w wiadomości prywatnej.   Tylko poważne oferty.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Pracownik Cukierni/ Cukiernik",
        "phone": "698437638",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Pracownia Cukiernicza, od 5 lat działająca w branży cukiernictwa artystycznego, poszukuje Osoby do pracy przy tworzeniu wyrobów firmowych  - zamówienia indywidualne oraz stałe wyroby z oferty Pracowni. Poszukujemy Osoby z doświadczeniem (  \"domowe tortowanie\" - również możemy rozważyć). Zapewniamy szkolenia, pracę w młodym zespole z pasją do cukiernictwa. Rozważamy różne formy zatrudnienia w zależności od predyspozycji oraz kwalifikacji. Praca od lutego/marca 2022 w Raszyn Rybie - bardzo blisko Portu Lotniczego im. F . Chopina. Osoby zainteresowane zapraszamy do przesłania CV. ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Pomoc Cukiernika / Sprzątanie",
        "phone": "503085893",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Cukiernia z Trojan poszukuje pracownika na produkcję wyrobów cukierniczych, oraz osobę do sprzątania. Praca od poniedziałku do piątku. Więcej informacji pod numerem telefonu: 50*******93",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kelner/ Kelnerka atrakcyjne warunki pracy- PRACA W WEEKENDY",
        "phone": "603976837",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Szukamy do zespołu Moje Curry młodszego Kelnera/Kelnerki z zapałem do pracy. Może być osoba bez doświadczenia, która umie stworzyć właściwą temperaturę relacji z Gościem. Mile widziana książeczka sanepidu. Oferujemy atrakcyjne warunki finansowe, dobrą atmosferę. CV proszę przesyłać na adres e- mail",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pomoc Kucharza",
        "phone": "500098437",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię osobę na stanowisko pomocy kucharza podczas przygotowywania i pakowania posiłków w cateringu dietetycznym.\n\nPraca w pełnym wymiarze godzin, pięć dni w tygodniu od niedzieli do czwartku.\n\nMile widziana umiejętność współpracy w zespole, punktualność, komunikatywność, utrzymanie ładu i porządku na stanowisku pracy. \n\nUmowa o dzieło reszta informacji telefonicznie.\n\ntelefon do kontaktu: 50*****37",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Wola biurowiec restauracja zatrudni na zmywak 15 zł na rękę",
        "phone": "697028403",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy osobę z doświadczeniem na zmywak w restauracji City w biurowcu Retro Wola .Jesteśmy największą w Polsce siecią w systemie\" każda potrawa-jedna cena\". Na stanie zmywarka gastronomiczna.Praca od poniedziałku do piątku w godzinach 8-16. Przeszkolenie przed rozpoczęciem pracy.Blisko stacja metra \"Płocka\"\n\nLokalizacja: Restauracja City Break ul. Skierniewicka 16/20 Warszawa.\n\nZapewniamy:\n\n- stawkę godzinową 15 zł 'na rękę\"\n\n-przeszkolenie przed rozpoczęciem pracy\n\n-posiłek w pracy\n\n-dobrą atmosferę w zgranym zespole\n\nProszę wysyłać cv lub dzwonić\n\nProsimy o zawarcie w CV klauzuli: „Wyrażam zgodę na przetwarzanie danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji prowadzonego przez Reto Food z siedzibą w Stalowej Woli zgodnie z ustawą z dnia 29 sierpnia 1997 r. o ochronie danych osobowych (t.j. Dz. U. z 2016 r., poz. 922)”.\n\nJeśli wyraża Pani/Pan zgodę na przetwarzanie przez ogłoszeniodawcę swoich danych osobowych na potrzeby przyszłych rekrutacji, prosimy o zawarcie takiej zgody w CV.\n\nInformujemy, że Administratorem danych jest Retro Food sp. zo.o. sp.k.. z siedzibą w Stalowej Woli 37-464, ul. Topolowa 66. Dane zbierane są dla potrzeb obecnej rekrutacji a w przypadku wyrażenia przez Panią/Pana wyraźnej i dobrowolnej zgody także dla potrzeb przyszłych rekrutacji. Ma Pani/Pan prawo dostępu do treści swoich danych oraz ich poprawiania. Podanie danych w zakresie określonym przepisami ustawy z dnia 26 czerwca 1974 r. Kodeks pracy oraz aktów wykonawczych jest obowiązkowe. Podanie dodatkowych danych osobowych jest dobrowolne.\n\n ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Zmywak / zmywanie catering dietetyczny, Warszawa, Targówek",
        "phone": "515234510",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Catering dietetyczny poszukuje osoby do zmywania dużych gabarytów, m.in. garnków 100-300 l, blach gn, wózków transportowych, skrzynek.\n\nPraca od niedzieli do czwartku na 2 zmiany.\n\nKuchnia znajduje się na Targówku.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Dostawaca Pizzy Bemowo",
        "phone": "512823248",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Pizzeria San Giovanni zatrudni osoby na stanowisko Dostawcy do lokalu na Powstańców Śląskich.\nOferujemy:\n• pracę w młodym zespole\n• szkolenie\n• miłą atmosferę pracy\n• min 15 dni pracy w miesiącu\n• darmowy posiłek\n\nOczekujemy:\n• doświadczenie mile widziane ale nie koniecznie. Przyuczymy.\n• uśmiechu\n• pozytywnej energii\n• zaangażowania\n• dokładności\n• statusu ucznia/studenta",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "BARISTA poszukiwany",
        "phone": "695809285",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "SPRZEDAWCA/BARISTA\n\nZnana sieć piekarniczo-kawiarniana poszukuje pracownika na stanowisko baristy/sprzedawcy \n\nDo Twoich obowiązków będzie należało:\nobsługa klienta\nprzygotowywanie świeżych kanapek, kawy, soków\nwypiekanie bułeczek i croissantów\ndbanie o porządek i wizerunek lokalu\n\nOferujemy:\nmiłą atmosferę pracy\nszkolenia, np. kawowe\nmożliwość rozwoju i awansu\nelastyczny grafik pracy\n\nWymagamy:\ndokładności przy wykonywaniu powierzonych obowiązków\norzeczenia sanitarno-epidemiologicznego bądź chęci do jego wyrobienia, status studenta\n\nZainteresowane osoby proszę o wiadomosc priv  lub pod nr tel 69*****85",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Sprzedawca, piekarnia rzemieślnicza",
        "phone": "535755808",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Szukamy młodych osób, ENERGICZNYCH do obsługi klienta w PiekarEnce rzemieślniczej na Warszawskiej Białołęce (dokladnie Żerań).\n\nOferujemy pracę zmianowa:\n6-13\n13-20\nOkoło 4/5 dni w tygodniu \n\nOczekujemy jedynie baardzo pozytywnego nastawienia, uśmiechu na twarzy i chęci poznania naszych ręcznie robionych i wypiekanych na miejscu produktów!\n\nInteresujesz się pieczywkiem albo jestes miłośnikiem glutenu to zostaw do siebie kontakt i krótką wiadomość! \n\nMozna nas zobaczyć na facebook.pl/PiekarEnka lub instagramie piekar.enka\n\nDo usłyszenia!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Pomoc kuchenna w Cateringu Dietetycznym .",
        "phone": "534575320",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Dzień dobry.\nPotrzebna jest osoba na stanowisko pomoc kuchenna . Do obowiązków należy krojenie owoców i warzyw , rozkładanie posiłków w pudełka , punktualność , zaangażowanie . \nKuchnia znajduje się na Grochowie praca jest od 8-18 godziny . \nStawka 15-20 zł za godzinę kwota jest zależna od zaangażowania \nWięcej informacji udzielę telefonicznie , prosze o kontakt \n\nWysyłając CV prosimy o dopisanie poniższej klauzuli:\n\nWyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kelner do restauracji i na bankiety",
        "phone": "533444797",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Hotel Pałac i Folwark poszukuje:\n\nkelnerów do pracy w restauracji a'la carte\nbarmanów do obsługi baru\n\nWymagania:\n\nzaangażowanie i dyspozycyjność\nmiłe usposobienie i chęć współpracy z ludźmi\ndoświadczenie w pracy będzie dodatkowym atutem\n\nOferujemy:\n\nstałe zatrudnienie na umowę zlecenie lub umowę o pracę.\n\nWynagrodzenie uzależnione od doświadczenia i umiejętności kandydata.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Obieranie warzyw, zmywanie naczyń,",
        "phone": "662254215",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja i apartamenty na Nowym Świecie , Warszawa poszukuje osoby do pomocy, Zmywanie naczyń, obieranie warzyw,  utrzymywanie czystości w kuchni\n\noferujemy:\n\n-Umowa o prace po okresie próbnym\n\n-Praca w systemie 2 na 2\n\n-darmowy posiłek w trakcie pracy\n\n-30% rabatu w restauracji (dla Ciebie oraz przebywających z Tobą gości)\n\n-30% rabatu na zakupy we wszystkich naszych sklepach spożywczych na terenie Warszawy \n\nOczekujemy:\n\n-chęci do pracy w zespole\n\ndbanie o czystość kuchni oraz sprzętu kuchennego\n\n-dbania o wyposażenie restauracji niezbędne do codziennej pracy.\n\nSerdecznie zapraszamy do przesyłania aktualnego CV",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pizzaiolo/Pizzer do przyuczenia! Wyszkolimy od podstaw! 24zł/h",
        "phone": "508506405",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Proszę o kontakt telefoniczny od 11 mile widziane kobiety oraz obcokrajowcy.\n\n \n\nOferujemy:\n\n \n\n- Stabilne i wysokie zarobki 20-24 brutto zł/h\n\n- Praca na gotowych półproduktach bez produkcji sosów ciasta itd.\n\n- Zgrany zespół\n\n- Posiłki pracownicze\n\n- Ubrania pracownicze\n\n- Możliwość rozwoju i awansu\n\n- Pomoc obcokrajowcom w legalizacji pobytu\n\n- umowę o pracę/zlecenie\n\n-pracę w dynamicznie rozwijającej się firmie z możliwością awansu\n\n-szkolenia\n\nWymagamy:\n\n \n\n- Doświadczenia w gastronomii\n\n- Sumienności, punktualność i pracowitości\n\n-Dyspozycyjność, co najmniej 5 dni w tygodniu\n\n-Dbałość o powierzony sprzęt ,praca w czystości, utrzymywanie porządku w miejscu pracy\n\n-umiejętność pracy w zespole oraz pod presją czasu\n\n-wysoka kultura osobista\n\n-pozytywne nastawienie,\n\n-chęć do nauki\n\n \n\nZainteresowanych prosimy o przesyłanie cv lub kontakt telefoniczny 50*****05",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Работа в Night burger",
        "phone": "736889626",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Ищем работника в Night burger (только парни), опыт работы в гастрономии минимальный, всему научим. Ставка од 17 до 20 zł час на руки, умова о праце. Локализация Praga południe, график с 10.00 до 01.00., 2/2, возможно также подработка пятница, суббота или воскресенье. Контакт 73*****26 Виктор, с 10.00 до 21.00",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Pracownik na produkcję dań do firmy cateringowej",
        "phone": "537840605",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "DPKL Doradztwo Personalne (nr licencji 8709) dla swojego Klienta-firmy cateringowej na Ursynowie -poszukuje kandydatów na stanowisko: Pracownik produkcji w firmie cateringowej\n\n \n\nMiejsce pracy: Ursynów (osiedle Pyry)\n\n \n\nCzas pracy: 5 dni w tygodniu (wliczając sobotę)- wolne niedziele + 1 wybrany dzień w tygodniu\n\nstart 6:00 lub 10:00 rano (do ustalenia z szefem kuchni po dniu próbnym),\n\npraca ok. 9-10 h dziennie, przy większej ilości zamówień 10-11h dziennie\n\n \n\nObowiązki:\n\nw zależności od doświadczenia i umiejętności:\n\nprzygotowywanie półproduktów (krojenie, obieranie warzyw, owoców)\npakowanie i etykietowanie dań\nprzyrządzanie posiłków i pomoc kucharzowi\n\n \n\nWymagania:\n\nbadania do celów sanitarno-epidemiologicznych\ndobra organizacja pracy\ndyspozycyjność do pracy w soboty\n\nOsoby z Ukrainy tylko z Kartą Polaka lub kartą stałego pobytu\n\n \n\nOferujemy:\n\numowę zlecenie\nStawkę 16 zł netto/h na start\nstałą pracę\n\n Osoby zainteresowane ofertą pracy proszone są o przesłanie CV z klauzulą:\n\n \n\n„Wyrażam zgodę na przetwarzanie danych osobowych zawartych w przekazanych przeze mnie dokumentach aplikacyjnych na potrzeby prowadzonej rekrutacji. Swoje dane podaję dobrowolnie, wiem o prawie do ich dostępu i poprawiania oraz że zgoda może być odwołana w każdym czasie.”\n\n \n\nlub:\n\n \n\n„Wyrażam zgodę na przetwarzanie danych osobowych zawartych w przekazanych przeze mnie dokumentach aplikacyjnych, zarówno na potrzeby prowadzonej obecnie rekrutacji, jak również przyszłych procesów rekrutacyjnych. Swoje dane podaję dobrowolnie, wiem o prawie do ich dostępu i poprawiania oraz że zgoda może być odwołana w każdym czasie.”\n\n \n\nInformujemy, że:\n\n \n\nadministratorem Pana/i danych osobowych zawartych w przekazanych przez Pana/Panią dokumentach aplikacyjnych będzie Katarzyna Łasiewicka, prowadząca działalność gospodarczą pod firmą DPKL Katarzyna Łasiewicka z siedzibą w Warszawie przy ul. Rembielińskiej 20/230, 03-352 Warszawa;\n\n \n\nPana/i dane osobowe przetwarzane będą w celach rekrutacyjnych na podstawie wyrażonej przez Pana/ią zgody (art. 6 ust. 1 pkt a) RODO);\n\n \n\nodbiorcą Pana/i danych osobowych będzie nasz Klient\n\n \n\nposiada Pan/i prawo dostępu do treści swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, jak również prawo do przenoszenia danych oraz wniesienia sprzeciwu wobec przetwarzania;\n\n \n\nposiada Pan/i prawo do cofnięcia zgody w dowolnym momencie bez wpływu na zgodność z prawem przetwarzania, którego dokonano na podstawie zgody przed jej cofnięciem. Oświadczenie o cofnięciu zgody prosimy przesłać drogą elektroniczną na adres: biuro(małpka)dpkl.pl lub pocztą tradycyjną na adres ul. Rembielińskiej 20/230, 03-352 Warszawa;\n\n \n\nma Pan/i prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych, gdy uzna Pan/i, iż przetwarzanie danych osobowych Pana/i dotyczących narusza przepisy prawa;\n\n \n\npodanie danych jest dobrowolne, ale niezbędne w celu wzięcia udziału w procesie rekrutacji;\n\n \n\nPańskie dane zostaną usunięte po zakończeniu procesu rekrutacji, chyba że wyrazi Pan/i zgodę na przetwarzanie danych osobowych przez administratora także w celu przyszłych rekrutacji. W razie wyrażenia zgody na przetwarzanie danych w celu przyszłych rekrutacji Pańskie dane zostaną usunięte po upływie 3 lat od ich otrzymania;\n\n \n\nW razie wyrażenia zgody na przetwarzanie danych w celu przyszłych rekrutacji odbiorcami Pana/i danych będą podmioty, które zlecą Administratorowi Danych przeprowadzenie rekrutacji w celu poszukiwania dla nich pracownika lub współpracownika o kwalifikacjach, które Pan/i potencjalnie posiada.\n\n ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Ajent Bobby Burger Warszawa",
        "phone": "570994152",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "O nas\n\nBobby Burger to pierwsza i największa polska sieć burgerowni. Marka, która w zaledwie 7 lat istnienia rozwinęła się z jednego food trucka do 43 lokali znajdujących się w dużych miastach, m.in. w Warszawie, Krakowie, Poznaniu, Łodzi, Bydgoszczy, Sopocie, Toruniu czy Lublinie.\n\nMyślisz o prowadzeniu własnego biznesu pod szyldem znanej marki handlowej, na własny rachunek, dobrze trafiłeś! Aplikuj już dziś!\n\nObecnie poszukujemy Ajenta/Partnera Biznesowego\n\nOczekiwania:\n\nprzedsiębiorczość oraz samodzielność w działaniu\nprowadzenie bądź chęć założenia działalności gospodarczej\nznajomość zasad prowadzenia działalności gospodarczej (podatki, umowy, opłaty)\noperatywność\numiejętność rekrutacji oraz motywacji pracowników\npozytywne nastawienie\nzaangażowanie w prowadzenie własnego biznesu pod szyldem Bobby Burger\n\nOferujemy :\n\ngotowy lokal gastronomiczny (pełne wyposażenie)\natrakcyjne wynagrodzenie ajencyjne (gwarancja minimalnego wynagrodzenia bez względu na osiągany obrót 12 000pln netto)\nwsparcie operacyjne oraz marketingowe ze strony centrali Bobby Burger\nSzkolenia przygotowujące do pracy na stanowisku\nPracę w przyjemnej atmosferze z młodymi i energicznymi ludźmi\n\nZa co będziesz odpowiedzialny:\n\nZa sprawne i efektywne funkcjonowanie restauracji,\nza rekrutację i zatrudnienie, rozliczanie pracowników\nNadzorowanie poziomu stanów magazynowych i składanie zamówień,\nNadzór nad estetyką lokalu oraz przestrzeganie zasad BHP oraz HACCP,\nKontrola standardów i jakości świadczonych usług,\nDbanie o dobry wizerunek firmy Bobby Burger\nRozliczenie finansowe lokalu,\nProwadzenie dokumentacji związanej z funkcjonowaniem lokalu.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Poszukujemy pracownika do pracy w kawiarni",
        "phone": "502398841",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy panią na stanowisko kelnerko-barmanka. Praca na pełny etat. Poszukujemy osobę niepalącą , otwartą, lubiącą pracę z ludźmi. W celu umówienia spotkania proszę o kontakt telefoniczny 50*****41",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kierownik zmiany",
        "phone": "519609610",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam\n\nPoszukuję do restauracji włoskiej na Żoliborzu kierownika ( kelnera ) zmianowego oraz kelnera ze znajomością branży gastronomicznej.\nDo obowiązków będzie należało:\n- Dbanie o wizerunek restauracji\n- Bezpośrednia obsługa Gości oraz budowanie z nimi relacji\n- Zarządzanie podległym personelem\n- Rozliczanie dnia ( rozliczanie kelnerów i zamykanie zmiany )\n- Doraźna pomoc przy działaniu restauracji\nPraca w systemie zmianowym ( okolo 15 miesięcznie )\nZapraszamy do kontaktu osoby chętne do podjęcia dłuższej współpracy w renomowanej restauracji.\n\nZgłoszenia prosimy kierować przez portal OLX.\n\nPozdrawiam",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Kucharz kuchnia grillowa",
        "phone": "533410609",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Pomóc kuchenna/kucharz \nPraca w godzinach 10-22\nKuchnia grillowa (burgery, steki,)\nRestauracja Mokotów.\nSzukam soby z doświadczeniem pracy przy grillu.\nSystem pracy do ustalenia. \nZ czasem gdy już będziesz samodzielny i ogarnies wszystko 23 na rękę \nKontakt 53*****09\nMożliwość zakwaterowania za kwotę 500 zł \n\nPoszukujemy również kelnerki i dostawców.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Młodszy kucharz / doświadczoną pomoc kuchni, 22 zł netto",
        "phone": "602320573",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Pizzeria na Bielanach zatrudni młodszego kucharza lub doświadczoną pomoc kuchni do wykonywania prostych makaronów i sałatek.\n\nSzukamy energicznej i sumiennej osoby, która nie boi się pracy i tabaki, umie i lubi gotować, wysoko cenimy sobie jakość.\n\nStawka na początek 22 zł na rękę za godzinę.\n\nPraca w godzinach 11.30-21.00, 11.30-22.00 (pt. - sob.), 15 - 20 dni miesięcznie.\n\nZainteresowanych prosimy o kontakt wyłącznie telefoniczny: 60*******73.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Cukiernia MEGMA zatrudni pomoc cukiernika",
        "phone": "517462397",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Piekarnia-cukiernia MEGMA zatrudni pomoc cukiernika.\n\nMile widziane doświadczenie.\n\nZakres obowiązków:\n\n-przygotowywanie surowców do produkcji\n\n-wykonywanie prostych czynności cukierniczych\n\n-wytwarzanie wyrobów wg receptur\n\n-wydawanie towaru na sklepy\n\n-dbanie o porządek\n\nWymagania:\n\n-dyspozycyjność\n\n-punktualność\n\n-rzetelność w wykonywaniu obowiązków\n\n-dbałość o powierzone produkty i stanowisko\n\n-sumienność\n\nZapewniam stabilne warunki pracy, zarejestrowanie.\n\nAktualnie do naszego zespołu poszukujemy pracowników na stanowisko:\n\nPomoc cukiernika - pełen etat/umowa zlecenie.\n\nMiejsce pracy: Sulejówek, ul.Dworcowa 36",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Przyjmę do pracy w kebabie",
        "phone": "503561337",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam przyjmę miła energiczna chętna  osobę do pracy w foodtrack kebab kurczak z różna  od zaraz miejsce pracy Otwock  praca przyczepa GASTRONOMICZNA. AKTUALNA KSIĄŻKA SANEPIDOWSKA.  Więcej info udzielę pod nr tel. 79*****78 Maciej",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Poranne godziny pracy- przygotowywanie kanapek",
        "phone": "600770374",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy osoby do pracy w godzinach porannych (5.30-11.00) od poniedziałku do piątku.\n\nPraca polega na przygotowywaniu kanapek w kawiarni oraz półproduktów do kanapek.\n\nWymagania:\n\naktualna książeczka sanepidu\n\nchęć porannego wstawania\n\ndbałość o czystość na stanowisku pracy\n\nrzetelność i dokładność\n\numowa zlecenie wg ilości przepracowanych godzin\n\nZapraszamy do kontaktu",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "KELER/KA BARMAN/KA Restauracja ŚWIĘTOSZEK na Starym Mieście w W-wie",
        "phone": "501217211",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "RESTAURACJA \"ŚWIĘTOSZEK\" to jedno z najbardziej wysmakowanych miejsc na kulinarnej mapie Warszawy. RESTAURACJA działa od 1986 na Starym Mieście w Warszawie. W 2018 r. przeszła gruntowny remont, aby zachwycać nie tylko smakiem, ale też stylem. Do naszego zespołu poszukujemy kelnerów/ kelnerki , barmanów/barmanki\n\noraz KUCHARZY Z DOŚWIADCZENIEM\n\nJeżeli :\n\n- Masz chęci do nauki\n\n- Komunikujesz się swobodnie w języku angielskim\n\n- Jesteś punktualna/y\n\n- Jesteś dyspozycyjna/y\n\n-Jesteś uczciwa/y\n\n-Lubisz pracę z ludźmi\n\nOd siebie w zamian za to dajemy:\n\n- Pracę w zespole ludzi z pasją do gastronomii\n\n- Możliwość rozwoju\n\n- Szkolenia produktowe\n\n- Dobre wynagrodzenie\n\n- Terminowe wypłaty\n\n- Fajną atmosferę\n\nZachęcam do wysłania CV :)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Pizzer na pełen etat, \"Pizza Dominium by Domino's\" Piaseczno",
        "phone": "502904128",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Adres: Sierakowskiego 23a\n\nŻeby sprostać wyzwaniom musisz:\n\n- Mieć ukończone 18 lat\n\n- Być osobą dyspozycyjną, zaangażowaną, mającą chęć do nauki\n\n- Być gotowym do bycia członkiem jednego z najlepszych zespołów w branży gastronomicznej!\n\nCzego możesz oczekiwać od nas?\n\n- Stawki: od 21 zł/h do 27 zł/h brutto\n\n- Udziału w rozwoju w jednej z najbardziej rozpoznawalnych marek na rynku w branży gastronomicznej\n\n- Stałej współpracy z doświadczonym zespołem pracowników Biura, Kierowników Restauracji oraz Kierowników Regionalnych, na którym można polegać\n\n- Stałego wsparcia w trakcie okresu wdrożeniowego oraz udziału w wewnętrznych szkoleniach i dostępu do wewnętrznej cyfrowej platformy szkoleniowej\n\n- Możliwości skorzystania z prywatnej opieki zdrowotnej oraz ubezpieczenia NNW od pierwszego dnia pracy\n\n- Posiłku pracowniczego za 5zł\n\n- Zniżki 50% na produkty z naszej karty\n\n- Możliwość awansu na jedno ze stanowisk: Kierownik Zmiany, Kierownik Lokalu\n\nProsimy o dodanie w CV następującej klauzuli:\n\n\"Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu tej oraz przyszłych rekrutacji (zgodnie z ustawą z dnia 10 maja 2018 roku o ochronie danych osobowych (Dz. Ustaw z 2018, poz. 1000) oraz zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO)).\"\n\nInformujemy, że Administratorem danych jest Dominium S.A. z siedzibą w Warszawie przy ul. Dąbrowieckiej 30. Dane zbierane są dla potrzeb rekrutacji. Ma Pani/Pan prawo dostępu do treści swoich danych oraz ich poprawiania. Podanie danych w zakresie określonym przepisami ustawy z dnia 26 czerwca 1974 r. Kodeks pracy oraz aktów wykonawczych jest obowiązkowe. Podanie dodatkowych danych osobowych jest dobrowolne. W każdym czasie możesz cofnąć swoją zgodę, kontaktując się z Pracodawcą/Administratorem Danych.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pracownik w kawiarni Anin",
        "phone": "502269649",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Kawiarnia poszukuje osób do swojego zespołu. Jeżeli jesteś miłą, energiczną, twórczą osobą, lubiącą prace z ludźmi wyślij swoje CV.\nWymagania: wysoka kultura osobista, komunikatywny polski, uczciwość, zaangażowanie, dyspozycyjność książeczka sanepidowska. Miłe widziany status studenta oraz umiejętności w tworzeniu słodkości.\nOferujemy atrakcyjne wynagrodzenie plus bonusy zatrudnienie na podstawie umowy o prace lub zlecenie elastyczny grafik",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kelner/kelenerka Warszawa",
        "phone": "787895742",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Brewski Craft Beer poszukuje kelnerek/kelnerów \nObowiązki:\n-wydawanie gotowych dań \n-dbanie o czystość sali\nOczekujemy:\n-pozytywnego nastawienia\n-dyspozycyjność \n-język angielski na poziomie komunikatywnym \n-doświadczenie mile widziane \nProszę o przesyłanie Cv.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Praca w kinie-Helios Warszawa",
        "phone": "506302444",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Miejsce pracy: Helios Warszawa Blue City\n\nMasz powyżej 26 lat i szukasz dodatkowego zajęcia? \n\n OFERUJEMY:\n\nZdobywanie doświadczenia w Spółce z uznaną pozycją na rynku;\nWspółpracę w dużym i aktywnym zespole;\nElastyczne godziny świadczenia usług;\nMożliwość uczestnictwa w programie Multisport;\nZatrudnienie na podstawie umowy – zlecenia;\n\n WYMAGAMY:\n\nDyspozycyjności;\nUmiejętności pracy w zespole;\nWysokiej kultury osobistej;\nKomunikatywności;\nDokładności i sumienności;\n\nDODATKOWO:\n\nAktualna książeczka sanepidowska będzie atutem\n\n NA CZYM POLEGAJĄ ZADANIA W NASZYM ZESPOLE:\n\nDbanie o wysoką jakość obsługi klienta;\nObsługa kas biletowych, baru i kawiarni;\nUtrzymywanie czystości kina;\n\nWszystkich zainteresowanych, bez względu na wiek i ścieżkę kariery, prosimy o przesyłanie aplikacji na adres e-mail podany w ogłoszeniu\n\nDodatkowo pod każdym ogłoszeniem musi znaleźć się poniższa informacja, bez zastosowania się do niej kandydat nie może uczestniczyć w procesie rekrutacji:\n\nPRZECZYTAJ I ODPOWIEDNIO ZASTOSUJ!\n\n* JEŚLI APLIKUJESZ W PROCESIE REKRUTACJI CIĄGŁEJ „OBSŁUGA KINA” nie zapomnij umieścić klauzuli o treści:\n\n\" Wyrażam zgodę na przetwarzanie moich danych osobowych przez Helios S.A. zawartych w aplikacji na potrzeby procesu rekrutacji przez okres 1 roku od dnia otrzymania aplikacji. Jestem świadomy/a, że mam prawo do wycofania zgody w każdym czasie. Wycofanie zgody nie ma wpływu na zgodność z prawem przetwarzania dokonanego przed jej wycofaniem.\"\n\n ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kelnerka / Kelner",
        "phone": "669208834",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Szukamy osób z doświadczeniem do pracy w OCHO na stanowisku kelnerki oraz kelnera.\n\nOferujemy pracę w przyjaznym środowisku i dobrej atmosferze, stabilnie i dynamicznie rozwijającej się firmie. Stabilne wynagrodzenie oraz zatrudnienie na umowę zlecenie lub umowę o pracę. OCHO to restauracja w Teatrze Ochoty tuż przy Pomniku Lotnika. OCHO to miejsce otwarte dla wszystkich. W trakcie tygodnia w ciągu dnia serwujemy śniadania, lunche oraz dania z karty popołudniowej, a wieczorami koktajle i drinki.\n\nWynagrodzenie adekwatne do doświadczenia i umiejętności.\n\nProsimy o przesyłanie zgłoszeń w odpowiedzi na ogłoszenie przez OLX. ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Pracownik małej gastronomii 3,5 TYS. zł NETTO",
        "phone": "504048869",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy osoby do pracy w lokalu z kuchnią polską.\n\nMieścimy się na pograniczu Żoliborza i Bielan, tuż przy stacji metra Marymont.\n\nZakres obowiązków:\n\nobsługa klientów i kasy fiskalnej\nnakładanie i wydawanie dań\ndbanie o czystość miejsca pracy\npomoc w kuchni\n\nDoświadczenie jest mile widziane, choć nie wymagane. Zapewniamy pełne przeszkolenie.\n\nOferujemy pracę w pełnym wymiarze godzin, od poniedziałku do soboty od 10:30 do 18:30.\n\nMile widziana książeczka sanepidowska i doświadczenie.\n\nWynagrodzenie ok. 3,4-3,8 tys. zł netto/m-c\n\nTelefon kontaktowy: 50*******69",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kucharz do kuchni cateringowej poniedziałek-piątek",
        "phone": "570000694",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy kucharza do kuchni cateringowej \n\nOd poniedziałku do piątku, jedna zmiana\nPraca w dobrej atmosferze, w uporządkowanym systemie\nUmowa o pracę\nWynagrodzenie od 25 zł/h\n\nWięcej informacji pod telefonem: 57*******94",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kucharz- catering dla dzieci",
        "phone": "516406689",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma Cateringowa poszukuje pracownika na stanowisko:\n\nKucharz/Kucharka - przygotowywanie posiłków dla dzieci.\n\nMiejsce Pracy: Stare Babice\n\nGodziny pracy: od 5.00 do 13.00 pn - pt,\n\nOpis stanowiska pracy:\n\nPrzygotowywanie posiłków dla dzieci wg menu.\nDbałość o jakość przyrządzanych posiłków.\nWłaściwe gospodarowanie produktami.\nDbanie o porządek w miejscu pracy.\n\nWymagania:\n\nMinimum dwu letnie doświadczenie w pracy na stanowisku kucharza.\nDobrej organizacji pracy własnej oraz umiejętność pracy w zespole.\nUmiejętności organizowania stanowiska pracy.\nOdpowiedzialność za wykonywane obowiązki.\nSamodzielność.\nPunktualność.\nWażne badania sanitarno-epidemiologiczne.\nZaangażowanie i chęć do pracy.\nWysoka kultura i higiena osobista.\n\nOferujemy:\n\nPracę w wymiarze: 5 dni w tygodniu, 8h/ dziennie: od godziny 5:00 do 13:00  (wolne- soboty, niedziele i święta) \nWynagrodzenie adekwatne do posiadanych umiejętności.\nUmowa o pracę.\nStałe i stabilne miejsce pracy.\nPosiłki pracownicze.\nNiezbędne narzędzia pracy.\nJasne zasady współpracy.\n\nZainteresowane osoby proszę o przesłanie CV lub kontakt telefoniczny.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kasjer-sprzedawca",
        "phone": "507099190",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma gastronomiczna ze stabilną pozycją w branży poszukuje do punktu gastronomicznego w Browarach Warszawskich osoby o wysokiej kulturze osobistej, pozytywnym usposobieniu, punktualnej i uczciwiej na stanowisko kasjer - sprzedawca.\n\nProszę o przesłanie CV poprzez formularz z dopiskiem :\n\n\" Browary Warszawskie\".\n\n20 zł/h",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kelnerka/Kelner, Kierowca, Pomoc do kuchni - RESTAURACJA PIZZERIA HIT",
        "phone": "601306097",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja Pizzeria Hit w Nowym Dworze Mazowieckim - ul. Paderewskiego 4, zatrudni pracowników na stanowiska kelner/kelnerka, kierowca i pomoc do kuchni do rozwożenia pizzy.\n\nPoszukujemy osób chętnych do pracy!\n\npraca na pełen etat\nszukamy osób samodzielnych i odpowiedzialnych\nwykazując chęci przyuczymy do zawodu!\numowa o pracę/umowa zlecenie\nWysyłając zgłoszenie proszę zaznaczyć na jakie stanowisko kelner/kelnerka, kierowca lub pomoc do kuchni.\n\nWięcej informacji:\n\n60*******97\n\nCzekamy na Twoje zgłoszenie!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Dostawca Telepizza Radiowa 18 (Bemowo)",
        "phone": "793917175",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Telepizza zatrudni dostawców z własnym pojazdem (samochód, skuter) lub na skuter firmowy do rozwożenia zamówień.\n\nAdres lokalu : ul. Radiowa 18, Warszawa Bemowo\n\nZakres obowiązków:\n\nDowóz zamówień do klientów\n\nTelefoniczna obsługa klientów\n\nDbanie o czystość na stanowisku pracy\n\nPraca na umowę zlecenie. Możliwość pracy na pełny etat lub tylko w weekendy, elastyczny grafik pracy, na podstawie dyspozycyjności. \nMożliwość dostosowania pracy do zajęć (szkoła, druga praca)\n\nZainteresowała Cię ta oferta – prześlij swoje zgłoszenie z zawartą informacją\n\nWyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb rekrutacji (zgodnie z art. 6 ust. 1 lit. a Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (ogólne rozporządzenie o ochronie danych)).\n\nJednocześnie wyrażam zgodę na przetwarzanie przez ogłoszeniodawcę moich danych osobowych na potrzeby przyszłych rekrutacji.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Recepcjonistka - hotel",
        "phone": "227211810",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Recepcjonistka\nIbis Styles Warszawa West (dawniej Rest Hotel)  oraz Centrum Konferencyjne działa od 1999 roku. W tym okresie nawiązaliśmy i z powodzeniem kontynuujemy współpracę z wieloma polskimi i zagranicznymi kontrahentami zdobywając ich uznanie i szacunek, za wysoką jakość świadczonych usług. Organizujemy konferencje, spotkania biznesowe, imprezy okolicznościowe, a także wesela. \nIbis Styles Warszawa West, zatrudnimy na stałe na stanowisku RECEPCJONISTKA .Nie wymagamy doświadczenia, oferujemy szkolenie stanowiskowe. Praca w systemie zmianowym. Konieczna komunikatywna znajomość j. angielskiego.\nMiejsce pracy:\nHotel ibis Styles Warszawa West, 05- 850 Mory k/W-wy, ul. Poznańska 33 (przedłużenie ul. Połczyńskiej, 600 m za granicą Warszawy)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Atrakcyjne wynagrodzenie dla kelnerek i barmanów !!",
        "phone": "228251650",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Amerykańska restauracja Jeffs, ul. Żwirki i Wigury 32\n\nszuka do swojego zespołu kelnera/kelnerki w pełnym lub nie pełnym wymiarze godzin!\n\nCzego oczekujemy?\n\n• dużo uśmiechu :)\n\n• pozytywnej energii\n\n• profesjonalnej obsługi Gości restauracji\n\n• dbania o porządek na stanowisku pracy\n\n• badań do celów sanitarno-epidemiologicznych lub chęć do jej wyrobienia\n\nW zamian za to gwarantujemy :)\n\n• pracę w młodym zespole\n\n• elastyczny grafik pracy\n\n• szkolenie stanowiskowe - nie musisz mieć doświadczenia, wszystkiego Cię nauczymy :)\n\n• konkurencyjne wynagrodzenie zawsze na czas\n\n• realną szansę rozwoju\n\nA na czym będzie polegać Twoja praca?:)\n\n• na profesjonalnej obsłudze Gości w restauracji według standardów firmy\n\n• dbaniu o porządek na stanowisku pracy\n\n• współpracy z pozostałymi członkami załogi Jeśli lubisz pracę z ludźmi, jesteś uśmiechnięty/a nie boisz się wyzwań to nie czekaj tylko aplikuj i daj się poznać! :) Czekamy na Ciebie! :)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Kelnerka do włoskiej restauracji-Targówek",
        "phone": "507134756",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Do restauracji Cucina na Targówku poszukujemy kelnerki.\n\nOferujemy:\n\n- pracę w miłym oraz młodym zespole\n\n-zmiany w godzinach 11-22 oraz 14-22 ( w weekendy)\n\n-elastyczny grafik\n\n-niezbędne szkolenia\n\n-wynagrodzenie wypłacane terminowo\n\nOczekujemy:\n\n-zaangażowania\n\n-pozytywnego nastawienia\n\n-uśmiechu\n\n-doświadczenie mile widziane, ale nie konieczne\n\nW czasie całej pandemii ani nie zwolniliśmy nikogo, ani nikomu nie obniżyliśmy pensji-dla nas ważny jest zespół.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "pizzer / kucharz",
        "phone": "225996152",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja „SCENA CEGIELNIA by Basico” usytuowana w kompleksie Cegielnia szuka do pracy osób na stanowisko:\n\n-pizzer,\n\n-kucharz,\n\nBasico to miejsce z wieloletnią tradycją, posiadające dwie restauracje w Warszawie. Zgodnie z nazwą jest to prosta kuchnia z daniami Morza Śródziemnego, z przewagą potraw włoskich. \n\nNowo powstały projekt to połączenie restauracji i sceny koncertowej, gdzie odbywać się będą wydarzenia kulturalno-muzyczne z najlepszymi polskimi artystami. \n\nSzukamy osób zaangażowanych, ambitnych, pracowitych i kulturalnych. \n\nOFERUJEMY:\n\n-dobre i stabilne wynagrodzenie,\n\n-pakiet specjalistycznych szkoleń na start,\n\n-ciekawą pracę i możliwość rozwoju w profesjonalnym zespole,\n\nZAKRES OBOWIĄZKÓW:\n\n-przygotowanie dań zgodnie z obowiązującymi standardami i wytycznymi Szefa Kuchni,\n\n-racjonalne gospodarowanie towarem, minimalizowanie strat,\n\n-dbanie o odpowiednią estetykę potraw,\n\n-utrzymywanie porządku i higieny w miejscu pracy,\n\n-dbanie o właściwy stan techniczny urządzeń kuchennych, \n\n-prawidłowe i terminowe wykonywanie zadań powierzonych przez Szefa kuchni wynikających ze specyfikacji zajmowanego stanowiska,\n\n-informowanie przełożonego o wykrytych zagrożeniach,\n\n-zgłaszanie bezpośredniemu przełożonemu wszelkich informacji na temat przygotowywanych posiłków, w szczególności o stanie ich świeżości, brakach magazynowych, potrzebie zamówień produktów,\n\nOCZEKUJEMY:\n\n-Wykształcenia kierunkowego,\n\n-minimum dwuletniego doświadczenia na podobnym stanowisku,\n\n-dodatkowym atutem jest doświadczenie w pracy z kuchnią włoską,\n\n-dyspozycyjności,\n\n-sumienności,\n\n-uczciwości, \n\n \n\nNasza firma wciąż dynamicznie się rozwija, a w związku z tym z miesiąca na miesiąc wzrasta u nas zatrudnienie, gwarantujemy każdemu możliwość rozwoju osobistego oraz awanse na wyższe stanowiska.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "kelner/kelnerka w restauracji hotelowej",
        "phone": "694702186",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Hedera to nieduży hotel usytuowany na pograniczu Warszawy i Puszczy Kampinoskiej, 15 km od centrum, 5 km od granic Warszawy. Bezpośredni dojazd autobusem 719 i 729 z pętli Os. Górczewska.\n\nW związku z dynamicznym rozwojem firmy poszukujemy energicznej i otwartej osoby, która dołączy do naszego zespołu na stanowisku:\n\nKelner/Kelnerka\n\nMiejsce pracy: Stare Babice\n\nOpis stanowiska:\n\nOsoba na w/w stanowisku pracy, będzie odpowiedzialna za obsługę gości w restauracji oraz salach bankietowych.\n\nDo głównych obowiązków będą należeć:\n\n*witanie gości oraz zachęcanie do skorzystania z oferty gastronomicznej hotelu\n\n*sprawna i uprzejma obsługa gości\n\n*pomoc gościom przy wyborze dań i napojów\n\n*budowanie pozytywnych relacji z gośćmi\n\n*ścisła komunikacja oraz współpraca z kuchnią hotelową\n\n*przyjmowanie zamówień telefonicznych oraz rezerwacji\n\n*dbałość o wizerunek hotelu\n\n*nadzorowanie i uzupełnianie stanów magazynowych zgodnie z zasadą FIFO (napojów, alkoholi etc.)\n\nPożądane cechy idealnego kandydata:\n\n*wysoka kultura osobista\n\n*umiejętność pracy w zespole\n\n*komunikatywność\n\n*łatwość nawiązywania kontaktów\n\n*pozytywne nastawienie, poczucie humoru\n\nWymagania:\n\n*mile widziane doświadczenie na podobnym stanowisku pracy\n\n*znajomość języka angielskiego w stopniu komunikatywnym, znajomość innych języków obcych mile widziana\n\n*gotowość do pracy w systemie zmianowym, w tym w godzinach nocnych\n\n*wymagana książeczka do celów sanitarno-epidemiologicznych\n\nOferujemy:\n\n*wysokość stawki płacowej ustalamy indywidualnie w zależności od umiejętności\n\n*zatrudnienie na podstawie umowy o pracę / zlecenie\n\n*premie od utargów, imprez\n\n*pracę w stabilnej firmie\n\n*ubezpieczenie grupowe\n\nOsoby zainteresowane prosimy o przesłanie CV na adres email lub kontakt telefoniczny w godzinach 10-18.\n\nW tytule maila prosimy o wpisanie nazwy stanowiska, na które została wysłana aplikacja.\n\nProsimy o dopisanie klauzuli: \"Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji prowadzanego przez firmę Hedera S.C. ul. Warszawska 344, 05-082 Stare Babice (zgodnie z Ustawą z dnia 29.08.1997 o ochronie danych osobowych, Dz.U. z 2002 r., nr 101",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Samodzielny kucharz, cukiernik z entuzjazmem)",
        "phone": "575051005",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Do kawiarni w centrum Warszawy poszukujemy osoby z entuzjazmem i pomysłami.  \n\nSamodzielne stanowisko:\n\t•\tprzygotowywanie kanapek, przekąsek, sałatek, potraw śniadaniowych.\n\t•\tumiejętne zarządzanie produktami,\n\t•\tdbanie o porządek w miejscu pracy.\n\nOczekujemy:\n\t•\tumiejętności organizacyjne,\n\t•\tumiejętności kulinarne, mile widziane cukiernicze,)\n\t\nOferujemy:\n\t•\tmiłą atmosferę pracy,\n\t•\tstabilne warunki zatrudnienia,\n\t•\tpracę od pn. do pt.\n\t•\twynagrodzenie na czas",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Obsługa klienta/baristka w piekarni. Praca od zaraz!",
        "phone": "796527120",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witamy! \nZatrudnimy do naszego zespołu kandydatek na stanowisko baristka/sprzedawca w piekarni:\n\n\"BAKERY WILANÓW\" na Wilanówie (Klimczaka 1)\n\nOfertujemy umowe zlecenia.\n- Ucznie lub studenci 20,00 zł brutto za godzinę\n- Osoby zgłoszone do ZUS 20,00 brutto za godzinę + 3,00 zł za godzinę\nekwiwalent za pranie odzieży\n\nObowiązki:\n1. Miła obsluga klienta.\n2. Przygotowanie kanapek i kawy.\n3. Dbanie o porządek.\n\nOfertujemy:\n- szkolenie kawowe.\n- dobrą atmosferę w pracy.\n- rozwój.\n\nPraca zmianowa (pn-pt/sb-nd):\n- poranna (6.00-13.00)\n- popołudnie (13.00-21.00)\n\nZainteresowanych proszę wysłać CV lub kontakt za tel. 79*****20.\n\nPozdrawiamy serdecznie:)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Obsługa w kręgielni praca na stałe i weekendy :)",
        "phone": "885261704",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukuje osób chętnych do pracy w w kilku naszych lokalizacjach: Ochota Gocław Saska Kępa Ursynów OPIS STANOWISKA: - sprawna i przyjazna obsługa klientów w kręgielni - przyjmowanie zamówień - obsługa baru - dbanie o wizerunek kręgielni WYMAGANIA: - punktualność - umiejętność pracy w grupie - chęć do pracy i zaangażowanie - otwartość i zaangażowanie badania sanepidowskie WARUNKI ZATRUDNIENIA - terminowe wynagrodzenie - umowa - praca w energicznym zespole :) -możliwość awansu i rozwoju -pakiet socjalny ( opieka medyczna, multisport) Szukamy pracowników na pełny etat oraz w elastycznych godzinach i weekendy . Prosimy o wysyłanie CV lub kontakt telefoniczny :) Do zobaczenia :) Klaudia tel. 88*******04",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kelner do PUZO - Pizza Napoletana w Książenicach",
        "phone": "730908770",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witaj!\n\nJesteś pozytywną osobą, która uwielbia kontakt z ludźmi?\n\nDobrze trafiłeś!\n\nSłyniesz z dobrej samoorganizacji pracy?\n\nDoskonale, to coś dla Ciebie!\n\nSzukasz pracy, w której dobra atmosfera to podstawa?\n\nW takim razie właśnie ją znalazłeś!\n\nDo obowiązków podchodzisz z zaangażowaniem i uśmiechem na twarzy?\n\nTo właśnie Ciebie szukamy!\n\nNajpierw opowiemy o naszej firmie. ;)\n\nRestauracja mieści się w Książenicach koło Grodziska Mazowieckiego. Zdecydowanie lubimy włoski klimat, co potwierdzają dania z naszej karty.\n\nNasz zespół tworzą ludzie uśmiechnięci i pełni pasji, którzy wspólnie chcą stawać się coraz lepsi.\n\nCo jest dla nas najważniejsze? Aby nasi Goście byli obsługiwani tak jak sami byśmy chcieli być obsłużeni. Szukamy kogoś kto dba o porządek, zwraca uwagę na detale i sumiennie podchodzi do obowiązków. W naszej firmie chcemy, aby zespół brał odpowiedzialność za jej rozwój i dobre funkcjonowanie.\n\nKogo szukamy do naszego zespołu? \n\nOsoby na stanowisko kelnera. Doświadczenie mile widziane, natomiast również możemy zapewnić szkolenia na starcie.\n\nCo oferujemy?\n\n-Umowę zlecenie\n\n-Terminowe wynagrodzenia raz w miesiącu\n\n- Elastyczny grafik (Grafik układa cały zespół obsługi)\n\n-Pracę w miłej atmosferze\n\n-Możliwość rozwoju na stanowisku\n\n-Wewnętrzne szkolenia\n\n-Rabaty pracownicze\n\nZa co będziesz odpowiedzialny?\n\n-Obsługiwanie i dbanie o satysfakcję Gości\n\n-Przygotowywanie napojów oraz serwowanie asortymentu barowego\n\n-Dbanie o porządek na sali i za barem\n\n-Dbanie o powierzone sprzęty i asortyment firmowy\n\n-Reprezentowanie firmy w kontaktach z klientami i kontrahentami\n\nCzego oczekujemy?\n\n-Miłej aparycji\n\n-Dyspozycyjności\n\n-Punktualności\n\n-Zaangażowania w wykonywane obowiązki\n\n-Samoorganizacji\n\n-Umiejętności pracy w zespole i pod presją czasu\n\n-Wykonywania innych czynności zleconych przez przełożonego\n\n-Mile widziany status uczeń/student\n\n-Mile widziane prawo jazdy kat. B\n\nChcesz dowiedzieć się czegoś więcej? Zadzwoń, chętnie udzielimy Ci odpowiedzi. \n\nCV prosimy składać przez portal OLX lub pod adresem mailowym z dopisaniem poniższej klauzuli:\n\nWyrażam zgodę na przetwarzanie moich danych osobowych na potrzeby rekrutacji prowadzonej przez firmę KZ Jakub Zieliński z siedzibą w Grodzisku Mazowieckim przy ul. T. Bairda 2/36, 05-825, NIP 5291828509, zgodnie z ustawą o Ochronie Danych Osobowych.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Do Pizzerii Neapolitańskiej / Pizzer / Pizzaiolo / Stawka 30zł / Umowa",
        "phone": "793166755",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam, dziękujemy za zainteresowanie naszą ofertą. \n\nZatrudnię pizzera (Pizzaiolo) do renomowanej pizzerii neapolitańskiej mieszczącej się w okolicach Placu Bankowego w Warszawie. \n\nCo Oferujemy:\n\n- umowę o pracę,\n\n- stawka zależna od doświadczenia, ok. 30zł/h plus premie,\n\n- stabilne miejsce pracy w luźnej, ale profesjonalnej atmosferze,\n\n- pakiet multisport, \n\n- szkolenia podnoszące umiejętności.\n\nCzego Oczekujemy:\n\n- minimum dwuletnie doświadczenie, \n\n- zaangażowania,\n\n- punktualności,\n\n- chęci do pracy, \n\nSzukamy osoby na pełny etat, opcjonalnie na umowę zlecenie. \n\nIstnieje możliwość pracy dorywczej np. 8-13 dni w miesiącu.\n\nCV prosimy wysyłać poprzez formularz - mejlowo lub telefonicznie.\n\nPozdrawiamy zespół CDT",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Zatrudnię kelnerów i barmanów",
        "phone": "505106300",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Klimatyczny pub przy ul. Chmielnej poszukuj kelnerów i barmanów. Praca w młodym zespole prawdziwych pasjonatów. Dobry system wynagrodzeń oraz napiwki.\n\nStawka 18 zł/godzinę.\n\nWarunek konieczny to pozytywne nastawienie na prace z klientem ,uśmiech i dobra organizacja pracy.Szukamy ludzi, którzy naprawdę wiedzą jak wyglada dobry serwis.\n\nOsoby zainteresowane prosimy o przesłanie Cv poprzez portal OLX",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Batida Wilanów - Plac Vogla - kelner / sprzedawca",
        "phone": "502694517",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witamy serdecznie wszystkich zainteresowanych,\n\nDo naszego zespołu w nowo otwieranym lokalu w Wilanowie - Zawady (plac Vogla). Otwarcie lokalu planowane jest na koniec marca 2022, szkolenia będą odbywać się w lokalach na Krakowskim Przedmieściu, Koszykach i najwięcej w Konstancinie.\n\nPoszukujemy fajnych i energicznych osób na stanowiska:\n\nLokal Wilanów Plac Vogla - kelner/ sprzedawca\n\nZakres pracy: (kelner/sprzedawca)\n\nsprzedaż produktów zza lady\nbieżące czynności kelnerskie (podawanie i zbieranie ze stolików)\nobsługa ekspresu ciśnieniowego\ndbanie o wygląd oraz czystość lokalu\nsprzedawany asortyment to ciasta, słodycze, wyroby garmażeryjne, napoje zimne i gorące.\n\nWymagania:\n\nważne badania lekarskie i epidemiologiczne\ndoświadczenie pracy w gastronomii / na podobnym stanowisku\nobsługa POS\nangielski na poziomie komunikatywnym\ndyspozycyjność (2 weekendy pracujące)\n\nWynagrodzenie\n\nkelner/sprzedawca - od 17,00 zł netto / h (studenci od 20,00 zł brutto)\n\nDodatkowo:\n\nudział w prowizji od obrotu lokalu od 2 miesiąca pracy\n\nWynagrodzenie w ogłoszeniu podane w kwotach brutto (w zależności od statusu ubezpieczeń społecznych danej osoby). \n\nPraca dla osób szukających stałego zatrudnienia, w pełnym wymiarze pracy (nie tylko dla osób młodych czy studentów) oraz dla osób mogących pracować tylko w weekendy! \n\nCenimy dyspozycyjność, otwartość oraz sumienność.\n\nProponujemy 3 miesięczny okres próbny, po tym okresie stałą umowę, za porozumieniem obu stron. Praca w fajnym i zgranym zespole z ludźmi w wieku od 20+ do 40+.\n\nZapewniamy i oferujemy:\n\nszkolenia (sprzedażowe i baristyczne)\npodstawowy ubiór roboczy (t-shirty i zapaski)\nprzy stałej umowie ubezpieczenia pracownicze\nbadania lekarskie\nmożliwość awansu wewnątrz firmy\n\nZapraszamy do kontaktu. Prosimy o informacje do którego lokalu Państwo aplikują oraz na jakie stanowisko.\n\nPozdrawiamy i zapraszamy!\n\nZespół Batida.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Rzemieślnicza piekarnia zatrudni osobę na stanowisko KUCHARZ",
        "phone": "503608917",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zakres obowiązków:\n\nprzygotowywanie kanapek, sałatek, potraw śniadaniowych;\numiejętne zarządzanie produktami;\ndbanie o porządek w miejscu pracy.\n\nWymagania:\n\nżyczliwość i optymizm;\numiejętności organizacyjne oraz komunikacyjne;\npodstawowe umiejętności kulinarne;\ndoświadczenie zawodowe będzie dodatkowym atutem, aczkolwiek nie jest wymagane.\n\nOferujemy:\n\npozytywną i swobodną atmosferę pracy w ambitnym zespole;\neuropejskie standardy oraz wysoką kulturę pracy;\nstabilne warunki zatrudnienia;\npracę w trybie zmianowym lub pięć dni w tygodniu; (praca w trybie nocnym - 20:00-8:00/22:00-6:00);\nwynagrodzenie w wysokości 3 500-4 000 tyś zł netto w zależności od doświadczenia.\n\nAdministratorem Twoich danych osobowych jest Project Warszawa Sp. z o. o. NIP:5851466758, REGON: 221918280, z siedzibą przy ul. Poznańskiej 16/LU1, 00-680 w Warszawie\n\n ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kucharz do diety pudełkowej poszukiwany - okolice Piaseczna",
        "phone": "690002100",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Kuroniowie Diety - firma gastronomiczna w wielopokoleniową historią - poszukuje do pracy osoby na stanowisko KUCHARZ\n\nZasady pracy:\n\nPraca w systemie 2/2 - 2 dni pracy i 2 dni wolnego lub inne warianty do indywidualnego ustalenia.\n\nOczekiwania:\n\n- doświadczenie na podobnym stanowisku,\n\n- Umiejętność smacznego gotowania zgodnie z recepturami,\n\n- Samodzielność w działaniu,\n\n- Bardzo dobra organizacja Pracy\n\n- B. wysoka kultura osobista,\n\n- Książeczka sanitarna\n\nCo oferujemy?\n\n- Pracę w stabilnej firmie i w dobrej atmosferze,\n\n- Atrakcyjne i konkurencyjne wynagrodzenie zależne od umiejętności i zaangażowania\n\nMiejsce pracy znajduje się w Józefosławiu k. Piaseczna.\n\nWybranym kandydatom zapewniamy możliwość awansu i rozwoju zawodowego.\n\nOsoby zainteresowane prosimy o przesłanie CV lub kontakt telefoniczny w g. 8.00 - 16.00 - 69*******00",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Manager gastronomi cicha woda nieporet",
        "phone": "602698699",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Cicha woda nieporet, Kompleks składający się z hotelu i karczmy zatrudni osobę na stanowisko manager gastronomi. W zakres obowiązków wchodzić będzie kontakt z klientami oraz nadzór nad realizacjami wydarzeń na terenie karczmy i hotelu. Cv tylko na maila.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kucharz Do produkcji garmażeryjnej - Żyrardów",
        "phone": "468552365",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Piekarnia \"Ola\"  zatrudni na pełny etat Kucharza i pomoc kuchenną osób  poszukujących pewnego i stałego zatrudnienia\n\nW pełni przeszkolimy \n\nOferujemy pracę w firmie z tradycjami oraz wieloletnim doświadczeniem.\n\nmożliwość cyklicznego rozwoju\n\nSystem premiowy\n\nZakres obowiązków:\n\nwykonywanie prac produkcyjnych\n\nobsługa maszyn\n\ndbanie o stanowisko pracy\n\nukładanie na wydawkę\n\noferty w formie CV prosimy składać przez OLX, telefonicznie : 46/855 23 65 w godzinach 8-14 lub w siedzibie firmy: Żyrardów ul. Równoległa 3",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Barman/ Barmanka Wilanów",
        "phone": "660805805",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja SM Baraban na warszawskim Wilanowie.\n\nPoszukujemy osób na stanowisko Barman/ Barmanka\n\nJeżeli jesteś osobą pozytywnie nastawioną do życia a uśmiech to Twoje drugie imię,\n\ndo tego szukasz fajnego miejsca, gdzie będziesz mógł rozwijać swoje umiejętności - to nasz zespół jest idealnym miejscem dla Ciebie.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Osoba do pakowania żywności w cateringu BURAK DIETA",
        "phone": "533175130",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma z siedzibą w Radziejowicach-Parcel zajmująca się przygotowywaniem cateringu dietetycznego poszukuje osoby do pakowania żywności.\n\nObowiązki:\n\n- pakowanie żywności do pudełek jednorazowych\n\n- zgrzewanie opakowań na maszynie\n\n- odpowiednie oklejanie pudełek\n\n- składanie pełnych kompletów dań w opakowania zbiorcze.\n\nOczekujemy:\n\n- aktualnej książeczki sanepidowsko-epidemiologicznej\n\n- dokładności i sumienności\n\n- zaangażowania do pracy.\n\n-dojazd we własnym zakresie.\n\nOferujemy:\n\n- praca od niedzieli do piątku w godzinach 9-17\n\n- szkolenie wdrożeniowe przygotowujące do wykonywania zlecenia\n\n- praca na podstawie umowy zlecenie",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Wypasiony PIZZER 24zł/h 4500~6000 na rękę WOLA",
        "phone": "512717767",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukiwany pizzer Proszę o kontakt telefoniczny od 11.\n\n \n\nOferujemy:\n\n \n\n- Stabilne i wysokie zarobki 22-24 brutto zł/h\n\n- Praca na gotowych półproduktach bez produkcji sosów ciasta itd.\n\n- Zgrany zespół\n\n- Posiłki pracownicze\n\n- Ubrania pracownicze\n\n- Możliwość rozwoju i awansu\n\n- Pomoc obcokrajowcom w legalizacji pobytu\n\n-Regularnie wypłacane wynagrodzenie - ok 4500 - 6000 na rękę\n\n \n\nWymagamy:\n\n \n\n- Doświadczenia w gastronomii\n\n- Sumienności i pracowitości\n\n \n\nZainteresowanych prosimy o przesyłanie cv lub kontakt telefoniczny 51*****67",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Pizzermana do pizzeri na Starym Mokotowie",
        "phone": "516233347",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Pizzeria Da Grasso na Starym Mokotowie zatrudni pizzermana z doświadczeniem lub do przyuczenia na 4-5 dni w tygodniu, możliwy grafik 2/2. \nZapraszam do kontaktu",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Kelnerka do klubu. Wysokie zarobki. Tygodniówki",
        "phone": "692049359",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Szukam dziewczyn na stanowisko kelnerki do klubu nocnego.\n\nPraca kelnerki polega na obsłudze sali, przedstawienie karty, sprzedaży oraz wydawaniu zamówień. Jeśli jesteś komunikatywna i dobra w sprzedaży - to praca dla Ciebie!\n\nDoświadczenie nie jest wymagane - zapewniamy (płatne) szkolenie od podstaw.\n\nMoże to być praca dodatkowa (3 dni w tyg) lub na pełny etat (5 dni w tyg). Sama\n\nustalasz swój grafik!\n\nW razie potrzeby zapewniamy zakwaterowanie.\n\nZarobki kelnerki (ok.800-1500+ tygodniowo)\n\nOczekiwania:\n\n- wiek 18+\n\n- chęć do szkolenia\n\n- komunikatywna znajomość języka angielskiego będzie atutem\n\nOferujemy w zamian:\n\n- umowa (możliwe ubezpieczenie)\n\n-wypłata w tygodniówkach\n\n- praca w fajnym, młodym zespole\n\n- wysokie zarobki\n\n- pełne szkolenie\n\nJeśli jesteś zainteresowany/a wyślij swoje CV ze zdjęciem\n\nlub zadzwoń: 69*******59",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Praca Kasjerka Kasjer Bar Orientalny Milanówek pon-pt, kelner kelnerka",
        "phone": "601838679",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy kasjerkę/kasjera do Baru Orientalnego NAM-NINH w Milanówku. Praca polega głównie na przyjmowaniu zamówień, odbieraniu telefonów i dbaniu o czystość sali. Zamówienia realizujemy wyłącznie na wynos. Pracownikowi zapewniamy ciepły posiłek, wodę, kawę, herbatę. Godziny pracy 10:30-19:30 od poniedziałku do piątku. Stawka 17,80zl/h netto, umowa o pracę. Mile widziana znajomość okolicznych miast (dostawy) i doświadczenie w gastronomii, ale nie są to warunki. Prosimy o kontakt wyłącznie osoby pełnoletnie. Zapraszamy :)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Praca w punkcie gastronomicznym",
        "phone": "48790263629",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Bafra Kebab Wólczyńska poszukuje osoby do pracy. Stawiamy na entuzjazm, zaangażowanie i chęć do pracy. Oczekujemy badań SANEPID, prawa jazdy i dobrych wibracji. \n\nZnajdziesz u nas rodzinną atmosferę, wparcie, elastyczny grafik. Nie przeszkadza nam Twój wiek ani brak doświadczenia. Pokaż nam dobre chęci, opowiedz zabawną historię i miej świetny kontakt z ludźmi.\n\nOdwiedź naszą wizytówkę Google.pl i sprawdź dlaczego ludzie nas lubią. My też lubimy ludzi i wierzymy, że Ty polubisz nas.\n\nPolish is essential.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Osoba do pakowania posiłków w cateringu",
        "phone": "512610909",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię osobę do pakowania posiłków w cateringu dietetycznym.\n\nStawka: od 16 zł za godzinę (do ręki). Wynagrodzenie płatne do 10-tego każdego miesiąca za przepracowanie poprzedniego.\nPraca od 9:00 do 17:00, od niedzieli do piątku.\nLokalizacja - Łajski k. Legionowa\nUmowa zlecenie przez pierwsze 6 miesięcy, potem umowa o pracę.\n\nOsoby zainteresowane proszę o przesłanie CV.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "PRACA GASTRO kelrner, obsluga sali",
        "phone": "512345572",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "CZEŚĆ WSZYSTKIM \n\nPRACA OD DZIŚ  - lokalizacja : BIAŁOŁĘKA - ŻERAŃ \n\nSTANOWISKO: Obsługa sali, kelner/ka\n\nPoniedziałek - Piątek  (3-4dni/tyg)\n\ngodz : od 10:00 do 18:00\n\nStawka od 18pln netto (+napiwki)\n\nRozliczenie: tygodniowe / miesięczne\n\nMożliwość pracy dłużej lub krócej. \n\nNowa restauracja o charakterze bistro \n\nCenimy sobie przyjaznych bezkonfliktowych ludzi zapraszamy ba rozmowę kwalifikacyjną lub do kontaktu telefonicznego lub przez wiadomość! \n\nW\n\nMiłego dnia !",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Praca przy produkcji kanapek na noc",
        "phone": "503141519",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy na stanowisko pomoc kuchenna przy produkcji kanapek. Praca na zmianie nocnej. \n\nPreferowany kontakt telefoniczny:\n\n50*******19",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Samodzielny KUCHARZ - Ząbki",
        "phone": "504995641",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja PECORINO w Ząbkach poszukuje: \n\n \n\nKucharz / Kucharka\n\nPoszukujemy samodzielnego kucharza kuchni gorącej i zimniej.\n\nPraca w systemie 2/2 po 12h.\n\nRestauracja czynna jest codziennie.\n\nMiejsce pracy: Ząbki\n\nWymagania:\n\nminimum 2 letnie doświadczenie na stanowisku samodzielnego kucharza\nksiążeczka zdrowia do celów sanitarno-epidemiologicznych\nbardzo dobra organizacja pracy własnej i zespołu\nsamodzielność,\npunktualność,\ndyspozycyjność,\nchęć do pracy w młodym, zgranym zespole",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Firma zatrudni kierowca, pracownik fizyczny, pomoc w kuchni",
        "phone": "508064040",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma obsługująca stołówki szkolne poszukuje pracownika na stanowiska :\n\n-sprzedawca w bufecie szkolnym\n\npomoc w kuchni\n\npracownik fizyczny z prawem jazdy Kat.B\n\nPraca w godzinach 9.00 - 17.00\n\nWolne wszystkie weekendy, święta, ferie, wakacje.\n\nSzukamy osób sumiennych i chętnych do pracy, nie wymagamy doświadczenia jedynie zaangażowania i uczciwości.\n\nZainteresowanych prosimy o kontakt tel. 79*****76",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Kelnerka/kelner - Hotel Palatium ***",
        "phone": "606778267",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Hotel Palatium *** zatrudni osobę na stanowisko kelnera.\n\nWymagania:\n\nobsługa komputera\nobsługa kasy fiskalnej oraz terminala płatniczego\nznajomość języka angielskiego w stopniu komunikatywnym\ndyspozycyjność\numiejętność pracy w zespole\nłatwość w nawiązywaniu kontaktów\n\nOferujemy:\n\nkompleksowe szkolenie z obsługi systemu restauracyjnego oraz zakresu obowiązków na stanowisku kelnera\nelastyczny czas pracy w systemie pracy zmianowej (zmiany 12 h)\nstałe, bardzo dobre warunki zatrudnienia w oparciu o umowę o pracę\n\nNajchętniej widziane osoby z powiatu Grodzisk Mazowiecki i okolic, natomiast istnieje również możliwość zakwaterowania.\n\nOsoby zainteresowane prosimy o przesłanie CV.\n\nZastrzegamy sobie prawo do odpowiedzi tylko na wybrane oferty.\n\nProsimy o zawarcie w CV klauzuli: „Wyrażam zgodę na przetwarzanie danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji prowadzonego przez Multum Sp. z o.o., z siedzibą w Warszawie, ul. Pory 78, zgodnie z ustawą z dnia 29 sierpnia 1997 r. o ochronie danych osobowych (t.j. Dz. U. z 2016 r., poz. 922)”.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kucharz - pilnie poszukiwany",
        "phone": "791123518",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Kucharz PILNIE POSZUKIWANY\n\nDo prężnie działającej restauracji na Powiślu poszukiwani są kucharze.\n\nWymagania:\n\nMinimum rok doświadczenia\n\nSumienność\n\nPunktualność\n\nDobra organizacja pracy\n\nUmiejętność pracy pod presją czasu\n\nDyspozycyjność\n\nOferujemy:\n\nTerminowe wynagrodzenie\n\nSzkolenia\n\nMożliwość rozwijania swojej pasji w zakresie gastronomii\n\nPracę w zgranym, otwartym zespole\n\nInformacje o firmie:\n\nJesteśmy prężnie rozwijającą się firmą w branży gastronomicznej, wkładamy wiele serca w potrawy serwowane naszym gościom, szanujemy każdego pracownika i zależy nam aby każdy mógł się u nas spełniać zawodowo.\n\nWynagrodzenie: 25 pln  netto na rękę, w zależności od umiejętności wynagrodzenie może zostać zwiększone.\n\nKontakt: Michał 79*****18 bądź CV na adres email.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kucharz kuchni wegańskiej. Centrum !",
        "phone": "517341222",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię osobę, do pracy na kuchni ciepłej w wegańskiej restauracji znajdującej się na Pl. Zbawiciela.\n\nPraca w wymiarze czasowym 12/13h dziennie\n\nOczekujemy :\n\n- znajomości języka polskiego\n\n- doświadczenia w pracy na kuchni\n\n- zaangażowania\n\n- dyspozycyjności w weekendy\n\n-punktualności\n\n-umiejętności pracy pod presją czasu\n\n-pozytywnej energii\n\n-higieny pracy\n\nOferujemy :\n\n- prace w młodym zespole\n\n- miłą atmosferę\n\n- stabilność zatrudnienia\n\n- posiłki pracownicze\n\n-stawka w zależności od umiejętności\n\n-tipy do podziału\n\n-możliwość rozwoju w innej kuchni np. Japońskiej ze względu na szerszą działalność firmy\n\nwynagrodzenie NETTO: 19-23zł\n\nStatus studenta mile widziany",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Praca w pączkarni/cukierni przy produkcji pączków",
        "phone": "501053208",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy w pączkarni/cukierni Panie lub studentki na stanowisku przy produkcji pączków. Zapewniamy elastyczne godziny pracy, miłą atmosferę, dobre wynagrodzenie. Nie wymagamy doświadczenia, zapewniamy pełne szkolenia. Praca do wyboru: Żoliborz, Śródmieście, rondo Wiatraczna. Osoby zainteresowane prosimy o kontakt telefoniczny pod numerem 50*****08.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Zostań Kurierem z Pyszne.pl - Dobrze zarabiaj dostarczając jedzenie!",
        "phone": "733315400",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Szukasz dodatkowego zajęcia, stałej pracy lub pracy tylko na weekendy?\n\nŻaden problem! Wystarczy, że:\n\nJesteś osobą pełnoletnią,\nPosiadasz smartfon z dostępem do Internetu.\n\nCo na Ciebie czeka?\n\nStała stawka godzinowa - niezależnie od liczby zrealizowanych zamówień + dodatek za pracę w weekendy.\nElastyczny grafik - Ty decydujesz kiedy chcesz jeździć!\nBonus za zrealizowane zamówienia - im więcej dostarczysz, tym więcej zarobisz ponad stawkę godzinową!\nOdpowiedni strój do pracy - dostosowany do pogody (kurtkę zimową, kask czy nieprzemakalne spodnie).\nRower elektryczny lub skuter elektryczny, ale w niektórych miastach możesz też jeździć na swoim rowerze, za co dostaniesz dodatkowe pieniądze! \nOdpowiednie przeszkolenie do pracy – nie musisz mieć doświadczenia, wszystkiego Cię nauczymy!\nCiągłe wsparcie w pracy – do pomocy będzie zawsze gotowy zespół Koordynatorów i Dyspozytorów.\nBędziesz przez nas ubezpieczony/-a – NNW oraz OC, a dodatkowo, masz również możliwość korzystania z prywatnej opieki medycznej lub ubezpieczenia na życie.\nNapiwki od klientów - nie tylko w gotówce, ale również w aplikacji przy płatności on-line - wszystko trafi do Ciebie!\nPolecaj znajomych do pracy i zgarnij dodatkowe pieniądze!\n\nBędziesz częścią najlepszego zespołu kurierów na świecie - zapewniamy integrację i świetną atmosferę :) \n\nBez ukrytych kosztów!\n\nBez rywalizacji z innymi Kurierami o zamówienia!\n\nBez pośredników!\n\nAplikuj do nas i przekonaj się, że naprawdę warto!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Wiśniewski Warszawa szuka rąk do pracy!",
        "phone": "607832844",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Otwieramy kolejnego Wiśniewskiego. Tym razem w fabryce Norblina/ Warszawa!\n\nSzukamy rąk do pracy...barmanów/ki, kierownika.\n\nJeżeli jesteś osobą kontaktową, wygadaną, pracowitą..zapraszamy:)\n\nDoświadczenie nie jest wymagane...wszystkiego nauczymy;)\n\nOferujemy:\n\nmożliwości rozwoju\nelastyczny grafik\npracę w stabilnej rozwijającej się firmie\ndobre warunki zatrudnienia",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Cukiernik / Deserant / Produkcja TORTÓW",
        "phone": "517761884",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy Cukiernika z doświadczeniem przy produkcji tortów.\n\n \n\n \n\nGłówne obowiązki:\n\nProdukcja wyrobów cukierniczych zgodnie z recepturami\n Umiejętność składania tortów \n Dekorowanie tortów\n Tworzenie ozdób z masy cukrowej\n Tworzenie figurek z masy cukrowej\nOrganizowanie własnego stanowiska pracy\nProwadzenie prób technologicznych, rozszerzanie portfolio asortymentowego firmy\n\nWymagania:\n\nOdpowiedzialność i dobra organizacja pracy\n Doświadczenie w pracy z masą cukrową\n Umiejętność wykonywania figurek z masy cukrowej\n Pasja i miłość do tworzenia pięknych rzeczy z masy cukrowej (i nie tylko)\nZaangażowanie i chęć rozwoju\nDyspozycyjność\nAktualne badania sanitarno-epidemiologiczne;\n\nOferujemy:\n\nPracę w prężnie rozwijającej się firmie;\nAtrakcyjne wynagrodzenie;\nPrzyjazną atmosferę pracy;\nStabilizację, zależy nam na stałej współpracy!\nPrzyuczenie do zawodu.\n\n \n\nProsimy o zawarcie w CV klauzuli: „Wyrażam zgodę na przetwarzanie danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji prowadzonego przez Olsza Olbrysz Sp.j siedzibą w Warszawie zgodnie z ustawą z dnia 29 sierpnia 1997 r. o ochronie danych osobowych (tj. Dz. U. z 2014 r. poz. 1182, 1662)”.\n\n\"Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w przesłanym przeze mnie zgłoszeniu w celu realizacji przez „Olsza” Olbrysz sp. j. z siedzibą w Warszawie procesu rekrutacji. Zostałam/em poinformowana/y, że mam prawo wycofać powyższą zgodę poprzez wysłanie oświadczenia na adres rekrutacja cukierniaolsza.pl Wycofanie zgody nie wpływa na zgodność z prawem przetwarzania, którego dokonano na podstawie zgody przed jej wycofaniem.\"",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kucharz Hotel **",
        "phone": "789309262",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Dwugwiazdkowy hotel polożony 3 km od Lotniska im. Fryderyka Chopina poszukuje kucharza na cały etat. \n \nZADANIA:\nDbałość o jakość, świeżość i prezentację przygotowywanych dań\nUtrzymywanie czystości w miejscu pracy\nRacjonalna gospodarka produktami\n \nOCZEKIWANIA:\n \nDoświadczenie na podobnym stanowisku\nDbałość o higienę oraz czystość miejsca pracy\nGotowość do pracy w systemie zmianowym ( weekendy również )\nSumienność i odpowiedzialność\nAktualne zaświadczenie do celów sanitarno-epidemiologicznych\n \nZapewniamy:\n \nElastyczny grafik pracy\nMiłą atmosferę\nAtrakcyjne wynagrodzenie uzależnione od posiadanego doświadczenia\n \nProsimy o dopisanie w CV klauzuli:\nWyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z ustawą z dnia 10 maja 2018 roku o ochronie danych osobowych (Dz. Ustaw z 2018, poz. 1000) oraz zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO)).",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Praca w Restauracji w Galerii Północnej kasjer / obsługa klienta",
        "phone": "728257594",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy osoby na stanowisko kasjer / obsługa klienta w Restauracji z jedzeniem na wagę w Galerii Północnej ( Warszawa - Białołęka)\n\nCo oferujemy:\n\n-Stałe zatrudnienie w oparciu o umowę o pracę lub dostosowane do pracownika\n\n- płatne szkolenie z obowiązujących standardów\n\n- darmowy posiłek w trakcie wykonywania pracy\n\n- pracę w wesołym i energicznym zespole\n\n- elastyczny grafik praca na zmiany poranne, popołudniowe a także praca w weekendy (oczywiście nie wszystkie :) )\n\nCzego wymagamy:\n\n- umiejętności pracy w zespole i dobrej organizacji pracy\n\n- uczciwości, chęci do pracy i pozytywnego nastawienia\n\nObowiązki na stanowisku:\n\nprodukcja soków i koktajli według receptur\ndbanie o czystość na stanowisku pracy i w bemarach\nobsługa małych urządzeń gastronomicznych (blender, wyciskarka)\nobsługa klientów według naszych standardów, przyjmowanie i wydawanie gotówki\nobsługa drukarek fiskalnych i terminali płatniczych\n\nZapraszamy osoby z doświadczeniem",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pizzer poszukiwany",
        "phone": "730587550",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Szukam pizzera \n\nPraca na piecu elektrycznym na screenach ,dzialamy tylko na dostawy lub odbiór \n\nOferujemy:\n\n-Stawke 20 zł/h(na początek) wypłacane co tydzien na czas\n\n-Posilek pracowniczy\n\n-Szkolenie od zera(doświadczenie mile widziane)\n\n-Możliwość rozwoju\n\n-Pracę w małym,klimatycznym lokalu\n\nOczekiwania:\n\n-Minimalne doswiadczenie w gastro\n\n-Staranność\n\n-Pracowitość\n\n-Dbanie o porządek w miejscu pracy\n\n-Punktualność\n\nZainteresowanych proszę o kontakt ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "NOWE Pracownik RESTAURACJI Mąka i oliwa CH Atrium Reduta",
        "phone": "600370735",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja Mąka i oliwa w Galerii Atrium REDUTA w Warszawie zatrudni PRACOWNIKÓW RESTAURACJI - praca przy obsłudze klienta i kasy.\n\nPRACA OD ZARAZ! Szukamy osób z pełną dyspozycją - praca zmianowa.\n\nNie wymagamy doświadczenia - wszystkiego nauczysz się na miejscu.\n\nMożliwość zatrudnienia na cały etat lub według danej dyspozycyjności ( np. tylko soboty itp.). Łączysz pracę i naukę!\n\nJeśli szukasz pracy na stałe również wyślij do nas CV, zadzwoń lub przyjdź osobiście.\n\nSzukamy osób chętnych do pracy i zaangażowanych.\n\nOferujemy:\n\natrakcyjne wynagrodzenie,\n\nelastyczny grafik\n\nszkolenie stanowiskowe\n\npracę w młodym i sympatycznym zespole.\n\nZainteresowany osoby zapraszamy!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pomoc do kuchni fastfood",
        "phone": "573491030",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Pomoc do kuchni( warzywniak, sosy,frytki ,surowki etc)  do lokalu typu fastfood \nPraca zmianowa.6 dni w tyg.Grafik\nDzielnica: Targowek,Wola\n16zł netto/h / okres próbny / dniówki",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pomocnik/pomocniczka kucharza/zmywak",
        "phone": "48536577474",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Szukamy osoby na stanowisko pomoc kucharza/zmywak Lokalizacja: Mokotów/Śródmieście, stawka 18,50 netto/h. System 2/2. Praca od rana: krojenie warzyw,pomoc kucharzowi. Od 12 do zamknięcia zmywak. Praca od 1go lutego. \n\nZapraszam do kontaktu przez wiadomość olx,proszę podać:\n-dane kontaktowe: nr telefonu, imię i nazwisko \n-doswiadczenie w gastronomii :tak/nie\n- dostępność - pełen etat: tak/nie\n- badania sanepidu - tak/nie\n\nWymagane: pozwolenie na pracę w PL. Znajomość języka polskiego. \n",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kebab 18 - 19zł/h, Praca od ZARAZ Blisko Metro (Natolin)",
        "phone": "48535294294",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja na Ursynowie blisko metra (Natolin) Poszukuje osoby do pracy przy grillu w kebabie. PRACA OD ZARAZ dla zainteresowanych i wcześniej pracujących w kebabie.\n\nGrafik ustalany indywidualnie w zależności od potrzeb pracownika. Szukam osoby na pełny etat.\nWYNAGRODZENIE to 18 - 19 zł netto (na rękę), wypłacane w formie tygodniówek.\n\nWiecej informacji pod numerem telefonu +48*******94.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Restauracja Modern China zatrudni KELNERA / KELNERKĘ",
        "phone": "696944703",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja Modern China poszukuje KELNERA / KELNERKI\n\nOferujemy:\n\n- pracę zmianową\n\n- umowę o pracę lub umowę zlecenie\n\n- stawka godzinowa 18netto (+napiwki)\n\nOczekiwania:\n\n- wymagane doświadczenie w obsłudze gości - minimum 2 lata\n\n- dyspozycyjność\n\n- zaangażowanie\n\n- chęci do pracy\n\n- badania sanepid\n\n- prawo jazdy kat. B\n\nObowiązki\n\n- obsługa Gości zgodnie ze standardami restauracji\n\n- dbanie o wizerunek i estetykę restauracji",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Energiczną Pomoc kuchni do restauracji Pańska 85",
        "phone": "796884016",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Prężnie działająca restauracja Pańska 85 z kuchnią orientalną / Fusion poszukuje osób do pracy jako:\n\nPomoc kuchni :\n\nprzygotowywanie sałatek, obieranie warzyw, krojenie i porcjowanie mięsa, przygotowywanie półproduktów, utrzymanie porządku i czystości na kuchni, rozkładanie dostaw towaru, przygotowywanie przetworów w słoikach.\n\nZmywanie /sprzątanie\n\nZmywanie zastawy stołowej, utrzymanie czystości zaplecza restauracyjnego.\n\nPraca w niepełnym wymiarze godzin na umowę zlecenie lub pełny etat na umowę o pracę.\n\nOsoby odpowiedzialne i punktualne oraz z komunikatywnym językiem polskim",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Ekspedientka. Cukiernia w Warszawie",
        "phone": "506792735",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Opis\n\nCukiernia Olsza poszukuje osób do pracy na stanowisku: ekspedientka / ekspedient do pracy, w lokalach znajdujących się w Warszawie.\n\nOsoba na tym stanowisku będzie odpowiedzialna za:\n\n• profesjonalną obsługę Klientów (prezentacja, doradztwo, sprzedaż)\n\n• dbanie o dobry wizerunek salonu firmowego\n\n• realizację działań związanych z funkcjonowaniem salonu zgodnie ze standardami firmy\n\nPoszukujemy osób: \n\n• komunikatywnych i kreatywnych\n\n• pełnych entuzjazmu i zaangażowania w wykonywane obowiązki\n\n• posiadających dobrą organizację pracy\n\n• dyspozycyjnych\n\nOferujemy:\n\n• pracę w stabilnej i rozwijającej się firmie\n\n• atrakcyjne warunki zatrudnienia\n\n• możliwość rozwoju zawodowego\n\nZapraszamy Prosimy o zawarcie w CV klauzuli: „Wyrażam zgodę na przetwarzanie danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji prowadzonego przez Olsza Olbrysz Sp.J z siedzibą w Warszawie zgodnie z ustawą z dnia 29 sierpnia 1997 r. o ochronie danych osobowych (tj. Dz. U. z 2014 r. poz. 1182, 1662)”. \"Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w przesłanym przeze mnie zgłoszeniu w celu realizacji przez „Olsza” Olbrysz sp. j. z siedzibą w Warszawie procesu rekrutacji. Zostałam/em poinformowana/y, że mam prawo wycofać powyższą zgodę poprzez wysłanie oświadczenia na adres rekrutacja cukierniaolsza.pl Wycofanie zgody nie wpływa na zgodność z prawem przetwarzania, którego dokonano na podstawie zgody przed jej wycofaniem.\"",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Zatrudnie osobe do pakowania posilkow kuchnia cateringowa",
        "phone": "882555040",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię osobę do nakładania i pakowania posiłków .\nPraca 8 godzin dziennie \n8-16 plus niedziela 8 godzin\n\nStawka 17 na rękę \nLokalizacja Warszawa Okecie",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Playhouse Gentleman's Club zatrudni profesjonalnych Kelnerów/Barmanów",
        "phone": "48794007000",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Playhouse Gentleman's Club ( Warszawa, Al. Solidarności 82a) poszukuje profesjonalnych kelnerów/barmanów.\n\nSzukamy osób o wysokiej motywacji do pracy i silnych predyspozycjach.\n\nOczekujemy:\n\n-doświadczenia w pracy w gastronomii,\n\n-dobrej znajomości branży gastronomicznej oraz standardów obsługi gości,\n\n-zrównoważonego i otwartego usposobienia,\n\n-sumienności, uczciwości i dyspozycyjności,\n\n-znajomości j. angielskiego na poziomie B2\n\n-punktualności, energii i zaangażowania,\n\n-miłej aparycji.\n\nOferujemy:\n\n- ok. 15 dni pracy w miesiącu (20:00-06:00)\n\n- wysokie wynagrodzenie (% od utargu + serwis),\n\n- stabilne zatrudnienie w profesjonalnym zespole,\n\n- wsparcie doświadczonego kierownictwa,\n\n- możliwość rozwoju personalnego i awansu zawodowego,\n\n- szkolenia podnoszące umiejętności zawodowe.\n\nAplikacje wraz ze zdjęciem prosimy przesyłać drogą mailową. ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Zatrudnię Kucharza/Kucharkę",
        "phone": "602222073",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy do naszego zespołu osobę na stanowisko KUCHARZ/KUCHARKA z DOŚWIADCZENIEM , miejsce pracy - GARWOLIN\n\nJesteśmy firmą zajmująca się produkcją wyrobów garmażeryjnych do sklepów i nawet w okresie pandemii lub w razie wprowadzenia nowych obostrzeń będziemy pracować regularnie bez przerw.\n\nObowiązki :\n\nprzygotowanie potraw zgodnie z obowiązującym standardem,\ndbanie o estetykę potraw,\ndbanie o porządek w miejscu pracy,\nzapewnienie wysokiej jakości produktów.\n\nWymagania:\n\naktualne orzeczenie sanitarno-epidemiologiczne,\nDOŚWIADCZENIE NA PODOBNYM STANOWISKU,\ndobra organizacja czasu pracy,\npunktualność, odpowiedzialność i dyspozycyjność,\nzaangażowanie w wykonywaną pracę.\n\nOferujemy:\n\numowę o pracę,\npraca w systemie jednozmianowym /od poniedziałku do piątku/,\nwynagrodzenie na czas, adekwatne do zaangażowania i umiejętności,\nmiłą atmosferę w zgranym zespole\nZAKWATEROWANIE OSOBOM SPOZA GARWOLINA\n\nOsoby zainteresowane prosimy o przesłanie CV na adres e-mail podany poniżej.\n\nProsimy o umieszczenie klauzuli na swoim CV.\n\n\"Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z Ustawą z dnia 29.08.1997 roku o Ochronie Danych Osobowych; tekst jednolity: Dz. U. 2016 r. poz. 922)\".",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kelner/Kelnerka do pizzeri",
        "phone": "728524474",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy kelnerek do pracy w pizzerii, która znajduje się na zielonej Białołęce \n\nZakres obowiązków:\n\n- obsługa klientów \n\n- Przyjmowanie zamówień telefonicznych \n\n- Utrzymywanie porządku w lokalu \n\n-przygotowywanie przekąsek, sałatek\n\nOferujemy:\n\n- miłą atmosferę w pracy \n\n- Wypłaty tygodniowe \n\n- Posiłek pracowniczy \n\n- 15/20 pracujących w miesiącu \n\nOczekujemy:\n\n- minimalnego doświadczenia na stanowisku kelnera \n\n- Punktualności \n\n- Zaangażowania \n\n- Miłego podejścia do ludzi \n\nOsoby zainteresowane proszę o kontakt w wiadomości lub pod nr 51*****12 / 72*****74",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Włoska restauracja na Ochocie zatrudni kucharza",
        "phone": "725755755",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy samodzielnego kucharza do włoskiej restauracji na Ochocie.\n\nOferujemy:\n\npracę w pełnym wymiarze godzin (grafik 2/2),\nwynagrodzenie netto 24 zł/h  - KUCHNIA CIEPŁA\nmożliwość przejścia na umowę o pracę po okresie próbnym.\n\nWymagamy:\n\ndoświadczenia (mile widziane w kuchni włoskiej)\nzaangażowania i pozytywnego nastawienia,\naktualne badania sanepidowskie,\numiejętność pracy w zespole i umiejętność pracy pod presją czasu,\nbrak nałogów.\n\nCv proszę wysyłać przez formularz lub dzwonić pod numer 72*****55",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Pomoc kuchenna/ mlodszy kucharz",
        "phone": "535485773",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Do restauracji na warszawskiej Białołęce (okolice ul. Głębockiej) poszukujemy osoby na stanowisko pomoc kuchenna/ młodszy kucharz. Stawka na start 18pln reszta w zależności od umiejętności I doświadczenia. Więcej informacji udzielamy telefonicznie lub przez olx.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Zatrudnię Kelnerkę! \"Krowa i Kurczak\" Zielonka",
        "phone": "535767333",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Krowa i Kurczak grill bar w Zielonce (pod Warszawa)\n\nSzukamy osoby na stanowisko kelnerka, praca w systemie 2/2 (godziny 12-22)\n\nPraca również dla uczniów i studentów.\n\nOferujemy:\n\n-umowa zlecenie/umowa o prace\n\n-stabilne zatrudnienie\n\n-szkolenia\n\n-dobrą atmosferę w pracy\n\n-napoje oraz posiłki pracownicze\n\nOsoby zainteresowane prosimy o przesyłanie cv oraz kontakt telefoniczny pod numerem 53*****33",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Sushi master / kucharz kuchni ciepłej Pruszków",
        "phone": "506653434",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja sushi w Pruszkowie zatrudni kucharza sushi z doświadczeniem . Stawka od 25zl/h netto zależna od umiejętności . Oraz kucharza kuchni cieplej . Stawka od 20 zł/h netto . Praca w młodym zespole .",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Kelner/ obsługa gości",
        "phone": "791101000",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja Sphinx w Mińsku Mazowieckim zatrudni kelnerów. Jeśli chcesz pracować w zgranym zespole, lubisz kontakt z ludźmi i nie boisz się wyzwań to zapraszamy!  Preferowane osoby z doswiadczeniem. Zgłoszenia na miejscu lub poprzez olx.\nOferujemy prace zmianową i atrakcyjne warunki zatrudnienia.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Restauracja Kimi Sushi Wilanów zatrudni kelnerkę / kelnera",
        "phone": "530303150",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "\"Kimi\" znaczy \"dla Ciebie\" i dla tego w tej lokalnej restauracji tworzymy przyjazny i ciepły klimat dla naszych sąsiadów, goszcąc ich w miłej atmosferze przy dobrym sushi.\n\nJeśli chciałabyś dołączyć do naszego zespołu wyślij swoje CV.\n\nOferujemy:\n\n-pracę w lubianej i cenionej lokalnej restauracji\n\n-wynagrodzenie od 17 PLN na rękę plus napiwki, serwisy, bonusy, premie oraz konkursy sprzedażowe \n\n-umowa zlecenie lub umowa o pracę\n\n-szkolenia kelnerskie\n\n-darmowy posiłek w trakcie pracy\n\n-50% rabatu w restauracji dla Ciebie\n\n-25% rabatu w restauracji dla Twoich znajomych\n\nOczekujemy:\n\n-dbania o naszych gości i wychodzenia na przeciw im potrzebom\n\n-chęci do pracy w zespole (kuchnia, sala, kierowca, zmywak to jeden zespół)\n\n-pro aktywnego działania - codziennej organizacji miejsca pracy, dbanie o czystość\n\n-dbania o wyposażenie restauracji niezbędne do codziennej pracy\n\n-znajomości języka angielskiego w stopniu komunikatywnym\n\nZapraszamy!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Praca robienie kebabów centrum",
        "phone": "48507777893",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma Kafra Kebab zatrudnię na stałe osobę do robienia kebabów. \nPełny etat, 5-6 dni w tygodniu. Możliwe podpisania umowy. \n\nStawka do uzgodnienia! \n\nProszę dzwonić pod numer telefonu 50*******93, Eryk",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Osoba zmywająca Warszawa Tarchomin",
        "phone": "536701004",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma cateringowa o ugruntowanej pozycji na rynku z wieloletnim doświadczeniem, zatrudni osoby zmywające na stołówkę szkolną w szkole nr 344 przy ul. Erazma z Zakroczymia \n\nZapewniamy: \n\nStałą pracę od poniedziałku do piątku w godzinach 8:00-16:00 \nWolne weekendy \nStabilne zatrudnienie \nTerminowo wypłacane wynagrodzenie \n\nOczekujemy: \n\nChęci do pracy \nPunktualności \nAktualnych badań sanitarno-epidemiologicznych (warunek konieczny)\n\nZapraszamy osoby zdecydowane i gotowe do pracy w młodym i wesołym zespole.\n\nWyślij dane kontaktowe poprzez formularz OLX bądź imię i nazwisko z dopiskiem lokalizacji w wiadomości SMS - oddzwonimy! ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Koszary Arche Hotel zatrudni Kelnera / Kelnerkę",
        "phone": "518301713",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "*** Koszary Arche Hotel położony w odległości 25 km na południe od Warszawy w Górze Kalwarii w związku z dynamicznym rozwojem poszukuje do hotelowej Restauracji Kantyna na pełen etat:\n\nKELNERA / KELNERKĘ\n\nOpis stanowiska:\n\nobsługa gości indywidualnych oraz grupowych\nprzygotowanie sali pod konkretne wydarzenia\nobsługa gości oraz reagowanie na prośby gości i uwzględnianie ich sugestii\ndbanie o czystość  \ndbanie o pozytywny wizerunek Restauracji Kantyna\n\nOczekujemy:\n\ndoświadczenie zawodowe - wymagane w Restauracji hotelowej lub Restauracji przynajmniej 1 rok\numiejętność organizacji pracy w sposób efektywny i skuteczny\nprzywiązywanie wagi do wysokiej jakości obsługi\nkomunikatywnej znajomość języka angielskiego (każdy dodatkowy język to kolejny atut)\n\nOferujemy:\n\nStabilne warunki zatrudnienia - umowa B2B lub zlecenia - dla osób z doświadczeniem 25 zł brutto/1 h,\nAtrakcyjne wynagrodzenie oraz benefity zależne od doświadczenia,\nZniżki we wszystkich hotelach sieci Arche,\nMożliwość podniesienia kompetencji,\nDobrą atmosferę pracy,\nElastyczny grafik pracy, praca również w sobotę i w niedzielę\n\nOsoby zainteresowane prosimy o przesyłanie CV wraz ze zdjęciem.\n\n﻿Prosimy o zawarcie w CV klauzuli: „Wyrażam zgodę na przetwarzanie danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji prowadzonego przez Arche Sp. z o.o. z siedzibą w Warszawie. Oświadczam ponadto, że zostałem/łam poinformowany/a o przysługującym mi prawie dostępu do treści tych danych i możliwości ich poprawiania, a także o prawie do wycofania zgody na przetwarzanie tych danych w każdym czasie.”",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "osoby do lepienia pierogów na produkcję stawka 4.000-4.500zł/do ręki",
        "phone": "693151827",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "od potencjalnych kandydatów oczekujemy: doświadczenia w gastro jako pomoc kuchenna w lepieniu pierogów , cienkim wałkowaniu ciasta ,mile widziane umiejętności w innych wyrobach mącznych:   kopytka , leniwe, naleśniki ,pyzy ,itp.\n\n chęci i zaangażowania w powierzone prace .\n\npraca 6 dni w tygodniu od 6:00- 16:00-18:00w zależności od ilości zamówień, niedziele od 7:00-15:00 , umowa zlecenie, płacimy cotygodniowe zaliczki , wypłaty zawsze na czas.\n\nstawki w zależności od zaangażowania  i chęci , 17zł/h- 18 zł/h do ręki ,\n\n tylko osoby niepalące.!!  i bez innych uzależnień !! \n\nmile widziane osoby z Ukrainy,\n\npraca:  Janki blisko centrum handlowego AUCHAN ,zainteresowanych proszę o kontakt tylko telefoniczny   69*******27   na mail nie odpisuję.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kelner/Kelnerka do restauracji w centrum",
        "phone": "517422334",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "AIOLI jest sercem i centrum miasta, to my nadajemy tempa , to my wyznaczamy kierunek.\n\nŻyjesz bez ograniczeń?\n\nInspirację czerpiesz z miasta? Patrzysz na świat z innej perspektywy niż wszyscy? Jesteś sobą i niczego nie żałujesz? Tak? TO WŁAŚNIE CIEBIE SZUKAMY!\n\nCzekamy właśnie na Ciebie !!\n\n wyślij swoje CV w odpowiedzi na ogłoszenie :)\n\n \n\nZacznij pracę w Aioli:\n\n Pracuj dynamicznie i w miłej atmosferze\n\n Zapewnimy Ci stabilne zatrudnienie i regularne wypłaty \n\nOferujemy posiłki pracownicze – z Nami nie pracujesz głodny\n\n ... i rozwijaj się razem z nami!\n\n Zdobywaj cenne doświadczenie i umiejętności\n\n Bierz udział w organizowanych przez nas szkoleniach\n\n \n\n Poszukujemy Osób:\n\n- doświadczenie na stanowisku kelnera\n\n- dbanie o wizerunek, czystość i estetykę restauracji\n\n- utrzymywanie standardów obsługi na najwyższym poziomie\n\n- posiadających badania \"sanepidowskie\"\n\n- zaangażowanych i pracowitych\n\n- energicznych i pomocnych\n\n- dyspozycyjnych i odpowiedzialnych\n\n \n\nNasi Goście są dla nas najważniejsi – to dzięki naszemu uśmiechowi i jakości dań codziennie do nas wracają, bo cenią sobie dobrą atmosferę – świetną zabawę oraz najwyższą jakość naszych produktów.\n\n \n\nZastrzegamy sobie prawo do kontaktu z wybranymi kandydatami.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Barista/Baristka do Mąki i Wody!",
        "phone": "225019187",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy Baristki/Baristy do restauracji Mąka i Woda!\n\nWymagania i opis stanowiska/jeżeli:\n\npotrafisz obsługiwać ekspres ciśnieniowy\nlubisz pracować w godzinach porannych\nchcesz pracować 5 dni w tygodniu, maksymalnie do 16\nznasz język angielski\n\nZakres obowiązków:\n\nPrzygotowanie bufetu śniadaniowego\nObsługa gości na śniadaniu\nPrzygotowanie kawy\nZłożenie bufetu na koniec pracy\nPraca w trakcie lunchu\nPrzygotowanie produkcji barowej\n\nOferujemy:\n\nzatrudnienie na umowę zlecenie\ndarmowe śniadania\ndodatkowe szkolenie z obsługi ekspresu ciśnieniowego\nrabat pracowniczy 50% na jedzenie w restauracji na dniu wolnym\n\nZainteresowane osoby prosimy o wysłanie CV",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kelner, Kelnerka, Barman, Barmanka - praca w restauracji TreOriPizza",
        "phone": "600052132",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy osoby do pracy:\n\npraca na sali przy obsłudze gości\nna barze - przygotowywanie zamówień na salę\ndo przyjmowania zamówień telefonicznych\nbezpośrednia obsługa gości - zamówienia na wynos\n\nWymagania : poszukiwane osoby odpowiedzialne, miłe, uczciwe i przede wszystkim umiejące szybko zorganizować swoją pracę, doświadczenie w obsłudze klienta i dobra znajomość języka polskiego będzie dodatkowym atutem, mile widziani również osoby ze statusem studenta.\n\nOferujemy: bardzo fajną atmosferę w pracy i zarobki odpowiadające twoim umiejętnościom, stawki ustalamy indywidualnie w zależności od doświadczenia (od 17zł/h netto), poszukujemy chętnych do pracy na stałe!!!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Barmani/Barmanki do klubokawiarni na Pradze Północ",
        "phone": "570644944",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Klubokawiarnia na warszawskiej Pradze poszukuje do swojego zespołu barmanek i barmanów! Twórz z nami fajne miejsce na mapie Warszawy!:) Od nas dostaniesz elastyczny grafik, posiłek pracowniczy, wypłaty zawsze na czas :) Od Ciebie oczekujemy zaangażowania, uczciwości i chęci do pracy :) Nie masz doświadczenia? Chcesz zacząć swoją przygodę z gastro? Super! Trafisz pod najlepsze skrzydła :) Prześlij CV Spotkajmy się, porozmawiajmy :) Do zobaczenia :",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Pomocnik Kelnera/Kelner; Bez Gwiazdek; Warszawa, Powiśle",
        "phone": "570003378",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy pracowników na stanowisko kelnera i junior sommeliera w Bez Gwiazdek na Powiślu w Warszawie. W naszej restauracji panuje bezpretensjonalna atmosfera i swobodna obsługa. Bez Gwiazdek to nowoczesna autorska odsłona polskich kuchni regionalnych i najlepsze sezonowe produkty. Nie gwiazdorzymy, gotujemy dla ludzi!\n\nWysoką jakość, której doświadczyliśmy w restauracjach wyróżnionych gwiazdkami Michelin na świecie, wprowadzamy do naszej restauracji Bez Gwiazdek na Powiślu.\n\nNie wymagamy doświadczenia, a jedynie chęci do pracy, dyspozycyjności i co najważniejsze – pasji do pracy w gastronomii. \n\nOferujemy:\n\ndobrą i stałą pensję + bonusy\npracę 5 dni w tygodniu (od 13.00, serwujemy tylko kolacje)\nwolne niedziele i poniedziałki\nmożliwość nauki dzięki współpracy z osobami, które zdobywały doświadczenie w gwiazdkowych restauracjach w Europie\npracę w gronie osób z pasją do gastronomii\ncodzienny posiłek\n\nOczekujemy:\n\npunktualności i dyspozycyjności\nwysokiej kultury osobistej i uprzejmości\npracowitości i gotowości do pracy pod presją\n\nProsimy o wysyłanie CV na adres mailowy lub kontakt telefoniczny.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Zmywanie - Praca tosushi Lesznowola",
        "phone": "607343332",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Dzien dobry, Szukamy do zespołu Pani która będzie zmywać i sprzątać w restauracji - Praca od.g.11 do 20/22 , 15 dni na msc lub więcej - elastyczny grafik - wypłata na czas - stawka 16 zł na godzinę - dobry dojazd z Piaseczna Tosushi Lesznowola Gminna 43 05-506 Lesznowola 60********32",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Klimatyczna restauracja nieCodzienna sadyba zatrudni kelnerkę/ra",
        "phone": "500612334",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Wynagrodzenie:\n\nPodstawa godzinowa na początek 15zł netto\n\n( oczywiście do negocjacji, uzależnione jest od doświadczenia i ustalane indywidualnie na rozmowie kwalifikacyjnej).\n\nNapiwki\n\n(dziennie średnio ok 200zł plus)\n\nSerwisy\n\n( dobijane do każdego rachunku)\n\nOczekujemy:\n\nZatrudnimy chętnie osoby z doświadczeniem, min 1 rok.\nBardzo mile widziane osoby pracowite ,uczciwe ,dyspozycyjne (3 dni w tygodniu), z dobrą organizacją pracy i oczywiście uśmiechnięte .\n\nTwoje obowiązki:\n\nobsługa klientów z przyjaznym nastawieniem.\ndbanie o czystość Sali i baru\npodawanie dań i napojów,\nuzupełnianie stanów na stanowisku\n\nOferujemy:\n\nElastyczny grafik\nOrganizujemy szkolenia z zakresu:\n\npracy na ekspresie\n\nserwisu wina\n\nserwisu kelnerskiego\n\nBardzo proszę o wysyłanie CV(z klauzurą „Wyrażam zgodę na przetwarzanie moich danych osobowych przez Restauracja NieCodzienna w celu prowadzenia rekrutacji na aplikowane przeze mnie stanowisko.”",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Klimatyczna restauracja na Sadybie zatrudni kucharza",
        "phone": "505734780",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Wymagania\n\nmin. 2 lata doświadczenia na stanowisku kucharz .\n\ndyspozycyjność min. 3 dni w tygodniu\n\nDbanie o jakość i terminowość realizowanych zadań\n\numiejętność przygotowania potraw zgodnie z obowiązującymi recepturami\n\ndbałość o standardy wydawanych posiłków\n\nwysokiej kultury osobistej\n\naktualne badania sanitarno-epidemiologiczne brak uzależnień zawodowych\n\ndobrą organizacje pracy własnej\n\notwartość na wspólną, zespołową pracę\n\ndobrej energii i zaangażowanie :)\n\nOferujemy\n\numowa o pracę po okresie próbnym\n\nstabilne zatrudnienie\n\npraca w systemie zmianowym 15-16 dni w miesiącu\n\ngrafik pracy jest elastyczny, dopasowany do rezerwacji i potrzeb pracownika możliwość\n\nsamorealizacji podnoszenie swojej wiedzy w ramach struktury firmy\n\nWarsztaty kucharskie pod okiem profesjonalnych kucharzy.\n\nwynagrodzenie adekwatnego do pełniących funkcji\n\nGwarantujemy super atmosferę, 260 zł netto za dzień na start do póki nie jesteś samodzielny, a\n\nnastępnie 280 - 300 zł w zależności od doświadczenia, prosimy o wysłanie CV.\n\nWszystkich zainteresowanych pracą proszę o przesłanie CV na adres e-mail podany w treści ogłoszenia.\n\nW tytule wiadomości proszę wpisać KUCHARZ\n\nZapraszamy na rozmowy i dni szkoleniowe pod okiem naszego Chefa kuchni !",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "bufetowa/bufetowy w bistro/stołówce pracowniczej",
        "phone": "513824261",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma SZWAJCARKA Marcin Sikorski zatrudni do prowadzonych przez siebie bufetów/stołówek pracowniczych w instytucjach publicznych osoby zainteresowane pracą na stanowisku bufetowa/bufetowy.\n\nPraca na cały etat od poniedziałku do piątku w godzinach 07:30/08:00-15:30/16:00 w obrębie dzielnic Śródmieście, Ochota i Mokotów (dokładne lokalizacje - ul. Zaruskiego, Aleja Niepodległości, ul. Filtrowa). \n\nMożliwe również zatrudnienie na 1/2 etatu w godzinach 12:00-16:00 na stanowisku pomoc bufetowej w lokalizacji przy Placu Bankowym. \n\nDo obowiązków osoby zatrudnionej na stanowisku bufetowa/bufetowy należeć będą:\n\nbezpośrednia obsługa klientów i wydawanie/podawanie posiłków;\nsprzedaż pozostałego dodatkowego asortymentu bufetu;\ndbanie o czystość w obrębie bufetu oraz sali konsumpcyjnej;\nobsługa kasy fiskalnej, terminala płatniczego i prowadzenie rozliczeń z biurem firmy;\nścisła współpraca z szefem/szefową kuchni oraz pozostałym personelem;\nprzygotowywanie sałatek, kanapek, deserów, koktajli i innych przekąsek dostępnych w ofercie bufetu.\n\nPraca w stroju służbowym z zachowaniem wymogów sanitarnych oraz rygoru wynikającego z zaleceń epidemicznych.\n\nProsimy o kontakt wyłącznie osoby z doświadczeniem, rzetelne, dyspozycyjne, zainteresowane stałą współpracą i świadome specyfiki pracy polegającej na kontakcie z przedstawicielami administracji publicznej/państwowej.\n\nZapraszamy do przesyłania CV za pomocą formularza.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Pizzerman do restauracji",
        "phone": "508449559",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja La Cantina Meyhane zatrudni pizzermana z doświadczeniem. Piec opalany drewnem. Tylko stała współpraca.\n\nOferujemy:\n\n*elastyczny grafik;\n\n*min 15 dni:\n\n*możliwość rozwoju.\n\nOczekujemy:\n\n*zaangażowania;\n\n*stałej współpracy;\n\n*badań sanepidarno - epidemiologicznych;\n\n*doświadczenia.\n\nOsoby zainteresowane prosimy o wysyłanie CV.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Kucharz ul. Olbrachta",
        "phone": "508971148",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Jesteśmy częścią międzynarodowej Grupy Compass, jednej z największych firm gastronomicznych na całym świecie i liderem w zakresie żywienia zbiorowego.\n\nObecnie w związku z otwarciem nowej restauracji poszukujemy kandydatów na stanowiska:\n\nKucharz\n\nMiejsce pracy: Warszawa, ul. Olbrachta 94 (restauracja pracownicza),\n\nPraca od poniedziałku do piątku w godz. 14.00-22.00.\n\nOpis stanowiska:\n\n•\tPrzygotowanie potraw zgodnie ze standardami firmy.\n\n•\tDbanie o estetykę przygotowanych i serwowanych potraw.\n\nWymagania:\n\n• Doświadczenie na podobnym stanowisku.\n\n•\tUmiejętność pracy na recepturach.\n\n•\tOtwartość na zmiany, operatywność i kreatywność.\n\n•\tBardzo dobra organizacja pracy.\n\n•\tPraktyczna znajomość systemu HACCP.\n\n•\tAktualne badania do celów sanitarno-epidemiologicznych.\n\nOferujemy:\n\n•\tMożliwość rozwoju zawodowego.\n\n•\tUmowa zlecenia z możliwością przejścia na umowę o pracę.\n\n•\tZatrudnienie w stabilnej, międzynarodowej firmie.\n\n•\tSystem bonusowy powiązany z osiąganymi wynikami\n\n•\tSzkolenia wewnętrzne.\n\n•\tPrzyjazną atmosferę pracy.\n\n•\tBezpłatne posiłki pracownicze.\n\n•\tPakiet benefitów: opiekę medyczną, ubezpieczenie na życie, dofinansowanie do kart sportowych.\n\nOsoby zainteresowane zachęcamy do przesłania CV.\n\nInformujemy, że skontaktujemy się z wybranymi kandydatami.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Pracownik restauracji typu Fast Food / Pruszków",
        "phone": "695240560",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Adecco Poland Sp. z o.o. należy do międzynarodowej korporacji The Adecco Group - światowego lidera wśród firm doradztwa personalnego, który posiada 5100 placówek w ponad 60 krajach. W Polsce działamy od 1994 roku. Swoją wiedzą i doświadczeniem służymy w ponad 50 lokalizacjach na terenie kraju. W 2020 roku pracę dzięki Adecco Poland znalazło blisko 60000 osób. Adecco Poland Sp. z o.o. jest Agencją Zatrudnienia nr 364.\n\nPracownik restauracji typu Fast Food / Pruszków\n\nNIE WYMAGAMY DOŚWIADCZENIA!\n\nPoszukujemy osób dynamicznych i energicznych, które nie mają problemu z wykonywaniem kilku czynności w jednym czasie.\nMile widziani Studenci.\nWymagamy:\n• aktualnej książeczki do celów sanitarno-epidemiologicznych!\n• dostępności do pracy również w weekendy\n \n \n\nOferujemy:\n• Umowę o pracę tymczasową\n• Elastyczny grafik \n• 21 zł brutto/h\n• 60% zniżki na produkty z restauracji\n \nMiejsce pracy - Pruszków\nKontakt - 69*******60",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "kelner/zastępca menagera",
        "phone": "698161171",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Renomowana restauracja MaMaison zlokalizowana w Laskach ul. Poznańska 2 (gm. Izabelin) poszukuje do swojego zespołu kelnera/kelnerki - zastępcy menagera\n\noczekujemy:\n\ndyspozycyjności\n\numiejętności kelnerskich\n\ndobrej organizacji pracy własnej oraz zespołu\n\nchęci do podnoszenia kwalifikacji\n\noferujemy:\n\numowę o pracę/umowę zlecenie/B2B\n\nstabilne zatrudnienie w pięknym i zadbanym miejscu\n\natrakcyjne wynagrodzenie, zależne od umiejętności i zaangażowania\n\npracę od czwartku do niedzieli\n\ndogodny dojazd z Warszawy (metrem do stacji Młociny i autobusem 210)\n\nwynagrodzenie płacimy zawsze na czas\n\nwszystkich zainteresowanych prosimy o przesłanie CV lub kontakt telefoniczny",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Zatrudnię Sushimastera- kucharza sushi z doświadczeniem",
        "phone": "512304077",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię kucharza sushi- Sushimastera z doswiadczeniem do warszawskiej sieci restauracji sushi.\n\nOtwieramy nowe lokalizacje na warszawskim Wilanowie i Targówku.\n\nWynagrodzenie do negocjacji w zależności od doświadczenia i umiejętności",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Sushi Master - Kucharz",
        "phone": "538991021",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Jesteśmy prężnie rozwijającą się firmą cateringową. \n\nSpecjalizujemy się w produkcji nowoczesnych i wysokiej jakości potraw dla firm i klienta indywidualnego. Obecnie do naszej KUCHNI w OTRĘBUSACH poszukujemy osoby na stanowisko Sushi Master\n\nOsoba ta będzie odpowiedzialna za:\n\nprzygotowywanie potraw-zestawów Sushi zgodnie z recepturami i standardami firmy oraz dbanie o ich jakość\nstała współpraca z Szefem Kuchni\nracjonalne gospodarowanie towarem, minimalizowanie strat\nutrzymywanie porządku i higieny w miejscu pracy\nprzestrzeganie przepisów HACCP\n\nWymagania:\n\ndoświadczenie na podobnym stanowisku\naktualne badania do celów sanitarno-epidemiologicznych\nsumienność, punktualność, zaangażowanie, uczciwość, samodzielność w działaniu\numiejętność delegowania zadań i pracy pod presją czasu\nznajomość przepisów HACCP\n\nZapewniamy:\n\nzatrudnienie na umowę o pracę, umowa B2B\nwynagrodzenie 5000-6000 zł brutto w zależności od rodzaju umowy\npraca w kilkuosobowym, młodym i energicznym zespole\npełny etat\npraca od niedzieli do czwartku\npraca w stabilnej firmie\ndojazd kolejką WKD – w pobliżu stacja WKD Otrębusy, 5 min pieszo\n\nZainteresowane osoby prosimy o wysyłanie CV",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pizzer/Pizzaiolo 25-27 pln/h netto",
        "phone": "663379087",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy pizzera z doświadczeniem . Praca na cały etat  również w weekendy w godzinach 11-22 .   Elastyczny grafik .   Stawka 25-27 pln na godz. netto .   Pracujemy na piecu opalanym drewnem . Chętnego kandydata przyczyny jeśli nie pracował na takim piecu . Praca od zaraz . Zapraszamy do kontaktu tel 66*******87",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Restauracja Letnisko zatrudni barman/barista/kelner - Falenica",
        "phone": "502243220",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Jeśli lubisz ludzi, dobrą atmosferę, pracę w młodym zespole oraz chcesz mieć wpływ na miejsce, w którym pracujesz to praca w Restauracji Letnisko jest dla Ciebie.\n\nW związku z dynamicznym rozwojem poszukujemy pracowników na stanowisko: barman, barmanka/kelner, kelnerka.\n\nPoszukujemy osób do pracy zarówno w weekendy jak i w tygodniu. Mile widziane są osoby zarówno dojrzałe jak i uczące się. Możesz zacząć od zaraz! Brak doświadczenia to nie problem - nauczymy Cię wszystkiego:)\n\nZakres obowiązków:\n\n·        Obsługa kelnerska lub barmańska gości restauracji;\n\n·        Obsługa zamówień telefonicznych;\n\n·        Przyjmowanie płatności od gości w formie gotówkowej i bezgotówkowej;\n\n·        Dbanie o porządek w miejscu pracy;\n\n·        Aktywna współpraca z pozostałymi pracownikami restauracji;\n\nWymagania:\n\n·       Doświadczenie w obsłudze klienta na sali / za barem\n\nmile widziane ale nie jest to warunek konieczny;\n\n·       Aktualne badania sanitarno-epidemiologiczne;\n\n·      Prawo jazdy;\n\n·       Umiejętność dobrej organizacji i pracy w zespole;\n\n·       Wysoka kultura osobista i schludny wygląd;\n\n·       Odpowiedzialność i zaangażowanie;\n\n·       Rzetelności i uczciwości;\n\n·       Płynności w mowie i piśmie języka polskiego;\n\n·       Znajomość komunikatywna języka angielskiego;\n\n·       Brak nałogów;\n\n Oferujemy:\n\n ·        Pracę w stabilnej firmie z miłą atmosferą;\n\n·        Po okresie próbnym umowę o pracę zapewniającą pełne świadczenia;\n\n·        Możliwość współpracy również na zasadach własnej działalności;\n\n·        Atrakcyjne wynagrodzenie + system premiowy uzależniony od zaangażowania\n\n·        Możliwość zamian oraz dopasowania grafiku pod pracownika,\n\n·        Możliwość rozwoju osobistego i szkoleń     \n\n·        Lunch pracowniczy, napoje\n\nOsoby zainteresowane prosimy o kontakt telefoniczny 502 243 220 - lub przesłanie swojego CV na adres mailowy: rekrutacja.ivex.pl. \n\nZastrzegamy sobie prawo do odpowiedzi tylko na wybrane oferty drogą telefoniczną.\n\nProsimy o dodanie w CV następującej klauzuli:\n\n'Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu tej oraz przyszłych rekrutacji (zgodnie z ustawą z dnia 10 maja 2018 roku o ochronie danych osobowych (Dz. Ustaw z 2018, poz. 1000) oraz zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO)).\"\n\n Informujemy, że Administratorem danych jest IVEX Iwona Chołody z siedzibą w Warszawie przy ul. Patriotów 47. Dane zbierane są dla potrzeb rekrutacji. Ma Pani/Pan prawo dostępu do treści swoich danych oraz ich poprawiania. Podanie danych w zakresie określonym przepisami ustawy z dnia 26 czerwca 1974 r. Kodeks pracy oraz aktów wykonawczych jest obowiązkowe. Podanie dodatkowych danych osobowych jest dobrowolne. W każdym czasie możesz cofnąć swoją zgodę, kontaktując się z Pracodawcą/Administratorem Danych.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Kelnerka pełen etat 16 zł/h Azami",
        "phone": "575570896",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Cześć,\n\nAzami przy ul. Jana Kazimierza 68 to sushi bar.\n\nSzukamy kelnerki ze statusem studenta na pełen etat, praca od 11-22.30\n\nW Twoim zakresie obowiązków znajdzie się sprzątanie, dbanie o czystość w lokalu, przygotowanie zmiany, obsługa kelnerska, obsługa zamówień telefonicznych oraz internetowych. \n\nMusisz umieć obsługiwać ekspres ciśnieniowy, być punktualna i zarażać pozytywną energią.\n\nOferujemy stabilną, długoterminową współpracę w profesjonalnym zespole, godziwe oraz zawsze wypłacane w terminie wynagrodzenie.\n\nStawka na start - 16 zł/h\n\nProszę o przesyłanie CV ze zdjęciem na maila azami\n\nSkontaktuje się z wybranymi kandydatami.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Szef kuchni, kuchnia szpitala WIML, Warszawa",
        "phone": "665600509",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Rekeep Polska, to firma otwarta na różnorodność pracowników i zatrudnienie osób z niepełnosprawnościami. Poszukujemy osoby, która dołączy do naszego zespołu na stanowisku Szef Kuchni \n\n \n\nMiejsce pracy: Warszawa, Szpital WIML, Żoliborz\n\nZatrudnienie od zaraz.\n\nOferujemy: \n\n-możliwość rozpoczęcia kariery w największej firmie cateringowej\n\n-lunch w dniach pracy\n\n-wsparcie ze strony młodego i energicznego zespołu\n\n-stabilne zatrudnienie na podstawie umowy o zlecenia, a po okresie próbnym umowę o pracę\n\n-terminowe wynagrodzenie, wysokość do uzgodnienia \n\n-stałe godziny pracy 5.30-17.00\n\n \n\nWymagania:\n\n-aktualna książeczka sanepidu - warunek konieczny\n\n-gotowość i dyspozycyjność do pracy\n\n-doświadczenia na stanowisku o podobnym zakresie obowiązków jest mile widziane\n\n-chęci do długofalowej współpracy\n\n-umiejętności delegowania zadań\n\n \n\nOsoby zainteresowane pracą, które chciałyby uzyskać więcej informacji proszę o kontakt telefoniczny:  p. Agnieszka 66*******09\n\nAdministratorem Twoich danych osobowych będzie Rekeep Polska S. A.  z siedzibą w Łodzi przy ulicy Traktorowej 126/202, 91-204 Łódź. W sprawie przetwarzania Twoich danych osobowych możesz się skontaktować z Inspektorem Ochrony Danych Osobowych za pomocą adresu mailowego. Administrator może przekazać Twoje dane osobowe do Spółki (Współadministratora), z którą współtworzy Grupę Kapitałową Rekeep Polska S.A. Przetwarzanie odbędzie się w celu przeprowadzenia rekrutacji i dążenia do zawarcia z Tobą umowy o pracy lub innej umowy cywilno - prawnej. Masz prawo żądania dostępu do danych, sprostowania, usunięcia, wniesienia sprzeciwu, przenoszenia lub ograniczenia ich przetwarzania. Konsekwencją niepodania danych osobowych będzie brak możliwości udziału w procesie rekrutacyjnym. Pełne informacje związane z przetwarzaniem Twoich danych osobowych znajdziesz w Polityce prywatności na stronie internetowej www.rekeep.pl",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pomocnik kucharza /Kierowca do firmy cateringowej",
        "phone": "502582765",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma kateringowa z Milanówka zatrudni osobę na stanowisko pomocnik kucharza /kierowca (kat B) \n\nMilanówek\n\ntel. 50*******65",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Piekarz/ Warszawa Mokotow/ 25-30 netto/h",
        "phone": "509504736",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Nowo powstająca cukiernia/ piekarnia na starym Mokotowie poszukuje piekarza z doświadczeniem. \nPełen etat. \nStawka 25-30 zł netto/ h \n\nWięcej informacji pod numerem: 50*******36",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "PIZZER z doświadczeniem",
        "phone": "885886150",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Kim jesteśmy?\n\nJesteśmy znaną warszawską restauracją z tradycjami, do której Goście przychodzą nie tylko na pyszne jedzenie, ale i po to, aby spędzić miłe chwile w wyjątkowej atmosferze miejsca z duszą. Właśnie wznowiliśmy działalność po generalnym remoncie, a także innych zmianach, które przyniosły odświeżenie oferty i przyjemne nowości dla naszych Gości, między innymi włoskie specjały, w tym pizzę neapolitańską.\n\nKogo szukamy?\n\nPIZZER z doświadczeniem\n\nJak będzie wyglądała Twoja praca?\n\n·      podstawą będzie dbałość o jakość serwowanych przez restaurację dań i samodzielne ich przygotowywanie (neapolitańska pizza będąca nowością w znanym lokalu z kuchnią polską)\n\n·      ponadto ważna będzie współpraca z Szefem Kuchni, Managerami i całym Zespołem - u nas atmosfera pracy jest bardzo ważna\n\nCo oferujemy?\n\n·       pracę w cenionej, bardzo lubianej restauracji w centrum Warszawy, która zdobyła już uznanie na mapie stołecznych lokali gastronomicznych\n\n·       wyjątkowe miejsce pracy – nasze wnętrza zachwycają Gości – zaraz po pysznym jedzeniu, są naszą wielką chlubą\n\n·       rodzinną atmosferę, dzięki której tworzymy zgrany Zespół\n\n·       elastyczny grafik, który staramy się dostosować do całego Zespołu\n\n·       umowę o pracę (po okresie próbnym) bądź umowę o współpracy – w zależności od preferencji.\n\nCzego oczekujemy?\n\n·       przede wszystkim pasji do pracy gastronomii, a także miłości do pracy z ludźmi i dla ludzi\n\n·       umiejętności i doświadczenia na stanowisku pizzera\n\n·       entuzjazmu w codziennej pracy, zaangażowania i pozytywnej energii\n\n·       znajomości kuchni włoskiej \n\n·       gotowości do pracy zmianowej (również w niedziele i święta), a także zastąpienia innego pracownika na jego stanowisku, gdy akurat będzie taka potrzeba\n\n·       doświadczenia oraz znajomości przepisów sanitarnych, a także aktualnych badań.\n\nCzekamy na Twoje CV, bardzo miło będzie nam też przeczytać kilka dodatkowych słów o motywacji do pracy na stanowisku PIZZERA (wystarczy w treści wiadomości). Oczywiście abyśmy mogli je przeczytać, potrzebna będzie w dokumencie zgoda na przetwarzanie danych osobowych zgodna z RODO.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Praca w Pizzerii",
        "phone": "600064564",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy pracownika do pizzerii w Legionowie, kelner / kelnerka.\nPraca od zaraz.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Pracownik Kuchni - zatrudnienie w naleśnikarni MANEKIN, Marszałkowska",
        "phone": "795040140",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Naleśnikarnia Manekin przy ul. Marszałkowskiej poszukuje 2 pracowników kuchni\n\n \n\nOferujemy: \n\n- wynagrodzenie początkowe 17 zł netto(do ręki)\n\n- umowa zlecenie na okresie próbnym, możliwość przejścia na umowę o pracę\n\n- szkolenia stanowiskowe\n\n- możliwość awansu\n\n- współpraca z młodym zespołem\n\n- rozliczenia tygodniowe\n\n- elastyczny grafik\n\nwysokie rabaty na posiłki pracownicze\n\n- imprezy integracyjne\n\nOczekiwania: \n\n- zdolność pracy pod presją czasu\n\n- umiejętność organizacji stanowiska pracy\n\n- dyspozycyjności min.4 dni w tygodniu\n\n- zaangażowania i gotowość do podjęcia stałej pracy\n\n- kultura osobista\n\n \n\nSkontaktujemy się z wybranymi osobami. Powodzenia!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pracownik Piekarni Gorąco Polecam",
        "phone": "797171419",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zakres obowiązków: \n\n- wypiek tradycyjnego, pachnącego i chrupiącego pieczywa w oparciu o autorskie receptury\n\n- przygotowywanie świeżych kanapek, sałatek i przekąsek\n\n- dbanie o czystość, porządek i dobrą atmosferę\n\n- obsługa klienta z uśmiechem na twarzy\n\nNasze wymagania: \n\n- doskonała organizacja pracy, samodzielność, umiejętność pracy pod presją czasu\n\n- dokładność przy wykonywaniu powierzonych obowiązków\n\n- wysoki poziom umiejętności komunikacyjnych i kultury osobistej\n\n- orzeczenie sanitarno-epidemiologiczne bądź gotowość do jego wyrobienia\n\n \n\nOferujemy: \n\n- miłą atmosferę pracy\n\n- możliwość współtworzenia firmy i należących do niej marek\n\n- szkolenia, np. kawowe\n\n- premia uznaniowa za dyspozycyjność. \n\n-60 % opłaty za multi sport  \n\nOsoby zainteresowane proszę o wysyłanie CV . ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Piekarza z doświadczeniem do pracy w Piekarni Cukierni Kołacz",
        "phone": "504106409",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Piekarnia Cukiernia \"Kołacz\" z Nowego Dworu Mazowieckiego poszukuje Piekarza z udokumentowanym doświadczeniem.\n\nNasze wymagania:\n\nprzygotowywanie ciasta\nobsługa parku maszynowego\nprzygotowywanie produktów do wypieku\nsumienność w realizacji powierzonych działań\nsamodzielność\npunktualność\n\nOferujemy:\n\nUmowę o pracę, pracę w zgranym zespole, stabilne zatrudnienie, rabaty pracownicze na produkty.\n\nOsoby zainteresowane pracą prosimy o telefon lub o wysłanie swojego CV przez serwis OLX.\n\nTworzymy zgrany zespół Pracowników - Dołącz do Nas!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Barista / Kelner / Barman - MIEDZIANA Cafe",
        "phone": "667161313",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Cześć!\n\nDo kawiarni/bistro na Miedzianej szukamy baristów, choć i osoby z doświadczeniem kelnerskim będą mile widziane. Pracujemy na kawach specialty, mamy własne ciasta i kuchnię ze śniadaniami i lunchami na bardzo dobrym poziomie. Budujemy również segment barowy także doświadczenie w tej kwestii również będzie mile widziane. Oferujemy realne perspektywy rozwoju, uczciwe wynagrodzenie (naturalnie uzależnione od umiejętności, doświadczenia etc.), elastyczny grafik i generalnie pracę ze świetnymi ludźmi.\n\nSzukamy kogoś na stałe - wymiar czasu pracy do dogadania, przynajmniej jeden weekend w miesiącu pracujący. Nie mniej ważna od doświadczenia i dyspozycyjności będzie Twoja osobowość, podejście i komunikatywność. Zależy nam na budowaniu stabilnego, zgranego zespołu, w którym możemy na sobie polegać\n\nZapraszamy do aplikowania.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Tel Aviv zatrudni DOŚWIADCZONCYH KELNERÓW lokale: Mokotów, Wilanów",
        "phone": "731114449",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "TEL AVIV poszukuje KELNERÓW do dwóch lokalizacji: Mokotów oraz Wilanów\n\nKIM JESTEŚMY?\n\nNaszą pracę rozumiemy jako podejmowanie gości, nie obsługiwanie klientów. Jesteśmy specjalistami w naszej dziedzinie i potrafimy sprawić, że każdy poczuje się u nas doskonale. Wiemy, jak odżywiać się świadomie i tak karmimy naszych Gości. Dlatego tworzymy najlepszą wegańską sieć w Polsce – jako pierwszy wegański koncept zostaliśmy wyróżnieni w prestiżowym przewodniku Gault&Millau.\n\nGDZIE?\n\nTel Aviv na warszawskim Wilanowie oraz na Mokotowie\n\nKOGO SZUKAMY?\n\nKelnerów z doświadczeniem.\n\nJeśli masz dobrą podzielność uwagi, nie boisz się tabaki, lubisz kontakt z ludźmi a gościnność nie jest Ci obca to miejsce jest właśnie dla Ciebie! Dodatkowym atutem będzie jeżeli tak jak my kochasz zwierzęta :)\n\nCO CHCEMY CI DAĆ?\n\nWynagrodzenie 19-20 zł netto za godzinę.\nElastyczny grafik\nPrzyjazną atmosferę\nMożliwość rozwoju i awansu\n\n JAK ZGŁOSIĆ SWOJĄ KANDYDATURĘ?\n\nW odpowiedzi na to ogłoszenie prześlij nam swoje CV i wskaż lokalizację w której chcesz pracować",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Cafe Czarna Mańka - Baristka / Barista - Warszawa, Bielany",
        "phone": "604072105",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Hej,\n\nPoszukujemy Baristy do naszego zespołu.\n\nWarunek konieczny to doświadczenie w pracy w kawiarni.\n\nKawiarnia znajduje się na Warszawskich Bielanach, ok 500m od Metra Młociny.\n\nJeśli szukasz pracy w fajnym zespole i z super Gośćmi to dobrze trafiłaś/eś.\n\nNie rozpisujemy się, ale jak chcesz znać szczegóły wyślij CV przez OLX lub na adres cafe(a)czarnamanka.pl, a my się odezwiemy!\n\nDo usłyszenia ;-)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Catering - kanapek praca na noc",
        "phone": "887362779",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma cateringowa z okolic Nadarzyna poszukuje osób do pracy na stanowiska\n\nzmywak\nkucharz\npomoc kuchenna\nkuchnia zimna (składanie dań w pudełka jednorazowe)\nkanapki \nsałatki \n\nPraca od zaraz\n\ncv przesyłać na adres e-mail lub kontakt telefoniczny .",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kasjer/Barista Piekarnia-kawiarnia Gorąco Polecam wszystkie dzielnice",
        "phone": "605664415",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Gorąco Polecam to piekarnio-kawiarnia w której znajdziesz wyśmienite pieczywo powstałe w oparciu o tradycyjne receptury, kanapki, sałatki słodkości i kawę. \n\nDo Twoich obowiązków będzie należało: \n\n- obsługa klienta \n\n- przygotowywanie świeżych kanapek, kawy, soków \n\n- wypiekanie bułeczek i croissantów \n\n- dbanie o porządek i wizerunek lokalu\n\nOferujemy:\n\n- miłą atmosferę pracy\n\n- szkolenia, np. kawowe\n\n- zniżki pracownicze\n\n- możliwość rozwoju i awansu-jesteśmy bardzo szybko rozwijającą się organizacją\n\n- elastyczny grafik pracy\n\n- umowę zlecenie studenci (20,00 zł brutto na h), umowa zlecenie ZUS (20 zł brutto na h +3,00 zł ekwiwalentu), umowa o pracę 3010 zł brutto + 300 zł ekwiwalentu\n\n- premie kwartalne do wysokości miesięcznej pensji\n\nWymagamy:\n\n- dyspozycyjności od poniedziałku do piątku lub niedzieli {praca zmianowa)\n\n-dokładności przy wykonywaniu powierzonych obowiązków\n\n-orzeczenia sanitarno-epidemiologicznego bądź chęci do jego wyrobienia",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Pijalnia Czekolady E.Wedel zatrudni Deseranta",
        "phone": "538055391",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Pijalnia Czekolady E. Wedel mieszcząca się w Centrum Praskim Koneser zatrudni pracowników na stanowiska:\n\nPracownik kuchni (deserant)\n\nLubisz pracę z ludźmi? Interesuje Cię przygotowywanie słodkości? Masz motywację do pracy?\n\nZostań Pracownikiem Pijalni Czekolady E. Wedel, a reszty Cię nauczymy.\n\n- przygotowanie napoi i deserów\n\n- dbanie o czystość i porządek w miejscu pracy\n\nOd kandydatów oczekujemy:\n\n-\tposiadanie aktualnych badań sanepid\n\n-\tStatus ucznia/studenta\n\n- chęci do pracy, zaangażowania oraz uśmiechu na twarzy\n\n- pozytywnego nastawienia do ludzi oraz łatwości nawiązywania kontaktów\n\nOsoby zainteresowane prosimy o przesłanie CV.\n\nKLAUZULA INFORMACYJNA\n\nAdministrator\n\nAdministratorem Państwa danych osobowych przetwarzanych w ramach procesu rekrutacji jest Infusion Sp. z o.o. Sp. Komandytowa, ul. Składowa 12, 15-399 Białystok W sprawach dotyczących ochrony Państwa danych osobowych można kontaktować się z nami za pomocą poczty tradycyjnej na wyżej wskazany adres z dopiskiem „OCHRONA DANYCH”.\n\nCel i podstawy przetwarzania\n\nPaństwa dane osobowe w zakresie wskazanym w przepisach prawa pracy (art. 22 ustawy z dnia 26 czerwca 1974 r. Kodeks pracy ora §1 Rozporządzenia Ministra Pracy i Polityki Socjalnej z dnia 28 maja 1996 r. w sprawie zakresu prowadzenia przez pracodawców dokumentacji w sprawach związanych ze stosunkiem pracy oraz sposobu prowadzenia aktu osobowych pracownika) będą przetwarzane w celu przeprowadzenia obecnego postępowania rekrutacyjnego (art. 6 ust. 1 lit b RODO), natomiast inne dane, w tym dane do kontaktu, na podstawie zgody (art. 6 ust. 1 lit. a RODO), która może zostać odwołana w dowolnym czasie.\n\nAdministrator będzie przetwarzał Państwa dane osobowe, także w kolejnych naborach pracowników, jeżeli wyrażą Państwo na to zgodę (art. 6 ust. 1 lit. a RODO), która może zostać odwołana w dowolnym czasie.\n\nJeżeli w dokumentach zawarte są dane, o których mowa w art. 9 ust. 1 RODO konieczna będzie Państwa zgoda na ich przetwarzanie (art. 9 ust. 2 lit. a RODO), która może zostać odwołana w dowolnym czasie.\n\n \n\nOkres przechowywania danych\n\nPaństwa dane zgromadzone w obecnym procesie rekrutacyjnym będą przechowywane do zakończenia procesu rekrutacji.\n\nW przypadku wyrażonej przez Państwa zgody na wykorzystanie danych osobowych do celów przyszłej rekrutacji, Państwa dane wykorzystywane będą przez 12 miesięcy.\n\nPrawa osób, których dane dotyczą\n\nMają Państwo prawo do:\n\ndostępu do swoich danych oraz otrzymania ich kopii;\nsprostowania (poprawiania) swoich danych osobowych;\nograniczenia przetwarzania danych osobowych;\nusunięcia danych osobowych;\nwniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (na adres Urzędu Ochrony Danych Osobowych, ul. Stawki 2, 00-193 Warszawa);\n\nInformacje o wymogu podania danych\n\nPodanie przez Państwa danych osobowych w zakresie wynikającym z art. 22 Kodeksu pracy jest niezbędne, aby uczestniczyć w postępowaniu rekrutacyjnym. Podanie przez Państwa innych danych jest dobrowolne.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "pomoc kuchenna w stołówce szkolnej",
        "phone": "514801830",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma SZWAJCARKA Marcin Sikorski zatrudni do prowadzonych przez siebie punktów zbiorowego żywienia zlokalizowanych w placówkach oświatowych na terenie Warszawy osoby zainteresowane pracą na stanowisku:\n\n \n\npomoc kuchenna w stacjonarnej stołówce szkolnej (posiłki przygotowywane i wydawane na miejscu)\npraca również w okresie wakacyjnym\n\n \n\nZakres obowiązków:\n\n \n\nudział w procesie przygotowywania i wydawania posiłków serwowanych uczniom i pracownikom szkoły na stołówce szkolnej lub bufecie\n\n \n\nwykonywanie prac zleconych przez szefową/szefa kuchni lub kucharza nadzorującego na wszystkich etapach/odcinkach produkcji gastronomicznej (również obierak, zmywak i wydawka);\n\n \n\nutrzymywanie czystości w miejscu pracy i wykonywanie innych prac porządkowych na terenie kuchni/stołówki;\n\n \n\nwspółpraca z pozostałym personelem kuchennym oraz pracownikami administracyjnymi firmy;\n\n \n\nwykonywanie powierzonych obowiązków zgodnie z wymaganiami i zaleceniami kierownictwa firmy.\n\n \n\nWymagania:\n\n \n\ndyspozycyjność i komunikatywność;\n\n \n\ndobra organizacja pracy, kultura osobista i umiejętność radzenia sobie ze stresem/napięciem;\n\n \n\n \n\nPracodawca oferuje umowę o pracę na pełen etat \n\n \n\nPraca od poniedziałku do piątku w godzinach 07:00 - 15:00 w placówkach zlokalizowanych na terenie Bemowa, Śródmieścia, Bielan, Mokotowa, Ursynowa Białołęki lub Żoliborza (w jednej wybranej lokalizacji).\n\n \n\n  \n\nOsoby zainteresowane zapraszamy do przesyłania CV celem umówienia terminu rozmowy kwalifikacyjnej.\n\n \n\nProsimy o zawarcie w CV klauzuli: „Wyrażam zgodę na przetwarzanie danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji prowadzonego przez SZWAJCARKA Marcin Sikorski zgodnie z ustawą z dnia 29 sierpnia 1997 r. o ochronie danych osobowych (t.j. Dz. U. z 2016 r., poz. 922)”.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "pomoc kuchni na weekendy doświadczenie nie jest wymagane",
        "phone": "228316190",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja Zapiecek na ulicy Feta 1 zatrudni pracowników na stanowisko pomoc kuchenna stawka 180 zł dziennie praca w godzinach 12-23/24\n\nPraca na weekendy\n\nNie czekaj aż zadzwonimy zapraszamy na rozmowę od poniedziałku do piątku w godzinach 13-19.\n\ntel. po 11:00 228316190",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "zatrudnimy kelnerki przy metrze Kabaty, zarobki ok 250 zł dziennie",
        "phone": "226445015",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy Dziewczyn/ Pań na stanowisko kelnerki. Jeśli nie masz doświadczenia w tym zawodzie, nie ma problemu\n\nWszystkiego nauczymy, przeszkolimy\n\nWymagamy komunikatywnej znajomości języka polskiego.\n\nOd kandydatek oczekujemy:\n\n·        Pozytywnego nastawienia\n\n·        Uśmiechu na twarzy\n\nOferujemy:\n\n·        Pracę w stabilnej firmie\n\n·        Możliwość pracy na cały etat lub tylko w weekendy – Ty wybierasz.\n\n·        Szkolenia\n\n·        Bardzo atrakcyjne wynagrodzenie ok 300 zł. dziennie\n\nOsoby zainteresowane prosimy o przesłanie CV\n\nlub zapraszamy na rozmowę codziennie od poniedziałku do piątku w godzinach 13-20\n\nRestauracja Zapiecek ul. Wańkowicza 1 (stacja metra Kabaty )\n\nkontakt telefoniczny 226445015\n\nJeśli jesteś w okolicy zapraszamy na rozmowę nawet bez CV",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kawiarnia speciality \"MIŁO\" zatrudni Baristę !",
        "phone": "696030255",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Koncept restauracyjny MIŁO Speciality Coffee w Babicach Nowych poszukuje:\n\n Baristy!\n\nhttps://m.facebook.com/milospecialitycoffee/\n\nhttps://www.instagram.com/milospecialitycoffee/\n\nJeżeli chcesz:\n\n• być częścią niepowtarzalnego konceptu, \n\n• mieć możliwość elastyczności w procesie kreacji i tworzenia\n\n• otrzymywać atrakcyjne wynagrodzenie w zależności od umiejętności i zaangażowania, możliwość podpisania umowy o pracę\n\n• szkolić się i rozwijać zawodowo\n\n• pracować w sympatycznym zespole i miłej atmosferze\n\nTo szukamy właśnie Ciebie!\n\nCo będzie należało do Twoich obowiązków?\n\n• Przygotowywanie kaw na bazie espresso oraz metodami alternatywnymi \n\n• Obsługa gości kawiarni \n\n• Pilnowanie porządku na sali i na barze \n\n• Pozytywne nastawienie – uśmiech, uprzejmość, i gościnność.\n\nCzego oczekujemy?\n\n • Doświadczenie, szczególnie w segmencie kawy speciality, jest mile widziane, ale nie konieczne. \n\n• Oczekujemy komunikatywności, wysokiej kultury osobistej, uczciwości i umiejętności dobrej organizacji pracy. \n\n• Poszukujemy osób cechujących się pozytywnym nastawieniem i energią – parzenia doskonałej kawy możemy Cię nauczyć! \n\n• Dyspozycyjność do ustalenia, praca także w weekendy.\n\nPrześlij swoje CV poprzez OLX lub na adres: hello „a” milocafe.pl\n\nProsimy o zamieszczenie klauzuli:\n\nWyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji niniejszego i przyszłych procesów rekrutacyjnych zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO)-",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Kucharz do restauracji",
        "phone": "0225586728",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja Belvedere poszukuje kandydatów na stanowisko:\n\n KUCHARZ\n\nMiejsce pracy : Warszawa\n\nOpis stanowiska:\n\nOsoba zatrudniona na tym stanowisku będzie odpowiedzialna m.in. za przygotowanie potraw pochodzących z różnych stron świata, jak również dań dostosowanych do indywidualnych okoliczności i wymagań klientów oraz zapewnienie ich wysokiej jakości zgodnej ze standardami firmy.\n\nWymagania:\n\ndoświadczenie w pracy na stanowisku kucharza\nbardzo dobra organizacja pracy własnej\numiejętność pracy w zespole\ndyscyplina w zachowaniu czystości i higieny pracy\npasja kucharska i kreatywność\ndyspozycyjność\n\nOferujemy:\n\nstabilne zatrudnienie na podstawie umowy o pracę\nprywatną opiekę lekarską\ngrupowe ubezpieczenie na życie\nmożliwość rozwoju, doskonalenia zawodowego i awansu\npracę w profesjonalnym zespole\nmożliwość uczestnictwa w konkursach kulinarnych\n\nProsimy o zawarcie w CV klauzuli: „Wyrażam zgodę na przetwarzanie danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji prowadzonego przez Belvedere- Cafe Łazienki Królewskie Sp. z o.o. z siedzibą w Warszawie zgodnie z ustawą z dnia 29 sierpnia 1997 r. o ochronie danych osobowych (t.j. Dz. U.z 2016 r., poz. 922)”. Jednocześnie wyrażam zgodę na przetwarzanie przez ogłoszeniodawcę moich danych osobowych na potrzeby przyszłych rekrutacji.\n\nInformujemy, że Administratorem danych jest Belvedere- Cafe Łazienki Królewskie Sp. z o.o. z siedzibą w Warszawie przy ul. Agrykoli 1. Dane zbierane są dla potrzeb rekrutacji. Ma Pani/Pan prawo dostępu do treści swoich danych oraz ich poprawiania. Podanie danych w zakresie określonym przepisami ustawy z dnia 26 czerwca 1974 r. Kodeks pracy oraz aktów wykonawczych jest obowiązkowe. Podanie dodatkowych danych osobowych jest dobrowolne.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Cukiernik do cateringu",
        "phone": "600937499",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Belvedere -Catering by Design poszukuje kandydatów na stanowisko:\n\nCUKIERNIK\n\nMiejsce pracy : Piaseczno\n\nOpis stanowiska:\n\nOsoba zatrudniona na tym stanowisku będzie odpowiedzialna m.in. za przygotowanie wszelkiego rodzaju deserów, ciast, ciastek, tortów i zapewnienie ich wysokiej jakości zgodnej ze standardami firmy.\n\nWymagania:\n\ndoświadczenie w pracy na stanowisku cukiernika\nbardzo dobra organizacja pracy własnej\numiejętność pracy w zespole\ndyscyplina w zachowaniu czystości i higieny pracy\npasja do pracy, pomysłowość i wyobraźnia\ndyspozycyjność\n\nOferujemy:\n\nstałe zatrudnienie w oparciu umowę o pracę\nopiekę medyczną\ngrupowe ubezpieczenie na życie\nmożliwość rozwoju i doskonalenia zawodowego\npracę w profesjonalnym zespole\n\nJeśli chcesz do nas dołączyć prześlij nam swoje CV\n\nProsimy o zawarcie w CV klauzuli: „Wyrażam zgodę na przetwarzanie danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji prowadzonego przez Belvedere- Cafe Łazienki Królewskie Sp. z o.o. z siedzibą w Warszawie zgodnie z ustawą z dnia 29 sierpnia 1997 r. o ochronie danych osobowych (t.j. Dz. U.z 2016 r., poz. 922)”. Jednocześnie wyrażam zgodę na przetwarzanie przez ogłoszeniodawcę moich danych osobowych na potrzeby przyszłych rekrutacji.\n\nInformujemy, że Administratorem danych jest Belvedere- Cafe Łazienki Królewskie Sp. z o.o. z siedzibą w Warszawie przy ul. Agrykoli 1. Dane zbierane są dla potrzeb rekrutacji. Ma Pani/Pan prawo dostępu do treści swoich danych oraz ich poprawiania. Podanie danych w zakresie określonym przepisami ustawy z dnia 26 czerwca 1974 r. Kodeks pracy oraz aktów wykonawczych jest obowiązkowe. Podanie dodatkowych danych osobowych jest dobrowolne.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Catering dietetyczny zatrudni zmywającą/ego",
        "phone": "698960488",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Catering dietetyczny\n\nposzukuje kandydatów na stanowisko:\n\n Zmywająca/y\n\nMiejsce pracy : Warszawa\n\nOpis stanowiska:\n\nOsoba zatrudniona na tym stanowisku będzie odpowiedzialna m.in. za utrzymywanie w czystości i porządku pomieszczeń kuchennych, zmywanie sprzętu kuchennego.\n\nOferujemy:\n\nstabilne zatrudnienie na podstawie umowy o pracę, dla chętnych możliwe zatrudnienie na umowę zlecenie\nprywatną opiekę lekarską\ngrupowe ubezpieczenie na życie\nobiady\npracę od niedzieli do czwartku\n\nJeśli chcesz do nas dołączyć prześlij nam swoje CV lub zadzwoń w godzinach 10.00-17.00\n\n tel. 69*******88\n\nProsimy o zawarcie w CV klauzuli: „Wyrażam zgodę na przetwarzanie danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji prowadzonego przez Belvedere- Cafe Łazienki Królewskie Sp. z o.o. z siedzibą w Warszawie zgodnie z ustawą z dnia 29 sierpnia 1997 r. o ochronie danych osobowych (t.j. Dz. U.z 2016 r., poz. 922)”. Jednocześnie wyrażam zgodę na przetwarzanie przez ogłoszeniodawcę moich danych osobowych na potrzeby przyszłych rekrutacji.\n\nInformujemy, że Administratorem danych jest Belvedere- Cafe Łazienki Królewskie Sp. z o.o. z siedzibą w Warszawie przy ul. Agrykoli 1. Dane zbierane są dla potrzeb rekrutacji. Ma Pani/Pan prawo dostępu do treści swoich danych oraz ich poprawiania. Podanie danych w zakresie określonym przepisami ustawy z dnia 26 czerwca 1974 r. Kodeks pracy oraz aktów wykonawczych jest obowiązkowe. Podanie dodatkowych danych osobowych jest dobrowolne.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Trener/Kucharz: warsztaty kucharskie (tematyczne)",
        "phone": "570006419",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Projekt Eventowy GoParty.pl zaprasza do współpracy\n\nTrener/Kucharz: warsztaty kucharskie (tematyczne)\n\nObowiązki\n\nprowadzenie warsztatów tematycznych (różne kuchnie) dla dzieci i dorosłych\n\nWymagania\n\ndoświadczenie w pracy na stanowisku szefa kuchni, kucharza/kucharki\nznajomość kuchni: polskiej / japońskiej / chińskiej / indyjskiej / włoskiej / amerykańskiej / francuskiej / meksykańskiej / bałkańskiej\nmile widziane wykształcenie kierunkowe\nmile widziane doświadczenie w prowadzeniu szkoleń z zakresu gastronomicznego\nmile widziane przygotowanie pedagogiczne lub kurs trenerski\numiejętność pracy w zespole\nwysoka kultura osobista\n\nOferujemy\n\numowę zlecenie lub o współpracę\nmożliwość rozwoju zawodowego i realizacji własnych pomysłów\nmożliwość wystawienia referencji\nmożliwość umieszczenia notki trenerskiej na stronie internetowej\n\nRozpoczęcie pracy: grudzień 2021\n\nLokalizacja: Warszawa, ul. Wirażowa 124\n\nOsoby zainteresowane współpracą prosimy o przesłanie CV w ogłoszeniu lub kontakt telefoniczny.\n\nTel.: 57*******19",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Poszukujemy: Pizzera, Kucharza oraz Dostawcę",
        "phone": "48730757793",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Włoska pizzeria - restauracja z ugruntowaną pozycją na Warszawskim Natolinie (Ursynów) poszukuje osób do pracy\n\n- Pizzer\n\n- Kucharz\n\n- Dostawca pizzy (własny środek transportu). Kursy w zasięgu do 5 km.(Ursynów).\n\nNie masz doświadczenia? Nie ma problemu, wszystkiego Cię chętnie nauczymy! Bardziej liczy się dla nas uśmiech, zaradność i zaangażowanie.\n\nFajnie by było gdybyś był(a) z okolicy Ursynowa.\n\nDla obcokrajowców - pomóc przy otrzymaniu karty pobytu\n\nWszelkich informacji dotyczących warunków pracy udzielimy telefonicznie.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Pomocnik barmana Restauracja Ochota",
        "phone": "535557955",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Włoska pizzeria spaghetteria na Ochocie prowadzi rekrutację na stanowisko:\n\nPomocnik Barmana w restauracji\n\nPraca dla osób kontaktowych. NIE wymagamy doświadczenia. Wszystkiego Cię nauczymy\n\nOferujemy : Stawka od 17 złotych netto za godzinę\n\nPraca 4 dni w tygodniu Miła przyjazna atmosfera\n\nCzekamy na Ciebie\n\nPrzyślij CV lub zadzwoń.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kelnerzy/Kelnerki POSZUKIWANI !!!",
        "phone": "690661401",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Prężnie działająca restauracja na warszawskiej Pradze - Południe szuka do swojego zespołu Kelnerów/Kelnerki\n\nObowiązki/Wymagania:\n\nobsługa kelnerska gości restauracji\nobsługa eventów oraz przyjęć rodzinnych\ndbałość o estetyczny wygląd restauracji oraz pozostałych sal i magazynów\nwspółpraca z personelem kuchennym i managerem przy realizacji zamówień\nobsługa systemu kasowego, terminali\n\nmile widziane doświadczenie na stanowisku\npodstawowa znajomość języka angielskiego\npasja i utożsamianie się z miejscem wykonywania pracy\nkulturalne podejście do klienta\nbrak uzależnień !\ndbałość o stanowisko pracy\nuczciwość\nkreatywność\ndobra poczucie humoru ;)\n\nCV prosimy wysyłać na adres email.\n\nSerdecznie zapraszamy :)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kucharz Akademii Inspiracji MAKRO (f/m) B2B",
        "phone": "225000000",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Jesteśmy innowacyjną firmą z branży handlu hurtowego, należącą do Grupy METRO. Działając wspólnie w globalnej sieci MAKRO/METRO Cash&Carry, zapewniamy najwyższej jakości towary oraz kompleksowe rozwiązania biznesowe 21 milionom naszych klientów w 25 krajach na całym świecie. Jeśli podobnie jak my, masz naturę przedsiębiorcy, jesteś otwarty na nowe wyzwania i lubisz się uczyć, dołącz do naszego Zespołu.\n\nZakres współpracy:\n\npomoc przy organizacji szkoleń kulinarnych\nopracowywanie i przygotowywanie tygodniowego jadłospisu Akademii\nobsługa kulinarna wewnętrznych wydarzeń: śniadania, przerwy kawowe, lunche, konferencje\nzakupy na potrzeby wydarzeń odbywających się w Akademii\n\nNasze oczekiwania:\n\nmin. 2-letnie doświadczenie w pracy w kuchni\nznajomość języka polskiego w stopniu komunikatywnym\nzaangażowanie w wykonywaną pracę i chęć rozwoju\nprzestrzegania przepisów HACCP oraz procedur wewnętrznych\nskrupulatność w prowadzeniu dokumentacji kuchni\npozytywne nastawienie\n\nProponujemy Ci:\n\nwspółpracę w oparciu o umowę B2B\nmożliwość podnoszenia kwalifikacji zawodowych w oparciu o szeroki wachlarz szkoleń\nduży zakres samodzielności oraz przyjazną i nieformalną atmosferę pracy\npasjonującą pracę w nowocześnie wyposażonej kuchni",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "kucharka do kateringu",
        "phone": "509090984",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Powiększamy ekpię ! Do kateringu dietetycznego zatrudnimy kucharkę i pomoc kuchenną z doświadczeniem. Praca Płońsk Bońki.\n\nOferujemy pracę w zgranym zespole, wynagrodzenie adekwatne do umiejetnosci i zaangazowania, pracę na stałe. system 2/2 lub 3/2.\n\ntel 50*******84 pon-pt w godz 9-17 lub cv na adres www.bzykfit.pl",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kelner/kelnerka LotniskoChopina 20-22zl/h",
        "phone": "579328480",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Praca jako kelner - dla studentów i nie tylko :)\nGdzie? - Lotnisko Chopina\nStawka? - od 20 do 22 zł netto za godzinę + napiwki\nDoświadczenie? - wszystkiego Cię nauczymy;)\nCzas pracy? - elastyczny grafik\nRodzaj umowy? - umowa zlecenie\nWypłaty? - przelewem na konto/do ręki\nZainteresowane osoby zapraszam do kontaktu.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pomoc kuchenna, kucharz, kasjerka",
        "phone": "502436507",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię Panów również Cudzoziemców do restauracji z kebabem w Warszawie;Warszawie Radości i Ząbkach na stanowiska : kucharz, pomoc kuchenna - praca w kuchni i barze, obsługa Gości na sali, obsługa kasy. Wymagania książeczka dla sanepidu, miła aparycja, uczciwość. Oferujemy : szkolenia, miłą atmosferę i uczciwe wynagrodzenie, mieszkanie w Wołominie. Prosimy o kontakt telefoniczny Tel. 50*****07",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Obsluga klienta w sali zabaw",
        "phone": "605636401",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "SZUKAMY PRACOWNIKA Sala Zabaw Kreatywnych Huśtawka to miejsce spotkań i niesamowitych atrakcji dla rodzin z dziećmi. Tworzymy je z wielką pasją i zaangażowaniem. Poszukujemy energicznej, uśmiechniętej osoby odpowiedzialnej za obsługę sali zabaw i kącika kawiarnianego. Lokalizacja: ul. Szeligowska 10 lok. U3, Warszawa Twoje zadania: • bieżąca obsługa gości • pomoc w koordynowaniu przyjęć i imprez • utrzymywanie czystości miejsca pracy • dbanie o bezpieczeństwo gości Czego oczekujemy: • dyspozycyjności (praca w godzinach popołudniowych oraz w weekendy) • aktualnej książeczki sanitarno-epidemiologicznej • łatwości w nawiązywaniu kontaktów • mile widziana umiejętność obsługi kasy fiskalnej • mile widziane doświadczenie w pracy z dziećmi • mile widziani studenci Co oferujemy: • atrakcyjne wynagrodzenie • pracę w miłej atmosferze • pracę w zgranym zespole • możliwość rozwoju i zdobycia nowych doświadczeń zawodowych",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Pomoc do kuchni poszukiwana",
        "phone": "796814545",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Nowe przedszkole poszukuje pomocy do kuchni - zatem jeśli lubisz gotować i znasz się na tym lub chcesz się tego poduczyć pod okiem kucharza, lubisz dzieci - to zapraszamy do kontaktu. Doświadczenie mile widziane. Gwarantujemy stałą i stabilną pracę - możliwa każda forma zatrudnienia. Zapewniamy komfortowe warunki pracy i miłą atmosferę!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pizzaiolo do włoskiej pizzeri",
        "phone": "507069025",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy Pizzaiolo do Włoskiej pizzerii na ul. Lipowa 4 w Warszawie koło Centrum Nauki Kopernik\n\nSzukamy osób z doświadczeniem.\n\nPraca zmianowa od 11 do 22\n\nStawka godzinowa 26 zł  plus napiwki i premie\n\nZainteresowane osoby zapraszam do kontaktu osobistego. Rekrutacje prowadzimy na ul. Lipowej 4 róg Wybrzeże Kościuszkowskie w Boscaiola Pizza&Vino w środę i piątek godzinach 15-19\n\nProszę zabrać ze sobą CV\n\n50*****25",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Barista/Kelner w La Lucy przy rondzie ONZ",
        "phone": "730791278",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Jesteś dynamiczną osobą, która uwielbia kontakt z ludźmi? Kochasz espresso ze 100% arabiki ale szybki przelew na egzotycznych ziarnach z Jawy wydaje się jeszcze bardziej intrygujący? Chciał(a)byś pracować w centrum miasta jako:\n\nBarista/Kelner\n\nZapoznaj się z naszą ofertą pracy i zaaplikuj!\n\nCzym się będziesz zajmować:\n\nprzygotowywanie i serwowanie kawy, herbaty, koktaili itp,\nobsługa Gości\ndbanie o właściwe wykorzystanie produktów i o ich świeżość,\nutrzymywanie estetyki i czystości w kawiarnii\ndbanie o przestrzeganie wszelkich zasad, procedur i standardów,\na przede wszystkim współtworzenie przyjaznej, wręcz rodzinnej atmosfery.\n\nCzego oczekujemy:\n\nmin. 1 rok doświadczenia na podobnym stanowisku\nchęci do pracy i rozwoju zawodowego,\numiejętności pracy w zespole,\nważnych badań sanitarno-epidemiologicznych,\ndobrej organizacji pracy.\n\nCo oferujemy:\n\nkonkurencyjne wynagrodzenie,\numowę o pracę,\njasny system rozliczeń w tym napiwków,\nposiłek pracowniczy,\nmożliwości rozwoju.\n\nZastrzegamy sobie prawo do kontaktu z wybranymi kandydatami.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kelnerkę do Restauracji Bravo Eat&Drink w samym centrum",
        "phone": "609000030",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja Bravo Eat&Drink zatrudni kelnerkę. \nRestauracja mieści się tuż obok Hotelu Intercontinetnal.\nZapewniamy bardzo dobre warunki do pracy. \nZapraszamy do kontaktu.\nPożadana znajomość podstaw języka angielskiego.\n\nTel. 60*****30",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Obsługa baru w barze mlecznym w Warszawie",
        "phone": "731078078",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię energiczne, sumienne, komunikatywne osoby do OBSŁUGI BARU (sprzedaż, obsługa kas fiskalnych, wydawanie posiłków). \n\nOferuję zarobki w wysokości do 23 zł brutto/godzinę, wypłacane zawsze na czas, umowę zlecenie, szkolenie w zakresie wykonywanych obowiązków, pracę w doświadczonym i miłym zespole.\n\nMiejsce pracy - centralna część Warszawy. \n\nWymagana jest dobra znajomość języka polskiego. Umiejętność obsługi kas fiskalnych, doświadczenie na podobnym stanowisku. \n\nOsoby zainteresowane  zapraszam do kontaktu telefonicznego od pon. do pt. w godz. 8:00 - 17:00 pod nr tel 731~ 078 ~078.\n\nOgłoszenie ważne do 31.01.2022.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Bufetowa/ kelner/pomoc kuchni do stołówki pracowniczej.",
        "phone": "607503314",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy personel do stołówki pracowniczej w Warszawie. \n\nPoszukujemy ludzi na stanowiska;\n\npomoc kuchni\nbufetowa/ kasjer\nkelner\n\nPraca od poniedziałku do piątku, zmiany 8 godzinne . Stołówka pracuje między 8 a 16.\n\nLokalizacja: ul. Świętokrzyska\n\nZatrudnienie na umowę o pracę.\n\nPraca od zaraz.\n\nZapraszamy do kontaktu: Beata 60*******14",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Praca w Salad Story w Warszawie! (różne lokalizacje)",
        "phone": "535564105",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Salad Story do swoich restauracji poszukuje ambitnych i pozytywnych ludzi na stanowisko: Pracownik Obsługi Klienta do restauracji w Warszawie. (CH Plac Unii, CH Złote Tarasy, lokal przy Alei Komisji Edukacji Narodowej)\n\nZ nami:\n\nZdobędziesz cenne doświadczenie zawodowe - jeśli go nie masz to spokojnie, wszystkiego Cię nauczymy \nDopasujesz godziny pracy do swojego trybu życia lub zajęć na uczelni bądź w szkole\nRozwiniesz swoje pasje i zdobędziesz nowych przyjaciół\nNabędziesz nowe umiejętności i awansujesz na kolejne stanowiska\nBędziesz się zdrowo odżywiać – oferujemy posiłek pracowniczy za jedyne 3zł\nPodszkolisz swój angielski i niemiecki – zapewniamy bezpłatny dostęp do platformy językowej e-Tutor\nZadbasz o kondycję z kartą Multisport\n\n Na czym będzie polegała Twoja praca?\n\nNa przyjaznej obsłudze naszych Gości\nNa przygotowywaniu zdrowych i wartościowych posiłków\nNa dbaniu o porządek w restauracji\nNa tworzeniu zgranego Zespołu\n\nJeśli jesteś osobą:\n\nZ dobrą energią i pozytywnym nastawieniem do życia\nKomunikatywną i otwartą\nPosiadającą aktualne badania sanepidu – jeśli ich nie masz, to pomożemy Ci je wyrobić\n\n*Status studenta/ucznia mile widziany\n\nDołącz do nas i zacznij tworzyć z nami wspólne story…Salad Story",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kelner lub kelnerka warszawa centrum",
        "phone": "99999999999999",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja sofra ul. wilcza 71 zatrudni kelnerów i kelnerki z doświadczeniem i chęcią do pracy.\n\ngrafik 2/2\n\nstawka 15 zł/h\n\nKażdy ma swój rewir, napiwki NIE są wrzucane do 1 worka\n\ncv ze zdjęciem za pośrednictwem olx",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kelner w Restauracji Platter by Karol Okrasa",
        "phone": "664122963",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zlokalizowany w samym centrum miasta, Hotel InterContinental Warszawa jest nowoczesnym, pięciogwiazdkowym obiektem wchodzącym w skład InterContinental Hotels Group, jednej z największych sieci hotelarskich na świecie. Profesjonalny zespół pracowników oraz wysoki standard usług sprawia, że nasz hotel jest wyjątkowym miejscem dla naszych gości. Naszym pracownikom stwarzamy przyjazne miejsce pracy, gdzie mogą się doskonalić i rozwijać swoje umiejętności.\n\nNajlepsza Restauracja w Polsce roku 2019 - Platter by Karol Okrasa działa w hotelu InterContinental Warszawa od września 2010 roku. Recepta na sukces restauracji jest prosta. Według Okrasy, \"dania w lokalu mają przypominać przede wszystkim smaki dzieciństwa, jednak oprócz tego muszą zaskakiwać aranżacją smaków i stymulować zmysły\". Naszym gościom dostarczamy wspaniałych doznań kulinarnych oraz obsługę kelnerską na najwyższym poziomie.\n\nAktualnie do Restauracji Platter by Karol Okrasa poszukujemy kandydatów na stanowisko: Kelner a'la carte\n\nDo Twoich zadań należeć będzie:\n\nobsługa gości restauracji, serwowanie potraw i napojów w celu osiągnięcia najwyższego stopnia zadowolenia gości\nposiadanie pełnej wiedzy na temat obowiązującego menu\nutrzymywanie i przestrzeganie norm sanitarnych, higieny i bezpieczeństwa\nprzestrzeganie procedur, zasad oraz standardów obsługi\n\nNasza oferta jest dla Ciebie, jeśli:\n\nposiadasz doświadczenie w pracy na podobnym stanowisku\nposiadasz orzeczenie do celów sanitarno-epidemiologicznych (SANEPID) \nwyróżnia Cię dobra organizacja pracy oraz zaangażowanie i sumienność\nposiadasz umiejętność budowania dobrych relacji z gośćmi i zespołem\nkomunikujesz się sprawnie w języku polskim i angielskim\njesteś zorientowana/y na przestrzeganie standardów\njesteś gotowa/y do podjęcia pracy w systemie zmianowym\ndoświadczenie w pracy w branży hotelarskiej będzie dodatkowym atutem\n\nZapewniamy:\n\npracę w prestiżowej firmie w międzynarodowym środowisku\nzatrudnienie w ramach umowy o pracę\nmożliwość przystąpienia do ubezpieczenia grupowego, programu sportowego\nmożliwość korzystania z pralni oraz parkingu hotelowego\nposiłki w restauracji pracowniczej\nkarty świąteczne podarunkowe\nopiekę medyczną w luxmed\nzniżki na produkty i usługi hotelowe sieci IHG w kraju i za granicą\n\nZainteresowanych prosimy o przesłanie CV za pomocą przycisku do aplikowania. Warunkiem koniecznym do wzięcia udziału w procesie rekrutacji jest umieszczenie w dokumentach aplikacyjnych jednej lub obu z poniższych klauzul: „Oświadczam, iż wyrażam zgodę na przetwarzanie przez administratora, którym jest Sienna Hotel Sp. z o.o. z siedzibą w Warszawie przy ul. Emilii Plater 49, 00-125 Warszawa, KRS 0000662897 moich danych osobowych zawartych w mojej ofercie pracy, w tym również w moim CV i/lub liście motywacyjnym dla potrzeb niezbędnych do realizacji obecnego procesu rekrutacyjnego prowadzonego przez Sienna Hotel sp. z o.o. z siedzibą w Warszawie przy ul. Emilii Plater 49. Powyższa zgoda została wyrażona dobrowolnie.” „Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji przyszłych procesów rekrutacji prowadzonych przez Sienna Hotel sp. z o.o. z siedzibą w Warszawie przy ul. Emilii Plater 49. Powyższa zgoda została wyrażona dobrowolnie. Rozumiem, że przysługuje mi prawo dostępu do treści moich danych osobowych oraz prawo ich sprostowania, usunięcia, ograniczenia przetwarzania, jak również prawo do przenoszenia danych, prawo wniesienia sprzeciwu wobec przetwarzania, prawo do cofnięcia zgody na ich przetwarzanie w dowolnym momencie bez wpływu na zgodność z prawem przetwarzania, którego dokonano na podstawie zgody wyrażonej przed jej cofnięciem”. INFORMACJA Sienna Hotel Sp. z o.o. z siedzibą w Warszawie informuje ponadto, że: 1. Administratorem Pani/Pana danych osobowych jest: Sienna Hotel Sp. z o.o. z siedzibą w Warszawie przy ul. Emilii Plater 49, 00-125 Warszawa, KRS 0000662897; 2. w spółce powołany został Inspektor ochrony danych osobowych, adres do kontaktu: 3. przetwarzanie danych osobowych jest niezbędne w celu przeprowadzenia procesu rekrutacji do pracy. Podstawą prawną przetwarzania danych jest art. 6 ust. 1 lit. b RODO („przetwarzanie jest niezbędne do wykonania umowy, której stroną jest osoba, której dane dotyczą, lub do podjęcia działań na żądanie osoby, której dane dotyczą przed zawarciem umowy”), a w zakresie, w jakim została udzielona przez Panią/Pana zgoda na przetwarzanie danych osobowych – art. 6 ust. 1 lit. a RODO („osoba, której dane dotyczą wyraziła zgodę na przetwarzanie swoich danych osobowych w jednym lub większej liczbie określonych celów”); 4. dane osobowe będą przechowywane przez czas trwania procesu rekrutacji na dane stanowisko do czasu jego zakończenia, a w przypadku wyrażenia zgody na przetwarzanie danych osobowych w przyszłych rekrutacjach – przez okres nie dłuższy niż 1 (jeden) rok od momentu wyrażenia zgody; 5. przysługuje Pani/Panu prawo żądania dostępu do swoich danych oraz prawo ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych oraz prawo wniesienia sprzeciwu wobec ich przetwarzania, a także prawo do cofnięcia zgody na przetwarzanie danych osobowych w dowolnym momencie bez wpływu na zgodność z prawem przetwarzania, którego dokonano na podstawie zgody wyrażonej przed jej cofnięciem. Może Pani/Pan cofnąć zgodę kontaktując się z administratorem. 6. przysługuje Pani/Panu prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych, gdy uzna Pani/Pan, iż przetwarzanie danych osobowych Pani/Pana dotyczących narusza przepisy RODO lub innych aktów prawnych z zakresu ochrony danych osobowych; 7. podanie danych osobowych w zakresie określonym przepisami ustawy z dnia 26 czerwca 1974 r. Kodeks pracy, innych aktów prawnych , w tym również aktów wykonawczych jest obowiązkowe i ich podanie jest konieczne do wzięcia udziału w rekrutacji, natomiast podanie dodatkowych danych osobowych jest dobrowolne.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kucharz/pomoc kuchenna /Warszawa Falenica/",
        "phone": "228724146",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Przedszkole nr 338 \"Sosnowa Stacyjka\" w Warszawie Falenicy zatrudni pomoc kuchenną z wykształceniem gastronomicznym do kuchni przedszkolnej. Praca w zespole czteroosobowym. Mile widziane doświadczenie w opracowywaniu jadłospisów i diet dla dzieci w wieku przedszkolnym. Umowa o pracę na czas określony z możliwością  przedłużenia. ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Poszukujemy osoby z doświadczeniem do pomocy na kuchni. Praca na noc.",
        "phone": "48513185986",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Do naszej firmy z wieloletnią tradycją poszukujemy osoby do pomocy przy produkcji wyrobów garmażeryjnych. Wymagane doświadczenie przy gotowaniu zup, produkcji sałatek i surówek, smażeniu krokietów. \nOferujemy stałe zatrudnienie oraz umowę. Stawka ustalana indywidualnie w zależności od doświadczenia i zaangażowania pracownika.\nPraca na noc od niedzieli do czwartku (*niedziela 18:00-06:00, reszta dni 20:00-06:00).\nMiejsce pracy: Marysin Wawerski.\nWszystkich zainteresowanych zapraszamy do kontaktu pod numerem telefonu:\n+48**********86.\nZapraszamy",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Zatrudnimy osobę do pakowania wyrobów garmażeryjnych. Praca na noc.",
        "phone": "513185986",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy na stałe do naszej firmy Cateringowej z wieloletnią tradycją osobę do pakowania wyrobów garmażeryjnych. Praca na noc od niedzieli do czwartku (*niedziela 18:00-06:00, reszta dni 20:00-06:00). Oferujemy stałe wynagrodzenie i umowę o prace.\nWymagamy od pracownika biegłego posługiwania się językiem polskim w piśmie i mowie, podstawowej obsługi komputera oraz dyspozycyjności. \nPraca polega na pakowaniu, ważeniu, etykietowaniu rozdzielaniu i fakturowaniu wyrobów garmażeryjnych. \n*pandemia nie wpływa na prace naszejd firmy. \nWszystkich zaintersowanych prosimy o kontakt pod numerem:\n+48**********86\nMiejsce pracy: Marysin Wawerski \nZapraszamy.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Szukamy Kasjerki do baru orientalnego \"Nam Ninh\" w Milanówku.",
        "phone": "739424060",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": " \n\nObecnie szukamy kasjerki na pełny etat  w Barze Orientalnym \"Nam Ninh\" w Milanówku.\n\nPraca od poniedziałku do piątku w godzinach  10:30 - 19:30\n\nObowiązki:\n\nDbanie o czystość miejsca pracy \nPrzyjmowanie zamówień ( telefonicznych + tablet )\nObsługa klientów na miejscu \n\n \n\nWymagania:\n\nWysoka kultura osobista\nPunktualność\n\nOferujemy:\n\n1 posiłek dziennie\ndobra atmosfera\n\nOsoby zainteresowane zapraszamy do kontaktu telefonicznie lub mailowo.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Piekarnia w Łomiankach zatrudni Piekarza",
        "phone": "510148828",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Piekarnia w Łomiankach zatrudni Piekarza.\n\nInformacje pod nr.telefonu: 51*****28",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Dostawca Jedzenia. Warszawa - Białołęka",
        "phone": "796970600",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię do pracy na stanowisko dostawcy. Praca w wymiarze 10 godzinnym. 7zł od dostawy. Dla dyspozycji pracowników nasza flota pojazdów wraz z kartami paliwowymi. \nCechujemy się luźną atmosferą, pracujemy bezstresowo ;) \nChcemy by każdy mógł pracować kiedy jest mu to na rękę. Więc grafik układamy co tydzień, sam określasz kiedy chcesz pracować!\n\nBardzo szybko poszerzamy nasze horyzonty i otwieramy nowe punkty, może i Ty chciałbyś go w przyszłości poprowadzić? Wystarczy Twój angaż w rozwój by wskakiwać coraz wyżej, reszta po naszej stronie :p \n\nZapraszam do kontaktu ze mną przez OLX oraz SMS \nPozdrawiam!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Poszukujemy pracowników na produkcje",
        "phone": "48735255730",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam pierogarnia w Rasztowie zatrudni pracowników na produkcję prace zaczyna się od 17 i pracujemy według ilości zamówień",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Firma KISZECZKA zatrudni sprzedawcę do delikatesów mięsnych- PIASECZNO",
        "phone": "509426067508257843",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Wraz z rozwojem prężnie działającej firmy posiadającej sieć sklepów na terenie województwa mazowieckiego\n\nposzukujemy pracownika do palcówki w Piasecznie na stanowisko:\n\nEKSPEDIENTKI/EKSPEDIENTA Miejsce pracy:\n\nPIASECZNO, ul. szkolna 13b\n\nIdealnym kandydatem/kandydatką będzie osoba posiadająca doświadczenie w branży spożywczej.\n\nDodatkowo oczekujemy:\n\n- znajomości obsługi kasy fiskalnej i terminala płatniczego\n\n- aktualnej książeczki sanitarno-epidemiologicznej\n\n- otwartości na kontakt z klientem, zaangażowania, uczciwości, dyspozycyjności, umiejętności pracy w zespole\n\nOferujemy:\n\n-atrakcyjne wynagrodzenie z licznymi premiami oraz dodatkami\n\n- zatrudnienie w rzetelnej i stabilnej firmie\n\n- podnoszenie kwalifikacji poprzez szkolenia\n\n- zatrudnienie na podstawie umowy o pracę lub umowy zlecenia, z możliwością indywidualnego ustalenia czasu pracy,\n\n- wynagrodzenie zawsze na czas\n\n- pracę w zgranym zespole\n\n- wolne niedziele\n\n-kartę medyczną lub ubezpieczenie grupowe\n\nJeśli jesteś zainteresowany/a proszę o przesłanie CV na adres e-mail wraz z dołączoną zgodą o przetwarzanie danych osobowych.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "TelePizza zatrudni dostawcę",
        "phone": "501124326",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię dostawcę z własnym pojazdem do rozwożenie posiłków.\n\nGodziny pracy są elastyczne można je dostosować do własnych potrzeb.\n\nNa wynagrodzenie składają się stawka godzinowa plus stawka za każdy wykonany kurs.\n\nPraca jest na umowę zlecenie a w perspektywie również na umowę o pracę\n\nChodzi o następujące lokalizacje\n\nTelePizza Warszawa ul. Grochowska ( telefon kontaktowy 50*******47 )\n\nTelePizza w Legionowie  ( telefon kontaktowy 50*******26 )\n\nTelePizza Warszawa ul. Miodowa   ( telefon kontaktowy 50*******26 )\n\nJeśli chodzi o lokal przy ulicy Miodowej to tutaj poszukujemy dostawcy na firmowy skuter.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Rozbrat 20 zatrudni osoby na stanowisko Commis / Młodszy kucharz",
        "phone": "224166266",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Praca w jednej z najlepszej restauracji w Warszawie nagradzanej przez przewodnik Michelin pod okiem utalentowanego szefa kuchni.\n\nSzukamy osób z doświadczeniem, ambitnych, kreatywnych. Jeżeli jesteś gotowy na nowy krok w swojej karierze napisz do nas.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Praca cukiernia pomoc produkcja",
        "phone": "513555585",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam poszukujemy osób do pracy w Cukierni przy produkcji domowych ciast .\nPraca jednozmianowa od poniedziałku do piątku . Praca dla osób również bez doświadczenia .Zapraszam do kontaktu",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Kierowca z własnym samochodem",
        "phone": "511697345",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Pełen etat Stawka 31 brutto na godzinę\n\nStawka za kurs , stawka godzinowa + dodatki do paliwa .\n\nPosiłki pracownicze od 9 zł.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "cukiernik,piekarz nocki",
        "phone": "226798486",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Przyjmę do pracy w godzinach nocnych. .Stawka godzinowa ustalana indywidualnie . Aktualne badania .Targówek ,Jórskiego 20",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Barista/sprzedawca w rzemieślniczej kawiarni",
        "phone": "508112889",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Hej!\nDo otwierającej się kawiarnio-cukierni Krucho - Cakes & Coffee przy ul. Ząbkowskiej 4 (4minutki od stacji metra Dworzec Wileński) poszukuję baristy/sprzedawcy. \n\nOtwieramy się 29.01 lub 5.02\n\nTo rzemieślnicze miejsce na mapie Starej Pragi, gdzie z dbałością o jakość produktów przyrządzamy wszelkiego rodzaju torty, monoporcje, ciasta, wypieki,… Stworzone z pasją, gdzie praca ma być także miłym spędzeniem czasu, a nie przykrym obowiązkiem! Osobom z wiecznym grymasem dziękuję…\n\nDo obowiązków należy: \n- przyrządzanie napojów (kawa, herbata, czekolada, soki etc.)\n- bieżąca obsługa gości kawiarni, serwowanie deserów\n- utrzymanie czystości w miejscu pracy oraz dbanie o dobrą atmosferę \n\nWymagania:\n- doświadczenie na podobnym stanowisku mile widziane, lecz niekonieczne \n- wysoka kultura osobista i komunikatywność !\n- dyspozycyjność i elastyczność (10-11h wtorek-piątek)\n- odpowiedzialne podejście do pracy i punktualność \n- status studenta mile widziany \n- znajomość j. angielskiego na poziomie komunikatywnym \n- książeczka sanitarno-epidemiologiczna (lub gotowość do wyrobienia) \n\nOferujemy:\n- szkolenie baristyczne \n- umowę zlecenie \n- rodzinną atmosferę \n- nielimitowane napoje i zniżki pracownicze na słodkości\n- premię za dobre wyniki \n- stawka zależna od umiejętności i zaangażowania 20-22zl/h \n\nZapraszam do podesłania CV ze zdjęciem na adres mailowy. Będzie mi bardzo miło, jeśli napiszesz kilka słów o sobie\n\nAga",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kucharz/ Kucharka",
        "phone": "530644896",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Nowa Restauracja na warszawskim Wilanowie\n\npod dowództwem Jerzego Sobieniaka\n\nposzukuje kucharzy.\n\nzakres obowiązków:\n\nPrzygotowanie dań zgodnie z obowiązującymi standardami.\n\nRacjonalne gospodarowanie towarem.\n\nMinimalizowanie strat.\n\nDbanie o odpowiednią estetykę potraw.\n\nUtrzymywanie porządku i higieny w miejscu pracy.\n\nzapewniamy\n\natrakcyjne wynagrodzenie zależne od umiejętności\n\nmożliwości rozwoju\n\nstabilne warunki pracy",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Restauracja zatrudni osobę na zmywak i pomoc kuchenną.",
        "phone": "533411933",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja włoska Portofino zatrudni osobę na zmywak i pomoc kuchenną.\n\nOczekujemy:\n\n*zaangażowania\n\n*dyspozycyjności\n\n*chęci do pracy\n\n*umiejętności organizowania swojej pracy\n\nOferujemy:\n\n*stabilne zatrudnienie\n\n*konkurencyjne zarobki- uzależnione od umiejętności i zaangażowania\n\n*pracę w zgranym zespole i przyjaznej atmosferze\n\n*posiłek pracowniczy\n\nOsoby zainteresowane prosimy o wysyłanie CV przez portal.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Osoba do obsługi gości/sprzedawca w Bistro",
        "phone": "501281035",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zapraszamy do pracy w niedużym Bistro na Pradze Południe a dokładnie przy ulicy Chrzanowskiego 4. \n\nPraca polega na obsłudze gości, którzy przychodzą po przetwory/ciasta/garmażerkę lub po prostu usiąść i zjeść. \nOkolica to tzw. „młode osiedle” więc fajnie jakby to była osoba ciepła, miła, uśmiechnięta.\n\nGrafik elastyczny - bistro jest otwarte 7 dni w tygodniu 8-20 i na te godziny ustalamy godziny pracy. \n\n18 zł/h + napiwki\nPierwszy miesiąc umowa zlecenie, później do ustalenia.\n\nProsimy zainteresowanych tylko o kontakt telefoniczny!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Chillichicken Wołomin zatrudni Sprzedawcę",
        "phone": "798771538",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Chillichicken Wołomin zatrudni od zaraz na stanowisko sprzedawcy\n\nPraca w trybie dzień na dzień po 12 godzin.\n\nOd Kandydatów oczekujemy:\n\n-odpowiedzialności\n\n-dyspozycyjności\n\n-aktualnych badań (książeczka sanepidowska)\n\n-chęci do pracy i nauki\n\nOferujemy:\n\n-elastyczny grafik\n\n-szkolenie wprowadzające\n\n-pracę w zgranym zespole\n\n-możliwość wypłaty wynagrodzenia co 2 tyg.\n\nOsoby zainteresowane podjęciem współpracy prosimy o przesłanie CV wraz ze zdjęciem poprzez formularz OLX lub o kontakt telefoniczny w celu umówienia się na spotkanie :)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Pomoc Kuchenna, Ursynów",
        "phone": "509787620",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukuję osoby chętnej do pracy na stanowisko Pomoc Kuchenna oraz osoby do pracy na zmywaku. Praca jednozmianowa od poniedziałku do piątku w godzinach 7-15, weekendy i święta zawsze wolne.\n\nProszę o kontakt telefoniczny 50*******60",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "pomoc przy produkcji cukierniczej Grochów",
        "phone": "601330700",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Cukienria na Grochowie zatrudni osobę do przyuczenia przy produkcji cukierniczej.\n\nZakres obowiązków:\n\npomoc przy produkcji cukierniczej\nobsługa pieca\nprace porządkowe na stanowisku pracy oraz przy zmywaniu\nprzyjmowanie towaru, przynoszenie towarów z magazynu na pracownię\nnauka wałkowania ciasta kruchego, \n\nWymagania:\n\nksiążeczka do celów sanit. epidem.\ndyspozycyjność w weekend (praca mniej więcej 1 raz w miesiącu rotacyjnie) i pojedyncze święta takie jak Boże Ciało, 1,3 maja, Zielone świątki czy Św. Trzech Króli. Praca w weekend i święta jest przeważnie krótsza.\npraca po 8 h dziennie od godziny 7.00 pon-pt (+ weekend pracujący od 7.00)\nwymagana większa dyspozycyjność w Tłusty Czwartek i w okresach przedświątecznych- dłuższy wymiar godzinowy\n\ndodatki: paczki świąteczne, deputat pracowniczy w pracujące niedziele i święta (wybrane ciastka/ciasto w określonej kwocie)\n\nCV mile widziane ze zdjęciem prosimy wysyłać poprzez formularz olx. \n\nw razie pytań prosimy od razu o wpisanie ich w wiadomości ze zgłoszeniem.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kucharz kuchnia japońska",
        "phone": "535120160",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Do japońskiej restauracji na Nowym Świecie poszukujemy:\n\n*Kucharzy\n\n*Pomoc kuchenną\n\nOferujemy:\n\n*Przyjazną atmosferę\n\n*Pracę w trybie zmianowym z elastycznym grafikiem\n\n*Umowę zlecenie na początek\n\n*Stawkę uzależnioną od umiejętności:\n\nkucharz od 21 zł netto\n\npomoc kuchenna od 19 zł netto\n\nDużym atutem będzie znajomość kuchni japońskiej i doświadczenie w przygotowaniu ramenu. Nie jest to jednak warunek konieczny, wszystkiego w razie potrzeby nauczymy.\n\nJeżeli umiesz pracować drużynowo, jesteś osobą bezkonfliktową i  lubisz gotować - zapraszam do wysyłania CV.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "kierowca do cateringu",
        "phone": "501677620",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma cateringowa poszukuje osoby na stanowisko KIEROWCY do rozwożenia cateringu.\n\nOsoba ta będzie odpowiedzialna za:\n\nrozwożenie posiłków profilaktycznych oraz do obiadów do szkół.\n\nWymagania:\n\ndoświadczenie w pracy na podobnym stanowisku \n\naktualne badania do celów sanitarno-epidemiologicznych\n\nsumienność, punktualność, zaangażowanie, uczciwość.\n\nZapewniamy:\n\nzatrudnienie od zaraz \n\numowę o pracę lub umowę zlecenie\n\npraca poniedziałek-piątek 9.00-13.00 \n\nstawka 20,00 -23,00zł brutto/ h zależna od doświadczenia i umiejętności oraz rodzaju umowy\n\nMiejsce pracy: Warszawa ul Ostrobramska 38\n\n \n\nZainteresowane osoby prosimy o kontakt 50*****20",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kelner/Kierownika Zmiany do Restauracji Strefa Sushi w Książenicach",
        "phone": "508403094",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Twój zakres obowiązków:\n\nObsługa gościa\nOdpowiedzialność za prowadzenie zmian w Restauracji\nDbanie o satysfakcję Gości i realizację dostaw \nPraca z zespołem i budowanie zespołu. \nRealizowanie celu sprzedażowego.\nŚcisła współpraca z Managerem restauracji.\n\n \n\nNasze wymagania\n\nMinimalne doświadczenie w zarządzaniu i pracy z zespołem.\nPasja, zaangażowanie i entuzjazm w działaniu.\nUmiejętność organizacji pracy własnej i zespołu.\nOtwartość na podnoszenie kompetencji i poszerzanie wiedzy.\nWażne badania sanitarno-epidemiologiczne.\n\nMile widziane:\n\nPrawo jazdy kat. B\nDoświadczenie w gastronomii\n\n Oferujemy:\n\nUmowę o pracę/zlecenie/B2B\nMożliwość rozwoju zawodowego.\nPraca w systemie zmianowym, restauracja czynna 12-21, pt-sb 12-22\nZniżkę pracowniczą na menu oraz benefity w Strefie Ruchu Książenice\n\nProsimy o dopisanie w CV zgody na przetwarzanie danych osobowych:\n\n\"Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z ustawą z dnia 10 maja 2018 roku o ochronie danych osobowych (Dz. Ustaw z 2018, poz. 1000) oraz zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO).\"",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Kucharz - catering dietetyczny",
        "phone": "726412440",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma cateringu dietetycznego poszukuje osób na stanowisko kucharza. Praca pięć razy w tygodniu po 7-9 godzin 6.00 - 14.00/15.00 niedziela-piątek.\n\nDniówka 200 zł netto (25 zł- 32zł/h). na początek umowa zlecenie (pierwsze  miesiąc, później umowa o pracę) + premie (od dwóch do 3 dniówek dodatkowo). Stawka początkowa, wraz ze stażem i wzrostem umiejętności są przewidziane podwyżki.\n\nPoszukujemy osób lubiących gotować ze smakiem, oraz z chęcią rozwoju swoich umiejętności kulinarnych. Klientom serwujemy potrawy restauracyjne z kuchni polskiej oraz kuchni świata.\n\nZespół młody i zgrany, STAŁA EKIPA. Szukamy kogoś otwartego i pozytywnego (to dla nas bardzo ważny element :)\n\nCo do pozostałych oczekiwań to mile widziane min 3 letnie doświadczenie w pracy na stanowisku Kucharza samodzielnego, znajomość języka polskiego w mowie i piśmie - obowiązkowa (codzienne raporty z recepturami i gramaturami dla każdego kucharza są rozdawane w języku polskim).\n\nSzukamy osoby na stałe - nie są nam straszne lockdowny , nie dotyczą naszego biznesu. Zatrudniamy wciąż nowe osoby , nie zwalniamy ludzi i tępa ;)\n\nProsimy zgłoszenia wysyłać w formie CV z nr telefonu.\n\nWarszawa Włochy ul. Wszemirowska",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Zatrudnie Szef kuchni /kucharz samodzielny",
        "phone": "500250223",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Nowo powstała restauracja na obiekcie sportowym w Mszczonowie . Deep rest&bar \nW DeepSpot . \nZatrudni Szefa kuchni oraz kucharzy samodzielnych \nPodstawowy warunek to Pasja  do gotowania i chęć rozwoju osobistego. \nWymagamy: \nZnajomości Kuchni Europejskiej oraz doświadczenie w żywieniu VEGAN i  ludzi prowadzących zdrowy tryb życia. \nSzukamy osób kulturalnych. \nSzanujących PRACĘ i KLIENTA. \nPoszukujemy do zespołu Osób bez nałogów!!! \nZnających się na robocie, którym tabaka jest nie straszna. Jeśli masz swój zgrany zespol. Rownież zapraszamy. \nPraca zapewniona cały rok. \nZapraszam do kontaktu. \nCV składamy biuro.no145(małpa)gmail.com \nPoszukujemy również kelnerów do współpracy ciągłej. \nWarunki do dogadania.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "PRACA DLA STUDENTA - 20/22 zl netto - Pracownik - Smashny Burger",
        "phone": "579724365",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Od momentu otwarcia w kwietniu 2021 roku nasza restauracja przyczyniła się do spopularyzowania w Warszawie smash burgerów! Nasze burgery są uważane za jedne z najlepszych w mieście dzięki naszej specjalnej metodzie gotowania i koncentracji na wysokiej jakości składnikach.\n\nStanowisko: Smash Master\n\nStawka: 20-22 zl /h netto\n\nKiedy: od zaraz\n\nZakres obowiązków:\n\n- Przygotowanie najlepszych burgerów w mieście\n\n- Zarządzanie POS\n\n- Utrzymanie restauracji w czystości\n\nOferujemy:\n\n- Atrakcyjne wynagrodzenie\n\n- Elastyczny grafik, 2 do 4 dni w tygodniu\n\n- Darmowe i smaczne hamburgery :)\n\nOczekujemy:\n\n- Gotowości do pracy w różne dni tygodnia, także soboty i niedziele\n\n- Dobre umiejętności organizacyjne i punktualność\n\n- Aktualnego orzeczenia do celów sanitarno-epidemiologicznych\n\n- Dobra znajomość języka polskiego i angielskiego",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Poszukujemy pracownika restauracji North Fish Arkadia",
        "phone": "664998241",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy pracowników obsługi Gościa do lokalu gastronomicznego North Fish w galerii Arkadia\n\nOferujemy:\n\n- elastyczny grafik - Ty decydujesz kiedy chcesz pracować! (możliwość pracy zarówno na pełny jak i niepełny etat)\n\n-pracę w systemie dwuzmianowym\n\n- stawka na początek: 19,70 zł/h brutto (jeżeli jesteś uczniem/studentem do 26 roku życia - 19,70 zł/h netto)\n\n- płatne szkolenie - nie wymagamy doświadczenia - wszystkiego Cię nauczymy!\n\n- wynagrodzenie zawsze w terminie\n\n- atrakcyjne zniżki na posiłki pracownicze\n\n-pracę w młodym i zgranym zespole\n\nOczekujemy:\n\n- ukończonych 18 lat (jeżeli kończysz 18 lat w tym roku kalendarzowym - również zapraszamy!)\n\n- ważnych badań sanepidu\n\n- pozytywnego nastawienia do pracy i chęci rozwoju\n\nCHĘTNIE NAWIĄŻEMY Z TOBĄ DŁUŻSZĄ WSPÓŁPRACĘ :)\n\nZainteresowany/a? Zapraszam do kontaktu\n\nAdministratorem Twoich danych osobowych jest North Food Polska S.A. z siedzibą w Kielcach (25-323) przy al. Solidarności 36. Przetwarzamy Twoje dane osobowe w celu przeprowadzenia rekrutacji. Będziemy również je przetwarzać w celu prowadzonych rekrutacji w przyszłości, jeśli wyrazisz na to zgodę. Przysługuje Ci prawo do dostępu do swoich danych oraz otrzymania ich kopii, sprostowania (poprawiania) swoich danych, usunięcia, ograniczenia lub wniesienia sprzeciwu wobec ich przetwarzania, przenoszenia danych, wniesienia skargi do organu nadzorczego, a także wycofania zgody. Pełną treść klauzuli informacyjnej znajdziesz tutaj\n\nW przypadku zainteresowania udziałem również w przyszłych procesach rekrutacyjnych prosimy o zamieszczenie klauzuli: Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w CV i innych dokumentach aplikacyjnych w celu wykorzystania ich w przyszłych procesach rekrutacyjnych przez North Food Polska S.A.\n\n ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kelnerka kelner Konstancin Jeziorna",
        "phone": "602261698",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja w Konstancinie zatrudni osobę na stanowisko kelnerki. Praca zmianowa, w tygodniu oraz w niektóre weekendy. Oczekujemy:\n\nznajomości obsługi kelnerskiej, kasy fiskalnej i terminala\n\ndbania o porządek w miejscu pracy\n\nłatwości współpracy z zespołem\n\nrzetelności, odpowiedzialności, zaangażowania, uczciwości, dyspozycyjności\n\nmile widziane prawo jazdy\n\nOferujemy:\n\numowę o pracę po okresie próbnym\n\natrakcyjne wynagrodzenie plus system premiowy uzależniony od zaangażowania\n\nmożliwość dopasowania grafiku do pracownika\n\nlunch pracowniczy\n\nWięcej informacji tel.6******98",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Zatrudię doświadczonego cukiernika",
        "phone": "48697979899",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Jesteśmy Cukiernio lodziarnią poszukującą ambitnego cukiernika. Oferujemy wysokie wynagrodzenie. Praca od poniedziałku do piątku .",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Pakowanie diet catering dietetyczny, pomoc kuchenna.",
        "phone": "505809326",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię pomoc do cateringu dietetycznego.\n\nZakres obowiązków:\n\npomoc na kuchni\npakowanie diet\nutrzymywanie porządku .\n\nPraca od godziny 8 po około 8-10 h od niedzieli do czwartku. Stawka na początek 16 zł netto/h (na ręke).\n\nProszę o wysyłanie CV na maila lub kontakt 50*******26",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Pomoc kucharza kuchni",
        "phone": "531112430",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Pomoc kuchni \nWstawianie frytek ,zmywanie ,krojenie\n6 dni w tygodniu 16-18 \nNa czas szkolenia 15 zł",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pracownik Restauracji Janki",
        "phone": "666830615",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Dołącz do Naszego zespołu!\nTo miejsce pracy czeka właśnie na Ciebie! - bez względu na to czy szukasz pracy stałej czy dorywczej.\nRozwijaj się razem z Nami.\n Poszukujemy na stanowisko:\n \n\nPracownik Restauracji Janki\n\n( możliwość pracy w pełnym lub niepełnym wymiarze godzin)\n\nCzego oczekujemy?:\n-Otwartości na potrzeby Naszych Gości,\n-Zaangażowania,\n-Chęci do szkolenia i rozwoju zawodowego\n\nCo oferujemy?:\n-Możliwość rozwoju kompetencji i szybki awans,\n-Uczciwe warunki zatrudnienia w oparciu o umowę o pracę,\n-Konkursy motywacyjne dla załogi jako możliwość dodatkowej gratyfikacji pieniężnej,\n-Szkolenie i pracę w zespole w którym ceni się atmosferę i wzajemne relacje,\n-Zniżki na posiłki pracownicze\n \nChcesz uzyskać więcej informacji? Zadzwoń: 66*******15 lub napisz: mavam5mcd(małpa)gmail.com",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Piekarz Ciastowy, Piecowy, Pomocnik -Piekarnia Kołakowski & Piotrowscy",
        "phone": "601947040",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Piekarnia Kołakowski & Piotrowscy zatrudni piekarzy na stanowisku Ciastowy, Piecowy.\n\nCiastowy przygotowuje ciasto na pieczywo i wypieki słodkie.\nDo obowiązków Piecowego należy wypiek pieczywa na tradycyjnym piecu typu rrk.\n\nOferujemy umowę o pracę. Praca na jedną zmianę z doświadczonym zespołem.\n\nMożliwość zakwaterowania w kamienicy obok piekarni.\n\nProsimy o kontakt pod numerem 60********40.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kelner/ka Barman/ka/ Barista",
        "phone": "512611884",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię kelnerkę/ kelnera, barmankę/ barmana, baristę do restauracji i sali bankietowej w Legionowie.\n\nZapraszamy do kontaktu jeśli:\n\n-jesteś osobą o miłym usposobieniu, wysokiej kulturze osobistej i nienagannym wyglądzie\n\n-umiesz współpracować z zespołem\n\n-masz już pierwsze doświadczenia w gastronomii lub jesteś chętny/ chętna do nauki\n\n-masz prawo jazdy i jesteś chętny/ chętna także do dowożenia zamówień\n\nOferujemy:\n\n-elastyczną formę zatrudnienia dostosowaną do Twoich potrzeb\n\n-możliwość pracy w nowym miejscu na mapie Legionowa\n\n-konkurencyjne wynagrodzenie i premie uznaniowe, dodatki za dostawy\n\n-pracę od zaraz!\n\nPraca codziennie w godz. 12:00 - 22:00. Także osoby na niepełny etat ale dyspozycyjne także w weekendy. \n\nJeśli zainteresowała Cie ta oferta to prosimy o kontakt telefoniczny. Czekamy na Ciebie!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Lokal gastronomiczny szuka pracownika!",
        "phone": "664998242",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukuje do lokalu gastronomicznego North Fish osoby na stanowisko pracownika kuchni bądź Obsługi Gościa :)\n\nLokalizacja? Galeria Wola Park.\n\nElastyczny grafik, sam wybierasz w jakie dni chcesz pracować, praca dodatkowa bądź na stałe, płatne szkolenie, umowa o pracę/zlecenie, wynagrodzenie zawsze na czas, atrakcyjne zniżki na posiłki pracownicze.\n\nStawka na sam początek to 19,70zł brutto (jeśli jesteś studentem przed 26 r.ż jest to Twoja stawka netto)\n\nCzego oczekuje?\n\nbadań do spraw sanitarno-epidemiologicznych\n18 lat (jeśli kończysz jeszcze w tym roku- również zapraszam)\n\nChcesz wiedzieć więcej? Odezwij się do mnie :)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Poszukujemy Kucharza kuchni azjatyckiej/ sushi mastera",
        "phone": "500645499",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja Shima Sushi w Łochowie poszukuje kucharza kuchni azjatyckiej i sushi mastera. Wszystkiego nauczymy od postaw, zależy nam na zaangażowaniu i odpowiedzialności. Umowa i stawka godzinowa do uzgodnienia. Osoby zainteresowane zapraszamy do współpracy.\nProsimy o kontakt telefoniczny: 50*******99",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pakowanie posiłków",
        "phone": "790809989",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma cateringowa zatrudni osoby do 35 lat do pakowania diet pudełkowych. Zakres obowiązków: – rozkładanie i pakowanie przygotowanych wcześniej posiłków, – oklejanie pudełek, Oczekujemy: – chęci do pracy, – umiejętności pracy w zespole, – aktualnej książeczki do celów sanitarno-epidemiologicznych, – doświadczenie w gastronomii mile widziane. Oferujemy: – miłą atmosferę, – terminowe wypłaty wynagrodzeń. Chętnych zachęcamy do wysyłania CV! Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO).",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "zatrudnię w zakładzie garmażeryjnym",
        "phone": "504147142",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię do pracy odpowiedzialne i pracowite osoby w zakładzie produkującym wyroby garmażeryjne. Praca pięć dni w tygodniu w godzinach od 10.00 do 20.00 \n\nW zależności od zamówień, praca również w soboty. \n\nJeżeli wypada dzień pracujący w sobotę, piątek i niedziela wolne od pracy. \n\nProszę tylko i wyłącznie o kontakt telefoniczny osoby które są zdecydowane i chętne do pracy w godzinach od 9.00 do 17.00 \n\nStawka godzinowa 16 złotych netto za godzinę. \n\nMożliwość wypracowania godzin nadliczbowych. \n\nKontakt pod numerem telefonu 50*******42 ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Pizzeria Biesiadowo Bielany zatrudni kelnerke",
        "phone": "508265611",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Pizzeria Biesiadowo Bielany zatrudni kelnerkę.Elastyczny grafik,możliwość pracy tylko w weekendy.Więcej informacji pod numerem telefonu:50*******11 , 50*****94",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pizzer, kucharz do pizzerii na Woli",
        "phone": "48500185727",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy odpowiedzialnej osoby z doswiadczeniem do pracy w charakterze pizzera, \n\noferujemy elastyczny grafik, zakres pracy pizzerii 10:00-04:00.\n\nWynagrodzenie od 21zł do 25zł netto, umowa o pracę.\n\nMile widzane doświadczenie na piecu na drewno.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Kucharz poszukiwany",
        "phone": "514908170",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Do nowo otwieranej restauracji w Łomiankach koło Warszawy poszukujemy kucharza (kuchnia polska i kuchnia wegetarianska) ,pizza mastera, kelnerki oraz pomoce kuchenne. Praca stała. Wymagane doświadczenie",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Zatrudnię cukiernika",
        "phone": "500103292",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię cukiernika do pracy w niewielkiej cukierni w dzielnicy Wawer. Praca od godziny 16. Osoby zainteresowane zapraszam do kontaktu telefonicznego po godzinie 17.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Restauracja na Wilanowie zatrudni barmana/barmankę",
        "phone": "697166163",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja na Wilanowie zatrudni barmana/barmankę.\n\nOsoby zainteresowane pracą proszę o przesłanie swoich CV.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Wydawca / pomoc kuchenna",
        "phone": "519410101",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Hej Gastro!\n\nPoszukujemy pracowników do naszego #dreamteamu w restauracjach burrito MariCruz na ulicy Zgody i w Food Hallu Elektrowni Powiśle (prosta praca w kuchni oraz na wydawce).\n\nNie musisz mieć doświadczenia - zapewnimy Ci pełne przeszkolenie, wsparcie i dobry, pozytywny klimat po stronie całej naszej ekipy, możliwość rozwoju, no i - co najważniejsze - pieniążki na czas.\n\nWymagamy tylko solidnego podejścia do pracy, przyjaznego, otwartego usposobienia i aktualnej książeczki sanepidowskiej. Mile widziany status studenta.\n\nStawka: podczas szkolenia 16,50/h, po szkoleniu 19,70/h netto plus premie od utargu. Umowa zlecenie.\n\nCzołem i trzymajcie się ciepło! :)\n\n*Pod numerem telefonu prosimy kontaktować się w godzinach 8-20.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Pizzer z doświadczeniem do restauracji",
        "phone": "607332457",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja z kuchnią włoską w Warszawie ( dzielnica Włochy) zatrudni osobę na stanowisko pizzera. Wymagane doświadczenie, chęci do pracy i uśmiech. Praca zmianowa, elastyczny grafik.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pracownik Punktu Bafra Kebab 22 zł/h brutto",
        "phone": "733392397",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy pracownika do punktu gastronomicznego Bafra Kebab. Nie wymagamy doświadczenia - wszystkiego Cię nauczymy, wystarczą dobre chęci do pracy i nauki!\n\nNasze lokalizacje: Żyrardów, Piastów, Parzniew, Raszyn, Warszawa-Ursus, Warszawa-Okęcie\n\nPraca polega na :\n\nprzygotowaniu posiłków dla klienta,\nobsłudze klienta i terminala,\nutrzymaniu czystości na punkcie.\n\nOferujemy :\n\npracę odporną na obostrzenia pandemiczne - żadnych przestojów\nelastyczny grafik\nstawka: do 22 zł/h brutto \numowa zlecenie\nwynagrodzenie uzależnione od umiejętności i zaangażowania\npremie uznaniowe\nstałe i jasne warunki zatrudnienia oraz pracę na lata\ncodzienny posiłek z oferty punktu\n\nWymagamy:\n\nchęci do pracy i uczenia się\nksiążeczki sanepidowskiej lub chęci jej wyrobienia",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Nowa restauracja koreańska Home BBQ szuka Kelnerów/Kelnerek",
        "phone": "570661080",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam !\n\nNowo otwarta restauracja Koreańska Home BBQ szuka osób chętnych do pracy na stanowisko kelner/kelnerka.\n\nMamy dwie piękne sale z grillami w stołach gdzie klient czuje się jakby był w Korei.\n\nZapraszamy osoby doświadczone jak i bez doświadczenia chętnie podzielimy się wiedzą.\n\nOczekujemy od chętnych dyspozycyjności 4 dni w tygodniu.\n\nWymagana znajomość języka polskiego i angielskiego (podstawy).\n\nChęci do nauki i rozwoju.\n\nOferujemy 20-25zł za godzinę pracy .\n\nElastyczny grafik , zgraną ekipę ,posiłek pracowniczy, umowa o pracę.\n\nJeśli jesteś chociaż trochę zainteresowany stanowiskiem nie zastanawiaj się dzwoń bądź aplikuj, nie spróbujesz to się nie dowiesz :)\n\nWięcej szczegółów odnośnie pracy na rozmowie wstępnej bądź dniu próbnym.\n\nChętne osoby prosimy dzwonić w każdy dzień od 12:00-20:00 albo Email\n\nRestauracja znajduje się przy ul. Bakalarskiej 11. \n\nZapraszamy do kontaktu !",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Pizzaiolo z doświadczeniem",
        "phone": "226292540",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Do restauracji w centrum Warszawy poszukujemy doświadczonego pizzaiolo \n\nPraca na otwartej kuchni\n\nStawka 23/h plus premie \n\numowa zlecenie/umowa o pracę\n\nZgłoszenia wraz z CV proszę przesyłać przez formularz OLX.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Pomoc kuchenna, kucharka, kuchnia polska",
        "phone": "737558452",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Dzień dobry\n\nPoszukujemy do naszego zespołu Pewex baru :\n\nPani na stanowisko pomocy kuchennej.\n\nBar serwuje typowo domową kuchnię polską.\n\nZakres obowiązków to przygotowywanie surówek,\n\noraz prostych dań jakie każdy robi w domu :)\n\nMożliwość przyuczenia.\n\nPraca w godzinach 6-14.\n\nEwentualnie grafik i dni do uzgodnienia jeśli byłby\n\nto niepełny wymiar pracy.\n\nLokal znajduje się w Łazach.\n\nZapraszamy do składania ofert lub kontakt telefoniczny.\n\nPozdrawiam",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Praca w cukierni",
        "phone": "691950713",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Cukiernia Marzenie przyjmie do pracy od zaraz na produkcję, stawka godzinowa , praca pięć dni w tygodniu,\n\ntel 69*******13",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "PRACA DLA STUDENTA - Subway Politechnika",
        "phone": "519342393",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "SUBWAY w pobliżu Politechniki Warszawskiej poszukuje osób na stanowisko Pracownik Restauracji (zobowiązanie na minimum 6 m-cy)\n\nPoszukujemy osób chcących podjąć zatrudnienie w trybie zmianowym ( 7:00-15:00, 15:00-21:00)\n\nPodstawowe zadania:\n\nObsługa Naszych Gości z zachowaniem wszelkich środków bezpieczeństwa w okresie pandemii oraz standardów sieci\nPrzygotowywanie sandwichy, wrapów oraz sałatek zgodnie z życzeniem klienta z zachowaniem standardów SUBWAY\nPraca zespołowa\nWzajemne wsparcie jak i wzajemne szkolenie się\nDbanie o porządek w restauracji\n\nOd kandydatów oczekujemy:\n\nStatusu studenta\nPozytywnej energii\nUmiejętności pracy w zespole\nDokładności i zaangażowania i punktualności\nKsiążeczki sanitarno-epidemiologicznej lub chęci jej wyrobienia\n\nNaszym pracownikom oferujemy:\n\nGrafik, który stara się spełnić oczekiwania całego zespołu z zachowaniem wszelkich zasad :)\nPracę na pełnym lub nie pełnym wymiarze,\nMożliwości rozwoju zawodowego\nSzkolenie od pierwszego dnia, gdzie uczymy Cię wszystkiego tego co wiemy :)\nPrace w młodym energicznym zespole :)\nkanapki za symboliczną opłatą :)\n\nZainteresowało Cię Nasze ogłoszenie - prześlij Nam swoje CV i stań się częścią naszego zespołu - wyślij cv klikając w przycisk aplikowania.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Praca, garmażerka",
        "phone": "791777891",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy osób do pracy na kuchni -> lepienie pierogów, mącznych (kopytka, leniwe), smażenia kotletów i tym podobnych. Kuchnia znajduje się w Ząbkach przy ulicy Bocianiej. Możliwość ustalenia stawki godzinowej, tygodniowej stałej jak i na procent (23,5% od wyrobionego towaru).\n\n ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Wypasiony PIZZER 24zł/h MOKOTÓW 4500 - 6000 na rękę",
        "phone": "570574574",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukiwany pizzer Proszę o kontakt telefoniczny od 11.\n\n \n\nOferujemy:\n\n \n\n- Stabilne i wysokie zarobki 22-24 brutto zł/h\n\n- Praca na gotowych półproduktach bez produkcji sosów ciasta itd.\n\n- Zgrany zespół\n\n- Posiłki pracownicze\n\n- Ubrania pracownicze\n\n- Możliwość rozwoju i awansu\n\n- Pomoc obcokrajowcom w legalizacji pobytu\n\n -Regularnie wypłacane wynagrodzenie - ok 4500 - 6000 na rękę\n\n \n\nWymagamy:\n\n \n\n- Doświadczenia w gastronomii\n\n- Sumienności i pracowitości\n\n \n\nZainteresowanych prosimy o przesyłanie cv lub kontakt telefoniczny 57*****74",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Kelner/ kelnerka",
        "phone": "227827473",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Do naszego zespołu poszukujemy kelnerów/ kelnerek do stałej współpracy.\n\nCo oferujemy:\n\n - umowę o pracę \n\n- pracę w pełnym wymiarze godzin w tym pracę w weekendy\n\n- elastyczne godziny pracy\n\n- regularnie wypłacane wynagrodzenie bez ingerencji w napiwki kelnerskie - Twoje napiwki trafiają w całości do Ciebie\n\n- posiłki i napoje dla pracowników oraz atrakcyjne rabaty w naszej  restauracji\n\n- premie sezonowe\n\n- bardzo dobrą atmosferę w pracy\n\nNasze wymagania:\n\n- wysoki poziom kultury osobistej\n\n- pozytywne nastawienie\n\n- umiejętność nawiązania i podtrzymania relacji z Gośćmi\n\n- doświadczenie w pracy na podobnym stanowisku będzie dodatkowym atutem\n\nJeśli chciałbyś stać się częścią naszej załogi wyślij nam swoje zgłoszenie, a my zaprosimy Cię na rozmowę.\n\nZastrzegamy sobie kontakt z wybranymi osobami.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Zatrudnimy osobę na STAŁE do pracy w BURGEROWNIA na Żoliborzu",
        "phone": "604289859",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy od zaraz osobę do BURGEROWNIA na Żoliborzu do pracy w pełnym wymiarze godzin. Jeśli chcesz pracować w branży gastronomicznej i masz już pierwsze doświadczenia w pracy z burgerami (udokumentowane min. 6 m-cy w lokalu specjalizującym się w produkcji i sprzedaży burgerów)  - zapraszamy do kontaktu pod numerem 60*******59.\n\nPraca w godzinach 12.00-20.00 Nd-Pn / 12.00-21.00 Wt- Czw / 12.00-22.00 Pt-Sb;\n\npraca na zakładkę, kto przychodzi wcześniej ten wychodzi wcześniej, kto przychodzi później ten wychodzi później, system zmianowy do ustalenia z załogą na miejscu.\n\nW zakresie obowiązków między innymi: przygotowanie codziennej produkcji, właściwe przygotowywanie burgerów, utrzymywanie porządku na terenie lokalu, ścisła współpraca z pozostałymi osobami na zmianie, obsługa odwiedzających nas gości;\n\nOFERUJEMY:\n\numowę o pracę lub inną formę zatrudnienia w zależności od potrzeb,\nwynagrodzenie wypłacane w formie dniówek (po każdej zakończonej zmianie), tygodniówek lub w trybie miesięcznym\ncodzienny posiłek i napoje\nszkolenia stanowiskowe oraz strój firmowy (koszulki i czapeczka z LOGO firmy)\nelastyczny grafik dostosowany do potrzeb pracownika, a czasem firmy\nDZIEŃ PRÓBNY - w niepełnym wymiarze godzin, dajemy jeść i pić, płacimy za czas spędzony u nas, nie wymagamy cudów\n\nOCZEKUJEMY:\n\ndoświadczenia w pracy z burgerami, pracy na grillu (u nas grill lawowy, na gaz + kamienie lawy wulkanicznej)\nhigieny osobistej oraz należytego wizerunku w pracy\nzaangażowania w wykonywane obowiązki\nwłaściwych pozytywnych relacji międzyludzkich\numiejętności pracy w zespole 2 do 3 osób / organizacji pracy\nbezwarunkowego przestrzegania regulaminu firmy\nPUNKTUALNOŚCI\n\nJeśli chcesz pracować z nami, prosimy o kontakt pod numerem telefonu 60*****59, wskazanym w ogłoszeniu. Uwaga prośba tylko i wyłączenie o kontakt telefoniczny.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Zatrudnie Panią do pracy przy pierogach",
        "phone": "504247609",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię Panią do produkcji pierogów.\nPraca lekka, przyjemna i dobrze płatna.\nPanie na wczesnej emeryturze również mile widziane.\n\nPodstawowe zadnia:\n\n- Produkcja produktów\n- Pakowanie produktów\n- Utrzymywanie porządku \n\nPraca na noce w 6 dni w tygodniu od 20 po około 8 godzin dziennie.\nSzukamy pracownika na stałe.\nKuchnia znajduje się na Bródnie.\nWynagrodzenie płatne raz w tygodniu.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Pizzer poszukiwany",
        "phone": "502928458",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam, \nPizzeria na Bemowie zatrudni pizzera z doświadczeniem.\nSzukamy na pełny etat lub na kilka dni w miesiącu. \nGrafik ustalany z drugim pizzerem. \nCzynne mamy od poniedziałku do niedzieli w godzinach 10:30-22/23 \nZależy nam na osobie która do pracy przychodzi trzeźwa i na czas.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Obsługa sprzątająca do pracowni cukierniczej",
        "phone": "755708788",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Cukiernia na Mokotowie zatrudni:\n\nOBSŁUGA SPRZTAJĄCA:\n\nZMYWAK\n\nWYMAGANIA :\n\n- mycie sprzętu cukierniczego: blachy, formy do ciastek, ranty itp.\n\n-punktualność \n\n-schludność\n\n-dokładność \n\n2) SPRZĄTNIE PRACOWNI CUKIERNICZEJ/ ZMYWAK\n\nSzukamy osoby do sprzątania biura i pracowni cukierniczej przez 3 dni, a przez 2 dni praca na zmywaku\n\n\tWYMAGANIA :\n\n- mycie sprzętu cukierniczego: blachy, formy do ciastek, ranty itp.\n\n- sprzątnie pracowni cukierniczej\n\n-mycie okien\n\n- pranie/prasownie\n\n-schludność\n\n-dokładność \n\nPraca w godzinach 8:00 - 18:00 lub 10:00 - 20:00\n\n\t",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kelner (K/M) ibis Warszawa Reduta",
        "phone": "225722500",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "KELNER (K/M)\n\nibis Warszawa Reduta\n\nul. Bitwy Warszawskiej 1920r. 16\n\nWarszawa\n\n \n\nTwoja misja\n\nW swojej pracy połączysz zaangażowanie, otwartość na innych oraz swoje doświadczenie, aby goście mogli doświadczać atmosfery gościnności w naszej restauracji, czuli się zaopiekowani i cieszyli się z pobytu u nas! Będziesz współpracować z działem kuchni, aby móc doradzić gościom w wyborze potraw.\n\n \n\nCo chcielibyśmy, abyś wniósł/ wniosła do zespołu\n\n·        Masz łatwość w nawiązywaniu kontaktów, budowaniu relacji oraz potrafisz o nie dbać\n\n·        Obsługa kelnerska a’la carte oraz eventów w hotelu brzmi dla Ciebie ciekawie\n\n·        Stawiasz na pracę zespołową\n\n·        Znasz język polski w stopniu umożliwiającym swobodną komunikację i język angielski na poziomie min. dobrym\n\n·        Jesteś otwarty/a na pracę zmianową\n\n·        Lubisz uczyć się nowych rzeczy\n\n·        Jesteś uprawniony/a do pracy na terytorium Rzeczypospolitej Polskiej, odpowiadającej charakterowi stanowiska pracy opisanego w ramach niniejszego ogłoszenia\n\n \n\nJak o ciebie zadbamy\n\n·        Zaproponujemy współpracę na podstawie umowy zlecenia\n\n·        Elastyczne godziny pracy\n\n·        Będziesz pracować w profesjonalnym zespole\n\nDlaczego warto pracować z nami?\n\nAccor to światowy lider hotelarstwa z ponad 5100 hotelami w 110 krajach pod 39 markami w segmentach Lux, Premium, Midscale & Eco. Na pewno znasz takie marki jak: ibis, Novotel, Mercure, Sofitel.\n\nCo nas wyróżnia? Możesz znaleźć pracę i markę, które najbardziej pasują do Twojej osobowości. Jesteśmy otwarci i witamy Cię takim, jakim jesteś. Wspieramy rozwój i naukę każdego dnia, dbając o to, aby praca nadawała cel Twojemu życiu, tak abyś w trakcie swojej podróży z nami mógł odkrywać nieograniczone możliwości Accor.\n\nDołączając do hoteli Accor, każdy rozdział Twojej historii może zostać napisany przez Ciebie, a my razem możemy kreować gościnność jutra. Odkryj życie, które czeka na ciebie w Accor - APLIKUJ!\n\nDo what you love. Care for the world. ​ Dare to challenge the status quo! ​\n\n#BELIMITLESS\n\n \n\nKLAZULA RODO\n\n·        Informujemy, że Pani/Pana dane osobowe będą przetwarzane przez administratora danych, którym jest spółka Accor Services Poland (Pracodawca) z siedzibą w Warszawie, ul. Złota 59, 00-120 Warszawa, (adres do korespondencji ul. Złota 59, 00-120 Warszawa, Lumen Office), zarejestrowana pod nr KRS 0000785725, NIP: 5252789366. Przetwarzanie danych osobowych będzie prowadzone zgodnie z przepisami Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE. – dalej Rozporządzenie. Kontakt z Inspektorem Ochrony Danych Pracodawcy jest możliwy pod adresem: pl.gdpr(małpa)accor.com\n\n·        Państwa dane osobowe będą przekazane i udostępnione odbiorcom danych, tj. partnerom biznesowym prowadzącym hotele w ramach zawartych z ASP umów franczyzy lub zarządzania pod markami hoteli Grupy Accor (ibis/ibis budget/ibis styles/Mercure/Novotel/Sofitel/MGallery by Sofitel/Pullman) na podstawie prawnie uzasadnionego interesu ASP (art. 6 ust. 1 lit. „f” Rozporządzenia) jakim jest możliwość przeprowadzenia procesu rekrutacji w ramach hoteli stowarzyszonych w Grupie Accor.\n\n·        Pracodawca będzie przetwarzał Państwa dane osobowe zamieszczone w przesłanej aplikacji o pracę na potrzeby procesu rekrutacji i przez okres prowadzenia naboru na stanowisko na które złożyli Państwo aplikację. Ponadto w przypadku wyrażenia dodatkowej zgody na przetwarzanie danych w celu udziału w kolejnych rekrutacjach Pana/Pani dane osobowe będą przetwarzane przez okres 2 lat.\n\n·        Podanie przez Państwa danych osobowych w ramach aplikacji ma charakter obligatoryjny gdyż ich podania wymagają przepisy Kodeksu Pracy (Pracodawca ma prawo ich żądania), a w przypadku innych nieobligatoryjnych danych podanych w CV np.: dotyczących zainteresowań, czy zdjęcia kandydata, ich podanie ma charakter dobrowolny, przy czym podanie danych obligatoryjnych jest niezbędne do zawarcia z Państwem umowy o pracę.\n\n·        Podstawą przetwarzania Państwa danych osobowych jest w zależności od zakresu udostępnionych danych osobowych w ramach przesłanej aplikacji o pracę, zgoda na przetwarzanie danych oraz obowiązujące w tym zakresie przepisy prawa - tj. odpowiednio art. 6 ust. 1 lit a) i c) Rozporządzenia. Przysługuje Państwu prawo do cofnięcia zgody w dowolnym momencie bez wpływu na zgodność z prawem przetwarzania, którego dokonano na podstawie zgody przed jej cofnięciem. Jednocześnie informujemy, iż w przypadku cofnięcia przez Państwa zgody na przetwarzanie Państwa dobrowolnie podanych danych osobowych w ramach toczącego się procesu rekrutacji, Pracodawca zaprzestanie ich przetwarzania, co jednak nie będzie miało wpływu na wynik toczącego się procesu rekrutacji.\n\n·        Informujemy, iż w związku z przetwarzaniem przez Pracodawcę Państwa danych osobowych przysługuje Państwu: prawo dostępu do treści danych na podstawie art. 15 Rozporządzenia, prawo do sprostowania danych na podstawie art. 16 Rozporządzenia, prawo do żądania usunięcia danych na podstawie art. 17 Rozporządzenia, prawo do ograniczenia przetwarzania danych na podstawie art. 18 Rozporządzenia, czy też prawo do przeniesienia danych na podstawie art. 20 Rozporządzenia. Ponadto w związku z udostępnieniem Państwa danych osobowych na rzecz partnerów biznesowych Pracodawcy wskazanych w pkt 2 powyżej, przysługuje Państwu prawo do sprzeciwu wobec takiego przetwarzania Państwa danych. Zgłoszenie przez Państwa sprzeciwu w tym zakresie, spowoduje jednak w konsekwencji brak możliwości skutecznego prowadzenia przez Pracodawcę dalszej rekrutacji w odniesieniu do Państwa aplikacji.\n\n·        W przypadku uznania przez Państwa, że przetwarzanie danych osobowych narusza przepisy Rozporządzenia, przysługuje Państwu prawo do wniesienia skargi do organu nadzorczego tj. do Prezesa Urzędu Ochrony Danych.\n\n·        Państwa dane osobowe nie będą przetwarzane w sposób zautomatyzowany, w tym nie będą one poddane profilowaniu zgodnie z art. 22 ust. 1, 4 Rozporządzenia.\n\n \n\n ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Szukamy Piekarza, Cuk/Piek do pracy na noce Cukierniopiekarnia na Woli",
        "phone": "537700313",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy cukiernika/piekarza do pracy w Piekarni/Pracowni Cukierniczej.\n\ndo obowiązków na tym stanowisku należeć będzie:\n\n \n\n1) Produkcja chleba\n\n2) Przygotowywanie i wypiek produktów z ciasta drożdżowego (drożdżówek, brioszek, bułeczek itp.)\n\n3) Wałkowanie i odpiekanie ciasta kruchego\n\nPraca w systemie 2 na 2 (dwa dni pracy, dwa wolne) na zmianie od 18:00 do 5-6am\n\nzainteresowanych prosimy o przesłanie CV lub kontakt telefoniczny Michał 53*****13",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kucharza zatrudnię",
        "phone": "728440919",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię kucharza do pracy w cateringu dietetycznym.\n\nPoszukujemy osoby do naszego zespołu z doświadczeniem w podobnej pracy.\n\nPraca w Warszawie w dzielnicy Wawer.\n\nPracujemy od niedzieli do piątku.\n\nWynagrodzenie 30 zł/godzina netto.\n\nNa początek umowa zlecenie, możliwość umowy o pracę po okresie próbnym.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pracownik Restauracji MOP Urzut",
        "phone": "664148616",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Dołącz do Naszego zespołu w nowo otwierającej się Restauracji MOP Urzut!\nTo miejsce pracy czeka właśnie na Ciebie! - bez względu na to czy szukasz pracy stałej czy dorywczej.\nGwarantujemy elastyczne godziny pracy.\nRozwijaj się razem z Nami.\nNauczymy Cię wszystkiego od podstaw.\n \nPoszukujemy na stanowisko:\n \n\nPracownik Restauracji MOP Urzut\n\n( możliwość pracy w pełnym lub niepełnym wymiarze godzin)\n\nCzego oczekujemy?:\n-Otwartości na potrzeby Naszych Gości,\n-Zaangażowania,\n-Chęci do szkolenia i rozwoju zawodowego\n\nCo oferujemy?:\n-Możliwość rozwoju kompetencji i szybki awans,\n-Uczciwe warunki zatrudnienia w oparciu o umowę o pracę,\n-Konkursy motywacyjne dla załogi jako możliwość dodatkowej gratyfikacji pieniężnej,\n-Szkolenie i pracę w zespole w którym ceni się atmosferę i wzajemne relacje,\n-Zniżki na posiłki pracownicze\n \nChcesz uzyskać więcej informacji? Zadzwoń: 66*******16 lub napisz: mavam5mcd(małpa)gmail.com",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kelnerkę zatrudnię",
        "phone": "501102765",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię kelnerkę dośwadczenie niewymagane\nPizzeria Corrado \n05-820 Piastow \ntel:50*****65",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Kucharz do restauracji na Mokotowie",
        "phone": "0600705026",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Baretto Pizza&Burger poszukuje kucharza zmianowego. Praca w systemie 2 na 2. Gotujemy jak w nazwie pizze, burgery, makarony. Jestesmy czynni 7 dni w tygodniu 12 -21. Serdecznie zapraszamy do dolaczenia do naszego zespołu!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "kucharkę doświadczoną",
        "phone": "601800190",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię kobietę jako samodzielną kucharkę która posiada umiejętność smacznego gotowania (kuchnia polska) ,praca na Mokotowie 1/1 dzień 12 godzin bez niedziel.\n\nWynagrodzenie od 25 zł netto na godzinę zapraszam do kontaktu i współpracy.\n\nWięcej informacji telefonicznie lub osobiście.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Książeczka, odbiór, sanepid",
        "phone": "667378332",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Tak jak w tytule ogłoszenia\n\nProcedura wysyłkowa, przesyłka pobraniowa\n\nWysyłka tego samego dnia\n\nKontakt tylko telefoniczny",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Szpital zatrudni kucharkę/kucharza",
        "phone": "226973114",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "KUCHARKA/KUCHARZ \n\nOd idealnego kandydata oczekujemy: \n\n· doświadczenia na w/w stanowisku- min. 1 rok,\n\n· umiejętności pracy w grupie.\n\nDo obowiązków pracownika należeć będzie: \n\n· odpowiedzialność za prawidłowe z punktu widzenia sztuki kulinarnej i higienicznej przyrządzanie posiłków,\n\n· odpowiedzialność za jakość i smak posiłków oraz ich zgodność z recepturą podaną przez dietetyka.\n\nInformacje dodatkowe: \n\n· wymagana książeczka do celów sanitarno- epidemiologicznych,\n\n· rodzaj zatrudnienia- umowa o pracę,\n\n· wymiar etatu- pełen etat,\n\n· praca w równoważnym systemie czasu pracy,\n\n· udokumentowane (certyfikat/zaświadczenie) odbycie szkolenia w zakresie systemu HACCP,\n\n· wynagrodzenie od 3 400,00 złotych brutto + premia oraz dodatkowo płatne niedziel i święta\n\nOsoby zainteresowane proszę o przesyłanie CV na maila lub kontakt telefoniczny w dni robocze w godzinach 12-15.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Warszawa- Wola: Praca w kawiarnio - piekarni, od zaraz",
        "phone": "530206115",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Praca praca praca:)\n\nWarszawa - Wola\n\nZAPRASZAMY \n\nw celu uzyskania więcej informacji odnośnie spotkania , prosimy o kontakt pod nr. tel. 53*****15.\n\np>Szukasz pracy? \n\nchcesz się rozwijać, pracować w fajnym zespole, w elastycznych godzinach pracy, w ciekawych miejscach na mapie Warszawy? Zapraszamy:\n\n \n\nPoszukujemy chętnych osób do pracy w kawiarnio - piekarni. p>\n\n\n\nPrężnie rozwijająca się firma poszukuje osób na stanowiska:\n\n- Kierownik lokalu\n\n- Sprzedaz i obsługa klienta\n\n- Pomoc kuchenna\n\nLokalizacja:\n\nMokotow!\n\nMile widziane doświadczenie:-) Jeżeli go nie posiadasz, nic nie szkodzi, nauczymy Cię wszystkiego:-)\n\nPraca w systemie zmianowym od poniedziałku do soboty. \n\nOczekujemy:\n\n-pozytywnej energii,\n\n-dbania o porządek i estetykę lokalu, \n\n-badań sanepidowskich,\n\n-mile widziany status studenta.\n\nWszystkiego Cię nauczymy! \n\nWymagany biegły język polski. \n\n:-) Tworzymy zgrany zespół, w którym dzielimy się pasją :-)\n\nPełny/niepełny etat.\n\nZapraszamy na spotkanie, więcej informacji pod nr. tel. 53*****15 \n\nŁukasz",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kucharz zmianowy",
        "phone": "602637908",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Prosta produkcja cateringowa ( produkujemy 4 dania jednogarnkowe - codziennie inny smak ) w Konstancinie Jeziorna poszukuje osoby na stanowisko :\n\nKierownik produkcji/Kucharz zmianowy\n\nZakres obowiązków:\n\n-czynny udział w produkcji\n\n-nadzór nad pracownikami produkcji\n\n-prowadzenie stanów magazynowych\n\n-kontrola jakości zamówień\n\n-tworzenie raportów\n\n-prowadzenie dokumentacji Haccp\n\n-Inne ad hockowe zadania\n\nWymagania względem kandydata:\n\n- doświadczenie na podobnym stanowisku\n\n- dyspozycyjność\n\n- znajomość Excel’a\n\n- uczciwość, punktualność, odpowiedzialność\n\nOferujemy:\n\n- stabilne zatrudnienie – 220 – 240 godzin w miesiącu zaczynamy od umowy zlecenie i 25pln/h na rękę po okresie próbnym podwyżka oraz mowa o pracę lub B2B dla chcących zarabiać więcej \n\n- praca w dniach poniedziałek – piątek\n\n- praca w młodym zespole\n\n- fantastyczną atmosferę\n\nOsoby zainteresowane pracą prosimy o przesyłanie CV w wiadomości prywatnej",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Pracownik Burgerowni",
        "phone": "881209556",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Burgerownia na Bemowie poszukuje pracowników kuchni ! Jeśli lubisz miłą atmosferę to ta oferta jest właśnie dla Ciebie :)\n\nOferujemy:\n\n- zarobki netto od 2800 pln przy pełnym etacie\n\n- stabilne zatrudnienie\n\n-naukę od podstaw, nie musisz mieć wieloletniego doświadczenia - chęci i motywacja do pracy są kluczem\n\n-pensję wypłacaną na czas 10 każdego miesiąca\n\n-prace na pełen etat \n\n-przyjemną i rodzinną atmosferę - zgrany zespół to dla nas podstawa !\n\n-posiłki pracownicze - kto nie kocha burgerów ? :)\n\n-możliwość awansu i zdobywania coraz wyższych zarobków - rozwój to jest to na co stawiamy !\n\nWymagania:\n\n-książeczka sanepidowska ( lub chęć wyrobienia jej)\n\n-umiejętność pracy w zespole\n\n-pozytywne nastawienie\n\n-zaanagażowanie i chęci do pracy\n\nDołącz do naszej ekipy i rozwijaj się razem z nami !",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Cukiernia Sosenka",
        "phone": "227881210",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Cukiernia Sosenka w Otwocku poszukuje do pracy baristę/kelnera. \n\nZakres obowiązków: \n\nprzyjmowanie i wydawanie zamówień,\nobsługa kasy fiskalnej,\nobsługa ekspresu ciśnieniowego,\nprzygotowywanie pozycji z menu: deserów, soków itp.\ndbanie o czystość w cukierni.\n\nPoszukujemy osoby dyspozycyjnej na cały etat (pracujemy również w weekendy).\n\nPracujemy w godzinach 9.30-21.30. Mile widziane osoby z doświadczeniem w podobnej pracy oraz z prawem jazdy kategorii B. \n\nProsimy o składanie CV osobiście w cukierni lub poprzez OLX.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pomoc kuchenna - zmywak Pon-Pt",
        "phone": "501023984",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię Panią do pracy w kuchni polskiej. Praca polega na wydawaniu posiłków, zmywaniu, krojeniu, lepieniu pierogów etc.\n\nPraca od pon do pt\nWszystkie święta wolne.\n\nStawka 17 na rękę\nChęć stałego zatrudnienia - pierwsze 3 mieś zlecenie, później umowa o pracę.\n\nWięcej informacji pod numerem telefonu",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kierowca do Da Grasso Radzymin",
        "phone": "506903195",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię osoby na stanowisko kierowca/dostawca w pizzerii z własnym samochodem najlepiej w gazie. Również  możliwość pracy na samochodzie firmowym\n\nSzukamy osób z pełną dyspozycyjnością w tygodniu oraz weekendy lub na same weekendy (pt 17-23 sob 11-23 ndz 12-22) .",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "praca kelnerka kasjerka do bistro w centrum Warszawy",
        "phone": "570688866",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy kelnerkę/kasjerkę do niewielkiego nowego bistro w centrum Warszawy. Praca na zmiany 10-16 albo 16-21 i wolny co drugi weekend. Wymagana znajomość języka angielskiego. Stawka się będzie podwyższać wraz z rozwojem bistro.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Praca- Józefów (Michalin)",
        "phone": "506058220",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię osobę do pracy w sklepie piekarniczym (Józefów): \n\n1/2 etatu \n\n1/3 etatu\n\nOsoby zainteresowane proszę o kontakt pod nr 50*****20. ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Burito&Burger sprzedawca",
        "phone": "600040602",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Burrito-Burger\n\nPraca właśnie dla Ciebie. Nie musisz mieć doświadczenia!!!\n\nPoszukujemy młodych osób do pracy w lokalu gastronomicznym.\n\nMamy do zaoferowania pracę na dwóch różnych stanowiskach:\n\nKasa - sprzedaż przy kasie\nobsługa grilla - grillowanie składanie burgerów.\n\nPraca zmianowa. Elastyczny grafik. Domowa atmosfera\n\nNie musisz mieć doświadczenia, lecz chęci do pracy.\n\nZadzwoń już teraz nr 60*******02",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Pomoc kuchenna - Uśmiechnięta dziewczyna do pracy na kuchni",
        "phone": "662076764",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "JOHNY SZALONY Naleśnikarnia&Pizzeria - poszukuje obowiązkowej osoby do pracy w szalonej kuchni Johnego przy przygotowywaniu pizzy i naleśników, farszy, sosów itd.\n\nJeśli nie masz doświadczenia, nie martw się, wszystkiego Cię nauczymy.\n\nZADANIA: \n\nPrzygotowywania farszy, sosów zgodnie z recepturami \nKrojenie owoców i warzyw \nPrzygotowywania pizzy i mega naleśników\nDbanie o czystość stanowiska pracy \n\nWYMAGANIA: \n\nDyspozycyjność, (minimum 170 godzin w miesiącu)\nDyspozycyjność pracy również w weekendy \nKsiążeczka sanepidu \nPunktualność i odpowiedzialność\nPozytywne podejście do życia\n\n CO OFERUJEMY: \n\nUmowę o pracę po okresie próbnym. \n\nStawkę progresywną oraz zależną od posiadanych umiejętności \n\nSzkolenie wdrażające \n\nPracę w młodym, zaangażowanym zespole \n\nZniżki pracownicze \n\nJOHNY czeka na Ciebie! Prześlij CV na: piszdojohna(malpa)gmail.com lub zadzwoń i umów się na spotkanie:\n\nRestauracja Johny Szalony Grodzisk Mazowiecki",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Subway Podkowa Leśna - praca dla uczniów i studentów",
        "phone": "503031054",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Uczysz się lub studiujesz i poszukujesz możliwości stabilnego zatrudnienia w czasie wolnym od nauki?\n\nPrzyjdź do nas! Oferujemy Ci możliwość pracy w amerykańskiej sieci znanej na całym świecie ze swych wspaniałych sandwiczy i sałatek.\n\nNie masz doświadczenia? Nie szkodzi - wszystkiego, co potrzebne nauczymy Cię od podstaw. Nasz zespół składający się z młodych, pozytywnie usposobionych osób z niecierpliwością czeka na udzielenie Ci wszelkiego wsparcia.\n\nZapraszamy wszystkich chętnych o statusie ucznia lub studenta.\n\nDodatkowym atutem będzie dyspozycyjność w dni powszednie od godzin porannych do wczesnopopołudniowych.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Kucharka/Gosposia do pomocy w apartamencie",
        "phone": "604287825",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukuję kucharki/gosposi do pracy w apartamencie na Powiślu, preferowane zdrowe posiłki, kuchnia polska i śródziemnomorska.\n\nZakres obowiązków:\n\ngotowanie\nrobienie zakupów\nprzygotowywanie i podawanie posiłków\nsprzątanie i dbanie o porządek w kuchni i strefie dziennej.\n\nPreferowany wiek kandydatki: 40 - 50 lat.\n\nGodziny pracy: 8:00 - 16:00.\n\nNarodowość: Polska.\n\nO nas:\n\nJesteśmy rodzina 4-osobową (w tym 2 dzieci). Lubimy się zdrowo odżywiać, ale nie wymagamy gotowania na poziomie gwiazdek Michelin.\n\nSzukamy osoby zaradnej, która potrafi złożyć zamówienie w sklepie internetowym, wyszukać przepis w Internecie, kreatywnie wykorzystać produkty, którym kończy się data ważności, a co więcej obsługiwać takie sprzęty jak: Thermomix, blender, ekspres do kawy czy piekarnik z dotykowym ekranem.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Praca dla barmana w nowym klubie w Piasecznie",
        "phone": "789289519",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Do nowego klubu w Piasecznie - Clubu Planeta - poszukujemy osób na stanowisko BARMAN.\n\nWymagamy:\n\ndoświadczenia\nzaangażowania i chęci do pracy\nkomunikatywności\ngotowości do pracy wieczorami i w weekendy\nmile widziany język angielski\n\nOferujemy atrakcyjną stawkę godzinową oraz elastyczne warunki i godziny pracy.\n\nPraca w przyjemnej atmosferze w nowym klubie.\n\nProsimy o wysyłanie CV przez formularz kontaktowy lub na e-mail manager[at]clubplaneta.pl",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Zatrudnimy kelnerki weekendowe zarobki dzienne od 300 zł AKTUALNE!",
        "phone": "226927204",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy Dziewczyn/ Pań na stanowisko kelnerki na weekendy. Jeśli nie masz doświadczenia w tym zawodzie, nie ma problemu Wszystkiego nauczymy, przeszkolimy Wymagamy komunikatywnej znajomości języka polskiego. Od kandydatek oczekujemy: ·        Pozytywnego nastawienia ·        Uśmiechu na twarzy Oferujemy: ·        Pracę w stabilnej firmie ·        Możliwość pracy na cały etat lub tylko w weekendy – Ty wybierasz. ·        Szkolenia ·        Bardzo atrakcyjne wynagrodzenie ok 300 zł. dziennie Osoby zainteresowane prosimy o przesłanie CV lub zapraszamy na rozmowę codziennie od poniedziałku do piątku w godzinach 13-20 Restauracja Zapiecek ul. KRAKOWSKIE PRZEDMIEŚCIE 55 kontakt telefoniczny 226927204 Jeśli jesteś w okolicy zapraszamy na rozmowę nawet bez CV",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Uczniów / Studentów - mała gastronomia centrum",
        "phone": "508528588",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy energicznych pozytywnych ludzi do pracy w bistro.\n\nNie wymagamy doświadczenia, i chętnie uczymy tego co potrzeba.\n\nCharakter pracy:\n\n- przygotowywanie kanapek, składników, sałatek, napoi,\n\n- obsługa Klienta, kasy, terminala,\n\n- codzienne prace porządkowe związane z utrzymaniem lokalu,\n\n- pracujemy w systemie dwuzmianowym także w weekend,\n\nSzukamy osób:\n\n- posiadających badania sanitarno-epidemiologiczne,\n\n- komunikatywnych i uśmiechniętych,\n\n- uczciwych, sumiennych i samodzielnych,\n\n- studentów/uczniów dziennych, wieczorowych, zaocznych\n\nOferujemy:\n\n- elastyczny grafik pracy,\n\n- miła, kulturalna i swobodna atmosfera pracy,\n\n- długoterminowa współpraca,\n\n- możliwość zdobycia doświadczenia,\n\nProsimy przesyłać zgłoszenie zawierające:\n\nCV ze zdjęciem.\n\n﻿Oczekiwaną stawkę godzinową.\n\nW jakich dniach kandydat/ka/ jest dyspozycyjny/a/. \n\nZgłoszenia są przyjmowane tylko w formie elektronicznej.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Praca w kawiarni/catering dietetyczny",
        "phone": "793591367",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy osób do pracy w kawiarni oraz przygotowywaniu cateringu. Jeśli lubisz pić kawę i dobrze jeść to już połowa sukcesu :)\n\nLokalizacja: Warszawa Bielany ul. Klaudyny\n\nDoświadczenie mile widziane – ale nie jest to warunek\n\nObowiązki:\n\nobsługa ekspresu ciśnieniowego (kolbowego, zapewniamy szkolenie)\n\naktywna sprzedaż produktów\n\nprzygotowywanie prostych dań\n\nobsługa gości\n\ndbanie o porządek w lokalu oraz na barze i kuchni\n\nWymagamy:\n\naktualnej książeczki sanepid/zaświadczenie\n\nmile widziany status studenta/ucznia\n\nuczciwości\n\nenergii\n\nkomunikatywności\n\ndyspozycyjności co najmniej 4 dni w tygodniu \n\nPracujemy na dwie zmiany 7:30-14:40 oraz 14:30-19:00 od poniedziałku do piątku oraz w soboty 9:00-14:30 i niedziele 10:00-17:00\n\nOferujemy:\n\nmiłą atmosferę pracy\n\nelastyczny grafik\n\nszkolenia\n\nstawka na okres próbny 17 zł / h netto – ostateczna stawka zależna jest od doświadczenia, umiejętności, stosunku i chęci do pracy\n\nmożliwość rozwoju\n\nPraca od zaraz.  Poszukujemy osób, które szukają pracy na dłużej. Na rozmowy kwalifikacyjne zapraszamy wybrane osoby.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kucharz kuchni produkcyjnej",
        "phone": "881227106",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy osoby na stanowisko kucharz kuchni produkcyjnej. Praca w rozsądnych godzinach, bez zmian nocnych. Atrakcyjna marka, młody, aktywny zespół, stabilne warunki zatrudnienia.\n\nSkupiamy się na pracy zorganizowanej, w dużym porządku, z dbałością o najwyższe standardy higieniczne. Bez nadmiernej presji i stresuj.\n\nPoszukujemy osoby pozytywnie nastawionej do pracy, odpowiedzialnej, zdolnej w przyszłości objąć stanowisko kierownicze.\n\nAtrakcyjne warunki.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Sushi Master/Майстер суші",
        "phone": "509080016",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam restauracja Wabi Sabi, poszukuje sushi mastera z doświadczeniem, nasz zespół liczy 5 osób potrzebujemy osoby punktualnej, chętnej do pracy w młodym zespole . Praca od godz .11.00 do 21.00 . Prowadzimy kuchnie sushi i kuchnie tajską , system pracy 2 na 2, ale bez problemu jezeli ktos jest chętny do pracy moze miec wiecej zmian. W miesiącu mozna zarobic od 3500 zl do 5500 zl netto czyli na rękę , zapraszam do składania ofert pracy i do zobaczenia \n\nПривіт, ресторан Wabi Sabi, шукаємо майстра суші з досвідом, наша команда складається з 5 чоловік, нам потрібна пунктуальна людина, бажаюча працювати в молодому колективі. Робота з 11.00 до 21.00. У нас працює суші та тайська кухня, система роботи 2 на 2, але якщо хтось бажає працювати, у нього може бути більше змін. За місяць ви можете заробити від 3500 злотих до 5500 злотих нетто, тобто на руку, я запрошую вас подати пропозиції про роботу і побачимось",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Zatrudnię osobę do pracy w kuchni przemysłowej.",
        "phone": "603686561",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Kuchnia zamknięta w Mysiadle. Gotujemy z dbałością o szczegóły. Poszukuję osoby do pomocy, umiejętność przygotowywania prostych dań mile widziana.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pracownik Berlin Doner Kebap - CH Zlote Tarasy",
        "phone": "692792988",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Szukasz pracy?\n\nZapraszamy do Berlin Doner Kebap - najprężniej rozwijającej się sieci Kebabów w Polsce.\n\nPoszukujemy osób na stanowisko pracownika do naszej restauracji w CH Złote Tarasy.\n\nZapewniamy:\n\nStawkę minimum 22,00 zł brutto na godzinę plus atrakcyjny system premiowy\n\nPrzyjazną atmosferę pracy\n\nUmowę zlecenie lub o pracę\n\nPosiłek pracowniczy za 2 zł\n\nGrafik dostosowany do Twoich potrzeb\n\nPomoc w załatwieniu dokumentów osobom z zagranicy\n\nUbezpieczenie zdrowotne\n\nSzkolenia stanowiskowe\n\nUbiór pracowniczy\n\nWymagamy:\n\nAktualnej książeczki sanitarno-epidemiologicznej\n\nUkończonego 18-ego roku życia\n\nSumienności, punktualności i chęci do pracy\n\nUmiejętności pracy w zespole\n\nPozytywnej energii i uśmiechu\n\nMile widziane doświadczenie w gastronomii\n\nCV ze zdjęciem oraz dopiskiem \"Zlote Tarasy\" wyślij na adres podany poniżej: vasyl.kudelko”małpa”berlindonerkebap.pl Nie zwlekaj, dołącz do naszego zespołu! Do zobaczenia! Prosimy o zamieszczenie w swojej aplikacji klauzuli o ochronie danych osobowych: \"Wyrażam zgodę na przetwarzanie moich danych osobowych w celu rekrutacji zgodnie z art. 6 ust. 1 lit. a Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (ogólne rozporządzenie o ochronie danych)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Zatrudnię pizzera",
        "phone": "663889927",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy pizzera do PIZZA WORKSHOP na Mokotowie Dolnym.\nGodz pracy od 11 do 22\npełen etat\nStawka zależna od umiejętniści, od 22 zł na godz do ręki.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Barman do restauracji muzycznej mokotów",
        "phone": "503418883",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Hej, do naszej ekipy pilnie potrzebujemy pracownika! Rodzinna knajpa na mokotowie powiększa załogę, w związku z tym poszukujemy pozytywnej osoby na stanowisko barmana\\ki. Mieścimy się przy ulicy cieszyńskiej 6, jesteśmy lokalem z super przyjazną i domową atmosferą. Zależy nam, aby osoba była dostępna w weekendy (jeden w miesiącu wolny) oraz dwa dni w tygodniu, lecz oczywiście jesteśmy otwarci i można się z nami dogadać :) Pracujemy w weekendy do 3. Oferujemy stawkę godzinową 20/h netto (plus serwisy i tipy) z możliwością awansu w zależności od zaangażowania. Ze swojej strony zapewniamy super klimat oraz darmowy posiłek i napoje w trakcie pracy. Wszystkich chętnych prosimy o kontakt telefoniczny! Do wszystkich oddzwonimy :) Zapraszamy do współpracy!\n\n ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kucharz / Kucharka w Whiskey in the Jar Warszawa",
        "phone": "798805618",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Whiskey in the Jar – WARSZAWA\t\n\nMięcho musisz kochać i rozumieć. Każdy stek ma być petardą smaku. Ostra jazda na kuchni przy grillu, w pocie i ogniu to Twoja codzienność, a stres i presja czasu – najlepsi kumple. Skład receptur będziesz śnił po nocach, a jakość potraw i rockowy design podania staną się bogiem.\n\nDołącz do zgranego zespołu na stanowisko:\n\nMŁODSZY KUCHARZ/ KUCHARKA\n\nMiejsce pracy:\n\nWARSZAWA, ŚRÓDMIEŚCIE\n\nPOSZUKUJEMY OSÓB:\n\n• gotowych do doskonalenia swoich umiejętności poruszania się w kuchni amerykańskiej i w pracy z grillem lawowym,\n\n• z doświadczeniem na stanowisku młodszego kucharza minimum 1 rok,\n\n• chcących dobrze zarobić i uczyć się od najlepszych,\n\n• chcących poznać zagadnienia związane z kontrolą kosztów.\n\nPRACUJĄC W WHISKEY IN THE JAR ZYSKUJESZ:\n\n• stabilizację - praca w oparciu o stałą umowę - połączoną z możliwością elastycznego układania grafiku - jeśli nadal się uczysz / studiujesz lub zwyczajnie chcesz mieć wpływ na swoje godziny pracy,\n\n• atrakcyjne wynagrodzenie,\n\n• pracę z najlepszymi produktami na rynku,\n\n• perspektywę rozwoju - możliwość uczenia się od najlepszych, ale także dzielenia się swoją wiedzą i awansowania,\n\n• pracę w świetnej lokalizacji.\n\nO NAS:\n\nWhiskey In The Jar to lokal utrzymany w rockowo-motocyklowo klimacie, przyciąga jednak nie tylko miłośników dobrej muzyki i Harleya Davidsona – można w nim spotkać wszystkich, których łączy miłość do amerykańskiej kuchni, dobrej zabawy i rock'n'rolla!\n\nWhiskey In The Jar to wyjątkowe miejsce, za dnia funkcjonuje jako restauracja, steakhouse z najwyższej półki, oferujący Gościom steki z najlepszej wołowiny. W nocy lokal wypełnia się dźwiękami muzyki na żywo, a jego niesamowity klimat przyciąga fanów rock'n'rolla spragnionych wrażeń, dobrego jedzenia i wyjątkowych trunków.\n\nZobacz na WhiskeyInTheJar.pl i naszym profilu na FB, jak pracujemy i ... bawimy się wraz z naszymi Gośćmi w naszych restauracjach w Warszawie, Wrocławiu, Gdańsku, Łodzi i Poznaniu.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Praca d Barmana/Barmanki/Porządkowy sali: 20 zł/h do ręki.Wysokie Tipy",
        "phone": "48790871914",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Praca szuka człowieka - dołącz do ekipy Beauty Bistro & Club, wyjątkowego miejsca na imprezowej mapie Warszawy. Szukamy osoby na stanowisko barmana/barmanki/Porządkowy sali. Wszystkie osoby zainteresowane prosimy o kontakt pod numerem 79*****14",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Pizzaiolo/Pizzer poszukiwany do Pizzerii Nonna",
        "phone": "796888586",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Nonna pizzeria przy ul.Oboźnej 11 zatrudni pizzaiolo z doświadczeniem w pracy przy pizzy neapolitańskiej, wypiekanej w piecu elektrycznym lub do przyuczenia.\n\nOferujemy pracę 4-5 dni w tygodniu,\n\nStałe wynagrodzenia od 22 zł /h płatne cotygodniowo, umowę.\n\nOczekujemy doświadczenia, punktualności i czystości w miejscu pracy.\n\nOsoby zainteresowane prosimy o przesłanie krótkiej informacji o sobie i poprzednich miejscach pracy na adres e-mail lub w wiadomości.\n\nDziękujemy i do zobaczenia.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kucharz do restauracji na warszawskim Ursynowie",
        "phone": "508163422",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy samodzielnego i ogarniętego kucharza\n\nKonieczne: pasja do gotowania, chęci do pracy, pozytywna energia, dyspozycyjność.\n\nElastyczne godziny pracy w zgranym zespole w bardzo dobrej restauracji w Warszawie.\n\numowa o pracę.\n\nWięcej informacji pod nrem telefonu 50*******22",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Praca w charakterze cukiernika /Piaseczno",
        "phone": "508100740",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy cukiernika do pracy w Pączkarni/ Piaseczno\n\nPoszukujemy osoby:\n- z  doświadczeniem na stanowisku -cukiernik.\n- zaangażowanej, pracowitej, odpowiedzialnej,\n- z dobrą organizacją pracy, dbającym o czystość i estetyczne wykonanie produktów\n- lubiącej kontakt z ludźmi \n\nOferujemy: \n- umowę o pracę\n- praca w godzinach 5.00-13.00\n- zwrot kosztów dojazdu.\n- praca w miłym zespole\nCV wraz ze zdjęciem prosimy przesyłać na adres e-mail.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Kelnerka/Pomoc Kuchenna w CUDO na Powiślu",
        "phone": "796149068",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy osoby na stanowisko:\n\nKelnerka, \nPomoc kuchenna\nPomocnik Kucharza \n\ndo WEGAŃSKIEGO SUSHI BARU CUDO na Warszawskim Powiślu. \n\nStawka na start to 18-21 pln na rękę (zależnie od posiadanego doświadczenia)\n\nOFERUJEMY:\n\n-Możliwość rozwoju w kierunku stanowiska SUSHIMASTER, a co za tym idzie, szybką drogę do awansu i zarobków na poziomie 25/30 PLN na rękę. Wystarczy, tylko chęć nauki i zaangażowanie\n\n-Pracę w stabilnej firmie\n\n-Dobrą stawkę godzinową od 1 dnia pracy\n\n-Elastyczny grafik\n\n-Pracę w fajnym, popularnym miejscu z ludźmi, którzy są pasjonatami w swoim zawodzie\n\nOd kandydatów oczekujemy:\n\n-Minimalnego doświadczenia w pracy na kuchni\n\n-Zaangażowania\n\n-Chęci rozwoju\n\n-Gotowości do pracy.\n\n-Dyspozycyjności\n\n-Punktualności\n\nProsimy o przesyłanie CV przez portal olx",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "KELNER do restauracji na Krakowskim Przedmieściu",
        "phone": "505922817",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy kelnera/ kelnerkę do restauracji Cinema Paradiso na Krakowskim Przedmieściu. \n\nSzukamy osoby dyspozycyjnej, min. 10 dni w miesiącu. Mile widziane doświadczenie ale również zapraszamy bez, wszystkiego cię nauczymy. Liczy się zaangażowanie i chęć do nauki. \n\nStawka 17 zł/h netto + napiwki indywidualne, dla studentów 19,70 netto/ umowa zlecenia . \n\nOferujemy posiłki pracownicze oraz rabaty na dania z karty dla naszych pracowników. Praca od zaraz :)\n\nWymagane badania do celów sanitarno-epidemiologicznych.\n\nCV proszę przesyłać na maila a.krasowski(małpa)sfp.org.pl\n\nWięcej informacji pod tel. 50*******17",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Praca Sushi Master",
        "phone": "530634094",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja Sushi poszukuje sushi mastera!!!\nWymagamy co najmniej roczne doświadczenie na danym stanowisku, książeczki sanepidowskiej, skrupulatności oraz umiejętności pracy w zespole.\nW zamian oferujemy 21-27 NETTO na godzinę w zależności od umiejętności, pracę w pełnym wymiarze godzin, a nawet umowę o pracę. \nOsoby zainteresowane prosimy o kontakt telefoniczny pod numer 53*******94.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Praca dla pizzera",
        "phone": "6013821762",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy pizzera do lokalnej pizzerii w Sulejówku.  \nWymagania: brak nałogów, punktualność, odpowiedzialność. \nPraca w pełnym wymiarze czasu.\nZapewniamy dobre warunki i dobre towarzystwo.\nZgłoszenia prosimy składać telefonicznie lub mailowo.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Praca dla kelnerek/barmanek czeka w klubie bilardowym",
        "phone": "601811233",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy DZIEWCZYN kelnerek/ barmanek do pracy w klubie bilardowym.\nProponujemy umowę o prace lub zlecenie. \nU nas pracuje się 10-12 dni w miesiącu. \nGrafik pracy jest elastyczny.\nWięcej informacji podamy telefonicznie. \nIzabela 60*****33\nZapraszam do kontaktu",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kelner/kelnerka Restauracja Stare Babice",
        "phone": "792411794",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Szukamy kelnera/kelnerki do restauracji w Starych Babicach. Stawka od 17 zl netto za godzinę . \n\nPraca 8 max10 godz dziennie..\n\nRuchomy grafik.. Zgrany i młody zespół :)\n\nZainteresowane osoby zapraszamy do kontaktu pod numerem telefonu 79*******94. ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Pomoc Cukiernika",
        "phone": "500079220",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Cukiernia Cieślikowski \n\n \n\nposzukuje pracownika na stanowisko:\n\nPomocy cukiernika.\n\nMiejsce pracy: Warszawa Ursynów , ul. Gajdy 30D.\n\n \n\n Zakres stanowiska:\n\n    •    Robienie ciast ciastek.\n\n    •    Dbałość o towaru.\n\n    •    Wykonywanie zadań związanych z produkcją ciast.\n\n    •    Przestrzeganie obowiązujących zasad, norm i wewnętrznych standardów.\n\n    •    dbałość o miejsce pracy. \n\n \n\nNasze oczekiwania:\n\n    •    Pozytywna energia, otwartość i komunikatywność.\n\n    •    Sumienność i rzetelne wykonywanie powierzonych zadań.\n\n    •    Dbanie o porządek na stanowisku pracy.\n\n    •    Umiejętność pracy w zespole i gotowość do pracy w systemie zmianowym, w tygodniu i weekendy.\n\n  \n\nProszę o kontakt wyłącznie telefoniczny pod numer 88*****51",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Dekorator tortów",
        "phone": "885051051",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Cukiernia Cieslikowski\n\n \n\nposzukuje pracownika na stanowisko:\n\nDekorator Tortów. Artysta. (Figurki z marcepanu)\n\nMiejsce pracy: Warszawa Ursynów,ul. Gajdy 30D.\n\n \n\n Zakres stanowiska:\n\n    •    Robienie figurek na torty.\n\n    •    Dekorowanie tortów.\n\n    •    Dbałość o towar .\n\n    •    Wykonywanie zadań związanych z produkcją ciast.\n\n    •    Przestrzeganie obowiązujących zasad, norm i wewnętrznych standardów.\n\n    •    dbałość o miejsce pracy.\n\n    •    Robienie innych zadań związanych z produkcja ciast.\n\n \n\nNasze oczekiwania:\n\n    •    Pozytywna energia, otwartość i komunikatywność.\n\n    •    Sumienność i rzetelne wykonywanie powierzonych zadań.\n\n    •    Dbanie o porządek na stanowisku pracy.\n\n    •    Umiejętność pracy w zespole i gotowość do pracy w systemie zmianowym, w tygodniu i weekendy.\n\n \n\nProszę o kontakt wyłącznie telefoniczny pod numer 88*****51",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Kucharz / Pomoc kuchni Restauracja wege Ursynów przy metrze. 20-24zł/h",
        "phone": "48795752347",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy kucharza / pomoc kuchni do restauracji wegańskiej VegeLove znajdującej się na Ursynowie.\n\nWymagania:\n\n• dyspozycyjność \n• chęć rozwoju \n• POZYTYWNA energia\n\nSZUKAMY fajnych ludzi do STAŁEJ współpracy w fajnej atmosferze, jeśli kuchnia wegańska nie jest Ci obca, to czekamy właśnie na Ciebie!\nZnajomość kuchni wegańskiej jest bardzo ważnym atutem.\n\nPraca w systemie 2/2 nie ma problemu ustalenia wspólnie innego grafiku.\n\nWynagrodzenie:\nKucharz/Kucharka 22 - 24zł/h\nWynagrodzenie pomoc kuchni 20zł/h na rękę\n(Wynagrodzenie płatne co tydzień)\n\nJeśli szukasz pracy w fajnej atmosferze z możliwością rozwoju, Zapraszamy do kontaktu. Więcej informacji +48*******47\n\nPodczas lockodownu nie zamykaliśmy lokalu.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Робота для сімейної пари",
        "phone": "724047450",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Готельний комплекс у Блоні, 39 км від центру Варшави в пошуках людей для роботи консерватором та допомоги з прибиранням та роботою на кухні. \n\nДопомога на кухні Обов'язки: - допомога на кухні, в прибиранні кімнат та місць загального користування. - утримання робочого місця в чистоті - дотримання HACCP та правил охорони праці Вимоги: - не вимагаємо досвід, головне бажання працювати - дотримання правил гігієни та хороший контакт з іншими працівниками.\n\nКонсерватор Обов'язки: - проведення дрібних ремонтних робіт - догляд за територією комплексу - дбання про технічний стан обладнання, що знаходиться на території приміщення Вимоги: - знання основних технік фарбування, штукатурення, заміна замків та дрібний ремонт столярних виробів. \n\nМожливість проживання на місці. Можливість працевлаштування подружньої пари або людей, яким підходить посада. Форми найму - umowa o pracę або zlecenie, залежно від індивідуальних потреб та уподобань кандидата. Додаткову інформацію надамо під час співбесіди. Будь ласка, надсилайте своє резюме на адресу електронної пошти zajazdjankaz a gmail.com або телефонуйте за номером +48**********42",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Zatrudnimy: Kucharz/Pizzer",
        "phone": "884754444",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Włoska restauracja \"Palermo\" w Piastowie poszukuje kucharza/pizzera do pracy na stałe.\n\nPoszukujemy osoby doświadczonej.\n\nOferujemy:\n\n-Dobra stawkę godzinową\n\n-Posiłek pracowniczy\n\n-Umowę o pracę(po okresie próbnym)\n\n-Elastyczny grafik\n\n-Pracę \"od zaraz\"\n\nWiecej informacji udzielę telefonicznie, 88*******44",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Pomoc kuchenna w cateringu Bielany",
        "phone": "601953963",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Praca w godzinach 5-13 od pon do piątku. Catering dla szkół i przedszkoli, kuchnia Polska. Poszukujemy kobiety.\nWynagrodzenie w formie tygodniówek \nPraca na Bielanach w Warszawie \nKontakt pod nr tel 60*******63\nOd zaraz",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Pizzerman / Kucharz kuchnia amerykańska",
        "phone": "791741966",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Do lokalu gastronomicznego na Woli poszukujemy pizzermana lub kucharza kuchchni amerykanskiej! \n\nStawki:\n\n18:00-1:00 stawka 180 PLN netto/dzień \n14:00-1:00 stawka 260 netto/ dzień \n(stawki na początek zależne od umiejętnosci) \n\nWszystkie stawki negocjowalne po sprawdzeniu pracownika. \n\nJeśli jesteś ogarniety/ogarnięta, ale stawka nie jest satysfakcjonująca, zadzwoń, pozwól się sprawdzić i wtedy możemy rozmawiać. \n\nElastyczny grafik, ustalany 2 razy w miesiącu, możliwość pracy w grafiku 2 na 2. \n\nOsoby koniecznie dyspozycyjne z odpowiedzialnym podejściem do pracy.\n\nZachęcam do kontaktu telefonicznego, bądź przez OLX",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Pracownik Restauracji Wymysłów",
        "phone": "787093119",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Dołącz do Naszego zespołu!\nTo miejsce pracy czeka właśnie na Ciebie! - bez względu na to czy szukasz pracy stałej czy dorywczej.\nRozwijaj się razem z Nami.\nPoszukujemy na stanowisko:\n \n\nPracownik Restauracji Wymysłów\n\n( możliwość pracy w pełnym lub niepełnym wymiarze godzin)\n\nCzego oczekujemy?:\n-Otwartości na potrzeby Naszych Gości,\n-Zaangażowania,\n-Chęci do szkolenia i rozwoju zawodowego\n\nCo oferujemy?:\n-Możliwość rozwoju kompetencji i szybki awans,\n-Uczciwe warunki zatrudnienia w oparciu o umowę o pracę,\n-Konkursy motywacyjne dla załogi jako możliwość dodatkowej gratyfikacji pieniężnej,\n-Szkolenie i pracę w zespole w którym ceni się atmosferę i wzajemne relacje,\n-Zniżki na posiłki pracownicze\n \nChcesz uzyskać więcej informacji? Zadzwoń: 78*******19 lub napisz: mavam5mcd(małpa)gmail.com",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pracownik Restauracji MOP Grójec Worów",
        "phone": "668895230",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Dołącz do Naszego zespołu!\nTo miejsce pracy czeka właśnie na Ciebie! - bez względu na to czy szukasz pracy stałej czy dorywczej.\nRozwijaj się razem z Nami.\nPoszukujemy na stanowisko:\n \n\nPracownik Restauracji MOP Grójec Worów\n\n( możliwość pracy w pełnym lub niepełnym wymiarze godzin)\n\nCzego oczekujemy?:\n-Otwartości na potrzeby Naszych Gości,\n-Zaangażowania,\n-Chęci do szkolenia i rozwoju zawodowego\n\nCo oferujemy?:\n-Możliwość rozwoju kompetencji i szybki awans,\n-Uczciwe warunki zatrudnienia w oparciu o umowę o pracę,\n-Konkursy motywacyjne dla załogi jako możliwość dodatkowej gratyfikacji pieniężnej,\n-Szkolenie i pracę w zespole w którym ceni się atmosferę i wzajemne relacje,\n-Zniżki na posiłki pracownicze\n \nChcesz uzyskać więcej informacji? Zadzwoń: 66*******30 lub napisz: mavam5mcd(małpa)gmail.com",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Szef Kuchni poszukiwany",
        "phone": "797956451",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy: Szefa Kuchni Włoskiej\n\n.\n\nRodzaj kontraktu: B2B\n\nBudżet wynagrodzenia miesięcznego Netto: 8-10.000 zł\n\nRestauracja: śródziemnomorska/włoska\n\nLokalizacja: Warszawa Centrum\n\n.\n\nOczekiwania:\n\nPoszukujemy doświadczonego Szefa - specjalisty od kuchni włoskiej do nowego projektu restauracyjnego w Śródmieściu Warszawy. Planowane otwarcie lokalu - II połowa lutego 2022. \n\nNowoczesny obiekt w dużym centrum restauracyjnym. Operatorem obiektu jest znana warszawska marka restauracyjna - stabilny pracodawca. Rozpoczęcie współpracy od 01.02.22\n\n.\n\nRekrutacje przeprowadza: Gastrorekruter Polska licencja Agencji Zatrudnienia Nr: 24288\n\n.\n\nKandydaci nie ponoszą żadnych kosztów związanych z rekrutacją.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kelner, Dominium by Domino's, Grójecka 120, Ochota",
        "phone": "664023266",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Adres: ul. Grójecka 120\n\nŻeby sprostać wyzwaniom musisz:\n\n- Mieć ukończone 18 lat\n\n- Posiadać aktualną książeczkę Sanepidowską (książeczka do celów sanepidarno-epidemiologicznych) lub chęć jej wyrobienia\n\n- Być osobą dyspozycyjną, zaangażowaną, mającą chęć do nauki (nie potrzebujesz doświadczenia - my nauczymy Cię wszystkiego)\n\n- Być gotowym do bycia członkiem jednego z najlepszych zespołów w branży gastronomicznej!\n\nCzego możesz oczekiwać od nas?\n\n- Stawki: od 19,70 zł brutto/h (studenci 19,70zł/h netto) + niedzielone napiwki \n\n- Elastyczny grafik \n\n- Udziału w rozwoju w jednej z najbardziej rozpoznawalnych marek na rynku w branży gastronomicznej\n\n- Stałej współpracy z doświadczonym zespołem, na którym można polegać\n\n- Stałego wsparcia w trakcie okresu wdrożeniowego oraz udziału w wewnętrznych szkoleniach i dostępu do wewnętrznej cyfrowej platformy szkoleniowej\n\n- Możliwości skorzystania z prywatnej opieki zdrowotnej oraz ubezpieczenia NNW od pierwszego dnia pracy\n\n- Posiłku pracowniczego za 5zł\n\n- Zniżki 50% na produkty z naszej karty\n\n- Możliwość awansu na jedno ze stanowisk: Kierownik Zmiany, Kierownik Lokalu\n\nProsimy o dodanie w CV następującej klauzuli:\n\n\"Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu tej oraz przyszłych rekrutacji (zgodnie z ustawą z dnia 10 maja 2018 roku o ochronie danych osobowych (Dz. Ustaw z 2018, poz. 1000) oraz zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO)).\"\n\nInformujemy, że Administratorem danych jest Dominium S.A. z siedzibą w Warszawie przy ul. Dąbrowieckiej 30. Dane zbierane są dla potrzeb rekrutacji. Ma Pani/Pan prawo dostępu do treści swoich danych oraz ich poprawiania. Podanie danych w zakresie określonym przepisami ustawy z dnia 26 czerwca 1974 r. Kodeks pracy oraz aktów wykonawczych jest obowiązkowe. Podanie dodatkowych danych osobowych jest dobrowolne. W każdym czasie możesz cofnąć swoją zgodę, kontaktując się z Pracodawcą/Administratorem Danych.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kelnerka/Barmanka Grodzisk Mazowiecki Pub UFO",
        "phone": "601303836",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Opis\n\nKim jesteśmy?\n\nJesteśmy znanym miejscem z tradycją w Grodzisku Mazowieckim, do którego Goście przychodzą nie tylko na wieczorny odpoczynek, drinki i  jedzenie, ale i po to, aby spędzić miłe chwile w wyjątkowej atmosferze. Organizujemy także przyjęcia rodzinne, okolicznościowe.\n\nJesteśmy najstarszym Pubem w Grodzisku Mazowieckim, działamy od 1991 roku.\n\nKogo szukamy?\n\nKELNERKI / KELNERA / BARMANKI lubiących kontakt z Gośćmi i obsługę Ich zamówień\n\nJak będzie wyglądała Twoja praca?\n\n·      podstawą będzie dbałość o komfort naszych Gości - obsługa  tj. przyjmowanie zamówień, realizacja zamówień oraz dbałość o czystość miejsca pracy.\n\nCo oferujemy?\n\n·       stabilną pracę w super miejscu w Grodzisku Mazowieckim\n\n·       rodzinną atmosferę, dzięki której tworzymy zgrany Zespół\n\n·       elastyczny grafik, który staramy się dostosować do całego Zespołu\n\n·       umowę o pracę\n\nCzego oczekujemy?\n\n·       przede wszystkim pasji do tej roli w pubie, a także chęci  do pracy z ludźmi i dla ludzi\n\n·       umiejętności i doświadczenia na stanowisku kelnera/barmana (chociaż dopuszczamy możliwość przyuczenia)\n\n·       entuzjazmu w codziennej pracy, zaangażowania i pozytywnej energii\n\n·       gotowości do pracy zmianowej (również w niedziele i święta)\n\n·       aktualnych badań, a jeśli ich nie posiadasz, oczywiście pomożemy je wyrobić.\n\nNa więcej pytań odpowiemy telefonicznie!\n\nCzekamy na Twoje CV, bardzo miło będzie nam też przeczytać kilka dodatkowych słów o motywacji do pracy na stanowisku KELNERKI/KENERA (wystarczy w treści wiadomości). Poprosimy o zaznaczanie w dokumencie zgody RODO",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Catering dietetyczny: Sprzątanie/Zmywanie naczyń",
        "phone": "508973476",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma Goodie Foodie zajmująca się cateringiem dietetycznym poszukuje pracownika na Stanowisko: Sprzątanie/Zmywanie naczyń\n\nWarunki:\n\nUmowa zlecenie\nPraca poniedziałek-piątek od godz. 6:00/7:00 lub II zmiana 9:00/10:00 – ok 7 godzin\nMiejsce pracy: Piaseczno\nWynagrodzenie: 18 zł/h netto\nOferujemy wyżywienie w godzinach pracy\n\nObowiązki:\n\nZmywanie naczyń\nSprzątanie\nBieżące utrzymywanie w czystości i porządku pomieszczeń kuchennych\n\nWymagania:\n\nkomunikatywny język polski,\nenergiczna osobowość,\nbardzo dobra organizacja pracy,\nwysokie poczucie estetyki i wysoka kultura osobista,\naktualne badania sanitarno-epidemiologiczne,\nmiejsce zamieszkania w Piasecznie lub okolicach.\n\nOsoby zainteresowane prosimy o przesłanie CV ze zdjęciem.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Pracownik Restauracji CH Janki",
        "phone": "668403994",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Dołącz do Naszego zespołu!\nTo miejsce pracy czeka właśnie na Ciebie! - bez względu na to czy szukasz pracy stałej czy dorywczej.\nRozwijaj się razem z Nami.\nPoszukujemy na stanowisko:\n \n\nPracownik Restauracji CH Janki\n\n( możliwość pracy w pełnym lub niepełnym wymiarze godzin)\n\nCzego oczekujemy?:\n-Otwartości na potrzeby Naszych Gości,\n-Zaangażowania,\n-Chęci do szkolenia i rozwoju zawodowego\n\nCo oferujemy?:\n-Możliwość rozwoju kompetencji i szybki awans,\n-Uczciwe warunki zatrudnienia w oparciu o umowę o pracę,\n-Konkursy motywacyjne dla załogi jako możliwość dodatkowej gratyfikacji pieniężnej,\n-Szkolenie i pracę w zespole w którym ceni się atmosferę i wzajemne relacje,\n-Zniżki na posiłki pracownicze\n \nChcesz uzyskać więcej informacji? Zadzwoń: 66*******94 lub napisz: mavam5mcd(małpa)gmail.com",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Szef Kuchni - Szef Produkcji w cateringu dietetycznym",
        "phone": "223001310",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Kuroniowie Diety firma gastronomiczna z ponad 20 letnim doświadczeniem, zajmująca się produkcją cateringu dietetycznego - diety pudełkowej poszukuje Szefa Kuchni - Szefa Produkcji do swojej działalności zlokalizowanej w Józefosławiu koło Piaseczna.\n\nOczekiwania od kandydata:\n\nUmiejętność bardzo smacznego, nowoczesnego gotowania na kuchni zimnej i ciepłej,\nDoświadczenie minimum 2 letnie na stanowisku szefa kuchni lub szefa zmiany\nZnajomość trendów kulinarnych i nowoczesnej kuchni\nZnajomość kuchni dietetycznej - w tym przygotowywanie diety pudełkowej\nUmiejętność zarządzania zasobami ludzkimi i wysoka kultura osobista\nUmiejętność kontroli kosztów i ich rozliczanie\nUmiejętność tworzenia i gotowania ściśle według receptur\nUmiejętność pracy pod presją czasu\n\nWybranemu kandydatowi oferujemy:\n\nPracę w dynamicznie rozwijającej się i wiarygodnej firmie\nMożliwość realizacji ambitnych projektów gastronomicznych\nAtrakcyjne wynagrodzenie\n\nMiejsce pracy\n\nJózefosław koło Warszawy (Piaseczna)\n\nOsoby zainteresowane prosimy o przesłanie CV i ewentualnych pytań na adres poczty elektronicznej.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Praca dla każdego Кондитерська фабрика роботу для кожного/ŁOMIANKI",
        "phone": "604186918",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Opis\n\nZakład produkcji cukierniczej w Łomiankach zatrudni pracowników do produkcji.\n\nPraca w systemie 2 zmianowym (6-14, 14-22)\n\nOd kandydatów oczekujemy chęci do pracy, przyuczymy do wykonywanych zadań/czynności.\n\nW celu umówienia rozmowy kwalifikacyjnej zapraszamy do kontaktu:\n\nКондитерська фабрика надає роботу для кожного\n\nРобота в двозмінній системі (6-14 , 14-22)\n\nМи очікуємо, що кандидати будуть готові навчатися та працювати із задоволенням\n\nЄ можливість домовитися про житло\n\nЩоб домовитися про співбесіду, зв'яжіться з нами:\n\n60*******54\n60*******18",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pizzer na pełen etat, \"Dominium by Domino's\" Reymonta",
        "phone": "664023240",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Adres: Pizza Dominium by Domino's Reymonta 12\n\nOd nas dostaniesz m.in.:\n\nStawka do 28 zł brutto/godz. (w zależności od doświadczenia).\nPosiłek pracowniczy za 5zł.\n50% zniżki na produkty Pizza Dominium po godzinach pracy.\nNNW od pierwszego dnia pracy.\nMożliwość awansu na jedno ze stanowisk: Kierownik Zmiany, Kierownik Lokalu.\n\nNie czekaj - wyślij swoje dane kontaktowe poprzez OLX!\n\nProsimy o dodanie w CV następującej klauzuli:\n\n\"Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu tej oraz przyszłych rekrutacji (zgodnie z ustawą z dnia 10 maja 2018 roku o ochronie danych osobowych (Dz. Ustaw z 2018, poz. 1000) oraz zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO)).\"\n\nInformujemy, że Administratorem danych jest Dominium S.A. z siedzibą w Warszawie przy ul. Dąbrowieckiej 30. Dane zbierane są dla potrzeb rekrutacji. Ma Pani/Pan prawo dostępu do treści swoich danych oraz ich poprawiania. Podanie danych w zakresie określonym przepisami ustawy z dnia 26 czerwca 1974 r. Kodeks pracy oraz aktów wykonawczych jest obowiązkowe. Podanie dodatkowych danych osobowych jest dobrowolne. W każdym czasie możesz cofnąć swoją zgodę, kontaktując się z Pracodawcą/Administratorem Danych.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kelner, \"Pizza Dominium by Domino's\" Legionowo",
        "phone": "664023374",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Co kryje się za sukcesem jednej z najlepszych na świecie marek restauracyjnych? To ludzie, którzy chcą, aby każdy dzień był lepszy od poprzedniego. Dołącz do \"Pizza Dominium by Domino's\", jako Kelner/ka - to dzięki Tobie nasi Goście będą mogli zawsze liczyć na profesjonalne wsparcie w zakresie obsługi oraz doboru dań!\n\nAdres: aleja 3 Maja 22a, Legionowo\n\nŻeby sprostać wyzwaniom musisz:\n\n- Mieć ukończone 18 lat\n\n- Odznaczać się wysoką kulturą osobistą oraz umiejętnościami interpersonalnymi\n\n- Posiadać aktualną książeczkę Sanepidowską (książeczka do celów sanepidarno-epidemiologicznych) lub chęć jej wyrobienia\n\n- Być uśmiechniętą, energiczną oraz lubiącą pracować z ludźmi osobą\n\n- Być osobą dyspozycyjną, zaangażowaną, mającą chęć do nauki (nie potrzebujesz doświadczenia - my nauczymy Cię wszystkiego)\n\n- Być gotowym do bycia członkiem jednego z najlepszych zespołów w branży gastronomicznej!\n\nCzego możesz oczekiwać od nas?\n\n- Stawki: od 19,70 zł brutto/h (studenci 19,70zł/h netto) + niedzielone napiwki \n\n- Elastyczny grafik \n\n- Udziału w rozwoju w jednej z najbardziej rozpoznawalnych marek na rynku w branży gastronomicznej\n\n- Stałej współpracy z doświadczonym zespołem, na którym można polegać\n\n- Stałego wsparcia w trakcie okresu wdrożeniowego oraz udziału w wewnętrznych szkoleniach i dostępu do wewnętrznej cyfrowej platformy szkoleniowej\n\n- Możliwości skorzystania z prywatnej opieki zdrowotnej oraz ubezpieczenia NNW od pierwszego dnia pracy\n\n- Posiłku pracowniczego za 5zł\n\n- Zniżki 50% na produkty z naszej karty\n\n- Możliwość awansu na jedno ze stanowisk: Kierownik Zmiany, Kierownik Lokalu\n\nUwaga: z uwagi na zdrowie i bezpieczeństwo Kandydatów oraz Pracowników firmy prosimy o przychodzenie na spotkania rekrutacyjne w maseczkach ochronnych. \n\nDo zobaczenia na spotkaniu!\n\nProsimy o dodanie w CV następującej klauzuli:\n\n\"Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu tej oraz przyszłych rekrutacji (zgodnie z ustawą z dnia 10 maja 2018 roku o ochronie danych osobowych (Dz. Ustaw z 2018, poz. 1000) oraz zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO)).\"\n\nInformujemy, że Administratorem danych jest Dominium S.A. z siedzibą w Warszawie przy ul. Dąbrowieckiej 30. Dane zbierane są dla potrzeb rekrutacji. Ma Pani/Pan prawo dostępu do treści swoich danych oraz ich poprawiania. Podanie danych w zakresie określonym przepisami ustawy z dnia 26 czerwca 1974 r. Kodeks pracy oraz aktów wykonawczych jest obowiązkowe. Podanie dodatkowych danych osobowych jest dobrowolne. W każdym czasie możesz cofnąć swoją zgodę, kontaktując się z Pracodawcą/Administratorem Danych.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kucharz do Baru Samoobsługowego",
        "phone": "692804316",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy Kucharza do Baru Samoobsługowego w Broniszach\n\nCo oferujemy:\n\nPracę stacjonarną\nPrzyjazną atmosferę\nAtrakcyjne wynagrodzenie\n\nCzego wymagamy:\n\nDoświadczenia w pracy w gastronomii\nPozytywne nastawienie do pracy z Klientem\nJesteśmy otwarci na osoby po szkole gastronomicznej chcące zacząć pracę w zawodzie\n\nDo Twoich obowiązków należeć będzie:\n\nPrzygotowywanie posiłków (śniadania, obiady)\nUkładanie menu na każdy dzień\nWydawanie posiłków\n\nMiejsce pracy: Warszawski Rolno-Spożywczy Rynek Hurtowy w Broniszach\n\nOsoby zainteresowane prosimy o kontakt na nr telefonu : +48 692 804 316 lub przesłanie CV.\n\nWyślij SMS z prośbą o kontakt, a my oddzwonimy.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Kucharz do cateringu",
        "phone": "728950509",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Nowo otwarty mały catering mieszczący się w gminie Łomianki poszukuje osoby na stanowisko kucharza\n\nDo obowiązków należeć będzie:\n\nPrzygotowywanie dań według receptur\n\nPakowanie posiłków\n\nDbanie o stanowisko pracy\n\nOferujemy :\n\nPracę w małym, zgranym zespole\n\nUmowę o pracę\n\nWynagrodzenie w zależności od umiejętności i doświadczenia (od 3800zł netto)\n\nPracę od niedzieli do czwartku\n\nPoszukujemy osoby potrafiącej pracować i pokierować zespołem, zorganizowanej i odpowiedzialnej.\n\nWymagane badanie lekarskie",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Poszukiwana kelnerka!",
        "phone": "0226224934",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukiwana dziewczyna na stanowisko kelnerki. Praca na pełen etat ,15 dni w miesiącu. Gwarantujemy pracę w rodzinnej atmosferze. Restauracja znajduję się na śródmieściu.\n\nWynagrodzenie składa się ze stałej pensji plus serwisy plus napiwki.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Doradca klienta / Barista w Kawiarni Deseo",
        "phone": "530353639",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Uzupełniamy zespół Deseo Patisserie w Forcie 8 na Dolinie Służewieckiej oraz CH Vis a Vis Przyczółkowa. Poszukujemy kandydatów na stanowisko barista/doradca klienta. Oferujemy produkty najwyższej jakości, które zdobywają nawet najbardziej wymagające podniebienia oraz uznanie w Polsce i na świecie. Z kolei My, ludzie, tworzymy zespół pasjonatów w sprzedaży, w cukiernictwie, smakoszy czekolady i kawy! Dostępne opcje:\n\n1 x praca na pełen etat\n\n1 x praca 1/2 - 3/4 etatu (student dzienny/zaoczny)\n\n         Oferujemy:\n\nSzkolenia dla baristów, sprzedażowe oraz produktowe pod okiem specjalistów z branży, także szkolenia latte art,\nElastyczny grafik 100-180h i stawkę godzinową: 19.70-22.00 na rękę oraz napiwki,\nPracę dla marki oferującej produkty cukiernicze na światowym poziomie,\nSatysfakcję z pracy dla osób zaangażowanych w pracę w zgranym zespole,\nDla najzdolniejszych osób zainteresowanych cukiernictwem możliwość kontynuacji kariery w centrali firmy,\nZorganizowaną integrację, a dla najzdolniejszych tematyczne wyjazdy poszerzające horyzonty.\n\nObowiązki:\n\nsprawna i profesjonalna obsługa Gości,\nprzygotowywanie kaw i napojów,\ndbanie o porządek w miejscu pracy,\nprzyjmowanie zamówień i stosowanie procedur,\nraportowanie.\n\nWymagamy:\n\nmile widziane doświadczenie do pracy na podobnym stanowisku lub gotowość do sprawnej nauki i przyswajania wiedzy,\nzaangażowania i dostępności,\npozytywnej aparycji i akceptowania przejrzystych zasad pracy w zespole,\naktualnych badań sanepidowskich lub w trakcie ich wyrabiania.\n\nPoznaj Naszą ofertę na stronie Deseo i dołącz do Nas!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Barista/Sprzedawca Karmello Nowy Świat",
        "phone": "789394256",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma Karmello, producent wysokiej jakości wyrobów czekoladowych poszukuje kandydata na stanowisko stanowisko:\n\nSPRZEDAWCA/BARISTA\n\ndo kawiarni zlokalizowanej na Nowym Świecie.\n\nCzekamy właśnie na Ciebie, jeśli:\n\n-łatwo nawiązujesz kontakt z klientem,\n\n-jesteś osobą dyspozycyjną,\n\n-lubisz pracę w zespole,\n\n-posiadasz książeczkę do celów sanitarno-epidemiologicznych.\n\nOferujemy:\n\n-elastyczny czas pracy,\n\n-pracę w młodym, dynamicznym zespole,\n\n-szkolenia,\n\n-możliwość rozwoju zawodowego.\n\nZakres obowiązków:\n\n-przygotowywanie kaw i napojów zimnych,\n\n-sprzedaż produktów z aktualnej oferty firmy,\n\n-dbanie o estetykę miejsca pracy.\n\nUprzejmie informujemy, że skontaktujemy się wyłącznie z wybranymi kandydatami.\n\nProsimy o dopisanie klauzuli: \"Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji godnie z ustawą z dnia 29 sierpnia 1997 r. o ochronie danych osobowych (Dz. U. z 2002 r. Nr 101, poz. 926, ze zm.)\"",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Dyspozytor do restauracji sushi /23zl godzina /Mokotów",
        "phone": "505002698",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukiwana osoba na stanowisko dyspozytora do restauracji sushi .\nObowiązkami tej osoby będą : \nPrzyjmowanie zamówień \nPlanowanie tras kierowca \nPakowanie zamówień \nRozliczanie dnia pracy \nPrzyjmowanie telefonów \nPrzyjmowanie zamówien \nPraca na około 20 dni w miesiącu \nGodziny pracy to 11-22\nNajlepiej osoby z doświadczeniem \nStawka to 23zl za godzinę \nPraca na Mokotowie \nKontakt telefoniczny 50*****98",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kucharz/Kucharka",
        "phone": "517771660",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Lokal gastronomiczny (naleśnikarnia) zlokalizowana w Grodzisku Mazowieckim poszukuje do swojego zespołu kucharza/kucharki\n\noczekujemy:\n\ndyspozycyjności\n\ndobrej organizacji pracy\n\nchęci do podnoszenia kwalifikacji i przyswajania wiedzy\n\nchęci pracy w gastro\n\noferujemy:\n\numowę o pracę/umowę zlecenie/B2B\n\nstabilne zatrudnienie \n\natrakcyjne wynagrodzenie, zależne od doświadczenia i zaangażowania\n\nGrafik 2/2 (z możliwością brania dodatkowych godzin)\n\nUczciwych pracodawców\n\nWszystkich zainteresowanych prosimy o przesłanie CV, bądź kontakt telefoniczny",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pomoc kuchenna do Bistro poszukiwana, praca od pon-piąt 08-16",
        "phone": "501272639",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "\tZatrudnimy pomoc kuchenną do pracy w Restauracji Stacja Bistro Bar. \n\nPraca od poniedziałku do piątku od 08.00-16.00.\n\nTwój zakres obowiązków:\n\nprzygotowywanie warzyw i owoców - obieranie, krojenie\nwykonywanie różnego rodzaju potraw zgodnie z poleceniem kucharza\nkompletowanie i wysyłanie potraw\nutrzymanie porządku, zmywanie naczyń, czyszczenie sprzętów\n\nNasze wymagania:\n\ndoświadczenie w pracy na kuchni\nksiążeczka do celów sanitarno-epidemiologicznych\numiejętność pracy w zespole\n\nTo oferujemy:\n\nstabilne warunki zatrudnienia na podstawie umowy o pracę\npraca w miłej i przyjaznej atmosferze\nstawka wynagrodzenia adekwatna do doświadczenia i umiejętności\n\nStacja Bistro Bar to restauracja, która istnieje od 2014 roku.\n\nPracujemy od pon-piąt od 08.00- 16.00. To nowoczesne bistro w którym z w miłej atmosferze zjesz swój ulubiony lunch. Nowoczesna a zarazem przytulna przestrzeń jaką stworzyliśmy pozwala w pełni delektować się smakiem różnorodnych potraw.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Pomoc kuchenna - Dom Opieki \"Senior Med\"",
        "phone": "537375375",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Dom Opieki „Senior Med” specjalizuje się w sprawowaniu całodobowej, kompleksowej opieki nad wszystkimi tymi osobami, które z racji wieku, ograniczonej sprawności fizycznej bądź też z powodu choroby nie są w stanie zapewnić sobie samodzielnego życia w środowisku domowym i potrzebują stałego nadzoru lekarskiego oraz profesjonalnej pielęgnacji, opieki i rehabilitacji. \n\nObecnie poszukujemy osób na stanowisko:\n\nOsoby do wydawania posiłków\n\nLokalizacja: Wiązowna: Dom Opieki „Senior Med”\n\nZAKRES OBOWIĄZKÓW: \n\nWydawanie posiłków\n\nOFERUJEMY:\n\nStabilną pracę w oparciu o umowę zlecenie\n\nPracę w systemie dyżurowym 12 godzinnym\n\nAtrakcyjne wynagrodzenie – 19 - 20 zł /godzinę\n\nWszystkie osoby zainteresowane prosimy o kontakt telefoniczny \n\nw godz. 8-18: Telefon: 53*******75",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Kelner poszukiwany",
        "phone": "795666999",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Szukam kelnera do pracy w restauracji na stałe. Najlepiej 5/6 dni w tygodniu po 8h. Praca na ulicy Bakalarskiej w restauracji China Hotpot. Napiwki :).\nWymagania: dyspozycyjność, punktualność, pracowitość, rzetelność, uczciwość. \nDoświadczenie wymagane.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kuchnia zimna - poszukujemy kucharza/kucharki",
        "phone": "607903330",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukiwana osoba do pracy na kuchni zimnej. Praca w zgranym zespole, zmianowa i wynagrodzenie na czas. Zapraszam do aplikowania",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kelnerka - Baristka - Uśmiechnięta dziewczyna",
        "phone": "602237133",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "JOHNY SZALONY Naleśnikarnia&Pizzeria - poszukuje uśmiechniętej dziewczyny do pracy jako kelnerka/baristka.\n\nBierzemy pod uwagę tylko osoby pełnoletnie, poszukujące pracy stałej.\n\nZADANIA:\n\nPrzygotowywania napoi ciepłych i zimnych zgodnie z otrzymanymi recepturami\nPrzyjmowanie i wydawanie zamówień\nObsługa kasy fiskalnej\nDbanie o czystość sali i stanowiska pracy\n\nWYMAGANIA:\n\nZdolność szybkiego nawiązywania kontaktu z gościem\nDyspozycyjność pracy również w weekendy\nAktualna książeczka sanepidu\nWysokie poczucie estetyki\nZaangażowanie i komunikatywność\nUmiejętność pracy pod presją czasu\nPunktualność i odpowiedzialność\n\nCO OFERUJEMY:\n\nWspółtworzenie jednego z najciekawszych konceptów gastronomicznych w Polsce.\nPracę w pięknym, nowym, bardzo atrakcyjnym lokalu\nUmowę o pracę po okresie próbnym.\nStawkę progresywną oraz zależną od posiadanych umiejętności\nSzkolenie wdrażające\nPracę w młodym, zaangażowanym zespole\nZniżki pracownicze\nNapiwki\n\nJOHNY czeka na Ciebie! Prześlij CV na: piszdojohna(malpa)gmail.com lub zadzwoń i umów się na spotkanie:\n\nrestauracja Johny Szalony\n\nul. Montwiłła 41\n\n05-825  Grodzisk Mazowiecki",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Praca w Piekarni Nadarzyn",
        "phone": "48603308969",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy w piekarni w Nadarzynie. Poszukujemy pracowników na stanowisko ciastowego, stołowego i piecowego. Nie masz doświadczenia-przyuczymy Cię.\nWszelkie informacje pod numerem telefonu 60*******69",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "OSOBA ZMYWAJĄCA - Kuźnia Kulturalna na Wilanowie",
        "phone": "606212026",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy osoby do pracy na zmywak w restauracji Kuźnia Kulturalna w Wilanowie.\n\nMile widziane doświadczenie i komunikatywny język polski.\n\nW grafiku mogą wypadać zmiany nocne, które są dodatkowo premiowane. \n\nStawka godzinowa to 16zł na rękę (netto).\n\nProsimy o kontakt telefoniczny, mailowy lub poprzez olx.\n\ntel: 60*****26",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Praca, Kelnerka, Kelner do sushi baru w Konstancinie",
        "phone": "504581354",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam zatrudnimy kelnerkę do sushi baru w Konstancinie.\n\nOferujemy :\n\n- pracę około 15 dni w miesiącu lecz jeśli chcesz pracować w weekendy lub kilka razy w tygodniu też napisz,\n\n-praca w młodym zespole,\n\n-umowę o prace bądź zlecenie,\n\n-stabilne zatrudnienie,\n\n-elastyczny grafik,\n\n-stawka godzinowa uzależniona od doświadczenia,\n\nOczekujemy :\n\n-punktualności,\n\n-dbania o porządek,\n\n-sumienności,\n\n-pozytywne nastawienie,\n\n-znajomości j.angielskiego w stopniu podstawowym\n\n-dodatkowym atutem będzie znajomość systemu pos,\n\n-umiejętność pracy zespołowej,\n\n-jeśli nie posiadasz doświadczenia to się nie przejmuj wszystkiego cie nauczymy,\n\nCv proszę wysyłać na maila bądź przez formularz olx.\n\nPozdrawiam Piotr",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kucharz Restauracja Ggospoda Zalewajka",
        "phone": "501330337",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja Gospoda Zalewajka z wieloletnią tradycją w Konstancinie poszukuje do swojego zespołu kucharzy z doświadczeniem. Od kandydata oczekujemy zangażowania, umijętności pracy pod presją czasu, dobrej organizacji pracy.\n\nWynagrodzenie adekwatne do umiejetności, umowa o pracę.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kelner / Kelnerka",
        "phone": "511230015",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Trattoria Primavera zatrudni Kelnerki / Kelnerów.\n\nOferujemy pracę na stałe jak i weekendy.\n\nPoszukujemy osób z pogodnym usposobieniem, chęcią do pracy oraz umiejętnością pracy w zespole.\n\nOferujemy :\n\n- atrakcyjne wynagrodzenie\n\n- pracę zmianową\n\n- pracę w miejscu z klimatem\n\n- stabilne zatrudnienie\n\nOczekujemy kandydatów cechujących się :\n\n- wysoką kulturą osobistą\n\n- punktualnością\n\n- zorganizowaniem\n\n- odpornością na stres\n\nWymagana Książeczka sanepidowska\n\nZainteresowane osoby prosimy o przesłanie CV wraz ze zdjęciem",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kucharz hotelowy w Hotelu od 25 zł na start",
        "phone": "572660003",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Do Hotelu Afrodyta Business & SPA w Radziejowicach pod Warszawą poszukujemy kandydatów na stanowisko:\n\nKucharz Hotelowy\n\n(doświadczenie wymagane)\n\n \n\nZatrudnienie od 14.02.2022 r\n\nIstnieje możliwość noclegu w obiekcie podczas pracy zmianowej,\n\nStawka:\n\nNa start 25zł przez 3 miesiące w okresie próbnym,\n\nnastępnie stawka ustalana indywidualnie\n\n \n\nJeśli jesteś : sumienny ,uczciwy, bezkonfliktowy i lubisz pracę w kuchni to jest miejsce dla Ciebie\n\n \n\nZainteresowanych kandydatów i kandydatki zapraszam do wysyłania CV\n\nkontakt telefoniczny Kosowski Waldemar tel 57*******03\n\n ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Zatrudnimy do pracy w cukierni na noce",
        "phone": "608415038",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy na noce do pracy w cukierni MAR.S mieszczącej się w Guzowatce (5km od Radzymina) oferujemy stabilną pracę i wysokie wynagrodzenie, więcej informacji udzielimy telefonicznie",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Kelnerka/Kelner Otwock.",
        "phone": "579754912",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Kelner/kelnerka (Przyjaciel od pizzy)\n\nJeśli…\n\n·      Czerpiesz przyjemność z kontaktu z ludźmi, lubisz z nimi rozmawiać i wspierać w podejmowaniu decyzji.\n\n·      Nie potrafisz żyć bez wyzwań i celów\n\n·      Posiadasz pozytywne nastawienie do otaczającego świata.\n\n… to może jesteś osobą której szukamy.\n\nSzukamy bowiem dojrzałych emocjonalnie i życiowo osób, które rozumieją że sprzedaż i obsługa to pomaganie naszym przyjaciołom od pizzy i troszczenie się o ich dobro, a nie prymitywna manipulacja i tanie sztuczki. Dlatego sposób w jaki pracujemy nazywamy przyjacielskim (nasz klient to nasz przyjaciel od pizzy).\n\n \n\nKilka słów o nas\n\nDa Grasso to nie tylko wysokiej jakości dania. To także wyjątkowa więź między obsługą a Klientami. Już od 1996 roku wkładamy serce w przygotowywane przez nas potrawy, dzięki czemu nasi Klienci ciągle do nas wracają. Jesteśmy Przyjaciółmi od pizzy, ponieważ nasze restauracje tworzone są przez przyjaciół dla przyjaciół.\n\nNa Czym polega praca kelnera w Da Grasso?\n\nJesteś odpowiedzialny za obsługę klienta na Sali jak również klienta dzwoniącego. Czyli serdecznie witasz klientów i przez cały ich pobyt w naszej pizzerii dbasz o to aby mile spędzili czas u nas.\n\nOferujemy:\n\n- Pracę w Lokalu o ugruntowanej pozycji na rynku,\n\n- Przejrzyste zasady wynagradzania(15zł/godz. na rękę),\n\n- Zdobycie wiedzy o różnym profilu,\n\n- Pracę w zgranym i otwartym na ludzi zespole\n\n \n\nWymagania:\n\nZgłoś się do nas, jeśli spełniasz poniższe warunki:\n\n- Umiejętnośś pracy w zespole,\n\n- dyspozycyjności,\n\n- sumienność,\n\n- aktualne badania sanitarno-epidemiologiczne.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "category": "gaz",
        "id": "",
        "name": "Pomocnik kucharza",
        "phone": "667887567",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy pomocnika kucharza do restauracji hotelowej.\n\nMożliwość awansu na stanowisko samodzielnego kucharza i kucharza zmianowego.\n\nNie wymagamy doświadczenia, ale będzie ono dodatkowym atutem.\n\nZakres obowiązków:\n\nPrzygotowywanie i wydawanie śniadań\n\nUtrzymywanie czystości w kuchni\n\nPrzygotowywanie produktów dla kucharza\n\nPo wdrożeniu - Przygotowywanie potraw pod okiem kucharza zmianowego\n\nPraca na cały etat\n\nWynagrodzenie 16-20 zł / godzinę NETTO\n\nOsoby zainteresowane prosimy o przesyłanie CV na adres e-mail lub zgłaszanie się osobiście po wcześniejszym umówieniu. ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Pizzer do Pizzerii w Ząbkach / Pizzera / Kucharz / 18 - 20 netto /h",
        "phone": "509017212",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Szukam Pizzera do pracy w Ząbkach\n\nWymagania:\n\n- książeczka sanepidu lub brak przeciwwskazań do wyrobienia\n\n- mile widziany status studenta\n\n- uczciwość\n\n- znajomość języka polskiego\n\nSzukam osoby chcącej pracować jako Pizzer. \n\nDo obowiązków będzie należało \n\nprzygotowanie wypiek pizzy, \nodbieranie telefonów od klientów, \ndbanie o czystość w lokalu\n\n.\n\nNie masz doświadczenia - to nie problem, chętnie Wszystkiego nauczymy.\n\nDzień próbny - po nim stwierdzamy co dalej.\n\nJesteśmy Pizzerią z dojazdem lub wynos, możliwa dodatkowa praca jako kierowca.\n\nPraca w  2xweekendy i w tygodniu - ustalimy na dniu próbnym.\n\nW odpowiedzi na ogłoszenie proszę o CV ze zdjęciem - lub parę słów o sobie ze zdjęciem:)\n\nPraca na dłużej z możliwością rozwoju zawodowego. Nie szukam osób na sezon czy miesiąc tylko poważne osoby chcące pracować.\n\nZarobki w granicach 3000 do ręki.\n\nZapraszam do rekrutacji.\n\n ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "oleksii.tsymbaliuk",
        "category": "gaz",
        "id": "",
        "name": "Kucharz / Kucharka",
        "phone": "660441902",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy osoby chętnej do pracy na STAŁE w małej restauracji z różnorodną kuchnią ze wskazaniem na dania włoskie oraz pizza. Mile widziana osoba z podstawami gotowania jak również do przyuczenia.\n\nOczekujemy chęci do pracy i rozwoju, przestrzegającej higieny pracy, \n\nOferujemy możliwość nauki i rozwoju.\n\nPraca w systemie zmianowym.\n\nStawka na okres próbny 1 miesiąc od 18 zł/h netto ( na rękę ) ustalana indywidualnie.\n\nWinna Włoszczyzna ul. Ponarska 11 03-890 Warszawa Osiedle Wilno.\n\nZapraszamy na rozmowę",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "category": "gaz",
        "id": "",
        "name": "Zatrudnię pomoc kuchenną",
        "phone": "575716755",
        "email": "",
        "consumption": "",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy pomocy kuchennej (pomoc w przygotowaniu i nakładaniu dań na wynos) do Punktu Gastronomicznego specjalizującego się w kuchni koreańskiej.\n\nPunkt Gastronomiczny zlokalizowany jest na Saskiej Kępie w Warszawie.\n\nPoszukujemy osób posiadających doświadczenie z pracą w kuchni, lubiących gotować i poznawać nowe smaki. Mile widziane gospodynie domowe z prawdziwego zdarzenia :)\n\nPraca w tygodniu (pn-pt) w godzinach 09:00 - 17:00.\n\nOferujemy:\n\numowę zlecenie",
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