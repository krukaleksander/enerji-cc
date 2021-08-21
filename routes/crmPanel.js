const express = require('express');
const router = express.Router();
let accounts = [];
const crmAccounts = require('../models/crmAccounts');
// const energyClients = require('../models/experts');
const clientsready = require('../models/clientsready');
const tasks = require('../models/tasks');
const chatMessages = require('../models/chat');
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
        "owner": "damian.wasiak",
        "id": "",
        "name": "Zatrudnię pracowników do pracy w sklepie w Nadarzynie.",
        "category": "olx",
        "phone": "608601764",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Sklep samoobsługowy Kaprys w Nadarzynie zatrudni pracowników. Sklep nie posiada stoiska z mięsem i wędlinami. Pracujemy w systemie dwuzmianowym. W niedziele i święta sklep jest zamknięty. Oferujemy stabilne zatrudnienie w oparciu o umowę o pracę oraz system motywacyjny, dzięki któremu premia będzie uzależniona od pracy.Oferujemy płacę w wysokości do 4000zł netto (do ręki). Praca polega na dbaniu o prawidłową ekspozycję towarów, obsłudze klienta, utrzymywaniu porządku we wskazanych działach sklepu. Cenimy rzetelność, uczciwość, szczerość i zaangażowanie. Doceniamy osoby zmotywowane i chętne do pracy. Mile widziane doświadczenie.\n\nZapraszamy!\n\nTelefon kontaktowy: 608601764",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Sprzedawca w Lee Cooper CH Factory Ursus - etat",
        "category": "olx",
        "phone": "785007915",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Oddział w Polsce brytyjskiej marki Lee Cooper (głównie spodnie Jeans) poszukuje sumiennych, odpowiedzialnych i dynamicznych osób do zasilenia naszego zespołu.\n\nMiejsca pracy: Warszawa – Galeria Factory Ursus\n\n Stanowisko: sprzedawca/doradca klienta\n\nDo Twoich obowiązków będzie należało: \n\n• obsługa klienta w oparciu o standardy firmy \n\n• realizacja planów sprzedażowych \n\n• dbanie o ekspozycję towaru na sali sprzedaży, przyjmowanie dostaw oraz utrzymanie porządku w magazynie \n\n• inne prace ustalone lub zlecone przez przełożonego \n\n Jeżeli spełniasz poniższe oczekiwania: \n\n• dyspozycyjność \n\n• energiczność \n\n• mile widziane doświadczenie w sprzedaży \n\n• wysoka kultura osobista i zdolności interpersonalne \n\n• mile widziana komunikatywna znajomość języka angielskiego \n\n Oferujemy Ci:\n\n• ciekawą i pełną wyzwań pracę \n\n• atrakcyjne warunki zatrudnienia oraz system premiowania\n\n• elastyczny grafik\n\n• umowę o pracę\n\n• możliwość rozwoju zawodowego\n\n• szkolenie z zakresu standardów obsługi klienta\n\n• możliwość podnoszenia kwalifikacji i rozwoju zawodowego w międzynarodowej firmie w oparciu  o wysokie standardy pracy\n\n• pracę w młodym i dynamicznym zespole\n\nOsoby zainteresowane ofertą prosimy o przesłanie CV ze zdjęciem za pośrednictwem portalu OLX lub osobiście w naszym punkcie.\n\nWszystkich zainteresowanych prosimy o dołączenie klauzuli: „Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO)”.\n\nSzanowni Kandydacie,\n\nChcielibyśmy przekazać Ci podstawowe informacje na temat przetwarzania Twoich danych osobowych, których jesteśmy Administratorem.\n\nZgodnie z art. 13 ust. 1−2 rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z 27.04.2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (ogólne rozporządzenie o ochronie danych) (Dz.Urz. UE L 119, s. 1) – dalej RODO − informujemy, że: \n\nI.      Administrator danych osobowych:\n\nAdministratorem danych osobowych jest: Kamex II Mlek i Kania sp. j. z siedzibą w Częstochowie, ul. Ogrodowa 66A, 42-202 Częstochowa, KRS 0000386396, NIP: 9492176211,  telefon kontaktowy +48 (34) 324 10 83. \n\nII.    Cele i podstawy przetwarzania:\n\n\tJako administrator będziemy przetwarzać Twoje dane:\n\n1.      w celu przeprowadzenia rekrutacji na stanowisko pracy, na które aplikujesz oraz wybrania pracownika i zawarcia umowy o pracę, na podstawie przepisów prawa pracy (podstawa z art. 6 ust. 1 lit. c RODO);\n\n2.      w celach kontaktowych na podstawie Twojej zgody (podstawa z art. 6 ust 1 lit a RODO);\n\nW każdej chwili przysługuje Ci prawo do wycofania zgody na przetwarzanie Twoich danych     osobowych, ale cofnięcie zgody nie wpływa na zgodność z prawem przetwarzania, którego dokonano na podstawie Twojej zgody przed jej wycofaniem.\n\nIII. Okres przechowywania danych: \n\nTwoje dane osobowe będą przetwarzane przez okres:\n\n6 miesięcy — w przypadku danych osobowych przetwarzanych w celu przeprowadzenia bieżącego procesu rekrutacyjnego;\n\nTwoje dane osobowe przetwarzane zgodnie z punktem II. 2. będą przetwarzane przez okres do czasu wycofania przez Ciebie udzielonej zgody na ich przetwarzanie. \n\nIV.  Odbiorcy danych:\n\nTwoje dane osobowe mogą zostać ujawnione podmiotom, z których korzysta Administrator przy ich przetwarzaniu, takim jak: firmy księgowe, prawnicze, informatyczne, hostingowe, ubezpieczeniowe.\n\nWskazujemy, iż dane osobowe przekazujemy tylko w takim zakresie, w jakim jest to rzeczywiście niezbędne dla osiągnięcia danego celu. \n\nV.    Prawa osób, których dane dotyczą:\n\nZgodnie z RODO, przysługuje Ci: prawo dostępu do swoich danych oraz otrzymania ich kopii; prawo do sprostowania (poprawiania) swoich danych; prawo do usunięcia danych; ograniczenia przetwarzania danych; prawo do wniesienia sprzeciwu wobec przetwarzania danych; prawo do przenoszenia danych; \n\nJesteś uprawniony do zgłoszenia żądania realizacji praw, o których mowa w punkcie V, poprzez kontakt z Administratorem. Dane kontaktowe znajdziesz w punkcie I powyżej. Na stronie internetowej www.leecooper.pl znajdziesz szczegóły dotyczące praw osób, których dane dotyczą oraz sytuacje kiedy można z nich skorzystać.\n\nVI.     Informacja o wymogu/dobrowolności podania danych:\n\nPodanie danych jest dobrowolne, jednakże podanie takich danych jak imię i nazwisko, data urodzenia, miejsce zamieszkania (adres do korespondencji), dane kontaktowe, informacje o wykształceniu i dotychczasowym przebiegu zatrudnienia, jest konieczne do wzięcia udziału w bieżącym procesie rekrutacyjnym lub ewentualnie przyszłych procesach rekrutacyjnych (bez tych danych przystąpienie do rekrutacji nie będzie możliwe);\n\nPodanie jakichkolwiek innych danych niż wymienione zależy od Twojego uznania, ponieważ ich nie wymagamy;                 \n\nVII.     Zautomatyzowane podejmowanie decyzji:\n\nTwoje dane osobowe nie będą przetwarzane w sposób zautomatyzowany i nie będą profilowane. \n\nVIII.     Skarga do PUODO:\n\nMasz prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych, gdy uznasz, iż przetwarzanie Twoich danych osobowych dotyczących narusza przepisy RODO. ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Sprzedawca - Sklep Spożywczy LUKA",
        "category": "olx",
        "phone": "794956816",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Sklep Spożywczy LUKA w Pruszkowie poszukuje osoby na stanowisko Sprzedawca.\n\nSklep znajduję się w Pruszkowie na ulicy Juliana Gomulińskiego\n\nWymagania:\n\ngotowość do pracy w systemie zmianowym\numiejętność dostosowania się do pracy w zespole i obowiązujących zasad\nzaangażowanie w realizowaniu zadań sprzedażowych\nuczciwość i lojalność\nkultura osobista\nżyczliwość\npozytywne nastawienie do ludzi\n\nPodstawowe zadania :\n\nfachowa obsługa klienta oraz aktywna sprzedaż zgodnie ze standardami obowiązującymi w sklepie spożywczym\nobsługa systemu kasowego oraz wystawianie dokumentów kasowych zgodnie z obowiązującymi przepisami\ndbanie o czystość i porządek, rozkładanie dostaw towarów\ndbanie o powierzone mienie przedsiębiorstwa oraz używanie go zgodnie z przeznaczeniem i zasadami\naktywny udział w organizowanych akcjach promocyjnych\npogłębianie wiedzy z zakresu oferowanych produktów i usług\n\nOferujemy:\n\npracę w miłej i przyjaznej atmosferze\nstałą pensję oraz dodatkową premię uzależnioną od wyników sprzedaży\nwypłaty zawsze w terminie\nelastyczny grafik\nzatrudnienie w oparciu o umowę o pracę lub zlecenie\npracę w renomowanej firmie\nmożliwość rozwoju\nmożliwość zdobycia doświadczenia zawodowego w sektorze obsługi klienta\n\nOsoby spełniające powyższe oczekiwania i zainteresowane pracą na proponowanym stanowisku prosimy o przesłanie CV za pośrednictwem portalu\n\nProsimy o zamieszczenie klauzuli o treści: \" Wyrażam zgodę na przetwarzanie moich danych osobowych w celu udziału w postępowaniu rekrutacyjnym.\"\n\nZastrzegamy prawo odpowiadania tylko na wybrane oferty.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Doradca klienta 50 style Pruszków \"Nowa Stacja\"",
        "category": "olx",
        "phone": "501930254",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Opis\n\nOpis\n\nAktualnie do naszego zespołu poszukujemy pracownika na stanowisko: Kierownik Zmiany \n\nJeżeli: \n\nMasz doświadczenie w sprzedaży lub obsłudze klienta\nJesteś zmotywowany do pracy w sprzedaży\nMasz wysoko rozwinięte zdolności komunikacyjne\nPotrafisz budować i utrzymywać długotrwałe relacje z klientem\n\nZapraszamy Cię do wzięcia udziału w rekrutacji.\n\nW zamian zaoferujemy Ci:\n\nMożliwość rozwoju zawodowego poprzez szkolenia produktowe i sprzedażowe,\n\nCV ze zdjęciem prosimy składać poprzez stronę OLX .",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Zatrudnię sprzedawcę",
        "category": "olx",
        "phone": "504485359",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię kobiety  do pracy w sklepie spożywczym,  praca zmianowa,  16 zł netto za godzinę,  płatne tygodniowki. \nZainteresowane osoby prosimy o kontakt TYLKO telefoniczny 504475359.\nSklep znajduje się w Komorowie , 300 m od stacji WKD KOMORÓW",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "zatrudnię sprzedawcę",
        "category": "olx",
        "phone": "609979789",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy sprzedawcę kasjera , zapewniamy stałe zatrudnienie oraz miłą rodzinną atmosferę w pracy",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Cukiernia z tradycjami zatrudni Ekspedientki",
        "category": "olx",
        "phone": "227236252",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Cukiernia zatrudni osobę na stanowisko sprzedaży wyrobów cukierniczych. Lokalizacja pracy to Piastów. Wymagamy pozytywnego nastawienia, energii, uśmiechu na twarzy oraz kultury osobistej, wszystkie inne, potrzebne umiejętności nauczymy podczas pracy u nas. Zapraszamy serdecznie do kontaktu.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Doradca Klienta sklep budowlany Adamex-Grodzisk Maz",
        "category": "olx",
        "phone": "510166850",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Adamex sklep i skład remontowo-budowlany poszukuje;\n\nDoradcy Klienta na działach: dział budowlany , hydraulika\n\nOczekujemy od pracownika:\n\n-znajomości produktów budowlanych\n\n-doświadczenia w branży budowlanej\n\n-chęci do nauki\n\n-dobrego kontaktu z klientem\n\n-zaangażowania-umiejętności pracy w zespole\n\nPraca polega na zapewnieniu dostępności towaru na dziale oraz profesjonalnej obsłudze Klienta.\n\nProponujemy stabilne zatrudnienie ,umowę o pracę , szkolenia branżowe i ubezpieczenia grupowe.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Praca na stanowisku sprzedawca w sklepie motoryzacyjnym",
        "category": "olx",
        "phone": "48509358750",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Praca na stanowisku sprzedawca w sklepie motoryzacyjnym w dziale lakierniczym/auto detailingu szuka człowieka.\n\nPragniemy przede wszystkim znaleźć osobę, która będzie pasować do naszego zespołu, ale również posiada umiejętność rozmawiania z klientem. Miłą, dokładną, zorganizowaną, ze znajomością obsługi komputera. Doświadczenie w pracy z zakresu kosmetyków i chemii samochodowej i/lub w dobieraniu kolorów będzie dodatkowym atutem. Mile widziani pasjonaci motoryzacji I lakiernictwa:)\n\nJesteś osobą dokładną, precyzyjną i sumienną? Przywiązujesz dużą uwagę do jakości wykonanej pracy? Jeżeli odpowiedziałeś „TAK” to znaczy, że pierwszy etap rekrutacji mamy już za sobą\n\nzapraszamy do kontaktu:",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "AKTUALNE! Praca w sklepie monopolowym Ursus",
        "category": "olx",
        "phone": "608123196",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukuję osób do pracy w sklepie monopolowym na warszawskim Ursusie.\n\nUlica Keniga 4B\n\nZmiany 24 godzinne\n\nStawka na początek 14 zł. netto/h po okresie próbnym 15 zł. netto/h\nNiedziela 20 zł netto\nŚwięta 30 zł netto\n\nDo podstawowych obowiązków należą:\n-obsługa klienta \n-dbanie o czystość\n-przyjmowanie dostaw\n-obsługa programu fiskalnego\n\nSklep nie jest duży. \n\nMile widziane doświadczenie na podobnym stanowisku :)\n\nDoceniam oraz szanuję swoich pracowników, a zaangażowanie wynagradzam premią. \n\nZależy mi przede wszystkim na stałej współpracy, ale zapraszam do kontaktu każdą zainteresowaną osobę.\n\nZatrudniam osoby punktualne, uczciwe oraz chętne do pracy. \n\nGwarantuję pracę w miłej oraz niestresującej atmosferze.\n\nPosiadam kilka sklepów od wielu lat, kadra rzadko się zmienia, co uważam za najlepszą rekomendację. \n\nMaciej\nNumer telefonu: 608123196\n\nCv proszę wysyłać na maila \nPelikan.Maciej.grabowski(małpa)gmail.com",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Kasjer-sprzedawca",
        "category": "olx",
        "phone": "512297340",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Sklep mięsno-wędliniarski w Żyrardowie zatrudni na stanowisko kasjer-sprzedawca.Informacje pod nr tel. 604 136 956.OGŁOSZENIE GRZECZNOŚCIOWE",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Doradca Klienta sklep budowlany Adamex-Błonie",
        "category": "olx",
        "phone": "500111926",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Adamex sklep i skład remontowo-budowlany poszukuje ;\n\nDoradcy Klienta na działach ; budowlany i hydraulika.\n\nOczekujemy od pracownika;\n\n-znajomości produktów budowlanych\n\n-doświadczenia w branży budowlanej\n\n-chęci do nauki\n\n-dobrego kontaktu z klientem\n\n-zaangażowania i umiejętności pracy w zespole\n\nPraca polega na zapewnieniu dostępności towaru na dziale oraz profesjonalnej obsługi klienta.\n\nProponujemy stabilne zatrudnienie , umowę o pracę , szkolenia branżowe i ubezpieczenie grupowe.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "ekspedientka dział mięsno-wędliniarski, kasjer",
        "category": "olx",
        "phone": "228942840",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "delikatesy delix lewiatan piastów ul. łukasińskiego 23, zatrudnią ekspedientki na stoisko mięso-wędliny (mile widziane doświadczenie) praca na zmiany 6-14, 14-22 oraz co druga sobota 7-21 i niedziele 8.30-18.00 tylko ustawowo handlowe, wynagrodzenie na początek 2.700 netto (obowiązkowo książeczka sanepidowska lub aktualne zaświadczenie do celów sanitarno-epidemiologicznych)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Kasjer sprzedawca i pracownik podjazdu Orlen Pęcice",
        "category": "olx",
        "phone": "604430350",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Stacja Paliw Orlen w Pęcicach zatrudni kasjera oraz pracownika podjazdu. Poszukujemy pracownika na cały etat (może być też niższy wymiar). Doświadczenie nie jest wymagane. Wszystkiego Cię nauczymy :)\n\nOferujemy:\n\n-umowę o pracę,\n\n-stabilne zatrudnienie\n\n-pakiet szkoleń na każdym etapie rozwoju;\n\n- zdobycie doświadczenia zawodowego w oparciu o standardy PKN Orlen,\n\n-elastyczny grafik,\n\nPraca polega na:\n\n- obsłudze stanowiska kasowego -kasjer\n\n-obsłudze klienta na podjeździe - pracownik podjazdu\n\n- komunikowaniu aktualnych promocji,\n\n- dbanie o bezpośrednie kontakty i utrzymywanie stałych relacji z klientem,\n\n- dbałość o czystość i porządek stacji paliw\n\nOczekujemy:\n\n-umiejętności pracy w zespole\n\n-pozytywnego nastawienia,\n\n-otwartości na ludzi i nowe doświadczenia,\n\n-chęci rozwoju\n\nCV proszę wysyłać na podany adres e-mailowy lub dostarczyć osobiście (Parkowa 49,\n\n05-806 Pęcice).\n\nProsimy o dopisanie w CV następującej klauzuli:\n\n\"Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w mojej aplikacji dla potrzeb niezbędnych do realizacji procesów rekrutacji (zgodnie z Ustawą z dnia 29 sierpnia 1997 r. o ochronie danych osobowych tj. Dz. U. z 2002 r., Nr 101, poz. 926, ze zm.).",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Praca dla Kasjera oraz do działu mięsnego w Delikatesach Centrum",
        "category": "olx",
        "phone": "506078578",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Potrzebni kasjerzy sprzedawcy oraz do obsługi klienta na dziale mięsnym\n\n  DO Delikatesy Centrum przy ulicy Starodęby 8 dzielnica Ursus\n\n Oferujemy pracę  w warunkach:\n\n-system dwuzmianowy \n\n -umowa o pracę lub zlecenie\n\n -premia miesięczna od wyrobionej normy sprzedaży\n\n -możliwa praca w godzinach nadliczbowych \n\n -wynagrodzenie wypłacane zawsze 15 każdego miesiąca \n\nnr, telefonu 506078578",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Ekspedientka w Piekarni Oskroba",
        "category": "olx",
        "phone": "507655711",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy ekspedientki do sklepu firmowego Oskroba w Brwinowie\n\nSzukamy osoby pogodnej, lubiącej kontakt z klientem, uczciwej i sumiennej.\n\nW tej pracy wskazana jest dobra organizacja, solidność, umiejętność szybkiej i sprawnej obsługi klienta oraz umiejętność pracy w zespole.\n\nW zakres obowiązków wchodzi:\n\nbezpośrednia obsługa klienta zgodnie ze standardami firmy,\nobsługa kasy fiskalnej i terminala,\npakowanie pieczywa, ciast, wyrobów słodkich\nznajomość całego asortymentu,\nprzyjęcie towaru,\ndbanie o ekspozycję towaru,\nwypiek pieczywa,\nsprzątanie miejsca pracy.\n\nOferujemy:\n\nsystematyczne wynagrodzenie i stabilne zatrudnienie,\nszkolenie i wsparcie w pierwszym okresie pracy\natrakcyjne wynagrodzenie oraz premie motywacyjne\nzniżki pracownicze\npraca zmianowa (5-13; 7.30-15.30, 13-21)\n\nObowiązkowe jest posiadanie książeczki sanepidu.\n\nCV ze zdjęciem prosimy kierować na adres email.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Zatrudnimy Sprzedawcę",
        "category": "olx",
        "phone": "514718855",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Jakie zadania na Ciebie czekają ?\n\nmiła i cierpliwa obsługa klienta na sali sprzedaży i przy kasie fiskalnej\ndbanie o właściwy sposób ekspozycji towarów  \netykietowanie i wykładanie towaru\nobsługa kasy/drukarki fiskalnej,\nobsługa systemu magazynowo-sprzedażowego\npomoc w załadunku/rozładunku asortymentu,\nutrzymywanie czystości w miejscu pracy.\n\n \n\n Jakich osób szukamy?\n\nmiłych i otwartych na kontakt z Klientami\nzaangażowanych, dokładnych i chętnych do nauki\nodpowiedzialnych i uczciwych\nnastawionych na współpracę\npełnoletnich\n\n \n\n Zgłoś się już dziś!\n\n Mamy do zaoferowania:\n\numowę zlecenie, z możliwością zmiany na umowę o pracę\natrakcyjne wynagrodzenie, z możliwością wprowadzenia premii motywacyjnych\nstabilne zatrudnienie i pewne wynagrodzenie\nprzyjemną pracę i naukę w doświadczonym zespole\n\n \n\nOdpowiadając na to ogłoszenie wyrażasz zgodę na przetwarzanie przez spółkę \n\nFigle-Migle Spółka z o.o. z siedzibą w Pruszkowie, (05-800) ul. Jasna 4, Twoich danych osobowych zawartych w formularzu rekrutacyjnym oraz CV w celu prowadzenia procesu rekrutacji na stanowisko wskazane w ogłoszeniu. W każdej chwili możesz skorzystać z przysługujących Ci praw, w tym wycofać zgodę na przetwarzanie danych, uzyskać dostęp do swoich danych; poprosić o: sprostowanie i uzupełnienie danych, usunięcie danych; ograniczenie przetwarzania danych; wyrazić sprzeciw wobec przetwarzania \n\ndanych, wystąpić o przeniesienie danych i ze skargą do organu nadzorczego. Po zakończeniu rekrutacji Twoje dane osobowe zostaną usunięte z naszych rejestrów.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Sprzedawca w sklepie z AGD - ŻYRARDÓW",
        "category": "olx",
        "phone": "605525231",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma Prymus-AGD poszukuje energicznej i zaangażowanej osoby na stanowisko sprzedawcy do sklepu w Żyrardowie.\n\nWymagania:\n\ndoświadczenie w handlu\nznajomość obsługi komputera\nmile widziana znajomość obsługi kasy fiskalnej\ndyspozycyjność\numiejętność pracy w zespole \n\nOferujemy:\n\numowę o pracę\nszkolenie wdrożeniowe\nmożliwość rozwoju zawodowego\nmotywujące wynagrodzenie\n\nInformujemy,że skontaktujemy się tylko z wybranymi kandydatami.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Sprzedawcę do sklepu spożywczego w Piastowie",
        "category": "olx",
        "phone": "509928008",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Właściciel sieci sklepów spożywczych zlokalizowanych na terenie województwa mazowieckiego, poszukuje do swojego sklepu w Piastowie osób do pracy na stanowisku Sprzedawca\n\nOD KANDYDATÓW OCZEKUJEMY:\n\nznajomości podstawowych zasad obsługi klienta\nenergicznej i przyjaznej osobowości\nsumienności i zaangażowania w wykonywaniu obowiązków\numiejętności pracy w grupie oraz znajomości zasad prawidłowej komunikacji z klientami i współpracownikami\n\nDoświadczenie na podobnym stanowisku będzie dodatkowym atutem\n\nOFERUJEMY:\n\nwynagrodzenie podstawowe oraz comiesięczną premię za wyniki pracy\nzatrudnienie na umowę o pracę\nsystem pracy II zmianowy (pn. – pt.) / dwie soboty w miesiącu pracujące na pierwszą zmianę / wolne wszystkie niedziele\n\nCV proszę wysłać na adres mailowy lub kontakt telefoniczny w godzinach 8:00 - 16:00\n\ntel. 509-928-008\n\n﻿",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Zatrudnię sprzedawczynię – sklep spożywczy",
        "category": "olx",
        "phone": "789120230",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię sprzedawczynię do małego sklepu spożywczego w Stefanowie ul. Malinowa 48. Praca na pełny etat, dwie zmiany od poniedziałku do piątku plus co druga sobota.\n\nZapraszam do kontaktu pod numerem tel. 789 120 230.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Pracownik obsługi klienta - stacja Shell Grodzisk Mazowiecki",
        "category": "olx",
        "phone": "696294242",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": " Opis stanowiska:\n\nTwoim głównym zadaniem będzie zapewnienie doskonałej obsługi Klienta, współpraca z zespołem w zakresie sprzedaży produktów oraz dbanie o czystość i bezpieczeństwo stacji.\n\nGłówne obowiązki:\n\nobsługa Klienta zgodnie ze standardami firmy,\nsprzedaż produktów i usług Shell,\nbudowanie pozytywnego wizerunku stacji,\nprace porządkowe,\nobsługa kasy fiskalnej,\ndbanie o odpowiednią ekspozycję towarów,\nosiąganie celów sprzedażowych.\n\n \n\nOd kandydatów oczekujemy:\n\nentuzjazmu i pozytywnego nastawienia,\numiejętności pracy w zespole,\nżyczliwego podejścia do współpracowników i Klientów,\nzaangażowania i motywacji do pracy,\ngotowości do pracy zmianowej oraz w weekendy,\ndoświadczenia na podobnym stanowisku.\n\n \n\nOferujemy:\n\nelastyczny czas pracy,\nzatrudnienie w pełnym wymiarze godzin,\nmożliwość podnoszenia kwalifikacji dzięki atrakcyjnemu systemowi szkoleń,\nstabilne zatrudnienie i umowę o pracę,\nkartę MultiSport,\nzniżkę 40% na wybrane produkty Shell,\natrakcyjny system premii i nagród.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Sprzedawca - sklep spożywczy Pass, gm. Błonie",
        "category": "olx",
        "phone": "48509788999",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Przyjmę osobę do pracy w sklepie spożywczym na pełny etat, lokalizacja Pass, gmina Błonie.\n\nPraca zmianowa, wolne niedziele i święta.\n\nMiła atmosfera, zgrany zespół. Zapraszamy.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Zatrudnię Sprzedawczynię do Sklepu Spożywczego w Ożarowie Maz.",
        "category": "olx",
        "phone": "608225445",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię panią do Sklepu Spożywczego\n\nOferujemy:\n\n• natychmiastowe zatrudnienie,\n\n• umowę o pracę – pełen etat lub pół etatu\n\nrodzinną atmosferę\n\n• atrakcyjne wynagrodzenie, wypłacane tygodniówki\n\n• praca w młodym i pełnym entuzjazmu zespole,\n\nDo obowiązków należeć będzie:\n\n• obsługa kasy fiskalnej\n\n• odpowiedzialna obsługa klientów,\n\nDoświadczenie nie jest wymagane.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Zatrudnimy do pracy",
        "category": "olx",
        "phone": "600059078",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy energiczną, komunikatywną Panią do pracy w sklepie odziezowym. Do obowiązków będzie należała obsługa klienta, wykładanie towaru, przygotowanie towarów do wysyłki oraz praca w sklepie internetowym, a także dbanie o czystość i wizerunek firmy. Oferujemy pracę w miłym zespole i możliwość rozwoju. Prosimy o wysyłanie CV  ze zdjeciem (tylko ze zdjęciem będą brane pod uwage).",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Pracownik z doświadczeniem w Żabce",
        "category": "olx",
        "phone": "513656557",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Masz doświadczenie w Żabce? Mamy dla Ciebie pracę w Grodzisku Maz. Poszukujemy  osób do pracy w tygodniu lub na same weekendy. \nJesteś zainteresowany/a, prześlij nam swoje CV lub umówmy się na spotkanie.\n513656557",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Praca w sklepie spożywczym",
        "category": "olx",
        "phone": "601889265",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Praca w sklepie spożywczym przeważnie pierwsza zmiana ale też czasami będzie druga lub środek \nPraca w weekendy\nJeden weekend w miesiącu wolny",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "kasjer sprzedawca",
        "category": "olx",
        "phone": "0486615952",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy Kasjerów w sklepie TOP MARKET\n\nOferujemy:\n\n- pracę na pełny etat w oparciu o umowę o pracę \n\n- stałe wysokie zarobki połączone z systemem premiowym\n\n- możliwości awansu\n\n- miłą atmosferę w pracy\n\nAdministratorem danych jest EWMAJ Jędrzejczyk i Spółka Sp. J. z siedzibą w Chynowie (ul. Wolska 7, 05-650 Chynów). Dane przetwarzane będą w związku z prowadzoną rekrutacją, a w przypadku wyrażenia przez Panią/Pana wyraźnej i dobrowolnej zgody także dla potrzeb przyszłych rekrutacji. Ma Pani/Pan prawo do wglądu do danych, ich poprawiania lub usunięcia. Żądanie usunięcia danych oznacza rezygnację z dalszego udziału w procesie rekrutacji i spowoduje niezwłoczne usunięcie Pani/Pana danych. Podanie danych w zakresie określonym przepisami ustawy z dnia 26 czerwca 1974 r. Kodeks pracy oraz aktów wykonawczych jest dobrowolne, ale konieczne do przeprowadzenia rekrutacji. Podanie dodatkowych danych osobowych jest dobrowolne i wymaga Pani/Pana wyraźnej zgody.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Zatrudnię ekspedientkę do pracy w sklepie spożywczym",
        "category": "olx",
        "phone": "725873441",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię ekspedientke do pracy w sklepie spożywczym w Ożarowie Mazowieckim, praca na pełny etat,  dwie zmiany, umowa o pracę. \nProszę o kontakt telefoniczny \n533 566 477 lub 725 873 441",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Praca Empik Skorosze",
        "category": "olx",
        "phone": "513767523",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Cześć,\n\nposzukuję chętnych osób do pracy w Empiku na Skoroszach. Do obowiązków należało będzie dbanie o wygląd salonu, rozkładanie towaru i przede wszystkim praca z Klientem oraz obsługa kasy. Jeśli jesteś osobą otwartą i kontaktową - zapraszam. Praca zmianowa, najczęściej 7-14 lub 14-21, czasami tzw. \"środki\", ewentualnie praca tylko w weekendy. Pracujemy w młodym, zgranym zespole. Nie musisz mieć doświadczenia, wszystkiego się nauczysz.\n\nZapraszam do kontaktu, najlepiej SMS.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Praca na Stacji Paliw Orlen",
        "category": "olx",
        "phone": "536390268",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Stacja Paliw PKN Orlen nr 4509 w miejscowości Przeszkoda poszukuje Pracownika na stanowisko Obsługi Klienta \n\nSystem zmianowy\nDzień 7-19\nNoc 19-7\n\nWymagania:\n\nUczciwość\n\nKultura osobista\n\nZaangażowanie i chęci do pracy\n\nKsiążeczka Sanitarno-Epidemiologiczna lub gotowość do jej wyrobienia\n\nObowiązki:\n\nObsługa klientów zgodnie ze standardem PKN Orlen\n\nUtrzymywanie czystości na stacji\n\nWykładanie towaru zgodnie ze standardami\n\nPrzygotowywanie przekąsek z oferty Stop Cafe\n\nOferujemy: \n\nElastyczny grafik dostosowany do dyspozycyjności\n\nStabilne zatrudnienie\n\nMożliwość rozwoju opartego na standardach PKN Orlen\n\nSzkolenie z zakresu obsługi i systemu zgodnie z wytycznymi PKN Orlen \n\nStudent/ uczeń do 26 r. ż 18,30 / h netto",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Kasjer/Sprzedawca sklep ogólnospożywczy Pruszków",
        "category": "olx",
        "phone": "605294474",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam,\n\n   Poszukujemy kasjera/kasjerki do pracy w sklepie ogólnospożywczym w Pruszkowie przy ulicy Ceramicznej 16, po więcej informacji proszę dzwonić pod numer 605294474.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Sprzedawca na Stacji Paliw Lotos MOP Brwinów Południ",
        "category": "olx",
        "phone": "504378096",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Do stacji Lotos MOP Brwinów Południe poszukuję osób na stanowisko sprzedawca/kasjer.\n\nOCZEKIWANIA WOBEC KANDYDATÓW:\n\notwartość\npozytywne nastawienie\numiejętność pracy w zespole\nkomunikatywność\nzaangażowanie w wykonywanie swoich obowiązków\nżyczliwego podejścia do Klientów i współpracowników\ngotowości do pracy zmianowej oraz w weekendy\nw przypadku aplikowania na Asystenta Kierownika, warunkiem koniecznym jest doświadczenie w pracy na Stacji Paliw\n\nZAKRES OBOWIĄZKÓW:\n\nobsługa Klienta zgodnie ze standardami firmy,\nsprzedaż produktów i usług\nbudowanie pozytywnego wizerunku stacji,\nprace porządkowe,\nobsługa kasy fiskalnej,\ndbanie o odpowiednią ekspozycję towarów,\nosiąganie celów sprzedażowych.\n\nPoszukujemy osób poważnie traktujących swoje obowiązki. Mile widziani studenci studiów zaocznych.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Kasjer-sprzedawca/Stacja Paliw BP, Radziejowice",
        "category": "olx",
        "phone": "534179009",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Nie masz jeszcze doświadczenia zawodowego? Szukasz pracy w miłej atmosferze? Interesuję Cię elastyczny czas pracy? Jeśli tak, ZADZWOŃ !\n\nPraca polega na;\n\nobsłudze klienta według standardów BP\ndbaniu o czystość (sprzątanie obiektu stacji paliw)\npozytywnym podejściu do klienta\n\nOferta jest kierowana do osób nastawionych na dłuższą współpracę (praca stała lub dla studentów trybu zaocznego).\n\nCzekam na Twój telefon !",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Kasjer/sprzedawca sklep spożywczy sieci LEWIATAN",
        "category": "olx",
        "phone": "506186456",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Praca w nowym sklepie znanej marki Lewiatan poszukuje osób chętnych do pracy w sklepie na stanowisko: kasjer-sprzedawca dział spożywczy oraz wędliniarski w Ożarowie Mazowieckim. Oferujemy: - zatrudnienie w oparciu o umowę o pracę - terminowe wynagrodzenie - elastyczny grafik - szkolenie kasjerskie dla osób bez doświadczenia - miłą i przyjazną atmosferę - możliwość rozwoju Wymagania: - książeczka do celów sanitarno-epidemiologicznych - praca w systemie dwuzmianowym - dyspozycyjność - umiejętność pracy w zespole - odpowiedzialność i uczciwość Zainteresowane osoby proszone są o wysłanie CV drogą mailową.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Pęcice Małe - Sprzedawca - Zakłady Mięsne Łuków S.A.",
        "category": "olx",
        "phone": "667984109",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zakłady Mięsne ŁUKÓW S.A., jeden z wiodących w branży producentów mięsa wieprzowego, wołowego, wędlin oraz konserw mięsnych, poszukuje pracowników na stanowisko:\n\nSprzedawca\n\nMiejsce pracy: Pęcice Małe k/Pruszkowa\n\nPoszukujemy osób:\n\n• otwartych i komunikatywnych\n\n• energicznych i samodzielnych\n\n• lubiących pracę w handlu\n\n• zaangażowanych i chętnych do pracy w zespole\n\nWymagania:\n\n• książeczka do celów sanitarno-epidemiologicznych (lub gotowość do jej wyrobienia)\n\n• mile widziane doświadczenie w pracy na stanowisku mięsno-wędliniarskim\n\nOferujemy:\n\n• umowę o pracę na pełen etat\n\n• wynagrodzenie składające się z podstawy wynagrodzenia + prowizji sprzedażowej\n\n• karta na zakupy w sieci sklepów firmowych\n\n• nagrody dla najlepszych sprzedawców\n\n• miłą i przyjazną atmosferę w pracy\n\n• zatrudnienie w dużym, prężnie działającym przedsiębiorstwie o ugruntowanej pozycji na rynku\n\n• szkolenie wstępne\n\n• ubezpieczenie grupowe na korzystnych warunkach\n\nProsimy o zawarcie w CV klauzuli: „Wyrażam zgodę na przetwarzanie danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji prowadzonego przez Zakłady Mięsne ŁUKÓW S.A. ul. Przemysłowa 15, 21-400 Łuków zgodnie z ustawą z dnia 29 sierpnia 1997 r. o ochronie danych osobowych (t.j. Dz. U. z 2016 r., poz. 922)”.\n\n \n\nJednocześnie wyrażam zgodę na przetwarzanie przez ogłoszeniodawcę moich danych osobowych na potrzeby przyszłych rekrutacji.\n\n \n\nInformujemy, że Administratorem danych Zakłady Mięsne ŁUKÓW S.A. ul. Przemysłowa 15, 21-400 Łuków jest Dane zbierane są dla potrzeb rekrutacji. Ma Pani/Pan prawo dostępu do treści swoich danych oraz ich poprawiania. Podanie danych w zakresie określonym przepisami ustawy z dnia 26 czerwca 1974 r. Kodeks pracy oraz aktów wykonawczych jest obowiązkowe. Podanie dodatkowych danych osobowych jest dobrowolne.\n\nOdpowiemy wyłącznie na wybrane oferty.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Zatrudnię sprzedawcę do sklepu spożywczego Błonie, Wyczółki",
        "category": "olx",
        "phone": "889605609",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię sprzedawcę do sklepu spożywczego w Błoniu lub w wyczółkach koło Sochaczewa na pełen etat lub jego część. \nElastyczne godziny pracy. Proszę o kontakt telefoniczny lub przesłanie aplikacji poprzez OLX.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Praca w sklepie z grami planszowymi i bitewnymi",
        "category": "olx",
        "phone": "511696363",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "MERFOLK SZUKA PRACOWNIKA\n\nPoszukujemy osoby na stanowisko – Sprzedawca.\n\nPraca w pełnym wymiarze godzin na umowę o pracę.\n\nZakres obowiązków:\n\n- obsługa klienta, prowadzenie sprzedaży bezpośredniej\n\n- obsługa systemu kasowego i magazynowego, wystawianie dokumentów kasowych\n\n- doradztwo w zakresie produktów z oferty\n\n- dbanie o estetykę i porządek w miejscu pracy oraz ekspozycję towarów w sklepie\n\n- obsługa zamówień internetowych\n\n- obsługa wydarzeń w sklepie\n\n- obsługa mediów społecznościowych\n\n- inne czynności związane z powyższymi zadaniami\n\nWymagania:\n\n- komunikatywność i umiejętność nawiązywania kontaktów\n\n- staranność i sumienność\n\nMile widziane:\n\n- znajomość gier bitewnych/planszowych/karcianych\n\n- prawo jazdy kategorii B\n\n- doświadczenie w pracy na podobnym stanowisku (niekoniecznie w tej samej branży)\n\n- znajomość języka angielskiego w stopniu komunikatywnym\n\n- samodzielność i inicjatywa\n\nOferujemy:\n\n- zatrudnienie w oparciu o umowę o pracę\n\n- pracę w przyjaznej atmosferze przy ulubionym hobby\n\n- atrakcyjne rabaty na gry\n\n- pracę w godzinach popołudniowych z możliwością częściowego dopasowania grafiku\n\nZatrudnienie przez pierwsze 3 miesiące w oparciu o umowę na okres próbny, z wynagrodzeniem 2800 PLN brutto miesięcznie (2061,67 zł netto). \n\nPóźniej, jeśli obydwie strony umowy będą zadowolone z współpracy, zaproponujemy umowę o pracę na czas nieokreślony i możliwość renegocjacji warunków.\n\nProsimy o dopisanie w CV klauzuli: \"Wyrażam zgodę na przetwarzanie moich danych osobowych przez Sklep Merfolk. w celu prowadzenia rekrutacji na stanowisko Sprzedawcy\"\n\nJednocześnie przypominamy, że jeśli wysyłałeś nam CV już wcześniej to m .in. z uwagi na RODO usunęliśmy je bezpowrotnie, gdyż możemy przechowywać je tylko w okresach kiedy prowadzimy rekrutację.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Praca w Ursusie. Piekarnia Cukiernia SPC",
        "category": "olx",
        "phone": "882707090",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Sklep firmowy piekarni cukierni SPC (Spółdzielni Piekarsko-Ciastkarskiej) w Ursusie poszukuje pracownika. \n\nWymiar etatu: 1/2, 3/4 lub cały etat.\n\nOferujemy: \n\n- umowę o pracę\n\n- stabilność zatrudnienia\n\n- pracę w młodym, zgranym zespole\n\n- zniżkę na zakupy w sklepie\n\nOczekujemy: \n\n- pozytywnej energii\n\n- zaangażowania\n\n- uczciwości\n\n- pracowitości\n\n- dyspozycyjności w weekendy\n\n- książeczki sanitarno-epidemiologicznej\n\nJeżeli jesteś zainteresowana/ny naszą ofertą wyślij do nas Twoje CV wraz ze zdjęciem.\n\nProsimy o dopisanie następującej klauzuli: \"Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji zgodnie z ustawą z dnia 29 sierpnia 1997 r. o ochronie danych osobowych (Dz. U. z 2002 r. Nr 101, poz. 926, ze zm.).\"",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Pracownik sklepu Carrefour ul. 1 Maja 43 Żyrardów",
        "category": "olx",
        "phone": "505086631",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy dyspozycyjnych osób do pracy na poniższe działy:\n\nPracownik działu kas:\n\n-STUDENT/UCZEŃ-19,60 zł/h\n\n-OSOBA BEZROBOTNA PONIŻEJ 26r życia -15,20 zł/h\n\n-OSOBA BEZROBOTNA POWYŻEJ 26r życia - 14,30 zł/h\n\nPracownik hali (wykładanie towaru):\n\n-STUDENT/UCZEŃ-18,90 zł/h\n\n-OSOBA BEZROBOTNA PONIŻEJ 26r życia -15,00 zł/h\n\n-OSOBA BEZROBOTNA POWYŻEJ 26r życia - 14,10 zł/h\n\nObsługa stoiska wędliny/sery:\n\n-STUDENT/UCZEŃ - 20zł netto / h\n\n-OSOBA BEZROBOTNA PONIŻEJ 26r ŻYCIA - 15,50zł/h\n\n-OSOBA BEZROBOTNA POWYŻEJ 26r ŻYCIA - 14,50zł/h\n\nWYMAGAMY:\n\nPełnoletność\nDyspozycyjność pracy w systemie dwuzmianowym 6:00-14:00 / 14:00-22:00\n\nOFERUJEMY:\n\nPracę w miłej atmosferze\nMożliwość otrzymywania zaliczek CO TYDZIEŃ !\nStawkę godzinową, wymienioną na początku ogłoszenia\nUmowę zlecenie\n\nZaineresowane osoby zapraszam do kontaktu poprzez portal OLX bądź sms o treści PRACA ŻYRARDÓW (wybrany dział) np. PRACA ŻYRARDÓW DZIAŁ KASY: 505086631\n\nPS. OBCOKRAJOWCY – WYMGANA WIZA 09 LUB 18",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Zatrudnię sprzedawcę do sklepu mięsnego w Grodzisku Mazowieckim",
        "category": "olx",
        "phone": "514059209",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zakład Mięsny 'Wierzejki' zatrudni pracownika do sklepu mięsnego w Grodzisku Mazowieckim..Zatrudnimy osoby -w każdym wieku -studentów -osoby z orzeczeniem o niepełnosprawności .Naszym pracownikom oferujemy: - zatrudnienie w pełnym wymiarze czasu pracy - umowę o pracę, - możliwość zatrudnienia w niepełnym wymiarze pracy umowę zlecenie- wynagrodzenie od 2.500 do ręki - wynagrodzenie wypłacane zawsze na czas ,-dodatkowe premie ,- szkolenia ,- bony świąteczne - stabilność zatrudnienia, - elastyczny czas pracy - przyjazną atmosferę pracy - możliwość awansu Do obowiązków należy :przyjęcie towaru i wyłożenie go do lady z zachowaniem zasady FIF, - kontrola terminów przydatności, - utrzymanie czystości na stanowisku pracy - obsługa kasy fiskalnej - krojenie na krajalnicy -praca w systemie zmianowym Wymagania : - odpowiedzialność - komunikatywność ,- badania do celów sanitarni-epidemiologicznych kontakt pod nr.telefonu.Ewa 514 059 209 KLAUZULA INFORMACYJNA DLA KANDYDATÓW DO PRACYzęść informacyjnaZgodnie zart. 13 ogólnego rozporządzenia o ochronie danych osobowych z dnia 27 kwietnia 2016 r. (Dz. Urz. UE L 119 z 04.05.2016) informuję, iż:1) Administratorem Pani/Pana danych osobowych jest Zakład Mięsny \"Wierzejki\", z siedzibą w Płudach 21, 21-404 Trzebieszów,2) Kontakt z Inspektorem Ochrony Danych - iodo(,ałpa)wierzejki.pl3) Pani/Pana dane osobowe przetwarzane będą dla potrzeb aktualnej rekrutacji - na podstawie Art. 6 ust. 1 lit. a ogólnego rozporządzenia o ochronie danych osobowych z dnia 27 kwietnia 2016 r. oraz Kodeksu Pracy Aplikuj Apl",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Mechanik/Serwisant",
        "category": "olx",
        "phone": "515416378",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy osobę/osoby na stanowisko mechanika.Oferujemy dogodne warunki zatrudnia w tym umowę o pracę.Miejsce pracy Sękocin Nowy.\n\nOd kandydata/kandydatów oczekujemy rzetelnego podejścia do pracy,posiadania wiedzy z zakresu mechaniki.\n\nZapraszamy do kontaktu:515416378",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Zatrudnię POMOCNIKA Mechanika samochodowego",
        "category": "olx",
        "phone": "48501399415",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Ducato Service S.C. & Motrio poszukuje pracowników na stanowisko: POMOCNIK MECHANIKA !\n\nWymagania i oczekiwania:\n\nUmiejętność pracy w zespole,\n\nchęć rozwoju zawodowego,\n\nuczciwość i pracowitość.\n\nProszę wyłącznie o kontakt telefoniczny 501399415  i osoby zdecydowane \n\n.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Poszukiwany samodzielny Mechanik samochodowy Bajron Service",
        "category": "olx",
        "phone": "604977637",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma Auto-Service Bajron,zatrudni\nmechanika samochodowego do naprawy samochodów ciężarowych,naczep oraz pojazdów dostawczych.\n\n-atrakcyjne warunki zatrudnienia\n-wysokie zarobki\n-dobre warunki socjalne(standardy unijne)\n-sympatyczna załoga\n\nAuto-Service Bajron\n05-870 Błonie\nNowa Wieś 9\nwww.bajron.pl",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Staż, Praktyka, serwis urządzeń",
        "category": "olx",
        "phone": "223506946",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Grupa KN, lider produkcji technologii powierzchniowych systemów napowietrzania, mieszania oraz wyposażenia oczyszczalni ścieków na polskim rynku poszukuje:\n\nSerwisanta urządzeń - praktyka, staż\n\nPoszukujemy osoby,\n\nktóra będzie wspomagać działania serwisowe urządzeń mechanicznych służących do oczyszczania wody i ścieków, prace przy produkcji,\n\nIdealny kandydat to uczeń/student/absolwent uczelni/szkoły technicznej dynamiczny, zainteresowany zdobyciem umiejętności praktycznych.\n\nWymagania: obsługa komputera, wykształcenie mechaniczne/techniczne lub doświadczenie warsztatowe/ serwisowe maszyn.\n\nOferujemy:\n\n- możliwość zdobycia szerokiego doświadczenia w firmie o ugruntowanej pozycji na rynku, projektującej i produkującej własne rozwiązania (ponad 11 lat na rynku);\n\n- wynagrodzenie na stażu, bądź wynagrodzenie na praktykach;\n\n- możliwość zostania u nas na stałe\n\n- możliwość pracy kreatywnej i twórczej;\n\n- możliwość korzystania ze strefy relaksu i najnowszej konsoli Xbox Series X 1TB, dostęp do ponad 100 gier (Xbox Game Pass Ultimate), bardzo szybki internet (światłowód 1000 Mbit/s)\n\n- bezpłatne obiady\n\n- lokalizacja: 800m od węzła autostrady A2 Pruszków\n\nZgłoszenia CV i koniecznie list motywacyjny prosimy przesyłać na:\n\ne-mail z dopiskiem \"Staż - Serwis urządzeń\"",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Mechanik samochodowy",
        "category": "olx",
        "phone": "660333982",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy mechaników do nowoczesnego serwisu samochodowego.\n\n Wymagania: \n\n- minimum 3 lata doświadczenia na podobnym stanowisku.\n\n- samodzielność i umiejętność pracy w zespole.\n\n- dokładność i zaangażowanie w wykonywane obowiązki.\n\n- umiejętność korzystania z programów diagnostycznych.\n\n- dbanie o powierzone mienie oraz czystość i porządek na stanowisku pracy.\n\n Oferujemy:\n\n- atrakcyjny system wynagrodzenia.\n\n- możliwość rozwoju zawodowego.\n\n- umowę o pracę i stabilne zatrudnienie w firmie o ugruntowanej pozycji na rynku.\n\n- nowoczesne narzędzia pracy.\n\n- przyjazną atmosferę współpracy.\n\n- warunki socjalne na wysokim poziomie.\n\nKandydatów prosimy o przesyłanie CV lub kontakt telefoniczny 660 333 982.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Mechanik samochodowy Pilne!",
        "category": "olx",
        "phone": "888122952",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Nowoczesny warsztat zatrudni samodzielnego mechanika samochodowego z doświadczeniem, atrakcyjne warunki pracy i płacy. \n\nOsoby zainteresowane prosimy o kontakt pod numer telefonu 888 122 952 lub przesłanie CV.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Zbrojarz w ASO Renault",
        "category": "olx",
        "phone": "723188862",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma „KRUBAGROUP” poszukuje pracownika na stanowisko - mechanik pojazdów samochodowych z doświadczeniem w zawodzie w marce Renault.\n\nZainteresowanych prosimy o składanie CV lub kontakt telefoniczny 533820312\n\nOd kandydatów oczekujemy :\n\n• doświadczenia w wykonywanym zawodzie\n\n• prawo jazdy kat.B\n\n• staranności i zaangażowania do pracy,\n\n• dbałości o powierzone narzędzia i mienie,\n\n• umiejętności dobrej organizacji pracy,\n\nOferujemy:\n\n• atrakcyjne wynagrodzenie adekwatne do posiadanych umiejętności i zaangażowania\n\nw pracę,\n\n• godziny pracy zgodne ze stałym dwuzmianowym grafikiem,\n\n• wyposażone stanowisko pracy, dostęp do wysokiej klasy profesjonalnych narzędzi,\n\n• umowę o pracę, stabilne warunki zatrudnienia, odzież ochronną,\n\n• rozwój zawodowy,\n\n• pracę w miłej atmosferze ze zgranym zespołem,\n\n \n\nProsimy o dopisanie klauzuli „Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji/rekrutacji zgodnie z ustawą z dn. 29.08.97r. o Ochronie Praw Osobowych Dz. Ust. Nr 133 poz. 883” ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Mechanik PORSCHE BMW AUDI samochodowy Osa Motors",
        "category": "olx",
        "phone": "505998363",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Osa Motors serwis samochodów marki Porsche Bmw Audi poszukuje osobę do Pracy na stanowisku Mechanik Samochodowy.\n\nZajmujemy się serwisem oraz modyfikacjami samochodów marki PORSCHE BMW AUDI\n\nZakres obowiązków:\n\nobsługa i naprawy samochodów osobowych\nnaprawy i modyfikacje silników i skrzyń biegów\ntuning mechaniczny\nobsługa i naprawa instalacji elektrycznych\npraca w zespole\n\nWymagania:\n\nbrak nałogów typu picie i palenie, inne do rozważenia\numiejętność myślenia i pracy w zespole\n\nMile widziane doświadczenie w obsłudze samochodów marki PORSCHE, BMW i AUDI oraz w naprawach silników.\n\nNajważniejsze jest zaangażowanie oraz chęć do pracy i uczenia się nowych rzeczy.\n\nChętnych ZAPRASZAMY na spotkanie !!!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Dam pracę w serwis kół z zamieszkaniem",
        "category": "olx",
        "phone": "692692743",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam Zatrudnię wulkanizatora do wymiany opon i mechanika i lakiernika i Spawacza\nsamochodowego . Z zamieszkaniem . oferujemy: - stałą pracę - wynagrodzenie płatne co tydzień - umowę - atrakcyjne warunki pracy Praca od zaraz. Tele 500896442 Tele 692692743",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "POMOCNIK MECHANIKA praca dla mechanika Warszawa Ursus",
        "category": "olx",
        "phone": "512051516",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukuję pomocników mechanika do pracy w serwisie samochodowym na terenie Warszawy Ursus. \n\nOczekuje podstawowych umiejętności np. Wymiana oleju czy klocków hamulcowych. Reszty nauczy praktyka.\n\nMile widziane prawo jazdy ale nie jest to warunek konieczny",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Mechanik samochodowy",
        "category": "olx",
        "phone": "514520046",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy na stałe w serwisie samochodowym  na stanowisko mechanik samochodowy.\n\nZapraszam do kontaktu praca od zaraz\n\nPraca samochody osobowe \n\nPoniedziałek - Piątek 8-17, soboty do ustalenia max dwie w msc. do 13h\n\nPraca z doświadczoną kadra w miłej atmosferze",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Mechanik/serwisant sprzętu komunalnego i rolniczego",
        "category": "olx",
        "phone": "227963340",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Przedsiębiorstwo „Rolmech” sp. z o. o. prowadzi działalność w zakresie sprzedaży i serwisu ciągników i maszyn rolniczych i komunalnych.\n\n \n\nOd 1989r działamy i rozwijamy sieć dystrybucji na terenie centralnej Polski.\n\n \n\nObecnie poszukujemy kandydatów na stanowisko: Mechanik maszyn rolniczych.\n\nU nas otrzymasz:\n\n·        Umowę o pracę od pierwszego dnia zatrudnienia\n\n·        Atrakcyjne wynagrodzenie uzależnione od Twojej efektywności i rosnące wraz ze stażem pracy\n\n·        Narzędzia do pracy\n\n·        Możliwość poznania i rozwijania się w ciekawej i życzliwej branży\n\nMile widziane:\n\n·        Znajomość mechaniki maszyn\n\n·        Znajomość branży rolniczej\n\n·        Doświadczenie na podobnym stanowisku\n\nKonieczne:\n\n·        Chęć do pracy\n\n·        Prawo jazdy kat. B\n\nTwoja praca polegać będzie na:\n\n·        Serwisowaniu maszyn rolniczych i sprzętu komunalnego\n\n \n\nJeśli chcesz podjąć nasze wyzwanie możesz:\n\n·        Zadzwonić: 22 796 33 40\n\n·        Przyjechać: 05-870 Błonie, Sochaczewska 64C\n\n·        Kliknąć przycisk aplikowania i postępować zgodnie z instrukcjami\n\nProsimy o zamieszczenie klauzuli: Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z ustawą z dnia 10 maja 2018 roku o ochronie danych osobowych (Dz. Ustaw z 2018, poz. 1000) oraz zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO)).",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Blacharz lub pomocnik blacharza",
        "category": "olx",
        "phone": "515188274",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Serwis o ugruntowanej pozycji i dobrej renomie poszukuje pracownika na stanowisko blacharz lub pomocnik blacharza.\n\nZ czasem możliwość nauki napraw bez lakierowania PDR.\n\nZainteresowane osoby prosimy o wysyłanie CV poprzez OLX lub kontakt telefoniczny.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Pomocnik Mechanika",
        "category": "olx",
        "phone": "797339051",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię pomocnika mechanika pojazdów samochodowych - praca przede wszystkim przy samochodach ciężarowych. Mila widziana umiejętność spawania. Wynagrodzenie w przedziale 18-25 zł/godz. Możliwość zakwaterowania gratis. Proszę tylko i wyłącznie o KONTAKT TELEFONICZNY! Nie odpowiadam na SMSY I wiadomości na OLX. tel. 797 339 051",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Kierowca z podstawową znajomością mechaniki",
        "category": "olx",
        "phone": "604144262",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy kierowcy z podstawową wiedzą o mechanice samochodowej,\n\nPracownik musi mieszkać po lewobrzeżnej stronie Wisły w warszawie.\n\nPensja od 3200zl do 4700zl na rękę.\n\nProszę dzwonić na numer podany niżej.\n\n604 144 262\n\nJeżeli nikt nie odbiera na wyżej wymieniony numer proszę ponownie zadzwonić.\n\nChętnego i pracowitego kierowce przyuczymy.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Mechanik samochodowy | Bez doświadczenia | Chętny do nauki",
        "category": "olx",
        "phone": "733397433",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy osoby na stanowisko mechanika samochodowego do serwisu dostawczo-ciężarowego. Chętnie zatrudnimy osobę bez doświadczenia, która będzie chciała się uczyć zawodu. Będziemy chcieli taką osobę wyszkolić od A do Z (kursy, szkolenia i praca z doświadczonymi mechanikami). \n\nMIEJSCE PRACY PRUSZKÓW\n\nOferujemy:\n\n-umowę o pracę\n\n-stabilizację\n\n-szkolenia i kursy\n\n-samodzielne stanowisko pracy\n\n-serwis pojazdów firmowych (ciągniki Mercedes Actros)\n\n-brak nudy\n\n-duże możliwości rozwoju i zdobycia doświadczenia\n\nOczekujemy:\n\n-Chęci do nauki\n\n-Chęci do pracy\n\n-Kultury osobistej\n\n-Pozytywnego podejścia do życia :)\n\n-Kreatywności\n\n-Znajomość mechaniki pojazdowej będzie dodatkowym atutem\n\nWynagrodzenie ustalane indywidualnie na spotkaniu rekrutacyjnym.\n\nMIEJSCE PRACY PRUSZKÓW\n\nOsoby zainteresowane prosimy o przesłanie CV za pośrednictwem po formularza OLX lub pod numerem tel. +48 733 397 433\n\n-",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Mechanik samochodowy, praca w zgranym zespole",
        "category": "olx",
        "phone": "604787307",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Eko-Bodex FUH\n\nBogdan Stegienko\n\nPoszukuje osoby na stanowisko:\n\nMECHANIKA SAMOCHODOWEGO\n\nMiejsce pracy – Wiskitki\n\nWymagania\n\nCzynne prawo jazdy kat. B;\nKomunikatywność i zaangażowanie w pracę;\nUmiejętność pracy w zespole, dobra organizacja czasu pracy;\nŁatwość w nawiązywaniu kontaktów z klientem;\nMinimum roczne doświadczenie w zawodzie;\nOdpowiedzialność, wydajność i rzetelność.\n\nZadania\n\nSamodzielna naprawa pojazdów samochodowych;\nDbałość o wysoką jakość wykonywanej pracy;\nChęć rozwoju umiejętności związanych z diagnostyką oraz naprawą pojazdów;\nDbałość o własne stanowisko pracy oraz wizerunek firmy.\n\nOferujemy\n\nUmowa o pracę;\nAtrakcyjne wynagrodzenie i system bonusowy;\nMożliwość rozwoju zawodowego;\nPracę w doświadczonym zespole, w firmie o ugruntowanej pozycji na rynku;\nStabilne warunki zatrudnienia;\nWłasne stanowisko pracy i wózek narzędziowy;\nPracę od poniedziałku do piątku.\n\nZainteresowanych prosimy o kontakt pod numerem telefonu 604-787-307, lub w siedzibie firmy przy ul. Armii Krajowej 35, 96-315 Wiskitki.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Pomocnik lakiernika, lakiernik",
        "category": "olx",
        "phone": "609606529",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię samodzielnego pomocnika lakiernika, lakiernika samochodowego tel.609606529",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Lakiernika ,mechanika , zbrojarza lub pomocnika samochodoweg Nadarzyn",
        "category": "olx",
        "phone": "603855562",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Lakiernika ,mechanika , zbrojarza lub pomocnika samochodowego. Zakwaterowanie. Dobre warunki finansowe. Weekendy wolne. Zainteresowanych proszę o kontakt telefoniczny 603-855-562 Nadarzyn koło Warszawy.\n\nЛакировщик, помощники. Размещение. Хорошие финансовые условия. Выходные. Если вы заинтересованы, свяжитесь с нами по телефону 603-855-562 Надажин недалеко от Варшавы.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Pilnie zatrudnię mechanika samochodowego- Piastów",
        "category": "olx",
        "phone": "513801564",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię mechanika samochodowego. Praca na pełen etat, od zaraz. \nMiejsce pracy: Piastów \n\nProszę o kontakt pod nr : 513 801 564",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "zatrudnię mechanika pojazdów ciężarowych i dostawczych",
        "category": "olx",
        "phone": "602228126",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "zatrudnię mechanika, co robimy i jak wyglądamy zapraszam na stronę www.trucksupport.pl\n\n602 228 126\n\npraca w godzinach 8.00 - 16.00 od poniedziałku do piątku.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Mechanik autobusowy w Warszawie",
        "category": "olx",
        "phone": "606261469",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Mechanik autobusowy\n\nWarszawa, mazowieckie\n\nOpis stanowiska pracy\n\nMiejsce pracy: Mobilis Sp. z o.o. Warszawa, ul. Posag 7 Panien 8\n\n \n\nOpis stanowiska:\n\n·            wykonanie prac naprawczych w warsztacie oraz usuwanie usterek autobusów na trasie w ramach pogotowia technicznego,\n\n·            kontrola stanu części mechanicznych,\n\n·            naprawa części zamiennych i zespołów,\n\n·            dbałość o stan techniczny autobusów.\n\n \n\nWymagania:\n\n·            minimum roczne doświadczenie w zakresie napraw pojazdów mechanicznych (ciężarówki lub autobusy),\n\n·            wykształcenie minimum zawodowe mechanicznie ,\n\n·            wiedza z zakresu mechaniki;\n\n·            zaangażowanie i dyspozycyjność;\n\n·            prawo jazdy kategorii B;\n\n·            dodatkowym atutem będzie znajomość zagadnień elektrycznych/elektronicznych, układów ogrzewania i klimatyzacji oraz urządzeń diagnostycznych\n\n \n\nOferujemy:\n\n·            zatrudnienie na podstawie umowy o pracę,\n\n·            pełną wyzwań pracę w dynamicznie rozwijającej się firmie,\n\n·            wynagrodzenie adekwatne do kompetencji oraz powierzonych zadań,\n\n·            możliwość rozwoju zawodowego\n\n·            niezbędne narzędzia pracy,\n\n·            świadczenia z ZFŚS,\n\n·            prywatną opiekę medyczną.\n\n·            kartę Miejska na I i II strefę.\n\nMożliwość uzyskania dodatkowych informacji pod numerem tel.: 606 261 469\n\n﻿CV kandydatów nie rozpatrzone w danym procesie rekrutacji są przechowywane przez okres niezbędny na potrzeby kolejnych procesów/etapów rekrutacji. Po tym okresie są usuwane, a dane osobowe kandydatów nie są przetwarzane w żadnym innym celu. Aplikacji nie odsyłamy. Kontaktujemy się jedynie z wybranymi osobami.\n\nOsoby zainteresowane udziałem w kolejnych i podobnych procesach rekrutacji prosimy o zamieszczenie na swoim CV klauzuli o treści: „Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w CV na potrzeby obecnego oraz przyszłych procesów rekrutacji”\n\nAdministratorem danych osobowych jest Mobilis Sp. z o.o. ul. Posag 7 Panien nr 8; 02-495 Warszawa",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "zatrudnię MECHANIKA samochodowego",
        "category": "olx",
        "phone": "534500094",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię MECHANIKA SAMOCHODOWEGO z doświadczeniem.\n\nMiejsce pracy: Błonie.\n\nPełen etat.\n\nPraca od poniedziałku do piątku.\n\nWysokość wynagrodzenia od 3.000 zł do 8.000 zł.\n\nSzczegóły pod nr tel. 534-500-094.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Pomocnik mechanika/ praktykant/ serwisant",
        "category": "olx",
        "phone": "600100837",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma PAK-ROL poszukuje kandydata na stanowisko:  pomocnik mechanika/serwisanta ciągników rolniczych\n\n \n\nGłówne zadania:\n\nserwis i naprawa ciągników rolniczych\n\n \n\nWymagania:\n\nwykształcenie min. zawodowe lub średnie,\n\nuczciwość, samodzielność, dyspozycyjność,\n\nprawo jazdy kat. B\n\n \n\nOferujemy:\n\nzatrudnienie na umowę o pracę w pełnym wymiarze czasu pracy, atrakcyjne wynagrodzenie, uczestnictwo w szkoleniach technicznych i stały rozwój\n\n \n\n \n\nMiejsce i godziny pracy:\n\n05-840 Brwinów, Milęcin 42B\n\ngodziny pracy - 8.00-16.00\n\n \n\n \n\nJeżeli masz jakieś pytanie, nie jesteś pewien czy to praca dla Ciebie ZADZWOŃ 600 100 837 lub 602 216 524 .",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Zatrudnię Pomocnika lub Lakiernika Samochodowego Zakwaterowanie",
        "category": "olx",
        "phone": "518123455",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Praca od zaraz , możliwość zakwaterowania,\n\nWarsztat Samochodowy o specjalizacji napraw powypadkowych samochodów osobowych zatrudni na pełen etat lakIerninka lub pomocnika Lakiernika z doświadczeniem.\n\nGodziny pracy PN-PT 7-16 , oraz co druga Sobota 7-12.\n\nNadarzyn k.Warszawy tel 518123455 ,\n\nPraca od zaraz",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Elektryk Samochodowy / Elektromechanik",
        "category": "olx",
        "phone": "600026692",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma Budokrusz S.A. zatrudni na stanowisko: Elektryk Samochodowy / Elektromechanik\n\nMiejsce pracy: Grodzisk Mazowiecku, ul. Traugutta 44a\n\nTwój zakres obowiązków:\n\n·        Przegląd i naprawa samochodów osobowych i/lub ciężarowych oraz maszyn i urządzeń\n\n·        Diagnozowanie usterek\n\n·        Dbanie o powierzone narzędzia oraz zaplecze techniczne\n\n·        Montaż, kontrola i naprawa układów elektrycznych w samochodach\n\n·        Praca przy urządzeniach odpowiedzialnych za sterowanie, zabezpieczanie i sygnalizację w pojazdach\n\n·        Sprawdzanie prawidłowego działania zapłonu i wszystkich świateł w pojazdach\n\n·        Instalacja wiązek elektrycznych i innych elementów - części systemów elektrycznych np. części służące     do zasilania, sygnalizacji, oświetlenia i zabezpieczania pojazdów\n\nNasze wymagania:\n\n·        Wykształcenie kierunkowe (zawodowe lub techniczne)\n\n·        Umiejętność czytania dokumentacji technicznej\n\n·        Znajomość zagadnień mechaniki samochodowej i mechaniki maszyn oraz elektryki\n\n·        Umiejętność posługiwania się narzędziami diagnostycznymi Star diagnoza, Jaltest\n\n·        Samodzielność\n\n·        Umiejętność pracy w zespole\n\n·        Mile widziane doświadczenie na podobnym stanowisku: elektryk, elektromechanik, elektronik, mechanik, serwisant\n\nTo oferujemy:\n\nStałą, stabilną i ciekawą pracę w firmie o ugruntowanej pozycji rynkowej\nOdpowiednie do stanowiska narzędzia pracy\nBardzo dobre warunki pracy (pomieszczenie ogrzewane, nowoczesny serwis samochodowy, bardzo dobre zaplecze socjalne)\nRóżnorodność wykonywanych czynności\nMożliwość zdobycia i rozwijania nowych umiejętności\nBliska odległość stacji PKP (500 m)\nMożliwość zakwaterowania",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Mechanik autobusów i pojazdów ciężarowych EWT Truck & Trailer",
        "category": "olx",
        "phone": "538699556",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "EWT Truck & Trailer Polska Sp. z o.o.\n\nAutoryzowany partner producenta naczep SCHMITZ CARGOBULL AG poszukuje pracowników na stanowisko:               \n\nMechanik autobusów i pojazdów ciężarowych \n\nMiejsce pracy: Komorniki k. Poznania\n\nDo głównych obowiązków osoby zatrudnionej na tym stanowisku należy: \n\nNaprawy mechaniczne pojazdów ciężarowych i autobusów\nDiagnozowanie usterek\nWykonywanie przeglądów\nWeryfikacja i naprawy układów klimatyzacji\nWeryfikacja i naprawy ogrzewań wodnych i wodno-powietrznych\n\nNasze oczekiwania: \n\nDoświadczenie w naprawie pojazdów ciężarowych i autobusów; ciągników i naczep\nPrawo jazdy kat. B (mile widziane C+E lub D)\nZnajomość programów diagnostycznych\nSumienność, dokładność, obowiązkowość \nMile widziane doświadczenie w zakresie napraw i diagnostyki układów pneumatycznych: KNORR , WABCO, HALDEX \nMile widziana: umiejętności obsługi i diagnostyki agregatów chłodniczych \nDodatkowy atut: znajomości urządzeń chłodniczych w transporcie \n\nW zamian oferujemy: \n\nPracę w renomowanej firmie o stabilnej pozycji na rynku \nZatrudnienie w oparciu o umowę o pracę \nMożliwość dalszego rozwoju\nOpiekę medyczną\nŚwiadczenia ZFŚS\nDostęp do pakietów sportowych \nPreferencyjne warunki ubezpieczenia na życie  \n\nProsimy o zamieszczenie w CV klauzuli: „Wyrażam zgodę na przetwarzanie moich danych osobowych w celu rekrutacji zgodnie z art. 6 ust. 1 lit. a Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (ogólne rozporządzenie o ochronie danych)\".",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Zatrudnię mechanika z doświadczeniem lub do przyuczenia",
        "category": "olx",
        "phone": "502506889",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukuję mechanika do warsztatu od zaraz, najlepiej z doświadczeniem może być także do przyuczenia. \n\nFirma Dan-Car prowadzi usługi w zakresie:\n\nNaprawy samochodów osobowych i dostawczych\nWulkanizacji \nKlimatyzacji\nNapraw blacharskich\nPrzeróbek pod off-road dla Patrol Nissan Y60 i Y61\nWarsztat mieści się w Kozerach Nowych gm. Grodzisk Mazowiecki \n\nZakres obowiązków mechanika lub pomocnika mechanika\n\nnaprawy samochodów osobowych / dostawczych,\nwymiana części zgodnie z wymogami producenta,\nwykonywanie przeglądów okresowych oraz konserwacji,\ndiagnostyka i weryfikacja usterek technicznych,\nobsługa specjalistycznych narzędzi oraz urządzeń warsztatowych,\nobsługa piaskarki,\nmycie i czyszczenie oraz konserwacja części oraz podzespołów,\ndbałość o wysoką jakość wykonywanych prac.\ndbałość o porządek w miejscu pracy.\n\nWymagania na stanowisko mechanik samochodowy to:\n\ndoświadczenie zawodowe na tożsamym stanowisku,\nwiedza techniczna z zakresu napraw pojazdów,\nmile widziana umiejętność spawania,\nznajomość budowy pojazdów samochodowych,\nczynne prawo jazdy kategorii B,\nsamodzielność w działaniu,\numiejętność planowania i dobra organizacja pracy,\nodpowiedzialność i sumienność w wykonywaniu powierzonych zadań,\nduża motywacja do pracy,\nrzetelne podejście do wykonywanych obowiązków.\n\nPraca od poniedziałku do piątku w godz.. od 8.00 do 18.00.\n\nWeekendy wolne.\n\nŚwięta wolne. \n\nSystem premiowy.\n\nPo okresie próbnym możliwość zatrudnienia na stałe. \n\nTel 502506889 - nie odpowiadam na smsy i maile\n\nZdjęcie poglądowe przeróbek off-road (Nasza pasja).",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Pomocnik mechanika",
        "category": "olx",
        "phone": "515154800",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Serwis pojazdów ciężarowych zatrudni:\n\nPomocnika Mechanika\n\nOferujemy:\n\nStałą, stabilną i ciekawą pracę w firmie o ugruntowanej pozycji rynkowej\nBardzo dobre warunki pracy (nowoczesny serwis samochodowy, bardzo dobre zaplecze socjalne)\nNowoczesną flotę pojazdów Mercedes, MAN, Scania, Daf, Schmitz, Wielton\nRóżnorodność wykonywanych czynności\nMożliwość zdobycia i rozwijania nowych umiejętności\nMożliwość zakwaterowania\n\nWymagania:\n\nChęć nauki\nUmiejętność samodzielnego planowania i organizacji pracy\nWykształcenie zawodowe\nPrawo jazdy kat. B (mile widziane)\n\nProsimy o dopisanie następującej klauzuli: \"Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w mojej aplikacji dla potrzeb niezbędnych do realizacji procesów rekrutacji (zgodnie z Ustawą z dnia 29 sierpnia 1997 r. o ochronie danych osobowych tj. Dz. U. z 2002 r., Nr 101, poz. 926, ze zm.)\n\nAplikuj",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Mechanik do warsztatu samochodowego",
        "category": "olx",
        "phone": "668530130",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy mechanika  do warsztatu samochodowego więcej informacji pod nr tel 668-530-130",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Pomocnik Mechanika Maszyn Budowlanych",
        "category": "olx",
        "phone": "508512921",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudniona osoba odpowiedzialna za pomoc/naukę przy: \n\nwykonywanie bieżących przeglądów okresowych\nustalanie i usuwanie usterek w podzespołach i układach pojazdów/maszyn\nkonserwację pojazdów i maszyn\nwykonywanie napraw z wykorzystaniem sprzętu diagnostycznego oraz specjalistycznych narzędzi\nwspółpracę z innymi pracownikami serwisu\nOd kandydatów oczekujemy:\nwykształcenia min zawodowego\nchęci do pracy\nprawa jazdy kat. B\nsumienności i odpowiedzialności\numiejętności pracy samodzielnej, w delegacji , czas pracy zadaniowy\nczytania i słuchania ze zrozumieniem oraz otwartość na naukę\nszukamy osób bez doświadczenia w serwisach, chcących zdobyć nowy zawód\nobcokrajowcy tylko z bardzo dobrą znajomością języka polskiego.\nobowiązuje umowa lojalnościowa na ustalony czas\nKandydatom spełniającym nasze oczekiwania oferujemy:\nstabilność i atrakcyjne warunki zatrudnienia\nzdobycie atrakcyjnego zawodu na rynku pracy\nmożliwość rozwoju zawodowego\nprywatną opiekę medyczną (po okresie próbnym)\nubezpieczenie na życie\nszkolenia zawodowe\npomoc techniczną online",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Samodzielny mechanik",
        "category": "olx",
        "phone": "661020919",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię samodzielnego mechanika z doswiadczeniem.\n\nOpis stanowiska: wykonywanie napraw, przeglądów oraz diagnostyki  samochodów osobowych.\n\nOsoby zainteresowane zapraszam do kontaktu.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Zatrudnię mechanika pojazdów samochodowych",
        "category": "olx",
        "phone": "505093638",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma Anza zatrudni samodzielnego mechanika samochodowego, posiadającego doświadczenie na tym stanowisku.\n\nOferujemy:\n\n-atrakcyjne wynagrodzenie\n\n-umowę o pracę\n\n-pracę w zgranym zespole, posiadającym duże doświadczenie\n\n-pracę w stabilnej i rozwijającej się firmie\n\n-pracę w czystym i zadbanym serwisie, o dobrym wyposażeniu\n\n-dobrze wyposażoną część socjalną dla pracowników\n\nZainteresowanych prosimy o kontakt telefoniczny pod numerem 505 093 638.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Blacharz do youngtimeów!",
        "category": "olx",
        "phone": "727007402",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Dam pracę blacharzowi praca głównie przy youngtimerach czyli łatanie, dorabianie elementów itd rozliczanie od projektów dorywczo lub na stałe",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Praca mechanik / pomocnik mechanika",
        "category": "olx",
        "phone": "501504960",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "ARS Serwis 4x4\n\nFB: /ars4x4\n\nPoszukujemy jednej osoby na stanowisko pomocnika mechanika lub samodzielnego mechanika. Umiejętność zachowania porządku na stanowisku pracy będzie bardzo dużym plusem, umiejętność spawania mile widziana. Praca w dziale samochodów terenowych. Pełny zakres mechaniki, elektronika, budowa pojazdów rajdowych. Poszukujemy osób z choćby podstawowym doświadczeniem i wiedzą z zakresu mechaniki. Możliwość dużego rozwoju. \n\nZgłaszać można się osobiście: Nadarzyn ul.Leśna 5 lub mailowo/telefonicznie",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Diagnosta do SKP",
        "category": "olx",
        "phone": "794794500",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię diagnostę samochodowego do Stacji Kontroli Pojazdów. \n\nZakres obowiązków:\n\nwykonywanie badań technicznych pojazdów zgodnie z posiadanymi uprawnieniami\nrzetelne prowadzenie dokumentacji związanej z wykonywaną praca\ninne prace zlecone przez przełożonego\n\nWymagania:\n\nposiadanie uprawnień diagnosty w zakresie wymagań okręgowej stacji kontroli pojazdów\nprawidłowe i staranne wykonywanie zadań wynikających z zakresu czynności\nznajomość przepisów\nznajomość systemu informatyczne PATRONAT\nznajomość obsługi urządzeń diagnostycznych\nobsługa kasy fiskalnej\ndobra organizacja pracy\nzachowanie zasad uprzejmości w kontaktach międzyludzkich\nsamodzielność, samodyscyplina i kultura osobista\n\nOferujemy:\n\nmiłą atmosferę\numowę o pracę na pełny etat\nstabilne zatrudnienie\npraca od poniedziałku do soboty w systemie jednozmianowym\n\nSzczegóły pod numerem telefonu podanym w ogłoszeniu. CV proszę wysyłać w odpowiedzi na to ogłoszenie.\n\nW każdym z przesłanych dokumentów proszę zamieścić klauzulę: „Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z Ustawą z dnia 29.08.1997 roku o Ochronie Danych Osobowych; tekst jednolity: Dz. U. 2016 r. poz. 922).”",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Mechanik samochodowy 5000 - 8000 na rękę",
        "category": "olx",
        "phone": "508954327",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Profesjonalny serwis samochodowy o ugruntowanej pozycji i dobrej renomie zatrudni doświadczonego mechanika.\n\nZakres obowiązków:\n\n- diagnostyka usterek\n\n- przeglądy\n\n- naprawy bieżące\n\nCV proszę składać poprzez stronę OLX.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Praca od ręki - mechanik do napraw ciężarówek .",
        "category": "olx",
        "phone": "509809601",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Dzień dobry , \n\n  Szukam od ręki mechanika do naprawy samochodów ciężarowych , Warsztat 15km od Warszawy w Topolinie  województwo Mazowieckie . \n\nPraca  stała w dwu osobowej firmie . Wymagania chęci do pracy i doświadczenie na danym stanowisku . \n\nWarunki pracy do uzgodnienia  . Praca jedno zmianowa 8-17 . \n\nWięcej informacji pod telefonem 792555626 .",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Mechanik elektromechanik samochodowy",
        "category": "olx",
        "phone": "696014625",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Oferujemy pracę w serwisie samochodowym w Mrokowie. 29 letnie doświadczenie sprawia, że jesteśmy firmą o ugruntowanej pozycji na rynku. Aktualnie poszukujemy do pracy mechanika samochodowego z doświadczeniem  ( rozrządy, głowice, silniki) \n\nOferujemy: \n\n- stałe zatrudnienie,\n\n- atrakcyjne zarobki, \n\n- terminowe płatności \n\nOd kandydatów oczekujemy:\n\n- zaangażowanie w wykonywaną pracę \n\n- doświadczenie w pracy mechanika\n- znajomości obsługi testera diagnostycznego kts i guttman\n-znajomosci regulacji geometrii kól\n\nProsimy o przesyłanie CV poprzez portal bądź kontakt telefoniczny. W celu uzyskania szczegółowych informacji zapraszam do kontaktu telefonicznego na numer telefonu podany w ogłoszeniu",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Pomocnik lakiernika",
        "category": "olx",
        "phone": "698362741",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy pomocnika lakiernika meblowego \nPraca w Żółwinie od 7-17",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Zatrudnię mechanika - podstawowe umiejętności - ciężarowe",
        "category": "olx",
        "phone": "725654725",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię mechanika (podstawowe umiejętności) do ciągników siodłowych marki Volvo, Mercedes, Scania, DAF. Obsługa tylko własnej floty pojazdów, prace porządkowe. Możliwość przyuczenia.\n\nOferujemy elastyczne godziny pracy.\n\nMożliwość zakwaterowania\n\nOczekujemy:\n\ndoświadczenia lub chęci nauczenia się na stanowisku mechanika\nzaangażowania oraz dokładności wykonywanej pracy\nprawo jazdy kat. B\nMile widziana kategoria C+E, a także umiejętność lakierowania.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Zatrudnimy mechanika",
        "category": "olx",
        "phone": "519084519",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy mechanika (od 3,5 do 6,5tyś netto) do naprawy i serwisowania, własnej floty pojazdów składającej się z,  samochodów ciężarowych oraz osobowych.\n\n \n\n Oferujemy:\n\n - stabilną pracę w oparciu o umowę o pracę\n\n - praca od poniedziałku do piątku (możliwość pracy w weekend)\n\n - atrakcyjne i terminowe wynagrodzenie (od 4,5 do 6tyś netto)\n\n - możliwości dodatkowych szkoleń\n\n - możliwość zorganizowania kwaterunku w pobliżu bazy transportowej\n\n \n\n Wymagania\n\n-doświadczenie w naprawach mechanicznych ciężarówek \n\n-wiedza z zakresu mechaniki samochodowej\n\n-prawo jazdy kategorii B, C\n\n-możliwość przyuczenia do pracy na ww. stanowisku\n\n- rzetelność i uczciwość\n\n - sumienność \n\n - dbanie o powierzone mienie (w tym dbanie o czystość i porządek w warsztacie)\n\n - umiejętność efektywnego organizowania czasu pracy\n\n- mile widziane prawo jazdy kategorii C + E, karta kierowcy\n\nZadania:\n\n-naprawa i serwis samochodów ciężarowych \n\n-usuwanie usterek na trasie w ramach pogotowia technicznego (Warszawa i okolice)\n\n-kontrola stanu zużycia części mechanicznych\n\n-naprawy z użyciem części zamiennych i podzespołów\n\nZainteresowane osoby prosimy o przesyłanie CV lub kontakt telefoniczny: 519 084 519.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Mechanik pojazdów ciężarowych i maszyn budowlanych",
        "category": "olx",
        "phone": "502189970",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam,\n\nZatrudnię mechanika z doświadczeniem do napraw i bieżącej obsługi floty transportowo-sprzętowej w firmie budowlanej. \n\nSamochody ciężarowe głównie marki Scania,Man oraz maszyny Case, Komatsu.\n\nPraca na podstawie umowy o pracę-pierwsza umowa na czas próbny 3 miesiące, kolejna na czas nieokreślony.\n\nMiejsce pracy Moszna-Parcela k. Pruszkowa. \n\nWięcej informacji pod numerem telefonu 502-189-970.\n\nPreferowany kontakt telefoniczny. Zapraszam",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Mechanik Samochodów Ciężarowych",
        "category": "olx",
        "phone": "601772200",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Wymagania:\n\n- wykształcenie o profilu mechanicznym,\n\n- znajomość budowy pojazdów i technologii napraw,\n\n- dobra organizacja pracy,\n\n- sumienność, rzetelność, uczciwość,\n\n- chęć doskonalenia swoich umiejętności i podnoszenia kwalifikacji,\n\n- mile widziane doświadczenie w zawodzie,\n\n \n\nZakres obowiązków:\n\n-wykonywanie napraw i czynności obsługowych samochodów ciężarowych, przyczep i naczep,\n\n- dbanie o porządek w miejscu pracy,\n\n-wykonywanie innych prac zleconych na rzecz serwisu,\n\n \n\nOferujemy:\n\n- stabilne zatrudnienie w oparciu o umowę o pracę,\n\n- atrakcyjny i motywacyjny system wynagrodzeń,\n\n- możliwość rozwoju zawodowego,\n\n- przyjazną atmosferę pracy w doświadczonym zespole,\n\n- dofinansowanie do pakietu medycznego i atrakcyjne ubezpieczenie grupowe,\n\nKontakt: Paweł tel.601772200, Krzysztof tel.507004828.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Praca dla mechanika lub pomocnika mechanika",
        "category": "olx",
        "phone": "601216232",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Szukamy osób na stanowisko pomocnika mechanika oraz mechanika zbrojarza do napraw powypadkowych - zwykle wymiana uszkodzonych elementów na nowe.\n\nPoszukujemy też osoby do pomocy w warsztacie - ucznia.\n\nUmowa o pracę na pełen etat po miesięcznym okresie próbnym.\n\nMiejsce pracy Sękocin Nowy - Aleja Krakowska 4. Pracujemy od 7 do 16 zapraszamy\n\nCV nie jest potrzebne wystarczy że ktoś chce pracować\n\n601 216 232\n\n506 649 607",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Blacharz samochodowy Serwis Janicar",
        "category": "olx",
        "phone": "607678421",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy osoby na stanowisko blacharza samochodowego. Oczekujemy doświadczenia w zawodzie, najlepiej też w pracy z aluminium ( nie jest to jednak konieczne). Nasz serwis mieści się w miejscowości Mory, przy ulicy poznańskiej 40 - od trasy s8 ok. 300m. \n\nOferujemy stabilną pracę z regularnie wypłacanym wynagrodzeniem,  pracę w miłej atmosferze. \n\nzainteresowanych proszę o kontakt telefoniczny ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "MECHANIK do serwisu samochodowego",
        "category": "olx",
        "phone": "505101510",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Serwis w Sękocinie Nowym poszukuje od zaraz osoby na stanowisko:\n\nMECHANIK SAMOCHODOWY \n\nIstnieje możliwość zamieszkania na miejscu.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "mechanik samochodowy z doświadczeniem i pomocnika mechanika",
        "category": "olx",
        "phone": "721500500",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "firma kmj fiat ducato serwis zatrudnie mechanika samochodowego z doświadczeniem jak i pomocnika mechanika wymagana podstawa -warszawa -auta dostawcze iveco fiat\n\ntelefon kontaktowy 721500500",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Mechanik samochodowy , przedstawiciel handlowy",
        "category": "olx",
        "phone": "534545430",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam, 2 stanowiska.\n\nzatrudnię mechanika samochodowego lub pomocnika.\n\nPraca od poniedziałku do piątku w godzinach 9-19, sobota 9-15\n\nNasze oczekiwania:\n\nPrzyuczenie do wykonywania zawodu mechanika. Doświadczenie nie jest wymagane.\n Umiejętność dobrej organizacji pracy własnej.\n Zaangażowanie w wykonywaną pracę.\n Prawo jazdy kat. B\n\nWięcej informacji pod numerem telefonu: 530/000/079\n\n730/002/223\n\nTak ze zatrudnimy osobę na stanowisko przedstawiciel handlowy / sprzedawca\n\nWymagania\n\n1- podstawowa wiedza o mechanice samochodowej\n\n2- prawo jazdy kat. B\n\n3- znajomosc jezyków (Rosyjski/Ukraiński , Polski )\n\nWymagania obowiazkowe\n\nPraca z klihentem telefonicznie , sprzedaz czesci samochodowych nowe i uzywane.\n\nPraca na terenie warszawy , Ul.Warszawska 369 , Gmina stare babice .\n\nWięcej informacji pod numerem telefonu: 534/545/430\n\n730/002/223 , 530\\000\\079",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Mechanik,Elektromechanik",
        "category": "olx",
        "phone": "501086393",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Warsztat samochodowy AK Motors z Pruszkowa zatrudni mechanika,elektromechanika,szukamy samodzielnego mechanika z doświadczeniem.Zapewniamy bardzo dobre warunki pracy.Zainteresowanych pracą  proszę o kontakt telefoniczny lub zapraszam do warsztatu.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Mechanik wózków widłowych",
        "category": "olx",
        "phone": "606431839",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Elektromechanik - Technik\nZakres obowązków:\n\nPraca stacjonarna-wyjazdowa\nWykonywanie napraw oraz przeglądy techniczne wózków widłowych\nAnaliza usterek i rozwiązywanie problemów technicznych\nTworzenie raportów i dokumentacji z wykonywanych czynności\nWymagania:\n\nWykształcenie średnie lub zawodowe techniczne\nPodstawowa wiedza i praktyka z zakresu mechaniki, hydrauliki i elektrotechniki\nDoświadczenie zawodowe w zakresie napraw i konserwacji wózków widłowych / samochodów / maszyn budowlanych / maszyn rolniczych / innych urządzeń mechanicznych lub pojazdów\nZdolności organizacyjne, komunikatywność, dyspozycyjność, samodzielność, odpowiedzialność\nPrawo jazdy kat. B\nMile widziane:\n\nUprawnienia konserwacyjne UDT na wózki widłowe (możliwość uzupełnienia w trakcie zatrudnienia)\nUprawnienia operatorskie na wózki widłowe (możliwość uzupełnienia w trakcie zatrudnienia)\nUprawnienia SEP\nZnajomość wózków widłowych różnych marek\nOferujemy:\n\nAtrakcyjne wynagrodzenie (podstawa i premia)\nUmowę o prace\nNiezbędne narzędzia pracy: telefon, tablet, samochód służbowy\nUbezpieczenie na życie\nPrywatną opiekę medyczną\nŚcieżkę rozwoju zawodowego",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Lakiernik / pomocnik lakiernika Piastów",
        "category": "olx",
        "phone": "696757527",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam poszukuję lakiernika/ pomocnika lakiernika. Piastów obok warszawy. Więcej informacji pod nr tel. 730310181. 696757527\nLub Carmakeup.firma(małpa)gmail.com.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Mechanik samochodowy , blacharz",
        "category": "olx",
        "phone": "504150817",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Muzeum zatrudni pracowników na stanowisku:\nBlacharz \nMechanik samochodowy \nWięcej informacji  504150817",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Zatrudnię blacharza samochodowego",
        "category": "olx",
        "phone": "606996471",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witamy poszukujemy osoby na stanowisko blacharza samochodowego. \n\noferujemy \n\nstałą umowę o pracę \n\npracę w stałym, zgranym zespole \n\nstabilne zatrudnienie \n\npraca na najnowszych narzędziach\n\n wymagamy\n\n doświadczenia na stanowisku blacharza\n\n zaangażowania i pracowitość\n\n punktualności oraz rzetelności \n\nodpowiedzialność \n\ndbałości o powierzony sprzęt \n\nJeśli jesteś zainteresowany to wyślij swoje CV lub zadzwoń pod numer podany w ogłoszeniu. \n\nW CV prosimy zawrzeć klauzulę: Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO).",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Zatrudnię Mechanika",
        "category": "olx",
        "phone": "500024355",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy pracownika na stanowisko mechanik samochodów ciężarowych \n\nOferujemy:\n\numowę o pracę na pełny etat\nstabilne zatrudnienie\nprace w zgranym zespole i miłym środowisku pracy\n\nOczekujemy:\n\ndoświadczenia w zawodzie\npunktualności\nzaangażowania w pracę\nsamodzielności\n\nWarsztat  TI&TI TRUCK SERVICE SP. Z O. O. w Rembertowie koło Tarczyna\n\nZapraszamy do kontaktu:\n\nTel. 500024355 ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Pomocnika lakiernika zatrudnię",
        "category": "olx",
        "phone": "602393391",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "zatrudnimy od zaraz tylko samodzielnego pomocnika lakiernika z praktyką w zawodzie,stała praca,b.dobre zarobki\n\nwysokość wynagrodzenia zależna od poziomu doświadczenia zawodowego,\n\nproszę o nie składanie propozycji przyuczenia w zawodzie,\n\nzatrudniamy cudzoziemców,zapraszamy",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Poszukiwany Mechanik samochodowy Mszczonów",
        "category": "olx",
        "phone": "601345086",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Q-SERVICE CarPart w Mszczonowie poszukuje samodzielnego mechanika\n\nZakres obowiązków Mechanika:\n\nnaprawy samochodów osobowych / dostawczych,\nwymiana części zgodnie z wymogami producenta,\nwykonywanie przeglądów okresowych oraz konserwacji,\ndiagnostyka i weryfikacja usterek technicznych,\nobsługa specjalistycznych narzędzi oraz urządzeń warsztatowych,\nmycie i czyszczenie części oraz podzespołów,\ndbałość o wysoką jakość wykonywanych prac.\ndbałość o porządek w miejscu pracy.\n\nWymagania na stanowisko mechanik samochodowy to:\n\ndoświadczenie zawodowe na tożsamym stanowisku,\nwiedza techniczna z zakresu napraw pojazdów,\numiejętność czytania dokumentacji technicznej,\nbiegła znajomość budowy pojazdów samochodowych,\nczynne prawo jazdy kategorii B,\nsamodzielność w działaniu,\numiejętność planowania i dobra organizacja pracy,\nodpowiedzialność i sumienność w wykonywaniu powierzonych zadań,\nrzetelne podejście do wykonywanych obowiązków.\n\nW zamian oferujemy stabilne zatrudnienie, stałe godziny pracy, umowę o pracę oraz doświadczenie zawodowe w Q-service\n\nKontakt telefoniczny lub na email\n\n601345086, 603345086 lub SMS\n\nZapraszamy",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Technik Warsztatowy",
        "category": "olx",
        "phone": "574801200",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Dla Naszego Klienta specjalizującego się w produkcji wózków widłowych, prowadzimy rekrutację na stanowisko: Technik Warsztatowy.\n\nZakres obowiązków: \n\nSamodzielna naprawa i konserwacja wózków widłowych oraz osprzętu w warsztacie firmy.\nDoradzanie oraz pomaganie innym współpracownikom przy problemach technicznych.\nKontrola wewnętrzna wózków używanych.\nWyceny wózków wracających z kontraktów długoterminowych.\nSamodzielna praca w SAP w zakresie transakcji warsztatowych.\nAsysta przy badaniu UDT.\nKontakty z Klientem oraz prowadzenie prezentacji sprzętu.\nUdział w szkoleniach wewnętrznych oraz zewnętrznych na terenie całego kraju.\n\nWymagania: \n\nWykształcenie elektrotechniczne.\nDoświadczenie w zawodzie mechanika, elektromechanika lub automatyka.\nZnajomość budowy i zasad działania silników elektrycznych, prądu stałego i zmiennego oraz układów sterujących.\nMile widziana znajomość silników spalinowych.\nPosiadanie prawa jazdy kat. B oraz doświadczenie w prowadzeniu samochodu.\nSolidność, dyspozycyjność oraz operatywność.\nDodatkowym atutem będą uprawnienia SEP, UDT, GAZ oraz znajomość języka angielskiego.\n\nOferta:\n\nZatrudnienie na umowę o pracę w stabilnej, międzynarodowej organizacji.\nCiekawą pracę w dynamicznym środowisku z zespołem odnoszącym sukcesy.\nPrzejrzyste zasady wynagrodzenia.\nDobrą atmosferę pracy w przyjaznym i otwartym zespole.\nProfesjonalne szkolenia wdrażające i wsparcie merytoryczne.\nMożliwość rozwoju poprzez system szkoleń na każdym etapie zatrudnienia.\nPakiet socjalny (m.in. opiekę medyczną, ubezpieczenie grupowe i inne).",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "magazynier Błonie",
        "category": "olx",
        "phone": "600434130",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy pracownika do magazynu/skupu palet w miejscowości Błonie (woj. mazowieckie).\n\nZakres pracy to załadunek/rozładunek palet, remont palet, segregacja palet.\n\nPraca od poniedziałku do piątku w godzinach 8-18.\n\nWynagrodzenie 3600 zł netto. Umowa o pracę na pełny etat.\n\nWymagania: zaświadczenie o niekaralności.\n\ntel. 600 434 130",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Pracownik magazynowy - Wiskitki k/Żyrardowa",
        "category": "olx",
        "phone": "507805861",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Chefs Culinar to rodzinne przedsiębiorstwo z ponad czterdziestoletnim doświadczeniem. Wyróżnia nas szeroki asortyment produktów spożywczych i przemysłowych oraz kompleksowa obsługa klienta. Zaufaniem obdarzyło nas wiele restauracji, hoteli i firm cateringowych. Świadczymy swoje usługi w Niemczech, Danii, Szwecji, Niderlandach, Austrii oraz Polsce. Nad wysokiej jakości serwisem dla Klientów Chefs Culinar czuwa ponad 6000 Pracowników, których kompetencje i skuteczność codziennie budują nasz sukces.\n\n \n\nPracodawca godny zaufania? Tak, Chef!\n\n \n\nW związku z uruchomieniem nowoczesnego Centrum Dystrybucyjnego w Wiskitkach k/ Żyrardowa poszukujemy zaangażowanych, ceniących pracę w zgranym zespole Kandydatów na stanowisko:  \n\n PRACOWNIK MAGAZYNOWY\n\nLokalizacja docelowa: Wiskitki k/Żyrardowa \n\njakie będą twoje zadania ?:\n\nRozładunek dostaw, kontrola pod względem ilościowym i jakościowym\nTransport towaru ze strefy przyjęcia do strefy składowania \nPrawidłowe oznaczanie palet w magazynie zgodnie z przyjętym systemem\nUdział w inwentaryzacji i wyjaśnianie rozbieżności\nKompletacja i konsolidacja oraz kontrola zamówień do Klientów\nObsługa magazynowych programów komputerowych – skaner\n\nOCZEKUJEMY OD CIEBIE ?:\n\nmin. 2 letniego doświadczenia zawodowego, mile widziane w logistyce i magazynowaniu \ndoświadczenia w pracy na skanerze\nuprawnień na wózki widłowe\ndyspozycyjności, komunikatywności,\numiejętności pracy pod presją czasu.\n\nW ZAMIAN OFERUJEMY ?: \n\nAtrakcyjne wynagrodzenie + system premiowy,\nStabilne zatrudnienie w oparciu o umowę o pracę,\nDobre warunki pracy i przyjazną atmosferę,                                                    \nOpiekę Medyczną oraz Ubezpieczenie na Życie\nProgram wdrożeniowy\n\nKlikając w przycisk „Aplikuj”, „Aplikuj teraz” lub w inny sposób wysyłając zgłoszenie rekrutacyjne do Chefs Culinar Sp. z o.o. (Pracodawca, administrator danych), zgadzasz się na przetwarzanie przez Pracodawcę Twoich danych osobowych zawartych w zgłoszeniu rekrutacyjnym w celu prowadzenia rekrutacji na stanowisko wskazane w ogłoszeniu.\n\nJeżeli chcesz, abyśmy zachowali Twoje CV w naszej bazie, umieść dodatkowo w CV następującą zgodę: „Zgadzam się na przetwarzanie przez Chefs Culinar Sp. z o.o. danych osobowych zawartych \n\n w moim zgłoszeniu rekrutacyjnym dla celów przyszłych rekrutacji”. W każdym czasie możesz cofnąć zgodę, kontaktując się z nami\n\nTwoje dane osobowe wskazane w Kodeksie pracy lub w innych ustawach szczegółowych (według wymogów ogłoszenia) przetwarzamy w oparciu o przepisy prawa i ich podanie jest konieczne do wzięcia udziału w rekrutacji. Pozostałe dane osobowe (np. wizerunek) przetwarzamy na podstawie Twojej dobrowolnej zgody, którą wyraziłaś/eś, wysyłając nam swoje zgłoszenie rekrutacyjne i ich podanie nie ma wpływu na możliwość udziału w rekrutacji.\n\nMożemy przetwarzać Twoje dane osobowe zawarte w zgłoszeniu rekrutacyjnym także w celu ustalenia i dochodzenia roszczeń lub obrony przed roszczeniami, jeżeli roszczenia dotyczą prowadzonej przez nas rekrutacji. W tym celu będziemy przetwarzać Twoje dane osobowe w oparciu o nasz prawnie uzasadniony interes, polegający na ustaleniu i dochodzeniu roszczeń, obronie przed roszczeniami \n\n w postępowaniu przed sądami lub organami państwowymi.\n\nMasz prawo dostępu do swoich danych, w tym uzyskania ich kopii, sprostowania danych, żądania ich usunięcia, ograniczenia przetwarzania, wniesienia sprzeciwu wobec przetwarzania oraz przeniesienia podanych danych (na których przetwarzanie wyraziłaś/eś zgodę) do innego administratora danych. Masz także prawo do wniesienia skargi do Generalnego Inspektora Ochrony Danych Osobowych \n\n (w przyszłości: Prezesa Urzędu Ochrony Danych Osobowych). Cofnięcie zgody pozostaje bez wpływu na zgodność z prawem przetwarzania, którego dokonano na podstawie zgody przed jej cofnięciem.\n\nTwoje dane osobowe przetwarzamy w celu prowadzenia rekrutacji na stanowisko wskazane w ogłoszeniu przez okres 1 miesiąca, a gdy wyraziłaś/eś zgodę na udział w przyszłych rekrutacjach przez okres 3 miesięcy. Ponadto Twoje dane osobowe możemy przechowywać dla celów ustalenia \n\n i dochodzenia roszczeń lub obrony przed roszczeniami związanymi z procesem rekrutacji przez okres 6 miesięcy. Twoje dane osobowe możemy przekazać dostawcom usługi publikacji ogłoszeń o pracę, dostawcom systemów do zarządzania rekrutacjami, dostawcom usług IT, takich jak hosting, oraz dostawcom systemów informatycznych.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Pracownik magazynu z obsługą wózków widłowych -niskie składowanie",
        "category": "olx",
        "phone": "227345900",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Kwalifikacje:\n\ndoświadczenie w obsłudze i prowadzeniu wózków widłowych\numiejętność pracy w zespole\nksiążeczka sanepidu\nprawo jazdy kat. B\n\nZakres obowiązków:\n\nobsługa wózka widłowego - niskie składowanie\nrozładunek i załadunek towaru\ntransport wewnątrz magazynu\nprace magazynowe oraz inne prace pomocnicze\ndbałość o powierzony sprzęt oraz przestrzeganie zasad BHP",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Pracownik centrum dystrybucji towaru Peek & Cloppenburg",
        "category": "olx",
        "phone": "223132555",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Pracownik centrum dystrybucji towaru\n\nW związku z dynamicznym rozwojem firmy poszukujemy pracowników. Możesz dołączyć do nas jako: Pracownik Centrum Dystrybucji Towaru, pełny i niepełny etat.\n\nZAKRES OBOWIAZKÓW\n\nRozładunek i załadunek dostaw\nSortowanie towaru\nZabezpieczanie towaru\nKompletowanie i pakowanie zamówień\nPraca ze skanerem\n\nWYMAGANIA\n\nZaangażowanie w pracę\nDokładność\nSamodzielność\nDobra organizacja pracy\n\nCO OFERUJEMY\n\nStabilne miejsce pracy w oparciu o umowę o pracę\nAtrakcyjne i terminowe wynagrodzenie\nElastyczne godziny pracy\nRabat personalny na zakup odzieży\nMożliwość rozwoju\nPrzyjazna atmosfera\nPakiet prywatnej opieki medycznej\n\n \n\nLOKALIZACJA Al. Katowicka 66, Nadarzyn 05-830 \n\nZATRUDNIENIE pełny/niepełny etat",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Magazynier Pakownie Przesyłek Reguły / Pruszków",
        "category": "olx",
        "phone": "530897897",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy pracownika na stanowisko pakowacza/magazyniera w magazynie w Regułach k. Warszawy, preferujemy mężczyznę na to stanowisko.\n\n \n\nZAKRES OBOWIĄZKÓW\n\nręczne pakowanie towaru zgodnie z wykazem\nprzygotowywanie towaru do wysyłki\nprzyjmowanie dostaw\nrozmieszczanie towarów na półkach\nproste prace manualne\nprzeprowadzanie inwentaryzacji\ndbanie o porządek i czystość\n\n \n\nWYMAGANIA\n\ndobra organizacja pracy\nodpowiedzialne podejście do powierzonych obowiązków\nsumienność i staranność w pracy\numiejętność pracy w zespole\nzaangażowanie oraz zręczność\npunktualność\ndyspozycyjność\nmile widziane posiadanie prawa jazdy kat. B \nznajomość branży budowlanej będzie mile widziana\n\n \n\nOFERTA\n\numowa o pracę\nstabilne zatrudnienie\npraca w systemie jednozmianowym\ndobra atmosfera pracy\n\n \n\nOsoby zainteresowane prosimy o przesyłanie CV.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "BRONISZE! Pracownik Magazynu 14:00-21:00 lub 00:00-07:00- OD ZARAZ!",
        "category": "olx",
        "phone": "574575404",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Dla naszego Klienta, niekwestionowanego lidera w swoim sektorze oraz cenionego Pracodawcy poszukujemy kandydatów na stanowisko:\n\nMAGAZYNIER - sortowanie przesyłek kurierskich\n\nLokalizacja: Bronisze k. Ożarowa Mazowieckiego, woj. mazowieckie\n\nStawka: 22 zł/h brutto + PREMIA\n\nDojazd: możliwość bezpośredniego dojazdu komunikacją miejską z Ożarowa Mazowieckiego oraz Warszawy linia 713 - przystanek Bronisze\n\nOferujemy:\n\nstałą stawkę podstawową wynoszącą 22 zł/h brutto + PREMIA,\nwspółpracę w godzinach 14:00-21:00 od poniedziałku do piątku lub 00:00-07:00 od wtorku do soboty,\nmożliwość zatrudnienia w wybrane dni,\nzatrudnienie w ramach umowy zlecenie,\nwspółpracę z firma będącą liderem na polskim rynku wśród firm kurierskich,\npełne szkolenie stanowiskowe.\n\nZadania:\n\nsortowanie, segregacja oraz skanowanie przesyłek,\nrozładunek oraz załadunek paczek,\nutrzymanie czystości na magazynie.\n\nWymagania:\n\npełnoletność,\ndyspozycyjność w podanych godzinach,\npełna sprawność fizyczna,\nniekaralność.\n\nOsoby zainteresowane prosimy o wysłanie swojego CV poprzez formularz aplikacyjny lub kontakt pod numerem 574575404.\n\nZgodnie z obowiązującym prawem Workhouse4you Sp. z o.o. nie pobiera opłat od kandydatów za udział w procesach rekrutacyjnych.\n\nBardzo prosimy o dopisanie poniższej klauzuli do CV: \"Wyrażam zgodę na przetwarzanie moich danych osobowych i innych danych zawartych w mojej aplikacji oraz CV na potrzeby obecnego procesu rekrutacyjnego prowadzonego przez Workhouse4you Sp. z o.o. z siedzibą w Gdańsku, ul. Obrońców Wybrzeża 4d/16, 80-398 Gdańsk. Jestem świadomy/a przysługującego mi prawa do wycofania zgody, jak również faktu, że wycofanie zgody nie ma wpływu na zgodność z prawem przetwarzania, którego dokonano na podstawie zgody przed jej wycofaniem. Zgodę mogę odwołać przesyłając informację o wycofaniu zgody na adres: office(at)workhouse4you.pl\"\n\nWyrażenie niniejszej zgody jest dobrowolne, lecz niezbędne dla wzięcia udziału w procesie rekrutacji. W przypadku braku zgody, zgłoszenie rekrutacyjne nie zostanie uwzględnione w procesie rekrutacji.\n\nWorkhouse4you(c.23651)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Pracownik produkcyjno-magazynowy",
        "category": "olx",
        "phone": "789206291",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Swish Polska, polski przedstawiciel Swish Maintenance Ltd, lidera na rynku profesjonalnych środków czystości na rynkach północno amerykańskich, poszukuje pracownika na stanowisko Pracownik produkcyjno-magazynowy.\n\nOpis stanowiska:\n\nWsparcie procesu produkcyjnego przy obsłudze maszyn i przy pakowaniu gotowych produktów\nProwadzenie gospodarki magazynowo produkcyjnej\nWsparcie procesu wydawania towaru (kompletacja wysyłek na podstawie dokumentów WZ)\nWspółpraca z przewoźnikami w zakresie załadunku i rozładunku towarów\nPilnowanie porządku na hali magazynowej\n\nPoszukujemy osoby sumiennie wykonującej swoje obowiązki, gotowej do pracy fizycznej na hali magazynowej, umiejącej pracować w zespole i odznaczającej się dokładnością i odpowiedzialnością. Przestrzeganie zasad BHP.\n\nMile widziane:\n\nZainteresowania i umiejętności techniczne\nDoświadczenie w pracy na magazynie i uprawnienia do obsługi wózka widłowego wysokiego składu będą dodatkowym atutem\n\nOferujemy:\n\nZatrudnienie w formie umowy zlecenie z możliwością przejścia na umowę o pracę\nWewnętrzny system premiowania\nNiezbędne narzędzia do wykonywania pracy\nPracę w zgranym, miłym zespole\nStałe godziny pracy, praca pon-pt\n\nKandydatów prosimy o wzięcie pod uwagę lokalizacji zakładu (Macierzysz, 05-850 Ożarów Mazowiecki) przed aplikowaniem.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Operator wózka widłowego z UDT",
        "category": "olx",
        "phone": "695240560",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Adecco Poland Sp. z o.o. należy do międzynarodowej korporacji The Adecco Group - światowego lidera wśród firm doradztwa personalnego, który posiada 5100 placówek w ponad 60 krajach. W Polsce działamy od 1994 roku. Swoją wiedzą i doświadczeniem służymy w ponad 50 lokalizacjach na terenie kraju. W 2020 roku pracę dzięki Adecco Poland znalazło blisko 60000 osób. Adecco Poland Sp. z o.o. jest Agencją Zatrudnienia nr 364.\nDla Naszego Klienta poszukujemy:\n\nOperator wózka widłowego  z UDT\n\nWymagania:\n• NOWE UPRAWNIENIA UDT \n• doświadczenie w obsłudze wózka widłowego NA WYSOKIM SKŁADZIE \n• dostępność do pracy na 2 zmiany (6-14/14-22)\n\nZadania:\n• obsługa wózka widłowego \n• kompletacja towaru i rozlokowywanie go na magazynie\n• rozładunek i załadunek samochodów\n\nOferujemy:\n• stawkę - 26 zł brutto/h\n• zatrudnienie na Umowę o pracę tymczasową\n• możliwość rozwoju w strukturach firmy\n \nMIEJSCE PRACY - MOSZNA PARCELA (granica Brwinowa z Pruszkowem)\nZadzwoń - 695 240 560",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Magazynier Spar - Stare Gnatowice",
        "category": "olx",
        "phone": "690348394",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Z pasją i radością tworzymy i wdrażamy codzienne rozwiązania, które służą rozwojowi przedsiębiorczości we wszystkich obszarach naszego działania, a to w jaki sposób to robimy obejmuje pracę zespołową, indywidualny wkład, zaangażowanie, entuzjazm, odpowiedzialność, innowacyjne podejście, przynależność, przywództwo oraz relacje wzajemnego zaufania.\n\n Do naszego Centrum Logistycznego w Starych Gnatowicach poszukujemy osób, które z pasją, odwagą \n\n i otwartością podejmie wiele ciekawych wyzwań w naszej organizacji. \n\nJeśli rozpoznajesz siebie w tym ogłoszeniu, to bardzo chcemy, abyś już teraz wiedział, \n\n że z radością czekamy na Ciebie! Zaaplikuj na stanowisko:\n\nMagazynier\n\nMiejsce pracy: Stare Gnatowice\n\nDołącz do nas i zyskaj:\n\nStabilne warunki zatrudnienia w ramach umowy o pracę bezpośrednio z firmą SPAR \nAtrakcyjne wynagrodzenie podstawowe + dodatek + comiesięczne premie \nRabaty na zakupy we wszystkich sklepach sieci\nUbezpieczenie grupowe na preferencyjnych warunkach\nBezpłatne vouchery na napoje\n\nBądź odpowiedzialny za: \n\nKompletacje zamówień według zapotrzebowania sklepów\nZaładunek oraz rozładunek samochodów ciężarowych\nWłaściwe rozmieszczenie towarów na powierzchni magazynu oraz porządek na stanowisku pracy\nDbałość o powierzony sprzęt, m.in. wózek widłowy oraz skaner\nPrzestrzeganie przepisów BHP\nInne zadania powierzone Ci przez przełożonego\n\nZapewnimy Ci to wszystko jeśli:\n\nPosiadasz kurs wózków widłowych (bądź prawo jazdy kat. B)\nPosiadasz książeczkę do celów sanitarno-epidemiologicznych (bądź jesteś gotowy do jej wyrobienia)\nJesteś gotowy do pracy zespołowej w systemie 3-zmianowym, zahaczającym o weekendy\nMasz zapał do pracy\n\nDołącz do nas już dziś!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Magazynier/pracownik mieszalni",
        "category": "olx",
        "phone": "509289019",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zadania:\nPrzyjmowanie i wydawanie produktów do i z magazynu\nZaładunek i rozładunek towarów (przesyłki dorbne i paletowe)\nKompletacja i pakowanie towaru na magazynie\nRozlicznie i wystawianie dokumentów magazynowych w systemie operacyjnym\nWymagania:\nUprawnienia do prowadzenia wózka widłowego (UDT)\nDoświadczenie w pracy na podobnym stanowisku\nUmiejętność dobrego zarządzania czasem\nDyspozycyjność\nZaangażowanie w wykonywaną pracę\nUczciwość (konieczności podpisania umowy o dopwiedzialności materialnej)\nOferujemy:\nStabilną prace\nSystem motywacyjny\nPracę w godz. 8 - 16 (poniedziałek-piątek)\nKontakt telefoniczny 509 289 019.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Sortowanie paczek Mszczonów, PN-WT, 25zł brutto/h",
        "category": "olx",
        "phone": "605510208",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "HR Work Force (APT 6474) jest szybko i dynamicznie rozwijającą się agencją na rynku pośrednictwa pracy.\n\n \n\nObecnie dla naszego Klienta, poszukujemy osób chętnych do podjęcia zlecenia w firmie zajmującej sortowaniem paczek w Mszczonowie!\n\n \n\nObowiązki:\n\nPrace magazynowe,\nSort przesyłek (układanie, pakowanie itp.),\nOdpowiednie zabezpieczenie towaru.\n\n \n\nOferujemy:\n\nUmowę zlecenie.\nAtrakcyjną stawkę godzinową 25 zł brutto/h,\nPracę w PONIEDZIAŁKI i WTORKI,\nGODZINY PRACY 21-2.\n\nWymagania:\n\nBrak przeciwwskazań do pracy fizycznej,\nBrak przeciwwskazań do pracy w nocy,\nDokładność, staranność, odpowiedzialność.\n\nZe względów BHP oferta przeznaczona dla mężczyzn.\n\n \n\nOsoby zainteresowane prosimy o przesłanie CV wraz z klauzulą o ochronie danych osobowych:\n\n \n\n\"Wyrażam zgodę na przetwarzanie moich danych osobowych w celach rekrutacji. Wyrażam zgodę na przetwarzanie moich danych osobowych w celach przyszłych rekrutacji. Wyrażam zgodę na przetwarzanie mojego numeru telefonu i adresu e-mail w celach obecnej i przyszłych rekrutacji.\"\n\nAdministratorem danych jest HR Work Force sp. z o.o. z siedziba we Wrocławiu ul. Purkyniego 1. Dane zbierane są dla potrzeb obecnej rekrutacji, a w przypadku wyrażenia przez Panią/Pana wyraźnej i dobrowolnej zgody także dla potrzeb przyszłych rekrutacji. Ma Pani/Pan możliwością wglądu do swoich danych oraz prawo do ich aktualizowania lub usunięcia zgodnie z ustawa z dnia 29 sierpnia 1997 r. o ochronie danych osobowych (Dz.U. z 2002 r. Nr 101, poz. 926, z pózn. zm.) Podanie danych w zakresie określonym przepisami ustawy z dnia 26 czerwca 1974 r. Kodeks Pracy oraz aktów wykonawczych jest dobrowolne, ale konieczne do przeprowadzenia rekrutacji. Dane osobowe będą przetwarzane do zakończenie procesu rekrutacji lub w przypadku wyrażenia zgody na przetwarzanie danych w celach przyszłych rekrutacji do momentu zakończenia przez HR Work Force sp. z o.o. z siedziba we Wrocławiu ul. Purkyniego 1 współpracy z klientami poszukujacymi pracowników tymczasowych.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Pracownik Magazynu / Terminalu MŁOCHÓW",
        "category": "olx",
        "phone": "605988254",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Co możemy Ci zaoferować:\n\nMożliwość bezpłatnego zdobycia uprawnień UDT,\nDwukrotnie wyższy niż ustawowy dodatek za pracę w godzinach nocnych,\nJasny zakres obowiązków oraz proces wdrożenia nowego pracownika,\nBenefity: opieka medyczna, karta multisport, wczasy pod gruszą,\nPensję podstawową + premię co miesiąc,\nPracę w dobrych warunkach socjalnych,\nZatrudnienie od zaraz,\nUmowę o pracę w międzynarodowej korporacji,\nMożliwość rozwoju i awansu w strukturach firmy.\n\nCo jest dla nas ważne:\n\nGotowość do pracy w systemie zmianowym,\nChęć do nauki i zdobywania doświadczenia u lidera na rynku,\nStaranność i dbałość o przepisy BHP dla bezpieczeństwa Twojego, całego naszego zespołu i towaru, który powierzają nam klienci.\n\nNa czym polega praca w magazynie w DB Schenker:\n\nRozładunek aut,\nRozwożenie towaru po powierzchni magazynu i wydanie go zgodnie z warunkami kontraktowymi,\nKompletacja towaru z użyciem mobilnych urządzeń,\nZabezpieczenie towaru do transportu (foliowanie, bindowanie),\nZaładunek aut.\n\nJeżeli masz CV – aplikuj poprzez formularz, a jeżeli wolisz porozmawiać z bezpośrednim przełożonym i poznać szczegóły przez złożeniem CV – zadzwoń.\n\nMiejsce pracy: Al. Kasztanowa 152, 05-831 Młochów\n\nKontakt: 605 988 254\n\nCo mówią pracownicy o pracy w DB Schenker?\n\nPracownik terminalu, 1,5 roku w DB Schenker\n\n„Pracujemy w miłej, bezstresowej atmosferze. Zgrany zespół tworzą ludzie młodzi z ambicjami oraz ci z wieloletnim doświadczeniem. Nowoczesne narzędzia i technologie pozwalają nam się rozwijać, a dzięki dynamice pracy przełamujemy rutynę. Dołącz do nas!\n\nBrygadzista, 7 lat w DB Schenker\n\n„DB Schenker stawia na rozwój pracowników, a także dobre warunki pracy. Każda nowa osoba może liczyć na wsparcie, otwartość i pomoc kolegów z zespołu.  Jeśli chcesz pracować w stabilnej i mocnej na rynku firmie, aplikuj do nas. Do zobaczenia w DB Schenker!”\n\nUWAGA: W formularzu aplikacyjnym, prosimy, wybierz rolę, na którą aplikujesz: Oddział WARSZAWA (MŁOCHÓW) - Operator Wózka Widłowego (Pracownik Terminalu)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Pracownik magazynu JEDNA ZMIANA Sokołów k. Warszawy - Od zaraz",
        "category": "olx",
        "phone": "795513311",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "AA Euro Group jest firmą specjalizującą się w rekrutacji managerów i wysoko wykwalifikowanych specjalistów. Prężnie działamy w takich sektorach jak: przemysł, budownictwo, logistyka. Jesteśmy obecni na rynku europejskim od 2005 roku, a w Polsce od 2010 r. Posiadamy również oddziały w Irlandii, Wielkiej Brytanii, Rumunii, Niderlandach i Chorwacji.\n\n \n\nAktualnie, dla naszego Klienta z branży kosmetycznej, poszukujemy pracowników magazynu (mężczyźni i kobiety).\n\nOFERUJEMY:\n\nzatrudnienie na podstawie umowy o pracę tymczasową (opłacamy wszystkie składki)\npracę jednozmianową pon. – pt., w godzinach 8 - 16\ndodatkową przerwę w pracy (+15 minut)\nstałe miesięczne wynagrodzenie 3500 zł brutto\nzniżki na kosmetyki i pozostałe artykuły\npracę lekką fizycznie\n\nOBOWIĄZKI:\n\netykietowanie produktów\nkompletacja zamówień i weryfikacja ich zgodności\npakowanie towarów\nskanowanie\nprzygotowanie opakowań do transportu\n\nOCZEKUJEMY:\n\nodpowiedzialności w wykonywaniu zadań\nskrupulatności, dokładności, zaangażowania\nbardzo dobrej organizacji pracy\numiejętności pracy samodzielnej oraz w zespole\nbrak przeciwwskazań do pracy stojącej i w ruchu\n\nOsoby zainteresowane podjęciem pracy od prosimy o wysłanie CV lub wysłanie smsa o treści PRACA na numer telefonu 795 513 312 - oddzwonimy\n\nAA EURO RECRUITMENT POLAND SP. Z O.O jest zarejestrowana w Krajowym Rejestrze Agencji Zatrudnienia pod numerem 6611.\n\nAA EURO RECRUITMENT POLAND SP. Z O.O is registered in the Krajowy Rejestr Agencji Zatrudnienia under the number 6611",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Magazynier- Operator Wózka Widłowego UDT- poniedziałek-piątek!",
        "category": "olx",
        "phone": "574575487",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Dla naszego Klienta, niekwestionowanego lidera w swoim sektorze oraz cenionego Pracodawcy poszukujemy kandydatów na stanowisko: \n\nMAGAZYNIER Z UPRAWNIENIAMI NA WÓZKI WIDŁOWE UDT\n\nLokalizacja: Tarczyn, woj. mazowieckie\n\nStawka: 4000-4400 zł/msc brutto + PREMIA\n\nWymiar pracy: Pełny Etat\n\nOferujemy:\n\nzatrudnienie w oparciu o umowę o pracę podpisywaną bezpośrednio przez naszego Kontrahenta,\npracę od poniedziałku do piątku w systemie 2-zmianowym: 06:00-14:00; 14:00-22:00,\nwynagrodzenie zasadnicze w wysokości: 4000-4400zł/msc brutto,\nsystem premiowy (dodatkowo do 15% premii),\natrakcyjny pakiet świadczeń socjalnych,\nniezbędne narzędzia pracy (wózki widłowe z ogrzewaną kabiną),\nposiłki regeneracyjne,\npełne szkolenie stanowiskowe oraz wsparcie podczas procesu adaptacji.\n\nZadania:\n\nwydawanie towaru Klientom oraz zewnętrznym magazynom,\nrozładunek dostarczanych towarów, kontrola jakościowa oraz ilościowa,\nprzestrzeganie zasad prawidłowego magazynowania,\nbieżące prowadzenie dokumentacji magazynowej,\npraca w sekcji mroźni.\n\nWymagania:\n\nuprawnienia na wózki wysokiego składowania UDT,\ndoświadczenie w pracy na magazynie,\nksiążeczka do celów sanitarno-epidemiologicznych,\nmile widziana znajomość systemu SAP oraz obsługi skanera,\ngotowość do podjęcia pracy w warunkach mroźniczych,\nsumienność oraz dokładność przy wykonywaniu obowiązków.\n\n \n\nOsoby zainteresowane prosimy o wysyłanie swojego CV poprzez formularz aplikacyjny lub kontakt pod numerem 574575487.\n\nZgodnie z obowiązującym prawem Workhouse4you Sp. z o.o. nie pobiera opłat od kandydatów za udział w procesach rekrutacyjnych.\n\n \n\nBardzo prosimy o dopisanie poniższej klauzuli do CV: \"Wyrażam zgodę na przetwarzanie moich danych osobowych i innych danych zawartych w mojej aplikacji oraz CV na potrzeby obecnego procesu rekrutacyjnego prowadzonego przez Workhouse4you Sp. z o.o. z siedzibą w Gdańsku, ul. Obrońców Wybrzeża 4d/16, 80-398 Gdańsk. Jestem świadomy/a przysługującego mi prawa do wycofania zgody, jak również faktu, że wycofanie zgody nie ma wpływu na zgodność z prawem przetwarzania, którego dokonano na podstawie zgody przed jej wycofaniem. Zgodę mogę odwołać przesyłając informację o wycofaniu zgody na adres: office(małpa)workhouse4you.pl\"\n\nWyrażenie niniejszej zgody jest dobrowolne, lecz niezbędne dla wzięcia udziału w procesie rekrutacji. W przypadku braku zgody, zgłoszenie rekrutacyjne nie zostanie uwzględnione w procesie rekrutacji.\n\nWorkhouse4you(c.23651)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Magazynier - Operator Wysokiego Składu",
        "category": "olx",
        "phone": "664153494",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "VESTA POLSKA Sp. z o.o. to jeden z największych przewoźników w rejonie Mazowsza. Spółka specjalizuje się w transporcie ładunków przestrzennych, a swoją stabilną pozycję rynkową zawdzięcza elastycznemu podejściu kompleksowej obsłudze klienta.\n\nObecnie poszukujemy osoby na stanowisko: \n\nMagazynier - Operator Wysokiego Składu\n\n \n\nMiejsce pracy: Błonie pod Warszawą (Kopytów, Prologis Park Błonie)\n\n \n\nCo będziesz robić?\n\nObsługiwać wysoki skład tj. wstawianie i ściąganie palet\nPrzyjmować towar od dostawców wraz z odpowiednią dokumentacją\nPrzygotowywać towar do wydania z magazynu\nPrzemieszczać towar wewnątrz magazynu\nPracować w systemie dwuzmianowym 7-15 i 12-20 od poniedziałku do piątku. Soboty dorywczo (100%)\n\nCzego oczekujemy:\n\nPosiadania uprawnień na wózki widłowe oraz uprawnień UDT\nBraku przeciwwskazań do pracy fizycznej\nRzetelności i uczciwości\nDobrej organizacji czasu pracy\n\n \n\nCo będzie Twoim dodatkowym atutem?\n\nDoświadczenie w pracy na podobnym stanowisku\n\nProsimy o dopisanie następującej klauzuli: Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Sortowanie przesyłek 15:00 - 02:00 (Zapewniamy dojazd do pracy)",
        "category": "olx",
        "phone": "577915111",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam.\n\nZatrudnię pracowników magazynowych do sortowania przesyłek w firmie kurierskiej.\n\nPraca w miejscowości Wypędy obok Janek\n\ndo Poniedziałku do Piątku w godz 15:00 - 02:00\n\nZapewniamy dojazd do pracy\nWynagrodzenie od 3400 netto\nUmowa o pracę\nZatrudnienie na stałe\nPraca głównie dla Panów\nPraca od zaraz\n\nPozdrawiam Sebastian\n\nkontakt tylko telefoniczny 577-915-111",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Pracownik magazynu, magazynier Łazy k.Magdalenki",
        "category": "olx",
        "phone": "227183817",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Spółka METRO to jeden z czołowych dystrybutorów okuć budowlanych i meblowych w Polsce. Handlem hurtowym zajmujemy się od 25 lat i od początku istnienia systematycznie umacniamy swoją pozycję rynkową. Świadczy o tym rosnąca z roku na rok wartość sprzedaży, jak również kolejni pozyskiwani klienci.\n\nRozwój firmy – to wynik dobrego zarządzania wspartego nowoczesnym systemem informatycznym. Własne centrum logistyczne zapewnia całkowitą niezależność w kształtowaniu polityki sprzedażowo-produktowej. Pewność terminowych dostaw gwarantuje współpraca z uznanymi firmami transportowo-logistycznymi.\n\nPraca każdego z nas ma bezpośredni wpływ na funkcjonowanie firmy.\n\nPracownik magazynu/ Magazynier\n\nMiejsce pracy: ŁAZY\n\nOpis stanowiska:\n\n• konfekcjonowanie/etykietowanie towaru,\n\n• przygotowanie paczek, palet na wysyłkę,\n\n• utrzymanie porządku na magazynie,\n\n• wykonywanie okresowych inwentaryzacji,\n\nWymagania\n\n• wykształcenie min. podstawowe\n\n• sumienność, skrupulatność\n\n• umiejętność pracy w zespole,\n\nCo zyskujesz pracując w METRO SJ:\n\n• umowę o pracę w dynamicznie rozwijającej się firmie,\n\n• stałe godziny pracy 8-16,\n\n• liczne benefity pozapłacowe,\n\n• możliwość rozwoju zawodowego,\n\n• pracę w świetnej atmosferze młodych osób.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "zatrudnie magazyniera",
        "category": "olx",
        "phone": "885642020",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma z długoletnim doświadczeniem szuka pracowników na stałe do pracy na magazynie w Ołtarzewie\n\nPraca polega na szykowaniu owoców i warzyw na wysyłki na sklepy oraz rozwiezieniu go na terenie Warszawy i okolic.\n\nPraca głównie na noce\n\nzachęcamy do wysyłania CV oraz kontaktu telefonicznego 697203060",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Magazynier, pracownik magazynu + Kat C",
        "category": "olx",
        "phone": "692426240",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Opis stanowiska:\n\nRealizacja zadań związanych z przygotowaniem towaru do wydania magazynowego\nTransporty do klientów  -samochodem IVECO ( kat. C )\nDbałość o czystość i porządek w miejscu pracy\nZnajomość i przestrzeganie przepisów BHP i P.poż oraz wewnętrznych procedur i instrukcji\n\n \n\nOferujemy:\n\nZatrudnienie w oparciu o umowę o pracę w dynamicznie rozwijającej się firmie\nStabilne środowisko pracy, dobrą organizację zadań oraz miłą atmosferę w pracy\n\n \n\nOczekiwania:\n\nGotowość i chęci do pracy fizycznej\nMotywacja do pracy i nabywania nowych umiejętności\nDyspozycyjność do pracy ( Praca od 8 do 16 - od pon - pt )\nUprawnienia na wózki widłowe\nWymagana Kategoria  C ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Pracownik magazynowy",
        "category": "olx",
        "phone": "882907245",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Miejsce pracy: Młochów\n\nManpower (Agencja zatrudnienia nr 412) to globalna firma o ponad 70-letnim doświadczeniu, działająca w 82 krajach. Na polskim rynku jesteśmy od 2001 roku i obecnie posiadamy prawie 35 oddziałów w całym kraju. Naszym celem jest otwieranie przed kandydatami nowych możliwości, pomoc w znalezieniu pracy odpowiadającej ich kwalifikacjom i doświadczeniu. Skontaktuj się z nami - to nic nie kosztuje, możesz za to zyskać profesjonalne doradztwo i wymarzoną pracę!\n\nDla jednego z naszych klientów poszukujemy osoby na stanowisko:\n\nPracownik magazynowy\n\nZakres obowiązków\n• Kompletacja towarów zgodnie z zamówieniami\n• Zabezpieczanie towaru przed uszkodzeniami\n• Utrzymywanie porządku w strefie kompletacji\n• Rozładunek i załadunek towaru\n• Praca przy użyciu skanerów\n• Dokumentacja zdjęć kompletowanych zamówień\n• Prace ogólno-magazynowe zlecone przez przełożonych\n\nOczekiwania\n• Odpowiedzialność i sumienność\n• Doświadczenie w pracy na podobnym stanowisku - mile widziane\n\nOferta\n• Dłuższa perspektywa współpracy\n• Praca na 2 zmiany\n• Atrakcyjne wynagrodzenie\n• Benefity pozapłacowe (m.in. MultiSport, pakiet ubezpieczeniowy, zniżki na artykuły spożywcze, dostęp do pakietu medycznego\n\nNr ref.: PMA/063/ABR\nOferta dotyczy pracy tymczasowej",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Pruszków 20,30 zł/h Pracownik Sortowni Przesyłek Pracownik Magazynu",
        "category": "olx",
        "phone": "508028868",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Oferta pracy na stanowisku: Pracownik Sortowni / Pracownik Magazynu\n\nMiejsce pracy: Pruszków, przy ul. Groblowa 4.\n\nCIEKAWA PRACA, ATRAKCYJNE WYNAGRODZENIE!!!\n\nZADZWOŃ I ZAPYTAJ!\n\nZADANIA:\n\n• Przyjmowanie, rozładunek i załadunek samochodów z przesyłkami\n\n• Sortowanie przesyłek \n\n• Przygotowanie przesyłek do załadunku – pakowanie przesyłek\n\ndo opakowań zbiorczych, tworzenie palet\n\nOFERUJEMY:\n\n• Zatrudnienie w oparciu o pełnoskładkową umowę zlecenie\n\n• Wynagrodzenie 20,30 zł brutt/h (19,30 zł podstawa + 1 zł dodatek frekwencyjny)\n\n• Zdobycie cennego doświadczenia zawodowego w znanej firmie o ugruntowanej pozycji na rynku z sektora logistycznego\n\n• Pracę: poniedziałek – piątek 15:00-23:00, 22:00-05:00\n\nWYMAGANIA:\n\n• Umiejętności pracy w zespole\n\n• Sumienności i motywacja do pracy\n\n• Chęć do pracy fizycznej.\n\nProsimy również o dopisanie w swojej aplikacji następującej klauzuli:\n\n(1 klauzula)\n\nKlikając w przycisk „Wyślij” lub wysyłając zgłoszenie rekrutacyjne zawierające poniższą klauzulę, zgadzasz się na przetwarzanie przez Inwork Sp. z o.o. Twoich danych osobowych zawartych w zgłoszeniu rekrutacyjnym w celu prowadzenia rekrutacji na stanowisko wskazane w ogłoszeniu. W każdym czasie możesz cofnąć zgodę, kontaktując się z nami pod adresem privacy(małpa)inwork.pl Twoje dane osobowe wskazane w Kodeksie pracy lub innych ustawach szczegółowych (według wymogów ogłoszenia), przetwarzamy w oparciu o przepisy prawa i ich podanie jest konieczne do wzięcia udziału w procesie rekrutacji. Pozostałe dane osobowe (np. wizerunek) przetwarzamy na podstawie Twojej dobrowolnej zgody, którą wyraziłaś/łeś wysyłając nam zgłoszenie rekrutacyjne i ich podanie nie ma wypływu na możliwość udziału w rekrutacji. Możemy przetwarzać twoje dane osobowe zawarte w zgłoszeniu rekrutacyjnym także w celu ustalenia, dochodzenia lub obrony przed roszczeniami, jeżeli roszczenia dotyczą prowadzonej przez nas rekrutacji. W tym celu będziemy przetwarzać Twoje dane osobowe w oparciu o nasz prawnie uzasadniony interes, polegający na ustaleniu, dochodzeniu lub obrony przed roszczeniami w postępowaniu przed sądami lub organami państwowymi.\n\nMasz prawo dostępu do swoich danych, w tym uzyskania ich kopii, sprostowania danych, żądania ich usunięcia, ograniczenia przetwarzania, wniesienia sprzeciwu wobec przetwarzania oraz przeniesienia podanych danych (na których przetwarzanie wyraziłeś zgodę) do innego administratora danych. Masz także prawo do wniesienia skargi do Generalnego Inspektora Ochrony Danych Osobowych (w przyszłości: Prezesa Urzędu Ochrony Danych Osobowych). Cofnięcie zgody pozostaje bez wpływu na zgodność z prawem przetwarzania, którego dokonano na podstawie zgody przed jej cofnięciem.\n\nTwoje dane osobowe przetwarzamy w celu prowadzenia rekrutacji na stanowisko wskazane w ogłoszeniu przez okres 12 miesięcy, a gdy wyraziłeś zgodę w na udział w przyszłych rekrutacjach przez okres 60 miesięcy. Twoje dane przekazane będą do Inwork Sp. z o.o. Nie przekazujemy Twoich danych osobowych poza Europejski Obszar Gospodarczy. W razie pytań skontaktować się możesz z nami pod adresem privacy(małpa)inwork.pl\n\n(2 klauzula)\n\nAkceptując klauzulę lub wysyłając zgłoszenie rekrutacyjne zawierające poniższą klauzulę, zgadzasz się na przetwarzanie przez Inwork Sp. z o.o. danych osobowych zawartych w Twoim zgłoszeniu rekrutacyjnym na stanowisko wskazane w ogłoszeniu rekrutacyjnym (zgoda obejmuje dodatkowe dane osobowe które nie zostały wskazane w kodeksie pracy lub innych przepisach prawa, np. Twój wizerunek, zainteresowania). Dane osobowe wskazane w kodeksie pracy lub. Innych przepisach prawa (m.in. Twoje imię, nazwisko, doświadczenie zawodowe, wykształcenie) przetwarzamy na podstawie przepisów prawa.\n\nJeśli nie chcesz, abyśmy przetwarzali dodatkowe dane o Tobie, nie umieszczaj ich w swoich dokumentach. \n\n(3 klauzula)\n\nZgody są dobrowolne i nie mają wpływu na możliwość udziału w rekrutacji. W każdym momencie możesz cofnąć udzieloną zgodę, wysyłając e-mail na adres hr(małpa)inwork.pl co nie ma wpływu na zgodność z prawem przetwarzania dokonanego przez cofnięciem zgody.\n\n(4 klauzula zgoda na przyszłe rekrutacje)\n\nZgadzam się na przetwarzanie przez Inwork Sp. z o.o. moich danych osobowych zawartych w zgłoszeniu rekrutacyjnym dla celów przyszłych rekrutacji prowadzonych przez Inwork Sp. z o.o\n\nUprzejmie informujemy, iż zastrzegamy sobie prawo kontaktu jedynie z wybranymi osobami.\n\nAgencja Zatrudnienia (nr licencji 14 007)\n\nTwój konsultant HR Inwork Iwona  \n\ntel. kom.  508 028 868",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Magazynier Tir części",
        "category": "olx",
        "phone": "695444102",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię osobę na stanowisko magazynier do hurtowni z częściami do samochodów ciężarowych. Od kandydatów oczekuję zaangażowania, prawa jazdy kat b oraz chęci do pracy. Oferuję godne wynagrodzenie, możliwość rozwoju oraz zatrudnienie w oparciu o umowę o pracę. Zainteresowanych proszę o kontakt mailowy",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "25 zł / h - Magazynier - praca od 06.09",
        "category": "olx",
        "phone": "666957434",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Pracownik magazynowy\n\nLokalizacja: Pruszków\n\nOpis stanowiska:\n\n• przyjmowanie i przygotowanie towaru,\n\n• zbieranie i kompletacja towaru.\n\nWymagania: \n\n• gotowość do pracy w godz. 08.00 - 16.00,\n\n• chęci do pracy.\n\nOferujemy:\n\n• wynagrodzenie podstawowe 25 zł/h brutto,\n\n• możliwość nadgodzin dla chętnych\n\n• umowa zlecenie na początek.\n\nZainteresowane osoby prosimy o przesłanie CV.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Magazynier, 23 zł brutto BEZ nocnych zmian",
        "category": "olx",
        "phone": "696882143",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma Thanos sp. z o.o. zaprasza do współpracy !!!\n\nPraca na magazynie elektronarzędzi\n\nOferujemy:\n\nAtrakcyjne wynagrodzenie 23 zł brutto/godz.\n\nPracę w sobotę / święta  - płacone są setki !!!\n\nKomfortowe warunki pracy\n\nPraca w Moszna Parcela (5 km od Pruszkowa oraz 5 km od Brwinowa)\n\nWymagania: \n\nDoświadczenie na podobnym stanowisku (mile widziane)\n\nZaangażowanie i chęć pracy\n\nOgraniczenia wiekowe od 20 do 45 lat\n\nZakres obowiązków:\n\nPrace magazynowe polegające na kompletacji zamówień:\n\npakowanie,\n\nfoliowanie,\n\nobsługa skanera,\n\nlekkie prace fizyczne,\n\nPraca dwuzmianowa 6.00 - 14.00 i 14.00 - 22.00.\n\nPraca od już!\n\nOdzież roboczą zapewnia pracodawca\n\nW razie zainteresowania prosimy o kontakt : 696 882 143 ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Kierownik magazynu/sklepu",
        "category": "olx",
        "phone": "605333435",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Opis\n\nFirma Artpomp zatrudni na stanowisko:\n\nKIEROWNIK MAGAZYNU\n\nGłówne zadania\n\nnadzór nad pracą magazynu i sklepu\nznajomość procedur magazynowych i zasad magazynowania\nodpowiedzialność za prowadzenie właściwej gospodarki magazynowej\nnadzór nad dokumentacją magazynową\nzapewnienie sprawnego działania Magazynu \nobsługa klientów\nnadzór nad stanami magazynowymi\n\nOczekujemy:\n\npraktyczna znajomość pracy magazynu oraz procedur magazynowych\nzdolności organizacyjne oraz umiejętnosći rozwiązywania problemów\numiejętność zarządzania \nzdolności komunikacyjne i organizacyjne\n\noferujemy:\n\nstabilne zatrudnienie \natrakcyjne wynagrodzenie\numowę o pracę na pełny etat \n\nZainteresowanych zapraszamy do kontaktu.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Pracownik kompletacji w nowym magazynie Allegro + bezpłatny transport",
        "category": "olx",
        "phone": "660451062",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Manpower (Agencja zatrudnienia nr 412) to globalna firma o ponad 70-letnim doświadczeniu, działająca w 82 krajach. Na polskim rynku jesteśmy od 2001 roku i obecnie posiadamy prawie 35 oddziałów w całym kraju. Naszym celem jest otwieranie przed kandydatami nowych możliwości, pomoc w znalezieniu pracy odpowiadającej ich kwalifikacjom i doświadczeniu. Skontaktuj się z nami - to nic nie kosztuje, możesz za to zyskać profesjonalne doradztwo i wymarzoną pracę!\n\nDla jednego z naszych klientów poszukujemy osoby na stanowisko:\n\nPracownik kompletacji w nowym magazynie Allegro + bezpłatny transport\n\nZakres obowiązków\nMiejsce pracy: Adamów\n \n• Realizacja zamówień z platformy sprzedażowej\n• Kompletowanie i pakowanie paczek\n• Kontrola pakowanych zamówień\n• Praca ze skanerem magazynowym\n\nOczekiwania\n• Dyspozycyjność do pracy systemie 2-zmianowym\n• Orzeczenie sanepid - bądź gotowość do jego wyrobienia\n\nOferta\n• Wynagrodzenie do 24 zł/h brutto\n• Posiłki za 1 zł\n• Dodatkowe bonusy za udział w akcjach sezonowych\n• Bezpłatny transport pracowniczy: Płońsk, Nasielsk, Nowy Dwór Mazowiecki, Sochaczew, Błonie, Grójec, Żyrardów\n• Wolne weekendy\n• Umowa o pracę\n• Nie potrzebujesz doświadczenia - zdobędziesz je z nami!\n•  \nPracuj w magazynie Allegro! \nNapisz sms ’Adamów’ na numer 660 451 062 - oddzwonimy z ofertą! \n \nNr. ref. PKZ/097/KKA\nOferta dotyczy pracy tymczasowej",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Magazynier Operator wózka Widłowego/ Kierowca KAT B",
        "category": "olx",
        "phone": "690377333",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma Kow-Met zajmująca się produkcją, dystrybucją i montażem ogrodzeń panelowych poszukuje pracowników.\n\nDział techniczny, stanowiska:\n\nkierowca  - magazynier\n\nPraca na magazynie - zakres obowiązków\n\nPrzyjęcie oraz wydanie towaru - rozładunek i załadunek wózkiem widłowym \n\nKompletacja zamówień do wydania towaru .\n\nSpawacz - Pomocni spawacza \n\nSpawanie Metodą Mig, Elementy ogrodzeń bramy oraz furtki. Cięcie materiału przygotowanie na cynkowanie oraz lakierowanie \n\nOferujemy:\n\n· Stabilne zatrudnienie w oparciu o umowę o pracę 1/1 etat\n\n· Pracę w przyjaznej atmosferze\n\n· Premię uznaniowe / motywacyjne\n\nJeżeli jesteś osobą zaangażowaną, pełną energii i tak jak my podchodzisz z pasją do wykonywanej pacy, dołącz do naszego zespołu.\n\nPoszukujemy fachowców z doświadczeniem, ale i młodych, głodnych wiedzy osób, gotowych związać się z naszą firmą na lata.\n\nJak aplikować na interesujące Cie stanowisko?\n\n· Wyślij do nas wiadomość, w tytule wpisując stanowisko na które aplikujesz\n\n· Do wiadomości dołącz CV z klauzulą o przetwarzaniu danych osobowych i RODO\n\n· W treści wiadomości napisz kilka słów o sobie.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Magazynier w-wa Ursus (skład budowlany)",
        "category": "olx",
        "phone": "509201072",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy osoby na magazyniera na sklad materiałów budowlanych,  na stanowisku: \n\nMagazynier\n\nWymagana umiejętność współpracy w zespole. \n\nObowiązki\n\nprzyjmowanie dostaw\nrozliczanie stanów magazynowych\nwysyłka zamówionych towarów\n\nOferujemy:\n\npo okresie próbnym 3 mies. umowa o pracę \nstałe atrakcyjne wynagrodzenie \n\nAktualne uprawnienia na wózek widłowy",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Magazynier/ Pakowacz - PRACA DODATKOWA",
        "category": "olx",
        "phone": "695902531",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "PRACA DODATKOWA\n\nDLA PAŃ I PANÓW!\n\nDla jednego z naszych klientów poszukujemy osób zainteresowanych podjęciem pracy dodatkowej/ dorywczej przy kompletacji, pakowaniu produktów, CO- PACKING.\n\nProsta i lekka praca polegająca na pakowaniu produktów do opakowań, dla osób w każdej grupie wiekowej (od 18 roku życia).\n\nPraca w systemie dwuzmianowym ( 6- 14, 14- 22), od poniedziałku do piątku\n\nWynagrodzenie: 18.30 zł/h brutto\n\nNie wymagamy żadnego doświadczenia!\n\nOsoby zainteresowane zapraszamy do kontaktu:\n\npod nr telefonu: 695 902 531\nSMS o treści \"MSZCZONÓW' pod nr 695 902 531\n\nJeżeli chcesz przesłać do nas swoje CV pamiętaj o przesyłaniu go z klauzulą:\n\n„Wyrażam zgodę na przetwarzanie moich danych osobowych w celu rekrutacji zgodnie z art. 6 ust. 1 lit. a Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (ogólne rozporządzenie o ochronie danych)”.\n\nZapoznaj się!\n\nINFORMACJA NA TEMAT ADMINISTRATORA DANYCH\n\nZgodnie z art. 13 ust. 1 i 2 rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (ogólne rozporządzenie o ochronie danych) (Dz. Urz. UE L 119 z 04.05.2016, str. 1), dalej „RODO”, informuję, że:\n\nAdministratorem Pani/Pana danych osobowych jest AWG Sp. z o. o. z siedzibą ul. Żmigrodzka 244, 51-131 Wrocław, zwana dalej Spółką;\nPani/Pana dane osobowe przetwarzane będą w celu rekrutacji na podstawie art. 6 ust 1 pkt a wyrażeniu zgody na poczet przyszłych rekrutacji na podstawie art. 6 ust 1 pkt a, a w zakresie wizerunku – art. 9 ust. 1 pk;\nPodane przez Panią/Pana dane osobowe będą udostępniane potencjalnym pracodawcom jeśli wyraził Pan/Pani stosowną zgodę w treści swojej aplikacji;\nPani/Pana dane osobowe będą przechowywane do czasu cofnięcia zgody na przetwarzanie jego danych w tych celach, ale w przypadku rekrutacji nie dłużej niż 2 lata;\nPosiada Pani/Pan prawo dostępu do treści swoich danych oraz prawo ich sprostowania, usunięcia, ograniczenia przetwarzania, prawo do przenoszenia danych, prawo wniesienia sprzeciwu, prawo do cofnięcia zgody w dowolnym momencie bez wpływu na zgodność z prawem przetwarzania, którego dokonano na podstawie zgody przed jej cofnięciem;\nPosiada Pan/Pani prawo wniesienia skargi do organu nadzorczego gdy uzna Pani/Pan, iż przetwarzanie danych osobowych Pani/Pana dotyczących narusza przepisy ogólnego rozporządzenia o ochronie danych osobowych z dnia 27 kwietnia 2016 r.;\nPodanie przez Pana/Panią danych osobowych jest dobrowolne;\nPani/Pana dane nie będą przetwarzane w sposób zautomatyzowany w tym również w formie profilowania;\nPodane przez Panią/Pana dane osobowe nie będą przekazywane do państwa trzeciego;\nPodanie danych w zakresie wskazanym w dokumentach aplikacyjnych jest dobrowolne, ale niezbędne w celu uczestnictwa w procesach rekrutacyjnych.\n\n \n\nAWG Sp. z o.o. jest działającą na rynku polskim agencją doradztwa personalnego i pracy tymczasowej nr 10052.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Operator Wózka Widłowego - Magazynier Odrzywołek",
        "category": "olx",
        "phone": "0468570268571309395",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Będziesz odpowiedzialny za: \n\nwykonywanie operacji magazynowych (recepcja, składowanie, przygotowywanie zamówień, załadunki i rozładunki towarów, kompletacja) zgodnie z obowiązującymi w firmie procedurami,\nprawidłowe przygotowanie i obieg dokumentów związanych z pracą w magazynie,\nraportowanie przełożonemu o napotkanych niezgodnościach i udział w działaniach korygujących.\n\nBędziesz idealnym kandydatem jeśli:\n\njesteś dyspozycyjny - systemem pracy zmianowej, praca w systemie 4-brygadowym (dwa dni pracy po 12 godzin i dwa dni wolne)\njesteś odpowiedzialny, rzetelnie wykonujesz swoją pracę,\nmasz doświadczenie oraz uprawnienia na wózki wysokiego składowania UDT - warunek konieczny.\n\nMiejsce pracy: Odrzywołek 28D.\n\nW czasie wolnym od pracy\n\nDostęp do interesujących zajęć finansowanych przez pracodawcę: MyBenefit: w tym karnety na basen, karta Multisport, bilety do kina i teatru, spotkania integracyjne/ festyny rodzinne i wiele innych atrakcji.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Operator Wózka Widłowego – Magazynier",
        "category": "olx",
        "phone": "571309395",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "SZUKASZ PRACY? \n\nFirma FM LOGISTIC poszukuje pracowników na stanowisko: OPERATOR WÓZKA WIDŁOWEGO (Oferta pracy skierowana również do osób bez doświadczenia w obsłudze wózków widłowych,) \n\nMiejsce pracy: Mszczonów, Ługowa 30 \n\nMile widziane uprawnienia UDT. Zaproponujemy Ci pracę dostosowaną do Twoich umiejętności, doświadczenia i kompetencji, czeka na Ciebie praca w działach wysyłki towarów, kompletacji lub przyjęcia dostaw do magazynu. \n\nBędziesz idealnym kandydatem jeśli:\n\njesteś dyspozycyjny - systemem pracy zmianowej, (praca w systemie 12 godzinnym lub w systemie 3-zmianowym),\njesteś odpowiedzialny, rzetelnie wykonujesz swoją pracę.\n\n.\n\nBędziesz odpowiedzialny za: \n\nwykonywanie operacji magazynowych (recepcja, składowanie, przygotowywanie zamówień, załadunki i rozładunki towarów, kompletacja) zgodnie z obowiązującymi w firmie procedurami,\nprawidłowe przygotowanie i obieg dokumentów związanych z pracą w magazynie,\n raportowanie przełożonemu o napotkanych niezgodnościach i udział w działaniach korygujących.\n\nW czasie wolnym od pracy:\n\nDostęp do interesujących zajęć finansowanych przez pracodawcę: MyBenefit: w tym karnety na basen, karta Multisport, bilety do kina i teatru, spotkania integracyjne/ festyny rodzinne i wiele innych atrakcji.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Operator wózka widłowego - UMOWA PRZEZ FIRMĘ - Nadarzyn",
        "category": "olx",
        "phone": "576313397",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "APT JAGA Temp Sp. z o.o. (podmiot wpisany do rejestru agencji zatrudnienia Certyfikat Marszałka Województwa Mazowieckiego nr 7363) zatrudni osoby do pracy na stanowisku:\nOperator wózka widłowego\nMiejsce pracy: Nadarzyn\n\nOperator wózka widłowego - UMOWA PRZEZ FIRMĘ - Nadarzyn\n\nOFERUJEMY:\n• bezpośrednie zatrudnienie przez Firmę\n• umowę o pracę (pierwsza umowa na 1 rok)\n• wynagrodzenie - jesteśmy ciekawi Twoich oczekiwań finansowych :)\n• premię wydajnościową do 10% (liczona od pierwszego miesiąca pracy)\n• dodatek za dojazd do pracy - 300 zł brutto\n• pracę w godz.: 6-14, 14-22 i 22-6 (wg ustalonego grafiku)\n• pracę od zaraz\n\nZADANIA:\n• obsługa wózka widłowego wysokiego lub niskiego składu w centrum logistycznym\n• zlecone czynności magazynowe\n\nWYMAGANIA:\n• uprawnienia do obsługi wózka widłowego UDT - wymóg konieczny\n• mile widziane doświadczenie w obsłudze wózka widłowego,\n• dyspozycyjność do podjęcia pracy w systemie zmianowym,\n• dyspozycyjność do podjęcia pracy od zaraz.\nOsoby zainteresowane prosimy o przesłanie CV lub kontakt tel.: 576-313-397.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Pracownik magazynu – stała, rozwojowa praca – 3650 zł brutto mies.",
        "category": "olx",
        "phone": "668527397",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Miejsce pracy: Chlebnia k. Grodziska Mazowieckiego\n\nManpower (Agencja zatrudnienia nr 412) to globalna firma o ponad 70-letnim doświadczeniu, działająca w 82 krajach. Na polskim rynku jesteśmy od 2001 roku i obecnie posiadamy prawie 35 oddziałów w całym kraju. Naszym celem jest otwieranie przed kandydatami nowych możliwości, pomoc w znalezieniu pracy odpowiadającej ich kwalifikacjom i doświadczeniu. Skontaktuj się z nami - to nic nie kosztuje, możesz za to zyskać profesjonalne doradztwo i wymarzoną pracę!\n\nDla jednego z naszych klientów poszukujemy osoby na stanowisko:\n\nPracownik magazynu – stała, rozwojowa praca – 3650 zł brutto mies.\n\nZakres obowiązków\nGłówne obowiązki jakie będziesz wykonywać podczas pracy to: kompletacja zamówień, przygotowanie towaru do wysyłki, lokowanie artykułów w strefach magazynowych.\n\nSzukamy osób które będą gotowe rozpocząć pracę w nowoczesnym magazynie w systemie 3 zmian oraz w dwa weekendy pracujące w zamian za dni wolne w tygodniu.\n\nOczekiwania\nJeśli szukasz stałej, rozwojowej pracy - zapraszamy do kontaktu. Nie potrzebujesz uprawnień, liczą się Twoje chęci i motywacja do pracy.\n\nWymagamy jedynie dyspozycyjności do pracy zmianowej i pozytywnego nastawienia!\n\nOferta\n• Stabilna praca w nowoczesnym centrum logistycznym\n• Umowa o pracę bezpośrednio z pracodawcą\n• Szkolenie wdrażające oraz możliwość rozwoju w nowoczesnym magazynie logistycznym\n• Benefity Premium\n• Benefity Premium (atrakcyjne dofinansowanie karty sportowej, ubezpieczenia grupowego, opieki medycznej, bogaty fundusz socjalny)\n• Praca w przyjemnej atmosferze\n• Opieka Konsultanta Manpower podczas całego procesu rekrutacji\n\nOsoby zainteresowane prosimy o aplikację lub przesłanie SMS o treści ’KOMPLETACJA’ na numer 668 527 397.\n\nNumer ref.: PMA/063/KWO\nOferta dotyczy pracy stałej",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Pracownik magazynu ! Grodzisk Mazowiecki!",
        "category": "olx",
        "phone": "887373973",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "W związku z rozwojem firmy poszukujemy osoby na stanowisko pracownik magazynu - operator wózka widłowego:\n\n \n\nZakres zadań: \n\nRozładunek dostaw paletyzowanych i transfery palet, rozkładanie i paczkowanie towaru.\nNadzór nad obiegiem towaru\nPrzyjmowanie i wydawanie towarów w magazynie, kompletacja zamówień\nTerminową obsługę dostaw i wysyłek\nKontrolę stanów faktycznych przewożonych towarów z dokumentami wysyłkowymi\nKompletację towaru na podstawie WZ\nCzynne uczestnictwo w inwentaryzacjach\nPrace porządkowe na magazynie i na około firmy\n\nWymagania: \n\nWykształcenie średnie preferowane\nCzynne prawo jazdy kategorii B\nMile widziane doświadczenie na podobnym stanowisku\nUprawnienia na wózki jezdniowe podnośnikowe i unoszące - warunek konieczny!\nSprawna znajomość obsługi komputera \nZnajomość SAP będzie atutem\nUmiejętności interpersonalne\nUmiejętność oceniania i rozwiązywania problemów\nDyspozycyjność\nSamodzielność, chęć do pracy i dobra organizacja pracy         \nwprowadzanie i wystawianie dokumentów magazynowych\n\nOferujemy:\n\numowę o pracę\nMożliwość pracy w dynamicznym zespole i zdobycia doświadczenia\nWynagrodzenie adekwatne do doświadczenia i zajmowanego stanowiska\n\nCV proszę wysyłać na adres mailowy przypisany w formularzu.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Konserwator szalunków-pracownik warsztatu| prace ślusarskie",
        "category": "olx",
        "phone": "607423998",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Nasz Klient to międzynarodowa Firma dostarczająca kompleksowe rozwiązania z zakresu deskować i rusztowań dla budownictwa. W związku z rozwojem firmy i dużą ilością zamówień do zespołu poszukujemy pracowników na stanowisko: Konserwator szalunków-pracownik warsztatu.\n\nMiejsce pracy: Brwinów, Koszajec.\n\n\n\n\nZakres obowiązków:\n\nNaprawa płyt szalunkowych poprzez:\n\nczyszczenie ram,\nwstępna weryfikacja stanu oraz dóbr procesu technologicznego,\nwymiana sklejki lub flekowanie,\nszpachlowanie,\nnitowanie sklejki,\nznakowanie blatów,\nflekowanie większych ubytków sklejki,\nwygładzanie powierzchni,\nuzupełnianie silikonem braków pomiędzy ramka a sklejką.\n\n\n\nWymagania:\n\ndoświadczenie w pracy z elektronarzędziami lub przy konserwacji/obróbce drewna lub ślusarstwie,\ngotowość do pracy dwuzmianowej,\ndokładność, \numiejętność pracy w zespole,\ndbałość o przestrzeganie zasad bezpieczeństwa pracy,\nmile widziane uprawnienia UDT do obsługi urządzeń transportu bliskiego oraz/lub kierowania wózków widłowych.\n\n\n\nOferujemy:\n\nstabilne zatrudnienie w ramach umowy o pracę bezpośrednio u naszego Klienta,\npracę od poniedziałku do piątku (wolne weekendy),\npracę na dwie zmiany: 05:30-13:30 oraz 14:30-22:30,\nwynagrodzenie wypłacane zawsze na czas,\nsystem premiowy,\nszeroki pakiet medyczny finansowany przez pracodawcę.\n\n\n\nAplikuj już dziś za pomocą portalu!\n\nJeśli potrzebujesz więcej informacji- Służymy pomocą! \n\nDzwoń na numer: 607-423-998!\n\n\n\n\nAdministratorem dobrowolnie podanych przez Panią/Pana danych osobowych jest AWG Sp. z o.o. z siedzibą przy ul. Żmigrodzka 244 51-131 Wrocław. Dane osobowe będą przetwarzane wyłącznie w celach prowadzenia i administrowania procesami rekrutacyjnymi, a w szczególności w związku z poszukiwaniem dla Pani/Pana ofert pracy, ich przedstawianiem, archiwizacją i wykorzystywaniem w przyszłych procesach rekrutacyjnych dokumentów zawierających dane osobowe. Dane mogą być udostępniane podmiotom upoważnionym na podstawie przepisów prawa oraz, po wyrażeniu zgody, potencjalnym pracodawcom do celów związanych z procesem rekrutacji. Przysługuje Pani/Panu prawo dostępu do treści swoich danych oraz ich poprawiania",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Magazynier | od zaraz | Ożarów Mazowiecki | 21 zł brutto",
        "category": "olx",
        "phone": "881605649",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Obecnie poszukujemy osób na stanowisko :\n\nMagazynier\n\nWynagrodzenie wypłacane przelewem na konto zaraz po wykonanej pracy. \n\nMiejsce Realizacji: ul. Artura i Franciszka Radziwiłłów \n\nZakres obowiązków:\n\n-Załadunek oraz rozładunek towarów dostarczonych do magazynu \n\n-Rozmieszczanie i układanie towaru w magazynie\n\n-Prowadzenie dokumentacji magazynowej \n\nWymagania: \n\n-Prawo jazdy kat. B\n\n-Obuwie – pełne, utwardzone \n\nZapraszamy do kontaktu przez w wiadomość prywatną lub pod nr tel 607964576 lub 881 605 649 ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Sortowanie paczek Mszczonów, PN-PT, 20 zł/h brutto",
        "category": "olx",
        "phone": "725900870",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "HR Work Force (APT 6474) jest szybko i dynamicznie rozwijającą się agencją na rynku pośrednictwa pracy.\n\nObecnie dla naszego Klienta, poszukujemy osób chętnych do podjęcia zlecenia w firmie zajmującej sortowaniem paczek w Mszczonowie!\n\nObowiązki:\n\n·        Prace magazynowe,\n\n·        Sort przesyłek (układanie, pakowanie itp.),\n\n·        Odpowiednie zabezpieczenie towaru.\n\nOferujemy:\n\n·        Umowę zlecenie,\n\n·        Atrakcyjną stawkę godzinową 20 zł brutto/h,\n\n·        Pracę od poniedziałku do piątku (tylko godziny nocne)\n\n·        GODZINY PRACY: 20:00-04:00.\n\nWymagania:\n\n·        Brak przeciwwskazań do pracy fizycznej,\n\n·        Brak przeciwwskazań do pracy w nocy,\n\n·        Dokładność, staranność, odpowiedzialność.\n\n·      Ze względów BHP oferta przeznaczona dla mężczyzn.\n\nOsoby zainteresowane prosimy o przesłanie CV wraz z klauzulą o ochronie danych osobowych:\n\n\"Wyrażam zgodę na przetwarzanie moich danych osobowych w celach rekrutacji. Wyrażam zgodę na przetwarzanie moich danych osobowych w celach przyszłych rekrutacji. Wyrażam zgodę na przetwarzanie mojego numeru telefonu i adresu e-mail w celach obecnej i przyszłych rekrutacji.\"\n\nAdministratorem danych jest HR Work Force sp. z o.o. z siedziba we Wrocławiu ul. Purkyniego 1. Dane zbierane są dla potrzeb obecnej rekrutacji, a w przypadku wyrażenia przez Panią/Pana wyraźnej i dobrowolnej zgody także dla potrzeb przyszłych rekrutacji. Ma Pani/Pan możliwością wglądu do swoich danych oraz prawo do ich aktualizowania lub usunięcia zgodnie z ustawa z dnia 29 sierpnia 1997 r. o ochronie danych osobowych (Dz.U. z 2002 r. Nr 101, poz. 926, z pózn. zm.) Podanie danych w zakresie określonym przepisami ustawy z dnia 26 czerwca 1974 r. Kodeks Pracy oraz aktów wykonawczych jest dobrowolne, ale konieczne do przeprowadzenia rekrutacji. Dane osobowe będą przetwarzane do zakończenie procesu rekrutacji lub w przypadku wyrażenia zgody na przetwarzanie danych w celach przyszłych rekrutacji do momentu zakończenia przez HR Work Force sp. z o.o. z siedziba we Wrocławiu ul. Purkyniego 1 współpracy z klientami poszukującymi pracowników tymczasowych.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "operator wózka widłowego/wysoki skład- WYSOKIE ZAROBKI!!!wolne weekend",
        "category": "olx",
        "phone": "48697140403",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Masz doświadczenie jako operator wózków widłowych wysokiego składowania?\n\nChciałbyś pracować w firmie, w której będziesz miał wolne weekendy, a dodatkowo możesz liczyć na dofinansowanie do obiadów?\n\nZależy Ci na pracy w miłej atmosferze, gdzie współpracownicy są dla siebie życzliwi?\n\nZa Twoją pracę gwarantujemy Ci:\n\n        umowę o pracę tymczasową (ZUS, urlop, itp.)\n        atrakcyjne wynagrodzenie - 25,30 PLN/h\n        atrakcyjne premie miesięczne - ok 240 PLN/mc\n        wysoki dodatek nocny - powyżej 7,5 PLN/h\n        dofinansowanie do obiadów\n        pracę w systemie 3 zmianowym (6-14, 14-22, 22-6)\n        wolne weekendy\n        premie frekwencyjne\n        paczki na święta\n        pakiet benefitów (karta sportowa, opieka medyczna, ubezpieczenie na życie)\n        opiekę dedykowanego konsultanta Randstad\n\nW pracy będziesz odpowiedzialny za:\n\n        kompletacja zamówień\n        praca ze skanerem - lokalizacja towarów na regałach\n        przyjęcie towaru - rozładunek towaru, skanowanie paczek, rozmieszczanie towaru\n        wydanie towaru - pobranie towaru z lokalizacji, pakowanie\n        przemieszczanie wewnętrzne - rozmieszczanie towaru na wskazane lokalizacje w magazynie\n        załadunek towaru - sortowanie towaru w oparciu o wagę/wymiary\n        sortowanie paczek - rozmieszczanie paczek\n        weryfikacja jakościowa i ilościowa towaru\n        uzupełnianie dokumentacji magazynowej\n\nOd kandydatów oczekujemy:\n\n        uprawnień na wózki widłowe UDT\n        min. kilka miesięcy doświadczenia w operowaniu wózkami widłowymi - wysoki skład\n        gotowości do pracy w systemie 3-zmianowym\n        zaangażowania :)\n\nAgencja zatrudnienia  nr  wpisu 47",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Kompletacja zamówień i kontrola jakości w magazynie",
        "category": "olx",
        "phone": "720800138",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "W chwili obecnej poszukujemy osób do pracy w magazynie. Kompletacja zamówień, kontrola jakości, lekkie gabaryty. Praca w systemie III zmian, 6-14,10-18, 14-22,22-6 Praca na stałe, od zaraz Możliwość szybkiego przejścia na umowę o pracę Nie wymagamy doświadczenia,uczymy na miejscu.\n\n19 zł/ h stawka dzienna, 21 zł/ h stawka nocna, weekendy dodatkowo płatne, \n\n*Jeżeli są Państwo zainteresowani podjęciem współpracy zachęcamy do złożenia aplikacji. Administratorem Państwa danych osobowych będzie MK INTERIM Sp. z o.o. z siedzibą w Warszawie, ul. Rydygiera 11/220. Pełną treść informacji o przetwarzaniu Państwa danych osobowych znajdą Państwo na stronie www.mkinterim.pl/rodo .Prosimy również o zamieszczenie w CV poniższej klauzuli: „Wyrażam zgodę na przetwarzanie podanych przeze mnie danych osobowych przez MK INTERIM Sp. z o.o. dla celów rekrutacji w której biorę udział jak również przyszłych rekrutacji, w tym na przesyłanie mi ofert pracy oraz udostępnienie podanych przeze mnie danych osobowych potencjalnym pracodawcom”. * Informujemy, że odpowiadamy jedynie na wybrane aplikacje.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Magazynier /Ożarów Mazowiecki /stawka 25 zł brutto",
        "category": "olx",
        "phone": "506454841",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma MODUS zatrudni pracownika na stanowisko magazyniera z UDT w hurtowni spożywczej. Praca zmianowa,6-14,13-21,18-2.Praca od zaraz.Umowa zlecenie(pełen ZUS)\n\n-Stawka 25 zł brutto,.\n\n﻿\n\nOd kandydatów wymagana jest aktualna książeczka sanepidu.\n\nPraca od zaraz !\n\nNumer tel. 506454841\n\nWysyłając zgłoszenie rekrutacyjne do firmy Modus zgadzasz się na przetwarzanie przez Pracodawcę Twoich danych osobowych zawartych w zgłoszeniu rekrutacyjnym w celu prowadzenia rekrutacji na stanowisko wskazane w ogłoszeniu. Jeżeli chcesz, abyśmy zachowali Twoje CV w naszej bazie, umieść dodatkowo w CV następującą zgodę: „Zgadzam się na przetwarzanie przez 12 miesięcy danych osobowych zawartych w moim zgłoszeniu rekrutacyjnym dla celów przyszłych rekrutacji”. W każdym czasie możesz cofnąć zgodę, kontaktując się z nami pod adresem aplikuj(at)modus.waw.p",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Praca dla magazyniera - Błonie k. Warszawy",
        "category": "olx",
        "phone": "601993397",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy pracownika na stanowisko magazyniera w oddziale firmy w Błoniu. Wymagane uprawnienia UDT do pracy na wózkach widłowych. Oferujemy umowę o pracę, wynagrodzenie netto minimum 3000 zł. Zainteresowane osoby prosimy o składanie cv.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Kompletacja i pakowanie zamówień. SKLEP INTERNETOWY",
        "category": "olx",
        "phone": "510723136",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma European Network Trade zatrudni osobę do sklepu internetowego na stanowisko:\n\nMagazynier- Kompletowanie i pakowanie zamówień dla kuriera.\n\nSzeligi, ul. Szeligowska 11\n\n05-850 Ożarów Mazowiecki\n\nCzas pracy: 7:30-15:30\n\nWynagrodzenie 17 netto (na rękę)\n\nRodzaj zatrudnienia: Zlecenie\n\nTelefon: 510 723 136",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Magazynier Cooling.pl Sokołów (Pruszków, Janki, Warszawa)",
        "category": "olx",
        "phone": "500823423",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Opis\n\nCooling.pl to właściciel trzech marek, producent akcesoriów komputerowych (np. obudowy, zasilacze) oraz sprzętu dla graczy (np. klawiatury). Prowadzimy rozbudowaną sprzedaż na rynku polskim oraz zagranicznym. Siedziba mieści się w Sokołowie (k. Warszawy, Janki), przy ul. Sokołowska 24.\n\nZapewniamy dojazd z pobliskich węzłów przesiadkowych.\n\nOpis stanowiska:\n\nrozmieszczenie produktów i dbałość o porządek w magazynie\nprzyjęcie dostaw ( paletowych oraz kontenerowych )\npakowanie przesyłek ( paczki, palety )\nkompletacja zamówień\ndrobne prace magazynowe ( np. naprawa palet lub jazda myjka )\n\nWymagania:\n\nmile widziane doświadczenie w pracy na magazynie/kompletowaniu zamówień\ndokładność i samodzielność\numiejętność pracy w zespole\ndobra organizacja pracy oraz zdyscyplinowanie\nzaangażowanie w wykonywanie powierzonych obowiązków\nuprawnienia na wózki widłowe\n\nOferujemy:\n\npodwyżki i premie dla zaangażowanych\nmiesiąc próbny na umowę zlecenie, następnie umowa o pracę\nniekorporacyjna atmosfera pracy\npraca od pon-pt w godzinach 9-17.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "damian.wasiak",
        "id": "",
        "name": "Magazynier / Pakowacz / Pracownik magazynu",
        "category": "olx",
        "phone": "575997510",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "STYRNET.PL\n\nDystrybutor materiałów budowlanych-izolacyjnych, opakowaniowych oraz samochodowych, prowadzący sprzedaż detaliczną i hurtową.\n\nPoszukujemy magazyniera / Pakowacza\n\nRodzaj umowy: umowa o pracę\n\nStanowisko: magazynier / pakowacz.\n\nMiejsce: Wiktorów (powiat Warszawski)\n\n OPIS STANOWISKA PRACY :\n\nKompletacja towarów do zamówień\nPrzygotowywanie i pakowanie paczek\nZaładunek samochodu kurierskiego\nWspółpraca z kierownikiem magazynu\nOdpowiedzialność za pakowany towar\nDbanie o towar i miejsce pracy\nPrzyjmowanie dostaw i sprawdzanie dostaw \nWydawanie towaru kontrahentom \n\nOCZEKIWANIA :\n\nWysoka kultura osobista i komunikatywność,\nRzetelność i pozytywne nastawienie do pracy,\nUczciwość,\nDyspozycyjność,\n\nWYMAGANIA :\n\nBardzo dobra organizacja czasu pracy własnej\nOdpowiedzialność za powierzone zadania\nBrak przeciwwskazań do pracy fizycznej \n\nOFERUJEMY:\n\nAtrakcyjne wynagrodzenie \nNiezbędne narzędzia do pracy\nBezpłatne miejsce parkingowe\n\nMILE WIDZIANE:\n\nUprawnienia na wózki widłowe\n\nUprzejmie informujemy, że skontaktujemy się tylko z wybranymi kandydatami.\n\nProsimy o dopisanie następującej klauzuli: \" Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w ofercie pracy dla potrzeb procesu rekrutacji zgodnie z ustawą z dnia 27.08.1997r. Dz. U. z 2002r., Nr 101, poz.923 ze zm.\"",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "MAGAZYNIER- 1 zmiana-Moszna Parcela(Brwinów/Pruszków)-19,50zł/h",
        "category": "olx",
        "phone": "720800202",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "MK INTERIM jest Agencją Pracy Tymczasowej wpisaną do krajowego rejestru pod numerem 9305. Powstała na początku 2013 roku. Tworzy ją kreatywny zespół specjalistów, posiadający ponad dziesięcioletnie doświadczenie w branży HR. Wyjątkowość MK INTERIM polega na fachowym i bardzo elastycznym dopasowaniu rozwiązań pozwalających zredukować koszty w zakresie obsługi personalnej procesów. Dbamy o każdego naszego pracownika i umożliwiamy sprawny(bezpieczny) rozwój na rynku pracy. \n\nStanowisko: MAGAZYNIER \n\nkompletacja zamówień, relokacja towaru, załadunek i rozładunek \n\nMiejsce pracy: Brwinów (MOSZNA-PARCELE) \n\nOPIS STANOWISKA \n\n•\tkompletacja zamówień \n\n•\tpakowanie towaru \n\n•\tsegregację towaru \n\n•\tprace magazynowe pomocnicze, załadunek i rozładunek towaru \n\nWYMAGANIA \n\n•\tmile widziane doświadczenie na podobnym stanowisku \n\n•\tdobry stan zdrowia pozwalający na pracę w magazynie \n\n•\twysoka dyscyplina pracy \n\n•\tmobilność, możliwość dojazdu do firmy-Moszna Parcele \n\nOFERUJEMY \n\n•\tStabilne zatrudnienie \n\n•\tWYNAGRODZENIE-od 19,50zł/h +DODATKI \n\n•\tzatrudnienie na podstawie umowy cywilno-prawnej (+wszystkie składki ZUS)\n\n•\tmożliwe zatrudnienie bezpośrednio u klienta (umowa o pracę po okresie próbnym) \n\n•\tSYSTEM PRACY I -zmianowy od 8.00 do 17.00 Pon.-Pt. \n\nJeżeli są Państwo zainteresowani podjęciem współpracy zachęcamy do złożenia aplikacji. Administratorem Państwa danych osobowych będzie MK INTERIM Sp. z o.o. z siedzibą w Warszawie, ul. Rydygiera 11/220. Pełną treść informacji o przetwarzaniu Państwa danych osobowych znajdą Państwo na stronie mkinterim.pl/rodo.html\n\n \n\nProszę o dodanie aplikacji w załączniku.\n\nInformujemy, że skontaktujemy się z wybranymi kandydatami.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "owner": "mateusz.ziolkowski",
        "id": "",
        "name": "Nowo otwarta filia! Zatrudni od zaraz! Możliwość szybkiego awansu!",
        "category": "olx",
        "phone": "790560187",
        "email": "",
        "consumption": "",
        "city": "Grodzisk Mazowiecki",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Lider w branży motoryzacyjnej zatrudni do nowo otwartej filii, chętne osoby w wieku do 50 lat, na stanowisko MAGAZYNIERA. Możliwość szybkiego awansu i atrakcyjne wynagrodzenie z systemem premiowym. Miejsce pracy w Jawczycach.\n\nNie wymagamy doświadczenia!\n\nDo CV należy dołączyć klauzulę dotyczącą zgody na przetwarzanie danych osobowych do celu rekrutacji.\n\nPełna treść zgody znajduje się na naszej stronie internetowej www.lavoro.com.pl",
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
        status: 'błąd bazy'
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