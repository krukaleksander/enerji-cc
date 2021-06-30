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
        socket.on('disconnect', function() {  
          activeUsers = activeUsers.filter(user => {
            if (user !== req.session.userName) return user;
        });      
          io.emit('sent-who-is-logged', activeUsers);
       });
       socket.on('new-message', function(message) {      
          // tutaj
          io.emit('new-message-to-everyone', message);
       })

    })


    //koniec fragment socket test

    //fragment chat

    router.get('/get-messages/', async (req,res) => {      
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

const baseToAdd = [
    {
      "id": "",
      "name": "Praca dla fryzjerki",
      "category": "olx",
      "phone": "510675915",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukiwana Fryzjerka / Fryzjer damsko-męska z doświadczeniem.\n\nPraca w systemie zmianowym na pełen etat (lub część etatu). \n\nBaza klientów do przejęcia.\n\nSalon mieści się w Ząbkach blisko CH M1.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik saloniku prasowego Zielonka",
      "category": "olx",
      "phone": "518014100",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Świat Prasy Spółka Akcyjna - sieć profesjonalnych salonów prasowych zatrudni pracownika do saloniku Prasowego\n\nLokalizacja: Zielonka\n\n \n\nWymagania :\n\nPełna dyspozycyjność.\n\nZaangażowanie w powierzone obowiązki.\n\nZainteresowane osoby prosimy o przesłanie CV wraz z niezbędnymi zgodami w celu włączenia w proces rekrutacyjny.\n\nTreść wymaganych klauzul w CV\n\n \n\nZGODA 1: (obowiązkowa)\n\nWyrażam zgodę na przetwarzanie moich danych osobowych zawartych w dokumentach aplikacyjnych przez ŚWIAT PRASY Spółka Akcyjna z siedzibą w Warszawie (KRS: 802 - pokaż numer telefonu - 0) dla potrzeb niezbędnych do realizacji procesu niniejszej rekrutacji.\n\n \n\nZGODA 2: (dobrowolna)\n\nWyrażam zgodę na przetwarzanie moich danych osobowych zawartych w dokumentach aplikacyjnych przez ŚWIAT PRASY Spółka Akcyjna z siedzibą w Warszawie (KRS: 802 - pokaż numer telefonu - 0) dla potrzeb przyszłych rekrutacji prowadzonych przez ww. spółkę.\n\n \n\nZGODA 3: (obowiązkowa, gdy zostaną podane dodatkowe dane osobowe, spoza formularza)\n\nWyrażam zgodę na przetwarzanie moich dodatkowych danych osobowych zawartych w dokumentach aplikacyjnych przez ŚWIAT PRASY Spółka Akcyjna z siedzibą w Warszawie (KRS: 802 - pokaż numer telefonu - 0) dla potrzeb niezbędnych do realizacji procesu niniejszej rekrutacji.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Szwaczka w Zakładzie Produkcyjnym",
      "category": "olx",
      "phone": "698698057",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Opis\n\nEuroducting jest producentem szerokiej gamy przewodów elastycznych używanych m. in. w przemyśle motoryzacyjnym, eventowym, lotniczym oraz w wielu innych. Dzięki 35-letniemu doświadczeniu posiada ugruntowaną pozycję na rynku. Jesteśmy spółką dbającą o rozwój pracowników. Do nowo otwartego zakładu szwalniczego w Zielonce koło Warszawy poszukujemy pracowników na stanowisko:\n\nSzwaczki\n\n \n\nOczekiwania:\n\ndoświadczenie w pracy w zakładzie produkcyjnym;\ndoświadczenie w zakresie szycia na maszynach szwalniczych;\numiejętność pracy w zespole;\numiejętność zarządzania czasem;\nodpowiedzialność;\nbardzo dobra organizacja pracy własnej;\numiejętność nadzorowania pracy;\n\n \n\nZakres obowiązków:\n\noperowanie maszynami szwalniczymi;\npoznawanie specyfiki produktów;\nplanowanie produkcji;\numiejętne zarządzanie zespołem;\nprawidłowe utrzymanie parku maszyn szyjących;\nsprawdzanie jakości;\nnadzór nad dokumentacją oraz planem produkcyjnym;\nprzygotowywanie materiałów pod dany sektor produkcji (docinanie itd);\nprawidłowe oznaczanie składowanych towarów;\nprawidłowa i terminowa realizacja powierzonych zadań.\n\n \n\nOferujemy:\n\nszkolenia wprowadzające;\nstabilne warunki zatrudnienia;\numowę o pracę;\nterminowo wypłacane wynagrodzenie.\n\n \n\nOsoby zainteresowane proszę o wysłanie CV na adres: office(at)euroducting.com\n\nProsimy o dołączenie klauzuli: \"Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb obecnego i przyszłych procesów rekrutacji, zgodnie z Ustawą o Ochronie Danych Osobowych z dn. 29.08.97 roku (Dz. U. z 2002 r. Nr 101, poz. 926 z późn. zm.)\"",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pomocnik budowlany Zielonka 18-20zl/h.",
      "category": "olx",
      "phone": "736378688",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukujemy pracowników na stanowisko:\n\nPomocnik Ogólnobudowlany \n\nPraca polega na montażu konstrukcji domku (płyty OSB, GK, okna, dach elewacja)\n\nOsoby zainteresowane prosimy o kontakt w wiadomości lub pod numerem telefonu: 736378688\n\nStawka od 18zł netto/h Umowa Zlecenie, możliwość awansu. Praca pod Halą cały rok.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię pomocnika hydraulika",
      "category": "olx",
      "phone": "602271708",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma instalacyjna w Zielonce zatrudni pomocnika do grupy hydraulików.\n\nMile widziane doświadczenie.\n\nWymagania:\n\nPRAWO JAZDY KAT. B\nCHĘCI DO NAUKI ZAWODU HYDRAULIKA\nCHĘCI DO PRACY\n\nTelefon kontaktowy: 602-271-708",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Poszukiwany kucharz",
      "category": "olx",
      "phone": "515582000",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukuję samodzielnego kucharza do małego baru w Zielonce pod Warszawą . Praca w godzinach 10-18 a w Weekendy 11-19 . Wymagana znajomość kuchni polskiej .",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Dziewczyny do obsługi baru",
      "category": "olx",
      "phone": "519461857",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukuję do pracy 3-4 razy w tygodniu dziewczyny do obsługi baru  w Zielonce pod Warszawą . Do obowiązków należy obsługa gości,  przyjmowanie zamówień telefonicznych jak i online , dbanie o czystość, obsługa kasy i rozlicznie jej przed i po pracy.  Pracujemy na systemie pos . Doświadczenie niewymagane wszystkiego nauczymy.  Praca w godzinach 10-18 lub weekendy 11-19",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Znasz angielski i lubisz ludzi - zostań LEKTOREM w Mansoor Academy",
      "category": "olx",
      "phone": "698555330",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Jeśli znasz świetnie angielski...\n\nJeśli lubisz ludzi tych małych i tych całkiem dużych...\n\nJeśli nowe wyzwania i rozwój nie są Ci obce...\n\nJeśli szukasz pracy marzeń...\n\nTO PRZEŚLIJ NAM SWOJE CV i spotkaj się z nami. Być może to Ciebie właśnie szukamy, a TY szukasz nas.\n\nPoszukujemy LEKTORA JĘZYKA ANGIELSKIEGO do pracy z grupami dzieci, młodzieży i/lub dorosłych.\nProwadzimy zajęcia stacjonarnie w Zielonce i w Radzyminie - możesz wybrać dogodniejszą lokalizację.\nDostosowujemy grafik do Twoich potrzeb i możliwości\nOferujemy umowę zlecenie lub b2b\nWynagrodzenie zależy od warunków i doświadczenia i wynosi od 50 do 90 zł za 60 min. Co oznacza, że miesięcznie możesz zarabiać od 2 000 do 7 000 zł brutto.\nZapewniamy szkolenia wewnętrzne i zewnętrzne\nMożesz liczyć na opiekę metodyczną, wszystkie potrzebne do zajęć materiały oraz dobrą kawę/herbatę \n\nDlaczego Mansoor Academy?\n\njesteśmy na rynku od 2013 roku, a w czasie pandemii nie tylko sobie świetnie poradziliśmy, ale urośliśmy w siłę\ndajemy stabilne i pewne zatrudnienie\ntworzymy fantastycznie pozytywny zespół \njesteśmy jednym Akredytowanym Centrum Teddy Eddie i Savvy Ed na terenie Radzymina i Zielonki\njesteśmy uznanym centrum przygotowującym do egzaminów Cambridge\nwierzymy, że każdy człowiek ma ogromny potencjał\n\nNie czekaj, nie zwlekaj. \n\nPrześlij nam swoje CV już dziś, może jeszcze w te wakacje będziemy razem pracować.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik produkcji",
      "category": "olx",
      "phone": "734479069",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma Partner Temps Sp. z o.o. Sp. k. aktualnie poszukuje kandydatów dla klienta, który\n\nspecjalizuje się w branży elektronicznej.\n\nPraca polega na m.in. montażu urządzeń (zasilaczy, podzespołów, szaf sterowniczych) lub\n\nmontażu płyt PCB zgodnie z dokumentacją.\n\nWymagamy\n\nznajomości elementów elektronicznych m.in. umiejętności czytania prostych schematów elektronicznych, elektrycznych\ndoświadczenia przy lutowaniu i montażu szaf sterowniczych bądź automatyce przemysłowej\nzamiłowania i pasji do majsterkowania\nspostrzegawczości oraz dobrej koncentracji\n\nOferujemy\n\numowę o pracę\nstawkę minimalną 3500 brutto/miesięcznie\nosoby z doświadczeniem – wynagrodzenie ustalane indywidualnie\npracę od poniedziałku do piątku w systemie dwuzmianowym (6-14, 14-22)\npracę w miejscowości Zielonka/ koło Warszawy\npracę w prężnie rozwijającej się międzynarodowej firmie\npakiety medyczne\n\n \n\nTel. 734 479 069\n\nBiuro Partner Temps Sp z o.o. sp.k.\n\nul. Jana Pawła II 9 lok.4\n\n05-500 Piaseczno",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "zatrudnię samodzielnego mechanika samochodowego / ucznia młodocianego",
      "category": "olx",
      "phone": "512303306",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię samodzielnego mechanika samochodowego\n\nMiejsce pracy Zielonka\n\nPraca poniedziałek - piątek 08.00-17.00\n\nOferuję praktyczną naukę zawodu dla ucznia młodocianego.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Opieka nad starszą osobą (kobieta 83 lata, Zielonka)",
      "category": "olx",
      "phone": "500213025",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Szukam opieki dla starszej osoby w wieku 83 lat, przewlekle chorej na Parkinsona. Codziennie od poniedziałku do piątku w godzinach 8.30-17.30/18.00 w Zielonce (05-220). Obowiązki:\n\nsprawowanie opieki codziennej\n\nwykonywanie czynności higienicznych i opiekuńczych\n\nrehabilitacja/ćwiczenia\n\ngotowanie\n\nwychodzenie na spacer\n\nKwota 2500 zł ",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik Obsługi Klienta stacja paliw Orlen",
      "category": "olx",
      "phone": "695355106",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "oferujemy : pracę na stanowisku Pracownik Obsługi Klienta, przyjazna atmosfera, możliwość rozwoju i awansu, pakiet profesjonalnych szkoleń, ciekawą stabilną pracę, przejrzystą ścieżkę awansu, dla najlepszych samodzielne zarządzanie stacją paliw. Oferta skierowana jest również do osób poszukujących pierwszej pracy.\n\nPraca polega na : obsłudze klienta w sklepie, pozytywnym podejściu do klienta, komunikowaniu aktualnych promocji produktowych, dbaniu o czystość i porządek na terenie obiektu.\n\nJeżeli ta oferta zainteresowała Ciebie , prześlij CV",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca dla stomatologa",
      "category": "olx",
      "phone": "602257914",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zielonka i Warszawa Praca dla Lekarzy Dentystów\n\nPrywatne kliniki Kordent w Zielonce i w Warszawie poszukują lekarzy stomatologów i lekarzy ortodontów. Działamy nieprzerwanie od dwudziestu sześciu lat. Nawiążemy współpracę z Lekarzami w klinikach w Zielonce i na warszawskim Mokotowie . Długotrwałe relacje z pacjentami, którzy są dla nas najważniejsi są naszym priorytetem. Specjalizujemy się w kompleksowym leczeniu i opiece nad Pacjentem. Bezbłędnie działająca rejestracja pilnującą grafików, opiekun pacjenta oraz wykwalifikowana, najlepsza asysta to nasze atuty.\n\nKogo poszukujemy:\n\nOsoby posiadającej min. 2 letnie doświadczenie,\n\nOsoby zajmującej się stomatologią zachowawczą, endodoncją, protetyką\n\nLekarza ortodonty\n\nZ wysokimi umiejętnościami pracy w zespole,\n\nEmpatyczna w stosunku do pacjenta.\n\nCo u nas znajdziesz:\n\nWynagrodzenie indywidualne (35-40%),\n\nWyłącznie prywatni pacjenci,\n\nPracę na 4 ręce z najlepszymi asystentkami,\n\nDużą bazę pacjentów, \n\nDostęp do pełnej diagnostyki radiologicznej ( radiowizjografia, CBCT).\n\nSprzęt do endodoncji : Mikroskopy, mikromotory bezprzewodowe Morita z endometrami, Płynną gutaperkę.\n\nPrzyjazny zespół\n\nPracę ze skanerem wewnątrz ustnym\n\nPoprosimy o CV",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Stolarza z doświadczeniem",
      "category": "olx",
      "phone": "502453178",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma TRAFiNTERiOR ,Zielonka Bankowa\n\n \n\nZatrudnimy Stolarza z doświadczeniem przy produkcji mebli \n\n-praca w warsztacie bez konieczności montażu \n\n-czas PRACY od 8.00 do 16.00 (sobota ,niedziela i święta -wolne )\n\n-ZAROBKI od -30zł na godzinę \n\nTEL.502-453-178",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pomoc kuchenna w bufecie szkolnym",
      "category": "olx",
      "phone": "792717274",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma o ugruntowanej pozycji na rynku gastronomicznym zatrudni osobę do pomocy w kuchni zlokalizowanej w Szkole Podstawowej w Zielonce.\n\nZainteresowane osoby prosimy o przysyłanie CV ze zdjęciem oraz klauzuli \"Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w ofercie pracy, dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z Ust. z dnia 29 sierpnia 1997(Dz. U. z 2002 r. nr 101 poz. 926 z późn. zm.)\" za pośrednictwem OLX \n\nWięcej informacji pod numerem telefonu: tel: 792 717 274.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Specjalista ds. Rekrutacji i HR",
      "category": "olx",
      "phone": "607154741",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Kim jesteśmy ?\n\nGrupa Eltron to innowacyjna, dynamicznie rozwijającą się spółka, działająca w sektorze elektrycznym, teletechnicznym, elektroenergetycznym oraz automatyki. Naszą misją jest dystrybucja wiedzy z branży elektrycznej w oparciu o cel, jakim jest budowa stabilnej przyszłości na drodze postępu oraz zadowolenia ludzi. Świadczymy kompleksowe usługi, począwszy od sprzedaży produktów i urządzeń elektrycznych, po projektowanie, doradztwo i wykonawstwo elektryczne.\n\n \n\nCzego możesz się u nas spodziewać?\n\nW Dziale Jakości i Rozwoju Grupy Eltron zawsze zastaniesz rytm pracy oparty na efektywnej komunikacji. Nasza praca oparta na wspólnych celach prowadzi do podejmowania nowych wyzwań oraz podnoszenia i zdobywania nowych umiejętności każdego dnia.\n\nKogo szukamy?\n\nZależy nam na kandydatach którzy:\n\nMają doświadczenie w prowadzeniu procesów rekrutacyjnych\nSą samodzielni i proaktywni w działaniu\nSą komunikatywni, otwarci na zmiany, chętnie mierzą się z problemami\nSprawnie poruszają się w Pakiecie MS Office, narzędziach Google\nPosiadają prawo jazdy kat.B\n\nCzym będziesz się zajmować?\n\nTwoje główne zadania to:\n\nKompleksowa realizacja projektów rekrutacyjnych\nAktywne działania skierowane na poszukiwanie i kontaktowanie się z kandydatami\nPełnienie roli administratora systemu rekrutacyjnego\nPrzygotowywanie raportów, zestawień, statystyk\nDbanie o wizerunek Firmy na rynku pracy\nRealizacja działań z zakresu onboardingu, offboardingu pracowników\nOrganizacja wydarzeń i spotkań firmowych oraz szkoleń dla Pracowników\n\nCo dla Ciebie przygotowaliśmy?\n\nW Grupie Eltron zyskasz:\n\nPracę w dużej, dynamicznie rozwijającej się Firmie\nStabilne zatrudnienie na podstawie umowy o pracę (pełen etat)\nRozwój zawodowy i podnoszenie kwalifikacji\nDodatkowe benefity:\nProgram emerytalny PPE, gdzie składki opłaca pracodawca\nKarty Benefit System\nMożliwość skorzystania z ubezpieczenia grupowego\nZniżki na produkty z naszej oferty\nElastyczny czas pracy\nSzkolenia\nPikniki rodzinne, wydarzenia i imprezy firmowe\n\nJesteś zainteresowana/y? Chcesz być jednym z nas? Aplikuj! :)",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Kasjer/ sprzedawca (sklep art. metalowe i budowlane)",
      "category": "olx",
      "phone": "608287849",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Stalko Przybysz i Wspólnicy Sp. J. zajmuje się m.in. sprzedażą hurtową i detaliczną materiałów budowlanych i hutniczych. Trzydziestoletnie doświadczenie dało nam ugruntowaną pozycję na rynku i sprawiło, że zaufało nam wiele firm. Należymy do elitarnego klubu Gazel Biznesu, grona najbardziej dynamicznie rozwijających się firm oraz posiadamy certyfikat Rzetelności programu Rzetelna Firma. Obecnie do naszego zespołu poszukujemy osób na stanowisko:\n\nDoradca klienta (sklep art. metalowe i budowlane)  \n\nMiejsce pracy: Zielonka k. Warszawy \n\nDo obowiązków pracownika na ww. stanowisku będzie należało m.in.: \n\n• Zapewnienie sprawnej i profesjonalnej obsługi klienta \n\n• Przygotowywanie towaru i działu do sprzedaży\n\n• Rozładunek dostaw towaru\n\n• Dbanie o ekspozycję towaru\n\n• Obsługa kasy fiskalnej\n\nOczekujemy:\n\n• Znajomość asortymentu artykułów metalowych lub budowlanych\n\n• Umiejętności obsługi klienta\n\n• Doświadczenia w sprzedaży \n\n• Bardzo dobrej organizacji pracy \n\n• Umiejętności pracy w grupie i łatwość nawiązywania kontaktów\n\nOferujemy: \n\n• pracę w stabilnej i ciągle rozwijającej się firmie; \n\n• zatrudnienie w formie na umowy o pracę;\n\n• atrakcyjny system wynagrodzeń; \n\n• możliwość rozwoju zawodowego \n\n• możliwość uzyskania karty Fit Profit, uprawniającej do darmowego wstępu bez ograniczeń w wielu obiektach sportowych (np. siłownie, baseny) na terenie całego kraju. \n\nOsoby zainteresowane ofertą prosimy o przesłanie CV. Uprzejmie informujemy, iż skontaktujemy się tylko z wybranymi kandydatami.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Mechanika samochodowego do montażu haków i tłumików",
      "category": "olx",
      "phone": "504371351",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnimy samodzielnego mechanika samochodowego do montażu haków holowniczych oraz wymiany układów wydechowych w samochodach osobowych i dostawczych. \n\nPraca w warsztacie w Zielonce pon-pt 8.00-17.00 sob 8.00-13.00 . \n\nOsoby zainteresowane prosimy o kontakt . ",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Hotel w Zielonce zatrudni pokojową, sprzatanie pokoi",
      "category": "olx",
      "phone": "48600419034",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Hotel Trylogia w Zielonce pod Warszawą zatrudni pokojówkę. Praca na cały etat w systemie zmianowym po 8h. Możliwość mieszkania w hotelu. Osoby zainteresowanie proszę o kontakt telefoniczny.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pomoc kuchenna / zmywak - Hotel Trylogia",
      "category": "olx",
      "phone": "602335885",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukujemy pomocy kuchennej do Hotelu Trylogia w Zielonce. Praca przy imprezach bankietowych w zakresie obierania / mycia garnków / talerzy kuchennych - na kuchni. Wynagrodzenie początkowe to 14 zł/ godzinę. Mile widziane doświadczenie w tej profesji. Z racji charakteru działalności praca również w weekendy. Więcej informacji udostępnię pod numerem telefonu: 602-335-885",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "ślusarz - spawacz",
      "category": "olx",
      "phone": "785500998",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię do zakładu ślusarskiego w Zielonce ślusarzy-spawaczy; produkcja balustrad i innych konstrukcji stalowych; mile widziana umięjetność czytania rysunku technicznego.\n\nTelefon 785-500-998\n\nWysokie zarobki",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Kierowca kat. C+E - HDS",
      "category": "olx",
      "phone": "604918944",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Stalko Przybysz i Wspólnicy Sp. J. zajmuje się m.in. sprzedażą hurtową i detaliczną materiałów budowlanych i hutniczych. Trzydziestoletnie doświadczenie dało nam ugruntowaną pozycję na rynku i sprawiło, że zaufało nam wiele firm. Należymy do elitarnego klubu Gazel Biznesu, grona najbardziej dynamicznie rozwijających się firm oraz posiadamy certyfikat Rzetelności programu Rzetelna Firma. \n\nObecnie poszukujemy osób na stanowisko:\n\nKierowca C+E \n\n(woj. mazowieckie – Zielonka, Radzymin, Warszawa)\n\nZadania:\n\n• Kierowanie samochodem ciężarowym z HDS.\n\nWymagania:\n\n• Prawo jazdy kat. C+E,\n\n• Doświadczenie na stanowisku kierowcy kat. C+E,\n\n• Uprawnienia HDS mile widziane,\n\n• Dobra organizacja pracy i zaangażowanie,\n\n• Dyspozycyjność,\n\n• Świadectwo kwalifikacji,\n\n• Aktualne orzeczenie lekarskie oraz aktualne badania psychologiczne.\n\nOferujemy:\n\n• pracę w stabilnej i ciągle rozwijającej się firmie;\n\n• zatrudnienie w formie na umowy o pracę;\n\n• atrakcyjny system wynagrodzeń;\n\n• możliwość rozwoju zawodowego\n\n• możliwość uzyskania karty Fit Profit, ubezpieczenia zdrowotnego.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "POSZUKIWANY mechanik samochodowy",
      "category": "olx",
      "phone": "661553289",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma Eco Garage & Cars Cult w Zielonce o specjalizacji BMW i MINI oraz samochodów elektrycznych jak i hybrydowych, zatrudni mechanika samochodowego. Zainteresowane osoby proszę o kontakt telefoniczny lub SMS-owy pod nr. Tel. 661 553 289",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Kasjer-sprzedawca",
      "category": "olx",
      "phone": "509615226",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Stacja paliw BP Wiktoria w Zielonce zatrudni pracownika obsługi klienta na stanowisku kasjer-sprzedawca. \n\nOczekujemy:\n\nzaangażowania \nkultury osobistej\numiejętności pracy w grupie oraz z klientem\ndyspozycyjności\nmile widziane doświadczenie w obsłudze klienta, ale nauczymy wszystkiego\n\nOferujemy:\n\npracę w systemie zmianowym\nelastyczny grafik\n20zł/h brutto\nświęta płatne podwójnie\numowa o pracę.\n\nZainteresowane osoby proszę o kontakt 509-615-226 lub 22 771-94-15  lub bezpośrednio na stacji.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik biurowy- sprzedawca Hurtownia Mięsa EJART Warszawa Ząbki",
      "category": "olx",
      "phone": "604437162",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Hurtownia Mięsa i Wędlin EJART Warszawa/Ząbki poszukuje\n\npracownik biurowy - sprzedawca\n\n \n\nksiążeczka sanepidu\n\nznajomość tematu \n\nobsługa komputera\n\ndoświadczenie w branży\n\n \n\noferujemy:\n\natrakcyjne wynagrodzenie\n\numowę o pracę pełny etat\n\nwynagrodzenie stałe plus premiowe\n\nstabilne miejsce pracy w firmie o ugruntowanej pozycji na rynku\n\nmożliwość rozwoju\n\n \n\nCV proszę przesyłać na OLX lub na adres podany na stronie internetowej EJART.pl\n\n ",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Poszukujemy mechaników. Zielonka",
      "category": "olx",
      "phone": "501971030",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukujemy samodzielnego mechanika do aut osobowych,\n\nTwoje zadania będą polegały na:\n\nSamodzielna, sprawna i rzetelna naprawa pojazdów\nDiagnozowanie i wykrywanie usterek\nNaprawy mechaniczne\nKompleksowa diagnostyka usterek w samochodach osobowych\n\nWymagania:\n\nDoświadczenia na podobnym stanowisku co najmniej 3 lata\nZnajomości technologii napraw i budowy pojazdu.\nDobra znajomość zagadnień mechaniki samochodowej\nUmiejętność pracy w zespole\nSumienność, odpowiedzialność, terminowość\nDobra organizacja pracy własnej\nPrawo jazdy kat. B\n\nDzięki pracy z nami otrzymasz:\n\nTerminowe wynagrodzenie, oraz premia uzależniona od indywidualnych wyników pracy:\nZapewniamy wynagrodzenie adekwatne do wyników pracy oraz narzędzia niezbędne do wykonywania powierzonych obowiązków\n\nZielonka Kolejowa 40 Autoserwis 501971030",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca w sklepie alkoholowym",
      "category": "olx",
      "phone": "535319663",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Witam, \nZatrudnię do pracy w sklepie alkoholowym w Zielonce. Praca zmianowa. Z doświadczeniem lub bez. \n\nKontakt \nPaulina \n535319663",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca w Warszawie. Dostawca mebli, prawo jazdy kat.B",
      "category": "olx",
      "phone": "506234300",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Witam.\n \nZatrudnię osobę sprawną fizycznie do transportu mebli na terenie Warszawy i okolic (głównie lewobrzeżna Warszawa). Do obowiązków należy załadunek samochodu (pierwszy punkt w Ożarowie Mazowieckim) oraz transport wraz z wniesieniem do domu/mieszkania klienta. Stawka akordowa (za kurs)+napiwki. Przez pierwsze 3 miesiące umowa zlecenie, w przypadku chęci dalszej współpracy umowa o prace. W przypadku osób z Ukrainy umowa na 180 dni.\n Wymagania: \ndyspozycyjność od Poniedziałku do Soboty \nprawo jazdy kat.B, mile widziane doświadczenie w jeździe autem dostawczym (transit kontener 4,80m) \nmile widziana minimalna znajomość topografii Warszawy \nsprawność fizyczna \nwysoka kultura osobista \ndbałość o powierzony towar i sprzęt chęci do pracy\numiejętność pracy z ludźmi\n\nPraca z reguły od 8 do 18-19 (sobota od 8 do maks 16), początkowo 2-3 dni w tygodniu.\nProszę o kontakt telefoniczny.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Mechanik samochodowy Zielonka koło Warszawy",
      "category": "olx",
      "phone": "512256621",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Od zaraz!!! Zatrudnię mechanika z minimum 5 letnim doświadczeniem. Do warsztatu istniejącego ponad 25 lat!!!! 20km od Warszawy, Zielonka.\n\nOferujemy:\n- umowę o pracę,\n- dobre wynagrodzenie, premie\n- bardzo dobrze wyposażony warsztat z zapleczem socjalnym\n- odzież roboczą\n\nMile widziane doświadczenie w diagnostyce komputerowej. \nZa Praktykantów dziękujemy.\n\nKontakt tylko telefoniczny 503531140.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Будівельників Pracownicy do prac wykończeniowych",
      "category": "olx",
      "phone": "790710509",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "zatrudnię samodzielnych pracowników do prac wykończeniowych. możliwość ekipy 2-3 osobowej. Możliwość zakwaterowania . Kwarantanna w miejscu pracy. p>\n\nЯ буду наймати незалежних робітників для оздоблювальних робіт. можливість команди з 2-3 чоловік",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię machanika samochodowego samodzielnego lub pomocnika",
      "category": "olx",
      "phone": "502209092",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Samodzielny mechanik z doświadczeniem lub pomocnik mechanika\nWynagrodzenie według umiejętności\nGodziny pracy do ustalenia\nMiejsce pracy Zielonka \nBlisko stacji PKP",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Dostawca do restauracji sushi",
      "category": "olx",
      "phone": "537809809",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Restauracja Shiro Sushi w Zielonce zatrudni kierowce z własnym samochodem stawka 140zł + 0.50gr za km . Praca od 12 do 22 .15 dni w miesiącu lub więcej, dni do ustalenia. Więcej informacji pod nr tel 537-809-809 lub bezpośrednio w restauracji ul. Kolejowa 78 Zielonka Zapraszamy",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Potrzebny pracownik/pomocnik/wykańczanie wnętrz/remonty Zielonka",
      "category": "olx",
      "phone": "500655098",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Potrzebuję od zaraz pracownika z umiejętnościami (glazurnictwo, karton-gips itd.) do pomocy w wykańczaniu wnętrz/remontach. Wszelkie informacje i warunki telefonicznie 500655098. Mozliwe zakwaterowanie.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca w zabce zielonka",
      "category": "olx",
      "phone": "515436705",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Witam szukam pracownika do sklepu zabka w zielonce. Grafik do dogadania. Dwie zmiany 6-14.30 14.30-23 osoba z doświadczeniem",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię pracownika - operator malowarki drogowej / pracownik drogowy",
      "category": "olx",
      "phone": "606822596",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Szukam operatora malowarki drogowej z doświadczeniem i robotników drogowych do oznakowania pionowego oraz poziomego, wdrażania czasowych oraz stałych organizacji ruchu, montażu urządzeń bezpieczeństwa ruchu. Dyspozycyjność również w weekendy oraz w godzinach nocnych. Wymagane prawo jazdy minimum kat. B oraz umiejętność jazdy samochodami dostawczymi. Zapewniamy odzież roboczą, kurs kierowania ruchem oraz szkolenia BHP. Po okresie próbnym możliwość zatrudnienia na czas określony.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "PRACA !Pomoc kuchni",
      "category": "olx",
      "phone": "227818847",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Hotel U Pietrzaków zatrudni osobę na stanowisko pomoc kuchni.\n\nPraca głównie w weekendy.\n\nProsimy o kontakt pod numerem tel: 22 781 88 47 ",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Szukamy Fryzjerki Zielonka koło Warszawy",
      "category": "olx",
      "phone": "530391743",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Dzień dobry! Poszukujemy Fryzjerki do salonu w Zielonka- Akademia Fryzur. Oferujemy prace w nowoczesnym salonie beauty z wieloletnią pozycją na lokalnym rynku. Pracujemy na najwyższej klasy sprzęcie jaki i profesjonalnych markach kosmetyków, dzięki którym Twoja praca będzie bardziej efektowna . \n\nStawiamy na rozwój naszych pracowników (liczne szkolenia z prawdziwymi profesjonalistami z całej Polski). \n\nDługoletnia pozycja na rynku pozwoliła zdobyć nam dużą bazę zadowolonych klientów.  \n\nWymagamy: doświadczenia, profesjonalizmu, komunikatywności/ otwartości do klientów, chęci do pracy i swojego rozwoju. \n\nTworzymy zgrany i lubiany przez klientów zespól, jeśli chcesz do nas dołączyć prosimy o kontakt emailowy lub telefoniczny.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Hydraulik, pomocnik hydraulika",
      "category": "olx",
      "phone": "507670114",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukuje osoby do prac związanych z instalacjami sanitarnymi , grzewczymi oraz rekuperacji . Poszukuje również pomocnika do przyuczenia . Praca w okolicach Marki , Zielonka , Kobyłka , Ząbki , Warszawa Łomianki",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Poszukiwany Sushi Master",
      "category": "olx",
      "phone": "512840272",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukiwany Sushi Master do naszej restauracji w Zielonce więcej informacji udzielę  na e-maila i wiadomości nie odpisuje.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnimy osobę wykonującą zabiegi urządzeniem Icoone oraz masaże",
      "category": "olx",
      "phone": "500109380",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnimy osobę wykonującą zabiegi urządzeniem Icoone oraz masaże do naszego salonu w Zielonce - Akademia Fryzur i Piękna.\n\nPoszukujemy osób:\n\nposiadających doświadczenie w wykonywaniu zabiegów urządzeniem Icoone oraz w wykonywaniu masaży,\nchcących się rozwijać,\nangażujących się w powierzone obowiązki,\ndla których profesjonalna obsługa Klienta i Jego zadowolenie jest priorytetem\n\nOferujemy:\n\npracę w topowym salonie fryzjersko-kosmetycznym,\nindywidualnie dobrany cykl szkoleń,\nbardzo atrakcyjne wynagrodzenie,\nświetną atmosferę pracy.\n\nDołącz do nas !\n\nJeśli zainteresowała Cię ta oferta skontaktuj się z nami pod tym numerem 500109380 lub poprzez formularz zgłoszeniowy.\n\nMoże to właśnie Ciebie szukamy :)",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Poszukiwany Technik /Konserwator",
      "category": "olx",
      "phone": "501783922",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukiwany Technik /Konserwator budynku \n\nMiejsce pracy: Zielonka i okolice \n\nZakres obowiązków: prace mające na celu utrzymanie osiedli mieszkalnych w należytej sprawności wykonywanie przeglądów technicznych, konserwacja oraz naprawa instalacji oraz urządzeń, drobne prace ogólnobudowlane naprawy mechaniczne, elektryczne i hydrauliczne (konserwacja instalacji CO, ZW, CW), usuwanie awarii\n\nmile widziane doświadczenie elektryczne lub hydrauliczne.\n\nZapraszamy do rekrutacji również osoby z doświadczeniem tylko ogólnobudowlanym.(malowanie układanie płytek, prace remontowe w budynkach mieszkaniowych)\n\nOferujemy :\n\n  * zatrudnienie na umowę o pracę\n\n*służbowy samochód w godzinach pracy",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Auto-spa szuka doświadczonego pracownika Myjni ręcznej",
      "category": "olx",
      "phone": "601367889",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma Mist istniejąca od 20 lat zatrudni:\n\nZatrudnimy na stanowisko: Pracownik Myjni Ręcznej Samochodów.\n\nPoszukujemy tylko osoby doświadczone \n\nOferujemy stałe wynagrodzenie+premia+napiwki\n\nMiejsce pracy Zielonka k/Warszawy\n\nZapraszamy do wysyłania CV wraz ze zdjęciem po przez olx\n\noraz kontakt telefoniczny 792-142-005\n\nWięcej informacji na miejscu.\n\nW liście prosimy o zawarcie klauzuli: \"Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w ofercie pracy dla potrzeb rekrutacji, zgodnie z ustawą z dnia 29.08.1997 r. O ochronie danych osobowych (Dz. U. nr 133, poz. 833)\".\n\n \n\nKontaktujemy się tylko z wybranymi osobami. Zaproszonych kandydatów rejestrujemy w naszej bazie danych. Nadesłanych dokumentów nie zwracamy.\n\nWymagania:\n\nUmiejętności w detailingu,myciu i czyszczeniu samochodów\nSamodzielność i inicjatywa w działaniu,\nZaangażowanie i pracowitość,\nOdpowiedzialność i kultura osobista.\n\n \n\nOferujemy:\n\nLegalne zatrudnienie,\nAtrakcyjne wynagrodzenie,\nNiezbędne narzędzia do pracy,\nPrzyjazną atmosferę.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Poszukujemy Florystki do Kwiaciarni",
      "category": "olx",
      "phone": "537873080",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukujemy do pracy osoby do Kwiaciarni w Zielonce. \nZainteresowani jesteśmy spotkaniem z osobami, które: \n\t•\tmają doświadczenie w pracy w kwiaciarni ( minimum rok doświadczenia ) \n\t•\tkochają kwiaty i pracę z nimi \n\t•\tsą osobami kreatywnymi, pozytywnymi, otwartymi i uśmiechniętymi.\n\nOferujemy stabilną pracę w przyjaznej atmosferze i chętnie podejmiemy współpracę na długi okres. \n\nZakres obowiązków: \n\nTworzenie kompozycji kwiatowych (kwiaty cięte, sztuczne, doniczkowe) \nPrzygotowywanie i dbanie o ekspozycję towaru  \nPielęgnacja roślin \nProfesjonalna obsługa klienta \nDbanie o wystrój przestrzeni florystycznej \nPrzyjmowanie i realizowanie bieżących zamówień\n\nOczekiwania: \n\nDoświadczenie na podobnym stanowisku  \nKreatywność, zmysł artystyczny - świeże spojrzenie na aktualne trendy florystyczne\nChęć poszerzania wiedzy i otwartość na nowe doświadczenia.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pani do sprzątania domu",
      "category": "olx",
      "phone": "604425002",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Szukam pani z Ukrainy do sprzątania domu - Zielonka, koło Wołomina - do stałej współpracy.  Proszę o tel. 604425002\n\nЯ ищу даму для уборки в доме. Зелонка близ Воломина. Приветствуется дама из Украины.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Tokarz, operator CNC",
      "category": "olx",
      "phone": "536404006",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "ZAKRES OBOWIĄZKÓW:\n\nObsługa tokarki sterowanej automatycznie;\nPrzezbrajanie maszyny oraz wymiana narzędzi obróbczych;\nPomiar detali zgodnie z planem kontroli;\nDbanie o porządek w miejscu pracy,\n\nOFERUJEMY:\n\nUmowę o pracę;\nStałą pensję;\nMiłą i przyjazną atmosferę w miejscu pracy;\nMożliwość rozwoju przez udział w szkoleniach organizowanych w naszej firmie;\n\nWYMAGANIA:\n\nCo najmniej 2 letnie doświadczenie na stanowisku tokarza;\numiejętność czytania rysunku technicznego i posługiwania się narzędziami pomiarowymi;\nzaangażowanie\numiejętność pracy samodzielnej i zespołowej\n\nProsimy o dopisanie następującej klauzuli: “Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w mojej aplikacji dla potrzeb niezbędnych do realizacji procesów rekrutacji (zgodnie z Ustawą z dnia 29 sierpnia 1997 r. o ochronie danych osobowych tj. Dz. U. z 2002 r., Nr 101, poz. 926, ze zm.), prowadzonych przez MK Engineering z siedzibą w Warszawie.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnie do pracy przy remontach i wykończeniach",
      "category": "olx",
      "phone": "798751175",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Witam poszukuje osob z doświadczeniem lub pomocnika z minimalnym doświadczeniem do pracy przy wykończeniach wnętrz. Większość prac na terenie Warszawy. Szukam osoby bez nałogów, punktualnej, zaangażowanej oraz odpowiedzialnej.\nStawka uzależniona od doświadczenia i umiejętności. \nPraca od zaraz !\nProszę o kontakt 798-751-175",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "praca",
      "category": "olx",
      "phone": "537490776",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię do sklepu zabka osobę z doświadczenie .Praca na kasie -obsługa według standardów sieci ., przyjmowanie dostaw , wykładanie towaru . Możliwośc tygodniówek ,w niedziele i święta płatne 20 zł na godzinę plus premie",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik Gospodarczy, ZGK w Zielonce",
      "category": "olx",
      "phone": "227810911",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zakład Gospodarki Komunalnej w Zielonce z siedzibą przy ulicy Krzywej 18 zatrudni osobę na stanowisko pracownik gospodarczy.\n\n \n\nWymagania:\n\n- wykształcenie podstawowe;\n\n- sumienność;\n\n- uczciwość;\n\n- umiejętność pracy w zespole;\n\n- gotowość do pracy fizycznej w zmiennych warunkach atmosferycznych.\n\n  -prawo jazdy Kat. B\n\n   Praca od poniedziałku do piątku w godzinach 06.00-14.00, przy pracach porządkowych na terenie miasta Zielonka (zamiatanie, koszenie, odśnieżanie itp.) oraz jako osoba nadzorująca bezpieczne przejście dzieci przez jezdnię w wyznaczonym miejscu.\n\n   CV należy składać drogą e-mailową lub w siedzibie Zakładu, w godzinach 06.00-14.00, pokój nr 3.\n\nTelefon: 22 781-09-11",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnimy: pracowników produkcji - Operatorów linii produkcyjnej",
      "category": "olx",
      "phone": "502115651",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "                                                                      \n\nFirma Meble21 Sp. J. działa od 1990 roku w Polsce oraz na rynkach zagranicznych. Jest producentem wysokiej jakości mebli łazienkowych MIRANO.\n\n \n\nW związku z rozwojem firmy poszukujemy pracowników produkcji.\n\n \n\nMiejsce pracy – 20km od Warszawy, miejscowość Zielonka\n\n \n\n Zatrudnimy:\n\npracowników produkcji - Operatorów linii produkcyjnej w zakresie obsługi maszyn i urządzeń:\n\n·         wiertarki przelotowej,\n\n·         okleiniarki,\n\n·         linii lakierniczej,\n\n·         Plotera,\n\n·         maszyny polerującej,\n\n·         piły panelowej,\n\n·         szlifierki\n\n \n\nObowiązki\n\n·        ustawianie i obsługa obsługiwanego urządzenia,\n\n·        ocena stanu i wymiana narzędzi obróbczych,\n\n·        wprowadzanie korekt do programów obróbczych,\n\n·        postępowanie z instrukcjami obowiązującymi na stanowiskach produkcyjnych.\n\n·        praca w oparciu o zasady BHP i procedury wewnętrzne\n\nWymagania: \n\n·        umiejętności techniczne,\n\n·        wykształcenie minimum zawodowe – mile widziane średnie techniczne lub wyższe,\n\n·        dokładność i sumienność,\n\n·        przestrzeganie przepisów p.poż. oraz zasad bezpieczeństwa i higieny pracy\n\nOferujemy: \n\n·        stałe, stabilne zatrudnienie na podstawie umowy o pracę,\n\n·        merytoryczne wsparcie w procesie adaptacji,\n\n·        możliwość pracy w systemie 2-zmianowym,\n\n·        praca od poniedziałku do piątku,\n\n \n\nPodczas rekrutacji zakłada się działania zmierzające do przestrzegania zasady równości szans kobiet i mężczyzn.\n\nZachęcamy osoby z niepełnosprawnościami do udziału w naborze. Nasza Firma jest pracodawcą równych szans i wszystkie aplikacje są rozważane z równą uwagą bez względu na płeć, wiek, niepełnosprawność, rasę, narodowość, przekonania polityczne, przynależność związkową, pochodzenie etniczne, wyznanie, orientacje seksualną czy też jakąkolwiek inną cechę prawnie chronioną.\n\nTermin i miejsce składania dokumentów:\n\nDokumenty należy przesłać do dnia 02.07.2021 r. poprzez \" Wyślij wiadomość \"\n\nInformacje o naborze można uzyskać pod nr telefonu: 502-115-651 oraz poprzez \" Wyślij wiadomość \"\n\n \n\nProsimy o zawarcie w CV klauzuli: „Wyrażam zgodę na przetwarzanie danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji prowadzonego przez Meble21 Sp. J. z siedzibą w Zielonce, zgodnie z ustawą z dnia 29 sierpnia 1997 r. o ochronie danych osobowych (tj. Dz. U. z 2014 r. poz. 1182, 1662)”.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Kelner / kelnerka",
      "category": "olx",
      "phone": "510550960",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Klimatyczna restauracja w podwarszawskiej Zielonce zatrudni kelnerów oraz kelnerki . Praca głównie na weekendy oraz popołudnia w tygodniu. Elastyczny grafik oraz wysokie zarobki. Zainteresowane osoby proszę o kontakt : 510550960",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik biurowy z prawem jazdy",
      "category": "olx",
      "phone": "504146785",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Co oferujemy? Pracę na pełny etat \n\nKim jesteśmy? Producentem domków modułowych\n\nGdzie? Zielonka k. Warszawy \n\nZakres obowiązków:\n\n-odbiór/realizacja zamówień \n\n-odbiór samochodów \n\n-praca przy komputerze\n\n-pomoc w załatwianiu spraw urzędowych\n\n-wsparcie działów\n\n-inne obowiązki administracyjne/prace zlecone  \n\n-współpraca z magazynem \n\nOsoby zainteresowane zachęcamy do przesłania CV wraz z numerem telefonu w wiadomości prywatnej. Skontaktujemy się z Tobą!",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca na stanowisku kucharza",
      "category": "olx",
      "phone": "505002774",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Miejskie Przedszkole Nr 4 w Zielonce zatrudni od 1 września 2021 r. pracownika na stanowisko kucharza. Poszukujemy osoby, która ma doświadczenie w zarządzaniu kuchnią\n\nw dużych placówkach oświatowych, jest sumienna, zaangażowana i otwarta na nowe, ciekawe pomysły. Praca na cały etat, w kilku osobowym zespole, w bardzo dobrze wyposażonej kuchni. Osoby zainteresowane prosimy o przesyłanie CV przez portal. Uprzejmie informujemy, że skontaktujemy się z wybranymi osobami.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Nauczyciel Wychowania Przedszkolnego",
      "category": "olx",
      "phone": "502893111",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Zielonka",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Niepubliczne Przedszkole \"Malowany Domek\" w Zielonce poszukuje pracownika na stanowisko Nauczyciela Wychowania Przedszkolnego. Tygodniowy wymiar godzin pracy oraz wynagrodzenia do uzgodnienia. \n\nWięcej informacji pod numerem telefonu: 502 893 111.\n\nZgłoszenia proszę przesyłać na adres: malowany.domek{małpa}interia.pl. ",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "kierowcę dostawcę zatrudnię",
      "category": "olx",
      "phone": "504147142",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię w zakładzie garmażeryjnym kierowcę-dostawcę. \n\nPraca polega na dostarczaniu towaru, do klientów na terenie Warszawy. \n\nNie jest to praca kuriera ani dostawcy diet cateringowych. \n\nPraca 5 dni w tygodni, od godziny 5.30 rano, do godziny 13.00 po południu. \n\nWszystkie soboty i niedziele wolne. \n\nOczekuję od danej osoby zaangażowania, rzetelności, uczciwości. \n\nTylko osoby w wieku od 25 lat. \n\nZainteresowane osoby, proszę o kontakt telefoniczny pod numerem telefonu\n\n504-147-142 ",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca od zaraz",
      "category": "olx",
      "phone": "881653821",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma Budowlana specjalizująca się w robotach budowlanych związanych ze wznoszeniem budynków mieszkalnych i niemieszkalnych poszukuje pracowników na stanowiska:\nCieśla szalunkowy – Zbrojarz- Pracownik Ogólnobudowlany\nMile widziane osoby z doświadczeniem!\ntel: 881653821\nProszę dzwonić, mile widziany kontakt telefoniczny\nWymagania:\nwiedza i doświadczenie z zakresu prac ciesielskich i zbrojarskich\npraktyczna znajomość technologii szalunkowych\numiejętność czytania rysunku technicznego\numiejętność pracy w zespole dokładność,\nplanowanie i organizacja pracy własnej\ndyspozycyjność sumienność i zaangażowanie w pracę\nOferujemy:\nzatrudnienie na podstawie o umowę o pracę\natrakcyjne warunki wynagrodzenia\nmożliwość rozwoju zawodowego\nodzież roboczą,\nnarzędzia\nbrak przestojów\nzakwaterowanie\nZadzwoń !!!\ntel: 881653821",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Produkcja/magazyn",
      "category": "olx",
      "phone": "501089901",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Mężczyzna do 50 lat, praca na magazynie i\nPrzy produkcji przypraw \nPakowanie i wkładanie do pudełek \nMiłe widziane prawo jazdy \nSlupno pod Radzyminem, poniedziałek - piątek\n7-15 \nBez sobót i niedziel\nMoże być osoba z Ukrainy , student \nNatychmiast",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Kierowca C+E po Polsce IZOTERMA, wolne weekendy",
      "category": "olx",
      "phone": "888444004",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukujemy kierowcy na stanowisko KIEROWCA ZESTAW CIĄGNIK SIODŁOWY Z NACZEPĄ TYPU IZOTERMA.\n\nTygodniowe wyjazdy po Polsce.\n\nAtuty:\n\n-brak obrotu paletami,\n\n-wole weekendy,\n\n-dobre warunki placowe,\n\n-stała pensja,\n\n-stała praca przez cały rok.\n\n-jazda wyłącznie po magazynach.\n\n-ciagnik wraz z naczepa przypisany do kierowcy\n- szybkie załadunki i rozladunki\n\nWięcej informacji telefonicznie",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnie brukarzy",
      "category": "olx",
      "phone": "510460330",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnie brukarzy z doswiadczeniem. Praca pewna. Wiecej informacji udziele telefonicznie.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pomocnik budowlany",
      "category": "olx",
      "phone": "603253964",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię pomocnika na budowę.\n\nWymagania:\n\nsystematyczność\nbrak nałogów\nchęć do pracy\n\nMile widziane doświadczenie nawet kilkumiesięczne.\n\nW zakresie obowiązków pomoc przy robotach murarskich, zbrojarskich, ciesielskich. Rozliczenie co tydzień, umowa o pracę.\n\nRozpoczęcie pracy możliwe od 01.07.2021 roku.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik na produkcji i montażysta rolet",
      "category": "olx",
      "phone": "531614015",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnimy pracownika do produkcji plis i moskitier; równocześnie jako montażystę przesłon okiennych (montujemy: rolety, moskitiery, plisy, ect).\n\nSzukamy młodych pracowników zaczynających pracę zawodową lub chcących się uczyć - wyszkolimy Cię jeśli chcesz pracować! Zapraszamy również doświadczonych pracowników!\n\nPraca na produkcji w Markach. Praca przy montażach w Warszawie. Wymagamy umiejętności technicznych i obsługi prostych narzędzi elektrycznych. Szukamy osób pracujących z dużą dokładnością i precyzją, w odpowiednim czasie.\n\nKonieczne prawo jazdy kat. B. Praca w różnych godzinach ( 7 - 15 lub 10 - 18) - do ustalenia plan tygodniowy. Zapewniamy: wszystkie potrzebne narzędzia do pracy. Najpierw proponujemy umowę zlecenie na okres 3 miesięcy i adekwatne ubezpieczenia.\n\nZakładamy rozpoczęcie pracy od razu. Szukamy pracowników tylko na długoletnia współpracę.\n\nZachęcamy również do współpracy osoby na studiach zaocznych.\n\nZapraszamy do kontaktu mailoweg lub telefonicznego.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Kierowca C+E Warszawa Marki Zatrudnię",
      "category": "olx",
      "phone": "505133222",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Skład materiałów budowlanych zatrudni pracownika kategoria prawa jazdy C+E,uprawnienia HDS,praca na miejscu./kierowca-pracownik składowy/\nkontakt 0-505-133-222,",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Złota rączka / Mechanik - Marki",
      "category": "olx",
      "phone": "505446709",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Jeśli szukasz stabilnego zatrudnienia blisko domu z szybkim dojazdem do pracy. Masz chęć do nauki, jesteś otwarty na nowe zadania i wykazujesz się własną inicjatywą, to praca dla Ciebie.\n\nJesteśmy dojrzałą i stabilną firmą, która od 10 lat specjalizuje się w profesjonalnym doradztwie w zakresie pakowania oraz zabezpieczania przesyłek. W związku ze stałym wzrostem sprzedaży poszukujemy Mechanika/operatora maszyn produkcyjnych \"złotej rączki\"\n\nDo Twoich zadań należeć będzie: \n\nPraca przy produkcji kartonów - 2 zmiany\nbieżąca praca na magazynie,\nnaprawa i konserwacja maszyn produkcyjnych,\nbieżące prace konserwacyjne urządzeń i maszyn,\nzamieszkanie w okolicy firmy tj. Marki oraz cały powiat wołomiński będzie dodatkowym atutem\n\nOferujemy przeszkolenie w pełnym zakresie, praca od poniedziałku do piątku dwie zmiany 6-14 / 14-22 przy produkcji kartonów w Markach.\n\nHurtownia Opakowań\n\nPark logistyczny Hillwood Marki 1,\n\nUl. Okólna 45, Hala B, rampa 31-32,\n\n05-270 Marki       \n\nWynagrodzenie uzależnione od doświadczenia oraz zaangażowania.\n\nCV ze zdjęciem prosimy przesyłać na adres e-mail lub kontakt telefoniczny\n\n505446709",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Krajacz papieru - (DRUKARNIA MARKI) PILNE",
      "category": "olx",
      "phone": "509137077",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Opis stanowiska:\n\nObsługa maszyny - krajarka POLAR 115 / Perfecta 115 / Schneider\nKrojenie papieru do druku i po wykończeniu druku\nDbanie o czystość i podstawowe prace serwisowe przy maszynach\n\n \n\nWymagania:\n\nNajlepszym kandydatem będzie osoba z doświadczenia w pracy w drukarni\n\nnatomiast nie jest to kryterium wymagalne ( zainteresowanym zapewniamy szkolenie na w/w maszyny)\n\nDyspozycyjność i kultura osobista - Praca zmianowa \n\n \n\nOferujemy:\n\nAtrakcyjne i terminowo wypłacane wynagrodzenie wraz z umową od początku współpracy\nMożliwość przeszkolenia\nPraca zmianowa\nDoskonałą atmosferę pracy.\n\nPRACA OD ZARAZ ",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Magazynier-komory chłodnicze",
      "category": "olx",
      "phone": "668132161",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Human Pro Logistics to agencja pracy tymczasowej licencjonowana w Polsce i na Ukrainie. W Krajowym Rejestrze Agencji zatrudnienia widniejemy pod numerem 14341.\n\nAgencja pracy Human Pro Logistics poszukuje dla swojego klienta pracowników magazynierów.\n\nMiejsce pracy- Marki ul. Bandurskiego\n\nWybrana osoba będzie odpowiedzialna m.in. za:\n\n-przygotowanie towaru zgodnie z zamówieniem\n\n-przyjmowanie dostaw oraz transport na miejsca regałowe zgodnie z normami określającymi warunki składowania\n\n-weryfikacja jakościowa i ilościowa towarów wchodzących oraz wychodzących z magazynu\n\n-trzymywanie porządku na magazynie\n\nOd osoby zatrudnionej na tym stanowisku oczekujemy :\n\n-Gotowości do pracy trzyzmianowej w dni robocze w komorach chłodniczych (mroźnia) -Badania sanitarno-epidemiologiczne\n\n-Dodatkowym atutem będzie posiadanie uprawnień do obsługi wózków widłowych;\n\n Oferujemy: \n\n-praca III zmianowa , od 6.00 do 14.00 , 14.00-22.00 , 22.00 do 6.00\n\n-zatrudnienie w ramach umowy zlecenia\n\n-stawka godzinowa za pracę w dzień 20 zł brutto, za pracę w nocy 21 zł brutto\n\n-stawka godzinowa dla osób uczących się , które nie ukończyły 26 lat , stawka 20 zł netto , na zmianie nocnej 21 zł netto\n\nOsoby zainteresowane spełniające nasze oczekiwania proszę o przesyłanie aplikacji lub o kontakt pod nr tel.668-132-161 od poniedziałku do piątku w godzinach od 8.00 do 16.00\n\nZastrzegamy sobie prawo kontaktu z wybranymi kandydatami.\n\nKlauzula informacyjna do celów rekrutacji Zgodnie z art. 13 ust. 1 i ust. 2 Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE – dalej „RODO”, informujemy, iż: Administratorem danych osobowych jest Human Pro Logistics z o. o., z siedzibą przy ul. F. Chopina 2/1, 07-200 Wyszków. Z Administratorem można skontaktować się za pośrednictwem nr tel 668-132-177 Administrator powołał Inspektora Ochrony Danych (IOD), z którym można skontaktować się we wszelkich sprawach dotyczących przetwarzania danych osobowych. Dane kontaktowe IOD: Paweł Maliszewski, 606-191-915 Dane osobowe przetwarzane będą w celu rekrutacji na wskazane stanowisko w ramach czynności zmierzających do zawarcia umowy na podstawie art. 6 ust. 1 lit. b RODO oraz na podstawie Pani/Pana zgody (art. 6 ust. 1 lit. a RODO). Dane osobowe będą przechowywane przez okres 30 dni po zakończonym procesie rekrutacji. Jeśli wyrazi Pani/Pan na to zgodę, dane będą przetwarzane w celu przyszłych rekrutacji przez okres 1 roku po zakończeniu rekrutacji na wskazane stanowisko. Odbiorcami danych osobowych mogą być podmioty świadczące dla Administratora usługi informatyczne, prawne, doradcze, ubezpieczeniowe na podstawie stosownych umów oraz podmioty upoważnione do otrzymania Pani/Pana danych osobowych na podstawie obowiązujących przepisów prawa. Posiada Pani/Pan prawo do: dostępu do treści swoich danych, żądania ich sprostowania, usunięcia lub ograniczenia ich przetwarzania; przenoszenia danych osobowych, tj. do otrzymania od Administratora informacji o przetwarzanych danych osobowych, w ustrukturyzowanym, powszechnie używanym formacie nadającym się do odczytu maszynowego, w zakresie, w jakim dane są przetwarzane w celu zawarcia i wykonywania umowy; cofnięcia zgody w dowolnym momencie bez wpływu na zgodność z prawem przetwarzania, którego dokonano na podstawie zgody przed jej cofnięciem; wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych, w przypadku uznania, iż przetwarzanie danych osobowych narusza przepisy RODO. Podanie danych osobowych jest dobrowolne, jednak dane te są potrzebne do prawidłowego realizowania wszelkich czynności związanych z procesem rekrutacji oraz ewentualnym zawarciem umowy będącej podstawą zatrudnienia/stażu. Dane osobowe nie będą poddawane zautomatyzowanemu podejmowaniu decyzji w tym profilowaniu. Dane osobowe nie będą przekazywane poza teren Unii Europejskiej ani do organizacji międzynarodowych. Oświadczenie zgody: Jeśli wyraża Pani/Pan zgodę na przetwarzanie danych osobowych po zakończeniu procesu rekrutacyjnego na potrzeby przyszłych rekrutacji, prosimy o zawarcie w dokumentach aplikacyjnych oświadczenia zgody o następującej treści: „Wyrażam zgodę na przetwarzanie danych osobowych zawartych w mojej aplikacji przez Human Pro Logistics Sp. z o. o. z siedzibą w Wyszkowie na potrzeby przyszłych procesów rekrutacji, w tym również na inne stanowiska. Mam świadomość, że moja zgoda może być wycofana w każdym czasie”.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca dla asystentki/asystenta biura w branży budowlanej",
      "category": "olx",
      "phone": "665696743",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma budowlana z wieloletnim doświadczeniem, specjalizująca się w remontach budynków wielorodzinnych i kamienic głównie na terenie Warszawy, szuka pracownika biurowego.\n\nWymagania:\n\nDoświadczenie w pracy w branży budowlanej- min 2 lata- warunek konieczny\nZnajomość obsługi pakietu MS Office (Word, Excel)\nUmiejętność myślenia analitycznego\nUmiejętność sprawnego wyszukiwania oraz analiza pozyskanych w sieci informacji\nOtwartość na rozwiązywanie problemów\nUmiejętność pracy pod presją czasu\nDobra organizacja pracy\nMile widziana wiedza na temat podstawowych technologii wykonywania robót budowlanych oraz umiejętność czytania dokumentacji projektowej\n\nZakres obowiązków:\n\nZamawianie i rozliczanie materiałów budowlanych\nAktywne poszukiwanie dostawców usług i podwykonawców\nNadzór nad terminową realizacją zamówień\nKoordynowanie terminów dostaw \nRozwiązywanie zgłaszanych problemów związanych z zamówieniami\nSprawdzanie poprawności i kompletności danych na dokumentach (WZ, faktura zakupowa, opisywanie faktur)\nWeryfikacja merytoryczna protokołów, odbiorów, usług, robót, dostaw\nWspółpraca przy opracowywaniu dokumentacji powykonawczej, materiałowej\nNegocjacje z dostawcami zewnętrznymi w celu uzyskania jak najlepszych warunków\nOkreślanie szczegółów zakupu zamówień i dostaw oraz finalizowanie transakcji\nMonitorowanie i ocena poziomów zapasów\nBieżące monitorowanie i planowanie stanu zaopatrzenia budowy zgodnie z kosztorysem\n\nOferujemy:\n\nStałe zatrudnienie w oparciu o umowę o pracę\nPraca w godzinach 7:00-15:00\nWynagrodzenie uzależnione od posiadanego doświadczenia i umiejętności\nPracę w kameralnym biurze w Markach z młodym i zgranym zespołem\npyszną kawkę ;)\n\n*Prosimy o dopisanie następującej klauzuli: „Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z ustawą z dn. 29.08.97 roku o Ochronie Danych Osobowych Dz. U. Nr 133 poz. 883)”",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Brukarz/Pomocnik Brukarza Praca",
      "category": "olx",
      "phone": "723596802",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnie brukarzy oraz pomocników brukarza.\nFirma znajduje się w Markach pod Warszawa .\nMile widziane prawo jazdy .\nOsoby zainteresowane zapraszam do kontaktu . \n723 596 802",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownika do myjni samochodowej Marki",
      "category": "olx",
      "phone": "512723141",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Serwis samochodowy zatrudni pracownika do myjni samochodowej praca w systemie dwu zmianowym od poniedziałku do piątku Marki",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnimy brukarzy, pomocników",
      "category": "olx",
      "phone": "501179463",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnimy brukarzy, pomocników brukarzy lub całą brygadę.\nPraca na terenie Warszawy i okolic.\nUmowa o prace pełen etat\nAtrakcyjne wynagrodzenie.\nBaza Firmy mieści się w Markach \nWięcej informacji \n501 179 463",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię Tynkarza",
      "category": "olx",
      "phone": "793006348",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Ztrudnię TYNKARZA na agregat, tynki gipsowe. Pracujemy cały rok, współpracujemy z zaufanymi deweloperami oraz klientami prywatnymi, płatnosci na bieżąco po każdej inwestycji.\n\nUmowa na cały etat.\n\nTel. 793006348",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Montażysta mebli kuchennych Ikea",
      "category": "olx",
      "phone": "798874282",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię do pracy w ekipie montażowej montażystę mebli kuchennych Ikea oraz mebli na wymiar.\n\nPraca w Warszawie i okolicach ( najczęściej prawa strona Wisły) w mieszkaniach klientów.\n\nZapraszam sprawne, uczciwe i kulturalne osoby z doświadczeniem w montażu mebli, agd, obsługi elektronarzędzi.\n\nWynagrodzenie wg wykazanych umiejętności i chęci do pracy. \n\nPrawo jazdy kat B mile widziane.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Korepetycje z matmy i fizyki, pomoc w pracach domowych i projektach",
      "category": "olx",
      "phone": "788273897",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Jestem absolwentem wydziału Mechanicznego Energetyki i Lotnictwa Politechniki Warszawskiej na kierunku Lotnictwo i Kosmonautyka. Mam 5 lat doświadczenia w udzielaniu korepetycji. Udzielę korepetycji z matematyki, fizyki i innych przedmiotów, jeśli potrzeba. Na lekcje mogę dojeżdżać do domu ucznia (okolice Targówka, Marek, prawa strona Wisły), jak również udzielam korepetycji online. Pomogę w nadrabianiu zaległości przez wakacje również w większym wymiarze godzin tygodniowo. Oferuję również pomoc w odrabianiu prac domowych i projektów na studia (głównie z kierunków mechanicznych, ale otwarty jestem również na inne), pisania esejów itp.\n\nZapraszam, cena do negocjacji",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "zatrudnię ekipy do wykonania elewacji/docieplenia (domki jednorodzinne",
      "category": "olx",
      "phone": "730764371",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma budowlana poszukuję pracowników do dociepleń budynków (Warszawa/okolice).\n\nStawka za m2 60zł.\n\nTylko wykwalifikowani pracownicy.\n\nWięcej informacji pod numerem telefonu.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "pracownik produkcji ->Panie i Panowie-> wyższe stawki-> pn - pt",
      "category": "olx",
      "phone": "48515087423",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zastanawia Cię jak wygląda produkcja majonezów, musztard, sosów? Szukasz pracy od zaraz? Mamy ofertę dla Ciebie! Dla naszego Klienta firmy z branży FMCG poszukujemy kandydatów do pracy na stanowisku: pracownik pomocniczy produkcji - miejsce pracy Warszawa, Praga Północ. \n\nZAAPLIKUJ przez formularz, ZADZWOŃ lub WYŚLIJ SMS O TREŚCI PRACA, na numer 515 087 423, a my do Ciebie oddzwonimy i opowiemy o szczegółach.\n\noferujemy\n\nstawkę godzinową 20 zł/h brutto + 500 zł premii (około 2800 zł na rękę miesięcznie)\nmożliwość rozpoczęcia pracy od zaraz \numowę o pracę tymczasową na pełny etat (ZUS, urlop, świadczenia)\nmożliwość pracy na część etatu\npracę od poniedziałku do piątku\natrakcyjny pakiet benefitów (prywatna opieka medyczna, karta sportowa)\n\nzadania\n\nskładanie opakowań zbiorczych\nodbieranie z końca linii produkcyjnej opakowań jednostkowych i układanie ich w opakowania zbiorcze (tacki, kartony) \nzaładunek gotowych produktów na palety\n\noczekujemy\n\nksiążeczka sanepid\nnie oczekujemy doświadczenia - wszystkiego Cię nauczymy\ngotowość do pracy w systemie trzyzmianowym\n\nAgencja zatrudnienia – nr  wpisu 47",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca kelnerka/kelner w hotelu*** w Markach",
      "category": "olx",
      "phone": "509555673",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Hotel Mistral*** w Markach pod Warszawą szuka osób na stanowisko Kelnerka/kelner na pełen etat.\n\nWymagany język angielski na poziomie pozwalającym dogadać się z zagranicznymi gośćmi. \n\nStawka 2500 - 4000 brutto - zależna od zaangażowania.\n\nPraca od 10:00 do 22:00 co drugi dzień - 1 dzień pracujący, 1 dzień wolnego. \n\nOsoby zainteresowane prosimy o wysyłanie CV przez OLX lub kontakt telefoniczny - 509 555 673.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca Kucharz - Hotel*** w Markach - od 23 zł/h netto",
      "category": "olx",
      "phone": "601243396",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Dzień dobry,\n\nHotel Mistral*** w Markach pod Warszawą szuka osoby na stanowisko KUCHARZ na pełen etat.\n\nStawka od 23 zł/h netto - do ustalenia po poznaniu umiejętności.\n\nPraca od 10:00 do 22:00 w systemie 2/2 (2 dni pracujące, 2 dni wolnego)\n\nOsoby zainteresowane prosimy o wysyłanie CV przez OLX lub kontakt telefoniczny tel. 601 24 33 69.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pomocnik budowlany, pomocnik brukarza Marki/k Warszawy",
      "category": "olx",
      "phone": "723050300",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię pomocnika budowlanego. Zapewniamy stałą pracę, pomagamy znaleźć kwaterę. Piwo po pracy gratis!",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Kierowca C+E kraj",
      "category": "olx",
      "phone": "507382023",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię kierowcę C+E na zestaw: ciągnik siodłowy plus naczepa firanka. Jazda wokół komina. Trasa Stryków-Siedlce (DPD) . Warunki pracy do uzgodnienia (dzien/noc itp) Możliwość codziennego zjazdu do domu. Wynagrodzenie od 5 tys do 7 tys netto. Doświadczenie min. pół roku. Siedziba firmy mieści się w Markach. Osoby zainteresowane proszę o kontakt telefoniczny.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię tynkarzy!!!",
      "category": "olx",
      "phone": "694448460",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "PILNE!!! Zatrudnię ekipę tynkarzy 4 osoby, praca całe woj. mazowieckie, możliwość darmowego zakwaterowania, wysokie wynagrodzenie. Obowiązkowo znajomość obsługi agregatu tynkarskiego oraz doświadczenie. Tynki cementowe oraz gipsowe. PRACA NA JUŻ.\n\n18 zł / m2",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Serwis rowerów i motocykli",
      "category": "olx",
      "phone": "602310122",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnimy emeryta/rencistę do sprzedaży i naprawy rowerów oraz motocykli. Mile widziany mechanik z doświadczeniem. Praca w Markach.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik myjni samochodowej",
      "category": "olx",
      "phone": "605176949",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma Panel Serwis zatrudni do sprzątania powierzchni handlowej \n\nMarki, ul. Piłsudskiego 2B\n\nOferujemy:\n\n·        stabilne warunki zatrudnienia,\n\n·   stawka godzinowa 18,30 brutto,\n\n·        praca w systemie 2 zmianowym,\n\n·        wsparcie na etapie wdrożenia do pracy,\n\n·        szkolenia.\n\nMile widziane: \n\n·   osoby z zagranicy, \n\n·      orzeczenie o niepełnosprawności,\n\n·      doświadczenie w pracy o podobnych charakterze,\n\n·      sumienność, dokładność,\n\n·      punktualność.\n\nZainteresowane osoby zapraszam do kontaktu pod nr telefonu 509 297 028, 605 176 949.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "kasjer/kasjerka sklep osiedlowy, Marki",
      "category": "olx",
      "phone": "663377388",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnimy miłą Panią/Pana na stanowisku \n\nkasjer lub sprzedawca dział mięso, wędliny, sery. \n\nMiejsce pracy: supermarket osiedlowy Marki, ul. Kartografów. \n\nWymagania: \n\nmin. roczne doświadczenie na podobnym stanowisku, \naktualne zaświadczenie do celów sanitarno-epidemiologicznych, \nrzetelność, uczciwość. \n\nPraca w systemie 2-zmianowym w godz. 6:00-21:30. Zapewniamy atrakcyjne wynagrodzenie, w razie potrzeby szkolenie. Zachęcamy do złożenia CV do kontaktu telefonicznego pod nr tel. 663-377-388. \n\nW związku z art. 24 ust. 1 ustawy z dnia 29 sierpnia 1997 r. o ochronie danych osobowych (Dz.U. 2016 poz. 922 z późn. zm.) informujemy, iż administratorem danych osobowych zawartych w Pani/Pana dokumentach aplikacyjnych jest HMC Witold Kołodziejczak z siedzibą w Warszawie, ul. Zeusa 45/47. Prosimy o zawarcie w aplikacji klauzuli: \"Wyrażam zgodę na przetwarzanie danych osobowych zawartych w mojej aplikacji przez HMC Witold Kołodziejczak z siedzibą w Warszawie, ul. Zeusa 45/47 na potrzeby przeprowadzenia bieżącego procesu rekrutacji.\"",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik produkcji",
      "category": "olx",
      "phone": "606282414",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Miejsce pracy: Stanisławów Pierwszy\n\nManpower (Agencja zatrudnienia nr 412) to globalna firma o ponad 70-letnim doświadczeniu, działająca w 82 krajach. Na polskim rynku jesteśmy od 2001 roku i obecnie posiadamy prawie 35 oddziałów w całym kraju. Naszym celem jest otwieranie przed kandydatami nowych możliwości, pomoc w znalezieniu pracy odpowiadającej ich kwalifikacjom i doświadczeniu. Skontaktuj się z nami - to nic nie kosztuje, możesz za to zyskać profesjonalne doradztwo i wymarzoną pracę!\n\nDla jednego z naszych klientów poszukujemy osoby na stanowisko:\n\nPracownik produkcji\n\nZakres obowiązków\n• Kontrola jakości\n• Pakowanie\n• Etykietowanie\n• Paletyzowanie oraz przygotowywanie do wysyłki\n\nOczekiwania\n• Badania sanepidowskie lub chęć do ich wyrobienia\n\nOferta\n• Stabilne zatrudnienie w oparciu o umowę o pracę\n• Wdrożenie i przygotowanie do samodzielnej pracy\n• Możliwość rozwoju w strukturach firmy\n• Atrakcyjne wynagrodzenie (podstawa + premia)\n• Pakiet benefitów (karta MultiSport, prywatna opieka medyczna, ubezpieczenie grupowe)\n• Praca w systemie 3-zmianowym 4-brygadowym\n \nNumer ref.: PPR/057/PNO\nOferta dotyczy pracy tymczasowej",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca Kucharz - Hotel*** w Markach - od 23 zł/h netto",
      "category": "olx",
      "phone": "601243369",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Dzień dobry,\n\nHotel Mistral*** w Markach pod Warszawą szuka osoby na stanowisko KUCHARZ na pełen etat. Rozpoczęcie pracy jak najszybciej.\n\nStawka od 23 zł/h netto - do ustalenia po poznaniu umiejętności.\n\nPraca od 10:00 do 22:00 w systemie 2/2 (2 dni pracujące, 2 dni wolnego)\n\nOsoby zainteresowane prosimy o wysyłanie CV przez OLX lub kontakt telefoniczny tel. 601 24 33 69.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "zatrudnię samodzielnego stolarza meblowego",
      "category": "olx",
      "phone": "600635688",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma Venari Meble zatrudni na stanowisku samodzielnego stolarza meblowego (z doświadczeniem). Oferujemy prace na stolarni, przy produkcji elementów meblowych.\nPraca na pełen etat (warunki do uzgodnienia)\nKomfortowe warunki pracy.\nWarsztat wyposażony jest we wszystkie niezbędne maszyny, które umożliwiają szybkie wykonanie najbardziej skomplikowanych mebli.\nWarsztat znajduje się w Markach (k/W-wy)",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Kierowca kategoria B, C- m.in kierowcy z firm kurierskich",
      "category": "olx",
      "phone": "509917886",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Jesteśmy prężnie rozwijającą się firmą specjalizującą się w naprawach mechanicznych, blacharskich, lakierniczych pojazdów osobowych i dostawczych, prowadzimy wypożyczalnię pojazdów zastępczych i zajmujemy się holowaniem 24h.\n\nFirma posiada 40-letnią praktykę w branży motoryzacyjnej i jest częścią autoryzowanej sieci naprawczej PZU i Link4\n\n \n\nMiejsce pracy: ZĄBKI, MARKI, ZIELONKA, TARGÓWEK, BIAŁOŁĘKA, BRÓDNO\n\n \n\nWymagania:\n\nprawo jazdy kat. B, C\n\nWysoka kultura osobista\n\nUmiejętność pracy w zespole,\n\nDokładność, sumienność i skrupulatność\n\nZaangażowanie w wykonywaną pracę\n\nOtwartość i komunikatywność\n\nGotowość do poszerzania wiedzy i nowych umiejętności\n\n \n\n \n\nOferujemy:\n\nPracę od zaraz\nZatrudnienie w oparciu o umowę o pracę\nAtrakcyjne wynagrodzenie\nMiłą i przyjazną atmosferę pracy",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Potrzebne Tynkarze !!! SZUKAMY SPECJALISTÓW!! Нужны Штукатуры!",
      "category": "olx",
      "phone": "576159903",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukujemy SPECJALISTÓW!!!\nPotrzebne TYNKARZE !! \n\nWymagania - doświadczenie w pracy na tynkach cementowo-wapiennych!!! \n\nPraca na akord !!! \nWynagrodzenie od 8000 zł w miesiąc !!!\nWypłata raz w tygodniu !!!\nPraca w Warszawie i okolicy !!! \n\nPytania pod numerem \n\n+48 576 159 903 Aleksandr !!!\n\nNIE potrzebujemy do pracy kobiet i pomocników! Tylko mężczyźni z doświadczeniem !!!\n\nНужны ШТУКАТУРЫ !!!\nТребования - опыт работы на цементно известковой штукатурке !!!\n\nВся работа выполняется с АГРЕГАТА, материал из готовой смеси в мешках !!!\n\nРабота на аккорд !!!\nИли оплата по часовая !!!\nЗ/П от 8 000 zł в месяц !!!\nВыплата раз в неделю !!! \nРабота в Варшаве и окрестности !!!\n\nВопросы по номеру \n\n+48 576 159 903 Александр !!!",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "zatrudnimy kierowcę, dostawcę na weekendy do pizzerii w Markach",
      "category": "olx",
      "phone": "602600522",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Opis\n\nZatrudnimy dostawcę do pizzerii w Markach od zaraz \n\nPraca w godzinach 12-22, głównie piątek- niedziela, grafik elastyczny. Praca możliwa od najbliższego weekendu\n\nSamochód służbowy, stawka godzinowa do ustalenie (proponujemy na start 15zł netto/h, jeśli współpraca się układa możliwość negocjacji) Masz swój samochód? dorzucamy $ za każdy kurs\n\nWięcej informacji : 602 600 522",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zaopatrzeniowiec / Magazynier ( Marki )",
      "category": "olx",
      "phone": "774099505",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Opoltrans - Sieć Hurtowni Motoryzacyjnych\n\nPoszukujemy Zaopatrzeniowca / Magazyniera do Oddziału Opoltrans w Markach, ul. Mjr Billa 2A\n\nOpis zadań:\n\nDostarczanie zamówionych towarów do klientów ( art. motoryzacyjne )\nWykonywanie prac magazynowych ( przyjmowanie, wydawanie towarów z magazynu)\nWspółpraca z działem handlowym\n\nWymagania:\n\nPrawo jazdy kat. B\nMile widziane doświadczenie lub zainteresowania związane z branżą motoryzacyjną Umiejętność pracy w zespole, dyspozycyjność, odpowiedzialność\nGotowość do prowadzenia własnej działalności gospodarczej w dalszej współpracy\n\nOferujemy:\n\nStabilne warunki współpracy, nieograniczona prowizja adekwatna do wyników, docelowo w systemie biznes dla biznesu B2B\nMożliwości rozwoju zawodowego i osobistego w renomowanej i prężnie rozwijającej się firmie motoryzacyjnej\n\nZapraszamy do współpracy :)\n\nPotrzebujesz więcej informacji? Zadzwoń: 77 40 99 505",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "praca biurowa w Markach",
      "category": "olx",
      "phone": "882026260",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Sanico Electronics Polska Sp. z o.o. \n\nJest wiodącym producentem artykułów oświetleniowych w Polsce. \n\nFirma zaczęła działalność w Polsce w 2002 roku, aktualnie w związku z rozwojem naszej firmy poszukujemy Kandydata na stanowisko: \n\n \n\nAsystent w dziale obsługi klienta\n\n \n\nMiejsce pracy:  Marki k. Warszawy\n\n \n\nOpis podstawowych czynności i obowiązków na stanowisku:\n\n•              wystawianie faktur, faktur korygujących i not korygujących\n\n•              sprawdzanie poprawności wystawianych dokumentów\n\n•              wprowadzanie zamówień do systemu informatycznego\n\n•              kontrola obiegu dokumentacji handlowej i księgowej\n\n•              wystawianie dokumentów magazynowych \n\n•              przygotowywanie listów przewozowych i raportów wysyłek\n\n•              nadzór nad wykonaną dostawą towarów i usług\n\n•              obsługa i utrzymywanie kontaktu z klientami w zakresie zamówień\n\n \n\nWymagania:\n\n•              zaangażowanie w pracę\n\n•              skrupulatność, komunikatywność, wysoka kultura osobista\n\n•              zdolność pracy pod presją czasu bez obniżenia jakości wykonywanej pracy (wysoko ceniona)\n\n•              dobra znajomość obsługi komputera\n\n•              minimum średnie wykształcenie, najlepiej profilowe, związane z rachunkowością lub księgowością\n\n•              znajomość praktyk i zasad księgowych i zagadnień handlowych (mile widziana)\n\n \n\nOferujemy:\n\n•              zatrudnienie na pełen etat na podstawie umowy o pracę\n\n•              pakiety socjalne pracownicze, m.in. prywatny pakiet opieki medycznej z możliwością rozszerzenia na rodzinę, prywatne ubezpieczenie na życie\n\n•              przyjazną atmosferę pracy i przyjemne nowoczesne środowisko pracy\n\n•              ciekawą pracę w młodym i dynamicznym zespole\n\n•              atrakcyjne wynagrodzenie adekwatne do umiejętności i zaangażowania\n\n•              możliwość rozwoju zawodowego wewnątrz dużej i dynamicznie rozwijającej się firmy\n\n \n\nOsoby zainteresowane prosimy o przesłanie CV na adres e-mail podany w ogłoszeniu lub złożenie przez portal.\n\n \n\nZastrzegamy sobie prawo do kontaktu tylko z wybranymi Kandydatami.\n\n \n\nProsimy o zawarcie w CV lub liście motywacyjnym klauzuli: \n\nWyrażam zgodę na przetwarzanie moich danych osobowych w niniejszym dokumencie dla potrzeb realizacji obecnych i przyszłych procesów rekrutacji prowadzonych przez Sanico Electronics Polska Sp. z o.o. zgodnie z ustawą z dnia 10 maja 2018 roku o ochronie danych osobowych (Dz. Ustaw z 2018, poz. 1000) oraz zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO).\n\n ",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię ekspedientkę do sklepu w Markach",
      "category": "olx",
      "phone": "508698340",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnimy osoby na stanowisko sprzedawca / ekspedient w sklepie firmowym Zakładów Mięsnych Somianka w Markach ul .J. Piłsudskiego 176\n\nwymagania:\n\n- dyspozycyjność i zaangażowanie,\n\n- rzetelność i uczciwość,\n\n- umiejętność nawiązywania kontaktów z klientami,\n\n- aktywne podejście do sprzedaży i promocji,\n\n- zapewnienie wysokich standardów obsługi klienta,\n\n- atutem będzie doświadczenie w handlu i umiejętność obsługi kasy fiskalnej.\n\n- książeczka do celów sanitarno-epidemiologicznych lub gotowość do jej wyrobienia.\n\noferujemy:\n\n- umowę o pracę,\n\n- uczciwe i przejrzyste zasady pracy,\n\n- stabilne zatrudnienie,\n\n- motywacyjne wynagrodzenie,\n\n- miłą atmosferę w pracy.\n\n- możliwość przyuczenia do zawodu\n\nosoby zainteresowane pracą prosimy o kontakt telefoniczny lub wysłanie swojego cv przez serwis olx. odpowiemy na wybrane ogłoszenia i skontaktujemy się w celu ustalenia terminu rozmowy.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca w sklepie internetowym (obsługa klienta)",
      "category": "olx",
      "phone": "507061884",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Sklep internetowy z ubrankami dla dzieci poszukuje pracownika na stanowisko \"Obsługa sklepu\".\n\nLokalizacja: Warszawa Marki, ul. Okólna 45\n\nZakres obowiązków:\n\nprzyjmowanie dostaw\nwprowadzanie produktów na stronę internetową sklepu\nwystawianie aukcji na serwisach typu marketplace\nobsługa zamówień internetowych\nkompletowanie, pakowanie, etykietowanie i przygotowywanie zamówień do wysyłki\nprzygotowywanie podsumowań finansowych i sprzedażowych\nobsługa klientów\nkontrola procesu logistycznego\n\nOferujemy: \n\nmożliwość rozwoju\nterminową wypłatę wynagrodzenia\npracę w miłej i przyjaznej atmosferze\n\nOd Kandydatów oczekujemy:\n\nchęci do podjęcia pracy 'od zaraz'\ndobrej organizacji pracy\ndokładności i sumienności w wykonywaniu powierzonych zadań\npunktualności\ndobrej znajomości obsługi komputera (znajomość pakietu MS Office, programów edytorskich, znajomość PrestaShop i Baselinker będzie dodatkowym atutem)\n\nZainteresowane osoby prosimy o przesłanie CV. Prosimy o dopisanie następującej klauzuli: „Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z ustawą z dn. 29.08.97 roku o Ochronie Danych Osobowych Dz. Ust Nr 133 poz. 883).” Uprzejmie informujemy, że skontaktujemy się tylko z wybranymi kandydatami.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Proste prace produkcyjne- również dla kobiet!",
      "category": "olx",
      "phone": "574575404",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Dla naszego Klienta, niekwestionowanego lidera w swoim sektorze oraz cenionego Pracodawcy poszukujemy kandydatów na stanowisko:\n\nPROSTE PRACE PRODUKCYJNE\n\nLokalizacja:  Słupno, gm. Radzymin, woj. mazowieckie\n\n \n\nOferujemy:\n\nzatrudnienie w ramach umowy zlecenie,\nstawkę godzinową wynoszącą 19 zł/h brutto,\nwspółpracę w systemie 3 zmianowym: 06:00-14:00; 14:00-22:00 oraz 22:00-06:00 od poniedziałku do piątku,\npełne szkolenie stanowiskowe.\n\nZadania:\n\nproste czynności produkcyjne,\nobsługa maszyn produkcyjnych,\nutrzymanie porządku na stanowisku.\n\nWymagania:\n\ngotowość do pracy w systemie 3 zmianowym,\nsumienność oraz dokładność,\nzdolności manualne,\npełna sprawność fizyczna.\n\nOsoby zainteresowane prosimy o wysyłanie swojego CV poprzez formularz aplikacyjny lub kontakt pod numerem 574575404.\n\nZgodnie z obowiązującym prawem Workhouse4you Sp. z o.o. nie pobiera opłat od kandydatów za udział w procesach rekrutacyjnych.\n\n \n\nBardzo prosimy o dopisanie poniższej klauzuli do CV: „Wyrażam zgodę na przetwarzanie moich danych osobowych i innych danych zawartych w mojej aplikacji oraz CV na potrzeby obecnego procesu rekrutacyjnego prowadzonego przez Workhouse4you Sp. z o.o. z siedzibą w Gdańsku, ul. Obrońców Wybrzeża 4d/16, 80-398 Gdańsk. Jestem świadomy/a przysługującego mi prawa do wycofania zgody, jak również faktu, że wycofanie zgody nie ma wpływu na zgodność z prawem przetwarzania, którego dokonano na podstawie zgody przed jej wycofaniem. Zgodę mogę odwołać przesyłając informację o wycofaniu zgody na adres: office(at)workhouse4you.pl”.\n\nWyrażenie niniejszej zgody jest dobrowolne, lecz niezbędne dla wzięcia udziału w procesie rekrutacji. W przypadku braku zgody, zgłoszenie rekrutacyjne nie zostanie uwzględnione w procesie rekrutacji.\n\nWorkhouse4you(c.23651)",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię Kadrową do biura Rachunkowego Marki",
      "category": "olx",
      "phone": "608433209",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Witam zatrudnimy Kadrową do pracy w Biurze Rachunkowym pracujemy na programach symfonia kadry i płace płatnik, praca w zespole jesteśmy na rynku ponad 20-lat prosimy o kontakt cv. tel 608433209 ",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zlecę budowę domków Marki, Kobyłka, Warszawa Białołęka",
      "category": "olx",
      "phone": "730387504",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zlecę budowę domków jednorodzinnych w stanie surowym na budowach w Markach, Kobyłce i Warszawie na Białołęce. Proszę o kontakt telefoniczny pod numerem 730387504",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Telepraca - NEURON znowu zatrudnia - masz doświadczenie? Zapraszamy",
      "category": "olx",
      "phone": "510107405",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma jest od 12 lat na rynku, działając w branży call center. Umawiamy spotkania, ankietujemy, sprzedajemy, windykujemy. Praca zdalna od 2009 roku !!! z dowolnego miejsca na świecie. Firma ma za sobą około 350 projektów i wielu zadowolonych klientów.\n\nObecnie bardzo mocno rozwijamy nasze call center, ponawiając sesje rekrutacyjne i szkoleniowe co kilka tygodni. Przyszedł czas na kolejną taką sesję rekrutacji więc zapraszamy osoby z doświadczeniem do dołączenia do naszego zespołu.\n\nPoszukujemy osób do pracy na kilku projektach do wyboru, zależnie od doświadczenia i umiejętności. Zapewniamy prawie wszystko co potrzebne do pracy. Po stronie pracownika jest posiadanie ciągłej chęci do pracy i wewnętrznej energii, dzięki której będą w stanie prowadzić efektywne rozmowy z klientami.\n\nFirma działa od 2009 roku w formie telepracy, a więc wiemy na ten temat wszystko. Pracownicy są szkoleni i wspierani na co dzień przez doświadczonych coach'ów, co prowadzi do szybkiego wejścia w projekty oraz osiągania przyzwoitych pensji. Mamy naprawdę dobry i efektywny zespół - naszym celem jest teraz to aby był jeszcze większy.\n\nZ racji tego, że jest to wyłącznie forma telepracy, nie możemy zatrudnić osób bez doświadczenia. Prosimy o aplikowanie takie osoby, które mają doświadczenie w tej branży lub pokrewnych, związanych z pracą z klientami.\n\nWymagania na stanowisku pracy są takie jak poniżej:\n\nObowiązkowo doświadczenie w kontakcie z klientem przez telefon, obsłudze klienta lub pokrewnych dziedzinach.\nBezwzględna uczciwość i rzetelność w realizacji powierzonych obowiązków.\nPoprawna polszczyzna, dobra dykcja, samodyscyplina.\nUmiejętność posługiwania się komputerem i narzędziami internetowymi.\nPosiadanie komputera ze stałym łączem internetowym, słuchawkami z mikrofonem.\nPosiadanie cichego i spokojnego miejsca do pracy, bez odgłosów domowych, itp.\nWymagamy minimum 6 godzin pracy dzienni, od poniedziałku do piątku.\n\nOferujemy\n\nPraca w domu, bez dojazdów, straty czasu i środków. Ogromny komfort pracy.\nPrzyjazne środowisko współpracy, wsparcie na każdym etapie pracy.\nPłatne szkolenie przygotowujące do pracy.\nDostęp do pełnej gamy narzędzi.\nMożliwość rozwoju w firmie z dużym doświadczeniem.\nWynagrodzenie podstawowe (19zł. brutto) oraz bardzo wysokie premie za osiągane wyniki.\nWspółpraca z firmą o dużym doświadczeniu w organizacji zatrudnienia w formie telepracy.\nPensje na czas, choć najczęściej przed czasem.\n\nPraca jest dostępna od zaraz. Szkolenia odbywają się co kilka dni. \n\nZapraszamy do składania aplikacji.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca w lodziarni bez doświadczenia - Marki",
      "category": "olx",
      "phone": "534840468",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukujemy pracownika do pracy w lodziarni Lodolandia w Markach.\n\nZapewniamy pełne szkolenie oraz pomoc wyrobieniu książeczki sanepidu.\n\nElastyczny grafik.\n\nPraca w godzinach 9:00-21:00.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Blacharz samochodowy",
      "category": "olx",
      "phone": "227637000",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": " Grupa Cygan TOYOTA LEXUS ogłasza nabór pracowników na stanowisko Blacharz  Pojazdów Samochodowych . Jeśli:  pasjonujesz się motoryzacją , posiadasz wiedzę w zakresie  napraw  nadwozi , chcesz poznawać nowe technologie.\n\nDołącz do zespołu ! Stabilna praca ! Możliwość przyuczenia do zawodu !\n\ntel. 537-754-658  ",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownicy Produkcyjni, Inter Europol S.A.",
      "category": "olx",
      "phone": "227716907",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Inter Europol S.A. to polska firma rodzinna, która powstała w 1989 roku. Dziś szczycimy się pozycją lidera\n\nw produkcji pieczywa w Polsce, a nasze wyroby dostarczamy do Klientów na terenie Unii Europejskiej, a także do wybranych krajów na całym świecie.\n\n \n\nW związku z dynamicznym rozwojem firmy Inter Europol S.A. zapraszamy do kontaktu osoby zainteresowane zatrudnieniem na stanowisku:\n\n \n\nPracowników Produkcyjnych \n\n(miejsce pracy: Marki, Małopole)\n\nGłówne zadania:\n\n \n\nWykonywanie prac na liniach produkcyjnych związanych z wypiekiem, pakowaniem, sortowaniem pieczywa,\nPrzestrzeganie procedur, zasad i obowiązków związanych z utrzymaniem standardów usług.\n\n Wymagania:\n\n Mile widziane:\n\n*doświadczenie w firmie produkcyjnej w branży spożywczej,\n\n*uprawnienia do kierowania wózkiem widłowym,\n\nUczciwość, sumienność, rzetelność,\nDyspozycyjność i gotowość do pracy w systemie jednozmianowym (I zmiana: 6:00-14:00; II zmiana: 14:00-22:00; III zmiana: 22:00-6:00 , 19:00-03:00) lub w systemie zmianowym rotacyjnym (zmiany naprzemienne po tygodniu),\nWymagana książeczka dla celów sanitarno-epidemiologicznych.\n\n \n\nOferujemy:\n\n Pracę pełną wyzwań w dynamicznie rozwijającej się firmie,\nStabilne warunki zatrudnienia (umowa o pracę),\nKonkurencyjne wynagrodzenie oraz pakiet świadczeń pracowniczych,\nMożliwość rozwoju zawodowego w strukturach firmy.\n\n \n\nUprzejmie informujemy, że skontaktujemy się tylko z wybranymi kandydatami\n\n \n\nAdministratorem Państwa danych osobowych przetwarzanych podczas procesu rekrutacji jest Inter Europol S.A. (ul. Słoneczna 22, 05-270 Marki), wpisana do rejestru przedsiębiorców Krajowego Rejestru Sądowego prowadzonego przez Sąd Rejonowy dla m.st. Warszawy w Warszawie, XIV Wydział Gospodarczy Krajowego Rejestru Sądowego pod numerem KRS 0000674460.\n\n \n\nZ pełną informacją na temat tego w jaki sposób przetwarzamy Państwa dane osobowe jako kandydatów do pracy w Inter Europol S.A. można zapoznać się w naszej Polityce Prywatności, którą można znaleźć tutaj: www.intereuropol.pl/polityka-prywatnosci/\n\n \n\n ",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Poszukujemy AGENTA OCHRONY- obiekt handlowy -Warszawa, różne dzielnice",
      "category": "olx",
      "phone": "603150711",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Dla firmy z branży ochrony i bezpieczeństwa, w związku z intensywnym rozwojem firmy, poszukujemy AGENTÓW OCHRONY na obiekt handlowy\n\nLokalizacja:\n\nWarszawa Praga Południe, godziny ochrony 07:00-23:00\nWarszawa Wola, godziny ochrony 06:30-22:00\nMarki koło Warszawy, godziny ochrony 07:00-23:00\nWarszawa Ursynów, godziny ochrony 07:00-22:00\n\nKandydatom oferujemy:\n\nzatrudnienie na podstawie umowy zlecenia,\nstawkę godzinową 15,50 netto/h\nkompleksowe wdrożenie i szkolenie,\nwsparcie ze strony koordynatorów\n\nOd kandydatów oczekujemy:\n\nzaangażowania w wykonywane czynności,\nsumienności i odpowiedzialności,\ndoświadczenia lub predyspozycji do zatrudnienia w ochronie\nniekaralności\n\nOsoby zainteresowane prosimy o przesyłanie zgłoszeń przez portal OLX lub kontakt pod numerem 603-150-711. \n\n﻿\n\nAdministratorem Twoich danych osobowych jest spółka LABORS Sp. z o. o. z siedzibą w: 00-140 Warszawa, Al. Solidarności nr 117. Dane kontaktowe inspektora ochrony danych: iodmałpalabors.pl. Dane osobowe są przetwarzane wyłącznie w celu rekrutacji, na podstawie Twojej dobrowolnej zgody. Masz prawo do wycofania zgody w dowolnym momencie, przy czym cofnięcie zgody nie ma wpływu na zgodność przetwarzania, którego dokonano na jej podstawie przed cofnięciem zgody. Dane osobowe będą przetwarzane przez okres nie dłuższy niż 6 miesięcy, chyba że wcześniej wycofasz swoją zgodę. Twoje dane osobowe nie będą przekazywane do państw trzecich. Podanie danych jest dobrowolne, ale konieczne w celu przeprowadzenia rekrutacji, w której bierzesz udział. Masz prawo dostępu do Twoich danych osobowych, ich sprostowania, usunięcia lub ograniczenia przetwarzania, prawo do przenoszenia danych oraz prawo wniesienia skargi do organu nadzorczego. [LABORS Sp. z o. o. wpis do rejestru agencji zatrudnienia 19794]",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "M1 - Dostawca na skuter firmowy - Pizza Hut",
      "category": "olx",
      "phone": "669113334",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukiwani dostawcy restauracji Pizza Hut w CH M1, którzy chcą jeździć skuterem firmowym.\n\n.\n\nOferujemy:\n\numowę zlecenie\npracę w miłej atmosferze\nposiłki pracownicze w symbolicznej cenie\nelastyczny grafik\natrakcyjne wynagrodzenie (godzinówka)\n\nWynagrodzenie jest wypłacane każdego miesiąca (brak tygodniówek).\n\nNa ten moment nie przyjmujemy osób ze statusem studenta.\n\nKandydaci powinni posiadać badania sanitarno-epidemiologiczne lub chęci i gotowość do ich wyrobienia.\n\nJeżeli jesteś zainteresowany/zainteresowana naszą ofertą ZADZWOŃ! Czekamy na Twoje CV bądź wiadomość z numerem telefonu!\n\nW zgłoszeniu proszę o podanie dyspozycyjności oraz określenie dnia, od którego możesz zacząć pracę!",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Kasjerko kelnerkę do baru kebab Marki",
      "category": "olx",
      "phone": "501329932",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię kasjerko- kelnerkę z doświadczeniem w pracy w kebabie.\nUWAGA! Oferujemy bardzo dobre zarobki, częste premie( nawet codziennie), pracę w młodym zespole. \nKemer Kebab Marki  ul Piłsudskiego 200 ( Centrum handlowr Prima Park)\nProszę o tel. 501329932",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca fizyczna przy paletach",
      "category": "olx",
      "phone": "696099424",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Przyjmę do pracy na skup palet w Markach , mile widziane uprawnienia na wózek widłowy\n\ntel. 696 099 424",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca dla pielęgniarki na obozie w Stegnie nad morzem lub na telefon",
      "category": "olx",
      "phone": "604688803",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukuję pielęgniarki albo ratownika medycznego lub pielęgniarki z uprawnieniami wychowawcy do opieki pielęgniarskiej nad dziećmi na obozie letnim w Stegnie nad morzem Bałtyckim. Obozy odbywają się w terminach 27 czerwca - 6 lipca, 6 - 15 lipca, 15 - 24 lipca 2021. Praca do ustalenia: na miejscu z zakwaterowaniem lub na telefon na dojazd w odpowiednich godzinach. Proszę o kontakt 604-688-803.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "KIEROWCA KAT. B Transport międzynarodowy UE",
      "category": "olx",
      "phone": "666331113",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię kierowcę kat. B w transporcie międzynarodowym na terenie UE. Praca w kółku Polska - Holandia. \n\nW celu uzyskania szczegółowych informacji prosimy o kontakt telefoniczny 666 - 331 - 113",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik biurowy - staż",
      "category": "olx",
      "phone": "730620620",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Do obowiązków stażysty będzie m. in.:\n\n·        dbanie o sprawny obieg informacji i dokumentów w firmie,\n\n·        zarządzanie korespondencją tradycyjną i mailową,\n\n·        zaopatrzenie biura w materiały biurowe, spożywcze itp.,\n\n·        wprowadzanie dokumentów do systemu księgowego,\n\n·        obsługa kasy,\n\n·        przygotowywanie dokumentacji dla biura rachunkowego,\n\n·        segregacja i archiwizacja dokumentów księgowych,\n\n·        kontrola faktur/dokumentów pod względem formalnym, merytorycznym i rachunkowym.\n\n \n\nWymagania:\n\n·        miła aparycja i wysoka kultura osobista,\n\n·        umiejętność dobrej organizacji pracy,\n\n·        bardzo dobra znajomość obsługi komputera,\n\n·        rzetelność, sumienność, pracowitość i poczucie humoru.\n\nWymagania rekrutacyjne:\n\n·        Osoba zarejestrowana w Urzędzie Pracy \n\n·        CV ze zdjęciem w formacie .pdf lub .doc\n\n·        Informujemy, że skontaktujemy się tylko z wybranymi osobami.\n\n \n\nOferujemy:\n\nStaż w Firmie z 25-letnim doświadczeniem w zgranym zespole w wyjątkowo miłej atmosferze.\n\n \n\nProsimy o dodanie klauzuli: \n\nWyrażam zgodę na przetwarzanie danych osobowych zawartych w mojej aplikacji przez Matraszek S.J z siedzibą w Markach przy ul. Słonecznej 2 F  na potrzeby przeprowadzenia procesu rekrutacji.\n\n \n\nAdministratorem Danych Osobowych jest Matraszek S.J. z siedzibą w Markach, ul. Słoneczna 2F. Podanie danych osobowych w CV jest dobrowolne, lecz konieczne do przeprowadzenia procesu rekrutacyjnego. Konsekwencją niepodania danych osobowych będzie brak możliwości przeprowadzenia postępowania rekrutacyjnego. Dane osobowe przetwarzane będą na podstawie art. 6 ust. 1 pkt. a i c ogólnego rozporządzenia o ochronie danych osobowych z 27 kwietnia 2016 r. (RODO). Przysługuje Pani/ Panu prawo dostępu do treści swoich danych osobowych oraz prawo ich sprostowania, usunięcia, ograniczenia przetwarzania, prawo do przenoszenia danych, prawo do wniesienia sprzeciwu, prawo do cofnięcia zgody na ich przetwarzanie w dowolnym momencie bez wpływu na zgodność z prawem przetwarzania, którego dokonano na podstawie zgody przed jej cofnięciem. Przysługuje Pani/Panu prawo wniesienia skargi na przetwarzanie danych do Prezesa Urzędu Ochrony Danych Osobowych. Dane osobowe będą przetwarzane do momentu zakończenia prowadzenia rekrutacji, nie dłużej jednak niż przez trzy miesiące od momentu przesłania CV. ",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię osobę na stanowisko fryzjer",
      "category": "olx",
      "phone": "516613278",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię osobę z doświadczeniem na stanowisko fryzjer (damsko/męski) . Godziny pracy oraz etat do uzgodnienia. Szczegóły pod numerem telefonu",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Opiekun/opiekun medyczny/pielęgniarka w Domu Opieki",
      "category": "olx",
      "phone": "516123678",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Praca w prywatnej placówce(24 podopiecznych) Dyżury 12 godzinne, 7-19,19-7.\nDla doswiadczonych opiekunek, pielęgniarek, opiekunów medycznych.\nWarunki współpracy do uzgodnienia.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Opiekunkę do Domu Opieki -Marki",
      "category": "olx",
      "phone": "509294306",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Dom Opieki w Markach zatrudni Opiekunkę. Praca zmianowa, możliwość pogodzenia dyżurów z inną pracą",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca dla stolarza",
      "category": "olx",
      "phone": "536784974",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukiwany stolarz do pracy przy produkcji mebli w Markach przy Warszawie . Z doświadczeniem. Zakres pracy obejmuje skręcanie  mebli oraz montaż. Stawka godzinowa od 20 do 30 zł.\nTel. 536784974",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik budowlany, montaż drzwi Marki, Ząbki, Radzymin",
      "category": "olx",
      "phone": "665039767",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukujemy pracownika do pomocy przy montażu stolarki drzwiowej w nowych budynkach. Praca głównie na terenie Marek, Ząbek, Radzymina. Mile widziane doświadczenie w pracy na budowie, oczekujemy solidności i zaangażowania w powierzane prace. Forma zatrudnienia umowa o prace lub zlecenie. \n\nPiotrek - 665039767",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię fryzjera/fryzjerkę",
      "category": "olx",
      "phone": "519399654",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Salon fryzjerski w Markach poszukuje fryzjerki \n \nWymagamy:\n\t•\tpraktycznych umiejętności fryzjerskich: koloryzacja i strzyżenia\n\t•\tkreatywności\n\t•\tpozytywnego nastawienia do pracy\n\t\n \nOferujemy:\n\t•\tatrakcyjne wynagrodzenie ( podstawa + prowizja )\n\t•\tmiłą atmosferę pracy\n\t•\tszkolenie w zakresie koloryzacji oraz strzyżeń\n\t•\tbazę Klientów i pomoc w początkowym okresie pracy\n   • umowę o prace",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnimy pracownika serwisu sprzątającego na parku logistycznym",
      "category": "olx",
      "phone": "509613925",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma Simplex Group zatrudni pracownika na stanowisko pracownik serwisowy w parku logistycznym.\n\nMiejsce wykonywania pracy: Warszawa - Marki. \n\nDo obowiązków pracownika będzie należeć:\n\nutrzymanie czystości na terenie parku logistycznego,\npraca związana z zagospodarowaniem terenów zieleni, w tym: koszenie, podlewanie trawników, pielęgnacja roślin oraz prace porządkowe obejmujące sprzątanie terenów zewnętrznych parku,\nodśnieżanie terenów zewnętrznych parku logistycznego w sezonie zimowym,\nopieka, konserwacja oraz odpowiedzialność za powierzone urządzenia.\n\nWymagamy:\n\nzaangażowania i dbałości o wizerunek firmy,\ndyspozycyjności,\nmile widziane doświadczenie w branży ogrodniczej.\n\nOferujemy:\n\natrakcyjne zarobki,\npracę w stabilnej firmie,\nmożliwość rozwoju osobistego,\ntelefon służbowy. \n\nProsimy o przesyłanie CV.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Brukarz oraz pomocnik",
      "category": "olx",
      "phone": "509722705",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma KTK Brukarstwo Ogrodnictwo poszukuje brukarza oraz pomocników. Kontakt tylko telefoniczny.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Butik internetowy z odzieżą damska w Markach",
      "category": "olx",
      "phone": "695739858",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukujemy osoby z Marek lub okolic do butiku z odzieżą damska - butik internetowy na Facebook , który znajduje sie w Markach.\n\nWymagania:\n\ndobra znajomość obsługi komputera w szczególności Exel\numiejętność pracy w zespole\ndokładność i dobra organizacja\n\nSzukamy osoby, która jest pewna siebie, komunikatywna, uśmiechnięta, odnajduje się w mediach społecznościowych lubi ciuchy i zna się na modzie - do pomocy przy prowadzeniu live sprzedażowego w naszym butiku internetowym na Facebooku . Do obowiązków będzie należało wprowadzanie do komputera sprzedaży oraz pomoc techniczna w livach sprzedażowych. \n\nGodziny pracy: dwa/ trzy razy w tygodniu  w godzinach popołudniowych od 13-20\n\n* Nauczymy Cię wszystkiego! Zanim rozpoczniesz pracę, weźmiesz udział w szkoleniach, dzięki którym poznasz nasze produkty, sposób funkcjonowania sklepu oraz oczywiście tajniki profesjonalnej obsługi klienta internetowego.\n\nChcemy Cie poznać prześlij do nas swoje CV.\n\nNa ofercie prosimy o zamieszczenie klauzuli wyrażającej zgodę na przetwarzanie danych osobowych do celów rekrutacji: \n\nWyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z Ustawą z dnia 29.08.1997 roku o Ochronie Danych Osobowych; tekst jednolity: Dz.U.z 2014r., poz.1182 ze zm.). ",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Kierowca - Dostawca posiłków z własnym samochodem",
      "category": "olx",
      "phone": "508183827",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Bar w Markach poszukuje kierowcy - dostawcy do rozwożenia posiłków.\n\n Praca 3-4 dni w tygodniu w godz. 11-22",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pomoc kuchenna, pracownik obsługi klienta",
      "category": "olx",
      "phone": "509957518",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Kebab Imbir w Markach zatrudni pomoc kuchenną oraz pracownika do obsługi klienta.\n\nOczekiwania:   Zaangażowanie, komunikatywność, pozytywne nastawienie do pracy, aktualna książeczka sanitarno-epidemiologiczna.\n\nPomoc kuchenna:  Produkcja surówek, sosów, zmywanie, utrzymanie porządku, przyjmowanie zamówień telefonicznych. Doświadczenie w gastronomii mile widziane.\n\nPracownik obsługi klienta:  Przyjmowanie zamówień, obsługa kasy fiskalnej, realizacja zamówień (robienie kebabów), utrzymanie porządku na stanowisku pracy. Doświadczenie na podobnym stanowisku mile widziane.\n\nOferujemy:  Wynagrodzenie na czas, elastyczny grafik, posiłek pracowniczy, premie za dobre wyniki w pracy. ",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca pizzeria pizzerman Kucharz Nieporęt gastronomia",
      "category": "olx",
      "phone": "791804769",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "zegrze #nieporet \n\nPoszukujemy osób do restauracji:\n\n- kucharze/grill/kuchnia\n- Pizzerman \n\nSzukamy osób do obsługi klimatycznego ogródka w Nieporęcie, mile widziane osoby z doświadczeniem. Ogródek posiada ok 1200m, obsługa tarasu, ogrodu, wynosy i dowozy.\n\nPraca również poza sezonem letnim.\n\nGodziny - etat, możliwe nadgodziny\n\nKucharz - od 20-22zl/1h \n\nPizzerman - od 30zl/1h \n\nZatrudnienie - umowa/działalność - do wyboru\n\nOsoby zainteresowane prosimy o przesłanie CV na adres:\nWasilewski.l ( małpa) mail com \n791804769\n\nDo zobaczenia\nZegrzeTeam.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Kierowca - Magazynier Marki",
      "category": "olx",
      "phone": "501792819",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma handlowa z branży łazienkowej zatrudni pracownika na stanowisko Kierowca-Magazynier. Magazyn w Markach ceramika, glazura, płytki, gres, wanny, kabiny prysznicowe.\n\nWymagania:\n\n- prawo jazdy kategorii B\n\n- znajomość obsługi komputera\n\n- znajomość Warszawy i okolic\n\n- mile widziane uprawnienia na obsługę wózków widłowych\n\n- dyspozycyjność,\n\n- kreatywność,\n\nCv ze zdjęciem prosimy przesyłać na maila",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Konserwator/ pracownik ogrodu",
      "category": "olx",
      "phone": "227713186",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukujęmy do pracy przy drobnych naprawach i konserwacji w Domu Opieki oraz zadbanie o ogród wokół budynku.\n\nPraca od poniedziałku do piątku między 8-17 \n\nOsoba zmotoryzowana ",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Mechanik samochodowy",
      "category": "olx",
      "phone": "505014828",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Serwis samochodowy Chwalibóg Motors Sp. z o.o. Sp. K. z siedzibą w Markach, poszukuje pracownika na stanowisko mechanik samochodowy.\n\nOpis stanowiska\n\nprzeglądy okresowe\nbieżące naprawy mechaniczne\nwymiana elementów zawieszenia pojazdów po kolizji\nobsługa sprzętu diagnostycznego\ndiagnostyka układów elektrycznych i elektronicznych w samochodach\nwypełnianie zleceń zgodnie ze standardami\n\nWymagania\n\nprawo jazdy kategorii B\nminimum 2 letnie doświadczeni w zawodzie\npunktualność, dobra organizacja stanowiska pracy\ndbanie o stanowisko pracy\n\nOferujemy\n\nstabilne warunki zatrudnienia – umowa o pracę\natrakcyjne wynagrodzenie\nrozwój zawodowy (szkolenia, certyfikacje)",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Помощники на штукатурку",
      "category": "olx",
      "phone": "794699036",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Требуется 2 помощника на штукатурку.\n\nОбъекты частные домики в Варшаве и пригород.\nЗарплата каждую неделю.\nЗнание польского языка не обязательно.\nГрафик работы 10-12 часов , 6 дней в неделю.\n\nУмение шпаклевать и уметь выставлять уголки на окна(откосы).\n\n+48 749699036 есть Viber .",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Magazynier - kompletacja zamówień Marki.",
      "category": "olx",
      "phone": "793779770",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Ogólnopolska firma dystrybucyjna TANO zatrudni osobę na stanowisko Magazyniera w systemie zmianowym. Miejsce pracy Marki.\n\nOczekiwania:\n\n- umiejętność pracy w zespole;\n\n- zaangażowanie i chęci do pracy;\n\n- doświadczenie w pracy na magazynie (mile widziane)\n\n- uprawnienia na wózki widłowe (mile widziane)\n\nZakres Obowiązków:\n\n- przygotowanie towaru do wysyłki zgodnie z zamówieniem;\n\n- wykonywanie powierzonych zadań na magazynie;\n\n- prace porządkowe obiektu;\n\n- uczestnictwo w inwentaryzacji oraz innych pracach magazynowych;\n\n- współpraca z innymi działami w celu zapewnienia najwyższej jakości świadczonych\n\nusług;\n\nOferujemy:\n\n- Atrakcyjne i stabilne wynagrodzenie oraz system premiowy;\n\n- Umowę o pracę;\n\n- Możliwość wykupienia ubezpieczenia grupowego;\n\n- Narzędzia niezbędne do pracy;\n\n- Bezpieczne środowisko pracy;\n\n- Możliwości rozwoju i awansu wewnątrz Grupy;\n\n- Pakiet medyczny\n\nZainteresowane osoby zapraszamy do przesłania CV na adres z ogłoszenia z dopiskiem stanowisko/miasto bądź osobiste dostarczenie do Oddziału Marki ul. Okólna 45.\n\nInformujemy, że skontaktujemy się wyłącznie z wybranymi kandydatami.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Nauczyciel w Przedszkolu",
      "category": "olx",
      "phone": "501389454",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Niepubliczne Przedszkole w Markach zatrudni osobę z wykształceniem kierunkowym na stanowisko Nauczyciela.\n\nOd kandydatów oczekujemy wykształcenia kierunkowego - pedagogika przedszkolna oraz zaangażowania i chęci do pracy.\n\nOferujemy stabilne zatrudnienie na umowę o pracę, możliwość awansu zawodowego i pracę w przyjaznej atmosferze. \n\nPraca w wymiarze 7 godzin.\n\nOsoby zainteresowane prosimy o przesłanie CV lub kontakt telefoniczny \n\npod numerem 501 389 454",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Opiekunka/pomoc do żłobka",
      "category": "olx",
      "phone": "515784216",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "W związku z rozwojem placówki Zatrudnię opiekunkę do żłobka w Markach.  Praca z młodym zespole. \nProszę o wysyłanie  CV na maila",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Sprzedawca",
      "category": "olx",
      "phone": "500226998",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukuję sprzedawcy do sklepu ogrodniczego w Markach , tylko z doświadczeniem .",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Nauczyciel/Wychowawca w Przedszkolu",
      "category": "olx",
      "phone": "507308731",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Nauczyciel/Wychowawca w Przedszkolu\n\n\tPrzedszkole o ugruntowanej pozycji i renomie, istniejące na rynku od 1999 roku, poszukuje osoby na stanowisko „Nauczyciel”\n\nwww.smerfymarki.pl\n\n \n\nDo obowiązków osoby zatrudnionej na tym stanowisku należeć będzie: \n\n·       Odpowiedzialność za bezpieczeństwo i zdrowie powierzonych pod opiekę dzieci \n\n·       Realizowanie procesu wychowawczo - dydaktycznego \n\n·       Realizowanie zadań opiekuńczo wychowawczych \n\n·       Przygotowywanie rocznych/miesięcznych/tygodniowych planów pracy\n\n·       Prowadzenie dokumentacji przedszkolnej w postaci min. dziennika \n\nCzego oczekujemy od osoby zatrudnionej na tym stanowisku?\n\n Doświadczenia w pracy w przedszkolu/żłobku/szkole podstawowej \n Sumienności i punktualności w wykonywaniu obowiązków służbowych,\n Cierpliwości, uprzejmości i życzliwości w stosunku do dzieci, współpracowników i klientów,\n Schludnego, nienagannego wyglądu,\n Profesjonalizmu i odpowiednich kwalifikacji \n Mile widziane osoby z doświadczeniem w pracy na stanowisku Nauczyciela przedszkola\n\nGwarantujemy:\n\n \n\n·       Stabilne zatrudnienie na podstawie umowy o pracę,\n\n·       Konkurencyjne wynagrodzenie dostosowane do posiadanych kwalifikacji i doświadczenia, wzrastające wraz ze stażem pracy \n\n·       Wsparcie doświadczonych Nauczycieli, psychologa przedszkolnego i logopedy,\n\n·       Dużą swobodę w pracy i przyjazną, spokojną atmosferę\n\n \n\nZainteresowane osoby zapraszamy do przesłania CV \n\n \n\nCV powinno zawierać odpowiednią klauzulę:\n\n \n\nWyrażam zgodę na przetwarzanie moich danych osobowych w procesie trwającej rekrutacji zgodnie z art. 6 ust. 1 lit. a Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (ogólne rozporządzenie o ochronie danych)\n",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Specjalista ds. administracji biurowej/ fakturzystka",
      "category": "olx",
      "phone": "601280774",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Specjalista ds. administracji biurowej/ fakturzystka\n\nFirma EMTE - ZOO zajmująca się sprzedażą hurtową akwakultury, zwierzątek domowych (w tym ptaków), gadów oraz płazów, posiadająca szeroką gamę pokarmów żywych, mrożonych i suszonych dla ryb, bezpośredni importer z całego świata - głownie kraje Azji południowej, Ameryki i Afryki - poszukuje osoby na stanowisko:\n\nSpecjalista ds. administracji biurowej\n\nZakres obowiązków:\n\nPrzyjmowanie zamówień oraz obsługa Klientów\nWystawianie faktur VAT, faktur korygujących, duplikatów faktur\nRozliczanie dostaw i wprowadzanie ich do systemu\nKontakt z dostawcami, producentami z całego świata oraz agencjami celnymi\nImport ryb słodkowodnych oraz morskich\nWsparcie biura w sprawach administracyjnych\n\n Wymagania:\n\nMile widziane doświadczenie w zarządzaniu zespołem\nPraktycznej wiedzy programu WF- mag \nDoświadczenia w pracy na samodzielnym stanowisku w dziale administracji/ sprzedaży lub specjalisty ds. importu\nDobrej znajomości języka angielskiego minimum B2\nBardzo dobrej znajomości programu Excel\nTerminowości i skrupulatności w realizacji zadań\nMile widziane zainteresowanie akwarystyką i zoologią\n\n Oferujemy:\n\nMożliwość awansu na stanowisko Managera\nZatrudnienie w oparciu na umowę o pracę lub B2B\nRabaty pracownicze\nStabilne warunki zatrudnienia\nPracę w zgranym zespole",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik Ochrony",
      "category": "olx",
      "phone": "601231328",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma P.H.U. EWERTRANS Ewa Wójcicka, zajmuje się dystrybucją materiałów budowlanych na terenie województwa mazowieckiego.\n\nPoszukujemy kandydata na stanowisko Pracownika Ochrony\n\nZadania powierzone na tym stanowisku:\n\nnadzorowanie wizualne i monitorowanie obiektu i terenu wokół,\npatrolowanie obiektu (regularne obchody),\ndbanie o ochronę mienia i osób w obiekcie.\n\nPoszukujemy osób:\n\nniekaranych,\ndyspozycyjnych,\nsumiennych i zaangażowanych w wykonywane obowiązki.\nw wieku 65+\n\nOferujemy:\n\npracę od zaraz.\npracę w Markach pod Warszawą\numowę o pracę .",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik magazynowy",
      "category": "olx",
      "phone": "509453346",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Opis\n\nFirma Sovpol  aktualnie poszukuje kandydatów na stanowisko Magazyniera.\n\nStanowisko: MAGAZYNIER\n\nMiejsce pracy: Marki pow. Wołomiński\n\nPraca polega na:\n\nPrzyjmowaniu towaru na magazyn\nPrzygotowanie towaru dla klienta\nPakowaniu towaru i przygotowaniu do wysyłki\n\nWynagrodzenie:\n\nod 3000 brutto\numowa o pracę na czas nie określony\n\nWymagania:\n\nMile widziane doświadczenie w pracy na magazynie\nSumienność\nDokładność oraz rzetelność\n\nProponujemy:\n\nPraca jedno  zmianowa, od poniedziałku do piątku w godzinach 7,30-15,30\nMiła atmosfera pracy w małym zespole\n\nWYŚLIJ SWOJE CV JUŻ DZIŚ!!\n\nps. Bardzo proszę w pierwszym kroku o wysłanie Cv.\n\n \n\n \n\nPozdrawiam\n\nMarcin Stankiewicz\n\n(22) 781-50-96 w.24\n\n509 -453-346\n\nMarki ul. Duża 1",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Fizjoterapeuta praca z dziecmi",
      "category": "olx",
      "phone": "502831599",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Fizjoterapeuta praca z dziecmi.\nGimnastyka korekcyjna - wady postawy. \n\nDo naszego gabinetu szukamy osób do prowadzenia gimnastyki korekcyjnej z dziećmi (student)\n2,3 dni w tygodniu. \n\nWymagania\n-umiejętność pracy w zespole\n-komunikatywność, \n-dobry kontakt z dziecmi, \n-mile widziane szkolenia, kursy. \n- status studenta\n\nZgłoszenia prosimy kierować przez olx z dopiskiem ,, Wyrażam zgodę na przetwarzanie moich danych osobowych przez Firmę LARDO Rehabilitacja, ul. Stokrotki 2 05-270 Marki w celu rekrutacji\"",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię pracownika na produkcję rolet i plis",
      "category": "olx",
      "phone": "602469232",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię osobę na produkcję moskitier. Mile widziane doświadczenie w branży. Praca od poniedziałku do piątku w godzinach 8.00 - 16.00",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Stylistyka paznokci",
      "category": "olx",
      "phone": "533803434",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnimy  kosmetyczkę/ manikurzystkę do pracy w Markach , szczegółowe informacje pod nr. tel 533 803 434",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Doradca klienta w sklepie motocyklowym > Atrakcyjne zarobki!",
      "category": "olx",
      "phone": "515138950",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "W związku z dynamicznym rozwojem poszukujemy osoby na stanowisko Doradcy klienta/ Sprzedawcy w sklepie z odzieżą i akcesoriami motocyklowymi.\n\n \n\nMiejsce pracy: Motovit, Al. Piłsudskiego 2A, 05-270 Marki (przy centrum handlowym M1)\n\n \n\nJeżeli:\n\n- interesuje cię tematyka motocyklowa,\n\n- masz miłą aparycję oraz umiejętności sprzedażowe\n\n- angażujesz się w wykonywaną pracę\n\n- obsługujesz komputer w stopniu dobrym\n\n- posiadasz wykształcenie min. średnie\n\njesteś idealnym kandydatem!\n\n \n\nCzym będziesz się u nas zajmować?\n\n- aktywna sprzedaż\n\n- obsługa klientów w sklepie stacjonarnym/internetowym\n\n- obsługa zamówień internetowych\n\n- wystawianie dokumentów sprzedaży\n\n- dbanie o ekspozycję i pozytywny wizerunek sklepu\n\n- udział w działaniach marketingowych\n\n \n\nW zamian oferujemy:\n\n- zatrudnienie na pełny etat\n\n- atrakcyjne zarobki\n\n- szkolenia produktowe i sprzedażowe\n\n- rabaty pracownicze\n\n- dobra atmosferę pracy\n\n \n\nProsimy o wysłanie CV wraz z dopisaną następującą klauzulą: \"Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z ustawą z dnia 10 maja 2018 roku o ochronie danych osobowych (Dz. Ustaw z 2018, poz. 1000) oraz zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO).\"",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Generalny wykonawca zatrudni pracowników na terenie całego kraju",
      "category": "olx",
      "phone": "694826241",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma JPP GENERAL Sp. Z o.o.\n\nGeneralny wykonawca zatrudni pracowników na terenie całego kraju do działu ogólnobudowlanego. Praca na inwestycjach na terenie całego kraju.\n\nWymagania: \n\nDoświadczenie w pracach budowlanych, wykończeniowych\nDyspozycyjność,\nPrawa jazdy kat. B (warunek konieczny)\nDuża samodzielność i dobra organizacja pracy własnej;\nUprawnienia SEP mile widziane\nUmiejętnościami tzw. Złotej Rączki\n\nOferujemy: \n\nAtrakcyjne wynagrodzenie uzależnione od efektów pracy\nMożliwość rozwoju zawodowego;\nCiekawą, pełną wyzwań pracę\nUmowę o pracę\n\nkontaktując się z nami akceptują Państwo klauzulę przetwarzania danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO). ",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Mechanik samochodowy, Marki, pelen etat, atrakcyjne warunki",
      "category": "olx",
      "phone": "608268383",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Jesteśmy dynamicznie rozwijającym się przedsiębiorstwem z branży motoryzacyjnej. Aby sprostać wymaganiom klientów stworzyliśmy całą gamę usług o najwyższej jakości.\n\nŚwiadczymy pełen zakres usług i napraw związanych z obsługą samochodów osobowych i dostawczych.\n\nW związku z dynamicznym rozwojem naszej firmy poszukujemy kandydata na stanowisko Mechanik samochodowy. \n\nWymagania:\n\n- Minimum 3 lata doświadczenia w pracy na podobnym stanowisku;\n\n- Samodzielna diagnostyka usterek oraz naprawy samochodów;;\n\n- Prawo jazdy kategorii B;\n\n- Punktualność, sumienność, dyspozycyjność oraz samodyscyplina. \n\nOferujemy: \n\n- pracę w firmie o ugruntowanej pozycji na rynku \n\n - umowę o pracę \n\n - możliwość zdobycia doświadczenia i rozwoju zawodowego \n\n - pracę w przyjaznym i zaangażowanym zespole\n\n- niezbędne narzędzia pracy \n\n - długofalową współpracę\n\n - gwarantujemy atrakcyjne premie uzależnione od  wyników z pełnym świadczeniem ZUS \n\nOsoby zainteresowane prosimy o kontakt telefoniczny: 608 268 383, 604 244 578\n\nlub przyjazd do siedziby firmy: Marki, Pilsudskiego 22\n\nProsimy nie wysyłać CV mailem, takie wiadomości nie będą rozpatrywane!!!",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik Budowlany do wykonczeniowki",
      "category": "olx",
      "phone": "730060418",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Przyjmę do firmy pracownika budowlanego z Ukrainy malowanie,szpachla,układanie płytek, praca teren całej Polski w brygadzie ukraińskiej nocleg zapewniony, transport zapewniony, język polski nie wymagany, wynagrodzenie 16-20 zł h",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Elektryk, Brygada Elektryków, Podwykonawcy",
      "category": "olx",
      "phone": "506802338",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Praca w terenie ( Warszawa i okolice )\nWykonujemy wszystkie instalacje od przyłącza do niskich prądów.\nlokale mieszkalne, usługowe, przemysłowe. Nowe inwestycje i remonty.\nWięcej informacji udzielam telefonicznie\nMile widziani podwykonawcy",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Stolarz meblowy bez doświadczenia",
      "category": "olx",
      "phone": "578112934",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Produkcja mebli tapicerowanych w Markach szuka pomocnika stolarza meblowego z prawami jazdy kat.B\nMoże być bez doświadczenia. Również może być cudzoziemiec. \nMiejsce pracy Marki koło Warszawy\nWynagrodzenie od 3000 zł \nZainteresowane osoby prosimy o kontakt telefoniczny 578 112 934 Alex",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Fizjoterapeuta z dojazdem do domu poszukiwany",
      "category": "olx",
      "phone": "796521179",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukuję fizjoterapeuty, który będzie przyjeżdżał do mnie 2 razy w tygodniu (na 1 godzinę) w ramach NFZ na czas nieokreślony. Umowa podpisywana z ośrodkiem wentylacji domowej. Forma zatrudnienia: umowa zlecenie lub B2B. Stawka 120 zł brutto za godzinę (nienegocjowalna).\n\nKilka słów o mnie:\nMam 27 lat. Od urodzenia choruję na SMA typ 2. Ważę 30 kg przy wzroście ok 160 cm. Poruszam się na wózku inwalidzkim. Jestem w pełni aktywny społecznie i zawodowo. Na co dzień pracuję w ochronie zdrowia.\n\nWymagania:\n- prawo wykonywania zawodu (bycie zarejestrowanym w KIF)\n- chęć rozwoju w obszarze zawodowym\n- dyspozycyjność czasowa (jak wyżej)\n- zaangażowanie i pozytywne nastawienie do ludzi\n\nPo rozpoczęciu współpracy możliwe przeszkolenie u specjalistów tj. dr Agnieszka Stępień (opłata kształcenia po mojej stronie).\n\nW razie pytań pozostaję do dyspozycji.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię fryzjera w Markach",
      "category": "olx",
      "phone": "669573794",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię fryzjera z doświadczeniem, samodzielnego od zaraz .Umowa ,duży procent 669573794",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Krawcowa do szycia maskotek",
      "category": "olx",
      "phone": "518375427",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukujemy krawcowej do szycia maskotek.Praca na stałe.\n\nWymagania:doświadczenie,dokładność,precyzyjność.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię hydraulika lub pomocnika hydraulika",
      "category": "olx",
      "phone": "602225356",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię energiczną oraz doświadczoną osobę na stanowisko hydraulik lub pomocnik hydraulika \n\nOferuję:\n\n-stałe i pewne zatrudnienie\n\n-możliwość poszerzania i pogłębiania wiedzy w zakresie\n\nwykonywanego zawodu\n\n-przyjazną atmosferę\n\n-wynagrodzenie zależne od poziomu wiedzy i zaangażowania \n\n \n\nOczekuję:\n\n-zaangażowania w pracy\n\n-pełnej gotowości zarówno do pracy jak i do nauki\n\n-punktualności\n\n-sumienności w wykonywanych pracach\n\n-dyspozycyjności\n\n-doświadczenia w branży hydraulicznej \n\n-brak nałogu alkoholowego \n\n -prawo jazdy kat.B\n\npo więcej informacji zapraszam do TYLKO I WYŁĄCZNIE kontaktu telefonicznego: 602-225-356 !! \n\nSiedziba firmy znajduje się w Markach koło Warszawy.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Główna Księgowa /Główny Księgowy",
      "category": "olx",
      "phone": "505862659",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma Dopeltech Sp. z o. o. oraz powiązana z nią STS ELEKTRO Sp. z o. o. poszukują kandydatów na stanowisko Główna Księgowa /Główny Księgowy z funkcją kadrowej /kadrowego\n\nZakres obowiązków:\n\nprowadzenie ksiąg rachunkowych oraz nadzór merytoryczny i organizacyjny nad dokumentacją księgową i finansową\nsporządzanie sprawozdań finansowych\nkontrola rozrachunków\nwspółpraca z organami administracyjnymi\nsporządzanie deklaracji JPK, VAT, CIT, PIT\nprowadzenie teczek osobowych (łącznie w obu społkach 10 osoób)\nnaliczanie i sporządzanie list płac\nsporządzanie deklaracji do ZUS\nobsługa PPK\n\nWymagania:\n\nwykształcenie kierunkowe\nminimum 3 letnie doświadczenie na podobnym stanowisku\nznajomość przepisów podatkowych\numiejętności organizacyjne\numysł analityczny\nznakomita znajomość Ms Excel\nznajomość Płatnika\ndodatkowy atut - znajomość oprogramowania INSERT GT oraz RAKS SQL\n\nOferujemy:\n\nprzyjazną atmosferę\nstabilne zatrudnienie w oparciu o umowę o pracę\n\nMiejsce pracy: Marki",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pizzerman Da Grasso w Markach",
      "category": "olx",
      "phone": "505204100",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Pizzermen do Pizzerii Da Grasso w Markach\n\nMoże być tez jako dodatkowa kilka dni w miesiącu.\n\nOferujemy:\n\n- Stabilne zarobki + premie\n- Zgrany zespół\n- Posiłki pracownicze\n- Ubrania pracownicze\n\nWymagamy:\n\n- Sumienności i pracowitości\n\nZainteresowanych na to lub inne stanowisko pracy prosimy o przesyłanie CV lub kontakt telefoniczny 505204100 lub wiadomość tekstowa na OLX lub Facebook Da Grasso Marki\nWynagrodzenie jest uzależnione od posiadanego doświadczenia.\nMożemy także nauczyć osoby bez doświadczenia.\n\n***Szukamy również chętnych do roznoszenia ulotek na terenie Marek i okolic***",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pomoc nauczyciela",
      "category": "olx",
      "phone": "698980281",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię pomoc/asystenta nauczyciela do pracy w przedszkolu. \n\nWymagania:\n- życzliwość \n- uśmiech i miłe usposobienie \n- chęć pracy z dziećmi \n- miłe widziane doświadczenie \n- mile widziane wykształcenie kierunkowe\n\nPraca na pełen etat w godz 9-17:00 lub 10-18:00, umowa o prace. \n\nProszę o wyslanie CV.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pani do sprzatania",
      "category": "olx",
      "phone": "602761556",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię Panią do sprzątania w przedszkolu w Markach, na ul. Rydza Śmigłego 71.\n\nPraca w godz 10-18:00, umowa o prace. \n\nW przedszkolu są dwa etaty dla Pan sprzątających, które dzielą się obowiązkami. \n\nWięcej info pod nr tel. 602 76 15 56.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnimy osobę do kompletowania i pakowania zamówień internetowych",
      "category": "olx",
      "phone": "669007099",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnimy dwie osoby do pracy w sklepie internetowym. \n\nPraca sezonowa od marca do października. \n\nWynagrodzenie 2100 zł netto. / Umowa zlecenie. \n\nPraca od poniedziałku do piątku w godz. 8 - 17 . \n\nZakres obowiązków:\n\n- Obsługa zamówień w systemie sprzedażowym\n\n- Kompletowanie produktów zgodnie z zamówieniem\n\n- Pakowanie towaru\n\n- Rozładunek i przyjmowanie dostaw - kontrola jakości i ilości przyjmowanego towaru\n\n- Wydawanie przesyłek kurierowi\n\n- Utrzymywanie porządku w magazynie\n\nWymagania:\n\n- Umiejętność pracy pod presją czasu\n\n- Energia i chęci do pracy\n\n- Umiejętność obsługi komputera\n\nDodatkowe atuty:\n\nDoświadczenie na podobnym stanowisku\nstatus ucznia / studenta\n\nWięcej informacji pod numerem telefonu 669-007-099",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik produkcji/Piekarz wyrobów cukierniczych",
      "category": "olx",
      "phone": "609077021",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "PIEKARZ:\n\n- przygotowanie narzędzi do wypieku (wałki)\n\n- odpowiednie odważanie surowców do wypieku\n\n- dostarczanie masy do wypieku\n\n- mieszanie masy\n\n- wypiekanie ciasta w piecu\n\n- wyciąganie wypieczonego ciasta z pieca\n\n- ściąganie wypieczonego ciasta z wałków\n\n- ocena jakościowa wypieczonego ciasta\n\n- odważanie wypieczonego ciasta\n\n- ustawianie wypieczonego ciasta na regałach\n\n- oznaczanie partii wypieczonego ciasta\n\nOferujemy:\n\n- stabilne zatrudnienie w oparciu o umowę\n\n- atrakcyjne wynagrodzenie\n\n- terminowe wypłaty\n\n- wdrożenie w zakres obowiązków\n\n \n\nWymagania:\n\n- chęć do pracy\n\n- motywacja i zaangażowanie\n\n- dyspozycyjność\n\n- badania lekarskie dopuszczające do pracy w przemyśle spożywczym\n\n- chęć pracy na stałe (długookresowe związanie się z firmą)\n\n﻿Miejsce pracy:\n\nMarki (k. Warszawy)",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Fryzjer / fryzjerka",
      "category": "olx",
      "phone": "530165584",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Salon fryzjerski w Markach pilne poszukuje pracownika na stanowisko fryzjer damsko- męski.\nWięcej informacji pod numerem telefonu  530165584",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Operator niewielkiej linii rozlewniczej 3300 PLN netto",
      "category": "olx",
      "phone": "785081973",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukujemy dyspozycyjnego i elastycznego operatora ze znajomością zagadnień mechaniki i automatyki. Praca pon - pt godz 7:00/8:00 - 15:00/16:00/17:00 (w zależności od dnia). Linia rozlewnicza do napojów o stosunkowo prostym działaniu:\n\n• Rozlewa\n\n• Zakręca\n\n• Etykietuje\n\nDo obowiązków należeć będzie:\n\n• Obsługa linii\n\n• Rozwiązywanie bieżących problemów (samodzielnie oraz przy wsparciu producenta linii)\n\n• W razie potrzeby wsparcie innych pracowników\n\n• Umiejętność pracy w zespole, sumienność, samodzielność\n\n• Pozytywne podejście do nowych zadań i chęć rozwoju\n\n• Umiejętność planowania i organizacji pracy Oferujemy:\n\n• Przeszkolenie przez aktualnego operatora\n\n• Pracę na pełen etat\n\n• Rozwój w firmie o bardzo dużym potencjale\n\n• Zatrudnienie na podstawie umowy\n\n• Pracę w miłej atmosferze \n\nDlaczego My? - nie jesteśmy korporacją, będziesz się liczył Ty i Twoja praca! \n\nAplikacje ze zdjęciem prosimy przesyłać przez system OLX.\n\nLokalizacja Marki obok centrum M1\n\nStawka 3300 netto.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "SPRZEDAWCA do sklepu ANDAR (pieczywo, słodkości, nabiał)",
      "category": "olx",
      "phone": "505055521",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Do małego sklepu spożywczego zajmującego się głównie sprzedażą pieczywa i słodkości (produkty z Galeria Wypieków Piotr Lubaszka) poszukujemy sprzedawcy na cały etat.\n\nMiejsce pracy:\n\nMarki (Osiedle Kwitnące)\n\nObowiązki:\n\n - obsługa klienta,\n\n - obsługa kasy fiskalnej,\n\n - przyjmowanie dostaw,\n\n - wykładanie i układanie towaru,\n\n - dbanie o estetyczny wygląd i ekspozycję asortymentu sklepowego,\n\n - dbanie o czystość i porządek sklepu\n\nOczekujemy:\n\n - uprzejmości i kultury osobistej,\n\n - dyspozycyjności,\n\n - książeczki sanepidowskiej\n\n - mile widziane doświadczenie w pracy z klientami (nie jest ono konieczne)\n\n - dyspozycyjności w soboty ( 2 w miesiącu)\n\nOferujemy:\n\n - stałe zatrudnienie na umowę o pracę\n\n - profesjonalne wdrożenie do pracy\n\n - realny wpływ na układanie grafików",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca pomoc drogowa",
      "category": "olx",
      "phone": "516964667",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Witam poszukuję pracownika na stanowisko - kierowca pomocy drogowej. Wymagane doświadczenie na tym stanowisku, dyspozycyjność, sumienność. O więcej informacji proszę pisaś przez portal olx.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię manikiurzystkę",
      "category": "olx",
      "phone": "506165282",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Atelier Liwska Emilia zatrudni stylistkę paznokci z doświadczeniem.\n\nOferujemy:\n\n-stabilne zatrudnienie\n\n-umowę o pracę \n\n-pracę w systemie zmianowym\n\n-pracę na renomowanych markach\n\n-pracę w milej atmosferze\n\nWymagamy:\n\n-umiejętność wykonywania manicure klasycznego oraz hybrydowego \n\n-umiejętność wykonywania pedicure klasycznego oraz hybrydowego \n\n-umiejętność wykonywania stylizacji żelowej \n\n-punktualności\n\n-pasji do wykonywanego zawodu\n\n-dużego poczucia estetyki\n\n-komunikatywności\n\nCV proszę wysyłać przez OLX lub na adres e-mail.\n\n* Zastrzegamy sobie prawo do kontaktu z wybranymi kandydatami. \n\n*Prosimy o załączenie klauzuli: „Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z Ustawą z dnia 29.08.1997 roku o Ochronie Danych Osobowych; tekst jednolity: Dz. U. z 2002r. Nr 101, poz. 926 ze zm. i RODO.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię kierowcę kat C+E",
      "category": "olx",
      "phone": "697975967",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Witam,\n\nZatrudnię kierowcę kat C+E.(praca na samochodzie ciężarowym + naczepa). Praca na terenie Warszawy i okolic. Wymagane doświadczenie min 2lata. Więcej informacji pod numerem 697975967",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Szukamy pomocnika kierowcy śmieciarki, placowy",
      "category": "olx",
      "phone": "731008728",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Praca polega na pomocy w załadunku, na samochód, odpadów zgromadzonych w pojemnikach i workach. Praca w dniach poniedziałek - piątek, dla chętnych możliwość pracy w sobotę. Stawka początkowa 15 zł/godzinę netto, po okresie próbnym 17 zł/godzinę netto. Praca w okolicach Marek, Tłuszcza.\n\nW przypadku mniejszej ilości prac w terenie zapewniamy pracę na placu.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Osoba techniczna/porządkowa podczas Wesela",
      "category": "olx",
      "phone": "510504333",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukujemy pracowników w charakterze osoby technicznej podczas nocnych przyjęć w naszym obiekcie. \n\nDo zadań takiej osoby należało będzie: \n\nbycie \"złotą rączką\" podczas wydarzenia \nreagowanie w przypadku usterek \ndrobna praca fizyczna na ternie \nutrzymywanie porządku na terenie podczas wydarzenia\nodpowiednie zachowanie względem klientów\n\nWymagane jest ogólne ogarnięcie w sprawach technicznych, odporność na zmęczenie i miła aparycja. \n\nJest to praca nocna, od początku wydarzenia (np. wesela) do końca. Zazwyczaj 18-06 Praca odbywa się wyłącznie w Markach, ul. Cicha 23 w wybrane dni, głównie weekendy, przez cały sezon letni. ",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Krawcowa Poszukiwana!",
      "category": "olx",
      "phone": "667637277",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Prężna firma  zatrudni szwaczki z doświadczeniem (overlock, stębnówka) do szycia odzieży damskiej.Firma znajduje się w Markach więcej info pod nr. tel. : 667637277 Oferujemy :wysokie zarobki, dobre warunki pracy,praca w miłym zespole. Praca całoroczna. Możliwość pracy chałupniczej w okolicach Ząbki, Zielonka, Marki, Kobyłka, Wołomin. Praca w systemie akordowym.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Kierowca C+E Międzynarodówka",
      "category": "olx",
      "phone": "505856576",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Marki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Kierowca miedzynarodowy C+E moze byc od zaraz Warszawa wyjazdy ok 10-20 dni najwiecej Niemcy i kraje oscienne chetnie na działalności lecz też i umowa o pracę może być. Wypłaty terminowe, auta nie są przeladowywane, Czas pracy kierowcy przestrzegany w 100 %. Normalna mała firma która utrzymuje we wzorowej kondycji auta. \n\nProszę o kontakt. 505 856 576 lub 601 222 456",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik do wykańczania mieszkań",
      "category": "olx",
      "phone": "667507019",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukuje pracownika do wykańczania mieszkań. Praca w zespole 2-3 osobowym. Dobra znajomość nakładania gładzi szpachlowej , układania płytek w łazienkach i kuchni , malowanie , panele podłogowe. Praca na terenie Warszawy na ul. Namysłowska 6a. Możliwy dojazd z Ząbek. Nie poszukuje praktykantów ani pomocników . Pierwszy tydzień próbny , póżniej pełna stawka. kontakt Tomek 667507019",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik Placowy do prowadzenia ciągnika",
      "category": "olx",
      "phone": "500026148",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Opis oferty pracy:\n\nOd kandydatów oczekujemy:\n\n- Chęci i zaangażowania w powierzone czynności\n\n- Niekaralności\n\n- Zaangażowania\n\n- Prawo jazdy kategorii B+E albo T lub doświadczenie\n\nw pracy z ciągnikiem rolnym\n\nZakres obowiązków:\n\n- Sprzątanie terenu Praskiej Giełdy Spożywczej\n\n- Opróżnianie koszy z makulatury i foli z terenu Giełdy\n\nOferujemy:\n\n- Pracę jednozmianową\n\n- Umowę o pracę\n\n- Możliwość dopasowania grafiku\n\n- Stabilne zatrudnienie\n\n- Pensję zawsze na czas\n\n- Premię miesięczną",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię manikiurzystkę od zaraz",
      "category": "olx",
      "phone": "500250201",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Witam, zatrudnię manikiurzystkę od zaraz praca zmianowa 8-13 i 16-21 i 2 soboty w miesiącu 9-15 proponuję dobre warunki współpracy. Salon mieści się w okolicach Makro. Zapraszam do kontaktu zainteresowane osoby.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Kierowca C+E Chłodnia Transport Krajowy",
      "category": "olx",
      "phone": "577377217",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię kierowcę C+E na Chłodnie w Transporcie Krajowym \n\nZapewniam:\n\nzestaw przypisany do kierowcy\nstała współpracę \nświęta wolne\n\nOczekuję : \n\ndoświadczenia na chłodni\ndyspozycyjności\ndbanie o powierzony sprzęt\n\nWięcej informacji udzielę telefonicznie",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię do obsługi solarium",
      "category": "olx",
      "phone": "515977128",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię do obsługi solarium w Ząbkach wiadomość pod numerem telefonu 515-977-128",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Kasjer/sprzedawca",
      "category": "olx",
      "phone": "666826262",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "InterKadra to agencja pracy tymczasowej i doradztwa personalnego z 14-letnim doświadczeniem na rynku. Jesteśmy firmą godną zaufania! Oferujemy pracę dostosowaną do Twoich kwalifikacji i potrzeb.\nNr 3372 w Krajowym Rejestrze Agencji Zatrudnienia.\n\nKasjer/sprzedawca\n\nDo Twoich obowiązków będzie należało:\n\n• obsługa kasy fiskalnej oraz terminala płatniczego,\n• sprzedaż produktów,\n• wykładanie towaru oraz kontrola daty ważności artykułów,\n• dbałość o czystość sali sprzedaży i pomieszczeń socjalnych.\n\nOczekujemy:\n\n• aktualnego orzeczenia do celów sanitarno-epidemiologicznych,\n• ukończenia 18 roku życia,\n• chęci do pracy,\n• doświadczenie na podobnym stanowisku - mile widziane.\n\nMamy do zaoferowania:\n• pracę w oparciu o umowę zlecenia,\n• pracę w systemie II zmianowym,\n• możliwość rozpoczęcia zatrudnienia od zaraz.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Kierownik robót, majster - montaż stolarki budowlanej",
      "category": "olx",
      "phone": "737177717",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Szanowni Państwo, firma zajmująca się kompleksową obsługą obiektów budowlanych w zakresie dostawy i montażu stolarki otworowej zaprasza do podjęcia pracy na stanowisku:\n\nkierownik prac montażowych / majster\n\nOd osób na wymienionych stanowiskach oczekujemy:\n\n-wysokiej kultury osobistej\n\n-prawo jazdy kat B \n\n-znajomości branży stolarki budowlanej\n\n-doświadczenia i wiedzy w zakresie montażu stolarki budowlanej (okna, drzwi, fasady)\n\nOferujemy:\n\npracę w firmie ze stabilną pozycją na rynku\n\natrakcyjne i terminowe wynagrodzenie\n\nmożliwość doskonalenia swoich umiejętności poprzez pakiety szkoleń\n\nniezbędny sprzęt ułatwiający wykonywanie pracy\n\nOsoby zainteresowane zapraszam do kontaktu telefonicznego w godz. 8-18 od poniedziałku do piątku.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię tapicera",
      "category": "olx",
      "phone": "501948363",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Producent łóżek zatrudni tapicera do produkcji mebli z doświadczeniem (warunek konieczny).\n\nZadania:\n\n- Obsługa podstawowych maszyn stolarskich\n\n- Stosowanie i obsługa elektronarzędzi\n\n- Montaż mebli\n\nWymagania:\n\n- Rzetelność przy wykonywaniu powierzonych zadań\n\n- Motywacja oraz chęć do pracy\n\nPraca w Markach k/Warszawy. Możliwość zakwaterowania\n\nWarunki pracy i zgłoszenia tylko telefonicznie",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Stolarz/ pomocnik stolarza",
      "category": "olx",
      "phone": "502088081",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Frise sp. z o.o. działająca w branży mebli na zamówienie zatrudni stolarza lub prcownika stolarni z doświadczeniem.\n\nWymagania\n\numiejętność obsługi maszyn stolarskich\nznajomość rysunku technicznego\n\nZąbki, Piłsudskiego 93a",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Księgowo Kadrowa z doświadczeniem",
      "category": "olx",
      "phone": "533150990",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zadania:\n\n·       Kompleksowa obsługa kadr i\n\npłac 3 Spółek\n\n·       Przygotowanie list płac\n\noraz zestawień\n\n·       Terminowe sporządzanie\n\ndeklaracji ZUS, PIT, PFRON\n\n·       Księgowanie i dekretowanie\n\ndokumentów\n\n·       Sporządzanie sprawozdań do\n\nGUS\n\nWymagania:\n\n·       wykształcenie średnie\n\nkierunkowe lub wyższe kierunkowe (rachunkowość, ekonomia, finanse, etc.)\n\n·       min. 3 letnie\n\ndoświadczenie na samodzielnym stanowisku\n\n·       bardzo dobra znajomość\n\nprogramów MS Office, Optima, Płatnik, Symfonia\n\n·       znajomość zasad\n\nprowadzenia dokumentacji kadrowej\n\n·       praktycznej znajomości\n\nubezpieczeń społecznych i prawa pracy\n\n·       dobrej znajomości zasad\n\nksięgowania, przepisów podatkowych (Vat, Pit, Cit) oraz ustawy o rachunkowości\n\n·      skrupulatność, dokładność, terminowość\n\nOferujemy:\n\n·       umowa o pracę \n\n·       bardzo dobre warunki\n\nfinansowe\n\n·       miła atmosfera pracy\n\nJeśli nasza\n\noferta wzbudziła Twoje zainteresowanie prosimy o przesłanie CV na adres\n\nmailowy.\n\nPamiętaj o\n\nzałączeniu do swojej aplikacji następującej klauzuli: \" Wyrażam zgodę na\n\nprzetwarzanie moich danych osobowych zawartych w ofercie pracy, dla potrzeb\n\nniezbędnych do realizacji procesu rekrutacji zgodnie z art.6 ust.1 lit. a\n\nOgólnego rozporządzenia o ochronie danych osobowych z dnia 27 kwietnia 2016r\n\noraz uchylenia dyrektywy 95/46/WE\". \n\nUprzejmie\n\ninformujemy, iż kontaktujemy się z wybranymi osobami.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "kierowca kategorii C",
      "category": "olx",
      "phone": "515258951",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Kierowca kat. C\n\nObowiązki na stanowisku:\n\n- dystrybucja artykułów spożywczych zgodnie z wyznaczonymi trasami,\n\n- obsługa sklepów spożywczych w tym rozładunek elektrycznym wózkiem paletowym (całopaletowy)odbieranie zwrotów od klienta są to puste palety na wymianę ewentualnie puste transportery po piwie. \n\n- bieżąca obsługa pojazdu\n\nWymagania:\n\n- prawo jazdy kat. C\n\n- kurs kwalifikacji wstępnej,\n\n- mile widziane doświadczenie w transporcie artykułów spożywczych,\n\n- dyspozycyjność, odpowiedzialność, samodzielność\n\nOferujemy:\n\n- pracę w dużej i stabilnej firmie o ugruntowanej pozycji na rynku,\n\n- zatrudnienie w ramach umowy o pracę w systemie jednozmianowym (wyjazdy od 4:00, powroty 11:00 - 16:00, \n\n- atrakcyjne wynagrodzenie zawszę wypłacane na czas, na pierwszy miesiąc 4000 netto\n\n-pomoc w załadunku, kierowca ma naszykowane palety w danej strefie, nie trzeba biegać po całym magazynie.\n\nRozważymy również kierowcę bez doświadczenia. oraz z kategoria B\n\nbaza mieści się na Żeraniu w Warszawie.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Kaufland Ząbki - Lider Zespołu",
      "category": "olx",
      "phone": "713770919",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Lider Zespołu \n\nw Dziale Art. Świeżych \n\nmarket w Ząbkach, ul. Powstańców 7 \n\n \n\nJesteśmy międzynarodową firmą handlową, która stawia na efektywność, dynamikę i fair play. Nasz sukces w Polsce tworzy kilkanaście tysięcy zaangażowanych pracowników. Dołącz do nas! Zadbamy o Twoją przyszłość, oferując Ci rozwój zawodowy i możliwość wykorzystania Twoich mocnych stron.\n\n﻿Jakie będą Twoje zadania:\n\nodpowiedzialność za właściwe przygotowanie działu do sprzedaży\nzagwarantowanie przyjaznej i profesjonalnej obsługi klienta\nwłaściwa realizacja powierzonych zadań i projektów\nprzeprowadzanie okresowych inwentaryzacji i dbanie o ich prawidłowy wynik\nzagwarantowanie prawidłowego i zgodnego z procedurami przebiegu składania i realizacji zamówień oraz przepływu towaru.\n\nCzego oczekujemy od Ciebie:\n\nminimum rocznego doświadczenia w handlu detalicznym (preferowane sieci super- i hipermarketów)\numiejętności koordynowania pracy zespołu oraz znajomości zasad prawidłowej komunikacji z klientami i współpracownikami\ndeterminacji w działaniu oraz konsekwentnego dążenia do osiągnięcia celów\nsumienności i zaangażowania w wykonywaniu obowiązków\numiejętności obsługi komputera.\n\nCo Ci zapewnimy:\n\nCzekają na Ciebie ciekawe i odpowiedzialne zadania w dynamicznym zespole, gdzie panuje atmosfera wzajemnego szacunku. Obok różnorodnych możliwości rozwoju zapewnimy Ci atrakcyjne wynagrodzenie, bogaty pakiet benefitów (m.in. prywatną opiekę medyczną, kartę MultiSport, ubezpieczenie na życie na preferencyjnych warunkach, bony i upominki na święta) oraz umowę o pracę w wymiarze pełnego etatu.\n\n \n\nBuduj razem z nami przyszłość pełną sukcesów!\n\nAplikuj już dziś na www.kaufland.pl/kariera",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Kaufland Ząbki - Młodszy Sprzedawca/Kasjer",
      "category": "olx",
      "phone": "227430142",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Młodszy Sprzedawca/Kasjer \n\nw Dziale Art. Spożywczych i Świeżych \n\nmarekt w Ząbkach, ul. Powstańców 7 \n\n \n\nJesteśmy międzynarodową firmą handlową, która stawia na efektywność, dynamikę i fair play. Nasz sukces w Polsce tworzy kilkanaście tysięcy zaangażowanych pracowników. Dołącz do nas! Zadbamy o Twoją przyszłość, oferując Ci rozwój zawodowy i możliwość wykorzystania Twoich mocnych stron.\n\n﻿Jakie będą Twoje zadania:\n\nwykładanie towaru oraz dbanie o jego odpowiednią ekspozycję\nprzygotowywanie i umieszczanie prawidłowych oznaczeń cenowych\ndbanie o uprzejmą, staranną i sprawną obsługę klienta\ndbanie o świeżość i jakość naszych produktów, m.in. poprzez kontrolę terminów przydatności do sprzedaży\ndbanie o właściwą gospodarkę towarową w markecie.\n\nCzego oczekujemy od Ciebie:\n\nznajomości podstawowych zasad obsługi klienta\nenergicznej i przyjaznej osobowości\nsumienności i zaangażowania w wykonywaniu obowiązków\numiejętności pracy w grupie oraz znajomości zasad prawidłowej komunikacji z klientami i współpracownikami\ndoświadczenie na podobnym stanowisku będzie dodatkowym atutem.\n\nCo Ci zapewnimy:\n\nCzekają na Ciebie ciekawe i odpowiedzialne zadania w dynamicznym zespole, gdzie panuje atmosfera wzajemnego szacunku. Obok różnorodnych możliwości rozwoju zapewnimy Ci atrakcyjne wynagrodzenie, bogaty pakiet benefitów (m.in. prywatną opiekę medyczną, kartę MultiSport, ubezpieczenie na życie na preferencyjnych warunkach, bony i upominki na święta) oraz umowę o pracę w wymiarze 3/4 etatu.\n\n \n\nBuduj razem z nami przyszłość pełną sukcesów!\n\nAplikuj już dziś na www.kaufland.pl/kariera",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Cukiernia Słodki Przystanek zatrudni ekspedientkę na weekendy",
      "category": "olx",
      "phone": "508206834",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "OFERUJEMY:\n\n- umowę zlecenie\n\n- praca na weekendy\n\n- atrakcyjne wynagrodzenie\n\n- pracę w miłej atmosferze\n\n \n\nZAKRES OBOWIĄZKÓW:\n\n- Profesjonalna obsługa Klienta w naszej cukierni\n\n- Doradztwo w zakresie sprzedawanych produktów\n\n- Budowanie pozytywnych relacji z Klientem\n\n- dbanie o najwyższą jakość produktów\n\n- dbanie o wygląd cukierni oraz czystość\n\n \n\nWYMAGANIA:\n\n- książeczka sanepidu\n\n- Chęci do pracy,\n\n- Otwartości i komunikatywności \n\n- Zaangażowania w pracę\n\n- elastyczność, pomysłowość\n\n- pozytywne nastawienie\n\n- sumienność\n\n- uczciwość",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię kierowców z kat B i z kat C",
      "category": "olx",
      "phone": "604119887",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię kierowców z kat B i kierowców z kat C. Praca od poniedziałku do piątku weekendy wolne i codziennie kierowcy po pracy wracają do domu.\n\nFirma posiada trzy bazy z których kierowcy ruszają do pracy.\n\nJedna baza znajduje się w Ząbkach druga w Mościskach trzecia w Komorowie okolice Warszawy \n\nPraca od zaraz. Na początek szkolenie oraz przygotowanie do pracy na rejonie.\n\nSamochody solówki z windą, kontenery z windą, dostawcze blaszaki.\n\nSzukam osób na stałe.\n\nNa początek umowa zlecenie.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Nauczyciel wspomagający do przedszkola",
      "category": "olx",
      "phone": "227624241",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Przedszkole Niepubliczne w Ząbkach poszukuje nauczyciela wspomagajacego do grupy.Wymagane wykształcenie kierunkowe (wychowanie przedszkolne lub edukacja wczesnoszkolna) lub osoba w trakcie studió. Mile widziane doświadczenie w pracy z dziećmi.\n\nZainteresowane osoby prosimy o kontakt\n\nZapraszamy serdecznie!!!",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Rejestratorka medyczna",
      "category": "olx",
      "phone": "731131138",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Prężnie rozwijająca się praktyka stomatologiczna poszukuje osoby na stanowisko rejestratorki medycznej. Jeśli jesteś osobą, która:\n\nnie boi się wyzwań i jest odporna na stres\npotrafi zorganizować samodzielnie swoją pracę\nlubi pracę z ludźmi\njest uśmiechnięta\npreferujesz pracę dwuzmianową lub wolisz drugie zmiany (nocny marku, zapraszamy :))\nmasz doświadczenie na podobnym stanowisku\n\nTa oferta jest dla Ciebie!\n\nPraca w miłej atmosferze, z młodym i ambitnym zespołem- z nami nie sposób się nudzić :)\n\nKilka informacji o nas:\n\ngabinet mieści się w Ząbkach k/Warszawy\ngodziny pracy: 7-21 \n\nCV ze zdjęciem prosimy przesyłać za pomocą formularza olx lub na adres mailowy.\n\nSkontaktujemy się z wybranymi osobami.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Promotor firmy Sprawne-okna.pl",
      "category": "olx",
      "phone": "501840468",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma Sprawne Okna (www.sprawne-okna.pl) poszukuje w swoje szeregi: aktywnych Promotorów.\n\nDo Twoich zadań należeć będzie aktywne informowanie mieszkańców wybranych osiedli o działaniach naszej firmy.\n\nCo oferujemy?\n\n·      2 (dla chętnych 2,5-3) godziny pracy dziennie w wygodnej dla Ciebie lokalizacji! Dostosujemy teren do Twojego adresu zamieszkania tak abyś nie tracił czasu na dojazdy do pracy!\n\n·      Atrakcyjne warunki finansowe od 25zl do 50zł netto za 1h pracy! W ciągu 2h możesz zarobić 100zl netto!\n\n·      Umowę zlecenie/umowę o dzieło, a po okresie próbnym umowę o pracę.\n\n·      Wsparcie merytoryczne.\n\n·      Odpowiednie narzędzia do pracy.\n\n·      Możliwość rozwoju i awansu w strukturach firmy.\n\nWymagania to:\n\n·      Nienaganna aparycja. Empatia.\n\n·      Umiejętność poprawnego wysławiania się.\n\n·      Łatwości w nawiązywaniu kontaktów.\n\n·      Wolne 2h dziennie od poniedziałku do piątku od 18:00 do 20:00\n\n·      Zapraszamy do kontaktu osoby zainteresowane ofertą pracy.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik na grilla",
      "category": "olx",
      "phone": "609700649",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Praca od poniedziałku do piątku w godz. 15-21.00. Oraz w weekendy i święta w godz. 12-22.00.\nPraca ma elastyczny grafik. Szukamy osoby chętnej do pracy, nie musi mieć doświadczenia.\nPraca w Ząbkach",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Sprzedawca Piekarnia OSKROBA w Ząbkach",
      "category": "olx",
      "phone": "669550199",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukujemy pracownika do sklepu firmowego Piekarnia Oskroba w Ząbkach.\n\nCV można składać elektronicznie lub osobiście w naszym sklepie na ul. Targowej 2.\n\nPraca dwuzmianowa w fajnym zespole, wynagrodzenie zawsze na czas, umowa o pracę.\n\nSzkolenie z zakresu wypieku, rodzaju asortymentu i obsługi klienta.\n\nSzukamy osób otwartych, zaangażowanych i gotowych do współpracy.\n\nDo Twoich obowiązków będzie należało m. in.:\n\n-profesjonalna obsługa klientów sklepu\n\n-obsługa kasy fiskalnej i terminala\n\n-przyjmowanie i wykładanie towaru\n\n-wypiek pieczywa\n\n-dbałość o estetykę stanowiska pracy i sklepu.\n\nKsiążeczka sanepidu oraz uśmiech wymagane!\n\nJeśli szukasz pracy na stałe lub dodatkowej na wakacje wyślij CV ze zdjęciem, a my oddzwonimy w celu umówienia spotkania!",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca Pizzerman Ząbki",
      "category": "olx",
      "phone": "504995641",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Restauracja PECORINO to prawdziwa włoska restauracja.\n\nKorzystamy z oryginalnych, włoskich produktów. serwujemy owoce morza, świeże ryby, warzywa i mięsa oraz pyszną włoską pizzę.\n\nRestauracja otworzyła się 12.06.2021 i w związku z bardzo dużym zainteresowaniem gości szukamy fajnych ludzi do zespołu.\n\njesteśmy uczciwą firmą, która da Ci umowę i zapłaci na czas.\n\nPrac a w systemie zmianowym 2/2 po 12h. \n\nrestauracja otwarta jest codziennie.\n\nWymagania:\n\ndoświadczenie na stanowisku pizzera\nksiążeczka zdrowia do celów sanitarno-epidemiologicznych\nbardzo dobra organizacja pracy,\nsamodzielność,\npunktualność,\ndyspozycyjność,\nchęć do pracy w młodym, zgranym zespole",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię kierowców C+E , mile widziany ADR.",
      "category": "olx",
      "phone": "48576205880",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię kierowców C+E , mile widziany ADR. Jazda po Unii . Dobre warunki. Zaplecze socjalne. Rzetelna firma.\n\nTel.576205880 Alla .\n\nПриглашаем на работу водителей категории С+Е.\n\nНеобходим опыт работы от 1 года.\n\nНаличие удостоверения АДР приветсвуется.\n\nРаботаем на территории Германии, Франции, Италии, Австрии, Чехии, Венгрии, Дании, Испании, стран Бенелюкса, Швеции, Норвегии.\n\nАвтопарк составляет 25 составов. Прицепы - рефрежираторы и пландеки.\n\nАвтопарк: Scania, Mercedes, Volvo, Man, Renault - EURO6\n\nГотовим весь пакет документов. Также делаем карты побыта для наших сотрудников. \n\nПо всем вопросам звонить по телефону +48576205880",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca / kurier, kierowca",
      "category": "olx",
      "phone": "501192744",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Witam, szukam do pracy na stanowisko kurier, kierowca, jestem podwykonawcą w firmie kurierskiej UPS, siedziba i start pracy Warszawa Wola, do obsadzenia jest rejon okolice ulic: ciołka, obozowa, górczewska. Praca w zgranej grupie kurierów, wszystkie świadczenia, możliwość uzyskania dodatkowych bonusów, normalne godziny pracy. Szukam osoby na stałe, i mile widziane doświadczenie.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Przedstawiciel Handlowy HoReCa MAKRO Ząbki",
      "category": "olx",
      "phone": "225000000",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "JEŻELI: \n\ntak jak my patrzysz w przyszłość z optymizmem\nosiągasz znakomite wyniki i wciąż chcesz udowadniać, że stać Cię na więcej\nmasz bogate doświadczenie w sektorze HoReCa i zależy Ci na zrobieniu kolejnego kroku w swojej karierze \n\n \n\nDołącz do naszego Zespołu profesjonalnych Przedstawicieli Handlowych nastawionych na ekspansję i nie zatrzymujących się pomimo nowej rzeczywistości.  \n\n \n\n \n\n WYMAGANIA: \n\nminimum dwuletnie doświadczenie w aktywnej, bezpośredniej sprzedaży oraz kontakcie z klientem\nbardzo dobra znajomość sektora HoReCa\nzaawansowane negocjacje, zarządzanie budżetem i umiejętności analityczne\nczynne prawo jazdy kat. B \n\n \n\nCZEKA NA CIEBIE: \n\numowa o pracę i możliwość rozwoju zawodowego w dynamicznej, międzynarodowej firmie – jesteśmy liderem w branży handlu hurtowego    \nbogaty pakiet socjalny (m.in. pakiet prywatnej opieki medycznej, zniżki na zakupy w MAKRO)\nprzyjazna i nieformalna atmosfera pracy\nsamochód służbowy, telefon komórkowy \n\n \n\nTWOJE GŁÓWNE ZADANIA : \n\nbudowanie długotrwałych relacji z klientami i pozyskiwanie nowych klientów \nidentyfikacja potrzeb klientów oraz profesjonalne doradztwo w zakresie rozwoju na rynku HoReCa\nrealizacja celów sprzedaży\npozyskiwanie i przekazywanie wiedzy dotyczącej trendów rynkowych\nprzygotowywanie raportów i analiz\nciągły rozwój swoich kompetencji sprzedażowych",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Poszukujemy pracownika do personelu sprzątającego",
      "category": "olx",
      "phone": "885140140",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": " Obowiązki:\n\nutrzymywanie czystości na terenie obiektu pływalni,\nobsługa sprzętów i urządzeń czyszczących,\npielęgnacja zieleni. \n\nWymagania:\n\nrzetelność,\ndokładność,\ndyspozycyjność również w weekendy,\nmile widziane doświadczenie zawodowe.\n\nOferujemy:\n\numowę zlecenie,\natrakcyjną stawkę godzinową,\npracę w systemie 3 -zmianowym,\nniezbędne narzędzia pracy oraz środki czystości,\npracę w miłej atmosferze,\nprzeszkolenie zawodowe.\n\nOpis dodatkowy: \n\nOsoby zainteresowane powyższą ofertą uprzejmie prosimy o  kontakt telefoniczny pod numerem 885-140-140 (poniedziałek-piątek w godz. 8.30-16.30). \n\nInformujemy, że skontaktujemy się tylko z wybranymi kandydatami.\n\nProsimy o dołączenie następującej klauzuli: „Wyrażam zgodę na przetwarzanie i przechowywanie danych osobowych zawartych w niniejszym dokumencie do realizacji procesu rekrutacji zgodnie z ustawą z dnia 10 maja 2018 roku o ochronie danych osobowych (Dz. Ustaw z 2018, poz. 1000) oraz zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO).”",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Poszukiwany kucharz śniadaniowo-lunchowy w Hotelu ***",
      "category": "olx",
      "phone": "512092299",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Opis\n\nButikowy Hotel *** zatrudni osobę do pracy na stanowisku KUCHARZ ŚNIADANIOWO-LUNCHOWY\n\nPraca od zaraz.\n\nOpis stanowiska:\n\nprzygotowywanie śniadań oraz lunchy w hotelu ***\npraca w przyjaznej atmosferze, atrakcyjne warunki zatrudnienia\n\nWymagania:\n\ndyspozycyjność\n\nmile widziane doświadczenie w pracy na podobnym stanowisku\n\nOsoby zainteresowane prosimy o wysyłanie CV ze zdjęciem lub o kontakt telefoniczny pod numerem tel. 512 092 299.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Hotel *** w Ząbkach zatrudni pracownika fizycznego",
      "category": "olx",
      "phone": "508362342",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Hotel *** w Ząbkach zatrudni pracownika fizycznego. \n\nWymagania: \n\ndyspozycyjność \nprawo jazdy kategoria B \n\nW celu uzyskania szczegółów oferty zapraszamy do kontaktu telefonicznego pod nr. + 48 508 362 342.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik przy budowie boisk, praca tymczasowa",
      "category": "olx",
      "phone": "508221990",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma zajmująca się budową boisk przyjmie do pracy tymczasowej. Praca od zaraz na okres ok miesiąca. Wynagrodzenie do 4000 tyś zł. Osoby sprawne fizycznie. Mile widziane doświadczenie w branży budowlanej, przy pracach ziemnych, kanalizacyjnych , przy kostce brukowej. Ale nie jest to wymóg konieczny.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca przy wykończeniach wnętrz",
      "category": "olx",
      "phone": "664916320",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię fachowca- glazurnika. Kompleksowe wykańczanie wnętrz. Praca na terenie Warszawy i okolic. Wynagrodzenie do ustalenia",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Mechanik pasjonata z dużym doświaczeniem Ząbki",
      "category": "olx",
      "phone": "507300201",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Czy jesteś jak B.A w Drużynie A najlepszym specem od mechaniki….to pakuj manatki i ruszaj na spotkanie .\n\nFirma Vanalley jest na rynku od 13 lat.\n\nZajmuje się serwisem amerykańskich vanów.\n\nOd Voyagera po expressa więc jeśli oglądałeś film „Drużyna A” to takie samochody naprawiamy\n\nNaprawy obejmują wszystkie układy samochodu, od zawieszenia po elektrykę oraz:\n\n-montaż dodatkowych instalacji elektrycznych w tym kamer, alarmów, dodatkowe oświetlenie, webasto, systemy solarne\n\n -profesjonalną obsługą klimatyzacji- naprawy po zatarciu, naprawy kompresorów, modyfikacja w samochodach klasycznych na R12, projekty do samochodów bez klimatyzacji.\n\n -montaż i serwis LPG\n\nCzasami naprawiamy także samochody innych marek dlatego poszukuję Ciebie.\n\nO Tobie\n\nSzukam doświadczonego i wykwalifikowanego mechanika samochodowego, który nie boi się wyzwań i amerykańskiej motoryzacji\n\nOczekuję\n\n-doświadczenie w pracy z różnymi markami samochodów\n\n-umiejętność diagnozowania uszkodzeń na podstawie wskazań skanera\n\n-bycia samodzielny/a i zaradny/a w trudnych sytuacjach\n\n- umiesz pracować w zespole\n\n-znasz elektrykę samochodową lub przynajmniej jej podstawy (patrz wyżej)\n\n-jesteś otwarty/a i uśmiechnięty/a\n\n-masz pozytywne nastawienie do życia\n\n- jesteś osobą bez nałogów…\n\nTo zapraszam na spotkanie do mojego serwisu w Ząbkach\n\nUl. Piłsudskiego 148\n\nPraca poniedziałek-piątek 8.00-17.00\n\nWolne soboty\n\n \n\nRóżne możliwości zatrudnienia\n\nEtat, dorywczo, umowa zlecenia, firma-firma\n\n \n\n \n\nPoszukuję również ludzi do stworzenia zespołu:\n\nMechanik główny\n\nPomocnik mechanika\n\nElektryk samochodowy\n\nPomocnik elektryka\n\nMenadżer\n\nZadzwoń 507 - pokaż numer telefonu - mail vanalleykustomz małpa gmail.com Marcin\n\nW przypadku wysłania CV w wiadomości, prosimy o dopisanie następującej klauzuli: \"Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji zgodnie z ustawą z dnia 29 sierpnia 1997 r. o ochronie danych osobowych (Dz. U. z 2002 r. Nr 101,)\"",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik produkcji -> NA WAKACJE -> Panie i Panowie -> wysoka stawka",
      "category": "olx",
      "phone": "48605131868",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zastanawia Cię jak wygląda produkcja majonezów, musztard, sosów? Szukasz pracy od zaraz? Obecnie poszukujemy kandydatów do pracy na produkcji - miejsce pracy Warszawa, Praga Północ. \n\nZAAPLIKUJ przez formularz., ZADZWOŃ lub WYŚLIJ SMS O TREŚCI PRACA, na numer 605 131 868, a my do Ciebie oddzwonimy i opowiemy o szczegółach. \n\noferujemy\n\n Wynagrodzenie ok. 2800 zł miesięcznie NA RĘKĘ (plus możliwość wypracowania nadgodzin)\n pracę od poniedziałku do piątku\nPRACĘ NA WAKACJE z możliwością dłuższego zatrudnienia\n możliwość rozpoczęcia pracy od zaraz \n umowę o pracę tymczasową na pełny etat (ZUS, urlop, świadczenia)\n możliwość pracy na część etatu\n atrakcyjny pakiet benefitów (prywatna opieka medyczna, karta sportowa)\n\nzadania\n\n składanie pudełek\n odbieranie z końca linii produkcyjnej słoików i układanie ich w opakowania zbiorcze (tacki, kartony) \n załadunek produktów na palety\n\noczekujemy\n\n książeczka sanepid\n gotowość do pracy w systemie trzyzmianowym (6-14-22)\n nie oczekujemy doświadczenia wszystkiego Cię nauczymy!\n\nAgencja zatrudnienia – nr  wpisu 47",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię Bezpośrednio Do Sklepu Spożywczego 24h W Ząbkach",
      "category": "olx",
      "phone": "504490703",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię Bezpośrednio Sprzedawcę Do Sklepu Spożywczego 24H W Ząbkach\n\n \n\nOferuję:\n\nFajny zespół,\nGodziwe wynagrodzenie wsparte dodatkami,\nZatrudnienie w dynamicznej polskiej firmie; Szkolenia,\nMożliwość awansu,\nSamodzielne stanowisko;\nProste rozwiązania zatrudnienia.\n\n \n\nW zamian oczekuję:\n\nDobrej organizacji pracy;\nUczciwości i pracowitości;\nChęci do podejmowania wyzwań;\nZaangażowania i pomysłowości.\n\n \n\nMasz Komornika? - Możemy pomóc. Odpowiedzi udzielamy na miejscu na rozmowie kwalifikacyjnej.\n\n \n\nZatrudniam osoby z doświadczeniem w branży spożywczej ale również i te, które z nią nie miały styczności. Proponujemy zatrudnienie osobom zarówno młodym jak i w sile wieku.\n\n \n\nOsoby zainteresowane zapraszam do wysłania CV mailem oraz kontaktu telefonicznego pod numerem 504 49 07 03",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Potrzebny kierowca/pomocnik",
      "category": "olx",
      "phone": "507105354",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Pilnie potrzebny kierowca kat.B (mały bus) pomocnik do drobnych prac i montaży na okres miesiąca (czerwiec) z możliwością przedłużenia współpracy. ",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca Mechanik Samochodowy",
      "category": "olx",
      "phone": "511026093",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Jeśli:\n\n- jesteś odpowiedzialny za powierzone Ci zadania\n\n- jesteś skrupulatny i lubisz porządek\n\n- jesteś uczciwy i brzydzisz się patologią niektórych warsztatów\n\n- jesteś osobą bardzo dokładną, a jednocześnie nie przeszkadza Ci to w szybkim i sprawnym „odhaczaniu kolejnych zadań\"\n\n- nie rozumiesz, co to znaczy „zagapić się” lub „zapomnieć”, bo organizujesz sobie pracę tak, by zawsze zrobić wszystko na czas\n\n- lubisz motoryzację i nie jesteś \"wypalonym narzekaczem\"\n\n- Twoje \"ego\" nie jest wyższe niż PKiN :)\n\n- przyjemność sprawia Ci naprawa samochodów osobowych\n\n...to być może jesteś osobą, której szukamy!\n\nSzukamy bowiem osoby z pasją na stanowisko Mechanika Samochodowego.\n\nKilka słów o nas\n\nAuto Centrum Ząbki powstało, by zmienić ogólny pogląd na słowo „warsztat samochodowy” czy „mechanik”. Jesteśmy prężnie rozwijającą się firmą, która z początkowych 24 m2 urosła w kilka lat do 200 m2 i nieustannie powiększa obszar i możliwości działania. Zajmujemy się mechaniką, elektroniką oraz klimatyzacją samochodową. Pracownik jest u nas na pierwszym miejscu. Dbamy o to, by niczego mu nie brakowało. Wysoki komfort pracy jest u nas standardem, będąc otwartymi na propozycje zatrudnionych zwiększamy wciąż jego poziom.\n\nPaweł Szachnowski, właściciel Auto Centrum Ząbki, jest specjalistą z dziedziny mechaniki i klimatyzacji samochodowej z 15-letnim doświadczeniem. W wieku 25 lat, po perypetiach w różnych warsztatach (również w ASO), mając dość patologii warsztatowej, otworzył własny serwis. Chcąc powiększać horyzonty nie spoczywa na laurach uczestnicząc w szkoleniach motoryzacyjnych i biznesowych. \n\nZa co będziesz odpowiedzialny jako Mechanik Samochodowy:\n\nHmm... Pewnie za naprawy samochodów :) A konkretniej:\n\n- Naprawy bieżące: układy hamulcowe, przeglądy sezonowe, naprawy zawieszeń, układy chłodzenia, układy paliwowe itp\n\n- Naprawy klimatyzacji: obsługa klimatyzacji, ozonowanie, szukanie nieszczelności, demontaż i montaż poszczególnych elementów\n\n- Wymiany sprzęgieł i rozrządów\n\n- wymiana opon\n\n- diagnozowanie wyżej wymienionyh napraw\n\n- dbanie o porządek na stanowisku pracy i wokół niego\n\nZgłoś się do nas, jeżeli spełniasz poniższe warunki:\n\n- masz min dwuletnie doświadczenie na stanowisku mechanika samochodowego\n\n- masz naturalne predyspozycje i cechy osobowości potrzebne do takiej pracy (opisaliśmy je na początku ogłoszenia)\n\n- potrafisz efektywnie zarządzać swoim czasem\n\n- posiadasz prawo jazdy kat B\n\n- dodatkowym atutem będzie znajomość podstaw elektroniki samochodowej\n\nCo oferujemy:\n\n- pracę w bardzo luźnej atmosferze, \n\n- jasne zasady i precyzyjnie określony zakres zadań\n\n- forma umowy: zlecenie, umowę o pracę lub B2B (do wyboru)\n\n- wynagrodzenie (na miesięcznym okresie próbnym): \n\ndo wyboru:\n\n- stała pensja 4200 brutto (około 3000 netto)\n\n- pensja uzależniona od przerobu: 50% powyżej kosztów zatrudnienia \n\nPo okresie próbnym pensja od 3500 netto (w zależności od umiejętności)\n\n- codzienny posiłek, kawa, herbata itp\n\n- możliwość rozwoju: szkolenia w zakresie motoryzacji\n\n- stały czas pracy: pon – pt w godzinach 9-17\n\n- otwartość do działania: jesteśmy otwarci na wszelkie zmiany i pomysły ze strony pracowników\n\n- możliwość korzystania ze zniżek w hurtowniach przy zakupie części\n\n- w przyszłości planujemy wprowadzić dodatkowe ubezpieczenie zdrowotne oraz pakiet medyczny\n\nJak aplikować?\n\nNapisz do nas na adres: biuro(małpa)mechanikazabki(kropka)com(kropka)pl (w temacie wiadomości wpisz „Twoje imię i nazwisko – mechanik samochodowy”). Do wiadomości dołącz w formacie PDF swoje CV. W treści mail'a napisz proszę odpowiedź na trzy poniższe pytania:\n\n1. Jaki jest cykl pracy silnika spalinowego czterosuwowego?\n\n2. W jakiej kolejności należy odpowietrzać układ hamulcowy?\n\n3. W jakim celu wykonuje się próżnię w układzie klimatyzacji? \n\nJeżeli masz umiejętności większe niż wymagane w ogłoszeniu (np potrafisz regenerować kompresory klimatyzacji, montować alarmy itp), napisz to w treści mail'a. Jesteśmy otwarci do działania :) \n\nW procesie rekrutacji rozpatrywane będą tylko zgłoszenia kompletne oraz wysłane na podany wyżej adres email.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię do sprzątania",
      "category": "olx",
      "phone": "504246515",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię kobiety do sprzątania klatki schodowe.Praca od poniedziałku do piątku, co druga sobota dyżur.Praca na stałe,wynagrodzenie do uzgodnienia.Ząbki i okolice \n\ntel.504-246-515 ",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca dla kierowcy kat. C-4300 Netto",
      "category": "olx",
      "phone": "608045425",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Dzień dobry\n\nBardzo chętnie zapraszam do współpracy kierowcę z kategorią C i książeczką sanepidowską. Obsługujemy centrum logistyczne.Pracujemy od poniedziałku do piątku i co drugą sobotę.Trasa rozpoczyna się od godziny 06.00- 07.00 do15.00-16.00 . Ilość punktów dziennie do rozwiezienia od 5 do 8 Jeździmy w okolicach Warszawy. Po zatrudnieniu każdy kierowca zanim rozpocznie pracę zostaje przeszkolony z kierowcą z doświadczeniem. Wynagrodzenie miesięczne 4500brutto + premia = 4300/4500netto\n\nOsoby zainteresowane pracą proszę o kontakt od poniedziałku do piątku od 09.00 do 15.00 pod numerem 608045425",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "BAMBUS dostawca Ząbki Kobyłka pełny etat",
      "category": "olx",
      "phone": "501100775",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Restauracja Bambus poszukuje pracowników na stanowisko dostawcy\n\nPraca 4 lub 5 dni w tygodniu, 2 weekendy pracujące, 2 wolne. Pon - pt różne zmiany 10-20, 12-22, 10-21, 10-22. Sb stala zmiana 11-22, ndz 12-20.\n\nStawki od 13zl - 16zl netto, nasz samochód, nasze paliwo. Samochody Skoda Fabia III, VW Fox. \n\nDuża strefa dostawy, kilku dostawców na zmianie, dobre napiwki które w 100% są Twoje.\n\nUmowa zlecenie, z możliwością umowy o pracę. Wyplaty co dwa tygodnie. Mlody zespół, spotkania firmowe, dobra atmosfera pracy, jedzenie i picie pracownicze za darmo.\n\nProszę dzwonić na tel 501100775\n\nProsimy o dopisanie następującej klauzuli: \"Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji zgodnie z ustawą z dnia 29 sierpnia 1997 r. o ochronie danych osobowych (Dz. U. z 2002 r. Nr 101, poz. 926, ze zm.)\"",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Sprzedawca sklep 24h",
      "category": "olx",
      "phone": "508797376",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukuję pracownika do sklepu 24h   w Ząbkach   proszę o kontakt telefoniczny",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Elewacje malowanie",
      "category": "olx",
      "phone": "694357131",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Przyjmę do pracy fizycznej przy dociepleniach budynków jednorodzinnych. Praca na terenie Warszawy i okolic. Stawka godzinowa 20/25 zł godz. Tygodniowym pracownikom dziękuje. Więcej informacji udzielę telefonicznie.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Opiekunka do domu opieki.",
      "category": "olx",
      "phone": "535421427",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukuję Pani do pracy w charakterze opiekunki do Domu Opieki mile widziane doświadczenie w pracy z osobami starszymi. Proszę o kontakt telefoniczny 535 421 427",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Kierowca Dostawca kat B",
      "category": "olx",
      "phone": "505613791",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Kierowca/dostawca kat B do hurtowni Miesa Drobiu Wedlin. Mile widziane doswiadczenie jako kierowca/dostawca.. praca od 4:00 do 10:00.. od pon do sob,ale czas zalezy od ilosci pracy.. jednego dnia mozna skończyc o 9 a drugiego o 12. Praca Ząbki Praska Gielda Spozywcza. Praca na busie  kontener chłodnia. Wynagrodzenie 3200zl ewentualnie możliwe rozliczenie/dniówki płatne co dwa tygodnie. \n\nWięcej informacji tylko pod nr. 505 613 791\n\nProsze o kontakt zdecydowane osoby chcące  zacząć  prace od zaraz.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pilnie poszukiwana hostessa do Delikatesów HE-MAN",
      "category": "olx",
      "phone": "502787800",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Pilnie poszukiwana HOSTESSA na akcję promocyjną do Delikatesów \"HE-MAN\" w\n\nWarszawie.\n\nAkcja odbędzie się w dniach 24.06.2021-26.06.2021 od 8:00 do 16:00.\n\nWymagania:\n\n- miła aparycja\n\n- doświadczenie w prowadzeniu akcji promocyjnych\n\n- umiejętność nawiązania pozytywnych relacji z klientem\n\n- miłe usposobienie i pozytywne nastawienie\n\n- kreatywność\n\nOferujemy:\n\n- stawkę 23 zł netto/h (tylko w przypadku statusu studenta)\n\n- umowę zlecenie.\n\n-miłą atmosferę\n\nProsimy o przemyślane zgłoszenia. Jednocześnie zastrzegamy sobie prawo do odpowiedzi na wybrane aplikacje. Zachęcamy do przesyłania dokumentów aplikacyjnych",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Kucharza z doświadczeniem do cateringu dietetycznego",
      "category": "olx",
      "phone": "535939470",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Kucharza z doświadczeniem do cateringu dietetycznego, praca 5 dni w tygodniu, ząbki",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca w Anglii od zaraz",
      "category": "olx",
      "phone": "535032333",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Witam\n\nSzukam pracowników ogólnobudowlanych, którzy mają ochotę wyjechać i pracować w Anglii. Zapewniam mieszkanie i dojazd do pracy. Praca od zaraz.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Stolarz meblowy do zakładu stolarskiego",
      "category": "olx",
      "phone": "694624832",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię stolarza do pracy przy produkcji i montażu mebli w zakładzie stolarskim.\n\nWymagania:\n\n- znajomość obsługi maszyn stolarskich (pilarka, frezarka, oklejarka)\n\n- umiejętność rozkroju płyt \n\n- umiejętność pracy z fornirami\n\n- obsługa elektronarzędzi (wiertarka, wkrętarka)\n\n- znajomość technik montażu akcesoriów meblowych (m.in. BLUM, HETTICH)\n\n- znajomość systemów szaf przesuwnych (np. LAGUNA, SEVROLL)\n\nTwoja kandydatura będzie jeszcze bardziej atrakcyjna jeśli:\n\n- nałogi nie przeszkadzają Ci w pracy\n\n- jesteś sumienny, zdyscyplinowany, dobrze zorganizowany\n\n- potrafisz utrzymać porządek w miejscu pracy\n\n- umiesz pracować w zespole\n\n- mówisz w języku polskim w stopniu komunikatywnym\n\n- posiadasz prawo jazdy kat. B\n\nDołączając do naszego zespołu:\n\n- zaczynasz pracę w dynamicznie rozwijającej się firmie z ponad 30 letnią tradycją i ugruntowaną pozycją na rynku\n\n- zyskujesz jasne, atrakcyjne i stabilne warunki zatrudnienia\n\n- dzięki szkoleniom masz szansę na rozwój zawodowy\n\n- otrzymujesz ubrania robocze i obuwie BHP \n\nZadzwoń i umów się na rozmowę już dziś!",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Osoba do prasowania",
      "category": "olx",
      "phone": "503092688",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Witam, \nZakład Krawiecki w Kobyłce zatrudni osoby do prasowania, mogą być również panie na emeryturze. Wszelkie informacje pod nr tel: 601852744.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Podejmę współpracę z firmami elewacyjnymi- wysokie stawki!",
      "category": "olx",
      "phone": "503113077",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma budowlana podejmie współpracę z firmami specjalizującymi się w dociepleniach budynków wielorodzinnych. Oferujemy wysokie stawki, stałe zlecenia oraz bardzo dobre warunki współpracy.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię fryzjerkę, fryzjera",
      "category": "olx",
      "phone": "690455890",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię fryzjera, fryzjerkę do dobrze prosperującego salonu fryzjerskiego. Oferujemy pracę w miłej atmosferze, raz w roku tygodniowe szkolenia. Praca zmianowa pensja plus procent. Tel. 690 455 890",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "KURIER praca Targówek i Białołęka",
      "category": "olx",
      "phone": "501487264",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Praca dla kuriera, rejon Targówek i Białołęka. Od zaraz. Samochód służbowy.\n\nWięcej informacji pod numerem telefonu.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Majster Budowy z uprawnieniami",
      "category": "olx",
      "phone": "603929999",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Osoba zatrudniona na tym stanowisku dołączy do zespołu technicznego firmy i będzie odpowiedzialna za następujące zadania:\n\n·        planowanie i organizacja procesu budowy, w tym:\n\n·        nadzór nad harmonogramem terminowym budowy i jego wypełnianiem\n\n·        kontrola wydatków z założonym budżetem\n\n·        koordynacja zamówień oraz dostaw materiałów i sprzętu\n\n·        koordynacja prac brygad budowlanych i podwykonawców w celu optymalnego wykorzystania czasu, materiałów i sprzętu\n\n·        bezpośredni nadzór nad realizacją prac budowlanych zgodnie z przepisami prawa\n\n·        weryfikacja dokumentacji technicznej, nadzór nad opracowaniem dokumentacji powykonawczej i odbiorowej\n\n·        nadzór i udział w procesie wprowadzania zmian lokatorskich\n\n·        udział w odbiorach technicznych lokali mieszkalnych\n\nWymagania:\n\n·        wykształcenie wyższe techniczne w zakresie budownictwa lądowego\n\n·        uprawnienia budowlane do kierowania robotami budowlanymi w specjalności ogólnobudowlanej bez ograniczeń\n\n·        prawo jazdy kat. B\n\n·        dobra znajomość pakietu MS Office, AutoCad\n\nIdealny kandydat:\n\n·        posiada naturalne umiejętności organizacyjne i kierownicze\n\n·        cechuje go energia i dynamizm w działaniu lubi uporządkowany i systematyczny styl pracy\n\n·        cechuje go naturalne dążenie do poszukiwania rozwiązań oraz zaangażowanie w efekt wykonanej pracy\n\n·        posiada umiejętność współpracy i bezkonfliktowość oraz wysoką kulturę osobistą\n\nOferujemy:\n\n·        stabilne i przejrzyste warunki zatrudnienia\n\n·        dobrą atmosferę pracy w zespole, oferującym wzajemną życzliwość, zrozumienie i szacunek\n\n·        możliwość rozwoju zawodowego\n\nMiejsce pracy: Bobrowiec , Góraszka ,Warszawa\n\nProsimy wysyłanie CV lub kontakt telefoniczny",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Magazynier - Kierowca Pakfal",
      "category": "olx",
      "phone": "504236127",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma Pakfal Hurtownia Opakowań Jednorazowych zatrudni magazyniera - kierowcę. Praca w oddziale na Praskiej Giełdzie Spożywczej w Ząbkach. Mile widziane doświadczenie w prowadzeniu samochodu dostawczego. Osoby zainteresowane prosimy o wysłanie CV przez OLX .\n\nW trakcie rekrutacji będziemy na bieżąco oddzwaniać do wybranych kandydatów celem przeprowadzenia krótkiego wywiadu telefonicznego oraz ewentualnego umówienia się na rozmowę kwalifikacyjną.\n\nZe względu na bardzo duże zainteresowanie ofertą informujemy i przepraszamy jeśli nie odpowiemy na Państwa wiadomość.\n\nPozdrawiamy.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik magazynu/zaopatrzenia",
      "category": "olx",
      "phone": "782212141",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię kierowcę zaopatrzenia / pracownika magazynu\n\nPraca od zaraz\n\nPraca ok 20 dni w miesiącu, w tym również w weekendy i święta (rotacyjnie),\n\nzaczynamy codziennie o godz. 7.30 \n\nZadania:\n\npakowanie i rozwożenie towaru do restauracji wg zamówień, \nokresowe inwentaryzacje,\ndbanie o porządek w magazynie, \nbieżące drobne prace wskazane przez przełożonych\n\nZapewniamy:\n\nwynagrodzenie min. 16 zł netto/h  - na początek \nterminowe wypłaty, \nprzyjazną atmosferę pracy, \nobiad pracowniczy \n\n \n\nOczekujemy:\n\nuczciwości i sumienności w wykonywaniu powierzonych zadań,\ngotowości do pracy w weekendy i święta,\n\nWymagane:\n\nprawo jazdy kat. B\naktualna książeczka do celów sanitarno-epidemiologcznych\n\nCv z klauzulą wyrażającą zgodę na przetwarzanie danych osobowych zgodnie z RODO proszę przesyłać za pośrednictwem serwisu",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnienie Brukarzy do kostki brukowej i granitowej",
      "category": "olx",
      "phone": "510251458",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Witam. Zatrudnie na stanowisko brukarz praca od zaraz w ząbkach i na terenie Warszawy Możliwość zakwaterowania atrakcyjne wynagrodzenie wypłata co tydzień w razie pytań proszę o kontakt 509086131",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik magazynu",
      "category": "olx",
      "phone": "602315477",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Hurtownia Spożywcza AMIDO na terenie Praskiej Giełdy Spożywczej w Ząbkach zatrudni pracowników magazynowych  .\n\nOferujemy pracę na pełny etap oraz umowę o pracę.\n\nOpis obowiązków:\n\n-        przyjmowanie i wydawanie towarów w magazynie,\n\n-        terminową obsługę dostaw \n\n-        kontrolę stanów faktycznych przewożonych towarów z dokumentami \n\nBezpośredni kontakt na nr tel. 602 315 477",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "kucharz do cateringu",
      "category": "olx",
      "phone": "604737720",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Kucharz-szef kuchni do cateringu dietetycznego rozpoczynającego działalność. Szukamy osoby z pasją i sercem do gotowania. Doświadczenie w pracy w cateringu dietetycznym wskazane. Wysokie wynagrodzenie.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Obsługa klienta - Ząbki / Szkoła Językowa",
      "category": "olx",
      "phone": "501233755",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "ProfiLingua Ząbki zatrudni\n\nPRACOWNIKÓW OBSŁUGI KLIENTA\n\nObowiązki:\n\n- obsługa klientów według standardów szkoły\n\n- aktywne pozyskiwanie kursantów\n\n- udział w akcjach promocyjnych\n\n- prace organizacyjne i porządkowe\n\nWymagania:\n\n- wykształcenie minimum średnie\n\n- doświadczenie na podobnym stanowisku\n\n- doświadczenie w opiece nad dziećmi\n\n- komunikatywna znajomość j. angielskiego\n\n- kreatywność, zaangażowanie i dynamizm\n\n- dyspozycyjność\n\n- preferowane osoby zamieszkałe w Ząbkach\n\nOferujemy:\n\n- możliwość rozwoju zawodowego\n\n- możliwość współpracy z lektorami, lekarzami i psychologami\n\n- korzystne warunki finansowe\n\n- pracę w nowoczesnych warunkach",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracowników do specjalistycznego czyszczenia maszyn",
      "category": "olx",
      "phone": "503832942",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma ECO ALFA pilnie poszykuje pracowników do czyszczenia maszyn z linii produkcyjnej.\n\npraca w miejscowości Nadma /okolice Ząbek/\n\nWymagania:\n\nsiły i chęci do pracy\ndoświadczenie w usługach porządkowych, sprzątania - mile widziane\nmile widziani Panowie w wieku do 65 lat.\n\nZapewniamy:\n\npraca stacjonarna w systemie pon.-piątek 14.00-22.00\nniezbędne narzędzia\natrakcyjne wynagrodzenie plus premie oraz możliwość dorobienia\nmożliwość awansu\n\nWszystkich zainteresowanych proszę o kontakt telefoniczny lub składanie aplikacji, CV poprzez portal OLX. W przypadku CV prosimy o zgodę na przetwarzanie danych osobowych w celach rekrutacyjnych.\n\nKontakt\n\n503 832 942 lub 609081972",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Hurtownia płyt i okuć zatrudni pracownika produkcji",
      "category": "olx",
      "phone": "502398363",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Hurtownia płyt i okuć meblowych zatrudni pracownika do obsługi maszyn stolarskich. Praca od zaraz na umowę o pracę. Zainteresowanych proszę o wysłanie CV lub kontakt pod nr 502 398 363.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Operator koparki- zatrudnię",
      "category": "olx",
      "phone": "606366046",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Witam firma z siedzibą w Ząbkach zajmująca się kompleksowym wykonaniem dróg, zieleni i kanalizacji zatrudni operatora koparki.\n\nWięcej informacji pod numerem kontaktowym.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Kasjer sprzedawca - do sklepu z pieczywem - Ząbki",
      "category": "olx",
      "phone": "798024154",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Nowoczesna Piekarnia z tradycjami rodzinnymi od 1945 roku prowadząca sklepy w Warszawie Galeria Wypieków poszukuje pracownika na stanowisko: KASJER/SPRZEDAWCA Miejsce pracy: Ząbki Jeśli tak jak my: • masz dużo pozytywnej energii, • cenisz miłą atmosferę w pracy, • masz chęć do działania, • jesteś komunikatywny, kreatywny i umiesz pracować w zespole, • jesteś samodzielny i odpowiedzialny, • łatwo nawiązujesz kontakty, • kochasz pracę z ludźmi. Nie czekaj, dołącz do ludzi takich jak TY. Co oferujemy: • ciekawą, stabilną pracę w renomowanej firmie o ugruntowanej pozycji na rynku, • atrakcyjne wynagrodzenie, • możliwość rozwoju i doskonalenia zawodowego, • umowę o pracę/ umowę zlecenie, • możliwość rozwoju zawodowego i osobistego.\n\nDo Twoich obowiązków będzie należało: • dbanie o czystość i porządek na stanowisku pracy, • obsługa naszych klientów zgodnie ze standardami, • obsługa kasy fiskalnej i terminala płatniczego, • przyjmowanie dostaw oraz pakowanie zwrotów. APLIKUJ JUŻ TERAZ CZEKAMY WŁAŚNIE NA CIEBIE NIE WYMAGAMY DOŚWIADCZENIA - WSZYSTKIEGO CIĘ NAUCZYMY Jeśli jesteś zainteresowany /-a, prześlij nam swoje CV za pośrednictwem formularza kontaktowego lub odwiedź nas bezpośrednio w sklepie. Osoby zainteresowane prosimy o przesyłanie aplikacji klikając w przycisk aplikowania. Prosimy o zawarcie w CV klauzuli: „Wyrażam zgodę na przetwarzanie danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji prowadzonego przez Piekarnie Lubaszka Sp. z o.o. z siedzibą w Warszawie 03-259, ul. Szlachecka 45, zgodnie z ustawą z dnia 29 sierpnia 1997 r. o ochronie danych osobowych (t.j. Dz. U. z 2016 r., poz. 922)”. Klikając w przycisk „Napisz do nas”, \"Aplikuj\" lub w inny sposób wysyłając zgłoszenie rekrutacyjne do Piekarnie Lubaszka Sp z o.o. z siedzibą w Warszawie przy ul. Szlachecka 45 (Pracodawca, Administrator danych), zgadzasz się na przetwarzanie przez Pracodawcę/Administratora danych Twoich danych osobowych zawartych w zgłoszeniu rekrutacyjnym w celu przeprowadzenia rekrutacji na stanowisko wskazane w ogłoszeniu. Informujemy, że Administratorem danych jest Piekarnie Lubaszka Sp. z o.o. z siedzibą w Warszawie przy ul. Szlacheckiej 45. Dane zbierane są dla potrzeb rekrutacji. Ma Pani/Pan prawo dostępu do treści swoich danych oraz ich poprawiania. Podanie danych w zakresie określonym przepisami ustawy z dnia 26 czerwca 1974 r. Kodeks pracy oraz aktów wykonawczych jest obowiązkowe. Podanie dodatkowych danych osobowych jest dobrowolne.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię kucharza, pomoc kuchenną lub barmankę.",
      "category": "olx",
      "phone": "507756257",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Bistro w Ząbkach zatrudni kucharza, pomoc kuchenną i barmankę. Kuchnia polska. Praca 4-5 dni w tygodniu w godz 6-18, ale nie są to sztywne ramy ( barmanka od 11:00 ) . Praca z drugim kucharzem. Wynagrodzenie do ustalenia podczas rozmowy. Zgłoszenia, wyłącznie telefonicznie, pod numer 507 756 257.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Akademia Kierowcy - finansujemy kurs i gwarantujemy pracę! WAW",
      "category": "olx",
      "phone": "605457457",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Autobus szuka Kierowcy! – Ty też możesz nim zostać!\n\nPowracamy z programem Akademia Kierowcy, który ma na celu pomoc w zdobyciu uprawnień na stanowisko Kierowcy Autobusu.\n\nPoszukujemy czynnych kierowców – zawodowo ale również prywatnie, którzy chcieliby zdobyć uprawnienia na autobus, czyli kat. D prawa jazdy wraz z kwalifikacją na przewóz osób (kod 95).\n\nProwadzenie samochodu to jeden z Twoich obowiązków służbowych lub po prostu jeździsz na co dzień prywatnym samochodem, dołącz do nas!\n\nTa oferta jest idealna dla każdego kierowcy!\n\nWarunki przystąpienia do kursu :\n\n·      Czynne prawo jazdy kat. B lub C\n\n·      ukończone 24 lata\n\n·      dyspozycyjność\n\n \n\nWarunki współpracy:\n\nArriva:\n\n·      Skierowanie do OSK (Ośrodka Szkolenia Kierowców)\n\n·      Opłacenie wszystkich elementów realizowanych w trakcie zdobywania uprawnień\n\n·      Gwarancja stabilnego zatrudnienia, w oparciu o umowę o pracę\n\nKierowca:\n\n·      Realizacja kursu i przystąpienie do zatrudnienia w terminie 4 miesięcy (czas trwania kursu jest uzależniony od Ciebie, Twojego zaangażowania i dyspozycyjności, więc może być krótszy)\n\n·      Przepracowanie u nas 2 lat (po tym czasie gwarancja pracy z naszej strony nadal trwa!)\n\nPrzebieg kursu :\n\n·      realizacja kursu na prawo jazdy kat D, wraz z egzaminami państwowymi\n\n·      realizacja kursu kwalifikacji zawodowej na przewóz osób, wraz z egzaminem państwowym\n\nPierwsze dni pracy:\n\n·      Szeroki program onbordingowy: szkolenie BHP, jazdy z patronem (na początku pierwsze zmiany realizujesz z doświadczonym kierowcą, który wszystkiego Cię nauczy)\n\n·      Zatrudnienie w lokalizacji ul.Płochocińska 33, Białołęka, na jednej z naszych baz\n\nKoszty:\n\n·      Podczas zdobywania uprawnień Arriva pokrywa wszystkie koszty, nie musisz posiadać żadnego wkładu własnego\n\n·      Po podjęciu zatrudnienia kwotę dzielimy na pół.\n\n·      Jedna część leży po naszej stronie i po przepracowaniu 2 lat jest całkowicie umorzona\n\n·      Druga część, leżąca po stronie kierowcy, podzielona jest na 24 dogodne raty (okres 2 lat)\n\nWarunki zatrudnienia:\n\n·      Umowę o pracę w wymiarze pełnego etatu, na czas określony\n\n·      Elastyczny grafik\n\n·      Pracę na terenie Warszawy\n\n·      Pakiet socjalny (wczasy pod gruszą, dodatki na święta, dofinansowanie do wakacji dla dzieci)\n\n·      Prywatną opiekę medyczną, grupowe ubezpieczenie na życie i bilet wolnej jazdy\n\nCo zyskujesz?:\n\n·      Uprawnienia na stanowisko Kierowcy Autobusu za ½ ceny\n\n·      Gwarancję zatrudnienia, bez doświadczenia, masz możliwość je u nas zdobyć\n\n·      Stabilne zatrudnienie\n\n \n\nJeżeli zainteresowała Cię nasza oferta zapraszamy na spotkanie rekrutacyjne!\n\nWyślij CV lub zadzwoń 605 457 457\n\n \n\n Administratorem danych osobowych jest Arriva Bus Transport Polska Spółka z o.o. z siedzibą w Toruniu (kod pocztowy: 87-100 Toruń) przy ul. Dąbrowskiego 8/24 („ARRIVA BUS TRANSPORT” lub „ADMINISTRATOR”), wpisana do rejestru przedsiębiorców Krajowego Rejestru Sądowego prowadzonego przez Sąd Rejonowy w Toruniu, Wydział VII Gospodarczy KRS za numerem KRS21693 NIP:527215555 9, REGON:1327115 7 . Podane przez Panią/Pana dane osobowe będą przetwarzane w celu realizacji procesu rekrutacyjnego.\n\n Więcej informacji o przetwarzaniu danych osobowych przez Arriva Bus znajduje się w polityce prywatności na naszej stronie.\n\n \n\n W dokumentach aplikacyjnych prosimy o dołączenie poniższego oświadczenia: Wyrażam zgodę na przetwarzanie moich danych osobowych przez Arriva Bus Transport Polska Spółka z o.o. z siedzibą w Toruniu, zawartych w aplikacji o pracę na potrzeby obecnego procesu rekrutacyjnego. Jestem świadomy/a, że mam prawo do wycofania zgody w każdym czasie. Wycofanie zgody nie ma wpływu na zgodność z prawem przetwarzania dokonanego uprzednio.\n\n \n\n Dodatkowo, można umieścić zgodę: Wyrażam zgodę na przetwarzanie moich danych osobowych przez Arriva Bus Transport Polska Spółka z o.o. z siedzibą w Toruniu, zawartych w aplikacji o pracę na potrzeby przyszłych procesów rekrutacyjnych. Jestem świadomy/a, że mam prawo do wycofania zgody w każdym czasie. Wycofanie zgody nie ma wpływu na zgodność z prawem przetwarzania dokonanego uprzednio.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Sprzedawca/kasjer/lady mięso-wędliny - Ząbki, ul. Powstańców 29B",
      "category": "olx",
      "phone": "602613713",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukujemy Pracownika na stanowisko: \n\n- Sprzedawca/Kasjer \n\n- Sprzedawca/lady mięso-wędliny do sklepu spożywczego \n\nLokalizacja: - Ząbki, ul. Powstańców 29B\n\nPodstawowe zadania: \n\n- wykładanie towaru oraz dbanie o jego odpowiednią ekspozycję \n\n- przygotowywanie i umieszczanie prawidłowych oznaczeń cenowych \n\n- dbanie o uprzejmą, staranną i sprawną obsługę klienta \n\n- dbanie o świeżość i jakość naszych produktów, m.in. poprzez kontrolę terminów przydatności do sprzedaży \n\n- dbanie o właściwą gospodarkę towarową w markecie. \n\nWYMAGANIA:\n\n- znajomości podstawowych zasad obsługi klienta \n\n- energicznej i przyjaznej osobowości \n\n- sumienności i zaangażowania w wykonywaniu obowiązków \n\n- umiejętności pracy w grupie oraz znajomości zasad prawidłowej komunikacji z klientami i współpracownikami \n\n- doświadczenie na podobnym stanowisku będzie dodatkowym atutem \n\n- badania sanepidarno-epidemiologiczne \n\nMile widziane orzeczenie o niepełnosprawności \n\nZAPEWNIAMY: \n\n• Umowę o pracę \n\n• Ubezpieczenie grupowe \n\n• Atrakcyjne wynagrodzenie \n\n• Talony na święta \n\nTel. 602 613 713\n\nNie odpowiadamy na wiadomości sms. \n\nZgodnie z art. 13 Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 roku w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE firma API Market Sp Z o. o. z/s ul. Kościelna 3, 05-200 Wołomin informuje: 1. administratorem Pani/Pana danych osobowych firma API Market Sp Z o. o. z/s ul. Kościelna 3, 05-200 Wołomin,, tel./faks: 222 - pokaż numer telefonu - - . kontakt z Inspektorem Ochrony Danych: pisemnie na adres wymieniony w punkcie 1, 3. Pani/Pana dane osobowe przetwarzane będą na potrzeby aktualnej i przyszłych rekrutacji - na podstawie art. 6 ust. 1 lit. a, art. 9 ust.2 lit. a Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 roku w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE oraz na podstawie ustawy z dnia 26 czerwca 1974 roku Kodeks pracy. 4. odbiorcami Pani/Pana danych osobowych będą wyłącznie podmioty uprawnione do uzyskania danych osobowych na podstawie przepisów prawa, 5. Pani/Pana dane osobowe przechowywane będą w czasie określonym przepisami prawa, zgodnie z instrukcją kancelaryjną, 6. posiada Pani/Pan prawo żądania od administratora dostępu do danych osobowych, prawo do ich sprostowania, usunięcia lub ograniczenia przetwarzania, prawo do wniesienia sprzeciwu wobec przetwarzania, prawo do przenoszenia danych, prawo do cofnięcia zgody w dowolnym momencie, 7. ma Pani/Pan prawo wniesienia skargi do organu nadzorczego na działania urzędu w zakresie ochrony danych osobowych, 8. podanie danych osobowych jest obligatoryjne w oparciu o przepisy prawa, a w pozostałym zakresie jest dobrowolne.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Brukarz, pomocnik brukarza, chęci do pracy",
      "category": "olx",
      "phone": "519437953",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Pomocnik brukarza, brukarz, prowadzący. \nPrywatki.\nPłacę terminowo. \nTel 519437953",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Ząbki praca dla MĘSZCZYZNY",
      "category": "olx",
      "phone": "501349426",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię Pana do sprzątania w godz. 6-14 na terenie Wspólnoty Mieszkaniowej w Ząbkach \n\ntel.501349426",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Takko Fashion Polska sprzedawca Ząbki",
      "category": "olx",
      "phone": "48797008456",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Od momentu założenia w 1982 roku, Takko Fashion stała się odnoszącą sukcesy międzynarodową siecią sklepów w koncepcji smart discounter z prawie 1 900 sklepami w 17 krajach. Naszym celem jest zagwarantowanie naszym klientom w sklepach stacjonarnych zakupu wysokiej jakości produktów i uczciwe ceny w przyjemnej atmosferze.\n\n \n\nSzukamy osobowości, które wspólnie z nami chcą w sposób profesjonalny, otwarty i zaangażowany przyczynić się do sukcesu naszej organizacji.\n\nObecnie do naszego sklepu w Takko Fashion\n\n- poszukujemy sprzedawcy na 0,5 etatu, praca w godzinach popołudniowych i wieczornych\n\n \n\nJakie obowiązki na Ciebie czekają :\n\nSprzedaż najnowszych kolekcji odzieżowych\n\nProfesjonalna obsługa klienta\n\nDbanie o ekspozycję towaru\n\nObsługa kasy\n\n \n\nCzego wymagamy :\n\nZaangażowanie w powierzone obowiązki- najważniejsze\n\nPozytywne nastawienie oraz energia\n\nDoświadczenie w handlu (mile widziane)\n\nChcemy na ciebie liczyć\n\n \n\nCo proponujemy w zamian :\n\nUmowa zlecenie\n\nPogodną atmosferę pracy\n\nZniżki na odzież\n\nKonkursy dla zespołów\n\n \n\nProsimy o załączanie CV. Skontaktujemy się z wybranymi kandydatami. KLAUZULA INFORMACYJNA Wysyłając CV, zgłaszasz się do procesu rekrutacyjnego prowadzonego przez Takko Fashion Polska i zgadzasz się na przetwarzanie przez Pracodawcę Twoich danych osobowych zawartych w zgłoszeniu rekrutacyjnym w celu prowadzenia rekrutacji na stanowisko wskazane w ogłoszeniu. Jeżeli chcesz, abyśmy zachowali Twoje CV w naszej bazie, umieść dodatkowo w CV następującą zgodę: „Wyrażam zgodę na przetwarzanie danych w celu wykorzystania ich w kolejnych naborach prowadzonych przez Takko Fashion Polska Sp.zo.o. przez okres najbliższych 9 miesięcy.” Administrator Administratorem Państwa danych przetwarzanych w ramach procesu rekrutacji jest Takko Fashion Polska Sp. z o.o., 54-204 Wrocław, ul. Legnicka 56. Inspektor ochrony danych Mogą się Państwo kontaktować z inspektorem ochrony danych osobowych pod adresem privacy(at)takko.de lubTakko Fashion GmbH, Data protection officer, Alfred-Krupp-Str. 21, 48291 Telgte, Niemcy Cel i podstawy przetwarzania Państwa dane osobowe w zakresie wskazanym w przepisach prawa pracy będą przetwarzane w celu przeprowadzenia obecnego postępowania rekrutacyjnego (art. 6 ust. 1 lit. b RODO), natomiast inne dane, w tym dane do kontaktu, na podstawie zgody (art. 6 ust. 1 lit. a RODO), która może zostać odwołana w dowolnym czasie. Takko Fashion Polska będzie przetwarzał Państwa dane osobowe, także w kolejnych naborach pracowników, jeżeli wyrażą Państwo na to zgodę (art. 6 ust. 1 lit. a RODO), która może zostać odwołana w dowolnym czasie. Jeżeli w dokumentach zawarte są dane, o których mowa w art. 9 ust. 1 RODO konieczna będzie Państwa zgoda na ich przetwarzanie (art. 9 ust. 2 lit. a RODO), która może zostać odwołana w dowolnym czasie.Przepisy prawa pracy: art. 22 Kodeksu pracy oraz §1 rozporządzenia Ministra Pracy i Polityki Socjalnej z dnia 28 maja 1996 r.w sprawie zakresu prowadzenia przez pracodawców dokumentacji w sprawach związanych ze stosunkiem pracy oraz sposobu prowadzenia akt osobowych pracownika. Odbiorcy danych osobowych Odbiorcą Państwa danych osobowych będzie Takko Fashion Polska z siedzibą we Wrocławiu, przy ulicy Legnickiej 56. Okres przechowywania danych Państwa dane zgromadzone w obecnym procesie rekrutacyjnym będą przechowywane do zakończenia procesu rekrutacji. W przypadku wyrażonej przez Państwa zgody na wykorzystywane danych osobowych dla celów przyszłych rekrutacji, Państwa dane będą wykorzystywane przez okres 9 miesięcy. Prawa osób, których dane dotyczą Mają Państwo prawo do: 1) prawo dostępu do swoich danych oraz otrzymania ich kopii 2) prawo do sprostowania (poprawiania) swoich danych osobowych; 3) prawo do ograniczenia przetwarzania danych osobowych; 4) prawo do usunięcia danych osobowych; 5) prawo do wniesienia skargi do Prezes UODO (na adres Urzędu Ochrony Danych Osobowych, ul. Stawki 2, 00 - 193 Warszawa) Informacja o wymogu podania danych Podanie przez Państwa danych osobowych w zakresie wynikającym z art. 221 Kodeksu pracy jest niezbędne, aby uczestniczyć w postępowaniu rekrutacyjnym. Podanie przez Państwa innych danych jest dobrowolne.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "zatrudnię do pracy na budowie i w wykończeniach",
      "category": "olx",
      "phone": "501080564",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "zatrudnię do prac na budowie i przy wykończeniach wnętrz praca stała wynagrodzenie wypłacane co tydzień bez zaległości 20-28 zł h w zależności od umiejętności dowóz z ząbek i z pod macro targówek zapewniam własnym transportem . zainteresowane osoby proszę o telefon 501 080 564",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Kierowca",
      "category": "olx",
      "phone": "502310043",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Piekarnia w pod warszawskich Łomiankach zatrudni kierowcę do jazdy w rannych godzinach.Kontakt telefoniczny 502310043",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Sprzątanie lokali mieszkalnych Targówek, Ząbki 5 dni w tyg NA STAŁE",
      "category": "olx",
      "phone": "536392005",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię Panią do sprzątania lokali mieszkalnych na terenie Ząbek oraz Targówka. Wymagane prawo jazdy kat. B\nPraca od poniedziałku do piątku od 8 do 16.\n\ntel: 536392005",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię brukarzy i pomocników",
      "category": "olx",
      "phone": "661260671",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Witam. Tak jak w tytule zatrudnię brukarzy i pomocników. Praca na terenie Ząbek, Wołomina i Warszawy. Więcej informacji pod nr. 661.260.671. Kontak wyłącznie telefoniczny",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik budowlany",
      "category": "olx",
      "phone": "507436719",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię pracowników budowlanych, prace fizyczne, remontowe, rozbiórki, izolacje. Niepijacy, może być z zakwaterowaniem. Prawo jazdy.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Osoba do sprzątania szkoły",
      "category": "olx",
      "phone": "227624044",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Szkoła Katolicka w Ząbkach zatrudni dwie osoby do sprzątania. Praca od września 2021r na pełny etat. Mile widziane osoby z doświadczeniem pracy w szkole. Osoby zainteresowane prosimy o przesłanie swojej aplikacji. Kontakt 22 7624044.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca Kurier Rejon Otwock zą",
      "category": "olx",
      "phone": "793366399",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukuję do pracy na stanowisko :Kurier DPD REJON OTWOCK Miejscie pracy : \nBaza : Warszawa DPD Matuszewska",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Ищем мастера маникюра",
      "category": "olx",
      "phone": "691285951",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "В кабинет в Зомбках ( Ząbki) требуется мастер маникюра.\nРасходники, автоклав, возможности  развития. Рабочий день 8-12 часов( зависит от графика), гибкий график. Больше информации по телефону. Оплата в конце каждого дня или недели. Umowa zlecenie na okres próbny. Po okresie próbnym umowa o pracę\nОт кандидата требуется умение делать маникюр комби, наращивание ногтей, педикюр.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Kierowca do cateringu",
      "category": "olx",
      "phone": "602197371",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Bar bistro w Ząbkach szuka kierowcy do rozwożenia posiłków. Kontakt: Dominika Modzelewska, tel. 507 756 257.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Księgową/Księgowego do Biura Rachunkowego w Ząbkach",
      "category": "olx",
      "phone": "513106625",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię księgową/księgowego do biura rachunkowego w Ząbkach. Wymagania: znajomość pełnej księgowości/KPiR/ryczałtu. Mile widziana znajomość programów: Sage FK Symfonia 50c, WF-Kaper. Tryb pracy w większości stacjonarny. W odpowiedzi na ogłoszenie proszę podać doświadczenie zawodowe w księgowości.\n\nProszę o przesyłanie CV z uwzględnieniem miejsca zamieszkania i umiejętności obsługi powyższych programów. Proszę też o deklarację zakresu oczekiwanego wynagrodzenia.\n\nZakres obowiązków:\n\nkompleksowa obsługa podmiotów - księgi handlowe/KPiR/ryczałt\nksięgowanie dokumentów w programach księgowych i na platformie internetowej\npomoc przy sporządzaniu sprawozdań finansowych, bilansów, \nkontrola dokumentów księgowych pod względem prawnym i formalnym\nkontakt mailowy i telefoniczny z klientami Biura Rachunkowego\nkontakt z urzędami\n\nZapraszam do aplikacji, również do kontaktu telefonicznego.\n\nRobert Przychodzeń",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Niani do dwójki dzieci (1,5 i 3 lata). od zaraz",
      "category": "olx",
      "phone": "667081448",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Poszukuję Niani do dwójki dzieci (1,5 i 3 lata). Dwoje rezolutnych maluchów. Do obowiązków będzie należało podanie i przygotowanie posiłku, zabawa, spacery, drzemki,\n\nZąbki tel. 667-081-448 jeśli nie odbieram poproszę sms lub wiadomość w OLX. \n\nWynagrodzenie do ustalenia.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca w przyczepie gastronomicznej z pączkami, lodami i goframi",
      "category": "olx",
      "phone": "530265620",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnimy młode, otwarte i odpowiedzialne osoby do pracy w całorocznej przyczepie gastronomicznej przy Centrum Handlowym Ursynów w Warszawie.\n\nOferujemy: \n\n17 - 19 PLN netto za godzinę + premie\nszkolenie i wsparcie w pierwszych dniach pracy\n\nZakres obowiązków:\n\nSmażenie pączków, obsługa maszyny do lodów, przygotowywanie deserów na bazie lodów, serwowanie napojów zimny i ciepłych.\nSprzedaż wyżej wymienionych produktów i obsługa klientów.\n\nWymagania:\n\nksiążeczka sanitarno-epidemiologiczna,\ndoświadczenie w pracy na podobnym stanowisku nie jest wymagane, ale mile widziane :)\ndyspozycyjność w tygodniu jak również w weekendy\ndbałość o czystość w miejscu pracy\npozytywne nastawienie\n\nOsoby zainteresowane prosimy o wysłanie CV wraz ze zdjęciem!",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Zatrudnię Kierowce kategoria kat D Kierowca autokaru autobusu busa",
      "category": "olx",
      "phone": "606355834",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię kierowcę kat. D\nTrasy po kraju. Pojedyncze kursy lub stała współpraca. \nWięcej informacji udziele telefonicznie 606355834",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca na terenie osiedli mieszkaniowych",
      "category": "olx",
      "phone": "508195243502259755601501931",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma zatrudni Panie i Panów do sprzątania wewnątrz budynków,teren zewnętrzny oraz garaż osiedli mieszkaniowych na terenie\n\nDolny Mokotów tel 502-259-755 P. Joanna\n\nBemowo - tel 508-195-243 P. Iwona\n\nOchota - tel 508-195-243 P. Iwona\n\nWilanów - tel 601-501-931",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Przedszkole zatrudni kucharza",
      "category": "olx",
      "phone": "531982998",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Publiczne Przedszkole w Ząbkach zatrudni kucharza/kucharkę  lub pomoc kucharza z doświadczeniem, mile widziane doświadczenie w żywieniu zbiorowym oraz umiejętność poprowadzenia kuchni samodzielnie.\n\nPoszukujemy osób energicznych, chętnych do pracy i obowiązkowych.\n\nWynagrodzenie odpowiednie do posiadanych umiejętności.\n\nProszę o przesyłanie CV.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca! Sprzedawca na stoisko z truskawkami",
      "category": "olx",
      "phone": "787431550",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Zatrudnię osobę do sprzedaży truskawek na straganie w Ząbkach (blisko stacji PKP).\n\nGodziny i dni pracy do ustalenia.\n\nStawka 16-17zł/h",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Konsultant telefoniczny Call Center",
      "category": "olx",
      "phone": "666609022",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Twój zakres obowiązków:\n\n• pierwszy kontakt z zainteresowanymi klientami z codziennie aktualizowanej bazy\n• utrzymywanie pozytywnych relacji z klientami\n• umawianie klientów na spotkania z doradcami\n• dbanie o jakość obsługi klientów\n• odpowiedzialność za profesjonalny wizerunek organizacji\n• przestrzeganie standardów obowiązujących w organizacji ze szczególnym uwzględnieniem standardów obsługi klient\n \n\n \nNasze wymagania:\n \n• doświadczenie w telefonicznej obsłudze klienta\n• doskonała znajomość języka polskiego w mowie i w piśmie\n• wysoka kultura osobista i swoboda w rozmowie telefonicznej\n• pozytywne nastawienie i łatwość nawiązywania kontaktu\n• nastawienie na realizacje celów\n• bardzo dobra organizacja pracy i duże zaangażowanie w powierzone obowiązki\n• dobra znajomość obsługi komputera (pakiet MS Office)\n• mile widziane zainteresowanie OZE i/lub chęć rozwoju w tym obszarze\n \n \nTo oferujemy:\n\n• atrakcyjne zarobki – podstawa oraz jasny system premiowy\n• jasno zdefiniowane cele, możliwość poszerzania kompetencji oraz awansu\n• możliwość realizacji własnych pomysłów\n• wsparcie przełożonego, od którego wiele się nauczysz\n• pracę w najbardziej rozwojowej branży w Polsce",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca w sklepie- kawiarni w Ząbkach",
      "category": "olx",
      "phone": "665307211",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Do sklepu- kawiarni w Ząbkach przyjmę młoda, dynamiczna osobę z doświadczeniem w pracy w kawiarni. \nW naszym sklepie sprzedajemy wyroby naturalne, bez konserwantów, szukamy osoby która umie przygotować gofry, desery lodowe, soki wyciakane i potrafi przygotować kawę z ekspresu kolbowego. \nWażne jest dla nas pozytywne usposobienie i chęć do pracy. \nStawka godzinowa plus premia przy dobrych obrotach sklepu. \nProsimy o Cv ze zdjęciem.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Manager do restauracji w Ząbkach",
      "category": "olx",
      "phone": "500310454",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Do zespołu restauracji Arena w Ząbkach poszukujemy managera z doświadczeniem. \n\nOferujemy atrakcyjne warunki oraz umowę o pracę.\n\nOsoby zainteresowane prosimy o wysłanie CV bądź o kontakt pod nr tel. 500-310-454.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Praca przy remontach",
      "category": "olx",
      "phone": "692414140",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Dam pracę w firmie remontowo-budowlanej. \n\nPraca w Warszawie i okolicach.\n\nZatrudnienie na umowę o pracę, pełen etat.\n\nWymagania: prawo jazdy kat. B oraz min.dwa lata pracy w branży budowlanej.\n\ntel. kontaktowy \n\n692 414 140",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Pracownik ds. obsługi sklepu internetowego – pakowanie zamówień",
      "category": "olx",
      "phone": "501141798",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Sklep internetowy z nową odzieżą damską i męską www.mystiqbutik.pl\n\nMagazyn sklepu znajduje się w Ząbkach pod Warszawą\n\nSzukamy na to stanowisko kobiety .\n\nDO TWOICH ZADAŃ NALEŻEĆ BĘDZIE:\n\npakowanie skompletowanych zamówień (odzież i akcesoria),\nobsługa klienta mailowa i telefoniczna\nprzyjmowanie i kontrola dostaw ( rozpakowanie towaru , rozwieszenie , zliczenie , dodanie na stan magazynowy )\ndbanie o porządek na stanowisku pracy,\nudział w inwentaryzacji\n\nOD KANDYDATA OCZEKUJEMY:\n\nMile widziane doświadczenie na podobnym stanowisku , jeśli jednak go nie posiadasz, ale spełniasz poniższe oczekiwania - wszystkiego Cię nauczymy :) \n\ndokładności i rzetelności,\ndobrej organizacji pracy,\nzdolności manualnych,\nszybkości w działaniu,\npozytywnego nastawienia\nswobodnego prowadzenia rozmów telefonicznych\ndyspozycyjności do pracy w pełnym wymiarze godzin, od poniedziałku do piątku;\ndużej samodzielności\nchęci do pracy i gotowości do nauki\ngotowość do podjęcia pracy od zaraz\n\nOFERUJEMY:\n\numowę o pracę lub inną formę umowy - do ustalenia ( na okres próbny umowa zlecenie )\npraca od poniedziałku do piątku (40h tyg.) 8-16\nmożliwość rozwoju,\nprzyjazną atmosferę,\n\nOFERUJEMY:\n\nWynagrodzenie zależne od doświadczenia i posiadanych umiejętności ( podane widełki wynagrodzenia oznaczają kwotę brutto )\nBardzo ciekawe i rozwojowe stanowisko\nZatrudnienie w stabilnej firmie, umowa o pracę\nRabaty pracownicze",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Poszukujemy fryzjera i pomoc fryzjerską.",
      "category": "olx",
      "phone": "502614135",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Studio Urody Kameleon zatrudni fryzjera i pomoc dla fryzjera .Salon istnieje 15 lat.Posiadamy bardzo dużą bazę klientów.Praca w fajnym zespole.Zapewniamy fryzjerom bezpłatne szkolenia,elastyczne godziny pracy. Poszukujemy pracowników od zaraz.Proszę o kontakt telefoniczny 502614135.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Poszukujemy pracownika",
      "category": "olx",
      "phone": "48570004005",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Firma Tomplast w Ząbkach pod Warszawą poszukuje doświadczonego, ambitnego pracownika operatora i programistę CNC. Jesteśmy firmą działającą od 1978 roku. Celem firmy jest pomoc osobom niepełnosprawnym i rozwój rynku ortopedycznego.\n\nPosiadamy tokarkę CNC z automatycznym podajnikiem prętów z oprogramowaniem sterującym FANUC plus oprawki napędzane orac centrum obróbcze 4,5 osi (podzielnica)/frezarka z magazynem na 30 narzędzi całość zarządzana oprogramowaniem sterującym HEIDEHEIN. Podstawowym warunkiem zatrudnienia jest znajomość sterowania FANUC i HEIDEHEIN oraz doświadczenie zawodowe minimum 2 lata i umiejętność pracy w zespole.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    },
    {
      "id": "",
      "name": "Budowlaniec/Cieśla do Szwecji",
      "category": "olx",
      "phone": "698947095",
      "email": "",
      "consumption": "",
      "owner": "damian.wasiak",
      "city": "Ząbki",
      "street": "",
      "streetNumber": "",
      "postalCode": "",
      "description": "Pracownik ogolno budowlany/Cieśla .\nZakres obowiązków :\n-konstrukcje drewniane\n-dachy\n-ścianki dzialowe\n-hydraulika\n-malowanie\n-plytki\n-znajomość elektryki\n-pracę budowlane\n\nPraca na 4mc z możliwością przedłużenia.\nZakwaterowanie, przejazdy po mojej stronie.\nPraca dla dwóch ludzi.\nZnajomość języka angielskiego w stopniu komunikatywnym chociaż jedna osoba.\nWyjazd od zaraz.\nWięcej informacji odnośnie wyjazdu podam przez telefon.",
      "tasks": [],
      "status": "potencjalny",
      "www": ""
    }
  ];




// koniec baza do dodania




//dodawanie klientów hurt

router.get('/add-client-mass/', async (req, res, next) => {
    let numberIndex = 0;
    let clients = [];

    await clientsready.find({}, (err, data) => {
        if (err) console.log(err);
        clients = data;
    }).then(async () => {
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
                const isClientInDb = clients.findIndex(client => client.id == id);
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

module.exports = router;