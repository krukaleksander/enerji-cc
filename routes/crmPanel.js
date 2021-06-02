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
        "name": "Księgowa do Biura Rachunkowego - Praga Północ blisko metra",
        "category": "olx",
        "phone": "513513659",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Opis stanowiska : Księgowa \n\nJeśli chcesz pracować w dynamicznym środowisku świadczącym usługi outsourcingu księgowości oraz  zdobywać doświadczenie księgowe- aplikuj i dołącz do zespołu!\n\nOferujemy: \n\n umowę o pracę na pełen etat ,\n\n atrakcyjne wynagrodzenie zależne od umiejętności \n\n interesującą, pełną wyzwań pracę w nowoczesnym i dynamicznie rozwijającym się biurze,\n\n pracę w dobrej lokalizacji (Port Praski)\n\nZadania :\n\nsamodzielne prowadzenie księgowości klientów na księgach rachunkowych (pełna księgowość)\n\nsporządzanie deklaracji podatkowych (VAT, PIT,CIT) oraz  raportów na potrzeby Klientów oraz dla instytucji zewnętrznych (US, ZUS, GUS)\n\newidencjonowanie i kontrola majątku trwałego Klientów\n\ndekretowanie i księgowanie dokumentów\n\npotwierdzanie i uzgadnianie sald z kontrahentami\n\nodpowiedzialność za stan dokumentacji księgowej oraz jej archiwizację\n\nzapewnienie zgodności dokumentacji księgowej, procedur księgowych, ksiąg rachunkowych, sprawozdań oraz raportów finansowych z ustawą o rachunkowości i przepisami podatkowymi,\n\nkontakt z Klientami firmy oraz  z organami podatkowymi (US)\n\nnadzorowanie właściwego obiegu, kompletowania, przechowywania i archiwizacji dokumentów księgowych\n\nOczekujemy :\n\nminimum 3 letnie na samodzielnym stanowisku\n\nbiegła znajomość j. polskiego \n\nbardzo dobra znajomość programu WAPRO FAKIR \n\nznajomość MS Office w szczególności Excel\n\nbardzo dobrej znajomości przepisów ustawy o rachunkowości oraz obowiązujących przepisów podatkowych, umiejętności stosowania ich w praktyce,\n\nwykształcenia wyższego kierunkowego- mile widziane,\n\nniezależności i samodzielności w podejmowaniu decyzji,\n\nwysokich umiejętności komunikacyjnych\n\nProszę o zawarcie w CV klauzuli:\n\nWyrażam zgodę na przetwarzanie moich danych osobowych przez Solvis sp z o.o. Wrzesińska 12/21 , 03-713 Warszawa  w celu prowadzenia rekrutacji na aplikowane przeze mnie stanowisko.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnię murarzy",
        "category": "olx",
        "phone": "883067040",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Pilnie zatrudnię murarzy oraz brygady. Praca przy phoroterm 8,12, 18, 24 oraz silikat 12,18. Budynki mieszkalne kilkukondygnacyjne. Oferuję 32 zł/m2. Praca na terenie Warszawy oraz w Piasecznie.\n\nPłatność w każdy piątek 70%. Wyrównanie w trzecim tygodniu.\n\nZapewniam ciągłość pracy.\n\nTel. 883 067 040",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Skorzystaj z biznesowej szansy i poprowadź sklep Żabka! Praga Północ!",
        "category": "olx",
        "phone": "502168001",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Skorzystaj z biznesowej szansy i poprowadź sklep Żabka!\n\n22 lat doświadczenia\n\n7000 sklepów w Polsce\n\n6000 Franczyzobiorców\n\n2 miliony klientów dziennie\n\nJesteśmy pewnym partnerem w prowadzeniu biznesu.\n\nCo gwarantujemy?\n\n• Przez pierwsze 12 m-cy przychód nie będzie niższy niż 16 tys. netto- bez względu na osiągany obrót\n\n• Dodatkowo możesz uzyskać przychód za realizację celów sprzedażowych oraz inne premie i świadczenia\n\n• Otrzymasz nowoczesny sklep w dobrej lokalizacji, którą wspólnie ustalimy\n\n• Stałe będziesz pod opieką Partnera Biznesowego\n\n• Otrzymasz bezpłatny system szkoleń przygotowujących do prowadzenia sklepu- opieka szkoleniowa trwa również po otwarciu sklepu\n\nNasze oczekiwania:\n\n• Kompleksowe zarządzanie sklepem zgodnie ze standardami Sieci\n\n• Pełne zaangażowanie w rozwój sprzedaży\n\n• Umiejętność kierowania swoim personelem\n\n• Odpowiedzialność za prawidłowość rozliczeń\n\n• Znajomość obsługi komputera\n\nNasze wymagania:\n\n• Gotowość do prowadzenia własnej działalności gospodarczej\n\n• Brak zaległości kredytowych- pełnomocnictwo do weryfikacji BIG i KRD\n\n• Zabezpieczenie powierzonego mienia ustanowionego w formie weksla z 1 poręczycielem lub kaucji, lub gwarancji bankowej\n\n• Wkład finansowy na poziomie 5 tys. zł (przeznaczony na zakup drukarki fiskalnej, zatowarowanie we własne produkty regionalne i koncesję-która jest w pełni refundowana po 3 miesiącach)\n\nOd czego zacząć? Nasza oferta franczyzowa skierowana jest zarówno do osób posiadających doświadczenie w handlu, jak i nowych przedsiębiorców na rynku. Umów się na spotkanie informacyjne z naszym Przedstawicielem, na którym poznasz szczegóły.\n\nProszę załączyć CV.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kierowca kurier poczta polska",
        "category": "olx",
        "phone": "695121831",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukuje Osoby do rozwozenia przesylek, ponizej kilka kryterii ktore musisz spelniac zebysmy sie dogadali, jesli nie spelniasz ktoregos z nich to nie pisz i nie dzwon bo szkoda naszego czasu.\n- prawo jazdy kat B czynne\n- sumiennosc \n- dyspozycyjnosc (takze w soboty w okresach przedswiatecznych) \n- punktualnosc \n- odpowiedzialnosc \n- checi do pracy z ludzmi\n- niekaralnosc\n-umiejetnosc kierowania autem dostawczym typu vw crafter max dlugi blaszak\nW zamian oferuje:\n- wynagodzenie od 3000zl do 6500zl\n- umowa badz zlecenie\n- mila atmosfere\n- staly rejon rozwozonych przesylek\n- mozliwosc dlugiej wspolpracy\n- telefon sluzbowy\nMile widziane doswiadczenie w branzy kurierskiej i jazdy autem dostawczym po Warszawie. Jestes Kobieta i tez chcesz pracowac poprostu tez pisz.Jesli nie masz doswiadczenia a czujesz sie na silach albo masz to zapraszam do kontaktu pod nr tel 695121831 ja odpisze albo oddzwnie w wolnej chwili.\nWystarczy napisac wiadomosc sms kila slow o sobie min:\n- imie\n-wiek\n- staz za kolkiem\n- jakies zainteresowania hobby itpd",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pracownik magazynu - sortowanie przesyłek POST NL",
        "category": "olx",
        "phone": "48661501401",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Przebywasz obecnie w Holandii i poszukujesz pracy?!\n\nMamy oferty właśnie dla Ciebie. Aplikuj już teraz!\n\noferujemy\n\npracę za pośrednictwem największych agencji pracy w Holandii: Randstad oraz Tempo-Team\nopłata za zakwaterowanie 104 euro/tydzień oraz 24,60 euro/tydzień ubezpieczenie\ndojazd do pracy samochodem służbowym (z możliwością użytkowania do celów prywatnych)\nwynagrodzenie 10,44 euro brutto na godzinę + dodatki zmianowe\nopieka polskojęzycznego koordynatora na miejscu\n\nzadania\n\nsortowanie paczek oraz przesyłek\nukładanie towarów\nzaładunek oraz rozładunek produktów\n\noczekujemy\n\ndyspozycyjność do wyjazdu za granicę na min 8 tygodni\ndoświadczenie w pracy na produkcji jako dodatkowy atut\ndoświadczenie w pracy w Holandii jako dodatkowy atut\nkomunikatywnej znajomości j. angielskiego \nprawo jazdy kat. B mile widziane\n\n﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿Agencja zatrudnienia – nr  wpisu 47",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kierowca kat \"C\" praca dodatkowa Janki",
        "category": "olx",
        "phone": "888400055",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma transportowa zatrudni pracownika na stanowisku kierowca kat. C\n\nPraca dodatkowa 2 - 4h w godzinach wieczornych.\n\n \n\nOpis stanowiska:\n\n- praca w charakterze kierowcy kat. C\n\n- dystrybucja lokalna\n\n- auto przypisane do kierowcy\n\n \n\nWymagania:\n\n- prawo jazdy kategorii C\n\n- doświadczenie w transporcie\n\n- sumienność i dbałość o narzędzia pracy\n\n- uczciwość\n\n- niekaralność\n\n \n\nOferujemy:\n\n- atrakcyjne wynagrodzenie\n\nOsoby zainteresowane proszę o kontakt telefoniczny.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kierowca kat C warszawa praga lub raszyn",
        "category": "olx",
        "phone": "508608611",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię Kierowcę kategoria C z uprawnieniami\n\nPraga Północ LUB Raszyn pod Warszawa\n\npraca pon-pt\n\npensja podstawowa to 3500 zl netto plus prowizja\n\nProszę o kontakt telefoniczny 508608611",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Operator Koparko-Ładowarki",
        "category": "olx",
        "phone": "888914161",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma ALBLU Sp. z o.o. zatrudni operatora koparko ładowarki\n\nWymagania: \n\n- uprawnienia do obsługi wybranego sprzętu\n\n- doświadczenie \n\n- odpowiedzialność, rzetelność\n\nOferujemy:\n\nzatrudnienie na umowę o pracę\natrakcyjne wynagrodzenie,\nprzyjazną atmosferę pracy.\npakiet medyczny\ndodatkowe ubezpieczenie na życie",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Работник Производства UA",
        "category": "olx",
        "phone": "48605131868",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Вам интересно, как выглядит производство майонеза, горчицы и соусов? Хотели бы вы работать в хорошей команде?  У нас есть предложение для вас! Для нашего клиента компании FMCG-индустрии ищем кандидатов на работу: роботники на производство / упаковщики -  в Варшаве, Praga Północ\n\nМы подготовили пакет льгот Randstad Plus для наших временных сотрудников. Откройте для себя ПРЕИМУЩЕСТВА работы с Randstad! Узнайте больше на www.randstad.pl/k Candidat / randstad-plus /\n\nпредложение / oferujemy\n\nпочасовая оплата 17-18 злотых / час брутто\numowa o pracę (ZUS, отпуск, льготы),\nвозможность получить опыт работы\nпривлекательный пакет льгот (частное медицинское обслуживание, спортивная карта)\nделаем zezwolenie o pracę, на основе которого можно получить карту побыту или годовую национальную визу.\n\nзадача / zadania\n\nупаковка продукции в картонные коробки\nпогрузка готовой продукции на поддоны\nпомощь в обслуге линии (складирование поддонов, наклеивание этикеток, прием их в систему, печать этикеток - после предварительного обучения)\nобслуживание конвееров\nработа со сканером\nпроверка качества изготовленной продукции\n\nожидаем / oczekujemy\n\nкнижка санэпид \nмануальные способности\nготовность к работе в трехсменной системе (6-14; 14-22; 22-06)\nмотивация к работе\nумение работать в коллективе\n\n﻿﻿﻿﻿Agencja zatrudnienia – nr  wpisu 47\n\nАгентство занятости - номер записи 47",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pomocników Budowlanych",
        "category": "olx",
        "phone": "533383531",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię pomocników budowlanych przy rozbiórce dachu oraz przy robotach remontowych. Praca w stabilnej, uczciwej Firmie. Proszę o kontakt pod nr tel. 533 383 531",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnię elektryków i pomocników z doświadczeniem",
        "category": "olx",
        "phone": "510972994",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię elektryków i pomocników z minimum rocznym doświadczeniem. Praca na budowach w Warszawie mieszkaniowych i usługowych tel 510972994",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Order Picker - Magazyn H&M - Tilburg - od zaraz - od 10.61€",
        "category": "olx",
        "phone": "31639030525",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "W obecnej sytuacji zatrudniamy tylko i wyłącznie osoby znajdujące się na terenie Holandii !\n\nPoszukujemy nowych współpracowników dla magazynu H&M do różnych działów, jak kompletacja, pakowanie lub zwroty zamówień. Preferujemy osoby, które są elastyczne i mogą pracować na 3 zmiany.\n\nW obecnej sytuacji pandemicznej możemy zatrudniać kandydatów, przebywających na terenie Holandii!\n\n \n\nChodzi o prace z ubraniami , więc nie trzeba podnosić nic ciężkiego. Podczas pracy się stoi / chodzi.\n\n \n\nPraca jest tylko długoterminowa.\n\nWymagana komunikacja w języku angielskim !\n\n \n\nPraca na na 3 zmiany. Wynagrodzenie podstawowe : 10,61€ brutto\n\nDopłaty za zmiany od 25 - 100%\n\n \n\nZakwaterowanie jest zapewnione.\n\n ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Szlifierz Aluminium/ Pracownik Odlewni - od 15.42€",
        "category": "olx",
        "phone": "421915395436",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Doświadczenie jest wymagane, jeśli nie ma panstwo komunikatywnego języka angielskiego / niemieckiego.\n\nCzyszczenie, szlifowanie, piłowanie i wiercenie elementów aluminiowych dla przemysłu samochodowego oraz grzewczego. Wkładanie rdzeni lub innych produktów do formy przed zalaniem( praca w odlewni)  Wkładanie rdzeni lub innych produktów do formy przed zalaniem. Przetwarzanych jest wiele małych i dużych części.\n\nPraca na 3 zmiany. Gwarancja pracy min. 37,5 h godzin tygodniowo.\n\n! Prosze wyslac AKTUALNE CV ! \n\nWynagrodzenie:\n\n15.42€/brutto na godzinę ( 3 zmiany)\n\n18.01 €/brutto na godzinę ( Sobota oraz nadgodziny! )\n\nW obecnej sytuacji pandemicznej możemy zatrudnić kandydatów przyjeżdżających do Holandii z negatywnym wynikiem testu PCR. Zapewniamy również 5-dniową kwarantannę po przyjeździe\n\nOferujemy:\n\n- holenderska umowa o prace\n\n- tygodniowe wynagrodzenie (wymagane posiadanie własnego konta bankowego)\n\n- 24 dni płatnego urlopu w ciągu roku\n\n- zapewnione zakwaterowanie\n\n- transport do / z pracy samochodami służbowymi\n\n- pomoc polskiego koordynatora przy załatwianiu potrzebnych dokumentów w Holandii \n\n ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca na magazynie w sklepie komputerowym",
        "category": "olx",
        "phone": "516489968",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Jako serwis i sklep komputerowy prowadzimy dwa salony w Warszawie: na Pradze oraz Bemowie\n\nZajmujemy się sprzedażą laptopów, komputerów stacjonarnych oraz drukarek.\n\nObecnie poszukujemy pracownika magazynu do sklepu na Bemowie.\n\nPraca od poniedziałku do piątku godzinach 10-18 jedna sobota w tygodniu 11-15\n\nWymagania:\n\n- znajomość budowy komputerów stacjonarnych oraz laptopów\n\n- znajomość systemów operacyjnych Windows\n\n- zdolności manualne\n\n- elementarna wiedza techniczna\n\nPraca wiąże się z przygotowaniem sprzętu do wysyłki na podstawie zamówienia klienta. Polega na skonfigurowaniu sprzętu, przeczyszczeniu go, zapakowaniu w karton.\n\nNa tym stanowisku będziesz odpowiedzialny za:\n\n- Przetestowanie i skonfigurowanie sprzętu komputerowego\n\n- Pakowanie przesyłek\n\n- Diagnozowanie uszkodzonego sprzętu\n\n- Czyszczenie sprzętu komputerowego\n\nOferujemy:\n\n- Atrakcyjne wynagrodzenie\n\n- elastyczne godziny pracy\n\n- pracę w luźnej atmosferze\n\nProsimy o przesyłanie CV - praca od zaraz.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pracownik ochrony - wspólnota mieszkaniowa - Warszawa (Praga-Północ)",
        "category": "olx",
        "phone": "667985146",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Wspieramy aktywizację osób z ograniczoną sprawnością. W związku z tym zakład pracy chronionej poszukuje osoby z orzeczeniem o niepełnosprawności na stanowisko pracownika ochrony fizycznej.\n\nMiejsce pracy: Warszawa (Praga-Północ) - wspólnota mieszkaniowa\n\nZakres obowiązków:\n\nOchrona powierzonego mienia\nEwidencja ruchu osobowego\nWydawanie kluczy\n\nWymagania:\n\nNiekaralność\nKomunikatywność\nDyspozycyjność\nWysoka kultura osobista\n\nOferujemy:\n\nStabilne zatrudnienie w oparciu o umowę o pracę\nPełne umundurowanie\nTerminową realizację świadczeń wynikających z umowy\nWdrożenie stanowiskowe oraz opiekę przełożonego\n\nZainteresowanych zachęcamy do aplikowania przez portal. W przypadku pytań zapraszamy do kontaktu telefonicznego.\n\nZłożenie dokumentów aplikacyjnych na wskazane w ogłoszeniu stanowisko stanowi wyrażenie zgody na przetwarzanie Pani/Pana danych osobowych w toku postępowania rekrutacyjnego, w którym Pani/Pan aplikuje.\n\nW przypadku zgody na udział w innych procesach rekrutacyjnych prosimy dodatkowo o umieszczenie poniższej klauzuli:  \n\n Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w dokumentach aplikacyjnych przez Solid Sp. z o. o.  z siedzibą w Krakowie ul. Tyniecka 18 w celu przeprowadzenie kolejnych procesów rekrutacyjnych na inne stanowiska pracy w spółce Solid Sp. z o. o. \n\n Klauzula Informacyjna\n\n 1. Administratorem Pani/Pana danych osobowych jest Solid Sp. z o. o. („ADO”)\n\n Dane kontaktowe: ul. Tyniecka 18, Kraków. ADO powołał Inspektora Ochrony Danych, z którym może się Pani/Pan skontaktować za pośrednictwem poczty elektronicznej, adres e-mail Inspektora Ochrony Danych: iod.solidkrakow[at]solidsecurity.pl.  \n\n 3. Państwa dane osobowe w zakresie wskazanym w przepisach prawa pracy będą przetwarzane w celu przeprowadzenia obecnego postępowania rekrutacyjnego, natomiast inne dane, w tym dane do kontaktu, na podstawie zgody, która może zostać odwołana w dowolnym czasie.\n\n ADO będzie przetwarzała Państwa dane osobowe, także w kolejnych naborach pracowników jeżeli wyrażą Państwo na to zgodę, która może zostać odwołana w dowolnym czasie.\n\n Jeżeli w dokumentach zawarte są dane, o których mowa w art. 9 ust. 1 RODO konieczna będzie Państwa zgoda na ich przetwarzanie, która może zostać odwołana w dowolnym czasie.\n\n 4. Odbiorcami Pani/Pana danych osobowych mogą być: podmioty, które na podstawie stosownych umów podpisanych z ADO przetwarzają dane osobowe dla których administratorem danych osobowych jest ADO, tj. m.in. agencje pracy, firmy księgowe, kancelarie prawne oraz dostawcy usług IT.\n\n 5. Państwa dane zgromadzone w obecnym procesie rekrutacyjnym będą przechowywane do zakończenia procesu rekrutacji.\n\n W przypadku wyrażonej przez Państwa zgody na wykorzystywane danych osobowych dla celów przyszłych rekrutacji, Państwa dane będą wykorzystywane przez 12 miesięcy. \n\n 6. Mają Państwo prawo do:\n\n- dostępu do swoich danych oraz otrzymania ich kopii\n\n- sprostowania (poprawiania) swoich danych osobowych;\n\n- ograniczenia przetwarzania danych osobowych;\n\n- usunięcia danych osobowych;\n\n- do wniesienia skargi do Prezes UODO (na adres Urzędu Ochrony Danych Osobowych, ul. Stawki 2, 00 - 193 Warszawa).\n\nW zakresie w jakim Pani/Pana dane osobowe przetwarzane są na podstawie udzielonej przez Panią/Pana zgody, ma Pani/Pan prawo cofnąć udzieloną zgodę w dowolnym momencie, bez wpływu na zgodność z prawem przetwarzania, którego dokonano na podstawie zgody przed jej cofnięciem.\n\n 7. Podanie przez Państwa danych osobowych w zakresie wynikającym z art. 221 Kodeksu pracy jest niezbędne, aby uczestniczyć w postępowaniu rekrutacyjnym. Podanie przez Państwa innych danych jest dobrowolne.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pracownik Administracyjno- techniczny",
        "category": "olx",
        "phone": "500377264",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "PRACOWNIK ADMINISTRACYJNO - TECHNICZNY\n\nPoszukujemy pracownika z wiedzą i instynktem technicznym nastawionym na realizację postawionych zadań - „złota rączka”.\n\nOpis stanowiska\n\n- aktywna organizacja prac związanych z bieżącymi pracami administracyjnymi\n\n- prace konserwacyjne oraz serwisowe w biurze\n\n- drobne prace instalacyjne i remontowo budowlane\n\n- nadzór nad stanem technicznym wyposażenia biura\n\n- drobne naprawy urządzeń i wyposażenia biura\n\nWymagania\n\n- prawo jazdy \n\n- dyspozycyjność\n\n- wysoki poziom samodzielności i inicjatywy\n\n- umiejętność organizacji pracy własnej\n\n- umiejętność posługiwania się arkuszem kalkulacyjnym i edytorem tekstu\n\n- umiejętność poszukiwania, gromadzenia i przetwarzania informacji\n\nZgłoszenia wraz z CV proszę przesyłać przez formularz OLX",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnie murarzy , brygady .",
        "category": "olx",
        "phone": "509138913",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma CemBud zatrudni murarzy samodzielnych , oraz brygady murarzy . Praca  w Warszawie  . Więcej informacji udzielę telefonicznie 509138913",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Stylistka paznokci Do salonów Black Cat w Warszawie",
        "category": "olx",
        "phone": "570636258",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Jeżeli chcesz dołączyć do najszybciej rozwijających się salonów, młodego zespołu z ogromną wiedzą i umiejętnościami to zapraszamy!!! \n\nOferujemy:\nUmowa zlecenie po 3 miesiącach umowa o prace. \nDobre warunki finansowe - podstawa + prowizja + premie \nSzkolenia wewnętrzne oraz możliwość podnoszenia swoich kwalifikacji podczas licznych szkoleń.\nDużą bazę nowości zabiegowych i sprzętów HiTech (plazma azotowa, karboksyterapia, endermologia, fale RF, HIFU, lasery itp.).\nMłody i kreatywny zespół kosmetologów który wesprze Cię na starcie.\n\nOczekujemy:\n\nCo najmniej rocznego doświadczenia. \n\nWykształcenia kierunkowego (dyplom lub legitymacja studencka).\n\nStylizacji paznokci metodą hybrydową, żelową\n\nChęci do pracy i ciągłego rozwoju - pasji i kreatywności.\n\nOtwartości, miłej aparycji i umiejętności pracy z klientem.\n\nMożna bezpośrednio składać CV w salonie i  pod adresem e-mail: [Ukryty adres e—",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Cieśli szalunkowych, murarzy, pomocników od zaraz Wawa",
        "category": "olx",
        "phone": "533329164",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma z wieloletnim stażem na rynku zatrudni pracowników :\n\n-cieśli szalunkowych (od 22 zł/h)\n\n-zbrojarzy (od 22 zł/h) - murarzy (od 22 zł/h)\n\n-pomocników (od 15 zł/h)\n\nPracy poniedziałek- piątek (możliwość pracy w soboty)\n\nLokalizacja - Praga Północ Zaliczki co tydzień\n\nWyrównanie raz w miesiącu Praca od zaraz Więcej informacji udzielę telefonicznie",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kelner/Kelnerka Restauracja Boska Włoska",
        "category": "olx",
        "phone": "600524421",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Do kameralnej, cieszącej się popularnością na Pradze Północ włoskiej restauracji BOSKA WŁOSKA ul Markowska 22 zatrudnimy kelnera/kelnerkę z doświadczeniem.\n\nSzukamy osoby:\n\npracowitej\nsumienne wykonującej swoje obowiązki\nz doświadczeniem w pracy na tym stanowisku \ndyspozycyjnej (praca zmianowa pn-pt 10:00-22:00 sb 8:00-22:00 nd 8:00-21:00)\nuśmiechniętej, lubiącej kontakt z gośćmi restauracji \nszybko uczącej się \n\nOferujemy\n\n14zł/h + wypracowane napiwki\nsystem premiowy\nlunch pracowniczy\nrozwój \nprzyjazną, miłą atmosferę \nelastyczny grafik\n\nPraca od zaraz:)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Warszawa Praga-Bezpośrednio Zatrudnię Do Sklepu Spożywczego",
        "category": "olx",
        "phone": "504490703",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię Bezpośrednio Sprzedawcę Do Sklepu Spożywczego W Warszawie Na Pradze\n\n \n\nOferuję:\n\nFajny zespół,\nGodziwe wynagrodzenie wsparte dodatkami,\nZatrudnienie w dynamicznej polskiej firmie; Szkolenia,\nMożliwość awansu,\nSamodzielne stanowisko;\nProste rozwiązania zatrudnienia.\n\n \n\nW zamian oczekuję:\n\nDobrej organizacji pracy;\nUczciwości i pracowitości;\nChęci do podejmowania wyzwań;\nZaangażowania i pomysłowości.\n\n \n\nMasz Komornika? - Możemy pomóc. Odpowiedzi udzielamy na miejscu na rozmowie kwalifikacyjnej.\n\n \n\nZatrudniam osoby z doświadczeniem w branży spożywczej ale również i te, które z nią nie miały styczności. Proponujemy zatrudnienie osobom zarówno młodym jak i w sile wieku.\n\n \n\nOsoby zainteresowane zapraszam do wysłania CV mailem oraz kontaktu telefonicznego pod numerem 504 490 703",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pracownik restauracji WARSZAWA KONESER PRAGA",
        "category": "olx",
        "phone": "512440049",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Hej Jesteś młody, energiczny ?\n\nMasz doświadczenie w gastronomi a może nie?\n\nSzukasz zajęcia na wakacje albo trochę dłużej ? Lubisz kontakt z ludźmi?\n\nSuper !!!\n\nTo właśnie nas szukasz :-)\n\nProwadzimy rekrutacje do naszej sieci lokali gastronomicznych z kuchnią meksykańska.\n\nOferujemy pracę w Warszawie Koneser PRAGA.\n\nPraca przy bezpośrednim kontakcie z żywością oraz kontakcie z naszymi gośćmi. \n\nNie przejmuj się wszystkiego Cię nauczymy.\n\nPraca polega na przygotowaniu prostych dań typu birrito, quesadilla czy smażenie churros oraz sprzedaży.\n\nCo oferujemy ?\n\n-zatrudnienie na podstawię umowy zlecenie (wymiar godzin zależny od Ciebie czy jesteś dyspozycyjny czy tylko np odpowiada Ci praca weekendowa)\n\n-Przeszkolenie\n\n-Prace w młodym tworzącym się zespole\n\n-Praca od zaraz\n\n-Stawka 18,30 na rękę dla osób ze statusem osoby uczącej się (19,30 DLA PROWADZĄCEGO ZMIANĘ)\n\n-Zniżki pracownicze w całej naszej sieci \n\nCzego oczekujemy?\n\n-Uśmiechu\n\n-Pozytywnej energii\n\n-Statusu ucznia lub studenta (wtedy będziesz zarabiał więcej)\n\n-Zaświadczenia z sanepidu nosicielstwa (wyrobienie tego zajmuje tydzień w sanepidzie i kosztuje 100 złotych)\n\nJeżeli masz jakiś pytanie napisz do mnie :-)\n\nrafal.sanetas(małpa)foodioconcepts.pl\n\nDo zobaczenia !",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Doradca klienta B2B - docelowo Menedżer!!!",
        "category": "olx",
        "phone": "695955900",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Z chęcią zatrudnimy osobę, która w krótkim czasie osiągnie w naszych strukturach awans na menadżera!!! Tak dobrze przeczytałeś/aś w naszej firmie tworzymy menadżerów a nie zatrudniamy. Jeżeli czujesz że w twoim życiu możesz zrobić coś więcej, a w twojej obecnej pracy są ograniczenia które uniemożliwiają ci rozwój to zapraszamy do siebie.\n\nW związku z dynamicznym rozwojem naszej działalności i otwarciem kolejnego biura oraz ogromnym potencjałem wzrostu rynku energetycznego poszukujemy do współpracy kandydatów z woj. Mazowieckiego.\n\nNasze Oczekiwania\n\notwarta głowa  \npredyspozycje handlowe\norientacja na osiąganie wyznaczonych celi \nprzedsiębiorczość, energia, oraz decyzyjność w codziennej pracy,\nznajomość lub gotowość do zdobycia wiedzy z zakresu energii i produktów około energetycznych (mile widziane doświadczenie w sprzedaży B2B / B2C)\nchęć rozwoju i awansów\n\nNaszym Pracownikom Proponujemy\n\nponadprzeciętne zarobki w przedziale 4 - 7 tyś i w pierwszych miesiącach (wysokie prowizje)                                                         \nbezpłatne wsparcie dedykowanego opiekuna,\npakiet szkoleniowy obejmujący wiedzę produktową, sprzedażową (szkolenia warte kilkanaście tyś zł) wszystkiego cię nauczymy,\nnieograniczony dostęp do wewnętrznych narzędzi informatycznych,\nstałe wsparcie centrali w zakresie pozyskiwania klientów,\n\nGwarantujemy\n\nmarkę o ugruntowanej pozycji, rozpoznawalną w całym kraju\npracę w jednej z najszybciej rozwijających się branż w kraju\nniezależności i samodzielności w działaniu\nsprawdzone standardy obsługi klienta\nprodukty renomowanych firm\nwparcie wykwalifikowanego zespołu specjalistów\npracę ze wspaniałymi ludźmi w miłej atmosferze ( brak charakteru korporacyjnego)\n\nOsoby zainteresowane prosimy o przesyłanie CV wraz z zdjęciem.\n\nInformujemy, że skontaktujemy się tylko z wybranymi osobami.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Szukamy masażystek do pracy w salonie masażu i urody",
        "category": "olx",
        "phone": "881932257",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Pracujemy w młodym zespole rehabilitantek i masażystek. Potrzebujemy pomocy w weekendy i poranki głównie. \nPracujemy także w niedziele.\nPłatne jest 50 zł od godziny masażu, niektóre masaże płatne 1/2. \nMile widziane masaże egzotyczne. \nProszę zapoznać się z ofertą na www.beautyandmassage.pl\nPrzyjazna atmosfera. Wspólny czat i wymiana umiejętności. \nChętne osoby zapraszam do kontaktu i spotkania w salonie. \nProszę napisać dostępność i umiejętności poproszę też CV ze zdjęciem. \nSalon mieści się przy Kępna 15 proszę mieszkać niedaleko gdyż głównie mamy osoby które umawiają się na masaże na już (30 min lub godzina do przodu)\nZapraszamy",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "księgowa, kadrowa do biura rachunkowego",
        "category": "olx",
        "phone": "226104083",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "poszukujemy do naszego biura rachunkowego w Warszawie, osoby do prowadzenie KPiR oraz kadr i płac.\n\n \n\nZakres obowiązków\n\nznajomość aktualnych przepisów prawa pracy\numiejętność pracy w środowisku programów księgowych\numiejętność analitycznego myślenia\nbardzo dobra organizacja swoich obowiązków i samodzielność\nprowadzenie dokumentacji i przygotowywanie aktualnych raportów\n\nWymagania: \n\ndoświadczenie w prowadzeniu kpir\ndoświadczenie w prowadzeniu spraw kadrowo-płacowych\npraktyczna znajomość aktualnych przepisów podatkowych\nznajomość pakietu MS Office\nsumienność, dokładność, rzetelność\numiejętność pracy samodzielnej i zespołowej\ndodatkowym atutem będzie doświadczenie w pracy w biurze rachunkowym\n\nForma współpracy:\n\ndowolna umowa: umowa o pracę, umowa-zlecenie, samozatrudnienie\nwymiar czasu pracy: preferowany pełen etat\n\nWynagrodzenie:\n\nproszę o podanie oczekiwań finansowych netto, w wiadomości OLX\n\n﻿Oferujemy:\n\npracę w przyjaznej atmosferze w kameralnym biurze w Warszawie-Rembertów\nstabilne zatrudnienie\nmożliwość rozwoju osobistego i zawodowego\nelastyczne warunki pracy\n\nProszę o przysyłanie zgłoszeń wyłącznie drogą e-mailową oraz dołączenie do aplikacji zgody na przetwarzanie danych osobowych w celu rekrutacji. \n\nUprzejmie informuję, iż skontaktujemy się z wybranymi osobami.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Specjalista ds. Obsługi Klienta (studentka)",
        "category": "olx",
        "phone": "501152829",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Riders Express Sp. z o.o. to operator kurierski z wieloletnim doświadczeniem specjalizujący się w dystrybucji przesyłek i towarów na terenie Warszawy. W chwili obecnej poszukujemy kandydatów na stanowisko:\n\nSpecjalista ds. Obsługi Klienta (studentka)\n\nOpis stanowiska:\n\nobsługa telefoniczna połączeń przychodzących,\nkorespondencja mailowa z kontrahentami w zakresie przyjmowania i realizacji usług,\nwprowadzanie danych do systemu,\nprace biurowe.\n\nWymagania:\n\nzaangażowanie i odpowiedzialność za powierzone zadania,\npozytywne nastawienie i komunikatywność,\nznajomość pakietu MS Office,\npraca zmianowa (8-16/9-17/10-18)\n\nOferujemy:\n\nzatrudnienie na umowę zlecenie,\npracę w miłej atmosferze,\natrakcyjne wynagrodzenie,\nszkolenie wprowadzające,\nwolne weekendy.\n\nZastrzegamy sobie możliwość odpowiedzi tylko na wybrane oferty.\n\nProsimy o dopisanie w CV klauzuli: Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb procesu rekrutacji, zgodnie z ustawą z dnia 29.08.1997 R. o ochronie danych osobowych (tj. Dz. U. Z 2002 nr 101, poz. 926)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Staż w dziale marketingu - Neutrino",
        "category": "olx",
        "phone": "516505500",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Opis\n\nW Neutrino tworzymy skuteczne strategie SEO oraz zajmujemy się marketingiem afiliacyjnym. Do naszego zespołu poszukujemy kreatywnej osoby, która będzie odpowiedzialna za utrzymanie i rozwijanie naszych stron internetowych, szeroko pojętą pracę z treścią oraz współpracę z podwykonawcami :)\n\nObowiązki:\n\n·       zaangażowanie w prowadzone projekty;\n\n·       rozwój portali internetowych – rekomendowanie zmian, analiza konkurencji, doskonalenie serwisu, nadzór nad wdrażaniem zmian;\n\n·       kontakt oraz współpraca z podwykonawcami (copywriterami/web developerami/grafikami);\n\n·       pisanie, sprawdzanie oraz publikacja treści na naszych serwisach internetowych.\n\nWymagania:\n\n·       sprawne poruszanie się w środowisku internetowym (umiejętność researchu na każdy temat);\n\n·       bardzo dobra obsługa komputera;\n\n·       bardzo dobra znajomość MS Excel, MS Word;\n\n·       umiejętność posługiwania się poprawną polszczyzną;\n\n·       umiejętność komunikowania pomysłów i przedstawiania ich w logiczny i zrozumiały sposób.\n\nMile widziane:\n\n·       podstawowa znajomość zagadnień związanych z SEO;\n\n·       znajomość języka angielskiego;\n\n·       znajomość narzędzia Google Keyword Planner;\n\n·       znajomość CMS WordPress;\n\n·       duże pokłady kreatywności!\n\nOferujemy:\n\n·       samodzielność w działaniu;\n\n·       możliwości rozwoju i zdobycia doświadczenia w SEO;\n\n·       znaczący wpływ w rozwój projektów;\n\n·       stabilne zatrudnienie.\n\nDodatkowe informacje:\n\npraca w biurze na warszawskiej Pradze;\nadres naszej strony internetowej: neutrino.media;\nCV prosimy wysyłać za pomocą portalu OLX.\n\nMoże to właśnie Ciebie szukamy? :) Odezwij się!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca dla kelnerki",
        "category": "olx",
        "phone": "511742846",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukiwana kelnerka do Cafe Bistro Żerań.\n\nOd kandydatki oczekujemy zaangażowania i chęci do pracy. Zależy nam aby nasz pracownik uczył się funkcjonowania firmy i nabierał doświadczenia w pracy.\n\nPraca od poniedziałku do piątku od 8-8:30 do 16-16:30. w zależności od potrzeb\n\nProsimy o zgłaszanie się tylko osoby zdecydowane na pracę, punktualne i uczciwe.\n\nCafe Bistro Żerań poszukuje studentki komunikatywnej lubiącej prace w zespole oraz z Gośćmi. \n\nOsoby zainteresowane zapraszamy do kontaktu.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "zatrudnię murarzy",
        "category": "olx",
        "phone": "796142032",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Pilnie zatrudnię murarzy oraz brygady. Praca przy silikat 18. Budynki mieszkalne kilkukondygnacyjne. Oferuję 28 zł/m2. Praca na terenie Warszawy.\n\nPłatność w każdy piątek 70%. Wyrównanie w trzecim tygodniu.\n\nZapewniam ciągłość pracy.\n\nTel. 796142032",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Doradca telefoniczny - podstawa 4000 zł netto + prowizja",
        "category": "olx",
        "phone": "504760234",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "PODSTAWA 4000 zł netto (B2B) + Prowizja już od 1 sprzedaży \n\n3 wolne wakaty\n\nOferujemy pracę w C.I.K. sp. z o.o., która od 2011 r. zajmuje się certyfikowaniem biur rachunkowych i księgowych.\n\nCzym będziesz się zajmować?\n\n > weryfikacja klientów zgodnie z kryteriami Programu C.I.K.\n\n > negocjacje oraz pozyskiwanie nowych klientów,\n\n > raportowanie wyników sprzedaży\n\n > aktywna współpraca z innymi osobami w obrębie organizacji,\n\n > dbanie o pozytywny wizerunek organizacji.\n\nCzego oczekujemy?\n\n > dużego stopnia samodzielności,\n\n > zorientowania na realizację celów,\n\n > dobrej organizacji pracy,\n\n > doświadczenia w sprzedaży.\n\nCo oferujemy?\n\n > PODSTAWA 4000 zł netto (B2B) + Prowizja od 1-wszej sprzedaży,\n\n > umowę B2B lub zlecenie\n\n > lokalizacja obok pętli tramwajowej i autobusowej - Praga Północ\n\n > kompleksowe szkolenie,\n\n > bardzo dobry produkt, cieszący się dużym zainteresowaniem wśród kontrahentów,\n\n > pracę w biurze w godzinach 8:00-16:00,\n\n > niezbędne narzędzia pracy,\n\n > jasne zasady współpracy,\n\n > szacunek oraz dobrą atmosferę pracy w młodym zespole.\n\nZachęcamy do wysyłania CV.\n\nProsimy o dopisanie klauzuli: „Wyrażam zgodę na przetwarzanie, administrowanie i archiwizowanie moich danych osobowych w celu realizacji obecnych i przyszłych procesów rekrutacji i selekcji (zgodnie z ustawą z dn. 29.08.1997 r. o ochronie danych osobowych Dz.U. nr 133 poz. 883 z późn. zm.).”",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kucharz, steki, wołowina ale nie tylko",
        "category": "olx",
        "phone": "739000579",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy kucharza do restauracji Zdrowa Krowa w Warszawie. Szukamy osoby, która ma doświadczenie w kuchni.\n\nWażna jest dla nas pracowitość, umiejętność radzenia sobie ze stresem w czasie tabaki, szybkość pracy i umiejętność utrzymania porządku.\n\nSzukamy osób o radosnym nastawieniu do życia, uśmiechniętych, kreatywnych w kuchni lubiących gotować, dla których strona wizualna dania jest równie ważna jak smak.\n\nOferujemy pracę w młodym zespole, elastyczny grafik, możliwość uczenia się i rozwoju. Stawka 18-20 zł/h netto podwyżki uzależnione od umiejętności, na początek umowa zlecenie. CV prosimy wysyłać w wiadomości prywatnej",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "GLAZURNIK I PRACOWNIK do wykończeń mieszkań do 31zł + premia",
        "category": "olx",
        "phone": "512556589",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam, poszukujemy doświadczonych GLAZURNIKÓW I PRACOWNIKÓW do wykończeń mieszkań. \n\nWymagamy od pracownika:\n\nChęci do pracy\nWłasnej inicjatywy\nWysokiej kultury\ndoświadczenie na wymienionym stanowisku\n\nNie tolerujemy :\n\nalkoholu\nnarkotyków\n\nRozliczenie\n\npierwsze 10 dni stawka próbna, według ustaleń na rozmowie\npo 10 dniach, gdy pracownik wykaże się zadeklarowanymi umiejętnościami stawkę automatycznie podnosimy, (pierwsze 10 dni regulujmy do stawki ustalonej docelowo po akceptacji do dalszej współpracy)\npo 10 godzinie przepracowanej kolejna godzina 5 zł więcej\nw soboty stawka podwyższona o 5 zł za każdą godzinę\n\nProszę o wstępny kontakt telefoniczny, sms lub e-mailem.\n\nProszę również o cierpliwość w kwestii odpowiedzi ze względu na czas poświęcony dla wyrażającego chęć do pracy\n\nKontakt możliwy wyłącznie po godzinie 17.\n\nW razie gdybym nie odbierał to oddzwonię, lecz proszę o sms o treści :\n\nPraca, imię, Stanowisko(np. glazurnik). \n\nKontakt możliwy wyłącznie po godzinie 17.\n\nPozdrawiam.\n\nFirma Strzelec",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pracownik Myjni Ręcznej - Pełną Parą Praga",
        "category": "olx",
        "phone": "506477747",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam\n\nJesteśmy dynamicznie rozwijającą się Myjnią na Pradze Północ.\n\nPoszukujemy pracownika z co najmniej 2 letnim doświadczeniem.\n\nOsoby dokładnej, odpowiedzialnej, sumiennej, punktualnej i uczciwej.\n\nJeśli uważasz że to dla ciebie. Napisz do nas, zadzwoń lub wyślij CV !\n\nPozdrawiam i czekam na zgłoszenia\n\nAdam",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Klubokawiarnia zatrudni kucharkę lub kucharza",
        "category": "olx",
        "phone": "502993953",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy kucharza/kucharki do nowego projektu - klubokawiarni Miś na Targowej.\n\nKuchnia polska + wegetariańska.\n\nSzukamy pasjonata/pasjonatki lubiących gotowanie, chcących się rozwijać.\n\nObecnie cztery dni w tygodniu, od czwartku do niedzieli.\n\nMiesiąc próbny 3000-4000 zł na rękę, potem już tylko lepiej...\n\nDo zobaczenia!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnimy stylistę/fryzjera",
        "category": "olx",
        "phone": "501757850",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Salon piękności w Warszawie zatrudni stylistę - fryzjera od zaraz. Poszukujemy osób, z co najmniej 3  letnim doświadczeniem w zawodzenia. \nCenimy sobie kulturę osobistą, uczciwość i pracowitość. \n\nOferujemy:\n- zatrudnienie w Salonie, który od ponad 30 lat wyznacza standardy fryzjerstwa\n- pracę w miłej i spokojnej atmosferze \n- dogodne warunki pracy  \n- atrakcyjne zarobki\n- szkolenia i możliwość rozwoju \n\nProsimy o przesyłanie CV lub kontakt telefoniczny 501757850",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "ZATRUDNIMY Instruktora Nauki Jazdy kat. B na samochód OSK",
        "category": "olx",
        "phone": "696095506",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujesz pracy na stanowisku Instruktora nauki jazdy? Jesteś ambitny i chcesz uczyć Kursantów bezpiecznej i odpowiedzialnej jazdy, a nie tylko podpisywać \"godzinki\"? Chcesz otrzymywać za swoją pracę wysokie wynagrodzenie?\n\nMAMY PRACĘ DLA CIEBIE\n\nŁamiemy wszelkie granice i stereotypy, idziemy pod prąd! Mamy swój profesjonalny program nauczania.\n\nOferujemy Tobie:\n\nnowe, sprawne, bardzo bogato wyposażone auta szkoleniowe (max opcja)\npłatne \"okienka\" za nieobecności kursanta\nwynagrodzenie zawsze płatne terminowo (najwyższe na rynku)\nelastyczne godziny pracy (Instruktor sam ustala kiedy chce pracować)\ngrafik jazd ustalany przez biuro\nkarty flotowe (Instruktor \"nie zakłada\" swoich pieniędzy za paliwo)\ngwarancję pracy przez cały rok\n\nMiejsce pracy: \n\nWarszawa, Praga Północ\n\nWymagania: \n\nuprawnienia Instruktora nauki jazdy kat. B (warunek konieczny)\nPraca na pełny etat (Możliwa również na 1/2 etatu, na wieczory lub na same weekendy)\ndoświadczenie nie jest wymagane, każdy nowy pracownik otrzyma wewnętrzne szkolenie i wdrożenie\nzaangażowanie w wykonywaną pracę\n\nPraca od zaraz\n\nProsimy o kontakt przez formularz lub telefonicznie: 696095506",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Dyspozytor transportu",
        "category": "olx",
        "phone": "726994944",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Dyspozytor Miejsce pracy: Praga - Północ Poszukuje kandydata na stanowisko Dyspozytor; koordynację pracy kierowców zapewnienie ciągłości dostaw Zainteresowane tym stanowiskiem osoby, powinny posiadać: doświadczenie zawodowe w pracy na podobnym stanowisku (mile widziane doświadczenie w firmach kurierskich), doświadczenie w planowaniu transportu, umiejętność obsługi komputera w zakresie MS Office, komunikatywność, wysokie umiejętności organizacyjne, odporność na stres, odpowiedzialność, samodzielność, konsekwencja w działaniu. Zainteresowanym osobom, spełniającym powyższe oczekiwania możemy zaoferować: ciekawą, pełną wyzwań pracę, zatrudnienie na pełny etat (umowa o pracę), dużą samodzielność i odpowiedzialność, możliwość rozwoju zarówno osobistego jak i zawodowego - w branży TSL.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Ekspedientka kasjerka sprzedawca sklep spożywczy Praga Północ",
        "category": "olx",
        "phone": "604253999",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię osobę na stanowisko ekspedientki, sklep spożywczy, praca zmianowa, 5 dni + co druga sobota. \n\nZainteresowane osoby proszę telefoniczny pod nr 604253999\n\nWarszawa Praga Północ, okolice pl. Hallera.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pracownik na stanowisko : pomoc apteczna",
        "category": "olx",
        "phone": "501136465",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Apteka przy Namysłowskiej ul Stefana Starzyńskiego 10 03-456 Warszawa\n\nPrywatna apteka na Pradze-Północ poszukuje pracownika na stanowisko : pomoc apteczna \n\n \n\nPraca w miłym i młodym zespole, możliwość rozwoju zawodowego\n\nBardzo konkurencyjne wynagrodzenie.\n\nNajchętniej widziana stała, długa współpraca\n\n \n\nCV prosimy wysyłać za pośrednictwem przycisku aplikowania",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Delikatesy mięsne zatrudnią SPRZEDAWCĘ Wa-wa Rondo Wiatraczn",
        "category": "olx",
        "phone": "513332600508257843",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Wraz z rozwojem prężnie działającej firmy posiadającej sieć sklepów na terenie województwa mazowieckiego \n\nposzukujemy pracownika do  palcówki w Warszawie Praga-Południe na stanowisko: EKSPEDIENTKI/EKSPEDIENTA Miejsce pracy:\n\nWarszawa Praga-Południe, ul. Al Stanów Zjednoczonych 72 / Rondo Wiatraczna\n\n Idealnym kandydatem/kandydatką będzie osoba posiadająca doświadczenie w branży spożywczej. \n\nDodatkowo oczekujemy:\n\n - znajomości obsługi kasy fiskalnej i terminala płatniczego\n\n - aktualnej książeczki sanitarno-epidemiologicznej \n\n- otwartości na kontakt z klientem, zaangażowania, uczciwości, dyspozycyjności, umiejętności pracy w zespole \n\nOferujemy: \n\n- zatrudnienie w rzetelnej i stabilnej firmie \n\n- podnoszenie kwalifikacji poprzez szkolenia\n\n - zatrudnienie na podstawie umowy o pracę lub umowy zlecenia, ,\n\n - wynagrodzenie zawsze na czas \n\n- pracę w zgranym zespole \n\n- wolne niedziele ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca dla studenta (Tech Support/Logistic Support)",
        "category": "olx",
        "phone": "223983342",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "C4i consultants for Industry to firma z branży audio - wideo z wieloletnim doświadczeniem (www.c4i.com.pl). specjalizujemy się w dystrybucji urządzeń zapewniających współczesnym gospodarstwom domowym dostęp do cyfrowej technologii, multimediów i rozrywki, ale przede wszystkim dostarczamy urządzenia na profesjonalny rynek instalacyjny audio i video. reprezentujemy wielu znaczących producentów sprzętu AV jak Kramer Electronics, Gomax Electronics, Vdwall, LAN, Tvone, Blackmagicdesign, Cuanbo, HDCVT, Foxun, Hi-Media, Zidoo, Barix, Brightsign, Matrix-Audio i inne. w tym momencie poszukujemy osób na stanowisko support logistics (specjalista ds logistyki ) lub tech support (specjalista techniczny) praca stała w pełnym wymiarze czasowym lub niepełnym wymiarze czasowym. mile widziani studenci od 3 roku wzwyż. po 3 miesięcznym okresie próbnym możliwość pracy na stałe\n\n \n\n opis stanowiska: \n\ndla osób o specjalności logistyka: \n\n-obsługa sklepu internetowego i zarządzanie nim\n\n-obsługa magazynu, przyjmowanie dostaw i przygotowanie wysyłek kurierskich\n\n-realizacja logistyczna zamówień klientów\n\n-kontrola stanów magazynowych\n\n-obsługa programu fakturującego i współpraca z księgowością\n\n-kompletacja i nadawanie przesyłek kurierskich\n\n-współpraca z dostawcami w kraju i zagranicą\n\n-obsługa prostych programów graficznych\n\n-wystawianie aukcji w serwisie allegro\n\n \n\ndla osób o specjalnościach technicznych elektronika /it \n\n-testy urządzeń audio wideo\n\n-serwis i uruchamianie urządzeń audio wideo i it\n\n-tłumaczenia, tworzenie instrukcji obsługi\n\n-wsparcie techniczne klienta\n\n-obsługa strony internetowej firmy\n\n \n\nproponowana praca wymaga dużej dokładności i cierpliwości, ale daje możliwości rozwojowe i awansu na specjalistę ds. logistyki albo inżyniera serwisu wraz ze wzrostem kompetencji, praca w środowisku międzynarodowym pozwala nabrać doświadczenia w wielu kluczowych obecnie dziedzinach: logistyce, technice audio wideo i IT, inżynierii, marketingu internetowego \n\n wymagania:\n\n - min. trzeci rok studiów\n\n - wykształcenie średnie lub wyższe,\n\n- niekaralność\n\n - dobra znajomość języka angielskiego\n\n - skrupulatność, bardzo dobra organizacja własnej pracy \n\n - dyspozycyjność\n\n - bardzo dobra znajomość obsługi komputera, internetu i pakietu ms office - (szczególnie excel), programów graficznych\n\n - wysoka kultura osobista\n\n - samodzielność i zaradność\n\n - osoba niepaląca\n\n \n\n oferujemy:\n\n-trudną ale przynoszącą wiele zadowolenia pracę\n\n-uzyskanie unikalnego doświadczenia i szerokich kompetencji: w elektronice, technice av lub logistyce i marketingu internetowym\n\n-atrakcyjne wynagrodzenie\n\n-pracę w młodej, dynamicznej firmie, mającej dostęp do najnowszych, zaawansowanych technologii w międzynarodowym środowisku\n\n-możliwości awansu i rozwoju wraz z firmą\n\n \n\nPoszukujemy zdecydowanych i energicznych osób w pełnym i niepełnym wymiarze czasu pracy\n\n \n\nProsimy o przesłanie CV i listu motywacyjnego za pośrednictwem serwisu olx. zgłoszenia bez listu motywacyjnego nie będą uwzględniane.\n\ninformacje o profilu firmy na stronie www.c4i.com.pl\n\n ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pielęgniarka - praca w ŻŁOBKU",
        "category": "olx",
        "phone": "790806704",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Prywatny żłobek na Pradze Północ zatrudni na część etatu Pielęgniarkę, która pragnie zneleźć dodatkową pracę na wspólnie ustalonych warunkach.  Godziny i dni do ustalenia. Zapraszamy do kontaktu i przesylania cv zainteresowane osoby.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kierowca Kat C dostawy lokalne",
        "category": "olx",
        "phone": "515258951",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": " \n\nFirma transportowa zatrudni pracownika na stanowisku kierowca kat. C\n\n \n\nOpis stanowiska:\n\n- praca w charakterze kierowcy kat. C\n\n- dystrybucja lokalna\n\n- auto przypisane do kierowcy\n\n \n\nWymagania:\n\n- prawo jazdy kat. C\n\n- doświadczenie w transporcie\n\n- sumienność i dbałość o narzędzia pracy\n\n- uczciwość\n\n- niekaralność\n\n \n\nOferujemy:\n\n- atrakcyjne wynagrodzenie",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "POMOCNIK montażysty wykładzin",
        "category": "olx",
        "phone": "512776437",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": " POMOCNIK montażysty wykładzin podłogowych\n\n \n\n\tCONIVEO to jedna z największych w Polsce firm z branży wykładzin obiektowych. Od 1995 roku zajmuje się dystrybucją markowych wykładzin obiektowych i akcesoriów podłogowych, a także montażem w biurach i instytucjach, szkołach, hotelach oraz gabinetach medycznych.\n\n \n\n \n\n  Zatrudnimy pracowników na stanowisko:\n\n  POMOCNIK montażysty wykładzin podłogowych\n\n \n\nOd kandydatów oczekujemy:\n\n- zapału do pracy i chęć przyuczenia\n\n- zdolności manualne, \n\n- umiejętność pracy w zespole\n\n- mile widziane doświadczenie w pracy montażu wykładzin (lub branży budowlanej)\n\n \n\n Ze swojej strony oferujemy:\n\n- stabilne zatrudnienie\n\n- gwarancja ciągłości prac\n\n- wsparcie ze strony pracowników z dłuższym stażem\n\n- wynagrodzenie od 19 zł netto za godzinę, z perspektywą szybkiej podwyżki (uzależniona od posiadanych umiejętności)\n\n- możliwość pracy stałej lub tymczasowej\n\n- niezbędne narzędzia pracy\n\n- pracę przy ciekawych projektach i możliwość dalszego doskonalenia zawodowego\n\n- praca w firmie o ugruntowanej pozycji rynkowej\n\n- możliwość awansu wg obowiązującej ścieżki kariery\n\n- możliwość wyjazdów delegacji krajowych oraz zagranicznych z bardzo wysokim wynagrodzeniem - \n\n- pakiet usług medycznych \n\n- pozytywną atmosferę w pracy\n\n Zainteresowane osoby prosimy o kontakt telefoniczny w godzinach 09:00-16:30 : tel. 512 776 437\n\n \n\n Zapraszamy! ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kierowca C+E praca na dzień",
        "category": "olx",
        "phone": "606331658",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "GT HOLDING to firma w branży TSL Dzisiaj GT HOLDING. to operator logistyczny, zapewniający obsługę logistyczną, obejmującą usługi transportu i spedycji drogowej, kolejowej, morskiej i lotniczej. GT HOLDING Firma transportowa zatrudni pracownika na stanowisku kierowca kat. C+ E Opis stanowiska: - praca w charakterze kierowcy kat. C +E codziennie w domu praca stała linia magazyn ->magazyn Wymagania: - prawo jazdy kategorii C+E - doświadczenie w transporcie - sumienność i dbałość o narzędzia pracy - uczciwość",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kierowca C+E kółka Warszawa->Niemcy->Warszawa",
        "category": "olx",
        "phone": "782535782",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Operator logistyczny, zapewniający obsługę logistyczną, obejmującą usługi transportu i spedycji drogowej, kolejowej, morskiej i lotniczej.\n\n \n\n \n\nFirma transportowa zatrudni pracownika na stanowisku kierowca kat. C+ E\n\n \n\nOpis stanowiska:\n\n- praca w charakterze kierowcy kat. C +E\n\n- weekend w domu\n\n- Wyjazdy Warszawa ->Niemcy-.Warszawa\n\n \n\nWymagania:\n\n- prawo jazdy kategorii C+E\n\n- doświadczenie w transporcie\n\n- sumienność i dbałość o narzędzia pracy\n\n- uczciwość\n\n- niekaralność",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pracownik ochrony Warszawa. Osiedla, Budynki użyteczności publicznej",
        "category": "olx",
        "phone": "536874876",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Agencja Ochrony TS. Patrol zatrudni konkretne i zdecydowane osoby do ochrony obiektów na terenie Warszawy. Jedna umowa zlecenie ( składki naliczane za każdą przepracowaną godzinę, stawka netto ( na rękę), w zależności od obiektu. Mile widziane doświadczenie w ochronie.\n\nPanowie do 55 lat\n\nPanie do 40 lat.\n\nPraca na obiektach:\n\nDom Kultury Praga Północ. System pracy 24/48 ( w późniejszym terminie możliwa zmiana systemu pracy, bardzo proszę wziąć to pod uwagę). Obsługa systemu CCTV oraz systemu P.Poż. Praca na stanowisku z recepcją. Panów i panie z miłą aparycją oraz wysoką kulturą osobistą. Bardzo dobre warunki socjalne na obiekcie. Stawka 13,5 zł netto za godzinę.\n\nOsiedle mieszkaniowe na terenie Warszawa - Kobiałka. System pracy godz. 06.00 - 22.00. Praca w systemie: dwa dni pracy, dwa dni wolnego. Obsługa szlabanu, obchody, obsługa systemu CCTV, drobna pomoc administracji w zarządzaniu osiedlem. Bardzo dobre warunki socjalne na obiekcie. Stawka 13,50 netto za godzinę\n\nNie odpowiadam na maile i smsy\n\nKontakt wyłącznie telefoniczny\n\n536 874 876 Łukasz w godz, 08.00 - 18.00",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Agent nieruchomości / Specjalista ds. Nieruchomości",
        "category": "olx",
        "phone": "515559164",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy osoby na stanowisko:\n\n \n\n- Agent nieruchomości / Specjalista ds. Nieruchomości\n\nMiejsce pracy: Warszawa z podziałem na rejonizacje (Rejon I - Mokotów, Ursynów, Wilanów ; Rejon II - Praga-Południe, Praga-Północ, Targówek, Rembertów , Wesoła, Wawer ; Rejon III - Wola, Ochota, Śródmieście, Ursus, Włochy)\n\n \n\nOpis stanowiska:\n\n• pozyskiwanie ofert kupna, sprzedaży,\n\n• pozyskiwanie klientów indywidualnych i instytucjonalnych,\n\n• rozmowa telefoniczna z klientami,\n\n• rozmowa bezpośrednia z klientami,\n\n• negocjowanie warunków współpracy,\n\n• podpisywanie umów,\n\n• wprowadzanie ofert do bazy danych,\n\n• kompletowanie, bieżąca archiwizacja dokumentów,\n\n• kontrola stanu prawnego nieruchomości,\n\n• monitorowanie rynku.\n\n \n\nWymagania:\n\n• czynne prawo jazdy kat. B (własny samochód),\n\n• doświadczenie w branży handlowej,\n\n• mile widziane doświadczenie w branży,\n\n• umowa zlecenie lub własna działalność,\n\n• dyspozycyjność, komunikatywność, odporność na stres,\n\n• umiejętność zarządzania pracą własną,\n\n• umiejętność pracy w zespole,\n\n• kreatywność,\n\n• dobra umiejętność obsługi komputera i podstawowego oprogramowania.\n\n \n\nCo oferujemy:\n\n• wysokie wynagrodzenie prowizyjne,\n\n• stabilne zatrudnienie,\n\n• wsparcie merytoryczne doświadczonych osób z zespołu,\n\n• bardzo dobrą atmosferę pracy.\n\n \n\nProsimy o załączenie klauzuli o wyrażeniu zgody na przetwarzanie danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji.\n\n \n\nDziękujemy za przesłane aplikacje. Informujemy, że skontaktujemy się jedynie z wybranymi kandydatami.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pracownik Ochrony, obiekt handlowy - Warszawa (ul.Radzymińska)",
        "category": "olx",
        "phone": "690102689",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Jesteśmy skandynawskim koncernem ochrony. Pozycję lidera na światowym rynku zdobyliśmy dzięki naszym pracownikom oraz nowoczesnym, zintegrowanym rozwiązaniom technicznym.\n\nObecnie do zespołu poszukujemy kandydatów na stanowisko:\n\n \n\n\n\n\n \n\n \n\n\n\n\nPoszukujemy osób:\n\n* niekaranych,\n\n* dyspozycyjnych,\n\n* mile widziane doświadczenie w pracy w ochronie.\n\n\n \n\n\n\n\nOferujemy:\n\n* umowę o pracę lub umowę zlecenie z odprowadzeniem pełnych składek ZUS,\n\n* gwarancję wypłaty pełnego wynagrodzenia zawsze 10-tego każdego miesiąca,\n\n* ubezpieczenie NNW (od Następstw Nieszczęśliwych Wypadków),\n\n* kompletne, bezpłatne umundurowanie,\n\n* możliwość korzystania z funduszu socjalnego w postaci pożyczek, zapomóg, dopłat do wypoczynku dzieci (ZFŚS).\n\n \n\n\n\n\nKontakt: 690 102 689\n \n\n\n\n\nKliknięcie przycisku „Wyślij” oznacza, że wyrażasz zgodę na przetwarzanie swoich danych osobowych przez Securitas Polska Sp. z o.o. i Securitas Services Sp. z o.o. z siedzibą w Warszawie przy ul. Postępu 6 dla potrzeb niezbędnych do realizacji procesu rekrutacji.\n\nMożesz zapoznać się ze szczegółową polityką ochrony danych osobowych przez spółki Securitas pod adresem: https://www.securitas.pl/Securitas/stand-alone/polityka-prywatnoci/\n\nDane osobowe będą przechowywane przez okres 12 miesięcy od dnia złożenia aplikacji lub do momentu wycofania zgody na przetwarzanie danych osobowych.\n\n ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pomocnik lakiernika",
        "category": "olx",
        "phone": "228186211",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Fabryka Obrabiarek Precyzyjnych AVIA S.A.\n\nW związku z intensyfikacją działań sprzedażowych i rozbudową FOP AVIA S.A. z siedzibą w Warszawie poszukuje pracowników na stanowisko: Pomocnik lakiernika\n\nWykształcenie: podstawowe-zasadnicze\n\nOpis stanowiska: przygotowanie detali do lakierowania\n\nOferujemy:\n\n-Zatrudnienie na umowę o pracę.\n\n-Pracę w firmie o stabilnej pozycji rynkowej.\n\n- Opiekę medyczną\n\nJeżeli jesteś zainteresowany prześlij swoje CV za pomocą przycisku APLIKUJ.\n\nUprzejmie prosimy o zawarcie następującej zgody w dokumentach aplikacyjnych:\n\n„Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w dokumentach aplikacyjnych przez FOP AVIA S.A. w celu realizacji procesu rekrutacyjnego”",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pracownik ogólnobudowlany",
        "category": "olx",
        "phone": "535785535",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma zajmująca się pracami wykończeniowymi wnętrz pod klucz poszukuje aktualnie PRACOWNIKA OGÓLNOBUDOWLANEGO.\n\nSzukamy do pracy od zaraz. \n\nDo obowiązków Kandydata należeć będą prace:\n\nszpachlowanie (ręczne i natryskowe),\nmalowanie (ręczne i natryskowe),\nprace tynkarskie (ręczne i natryskowe),\nwstawianie drzwi,\nstawianie ścianek i sufitów gipsowo-kartonowych,\nstawianie ścianek murowanych,\nprace glazurnicze (układanie płytek różne formaty),\nukładanie paneli podłogowych, desek warstwowych, gotowych parkietów,\nprace hydrauliczne (różne technologie pex, pp, stal),\nprace elektryczne (proste prace polegające na rozprowadzaniu przewodów, montażu puszek, biały montaż)\nbiały montaż,\n\nPreferowany przedział wiekowy 18 -45 lat. Brak NAŁOGU ALKOHOLOWEGO!\n\nWynagrodzenie uzależnione od zakresu umiejętności indywidualnej pracownika. OD 18 zł/h DO 30 zł./h\n\nDodatkowym atutem będzie posiadanie prawa jazdy Kat. B\n\nPraca głównie na terenie Warszawy i okolic, wyjazdów brak.\n\nProszę o przesłanie CV wraz ze zdjęciem na adres limbeworks{małpa}gmail.com oraz kontakt telefoniczny 535785535.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca w sklepie z pieczywem, elastyczny grafik.",
        "category": "olx",
        "phone": "884321180",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Do bałkańskiej piekarni na Pradze poszukujemy osoby do obsługi klientów. Elestyczny grafik, wynagrodzenie od 15zł na ręke.  ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Asystent Projektanta Konstrukcji - Warszawa",
        "category": "olx",
        "phone": "48660686997",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Biuro Konstruktor s.c. z siedzibą w Warszawie przy ul. Jagiellońskiej 78/3.31 zatrudni asystenta projektanta konstrukcji budowalnych.\n\nForma zatrudnienia - umowa o dzieło/zlecenie w pełnym wymiarze czasu\n\nWymagania:\n\ndobra znajomość AutoCad\nkomunikatywność, chęć rozwoju, umiejętność pracy w zespole\nwykształcenie: inżynier budownictwa/student\n\nOferujemy:\n\nudział przy realizacji ciekawych projektów\nmożliwość nauki i rozwoju zawodowego\npracę w przyjaznej atmosferze\n\nOsoby zainteresowane prosimy o przesyłanie aplikacji lub kontakt tel. +48 660 686 997",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Monter klimatyzacji",
        "category": "olx",
        "phone": "608335596",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię samodzielnego montera klimatyzacji i wentylacji, minimum 2 lata doświadczenia prawo jazdy kat.B. Praca również w delegacji. Wysokość wynagrodzenia zależy od twoich umiejętności, jeżeli jesteś w tym dobry na pewno dojdziemy do porozumienie, jeśli czujesz że potrzebujesz jeszcze czasu ale posiadasz już jakieś doświadczenie to  też możemy spróbować . ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kierowca CE po Unii",
        "category": "olx",
        "phone": "500632386",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy kierowców z doświadczeniem na  firanki i chłodnie. Ciągniki 2019roku, automaty. Czas pracy wyłącznie zgodnie z rozporządzeniem .System pracy 4/1, 6/2,8/2/3.\nWypłaty regularne. Zatrudnienie w oparciu o umowę o prace.\nMile wiedziane kierowcę z poza Polski.\n500 632 386 polski\n506952982 ros/ukr",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Specjalista Techniczny - AV, elektronika",
        "category": "olx",
        "phone": "223906236",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "C4i  oznacza Consultants for Industry, a  nasze motto  to \"znajdziemy rozwiązanie Twojego problemu audio-wideo\". Zajmujemy się ogólnie rozumianą techniką audio wideo oraz dostarczaniem rozwiązań Digital Signage, odtwarzaczy multimedialnych, mini PC, rozdzielaczy, przełączników, matryc, skalerów, okablowania. Specjalizujemy się w dystrybucji urządzeń zapewniających współczesnym gospodarstwom domowym dostęp do cyfrowej technologii, multimediów i rozrywki, ale przede wszystkim dostarczamy urządzenia na profesjonalny rynek instalacyjny.Reprezentujemy wielu znaczących producentów sprzętu AV jak Kramer Electronics, Gomax Electronics, VDWall, Calibre, tvOne, BlackMagic Design, Cuanbo, SCP, HDCVT, E-Great, HiMedia, Zidoo, Revo, Barix, Brightsign i inne. W  związku z rozwojem firmy, do młodego zespołu poszukujemy energicznej i zmotywowanej osoby na stanowisko:\n\nSpecjalista Techniczny Audio wideo  (ST AV)\n\nObowiązki:\n\n-serwis  urządzeń elektronicznych audio wideo\n\n-Wsparcie projektowe audio wideo i IT\n\n-Uruchomienia, wsparcie klienta\n\n-Organizowanie pokazów audio - wideo\n\n-współpraca w tworzeniu opisów i instrukcji  urządzeń AV\n\nWymagania:\n\n-Niezbędna znajomość elektroniki użytkowej i serwisu, sprzętu AV, sieci komputerowych\n\n-Umiejętności serwisowe w zakresie elektroniki\n\n-Wykształcenie min. średnie, preferowany stopień inżynierski,\n\n-Zatrudnimy również studentów uczelni technicznych od trzeciego roku wzwyż\n\n-Znajomość j. angielskiego\n\n-Znajomość środowiska PC/MAC/Android/Linux\n\n-Osoba niepaląca\n\nOferujemy:\n\n-rozwój zawodowy, kontakt z najnowszą techniką\n\n-szkolenia zagraniczne\n\n-stopniowy wzrost kompetencji i odpowiedzialności\n\n-atrakcyjne wynagrodzenie\n\nJeśli jesteś po studiach inżynierskich i szukasz możliwości rozwoju zawodowego i ciekawej pracy zapraszamy! Poznasz najnowszą technikę audio wideo.\n\nJeśli masz dość pracy w dużych korporacjach a chciałbyś samodzielnie pokierować swoją karierą zawodową i osiągnąć sukces w firmie zajmującej się najnowocześniejszymi technikami złóż swoją aplikację. Zapewniamy trudną, ale dającą dużo zadowolenia z jej wykonania pracę a przede wszystkim  zdobycie kluczowych umiejętności  w najszybciej rozwijającym się rynku wysokich technologii . Jeśli chcesz osiągnąć sukces z nami -ZAPRASZAMY!   Zainteresowani proszeni są o przesłanie CV oraz listu motywacyjnego. Uwaga : nie rozpatrujemy zgłoszeń bez listu motywacyjnego.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kierowca miedzynarodowy Bus 3,5 dmc",
        "category": "olx",
        "phone": "793606211",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma transportowa poszukuje do stalej wspolpracy kierowce kat B na trasy miedzynarodowe. Auto RENAULT MASTER z kabina sypialna z tyłu. Oferujemy: platne dniowka plus premie w pelni wyposazone auto Wymagania: znajomosc dokumentow cmr mile widziane doswiadczenie narodowosc Polska Zainteresowanych prosze o kontakt: 793606211 A",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "kierowca C+E kontenery morskie Warszawa, Ciechanów, Płońsk",
        "category": "olx",
        "phone": "608278595",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma transportowa zatrudni kierowców trasowych w transporcie kontenerów morskich, \n\npodjęcia kontenerów z terminali Trójmiejskich (import + export, wagi w limitach)\n\njazda tylko po kraju, \n\nsamochody Renault E6\n\nwymagania:\n\nprawo jazdy C+E\nkarta kierowcy\nkurs na przewóz rzeczy\ndbałość o powierzony sprzęt\nsumienność\n\nzapraszamy kierowców z okolic Warszawy, Płońska, Ciechanowa\n\ncv prosimy przesyłać na mail lub kontakt telefoniczny 608-278-595",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pracowników budowlanych , praca wyjazdy Europa",
        "category": "olx",
        "phone": "519000555",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma z ugruntowaną pozycją na rynku produkująca konstrukcje stalowe wiaty , zadaszenia ze stali , hale magazynowe , zatrudni:\n\n \n\n*Pracownicy tylko z doświadczeniem pracy na budowie*\n\n \n\n*Pracowników do montażu konstrukcji stalowych , balustrad , balustrad szklanych\n\nZakres obowiązków: wiercenie, skręcanie elementów stalowych, montaż obróbek blacharskich , Montaz HPL .\n\nPRACA NA TERENIE CAŁEJ EUROPY\n\nTYLKO OSOBY PRACOWITE I NIE MAJĄCE NAŁOGÓW ORAZ BIEGLE ROZMAWIAJĄCY W JĘZYKU POLSKIM \n\nMOŻLIWE ZATRUDNIENIE BRYGAD 4 OSOBOWYCH Z WŁASNĄ DZIAŁALNOŚCIĄ \n\n \n\nGodziny pracy 7.00-17.00.\n\n \n\n STAWKA OD 20zł/h NA RĘKĘ\n\n \n\nRaz w miesiącu premia zależna od wyników .\n\n \n\nPRACOWNICY Z DOŚWIADCZENIEM OD 23 zł/h - 25 zł/h\n\nPENSJA REGULOWANA TERMINOWO DWA RAZY W MIESIĄCU!!!\n\nNIE PŁACIMY ZALICZEK!!!\n\n \n\nMożliwość pracy na zakładzie produkcyjnym\n\n \n\nUMOWA O PRACĘ\n\n \n\nButy robocze oraz ubrania po stronie pracownika \n\nZwrot kosztów po okresie próbnym (jednego miesiąca)za spodnie robocze\n\nZapraszamy do kontaktu od poniedziałku-soboty w godzinach \n\nw godzinach od 7:00 - 16:00",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Dostawca w pizzerii",
        "category": "olx",
        "phone": "572155674",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Pizzeria Speedy Romano Praga zatrudni kuriera \nStawka 15 zł/h umowa zlecenie\nNie wymagamy własnego samochodu",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "LodyCARTE D'orWarszawaZOOBulwaryZąbkiWołominMarkiTargówekPraga",
        "category": "olx",
        "phone": "696028181",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Posiadamy punkty sprzedażowe w Warszawa ZOO, bulwary Wiślane, miejscowości podwarszawskie tj. Ząbki \n\n· Krótki opis oferty / ramowy zakres obowiązków\n\nW Fresh przygotowujemy orzeźwiającą lemoniadę naturalnych produktów lub lody Algidy marki premium Carte D'or. \n\nDołącz do naszego zespołu, aby inspirować innych do zdrowego stylu życia.\n\nJako pracownik odpowiadać będziesz za: \n\n- przygotowanie naszym klientom świeżej lemoniady i lodów,\n\n- obsługę dostaw i rozliczenie sprzedaży,\n\n- dbanie o czystość i wizerunek stanowiska pracy.\n\nOd Ciebie oczekujemy:\n\n- miłej aparycji i energii życiowej którą lubisz się dzielić,\n\n- zaangażowania,\n\n- dyspozycyjności,\n\n- doświadczenie w obsłudze kasa/terminal,\n\n- statutu ucznia lub studenta (wiek do 25lat),\n\n- aktualnej książeczki sanepidu.\n\nLemoniada to produkt całkowicie naturalny, zdrowy sporządzony dla klientów ze świeżych owoców.\n\nJeśli jesteś uśmiechniętą oraz pozytywnie nastawioną do ludzi osobą, dołącz do naszego zespołu.   \n\nOferowane warunki pracy\n\n - zatrudnienie na postawie umowy zlecenie,\n\n - praca w nowoczesnym koncepcie sprzedaży w młodym zespole,\n\n - praca w prestiżowej lokalizacji - na terenie Warszawskiego ZOO,\n\n - wynagrodzenie podstawowe godzinowe + prowizja od sprzedaży.\n\n - praca od pon.-nd. w godzinach 9-18/19 (czerwiec/lipiec/sierpień) – elastycznie do uzgodnienia. \n\nJeśli chcesz budować z nami swoje doświadczenie ZAPRASZAMY!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Poszukiwany fryzjer na 1/2 etatu",
        "category": "olx",
        "phone": "514280796",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy fryzjera damskiego lub damsko-męskiego, poszukującego pracy w krótkim wymiarze godzin. \n\nWymagania: \n- doświadczenie w pracy min. 3 lata \n- miła aparycja \n- dyspozycyjność kilka godzin w ciągu dnia \n\nOdpowiada osoba, która może pracować rownież na poranne zmiany.\n\nOferujemy elastyczny grafik, stałą klientelę, szkolenia Loreal, prace w sympatycznym zespole. \n\nLokalizacja: \nPraga Północ lub Okęcie/Włochy \n\nKontakt: 608453689",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pijalnia Czekolady E.Wedel zatrudni pracowników obsługi klienta",
        "category": "olx",
        "phone": "538055391",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Pijalnia Czekolady E. Wedel mieszcząca się w Centrum Praskim Koneser zatrudni pracowników obsługi klienta.\n\nLubisz pracę z ludźmi? Interesuje Cię przygotowywanie słodkości? Masz motywację do pracy?\n\nZostań Pracownikiem Pijalni Czekolady E. Wedel, a reszty Cię nauczymy.\n\nDo zakresu obowiązków należy:\n\n- obsługa Gości na najwyższym poziomie wg standardów firmy\n\n- przygotowanie napoi i deserów oraz pomoc na zmywaku\n\n- dbanie o czystość i porządek w miejscu pracy\n\nOd kandydatów oczekujemy:\n\n- dyspozycyjności zarówno w tygodniu jak i w weekendy\n\n- chęci do pracy, zaangażowania oraz uśmiechu na twarzy\n\n- pozytywnego nastawienia do ludzi oraz łatwości nawiązywania kontaktów\n\nOsoby zainteresowane prosimy o przesłanie CV.\n\nKLAUZULA INFORMACYJNA\n\nAdministrator\n\nAdministratorem Państwa danych osobowych przetwarzanych w ramach procesu rekrutacji jest Infusion Sp. z o.o. Sp. Komandytowa, ul. Składowa 12, 15-399 Białystok W sprawach dotyczących ochrony Państwa danych osobowych można kontaktować się z nami za pomocą poczty tradycyjnej na wyżej wskazany adres z dopiskiem „OCHRONA DANYCH”.\n\nCel i podstawy przetwarzania\n\nPaństwa dane osobowe w zakresie wskazanym w przepisach prawa pracy (art. 22 ustawy z dnia 26 czerwca 1974 r. Kodeks pracy ora §1 Rozporządzenia Ministra Pracy i Polityki Socjalnej z dnia 28 maja 1996 r. w sprawie zakresu prowadzenia przez pracodawców dokumentacji w sprawach związanych ze stosunkiem pracy oraz sposobu prowadzenia aktu osobowych pracownika) będą przetwarzane w celu przeprowadzenia obecnego postępowania rekrutacyjnego (art. 6 ust. 1 lit b RODO), natomiast inne dane, w tym dane do kontaktu, na podstawie zgody (art. 6 ust. 1 lit. a RODO), która może zostać odwołana w dowolnym czasie. \n\nAdministrator będzie przetwarzał Państwa dane osobowe, także w kolejnych naborach pracowników, jeżeli wyrażą Państwo na to zgodę (art. 6 ust. 1 lit. a RODO), która może zostać odwołana w dowolnym czasie. \n\nJeżeli w dokumentach zawarte są dane, o których mowa w art. 9 ust. 1 RODO konieczna będzie Państwa zgoda na ich przetwarzanie (art. 9 ust. 2 lit. a RODO), która może zostać odwołana w dowolnym czasie.\n\n \n\nOkres przechowywania danych\n\nPaństwa dane zgromadzone w obecnym procesie rekrutacyjnym będą przechowywane do zakończenia procesu rekrutacji. \n\nW przypadku wyrażonej przez Państwa zgody na wykorzystanie danych osobowych do celów przyszłej rekrutacji, Państwa dane wykorzystywane będą przez 12 miesięcy.\n\nPrawa osób, których dane dotyczą\n\nMają Państwo prawo do:\n\ndostępu do swoich danych oraz otrzymania ich kopii;\nsprostowania (poprawiania) swoich danych osobowych;\nograniczenia przetwarzania danych osobowych;\nusunięcia danych osobowych;\nwniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (na adres Urzędu Ochrony Danych Osobowych, ul. Stawki 2, 00-193 Warszawa);\n\nInformacje o wymogu podania danych\n\nPodanie przez Państwa danych osobowych w zakresie wynikającym z art. 22 Kodeksu pracy jest niezbędne, aby uczestniczyć w postępowaniu rekrutacyjnym. Podanie przez Państwa innych danych jest dobrowolne.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Robotnik Budowlany",
        "category": "olx",
        "phone": "519348590",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Przedsiębiorstwo Budowlane ARKOP Sp. z o.o. SK jest polską firmą budowlaną z ponad 30 letnim doświadczeniem. Realizujemy w generalnym wykonawstwie przedsięwzięcia na terenie całego kraju z zakresu budownictwa ogólnego, przemysłowego,  mieszkaniowego i robót inżynieryjnych.\n\n \n\nPoszukujemy pracowników na stanowisko Robotnik Budowlany \n\nMiejsce pracy  miasto Warszawa\n\n \n\nWymagania: Doświadczenie  w pracach wykończeniowych typu układanie płytek, roboty tynkarskie , malarskie itp.\n\nOferujemy:\n\ninteresującą pracę w stabilnej firmie,\n\numowę o pracę\n\natrakcyjne wynagrodzenie adekwatne do umiejętności,\n\npakiet medyczny,\n\nkarty multisport ,\n\nszkolenia.\n\n \n\nUprzejmie prosimy Kandydatów o kontakt 519 348 590 lub przesłanie CV\n\n \n\nProsimy o dopisanie następującej klauzuli: \" Wyrażam zgodę na przetwarzania moich danych osobowych  i mojego wizerunku utrwalonego na zdjęciu w CV do celów tej rekrutacji , zgodnie z aktualnie obowiązującymi przepisami prawa, a w szczególności zgodnie z Kodeksem pracy i RODO .",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kaufland Warszawa ul. Stalowa - Menedżer Zespołu",
        "category": "olx",
        "phone": "713770919",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Menedżer Zespołu \n\nw Dziale Art. Spożywczych \n\nmarket w Warszawie, ul. Stalowa 60/64 \n\n \n\nJesteśmy międzynarodową firmą handlową, która stawia na efektywność, dynamikę i fair play. Nasz sukces w Polsce tworzy kilkanaście tysięcy zaangażowanych pracowników. Dołącz do nas! Zadbamy o Twoją przyszłość, oferując Ci rozwój zawodowy i możliwość wykorzystania Twoich mocnych stron.\n\n﻿Jakie będą Twoje zadania:\n\nodpowiedzialność za planowanie pracy, zarządzanie i właściwą komunikację w zespole oraz nadzór nad podległymi obszarami\nzagwarantowanie właściwego przygotowania działu do sprzedaży, przyjaznej i profesjonalnej obsługi klienta oraz wydajnej pracy pracowników działu\ndbanie o kluczowe wskaźniki ekonomiczne działu, w tym zapewnienie pozytywnego wyniku inwentaryzacyjnego\ndbałość o przestrzeganie wszystkich przepisów prawa dotyczących sprzedaży artykułów spożywczych, higieny, ochrony, w tym przestrzeganie przepisów prawa pracy, BHP oraz przepisów prawa gospodarczego\nzagwarantowanie prawidłowego i zgodnego z procedurami przebiegu składania i realizacji zamówień oraz przepływu towaru.\n\nCzego oczekujemy od Ciebie:\n\nminimum dwuletniego doświadczenia w handlu detalicznym (preferowane sieci super- i hipermarketów)\ndoświadczenia w zarządzaniu grupą pracowników, znajomości zasad prawidłowej komunikacji oraz umiejętności delegowania zadań\nskuteczności w osiąganiu wyznaczonych celów\ngotowości do podnoszenia kwalifikacji zawodowych\numiejętności obsługi komputera.\n\nCo Ci zapewnimy:\n\nCzekają na Ciebie ciekawe i odpowiedzialne zadania w dynamicznym zespole, gdzie panuje atmosfera wzajemnego szacunku. Obok różnorodnych możliwości rozwoju zapewnimy Ci atrakcyjne wynagrodzenie, bogaty pakiet benefitów (m.in. prywatną opiekę medyczną, kartę MultiSport, ubezpieczenie na życie na preferencyjnych warunkach, bony i upominki na święta) oraz umowę o pracę w wymiarze pełnego etatu.\n\n \n\nBuduj razem z nami przyszłość pełną sukcesów!\n\nAplikuj już dziś na www.kaufland.pl/kariera",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kaufland Warszawa ul. Stalowa - Młodszy Sprzedawca/Kasjer",
        "category": "olx",
        "phone": "226180220",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Młodszy Sprzedawca/Kasjer \n\nw Dziale Art. Spożywczych \n\nmarket w Warszawie ul. Stalowa 60/64 \n\n \n\nJesteśmy międzynarodową firmą handlową, która stawia na efektywność, dynamikę i fair play. Nasz sukces w Polsce tworzy kilkanaście tysięcy zaangażowanych pracowników. Dołącz do nas! Zadbamy o Twoją przyszłość, oferując Ci rozwój zawodowy i możliwość wykorzystania Twoich mocnych stron.\n\n﻿Jakie będą Twoje zadania:\n\nwykładanie towaru oraz dbanie o jego odpowiednią ekspozycję\nprzygotowywanie i umieszczanie prawidłowych oznaczeń cenowych\ndbanie o uprzejmą, staranną i sprawną obsługę klienta\ndbanie o świeżość i jakość naszych produktów, m.in. poprzez kontrolę terminów przydatności do sprzedaży\ndbanie o właściwą gospodarkę towarową w markecie.\n\nCzego oczekujemy od Ciebie:\n\nznajomości podstawowych zasad obsługi klienta\nenergicznej i przyjaznej osobowości\nsumienności i zaangażowania w wykonywaniu obowiązków\numiejętności pracy w grupie oraz znajomości zasad prawidłowej komunikacji z klientami i współpracownikami\ndoświadczenie na podobnym stanowisku będzie dodatkowym atutem.\n\nCo Ci zapewnimy:\n\nCzekają na Ciebie ciekawe i odpowiedzialne zadania w dynamicznym zespole, gdzie panuje atmosfera wzajemnego szacunku. Obok różnorodnych możliwości rozwoju zapewnimy Ci atrakcyjne wynagrodzenie, bogaty pakiet benefitów (m.in. prywatną opiekę medyczną, kartę MultiSport, ubezpieczenie na życie na preferencyjnych warunkach, bony i upominki na święta) oraz umowę o pracę w wymiarze 3/4 etatu.\n\n \n\nBuduj razem z nami przyszłość pełną sukcesów!\n\nAplikuj już dziś na www.kaufland.pl/kariera",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Barmanka/Barman W Oparach Absurdu",
        "category": "olx",
        "phone": "509324820",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "W Oparach Absurdu na warszawskiej Pradze poszukuje do swojego zgranego zespołu charyzmatycznych, przyciągających osobowością jak magnes barmanek i barmanów! Twórz z nami kultowe miejsce, słynące z bałkańskich rytmów przy Ząbkowskiej 6! Nie masz doświadczenia? Chcesz zacząć swoją przygodę z gastro? Super! Trafisz pod najlepsze skrzydła :) Prześlij CV drogą mailową i napisz kilka słów o sobie! Spotkajmy się, porozmawiajmy :) Do zobaczenia!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Barman/ Barmanka",
        "category": "olx",
        "phone": "605122094",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Obowiązki:\n\nObsługa klientów Bistro Sante,\nPrzygotowywanie i serwowanie napojów/ drinków,\nDbałość o asortyment baru, sporządzanie zamówień,\nObsługa kasy fiskalnej,\n\nWymagania:\n\nWysokie nastawienie pro-klienckie,\nWysoka kultura osobista, komunikatywność,\nGotować do pracy w systemie 2:2,\nMile widziane doświadczenie w branży bistro i aktualne badania sanepidu.\n\n \n\nOferujemy:\n\nAtrakcyjne warunki zatrudnienia, elastyczny grafik pracy,\nPraca zmianowa, również w weekendy,\nZniżki na produkty Sante oraz usługi Studio Sante.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Sprzedawca do nowo otwieranych Delikatesów GZELLA Warszawa ul.Wileńska",
        "category": "olx",
        "phone": "502440718",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "GZELLA NET Sp. z o.o. to największa sieć delikatesów mięsnych w Polsce.\n\nW celu świadczenia usług na wysokim poziomie, poszukujemy kandydatów\n\ndo Delikatesów Mięsnych na stanowisko\n\nSPRZEDAWCA\n\nNasze wymagania:\n\n• rzetelność i uczciwość,\n\n• łatwość nawiązywania kontaktów, umiejętność pracy w zespole,\n\n• doświadczenie na podobnym stanowisku będzie dodatkowym atutem,\n\n• mile widziana książeczka do celów sanitarno-epidemiologicznych.\n\nOpis zadań:\n\nOsoba zatrudniona na powyższym stanowisku odpowiedzialna będzie m.in. za: zapewnienie profesjonalnej obsługi klienta zgodnie ze standardami firmy, obsługę kasy fiskalnej, dbanie o estetyczny wygląd i właściwy sposób ekspozycji towarów oraz o czystość w sklepie.\n\nOferujemy:\n\n• umowę o pracę,\n\n• wynagrodzenie motywacyjne, zawierające m. in. premie i prowizje,\n\n• możliwość zatrudnienia na część etatu,\n\n• stabilność zatrudnienia,\n\n• kompleksowy pakiet szkoleń,\n\n• możliwość rozwoju zawodowego i osobistego,\n\n• dodatkowe świadczenia dla pracowników: karty przedpłacone, opieka medyczna.\n\nProsimy o zawarcie w CV poniższej klauzuli:\n\n„Niniejszym wyrażam zgodę na przetwarzanie przez Gzella Net Sp. z o.o. z siedzibą w Osiu, przy ul. Dworcowa 8 A moich danych osobowych zawartych w przesłanym/złożonym przeze mnie cv/liście motywacyjnym dla potrzeb niezbędnych do przeprowadzenia i realizacji procesu rekrutacji na stanowisko na które dotyczy moja aplikacja zgodnie z art. 6 ust. 1 lit. a rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE.”",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnię Elektromontera lub Pomocnika",
        "category": "olx",
        "phone": "604967615",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię Elektromontera lub Pomocnika.\n\nStała praca w stabilnej firmie.\n\nProszę o przesłanie CV na adres email.\n\nPodane wynagrodzenie do ręki. Praca w godzinach 7-17, dla chętnych również w soboty.\n\nAktualnie większy temat w okolicach Dworca Wileńskiego.\n\nSpóźnialskim dziękujemy.\n\nwww.elemi.pl",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Sprzątanie osiedli.",
        "category": "olx",
        "phone": "600420715",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma sprzątająca zatrudni Panów do pracy na terenie osiedli.\nPoszukujemy pracowników na ul. Żeglugi Wiślanej. \nPensie  2500 netto. \nChętnie osoby niepalące i z doświadczeniem.\nNke odpowiadamy na smsy i wiadomości olx.\nPreferujemy tylko konakt telefoniczny.\nTel. 600 420 715",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kucharz Szef Zmiany - Restauracja Boska Włoska Praga Północ",
        "category": "olx",
        "phone": "605589588",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy Szefa Zmiany (Kucharza) do restauracji Boska Włoska mieszczącej się przy Koneserze na Pradze Północ. \n\nNasze oczekiwania:\n\n- doświadczenie na danym stanowisku min. 3 lata\n- umiejętność zarządzania zespołem, zatowarowaniem, dobra organizacja pracy\n- znajomosć kuchni włoskiej (pizza, pasta)\n- wprowadzanie zmian w menu, nowości, wkładki sezonowe\n- poszukujemy osoby do długofalowej współpracy \n\nOferujemy:\n\n- stabilne warunki pracy - mimo pandemii nadal funkcjonujemy, prowadzimy 3 funkcjonujące restauracje oraz jesteśmy w trakcie przygotowań do otwarcia kolejnych 2 punktów\n- wynagrodzenie od 25 do 30 pln netto/h\n- umowę o pracę, choć najchętniej samozatrudnienie (wówczas szczegóły wynagrodzenia brutto ustalamy indywidualnie)\n- dobrą atmosferę pracy, stały zespół\n- możliwość rozwoju w strukturach firmy\n\nOsoby zainteresowane prosimy o przesłanie CV z danymi kontaktowymi. Skontaktujemy się tylko z wybranymi osobami.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Elektryk (szafy sterownicze) Bayreuth od Zaraz",
        "category": "olx",
        "phone": "15167339733",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "DAAR Personal Service GmbH jest liderem w branży HR na niemieckim rynku. Każdego roku dzięki nam pracę na terenie Niemiec podejmuje kilka tysięcy osób. W branży rekrutacyjnej działamy od 7 lat, a z każdym rokiem działalności wzrasta liczba pracowników i firm, które nam zaufały. Posiadamy niemiecki certyfikat wydany przez Bundesagentur für Arbeit.\n\nObecnie poszukujemy pracowników na stanowisko:\n\nElektryk (szafy sterownicze) Bayreuth od Zaraz\n\nZADANIA:\n• Okablowanie szaf sterowniczych zgodnie z planem• Produkcja elementów mechanicznych do szaf sterowniczych• Rozpoznawać i korygować błędy w technologii schematów połączeń• Profesjonalne wykonanie zmian schematów\n Praca na dlugo!\n- Wymagana szkola kierunkowa jako elektryk\n- Doswiadczenie zawodowe jako elektyk minumim 3 Lata\n- Auto na dojazd do pracy konieczne\n- Jezyk Niemiecki Komunikatywny B1 konieczny\n\nOFERUJEMY:\nZatrudniamy na podstawie niemieckiej umowy o pracę, wynagrodzenie w wysokości około od 12,40 do 13 euro brutto na godzinę i diete od 44 do 70€ netto za kazdy przepracowany dzien.\nMozliwosc Zaliczek\nNie prowadzimy Zeitkonta.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnię fachowców na doćieplenia budynków fasady, Elewacje zabytkowe",
        "category": "olx",
        "phone": "503626119",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnienie ,pracowników na docieplenia budynków (Elewacje, Fasady zabytkowe ) ,  brygady,tynkarzy do tynków cementowych na fasadach możliwość kwaterunku ,503626119 możliwość  tygodniówek praca od zaraz",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Ekspedient Alkohole 24h",
        "category": "olx",
        "phone": "519774589",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy energicznych osób do sklepu z alkoholami 24H.\n\n \n\nLokalizacja Praga Południe , Praga Północ , Wola\n\n \n\nstawka 15 zł netto\n\noferujemy:\n\n-umowa o prace\n\n-stabilne zatrudnienie\n\n-praca zmianowa \n\n-prace w dobrej atmosferze\n\n-stawka godzinowa  \n\n \n\nWymagania\n\n \n\n- odpowiedzialnośc\n\n- dyspozycyjność\n\n- punktualność\n\n- komunikatywność i pozytywne nastawienie\n\n- Mile widziane doświadczenie w handlu detalicznym.\n\n- elastyczność, obowiązkowość i chęć pracy w zespole.\n\n- miła aparycja\n\n \n\nOferta pracy od zaraz\n\nMożliowśc pracy dorywczej",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Opiekun Toru Gokartowego - A1Karting Białołęka",
        "category": "olx",
        "phone": "222903388",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Chcesz pracować w ciekawej branży? Chcesz uniknąć rutyny i pracy za biurkiem? Jeśli do tego jesteś otwarty, komunikatywny i lubisz pracę z ludźmi - zapraszamy! Dołącz do naszego team'u pracowników największego Centrum rozrywkowo-eventowego w Warszawie.\n\nZakres obowiązków\n\n– zarządzanie ruchem na torze gokartowym\n\n– prowadzenie szkoleń/briefingów z zasad bezpieczeństwa panujących na torze\n\n– dbanie o czystość hali i floty gokartów\n\nWymagania:\n\n– dobra kondycja fizyczna\n\n– wysoka kultura osobista\n\n– dyspozycyjność (praca zmianowa)\n\n– umiejętności pracy w zespole\n\n-mile widziana znajomość j. angielskiego",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Stolarz / Montażysta",
        "category": "olx",
        "phone": "505129225",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Nasza firma zajmuje się projektowaniem i produkcją mebli,\n\nstoisk i kasetonów reklamowych, konstrukcji z metalu\n\noraz wielu innych nietypowych rzeczy.\n\nRealizujemy projekty na indywidualne zlecenie klienta.\n\nDo Twoich zadań będzie należeć:\n\n-wykonanie mebli zgodnie z rysunkiem technicznym;\n\n-obsługa maszyn stolarskich;\n\n-montaż mebli u klienta.\n\nOczekujemy od Ciebie:\n\n-doświadczenie w pracy przy pracach stolarskich i montażu mebli;\n\n-dobra znajomość obsługi maszyn stolarskich;\n\n-umiejętność czytania dokumentacji technicznej;\n\n-prawo jazdy kat. B;\n\n-odpowiedzialność.\n\nCo możemy Ci zaoferować:\n\n-dobrą atmosferę pracy;\n\n-atrakcyjne wynagrodzenie;\n\n-zdobywanie doświadczenia i rozwój osobisty.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Malarza-szpachlarza",
        "category": "olx",
        "phone": "691222269",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma zatrudni pracownika do prac wykończeniowych takich jak malowanie, szpachlowanie, gładzie, sufity podwieszane, ścianki g/k.\nPraca od już, na terenie Warszawy. Rozliczenie płatne tygodniowo co piątek. \nZainteresowanych proszę o kontakt tel. 691-222-269 Darek",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pracownik ochrony fizycznej - Warszawa Powiśle",
        "category": "olx",
        "phone": "606272710",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy osoby na stanowisko: Pracownik ochrony fizycznej\n\nMiejsce pracy: Warszawa Powiśle\n\nZakres obowiązków:\n\nOchrona powierzonego mienia\nObchody na terenie obiektu\nObsługa monitoringu wizyjnego CCTV\n\nWymagania:\n\nSumienność\nChęci do pracy\nDyspozycyjność\n\nOferujemy:\n\nWynagrodzenie na poziomie 19 zł netto/h\nPracę w godzinach 14:00-7:00\nElastyczny grafik\nSzkolenie wprowadzające\n\nZainteresowanych zachęcamy do aplikowania przez portal. W przypadku pytań zapraszamy do kontaktu telefonicznego.\n\nZłożenie dokumentów aplikacyjnych na wskazane w ogłoszeniu stanowisko stanowi wyrażenie zgody na przetwarzanie Pani/Pana danych osobowych w toku postępowania rekrutacyjnego, w którym Pani/Pan aplikuje.\n\nW przypadku zgody na udział w innych procesach rekrutacyjnych prosimy dodatkowo o umieszczenie poniższej klauzuli:  \n\nWyrażam zgodę na przetwarzanie moich danych osobowych zawartych w dokumentach aplikacyjnych przez Solid Security Sp. z o. o. z siedzibą w Warszawie ul. Postępu 17 w celu przeprowadzenie kolejnych procesów rekrutacyjnych na inne stanowiska pracy w spółce Solid Security Sp. z o. o.\n\nKlauzula Informacyjna \n\n1. Administratorem Pani/Pana danych osobowych jest Solid Security Sp. z o. o. („ADO”)\n\nDane kontaktowe: ul. Postępu 17, 02-676 Warszawa\n\n2. ADO powołał Inspektora Ochrony Danych, z którym może się Pani/Pan skontaktować za pośrednictwem poczty elektronicznej, adres e-mail Inspektora Ochrony Danych: iod[at]solidsecurity.pl  \n\n3. Państwa dane osobowe w zakresie wskazanym w przepisach prawa pracy będą przetwarzane w celu przeprowadzenia obecnego postępowania rekrutacyjnego, natomiast inne dane, w tym dane do kontaktu, na podstawie zgody, która może zostać odwołana w dowolnym czasie.\n\nADO będzie przetwarzała Państwa dane osobowe, także w kolejnych naborach pracowników jeżeli wyrażą Państwo na to zgodę, która może zostać odwołana w dowolnym czasie.\n\nJeżeli w dokumentach zawarte są dane, o których mowa w art. 9 ust. 1 RODO konieczna będzie Państwa zgoda na ich przetwarzanie, która może zostać odwołana w dowolnym czasie.\n\n4. Odbiorcami Pani/Pana danych osobowych mogą być: podmioty, które na podstawie stosownych umów podpisanych z ADO przetwarzają dane osobowe dla których administratorem danych osobowych jest ADO, tj. m.in. agencje pracy, firmy księgowe, kancelarie prawne oraz dostawcy usług IT.\n\n5. Państwa dane zgromadzone w obecnym procesie rekrutacyjnym będą przechowywane do zakończenia procesu rekrutacji.\n\nW przypadku wyrażonej przez Państwa zgody na wykorzystywane danych osobowych dla celów przyszłych rekrutacji, Państwa dane będą wykorzystywane przez 12 miesięcy.\n\n6. Mają Państwo prawo do:\n\n- dostępu do swoich danych oraz otrzymania ich kopii\n\n- sprostowania (poprawiania) swoich danych osobowych;\n\n- ograniczenia przetwarzania danych osobowych;\n\n- usunięcia danych osobowych;\n\n- do wniesienia skargi do Prezes UODO (na adres Urzędu Ochrony Danych Osobowych, ul. Stawki 2, 00 - 193 Warszawa).\n\nW zakresie w jakim Pani/Pana dane osobowe przetwarzane są na podstawie udzielonej przez Panią/Pana zgody, ma Pani/Pan prawo cofnąć udzieloną zgodę w dowolnym momencie, bez wpływu na zgodność z prawem przetwarzania, którego dokonano na podstawie zgody przed jej cofnięciem.\n\n7. Podanie przez Państwa danych osobowych w zakresie wynikającym z art. 221 Kodeksu pracy jest niezbędne, aby uczestniczyć w postępowaniu rekrutacyjnym. Podanie przez Państwa innych danych jest dobrowolne.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "ATELIER sukien ślubnych - praca dla krawcowej",
        "category": "olx",
        "phone": "507000507",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy wszechstronnej krawcowej do naszego Atelier w Warszawie, który wzmocni nasz zespół.\n\nJesteśmy firmą, która specjalizuje się w szyciu na miarę sukien plus size w najwyższym standardzie.\n\nWYMAGANE:\n\ndoświadczenie w szyciu sukien ślubnych i wieczorowych na miarę\nDoświadczenie w szyciu miarowym (szycie od A-Z; krojenie; stopniowanie; haftowanie)\ndoświadczenie w obsłudze klientek\nzdolności manualne takie jak umiejętność szycia ręcznego\nwysoka kultura osobista\nstaranność i samodzielność w pracy\n\nGWARANCJA:\n\npraca na stałe\nmożliwości rozwoju i nauki nowych umiejętności krawieckich\nzatrudnienie na umowę o pracę\npakiet medyczny\nmiła atmosfera\npraca od 10.00 do 18.00 lub od 9.00 do 17.00\n\nwynagrodzenie netto: 2500zł do 3000zł",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Obsługa maszyn stolarskich - DO PRZYUCZENIA!",
        "category": "olx",
        "phone": "502398363",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Hurtownia płyt i okuć meblowych zatrudni pracowników na stolarnię. Nie wymagamy doświadczenia!!! Nauczymy wszystkiego od podstaw. Obsługa maszyn stolarskich, okleiniarki, piły panelowej. Praca w pełnym wymiarze, umowa o pracę. Praca od zaraz. Zainteresowanych proszę o przesłanie CV lub o kontakt telefoniczny nr 502398363",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Specjalista ds. obsługi sprzedaży",
        "category": "olx",
        "phone": "664434485",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": " \n\nJesteśmy wiodącą na rynku firmą branży gazów technicznych oraz technologii ich zastosowań, należącą do światowego koncernu Messer Group GmbH, działającą na rynku polskim od 1992 roku.\n\nMając na uwadze dynamiczny i szybki rozwój naszej firmy poszukujemy kandydatów na stanowisko:\n\n \n\nSpecjalista ds. Obsługi Sprzedaży\n\n Osoba zatrudniona na tym stanowisku pracy będzie odpowiedzialna między innymi za:\n\nprzygotowywanie dokumentacji handlowej\nkodowanie danych do systemów informatycznych\ntelefoniczną obsługę klientów\narchiwizację dokumentów\nobsługę narzędzi sprzedażowych\newidencję korespondencji przychodzącej i wychodzącej Działu\n\n \n\nWymagania:\n\nwykształcenie min. średnie\nmile widziane doświadczenie na podobnym stanowisku\nkomunikatywna znajomość języka angielskiego lub niemieckiego\nbardzo dobra znajomość MS Office\nsamodzielność i inicjatywa w działaniu\n\n \n\nOferujemy:\n\nzatrudnienie na podstawie umowy o pracę\npracę od poniedziałku do piątku\npracę w międzynarodowym środowisku\n\nJeżeli zainteresowała Cię ta oferta pracy - kliknij APLIKUJ TERAZ i wyślij CV poprzez nasz system rekrutacyjny. Jeśli masz jakiekolwiek pytania lub problem z wysłaniem CV, możesz skontaktować się z nami telefonicznie. Pracujemy od poniedziałku do piątku w godzinach 8:00-16:00.\n\n \n\nAdministratorem danych osobowych jest Messer Polska Sp. z o.o. z siedzibą w Chorzowie ul. Maciejkowicka 30. Dane kontaktowe inspektora ochrony danych abi[at]messer.pl. Wyrażam zgodę na przetwarzanie podanych danych osobowych w celu rekrutacji kandydatów do pracy w Messer Polska Sp. z o.o. oraz podmiotów należących do Messer Group. Dane będą udostępniane podmiotom należącym do Messer Group. Dane będą przetwarzane w czasie trwania bieżących procesów rekrutacyjnych jak i również prowadzonych w przyszłości. Wyrażenie zgody jest dobrowolne i może być odwołane w każdym czasie.\n\nMam prawo do sprostowania, usunięcia lub ograniczenia przetwarzania, prawo do wniesienia sprzeciwu wobec przetwarzania, prawo do przenoszenia danych oraz prawo wniesienia skargi do organu nadzorczego. Mam prawo do wglądu, komu i w jakim zakresie moje dane zostały udostępnione oraz o zakresie udostępnienia.\n\n ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca Na Myjni Ręcznej",
        "category": "olx",
        "phone": "512459410",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Praca na myjni ręcznej  Pon-Pią 9-18 \nWynagrodzenie do 30% \nNajchętniej doświadczeniem",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "BOTA bistro zatrudni kelnerów z pasją / restauracja na Pradze",
        "category": "olx",
        "phone": "664906486",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "BOTA bistro - restauracja na warszawskiej Pradze poszukuje kelnerów do stałej współpracy.\n\nMamy doświadczoną ekipę, z którą przeszliśmy całą pandemię, ludzie są dla nas ważni, także jeśli poszukujesz czegoś „na chwilę” i nie planujesz związania się z nami na dłużej - prosimy nie aplikuj do nas ;)  Aktualnie czasami brakuje nam rąk do pracy i chcielibyśmy zatrudnić kogoś, kto odciąży naszych kelnerów. Mile widziane doświadczenie, ale chętnie też przyuczymy w wielu kwestiach. \n\n*Typ kuchni - streetfood (w menu mamy między innymi bowle, pizzę, pierogi, kanapki) \n\n*Luźna i przyjazna atmosfera w lokalu \n\nCO OFERUJEMY?\n\n•stabilne i pewne wynagrodzenie (stawka uzależniona od umiejętności - jesteśmy otwarci na rozmowę)\n\n•możliwość zatrudnienia na umowę o pracę - poczatkowo okres próbny umowa zlecenie\n\n•możliwość pracy w nowym i ciekawym miejscu na mapie Warszawy\n\nOCZEKIWANIA:\n\n•pozytywne nastawienie\n\n•chęci do pracy\n\n•zaangażowanie\n\n•punktualność\n\nOsoby zainteresowane prosimy o przesłanie CV.\n\nSkontaktujemy się tylko z wybranymi kandydatami.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Asystentka ds. marketingu internetowego",
        "category": "olx",
        "phone": "602744310",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Jesteśmy zespołem pasjonatów marketingu internetowego. Dbamy o zwiększenie widoczności Klientów w sieci. Realizujemy kampanie SEM, pozycjonowanie stron, optymalizację SEO, budowę stron www i platform e-commerce. Wspieramy biznes Klientów w dostarczaniu kalorycznych treści, lubimy kreować graficzny wizerunek Klientów poprzez unikatowe spójne z marką grafiki, filmy czy kampanie video. Cechuje nas pełne zaangażowanie w poszukiwanie najskuteczniejszych rozwiązań, identyfikujemy się z potrzebami biznesu i chętnie dzielimy się wiedzą.\n\nDo naszego zespołu poszukujemy ambitnego Asystentki ds. marketingu internetowego ( reklama SEM, pozycjonowanie SEO, strony www, e- sklepy)\n\nMiejsce pracy: Warszawa, Bródno\n\nOpis stanowiska:\n\n•\tOpracowywanie ofert handlowych\n\n•\tUmawianie rozmów sprzedażowych\n\n•\tWsparcie działań administracyjno-biurowych\n\n•\tZarządzanie kalendarzem spotkań\n\n•\tDziałania social media\n\nWymagania:\n\n•\tMin. 3 lata doświadczenia na stanowisku administracyjnym\n\n•\tDobra znajomość obowiązujących trendów marketingu internetowego, sprzedaży internetowej,\n\n•\tDobra znajomość języka angielskiego,\n\n•\tDoskonałe umiejętności komunikacyjne,\n\n•\tDoświadczenie w prowadzeniu kampanii social media\n\n•\tSamodzielność i konsekwencja w działaniu\n\nOferujemy:\n\n•\tpracę stacjonarną\n\n•\tdogodną formę współpracy: umowa o pracę / umowa B2B,\n\n•\tudział w szkoleniach wewnętrznych i zewnętrznych,\n\n•\tonboarding i udział w programie Academy Skills,\n\n•\tmożliwość awansu w oparciu o indywidualną ścieżkę talentową\n\n• praca w kreatywnym, ambitnym zespole pasjonatów marketingu internetowego\n\nChętnie poznamy Twoje doświadczenie i motywację dołączenia do naszego zespołu Prześlij swoje CV na adres:",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnię kierowcę - transport kontenerów morskich",
        "category": "olx",
        "phone": "508743055",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam,\n\nZatrudnię kierowcę do transportu kontenerów morskich\n\nPobieranie i zdawanie kontenerów z jednego terminala w Warszawie\n\nStałe i powtarzalne trasy\n\nNieduże przebiegi\n\nTel. 508743055",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kurier Warszawa Praga okolice",
        "category": "olx",
        "phone": "512087936",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "PRACA SZUKA CZŁOWIEKA !!\n\nChcesz zdobyć pierwsze doświadczenie? Jazda samochodem sprawia Ci przyjemność ? Jeżeli tak to szukamy właśnie Ciebie więc nie czekaj dołącz do naszego zespołu !! Oferujemy stabilne zatrudnienie\n\nAtrakcyjne wynagrodzenie 3,5tyś – 4 tyś \n\nStanowisko : kurier\n\nRejon: WARSZAWA - PRAGA północ / OKOLICE\n\nSzkolenie wprowadzające\n\nUmowę zlecenie ?? czy na umowę ?? lub mile widziane B2B – w przypadku B2B zapewniamy pomoc w zakładaniu oraz prowadzeniu własnej działalności gospodarczej\n\nKONTAKT 512 087 936 Michał // 573 441 863 Krystian",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Recepcjonistka/ta - Warszawa Praga Północ",
        "category": "olx",
        "phone": "609903415",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy osoby na stanowisko: Recepcjonistka/ta\n\nMiejsce pracy: Warszawa Praga Północ\n\nZakres obowiązków:\n\nObsługa klienta\nZarządzanie obiegiem korespondencji przychodzącej i wychodzącej\nWyrabianie kart lojalnościowych oraz podarunkowych \nObsługa centrali telefonicznej oraz skrzynki mailowej\nMonitorowanie zaopatrzenia firmy w materiały biurowe\nInne prace administracyjne \n\n \n\nWymagania:\n\nMile widziane doświadczenie na stanowisku pracownika recepcji\nNiekaralność\nSamodzielność, dyspozycyjność, odpowiedzialność\nSumienność i zaangażowanie w wykonywanie powierzonych obowiązków\nUmiejętność działania w sytuacjach stresowych\nWysoka kultura osobista\nUmiejętność pracy w zespole\n Znajomość języka angielskiego w stopniu komunikatywnym\n\n \n\nOferujemy:\n\nPracę na pół etatu\nDogodny system pracy . \nWynagrodzenie na poziomie 21,30 zł brutto/h\nWdrożenie stanowiskowe pod opieką przełożonego \nTerminową realizację świadczeń wynikających z umowy \nWspółpracę z renomowanym klientem \nStabilność zatrudnienia \nMożliwość rozwoju i awansu\n\nZainteresowanych zachęcamy do aplikowania przez portal. W przypadku pytań zapraszamy do kontaktu telefonicznego.\n\nZłożenie dokumentów aplikacyjnych na wskazane w ogłoszeniu stanowisko stanowi wyrażenie zgody na przetwarzanie Pani/Pana danych osobowych w toku postępowania rekrutacyjnego, w którym Pani/Pan aplikuje.\n\nW przypadku zgody na udział w innych procesach rekrutacyjnych prosimy dodatkowo o umieszczenie poniższej klauzuli:  \n\n Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w dokumentach aplikacyjnych przez GST Sp. z o. o. z siedzibą w Warszawie ul. Al. Jerozolimskie 212A w celu przeprowadzenie kolejnych procesów rekrutacyjnych na inne stanowiska pracy w spółce GST Sp. z o. o.\n\n Klauzula Informacyjna \n\n 1. Administratorem Pani/Pana danych osobowych jest GST Sp. z o. o. („ADO”)\n\n Dane kontaktowe: ul. Al. Jerozolimskie 212A, Warszawa \n\n 2. ADO powołał Inspektora Ochrony Danych, z którym może się Pani/Pan skontaktować za pośrednictwem poczty elektronicznej, adres e-mail Inspektora Ochrony Danych: iod.gss[at]solidsecurity.pl  \n\n 3. Państwa dane osobowe w zakresie wskazanym w przepisach prawa pracy będą przetwarzane w celu przeprowadzenia obecnego postępowania rekrutacyjnego, natomiast inne dane, w tym dane do kontaktu, na podstawie zgody, która może zostać odwołana w dowolnym czasie.\n\n ADO będzie przetwarzała Państwa dane osobowe, także w kolejnych naborach pracowników jeżeli wyrażą Państwo na to zgodę, która może zostać odwołana w dowolnym czasie.\n\n Jeżeli w dokumentach zawarte są dane, o których mowa w art. 9 ust. 1 RODO konieczna będzie Państwa zgoda na ich przetwarzanie, która może zostać odwołana w dowolnym czasie.\n\n 4. Odbiorcami Pani/Pana danych osobowych mogą być: podmioty, które na podstawie stosownych umów podpisanych z ADO przetwarzają dane osobowe dla których administratorem danych osobowych jest ADO, tj. m.in. agencje pracy, firmy księgowe, kancelarie prawne oraz dostawcy usług IT.\n\n 5. Państwa dane zgromadzone w obecnym procesie rekrutacyjnym będą przechowywane do zakończenia procesu rekrutacji.\n\n W przypadku wyrażonej przez Państwa zgody na wykorzystywane danych osobowych dla celów przyszłych rekrutacji, Państwa dane będą wykorzystywane przez 12 miesięcy. \n\n 6. Mają Państwo prawo do:\n\n- dostępu do swoich danych oraz otrzymania ich kopii\n\n- sprostowania (poprawiania) swoich danych osobowych;\n\n- ograniczenia przetwarzania danych osobowych;\n\n- usunięcia danych osobowych;\n\n- do wniesienia skargi do Prezes UODO (na adres Urzędu Ochrony Danych Osobowych, ul. Stawki 2, 00 - 193 Warszawa).\n\nW zakresie w jakim Pani/Pana dane osobowe przetwarzane są na podstawie udzielonej przez Panią/Pana zgody, ma Pani/Pan prawo cofnąć udzieloną zgodę w dowolnym momencie, bez wpływu na zgodność z prawem przetwarzania, którego dokonano na podstawie zgody przed jej cofnięciem.\n\n 7. Podanie przez Państwa danych osobowych w zakresie wynikającym z art. 221 Kodeksu pracy jest niezbędne, aby uczestniczyć w postępowaniu rekrutacyjnym. Podanie przez Państwa innych danych jest dobrowolne.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Asystent/ka ds. Procesów Finansowych",
        "category": "olx",
        "phone": "510873011",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Jeżeli:\n\nPosiadasz wykształcenie średnie lub jesteś w trakcie studiów;\nZnasz j. angielski lub francuski na poziomie komunikatywnym;\nZnasz pakiet MS Office;\nPotrafisz rozwiązywać problemy i wyciągać wnioski na podstawie dostępnych informacji;\nMasz wysoko rozwinięte zdolności interpersonalne.\n\nBędziesz odpowiedzialny za:\n\nRozliczenia oraz weryfikację poprawności rozliczeń z dostawcami;\nWindykację i rozwiązywanie kwestii spornych z dostawcami;\nPotwierdzanie sald z dostawcami;\nAnalizę wezwań do zapłaty;\nMonitoring i bieżącą analizę danych finansowych w systemach;\nZabezpieczenie należności finansowych firmy;\nWsparcie innych działów w zakresie rozliczeń z dostawcami.\n\nOferujemy:\n\nZatrudnienie w oparciu o umowę zlecenie;\nMożliwość zdobycia praktycznego doświadczenia w obszarze finansów; \nDogodny dojazd do biura - Centrala mieści się przy drugiej linii metra;  \nMożliwość przyłączenia się do licznych inicjatyw na rzecz społeczności lokalnych poprzez Fundację Leroy Merlin Polska.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnimy elektromonterów/elektryków",
        "category": "olx",
        "phone": "605062165",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zakres obowiązków:\n\n - wykonywanie instalacji elektrycznych \n\n - wykonywanie instalacji teletechnicznych \n\nWymagania:\n\n - doświadczenie przy wykonywaniu instalacji elektrycznych i teletechnicznych \n\n - uprawnienia eksploatacyjne E lub D \n\n - umiejętność przygotowania dokumentacji technicznej \n\n - praktyczne rozumienie rysunków technicznych urządzeń i instalacji \n\n - prawo jazdy kat. B \n\n - wysoka kultura osobista \n\n - mile widziane: doświadczenie przy uruchamianiu systemów SSP, CCTV, SSWiN i LAN oraz znajomość automatyki przemysłowej \n\nKorzyści:\n\n - praca w stabilnej firmie \n\n - dostęp do szkoleń podwyższających kwalifikacje \n\n - realizacja ciekawych i ambitnych projektów \n\n - atrakcyjne wynagrodzenia",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "PILNE kucharz Sushi. Cala warszawa",
        "category": "olx",
        "phone": "793717077",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam,\n\nSzukamy kucharza Sushi. Dobre lokalizacje blisko metra. (Zoliborz,praga,mokotow, wkrotce: ursynow)\n\nMozliwosc wyplaty dniowek / platny dzien probny.\n\nPrzyjdz, pogadamy. Mamy mocno rozwojowy projekt.\n\nPrzemek\n793717077",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca dla mlodziezy i studentow",
        "category": "olx",
        "phone": "575734610",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam!Praca dla młodzieży nie wymagamy doświadczenia.Praca w fundacji polegająca na zbiórce datków do puszek.Jedyny warunek to sumienność i uczciwość w wykonywanych zadaniach.Praca od zaraz!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "zatrudnię kominiarza",
        "category": "olx",
        "phone": "514005867",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię w charakterze kominiarza mile widziane doświadczenie w pracy kominiarskiej lub budowlanej, wymagane prawo jazdy kat.b.Proszę o kontakt pod numerem tel.501206581.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Sprzedawca/magazynier do sklepu z fajkami wodnymi",
        "category": "olx",
        "phone": "730010250",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Dzień dobry,\n\nFirma Cybuch istnieje od 2,5 roku. Jesteśmy najbardziej profesjonalnym sklepem shishowym w Polsce. Cały czas się rozwijamy i otwieramy na kolejne rynki.\n\nSzukamy osoby na stanowisko sprzedawca/magazynier. W początkowym etapie będzie to praca magazynowo-porządkowa. Po zdobyciu wymaganej wiedzy, również jako sprzedawca. Zależy nam na osobie która znajdzie swoje miejsce zespole i będzie się w tym specjalizować.\n\nWymagania:\n\nzamiłowanie do fajki wodnej\njęzyk angielski na przynajmniej podstawowym poziomie\nchęć do pracy\ndobra organizacja stanowiska pracy\ndyspozycyjność\n\nNienormowany czas pracy od poniedziałku do soboty w godzinach 8-20. Możliwość ustalenia grafiku.\n\nWynagrodzenie zależne od umiejętności i zaangażowania do pracy.\n\nMożliwość szybkiego awansu w zależności od wyników.\n\nZnajdujemy się na ulicy Jagiellońska 78 w Warszawie.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Osobę do pracy na myjni samochodowej Warszawa-Żerań",
        "category": "olx",
        "phone": "512723141",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma zatrudni osobę do pracy na myjni samochodowej w serwisie samochodowym na Warszawskim Żeraniu. Praca od poniedziałku do piątku . Mile widziane prawo jazdy kat \"B\"",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pizzer / Pizzermen / Pizzaiolo",
        "category": "olx",
        "phone": "570644944",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy Pizzermana do naszego zespołu w klubokawiarni.\n\nJeśli uwielbiasz pracę na kuchni a dodatkowo:\n\nrzetelne wykonujesz powierzone Ci zadania\ndbasz o świeżość produktów\njesteś dobrze zorganizowany/na\n\nOd nas dostaniesz :\n\npracę w młodym zespole\nelastyczne godziny pracy\nsatysfakcję z wykonywanej pracy\nwynagrodzenie dostosowane do umiejętności i doświadczenia\nmożliwość rozwoju\n\nWymagania:\n\n• Aktualna książeczka do celów sanitarno-epidemiologicznych\n\n• Umiejętność pracy z ludźmi\n\nZainteresowany/na śmiało wyślij swoje Cv czekamy na Ciebie :)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Stylistke paznokci",
        "category": "olx",
        "phone": "608453689",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy manicurzystke do zespołu fryzjersko-kosmetycznego. \nSalon posiada stała bazę klientów, pracuje na produktach Indigo z możliwością uzupełnienia asortymentu w sprawdzone inne marki. \n\nWymagamy: \nMiłej aparycji \nDoświadczenia w manicure, pedicure i przedłużaniu paznokci \nkomunikacji w języku polskim \nDyspozycyjności \n\nKontakt: \n608453689",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Barman / Barback",
        "category": "olx",
        "phone": "608336944",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Potrzebuję osoby chętnej do pracy lub/i nauki na stanowisku Barbacka/Barmana. Kogoś kto jest uśmiechnięty i lubi ludzi.\nPraca w klubie lub pomoc przy obsłudze barmańskiej eventów.\nWszystkiego nauczę. Mile widziane \nprawo jazdy.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "STAŁA praca - roznoszenie ulotek",
        "category": "olx",
        "phone": "797483503",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy do pracy na stałe przy kolportażu ulotek (gazetek) w blokach do euro skrzynek w domkach jednorodzinnych do furtki.\n\nOferujemy:\n\nStałą pracę - 8 h dzień pracy (5-6 dni w tygodniu\nAtrakcyjne wynagrodzenie\nSystem premiowy\n\nPoszukujemy osób:\n\nPełnoletnich\nRzetelnych i uczciwych\nSprawnych fizycznie\n\nZatrudnimy osoby z Marek, Wołomina, Ząbek, Radzymina, Kobyłki, Zielonki, Tłuszcza, Warszawy (Targówek, Bemowo, Ochota)\n\nProsimy o kontakt tylko telefoniczny 797-483-503. Nie odpowiadamy na maile!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Przedstawiciel Handlowy/Konsultant",
        "category": "olx",
        "phone": "226198613",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma KTG SEMIGAT S.A. która od 1987 roku specjalizuje się w dziedzinie higieny, dezynfekcji i sterylizacji oraz zaopatruje placówki służby zdrowia w sprzęt i materiały eksploatacyjne poszukuje kandydatów na stanowisko:\n\nPRZEDSTAWICIEL HANDLOWY/KONSULTANT:\n\nWymagania:\n\n·        Wykształcenie średnie;\n\n·        Prawo jazdy kat. B- warunek konieczny;\n\n·        Umiejętności obsługi komputera (MS Office);\n\n·        Dyspozycyjność;\n\n·        Umiejętność nawiązywania i utrzymywania długotrwałych kontaktów handlowych;\n\n·        Bardzo dobra organizacja pracy i wewnętrzna dyscyplina, umiejętność planowania i wyznaczania priorytetów, terminowość;\n\n·        Umiejętność szybkiego przyswajania nowych informacji;\n\n·        Doskonałe umiejętności interpersonalne;\n\n·        Wysoka kultura osobista;\n\n·        Umiejętność pracy w zespole.\n\nMile widziane:\n\n·        Doświadczenie na stanowisku - Przedstawiciel Handlowy, Konsultant, Opiekun Klienta;\n\nGłówne obowiązki:\n\n·        Promocja produktów Firmy na rynku medycznym na wyznaczonym terenie, realizacja planów sprzedaży na przydzielonym obszarze;\n\n·        Realizacja wspólnie ustalonych celów sprzedażowych dla regionu wyznaczanych co miesiąc\n\n·        Nawiązywanie i utrzymywanie kontaktów z klientami, umacnianie wizerunku firmy;\n\n·        Generowanie oraz analiza raportów;\n\n·        Prowadzenie szkoleń i prezentacji produktów dla personelu medycznego;\n\n·        Inne zadania zlecone przez przełożonego.\n\nOferujemy:\n\n·        Umowę o pracę;\n\n·        Wynagrodzenie podstawowe + system premiowy\n\n·        Szkolenie produktowe;\n\n·        Narzędzia niezbędne do wykonywania pracy (m.in. samochód służbowy, telefon komórkowy).\n\nWszystkie osoby spełniające ww. wymagania prosimy o przesłanie swojej aplikacji zawierającej CV wraz ze zdjęciem.\n\nZgłoszenia prosimy bezzwłocznie przesyłać za pośrednictwem portalu OLX.pl\n\nUprzejmie informujemy, że skontaktujemy się z wybranymi osobami.\n\nProsimy o dopisanie następującej klauzuli: \"Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w ofercie pracy dla potrzeb procesu rekrutacji zgodnie z ustawą z dnia 27.08.1997r. Dz. U. z 2002 r., Nr 101, poz. 923 ze zm.\"",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Salon Kosmetologii i laseroterapii zatrudni Kosmetologa",
        "category": "olx",
        "phone": "507599555",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Salon Medycyny Estetycznej W Warszawie  zatrudni na stanowisku Kosmetolog  i Młodszy Kosmetolog. Wymagania: wykształcenie kierunkowe, umiejętności interpersonalne oraz wysoka kultura osobista, chęć rozwijania się w dynamicznie rozwijającej się branży. Mile widziane doświadczenie zawodowe.\n\nOferujemy dostęp do najnowocześniejszych technologii i szkoleń, oraz możliwość rozwoju zawodowego.. Zastrzegamy że odpowiemy tylko na wybrane oferty.\n\nCv ze zdjęciem proszę przesłać na adres e-mail.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca w ochronie - Praga Północ",
        "category": "olx",
        "phone": "501461306",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Ogólnopolska Agencja Ochrony D.S FOKUS Sp. z o.o. poszukuje: Pracowników Ochrony na obiekt handlowy na terenie Warszawy.\n\nZapewniamy: \n\nciekawą, pełną wyzwań pracę \n\nmożliwość rozwoju zawodowego \n\nOczekiwania: \n\nmile widziane doświadczenie na podobnym stanowisku \n\numiejętność pracy w stresie \n\nwysoki poziom kultury osobistej \n\nodpowiedzialność \n\nOsoby zainteresowane prosimy o kontakt telefoniczny pod numerem 501461306.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zapiekanki -Kanapki Grill - LODY",
        "category": "olx",
        "phone": "691918001",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy osob do punktów gastronomicznych ,,Cukrem i Solą'' ze sprzedażą zapiekanek, kanapki grillowane, frytek, lody, kawa itp. Obsługa kasy fiskalnej i terminala.\n\nMożliwość podjęcia pracy w pełnym wymiarze godzinowym lub w weekendy. \n\nWymagana książeczka sanepidowska.\n\nPraca dla osób które ukończyły 18 lat.\n\nOferujemy szkolenia.\n\nMiejsce pracy:\n\nWarszawa Ul. Jagiellońska ( PARK PRASKI )\n\nCV ze zdjęciem proszę załączyć poprzez formularz OLX",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca w ochronie Warszawa - osoby z orzeczeniem o niepełnosprawności",
        "category": "olx",
        "phone": "533059821",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "ZATRUDNIĘ OSOBY Z ORZECZENIEM O NIEPEŁNOSPRAWNOŚCI DO OCHRONY OBIEKTÓW NA TERENIE WARSZAWY.\n\n Obiekty oraz system pracy dostosowane do możliwości ( zmiany: 8h/12h/16h/24h)\n\n Oferujemy:\n\n * stałe zatrudnienie na podstawie umowy o pracę, \n\n * systematycznie wypłacane wynagrodzenie, \n\n * pełne umundurowanie, \n\n * systemy szkoleń - stałe podnoszenie swoich kwalifikacji, \n\n * pracę w renomowanej firmie, stale się rozwijającej.\n\n \n\npraca również dla osób nie posiadających orzeczenia o niepełnosprawności.\n\nOSOBY ZAINTERESOWANE ZAPRASZAMY DO KONTAKTU TELEFONICZNEGO OD PONIEDZIAŁKU DO PIĄTKU 09:00- 15:00 POD NUMEREM  533- 059- 821/ 535- 347- 159/ 535- 414- 095",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Fryzjerka D/M min 2500",
        "category": "olx",
        "phone": "602445391",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Fryzjerkę damsko-męską zatrudni salon przy pl.Hallera.  Salon znajduje się w bardzo dobrym punkcie komunikacyjnym i posiada dużą bazę klientów.  Dogodny grafik pracy , miła atmosfera.  Więcej informacji udzielę telefonicznie telefonicznie.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kierowcę do piekarni rzemieślniczej",
        "category": "olx",
        "phone": "792448244",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Piekarnia rzemieślnicza na Pradze Północ szuka kierowcy. Praca od poniedziałku do soboty w godzinach 3.00-11.00. Do obowiązków będzie należało pakowanie pieczywa, transport i rozliczenie poszczególnych kontrahentów. Mile widziane osoby 45+.\nWynagrodzenie na poczatek 3200zl netto.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Sprzedawca do piekarni- Powiśle",
        "category": "olx",
        "phone": "510065819",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam\nPoszukuję pracownika do sklepu piekarniczo-cukierniczego na Powiślu \nul. Solec. Praca zmianowa do uzgodnienia. Mile widziane doświadczenie w handlu.\nKontakt tylko telefoniczny.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zbrojarz Warszawa i okolice",
        "category": "olx",
        "phone": "517906145",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Przyjmę do pracy zbrojarzy. Szukam osób z konieczną umiejętnością wiązania cęgami oraz mile widziana umiejętność czytania rysunku. Zapewniam zakwaterowanie i dojazd do pracy. Płaca zależna od Twoich umiejętności. Zarobki ustalam na podstawie dnia próbnego. Mile widziane osoby bez uzależnień od alkoholu i pracowitość. Praca od poniedziałku do piątku, godziny różne, ale przeważnie od 7:00-16:00. Zapraszam zainteresowane osoby tylko ze sprawną umiejętnością wiązania cęgami, nr telefonu: 517 906 145",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kucharz szef kuchni cateringowej",
        "category": "olx",
        "phone": "602698699",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy szefa kuchni cateringowej w naszym obiekcie na warszawskiej Pradze. \nDoświadczenie wymagane.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Branża opakowaniowa zatrudni pracowników z doświadczeniem w branży",
        "category": "olx",
        "phone": "664278220",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma branży Opakowaniowej przyjmie do pracy osoby posiadające doświadczenie w przedmiotowej branży.\n\nDotyczy:maszyn pakujących, owijarek, linii pakujących, składarek folii, pudełek, opakowań etc\n\nPoszukujemy wyłącznie osób zaangażowanych z doświadczeniem:\n\nelektryków/mechaników (branża opakowaniowa)\nspecjalistów do spraw sprzedaży/przedstawicieli handlowych(branża opakowaniowa)\npracowników administracyjnych(branża opakowaniowa)\n\nRozważymy wszystkie aplikacje osób, które mają doświadczenie i pracowały we wskazanej branży.\n\nMiejsce pracy - Warszawa\n\nWynagrodzenie ustalane indywidualnie\n\nW razie konkretnych pytań proszę o kontakt: 664 278 220 Sebastian",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pracownik Produkcji - bez jezyka angielskiego - od 10.61€ - Tilburg",
        "category": "olx",
        "phone": "00421915395436",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Uwaga !  OFERTA AKTUALNA TYLKO I WYŁĄCZNIE DLA OSÓB PRZEBYWAJĄCYCH NA TERENIE HOLANDII !\n\nDo lokalizacji MC Cain w Tilburg potrzebujemy pracowników produkcyjnych.\n\nFirma produkuje przeważnie krokiety ale również inne (suflet serowy, krokiet, frikandel, sajgonki, satay i wiele więcej)\n\nHigiena jest bardzo ważna! Angielski nie jest wymagany ! \n\nOpis pracy:\n\n• Obsługa prostych maszyn produkcyjnych\n\n• Wsparcie na linii produkcyjnej\n\n• Chętni do pomocy przy linii mycia skrzyń\n\n• Pakowanie produktów i przenoszenie ich do kontenerów na rolkach\n\nBędziesz pracować w systemie zmianowym 24/7\n\nod 6.00 do 14.00 - stawka : 10.61€ / brutto\n\nod 14.00 do 22.00 - po 18tej godzine stawka : 14.11€ /brutto\n\nod 22.00 do 06.00 - stawka : 14.32€ /brutto\n\nPrzy własnym samochodzie płacimy 6€ na dzień (tylko jeśli mieszkasz powyżej 10KM)\n\nW przypadku zainteresowania ofertą - prosimy o przesłanie aktualnego CV na adres e-mail.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praktyki w departamencie prawnym",
        "category": "olx",
        "phone": "883558606",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "INFRACERT TSI jest polską jednostką notyfikowaną specjalizującą się w działalności oraz wsparciu polskiego i europejskiego rynku kolejowego. Działamy w obszarze certyfikacji podsystemów interoperacyjności, wdrażania innowacyjnych rozwiązań w zakresie bezpieczeństwa transportu kolejowego oraz optymalizacji procesów przewozowych. Nasz zespół to grupa polskich i europejskich ekspertów, posiadających wieloletnie doświadczenie z zakresu funkcjonowania rynku kolejowego. Nasi pracownicy dysponują obszerną wiedzą zgromadzoną podczas wieloletniej pracy w sektorze kolejowym, administracji publicznej, instytutach naukowych oraz technicznym szkolnictwie wyższym.\n\nOczekiwania:\n\nPoszukujemy pełnych pasji oraz ambicji studentów III – V roku prawa w celu odbycia praktyk pod nadzorem doświadczonych prawników oraz zdobycia cennego doświadczenia na rynku pracy.\n\nOpis  praktyk:\n\nW toku praktyk studenci będą mieli możliwość praktycznego uczestnictwa w realizacji zadań departamentu prawnego spółki, w szczególności:\n\n·      sporządzaniu oraz opiniowaniu dokumentów korporacyjnych (regulaminy, uchwały organów spółki etc.) i innych dokumentów mających znaczenie prawne;\n\n·      bieżącym wsparciu prawnym komórek technicznych jednostki w zakresie prowadzonych procesów oceny zgodności w systemie kolei;\n\n·      bieżącym wsparciu prawnym organów spółki;\n\n·      zapewnianiu wsparcia jednostki w prawnych aspektach procesów oceny zgodności;\n\n·      zapewniania prawidłowego obiegu dokumentów spółki.\n\nWymagania:\n\n·            utrwalona wiedza prawna adekwatna do stopnia zaawansowania programu studiów;\n\n·            minimum średniozaawansowana znajomość języka angielskiego (poziom B1-B2);\n\n·            umiejętność sprawnego posługiwania się systemami informacji prawnej (Lex, Legalis);\n\n·            umiejętność pracy w zespole;\n\n·            dyspozycyjność 2-3 dni w tygodniu;\n\n·            samodzielność i dobra organizacja czasu pracy.\n\nAtutem będzie:\n\n·            znajomość przepisów krajowych i unijnych regulujących transport kolejowy, ze szczególnym uwzględnieniem interoperacyjności systemu kolei oraz przepisów postępowania administracyjnego;\n\n·            doświadczenie praktyczne w kancelarii lub komórce prawnej.\n\nOferujemy:\n\n·            praktyki w zgranym zespole, pełnym pomysłów oraz pasji kolejowej;\n\n·            styczność z wysoko wyspecjalizowaną problematyką prawną transportu kolejowego oraz możliwość uzyskania cenionego doświadczenia na dynamicznie się rozwijającym rynku kolejowym; \n\n·            możliwość nawiązania stałej współpracy na atrakcyjnych warunkach, w tym wynagrodzenia i rozwoju zawodowego;\n\n·            doświadczenie w elitarnej grupie jednostek notyfikowanych w zakresie interoperacyjności kolei.\n\nUprzejmie informujemy, iż zastrzegamy sobie prawo kontaktu jedynie z wybranymi Osobami.\n\n \n\nTreść zgody na przetwarzanie danych osobowych\n\nProsimy o zawarcie w CV klauzul: „Wyrażam zgodę na przetwarzanie danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji prowadzonego przez Spółkę INFRACERT TSI Sp. z o.o. z siedzibą w Warszawie w celu prowadzenia rekrutacji na aplikowane przez mnie stanowisko. Jednocześnie wyrażam zgodę na przetwarzanie moich danych osobowych przez Spółkę INFRACERT TSI Sp. z o.o. z siedzibą w Warszawie w celu przeprowadzenia przyszłych rekrutacji.”\n\n„Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z ustawą z dnia 10 maja 2018 roku o ochronie danych osobowych (Dz. Ustaw z 2018, poz. 1000) oraz zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO).”\n\nInformujemy, że Administratorem danych jest Spółka INFRACERT TSI Sp. z o.o. z siedzibą w Warszawie przy ul. Jagiellońskiej 32/3. Dane zbierane są dla potrzeb rekrutacji. Ma Pani/Pan prawo dostępu do treści swoich danych oraz ich poprawiania. Podanie danych w zakresie określonym przepisami ustawy z dnia 26 czerwca 1974 r. Kodeks pracy oraz aktów wykonawczych jest obowiązkowe. Podanie dodatkowych danych osobowych jest dobrowolne.\n\nInformacja o przetwarzaniu danych osobowych:\n\n1. Zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (ogólne rozporządzenie o ochronie danych), informuję, iż Administratorem Pani/Pana danych osobowych jest Spółka INFRACERT TSI Sp. z o.o. z siedzibą w Warszawie przy ul. Jagiellońskiej 32/3.\n\n2. Dane zbierane są dla potrzeb obecnej rekrutacji, a w przypadku wyrażenia przez Panią/Pana wyraźnej i dobrowolnej zgody także dla potrzeb przyszłych rekrutacji.\n\nPani/Pana dane osobowe będą przechowywane:\n\n- dla celów rekrutacji: w przypadku zgody na przetwarzanie jedynie na potrzeby obecnej rekrutacji - przez okres jej trwania,\n\n- dla celów rekrutacji: w przypadku zgody dla obecnej i przyszłych rekrutacji - przez okres 12 miesięcy,\n\n- dla celów archiwalnych: na potrzebę ochrony przed roszczeniami - przez okres przedawnienia Pani/Pana roszczeń związanych z przebiegiem procesu rekrutacyjnego.\n\n4. Pani/Pana dane osobowe mogą być przetwarzane przez dostawców systemów IT, z którymi współpracuje Administrator w zakresie pozyskiwania kandydatów do pracy.\n\n5. Posiada Pani/Pan prawo dostępu do treści swoich danych osobowych oraz prawo ich sprostowania, usunięcia, ograniczenia przetwarzania, prawo do przenoszenia danych, prawo wniesienia sprzeciwu.\n\n6. Ma Pani/Pan prawo wniesienia skargi do właściwego organu nadzorczego w zakresie ochrony danych osobowych, gdy uzna Pani/Pan, iż przetwarzanie danych osobowych Pani/Pana dotyczących narusza przepisy o ochronie danych osobowych, w tym przepisy ogólnego Rozporządzenia o ochronie danych osobowych z dnia 27 kwietnia 2016 r.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pracownik myjni samochodowej",
        "category": "olx",
        "phone": "509297028",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma Panel Serwis zatrudni pracownika myjni samochodowej w salonie samochodowym\n\nWarszawa Jagiellońska 84 \n\nOferujemy:\n\n Praca od poniedziałku do piątku,\n Praca w godzinach 7-17 lub 7-19,\n Zatrudnienie na podstawie umowy zlecenie.\n\nMile widziane: \n\norzeczenie o niepełnosprawności,\nprawo jazdy,\ndoświadczenie w pracy o podobnych charakterze,\nsumienność, dokładność, punktualność.\n\nZainteresowane osoby zapraszam do kontaktu pod nr telefonu 509 297 028, 605 176 949. ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Osoba do pomocy w domu",
        "category": "olx",
        "phone": "660284087",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Jesteśmy dwójką aktywnych zawodowo ludzi, którzy większość czasu spędzają poza domem. Bardzo zależy nam na utrzymaniu domowego ciepła, a ponieważ sami nie zawsze mamy na to czas, chcielibyśmy podjąć współpracę z osobą, która nam w tym pomoże. Poszukujemy osoby, która zajmie się naszym domem.\n\nCo to znaczy?\n\nOczekujemy, że zatroszczysz się o porządek w naszym mieszkaniu (60 m2 powierzchni), zajmiesz się porządkiem w garderobie (praniem i prasowaniem), zadbasz o nasze żołądki (codzienne przygotowywanie zdrowych posiłków/ okazjonalnie pomaganie w przygotowaniu rodzinnych okoliczności) i przypilnujesz zaopatrzenia lodówki, od czasu do czasu wyjdziesz na spacer z naszymi psami (oczywiście po tym jak się z nimi zapoznasz i zaprzyjaźnisz – nic na siłę).\n\nPodsumowując, będziesz:\n\n- sprzątać mieszkanie o wielkości 60m2\n\n- gotować dla dwóch osób - prać i prasować\n\n- robić zakupy\n\n- wyprowadzać psy (po wcześniejszym zaprzyjaźnieniu)\n\nCzego w związku z tym wymagamy?\n\n- Sumienności\n\n- Punktualności\n\n- Umiejętności gotowania i sprawnego poruszania się po kuchni\n\n- Prawa jazdy kat. B\n\n- Otwartości na kontakt ze zwierzętami\n\n- Doświadczenia w utrzymywaniu czystości i prasowaniu\n\n- Dyspozycyjności w godzinach 8:00-16:00\n\nChętnym zapewniamy:\n\n- zatrudnienie w oparciu o umowę o pracę/zlecenie\n\n- pracę w wymiarze pełnego etatu\n\n- atrakcyjne wynagrodzenie\n\n- spokój i przyjazną atmosferę",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca dla DYSPOZYCYJNYCH w sieci drogerii W-wa",
        "category": "olx",
        "phone": "509771431",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukuję DYSPOZYCYJNYCH KOBIET I MĘŻCZYZN do pracy dodatkowej w sieci Drogerii na terenie Warszawy.\n\nDla kobiet:\n\npraca na kasie\nwykładanie towaru na półki sklepowe i magazynowe,\npraca ze skanerem\n\nWymagana DYSPOZYCYJNOŚĆ min. 3 - 4 dni w tygodniu w godz. 6 - 22 (zmiany od 4 do 12 godzin)\n\nDla mężczyzn:\n\npraca w magazynie.\npomoc przy przyjmowaniu dostaw,\nwykładanie towaru na półki sklepowe i magazynowe,\npraca ze skanerem\n\nWymagana DYSPOZYCYJNOŚĆ min. 3 - 4 dni w tygodniu w godz. 6 - 14, 10 - 20 lub 18 - 6\n\numowa - zlecenia\n19 zł brutto/h;\nstudenci 18.30 zł brutto/h;\nzlecenia od na 4 h do 12 h\npłatność przelewem na konto w rozliczeniu miesięcznym\n\nW razie pytań, dzwoń:\n\nLewa strona Wisły - Wojciech - 509 771 431\n\nPrawa strona Wisły - Grzesiek - 798 103 706\n\nGdybym nie odbierał poproszę o sms - oddzwonię\n\nOsoby bez polskiego obywatelstwa zatrudniamy TYLKO:\n\nposiadaczy Karty Polaka;\nstudentów studiów stacjonarnych dziennych do 26 roku życia;\nrezydentów długoterminowych;\nniezbędny pesel.\n\nW przypadku przesyłania CV proszę o załączenie poniższej klauzuli:\n\nZgodnie z art.6 ust.1 lit. a ogólnego rozporządzenia o ochronie danych osobowych z dnia 27 kwietnia 2016 r. (Dz. Urz. UE L 119 z 04.05.2016) wyrażam zgodę na przetwarzanie moich danych osobowych przez Administratora Danych Osobowych dla potrzeb aktualnej i przyszłych rekrutacji, ale nie dłużej niż 2 lata od daty wysłania aplikacji\n\nP.S. Aplikując, podaj lokalizację i dyspozycyjność.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnie pracownika do sklepu Żabka",
        "category": "olx",
        "phone": "727920471",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy pracownika na pełen etat do sklepu Żabka. Praca od zaraz.  Mile widziany student. \n-pełen etat\n-umowa zlecenie\n-szkolenia/wdrożenie\n-premie uznaniowe\n-premie za tajemniczego klienta \n-elastyczny grafik \n-praca w energicznym młodym zespole\n\nJakiej osoby szukamy?\n-Otwartej na kontakt z Klientami\n-Gotowej do pracy w systemie zmianowym\n-Zaangażowanej, dokładnej i chętnej do nauki\n-Nastawionej na współpracę\n\nMile widziana Książeczka sanitarno-epidemiologiczna ( w przypadku braku wysyłamy na badania)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnię ekspedientkę do cukierni",
        "category": "olx",
        "phone": "663414395",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię ekspedientkę do cukierni   z doświadczeniem praca w godz 8.30 do 18 co dwa dni.\n więcej informacji pod tel .663 414 395\nDariusz Rumin\n w godz 8 do 12",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Asystent inżyniera budowy / praca biurowa",
        "category": "olx",
        "phone": "600072011",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma SENTTA prężnie rozwijająca się i działająca od wielu lat w branży sanitarnej, wentylacyjnej i klimatyzacyjnej, świadcząca kompleksowe usługi doradztwa technicznego, projektowania, montażu i uruchamiania instalacji sanitarnych zatrudni studentkę/absolwentkę wydziału Inżynieria Środowiska/ Instalacje budowlane na stanowisko: pracownik biurowy\n\nWymagania:\n\n-student lub absolwent wydziału instalacji sanitarnych \n\n- znajomość pakietu MS Office i AutoCad;\n\n- prawo jazdy kat. B;\n\n- umiejętność organizacji pracy;\n\nZakres obowiązków: \n\n- obsługa biura;\n\n- tworzenie dokumentacji powykonawczej;\n\n- wykonywanie obmiarów z projektów;\n\n-\n\n \n\nOferujemy:\n\n- stabilne zatrudnienie w oparciu o umowę o pracę w firmie o ugruntowanej pozycji na rynku;\n\n- możliwość zdobywania i poszerzania zawodowego doświadczenia;\n\n-wszystkie niezbędne narzędzia pracy \n\n- atrakcyjne wynagrodzenie;\n\n- pakiet opieki medycznej\n\nZainteresowanych prosimy o wysyłanie CV\n\n lub kontakt telefoniczny : 600 072 011",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "IT Service Specialist",
        "category": "olx",
        "phone": "324209347",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Aplikuj jeśli :\n\nszukasz dynamicznej, nierutynowej pracy\nmasz duże ambicje i chcesz się rozwijać na ścieżce eksperckiej w zakresie IT\nchcesz pracować w zespole świetnych specjalistów i inżynierów, z których doświadczenia można czerpać ogromną ilość wiedzy\nchcesz spędzać czas w pracy w przyjaznej, partnerskiej, kreatywnej atmosferze\nhcesz poznać pracę w międzynarodowym otoczeniu w globalnej firmie i obsługiwać klientów polskich i zagranicznych\nchcesz mieć kontakt z najnowszymi rozwiązaniami Microsoft oraz VMware\nchcesz uczestniczyć w szkoleniach z nowych technologii.\n\nCo będzie należało to Twoich obowiązków?\n\n·               obsługa zgłoszeń technicznych od klienta wewnętrznego oraz kluczowych klientów zewnętrznych\n\n·               inwentaryzacja sprzętu oraz oprogramowania.\n\n·               instalacja oraz konfiguracja oprogramowania w środowisku Windows\n\n·               wsparcie użytkowników w zakresie pakietu MS Office, MS Visio, MS Project, Skype for Business, MS Teams\n\n·               opieka nad sprzętem komputerowym i peryferiami\n\n·               czynny udział w projektach modernizacyjnych środowiska IT\n\n·               tworzenie i wdrażanie procedur z zakresu sprzętu i IT\n\n·               prowadzenie szkoleń technicznych dla pracowników i klientów\n\nCzego od Ciebie oczekujemy?\n\n·        co najmniej 2 letniego doświadczenia w obsłudze zgłoszeń IT oraz w utrzymywaniu środowiska komputerowego (komputery, drukarki, urządzeń sieciowych)\n\n·        bardzo dobrej znajomości języka angielskiego (min. B2) pozwalającej na swobodną komunikację w mowie i piśmie)\n\n·        pasji do IT i motywacji do poszerzania wiedzy w tym zakresie.\n\n·        wykształcenia kierunkowego\n\n·        dobrej znajomości Office 365 oraz systemów Windows 10\n\n·        Podstawowa znajomości domeny opartej o Active Directory, zarządzanie kontami użytkowników i grupami uprawnień podstawowej znajomości zagadnień sieci LAN/WAN\n\n·        umiejętności diagnozowania i serwisowania sprzętu komputerowego\n\n·        bardzo dobrej organizacji pracy własnej\n\n·        inicjatywy i zdolności do poszukiwania nowych rozwiązań oraz tworzenia instrukcji i procedur\n\n·        umiejętności analitycznych\n\n·        umiejętności współpracy w zespole, również z rozproszonej strukturze\n\nCo oferujemy?\n\n·        Stabilną pracę w zespole młodych ludzi, którzy wspólnie budują prężnie rozwijającą się firmę w branży IT,\n\n·        rozwój zawodowy wraz z ekspansją firmy w Polsce i na świecie,\n\n·        samodzielność w podejmowaniu decyzji, możliwość realizowania własnych pomysłów oraz wdrażania kreatywnych rozwiązań,\n\n·        bardzo dobre warunki pracy (nowoczesne narzędzia pracy, świetnie wyposażone biuro),\n\n·        benefity w postaci kart Multisport, kart podarunkowych, lekcji języka angielskiego,\n\n·        przyjazną, swobodną atmosferę pracy\n\n ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kelner kucharz",
        "category": "olx",
        "phone": "798063258",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "OFERTA PRACY NA STANOWISKU KUCHARZ/ KELNER\nMiejsce wykonywania pracy Pociąg Expres Intercity\nZakres obowiązków: \n- serwisy gastronomiczny w podróży pociągu ICC \n-sprzedaż sugerowana/ obwoźna\nWYMAGANIA:\n-książeczka sanitarno-epidemiologiczne\n-dyspozycyjność \n-komunikatywność i umiejętność pracy w zespole \nOFERUJEMY ciekawą pracę w młodym zespole,umowę o pracę,pełne wyżywienie + noclegi ,bardzo atrakcyjne zarobki wypłacane bezpośrednio po odbyciu turnusu- delegacji, możliwość rozwoju zawodowego oraz wieloletnie współpraca.  Wszelkie dodatkowe informacje pod numerem 798-063-258",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kierownik / Majster drogowy",
        "category": "olx",
        "phone": "667949099",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy kierownika/majstra robót do firmy brukarskiej\nLokalizacja siedziby : czarna 05-200 \nInformacje priv 667949099",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Młodszy koordynator miedzynarodowy",
        "category": "olx",
        "phone": "507928686",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Twój zakres obowiązków\n\nwsparcie w procesie planowania i zlecania transportu\ncodzienna współpraca z klientami\npomoc przy zarządzaniu środkami transportu \nsporządzanie raportów, analiz\noptymalizacja bieżących rozwiązań i kosztów\nrozwiązywanie bieżących problemów \n\nNasze wymagania\n\nswoboda w codziennej komunikacji w j. angielskim, znajomość języka niemieckiego będzie mile widziana\ndobra znajomość MS Excell, \nznajomość obsługi programów do zarządzania TMS będzie dodatkowym atutem\npierwsze doświadczenia związane z transportem\nkomunikatywność i umiejętność pracy w zespole\n\nTo oferujemy\n\nStabilne zatrudnienie w oparciu o umowę o pracę w pełnym wymiarze godzin.\nniezbędne narzędzia do pracy (komputer oraz telefon służbowy)\n\nProszę o przesyłanie  CV na wskazany adres email",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Отделочник универсал 25 zł/godz",
        "category": "olx",
        "phone": "537882185",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Требуются ответственные работники!!! \nИщем мастеров-универсалов для выполнения \nотделочных работ в Варшаве. \nДля ответственных и профессиональных людей существует премиальная система.\nСкорость и качество всегда в цене.\n\nЧто требуется от вас:\n\n- желание работать и трудолюбие;\n- ответственный подход к работе;\n- исполнительность и профессионализм .\n-порядочность.\n\nПотенциальные виды работ:\n\n- штукатурка;\n- шпаклёвка;\n- покраска;\n- укладывание плитки;\n- не сложные сантехнические работы;\n- электрика;\n- и т.д.\n\nЧто можем предложить потенциальному сотруднику:\n\n- работа только от м2.\n- официальное оформление \"umowa o pracy\";\n- возможность работать по безвизовому режиму и рабочей визе;\n- предоставляем весь инструмент;\n- своевременная оплата (возможны авансы каждую неделю);\n\nБолее подробно можно обсудить и узнать по телефону:\n\n Сергей.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Osoby do baru plażowego",
        "category": "olx",
        "phone": "502866368",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy miłe, komunikatywne osoby do pracy w barze plażowym nad Wisłą. Bez nałogów. Dyspozycyjne.\nOsoby zainteresowane prosimy o przesłanie CV za pomocą formularza na olx.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kierownik Robót Elektrycznych - dorywcza praca",
        "category": "olx",
        "phone": "661125576",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy współpracownika na stanowisko Kierownik Robót Instalacyjnych w branży Elektrycznej. Budownictwo wielomieszkaniowe. Elastyczne i dogodne warunki współpracy. Praca od ręki.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Poszukiwani pracownicy z doświadczeniem do prac remontowych",
        "category": "olx",
        "phone": "507964505",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy silnych pracowników z doświadczeniem do prac remontowo budowlanych.\n\nProsimy o kontakt tylko osoby poważnie zainteresowane, poszukujących pracy na dłużej.\n\nAby uzyskać więcej informacji prosimy o kontakt telefoniczny. \n\nZapewniamy uczciwe wynagrodzenie adekwatne do posiadanych umiejętności.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "PRACOWNIK MAGAZYNU- Szkolimy i zatrudniamy!",
        "category": "olx",
        "phone": "602400319",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma Unobrand Sp.J \n\nPoszukuje mężczyzny w wieku maksymalnie do 30 lat  na stanowisko pracownika magazynu .Osoby ,która posiada  doświadczenie w podobnej dziedzinie ale nie posiada uprawnień na wózek widłowy . Szkolimy we własnym zakresie i zatrudniamy.\n\nObowiązki:\n\n-wykonywanie czynności związanych z codziennym funkcjonowaniem magazynu\n\n-przyjmowanie i wydawanie towarów magazynowych\n\n-weryfikowanie zgodności przyjmowanych i wydawanych towarów z zamówieniami\n\n-dbanie o porządek na terenie całego magazynu \n\n-wykonywanie poleceń kierownika\n\n-Segregacja i dekompletacja przyjmowanych zamówień\n\nOczekiwania;\n\n-chęć dłużej współpracy\n\n-obowiązkowość i rzetelne podejście do powierzonych obowiązków\n\n-osoba kontaktowa  i współpracująca w grupie \n\nOferujemy:\n\nszkolenie wdrożeniowe\numowę o pracę\n\nProsimy o aplikację na stanowisko przez OLX LUB NR tel.602400319.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Sprzątanie terenu zewnętrznego Warszawa Praga Północ",
        "category": "olx",
        "phone": "787844222",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma porządkowa Bewer poszukuje mężczyzny do  sprzątania terenu zielonego. Praca od poniedziałku do piątku w godz. 6.00 do 8.00, umowa zlecenie.\n\nKontakt telefoniczny: 787 844 222",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Manager do Klubokawiarni",
        "category": "olx",
        "phone": "791311060",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukiwany drugi Manager do klubokawiarni \" W oparach Absurdu\" na Pradze Północ\n\nOczekiwania:\n\nminimum 2-letnie doświadczenie w zarządzaniu lokalem gastronomicznym\nodpowiedzialność\ndoskonała organizacja pracy\nkomunikatywność\nzmysł praktyczny i estetyczny\nopanowanie i wytrzymałość\n\nZapewniamy stabilne zatrudnienie, dobre warunki finansowe, posiłek pracowniczy oraz dobrą atmosferę pracy.\n\nUwaga! Praca do późnych godzin zwłaszcza w weekendy!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Specjalista działu rekrutacji i obsługi studentów",
        "category": "olx",
        "phone": "225900723",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Wyższa Szkoła Menedżerska w Warszawie w związku z dynamicznym rozwojem na rynkach zagranicznych poszukuje specjalisty do pracy w dziale studiów obcojęzycznych ze znajomością języka rosyjskiego.\n\n \n\nWymagania\n\n·        Znajomość języka rosyjskiego i/lub angielskiego na poziomie komunikatywnym\n\n·        Umiejętność pracy w zespole\n\n·        Komunikatywność i gotowość do pracy w środowisku międzynarodowym\n\n·        Kreatywność \n\n·        Znajomość pakietu Office\n\n \n\nOferujemy\n\n·        Stałą pracę w jednej z czołowych Uczelni prywatnych w Polsce\n\n·        Pracę w młodym i ciekawym zespole\n\n·        Możliwość budowania kontaktów na całym świecie\n\n·        Poznawanie nowych kultur\n\n·        Możliwość podróżowania\n\n \n\nKontakt\n\nZgłoszenia CV oraz list motywacyjny prosimy przesyłam na adres:\n\npiotr.mikosik(at)wsm.warszawa.pl\n\n \n\nSkontaktujemy się z wybranymi kandydatami.\n\n \n\nProsimy o zawarcie w CV klauzuli: \"Wyrażam zgodę na przetwarzanie moich danych osobowych w celu rekrutacji zgodnie z art. 6 ust. 1 lit. a Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (ogólne rozporządzenie o ochronie danych)\". \n\n ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pilnie zatrudnimy mlodych osub na pakownie lub na zmywak",
        "category": "olx",
        "phone": "504937803",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "catering dietetyczny zatrudni osób do pracy na pakowni Lokalizacja Warszawa Praga południa Praca 4 -5 dni w tygodni w godzinach 13:30-18:00 miłe widziane doświadczenie w podobnej pracy.Osoby zainteresowane prosze o wysłanie CV.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "sprzątanie - praca dodatkowa",
        "category": "olx",
        "phone": "665717189",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma sprzątająca zatrudni panie do prac porządkowych w pomieszczeniach biurowych.\n\nPraca od poniedziałku do piątku w godz. 17.00 - 22.00  Warszawa Praga-Północ\n\nZapewniamy profesjonalne szkolenie i pracę w miłym zespole.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca w sklepie Żabka Praga-Północ",
        "category": "olx",
        "phone": "518981584",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy pracowników do sklepu Żabka w Warszawie na Pradze-Północ.\n\nSklep nowo otwierany, zaplanowane otwarcie 31.05.2021r\n\nPoszukujemy osób zaangażowanych, sumiennych, lubiących kontakt z klientem, chcących rozwijać się w sprzedaży, zaangażowanych w pracę którą wykonują.\n\nDo Twoich obowiązków należeć będzie:\n\nobsługa kasy fiskalnej\nbieżąca obsługa klienta\nprzyjmowanie dostaw \nwykładanie towaru \nbieżące dotowarowanie sali sprzedaży\ndbałość o standardy sieci\ndbanie o ekspozycję i czystość w sklepie \n\nMile widziane:\n\ndoświadczenie w sprzedaży\nksiążeczka do celów sanitarno-epidemiologicznych (lub wymagane jej wyrobienie przed rozpoczęciem pracy)\n\nOferujemy:\n\nUmowę zlecenie\npracę dwuzmianową\nelastyczny grafik\n\nPo więcej informacji można pisać w wiadomości prywatnej.\n\nMile widziani również studenci dzienni, chcący przepracować kilka godzin w tygodniu, lub studenci zaoczni na weekendy.\n\nProsimy o przesyłanie CV wraz z załączoną klauzulą:\n\n\"Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO).\"",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnimy w Warszawie kierowcę kat. B",
        "category": "olx",
        "phone": "501323531",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "    Jesteśmy firmą, która od 1993 świadczy usługi transportowe i logistyczne. Dysponujemy nowoczesnym parkiem samochodowym z zabezpieczeniem GPS -satelitarnym systemem monitorowania pojazdów (wszystkie auta wymieniane są co cztery lata).\n\nFirma PPH ERRA SP. Z O.O. z siedzibą w Warszawie poszukuje kierowcy kategorii B z Warszawy i okolic.\n\nKierowca kat. B\n\nMiejsce pracy: załadunek Radonice 23,30 przed północą k/o Błonia dostawa do komory przeładunkowej w Ostrołęce (wahadło) Najchętniej zatrudnimy kierowców zamieszkałych na kierunku liniowym  Błonie - Serock, lub okolice trasy Toruńskiej.\n\nOpis stanowiska:\n\n·       Do dyspozycji są samochody dostawcze o masie całkowitej do 3.5t (Fordy Transity chłodnie tzw. Jumbo z windą). Parkowanie pod domem.\n\nWymagania:\n\n·       min. 2 lata doświadczenia na stanowisku kierowcy kat. B\n\n·       zaświadczenie o niekaralności,\n\n·       dyspozycyjność\n\nOferujemy:\n\n·       Zatrudnienie przez pierwsze 3 miesiące na umowę zlecenie (później umowa o pracę)\n\n·       Wynagrodzenie: podstawa + premia.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "ARTHOTEL STALOWA 52 Recepcjonista, Kelner",
        "category": "olx",
        "phone": "881221302",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy osoby na stanowisko:\n\n1.Recepcjonista \n2. Kelner \n\nWymagana znajomość języka angielskiego. Mile widziane doświadczenie w hotelarstwie. Cv prosimy przesyłać w odpowiedzi na ogłoszenie.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Prasownik Obsługi Klienta Orlen Żerań Warszawa",
        "category": "olx",
        "phone": "242560562",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Chcesz pracować na nowoczesnej stacji? Nie masz doświadczenia zawodowego? Interesuje Cię elastyczny czas pracy? Uważasz, że praca z ludźmi to przyjemność? Chcesz połączyć pracę z nauką lub innymi obowiązkami? Chcesz w przyszłości samodzielnie zarządzać stacją paliw? Jeżeli na przynajmniej jedno z pytań odpowiedziałeś pozytywnie, skontaktuj się z Kierownikiem tej stacji. Proponujemy: - elastyczne godziny pracy - zdobycie doświadczenia zawodowego w oparciu o standardy PKN ORLEN - pracę na nowoczesnej stacji paliw - pakiet szkoleń na każdym etapie rozwoju - rabat na zakupy na stacjach ORLEN - specjalną ofertę telefonii komórkowej dla Ciebie i rodziny - przejrzystą ścieżkę awansu - dla najlepszych samodzielne zarządzanie stacją paliw Praca polega na: - obsłudze klienta przy kasie - pozytywnym podejściu do klienta - komunikowaniu aktualnych promocji produktowych - dbaniu o czystość i porządek na terenie obiektu\n\nProsimy o przesyłanie CV na adres mail  lub bezpośrednio na stację paliw Orlen ul, Jagiellońska 86 Warszawa",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Nieaktualne - Osoba do opieki nad Mamą - Praga Północ",
        "category": "olx",
        "phone": "693334115",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Dzień dobry,\n\nposzukuje osoby do opieki nad Mamą (64l.).\n\nMama głównie ogląda telewizję, nie wychodzi. Jest miła/kontaktowa, ale przez chorobę mentalnie trochę jak dziecko. Nie robi problemów, ale potrzebuje żeby ktoś ją doglądał i pomagał.\n\nDo głównych zadań należeć będzie:\n\n• przychodzenie do Mamy dwa razy w tygodniu na 2 godziny np. we wtorki i czwartki\n\n• odgrzewanie i podanie Mamie jednego posiłku (np. zupy) i leków na schizofrenię\n\n• pomoc w kąpieli\n\n• rozmowa\n\n• ewentualnie wspólny krótki spacer\n\n• lekkie sprzątanie mieszkania tzn. starcie kurzy, odkurzanie, zmiana pościeli, puszczanie i wywieszanie prania itp.\n\nMiejsce zamieszkania Mamy to Praga Północ - okolice ul. Namysłowskiej.\n\nZainteresowanych zapraszam do kontaktu.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca bus 3,5t europa",
        "category": "olx",
        "phone": "518536792",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam zapraszamy kierowcow międzynarodowych do 3,5t:\nSystem pracy 4/1\n200zl dniowka\nBus master 2018\n15000km w miesiąc\nWlasna spedycja\nPrzyjazna atmosfera\nOd kierowcow oczekujemy uczciwosci i zaangazowania",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Ogrodnika / Pomocnika ogrodnika",
        "category": "olx",
        "phone": "602101910",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy pracowników fizycznych do BUDOWY OGRODÓW - z doświadczeniem jak i pomocników.\n\nPraca od poniedziałku do piątku, możliwa praca w soboty.\n\nsezonowa\n\nMiejsce pracy : Warszawa i okolice\n\nZakres obowiązków\n\nsadzenie i pielęgnowanie roślin\nbrukarstwo\nzakładanie systemów nawadniania\ntarasy drewniane (stolarka)\nprace ziemne\nzakładanie i pielęgnacja trawników\nObsługa maszyn i urządzeń ogrodniczych\nprzycinanie, formowanie żywopłotów\ninne prace ogrodnicze\n\nMile widziane umiejętności\n\nchęć pracy, zaangażowanie\nzdolność do pracy fizycznej\n\nW zamian oferujemy\n\nzatrudnienie w oparciu o umowę o prace/zlecenie\natrakcyjne wynagrodzenie\ndobrą atmosferę pracy\nciągłość zleceń\nmożliwość nadgodzin\npremie dla zaangażowanych w prace\n\nProsimy o przesłanie zgłoszenia w formie CV oraz kilka słów o sobie.\n\nNa CV prosimy o dopisanie następującej klauzuli: Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji rekrutacji /zgodnie z Ustawą z dn. 29.08.97.r .o Ochronie Danych Osobowych Dz. Ust. nr 133 poz. 883/.\n\nPoszukujemy pracowników do dłuższej współpracy.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnię fryzjerkę damsko- męską OD ZARAZ",
        "category": "olx",
        "phone": "509324805",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię fryzjerkę damsko- męską OD ZARAZ do salonu fryzjersko -kosmetycznego. Praca zmianowa. \nSalon znajduje się na Pradze północ ul. Targowa przy lini metra dworzec Wileński.\nZainteresowane osoby proszę o wiadomość lub kontakt tel.\n509324805",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "doświadczona opiekunka do osoby starszej",
        "category": "olx",
        "phone": "880008798",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Witam.Poszukuję pracy jako opiekunka do osoby starszej na terenie Warszawy.Jestem z Ukrainy i posiadam doświadczenie w takiej pracy.Szukam pracy z zamieszkaniem na stałe.Proszę o kontakt telefoniczny 880 008 798",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kierowca kat. B/ Kurier z zakwaterowaniem!",
        "category": "olx",
        "phone": "572904843",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy Kierowcę kat. B/ Kuriera do dostarczania przesyłek na terenie województwa świętokrzyskiego.\n\nOferujemy:\n\nDarmowe zakwaterowanie w nowo powstałych budynkach mieszkalnych,\npracę w prężnie rozwijającej się firmie,\nstałe trasy po województwie świętokrzyskim,\natrakcyjne wynagrodzenie podstawowe,\npełen wymiar godzin pracy z możliwością pracy również w weekendy- dodatkowo atrakcyjnie premiowane,\nkompleksowe szkolenie oraz wsparcie.\n\nWymagamy:\n\nuczciwości oraz odpowiedzialności,\nczynnego prawa jazdy kat. B,\numiejętności prowadzenia busów,\nwysokiej kultury osobistej i nastawienia na profesjonalną obsługę klienta.\n\nZainteresowane osoby zapraszamy do kontaktu za pośrednictwem olx lub telefonicznie 572-904-843.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Specjalista ds. sprzedaży (praca w salonie Plus i Cyfrowy Polsat)",
        "category": "olx",
        "phone": "508090415",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Liberty Poland S.A. - KIM JESTEŚMY?\n\n \n\nJesteśmy największym Partnerem firmy Polkomtel Sp. z o.o. – operatora sieci Plus oraz Cyfrowego Polsatu. Dzięki silnej marce i wsparciu grupy Cyfrowy Polsat jako jedyni na rynku, w zarządzanej przez nas sieci sprzedaży oferujemy pakiet usług, których możesz być Ambasadorem.\n\n \n\nLubisz współpracę z Klientami i chcesz im oferować kompleksowe rozwiązania?\nPosiadasz wysokie zdolności komunikacyjne i pozytywne nastawienie do pracy z klientem?\nJesteś nastawiony na realizację ambitnych celów biznesowych i potrafisz je osiągać?\nChcesz się uczyć i rozwijać swoje kompetencje sprzedażowe?\nMasz wykształcenie min. średnie?\nDoświadczenie w sprzedaży usług będzie dodatkowym atutem.\n\n \n\n \n\nLiberty Poland S.A. - CO OFERUJEMY?\n\n \n\nUmowę o pracę,\nPremię uzależnioną od wyników,\nProgram motywacyjny,\nKonkursy z nagrodami $,\nPakiet szkoleń rozwojowych,\nOpiekę medyczną, ubezpieczenie na życie,\nKartę Multisport.\n\n \n\nTwoje ZADANIA:\n\n \n\nPraca w Punkcie Sprzedaży Plus i Cyfrowy Polsat\nDiagnozowanie potrzeb klientów w celu doboru najlepszych produktów i usług,\nKompleksowa obsługa Klienta Plus i Cyfrowy Polsat zgodnie z najwyższymi standardami,\nIndywidualne podejście do Klienta i budowania z nim długofalowych relacji,\nRealizacja planów sprzedażowych powiązana z atrakcyjnymi bonusami,\nBudowanie wizerunku Grupy Kapitałowej.\n\n \n\n \n\nOsoby zainteresowane prosimy o przesyłanie aplikacji (CV ze zdjęciem)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pracownik obsługi Green it.Wileńska",
        "category": "olx",
        "phone": "530008111",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Do nowoczesnego konceptu gastronomicznego oferującego swoim klientom zdrową żywność poszukujemy osób do pracy na stanowisko: PRACOWNIK OBSŁUGI\n\nLokalizacja WARSZAWA, Galeria Wileńska\n\nObowiązki na tym stanowisku obejmują:\n\n- obsługę klienta zgodnie ze standardami (przygotowywanie sałatek, wrapów oraz świeżo wyciskanych soków)\n\n- dbanie o czystości stanowiska pracy\n\n- przygotowywanie produktów do sprzedaży (m in. krojenie warzyw i owoców, porcjowanie, uzupełnianie zapasów, itp.)\n\n- utrzymywanie najwyższej jakości oferowanych produktów\n\nOczekiwania wobec kandydatów:\n\n- aktualne badania sanepidu\n\n- chęci do pracy i zaangażowania\n\n- umiejętność i chęć przyswajania wiedzy\n\n- pozytywne nastawienie do siebie i innych\n\n- dobra organizacja własnej pracy\n\nOferujemy:\n\n- szkolenie stanowiskowe\n\n- pracę w niepełnym lub pełnym wymiarze godzin\n\n- elastyczny grafik układany tygodniowo\n\n- możliwość zdobycia ciekawego doświadczenia oraz realną szansę awansu\n\nOsoby spełniające podane wymagania i zainteresowane ofertą prosimy o przesłanie CV za pośrednictwem portalu. Skontaktujemy się z wybranymi osobami. W aplikacji prosimy umieścić klauzulę: \"Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z ustawą z dn. 29.08.97 roku o Ochronie Danych Osobowych Dz. Ust Nr 133 poz. 883)\".",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Spedytor międzynarodowy i krajowy",
        "category": "olx",
        "phone": "500624605",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "   \n\nTuporte Sp. z o.o. specjalizuje się w krajowych i międzynarodowych przewozach transportowych oraz w spedycji i magazynowaniu.\n\nObecnie poszukujemy osoby na stanowisko:\n\nSpedytor krajowy  lub międzynarodowy\n\n(miejsce pracy: Warszawa, Praga Północ)\n\n \n\nTwoja praca będzie polegała na:\n\norganizowaniu działań w zakresie spedycji międzynarodowej \norganizowaniu transportów międzynarodowych i kontroli poprawności ich realizacji\nutrzymywaniu kontaktów z klientami i przewoźnikami\nmonitorowaniu i kontroli realizacji zleceń\nrozbudowie bazy klientów i podwykonawców\nkoordynowaniu pracy zespołem spedytorów i kontroli przepływu dokumentów w zespole\nobsłudze samochodów przydzielonych do zespołu oraz weryfikacji delegacji\nkontroli terminów zapłaty obsługiwanych klientów\noptymalizacji kosztów, raportowaniu, wdrażaniu i nadzorze nad realizowanymi projektami\n\nAplikuj do nas jeśli:\n\nznasz język angielski (mile widziana znajomość dodatkowych języków obcych – francuski, niemiecki, hiszpański, włoski, skandynawski lub inne)\nmasz zdolność analitycznego myślenia\nposiadasz umiejętności negocjacyjne i potrafisz rozwiązywać problemy\ndobrze organizujesz pracę własną;\njesteś odporny na stres;\nwykazujesz się systematycznością, sumiennością i dokładnością\nlubisz pracować w zespole\njesteś komunikatywny i kreatywny\n\nOferujemy:\n\nStabilne zatrudnienie w prężnie rozwijającej się firmie.\nAtrakcyjne wynagrodzenie w oparciu o wyniki własnej pracy.\nDogodną lokalizację biura - 350m od stacji metra Szwedzka. \nPacę pozwalającą na rozwój i awans i budowanie ścieżki kariery.\nMożliwość poszerzania wiedzy i umiejętności w zakresie wykonywanego zawodu.\n\n \n\nZainteresowane osoby prosimy o aplikowanie za pomocą formularza kontaktowego lub przesłanie CV i listu motywacyjnego na poniższy adres mailowy: tuporte(a)tuporte.pl\n\n \n\nTuporte Sp. z o.o. zastrzega sobie prawo do odpowiedzi tylko na wybrane oferty.\n\nProsimy o zamieszczenie w aplikacji podpisanej klauzuli:” “Wyrażam zgodę na przechowywanie i przetwarzanie moich danych osobowych dla potrzeb procesu rekrutacji w firmie przez 1 rok, na mocy Dyrektywy 95/46/WE Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016”.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Instalator/monter instalacji elektrycznych i teletechnicznych",
        "category": "olx",
        "phone": "790018942",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Opis\n\nNasza firma zajmuję się projektowaniem, doradztwem i montażem systemów teletechnicznych, elektrycznych oraz zabezpieczenia mienia\n\nInstalator/monter instalacji elektrycznych i teletechnicznych\n\nZakres obowiązków:\n\nMontaż okablowania instalacji teletechnicznych\nMontaż urządzeń i instalacji niskoprądowych\nSerwis wykonywanych instalacji i systemów\nWykonywanie instalacji elektrycznych\n\nOd kandydatów oczekujemy:\n\nDoświadczenia na podobnym stanowisku\nUmiejętności prowadzenia okablowania elektrycznego i teletechnicznego\nZnajomości przynajmniej podstaw zasad prowadzenia tras kablowych\nUmiejętności manualnych związanych z branżą elektryczną\nSamodzielności\nDyspozycyjności\nOdpowiedzialność, komunikatywność, sumienność w wykonywaniu obowiązków\nUmiejętność pracy w zespole\nMile widziane prawo jazdy kat. B\n\nW zamian oferujemy:\n\nAtrakcyjne wynagrodzenie uzależnione od doświadczenia\nMożliwość dalszego podnoszenia kwalifikacji\nPracę w zgranym zespole pracowników\nPracę od poniedziałku do piątku\nZapewniamy odzież ochronną i narzędzia\n\nOsoby zainteresowane ofertą prosimy o przesłanie CV na maila lub kontakt telefoniczny\n\nProsimy o zawarcie w CV klauzuli: „Wyrażam zgodę na przetwarzanie danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji prowadzonego przez Inter Logic Sp. z o.o. z siedzibą w Warszawie przy ul. Aleja Stanów Zjednoczonych 51 zgodnie z ustawą z dnia 29 sierpnia 1997 r. o ochronie danych osobowych (t.j. Dz. U. z 2016 r., poz. 922)”. Jednocześnie wyrażam zgodę na przetwarzanie przez ogłoszeniodawcę moich danych osobowych na potrzeby przyszłych rekrutacji.\n\nInformujemy, że Administratorem danych jest Inter Logic Sp. z o.o. z siedzibą w Warszawie przy ul. Aleja Stanów Zjednoczonych 51. Dane zbierane są dla potrzeb rekrutacji. Ma Pani/Pan prawo dostępu do treści swoich danych oraz ich poprawiania. Podanie danych w zakresie określonym przepisami ustawy z dnia 26 czerwca 1974 r. Kodeks pracy oraz aktów wykonawczych jest obowiązkowe. Podanie dodatkowych danych osobowych jest dobrowolne.\n\nZastrzegamy sobie prawo do kontaktu wyłącznie z wybranymi osobami.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Spedytor \"na Szóstkę\"",
        "category": "olx",
        "phone": "782353657",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Talent River to firma z polskim kapitałem oferująca usługi HR dla biznesu.\n\nwww.talentriver.pl\n\nWierzymy że organizacje, które rozwijają się w kryzysie przetrwają niejedno trzęsienie ziemi- ta dla której szukamy, przeszła tą ciężką próbę i w związku z tym zwiększamy już dziś zespół naszego Klienta!\n\n \n\nSzukamy Spedytora ,,na szóstkę”\n\nCzym będziesz się zajmować?\n\nKorzyści z  bycia częścią zespołu:\n\n1.     Stała pensja i premie uzależnione od wyników – oferujemy wysokie wynagrodzenie za pracę przynoszącą spodziewane rezultaty. Dobre wyniki dają Ci możliwość nielimitowanej prowizji.\n\n2.     Praca bezpośrednio z Zarządem – konkretny, błyskotliwy, doświadczony mózg operacji.\n\n3.     Możliwość rozwoju – jeśli chcesz i nie boisz się rozwijać organizacji, nic nie stoi na przeszkodzie. Możesz sprawnie wziąć odpowiedzialność za innych.\n\n4.     Duża samodzielność – efektywne działanie to klucz do sukcesu, jednak w jaki sposób go osiągniesz, zależy od ciebie.\n\n5.     Elastyczny czas pracy – nie jesteśmy korporacją.\n\n6.     Wszelkie niezbędne narzędzia- telefon i laptop a dobry nastrój musisz wziąć ze sobą z domu.\n\n \n\nZapraszamy do aplikacji jeśli:\n\n- Masz doświadczenie w spedycji (transport drogowy) minimum 2 lata.\n\n- Budujesz relacje z klientami tak, że byliby gotowi pójść za Tobą nawet w ogień. \n\n- Mieszkasz w Warszawie lub bliskich okolicach wschodniej części stolicy.\n\n- Znasz język angielski lub inny język.\n\n- Jesteś osobą samodzielną i zdeterminowaną. ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Specjalista ds. rekrutacji obcokrajowców - Koordynator pracowników",
        "category": "olx",
        "phone": "48722111544",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Specjalista ds. rekrutacji obcokrajowców - koordynator pracowników\n\nWOW Sp. z o.o Wizards of work specjalizuje się w rekrutacji, koordynacji oraz outsourcingu zespołów pracowniczych z Polski, Ukrainy i Białorusi i innych krajów dla wielu odbiorców końcowych.\n\nJesteśmy wsparciem w procesach produkcyjnych, inwestycjach budowlanych, logistyce i magazynowaniu.\n\nZadania:\n\nrekrutowanie i koordynacja rekrutowanych pracowników\nznajomość mediów do rekrutacji (portale, social media, innowacyjność w poszukiwaniu pracowników)\nopieka logistyczna w dojazdach pracowników do miejsc pracy\nbudowanie odpowiednich relacji z pracownikami firmy\nwspółpraca z partnerami na Ukrainie i w Białorusi\norganizowanie zespołów pracowniczych i monitorowanie pracy podległych pracowników\npomoc w prowadzeniu obsługi administracyjnej przed zatrudnieniem pracowników i w trakcie ich zatrudnienia\norganizacja i realizacja projektów wynajmu pracowników w tym noclegów i kontrola miejsc pracy oraz płatności związanych z realizacją projektów\ntworzenie cyklicznych raportów w ramach prowadzonych projektów\nbudowanie i utrzymywanie partnerskich relacji z Klientami agencji\n\nWymagania:\n\nminimum 2 letnie doświadczenie w pracy na stanowisku Rekrutera\ndoświadczenie zdobyte w firmie, agencji pracy, firmie rekrutacyjnej/outsourcingowej\nznajomość języka rosyjskiego/ukraińskiego w mowie i piśmie\npraktyczna znajomość pakietu MS Office\nwysoki poziom zdolności organizacyjnych i zarządzania czasem\nintuicja, pomysłowość oraz niewyczerpana motywacja\nprzedsiębiorczość, nastawienie na osiąganie celów, wytrwałość\nsamodzielność w prowadzeniu powierzonych spraw i projektów\ngotowość do ciągłego rozwoju osobistego.\n\nWszystkich zainteresowanych prosimy o aplikowanie za pomocą przycisku \"aplikuj\" lub tel. +48 722 111 544",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Monter Mebli / Stolarz Meblowy",
        "category": "olx",
        "phone": "535808708",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma BIELMEB zatrudni pracownika do montażu mebli (głównie meble kuchenne oraz szafy wnękowe).\n\nOd kandydata oczekujemy:\n\n- obsługa elektronarzędzi typu wkrętarka, piła,\n\n- montaż mebli w warsztacie i u klienta\n\n- umiejętność czytania rysunków technicznych\n\n- mile widziane doświadczenie przy montażu mebli kuchennych, szaf wnękowych\n\n- kultura osobista, punktualność, dokładność\n\n- prawo jazdy kat. B",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Dostawca hurtownia alkoholi",
        "category": "olx",
        "phone": "514607712",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Praca przy rozwożeniu piwa i wszelkiego rodzaju alkoholu poszukuje kogoś z doświadczeniem.\nKontakt na nr. 514607712",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Murarze ZATRUDNIMY Silaka / Orta na klej",
        "category": "olx",
        "phone": "507509900",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Murowanie Silki / orty na kleju\n\nZatrudnimy murarzy z doświadczeniem \n\npraca z akordu i godzinowo  \n\nnarzędzia, ciągłość pracy \n\nZatrudnimy pojedynczych Murarzy lub całe ekipy \n\nPłacimy 27 pln za m2,  oraz 22 PLN za 1h prace dodatkowo zlecone.\n\nZapewniamy brygadzistę, materiały, narzędzia, szkolenie BHP i badania lekarskie,\n\nUmowa zlecenia na początek, a dla najlepszych umowa o pracę na czas nieokreślony.\n\nZapewniamy zaliczki, pensja do 01-05 każdego bieżącego miesiąca.\n\nNorma dzienna min 12m2 do 14m2 i więcej dziennie. Wyłącznie osoby z doświadczeniem.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Doradca ds. ubezpieczeń",
        "category": "olx",
        "phone": "502072811",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Specjalista ds. Obsługi Ubezpieczeń - pilnie poszukiwany. \n\nWymagania: Doświadczenie w obsłudze i sprzedaży ubezpieczeń komunikacyjnych, majątkowych i życiowych oraz wiedzy z zakresu ubezpieczeń. \n\nDobrej znajomości pakietu MS Office \n\nDobrej organizacji pracy własnej, komunikatywności, umiejętności pracy w zespole, otwartości na nowe doświadczenia i chęci udziału w organizowanych szkoleniach. Preferowane posiadanie uprawnień agencyjnych. \n\nOferujemy: stabilne zatrudnienie w oparciu o umowę o pracę, atrakcyjne wynagrodzenie, w tym system premiowy, dostęp do wielu ciekawych szkoleń, możliwość rozwoju zawodowego. \n\nOsoby zainteresowane proszę o przesłanie CV na adres mail. \n\nProszę o dołączenie zgody na przetwarzanie danych osobowych.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca w sklepie spożywczym",
        "category": "olx",
        "phone": "503135635",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "mały sklep spożywczy Carrefour Express przy ul. Targowej w Warszawie poszukuje pracownika na stanowisko kasjer sprzedawca. Praca w małym, miłym, młodym zespole na dwie zmiany. Nie pracujemy w niedziele. Płaca 14 złotych za godzinę na rękę.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Doświadczonego KIEROWNIKA BARU od zaraz!",
        "category": "olx",
        "phone": "790022454",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Bazar Bistro Klub poszukuje SZEFA / KIEROWNIKA BARU.\n\nPoszukujemy energicznej osoby z głową na karku, która:\n\nposiada minimum 1 rok doświadczenia w zarządzaniu barem w klubie lub restauracji - WARUNEK KONIECZNY - nie aplikuj jeśli nie spełniasz tego warunku,\njest w pełni dyspozycyjna,\njest doświadczona i kreatywna w zakresie tworzenia oferty alkoholowej,\njest skrupulatna, w pełni zaangażowana, odpowiedzialna i samodzielna,\nzna język angielski w stopniu przynajmniej komunikatywnym.\n\nOferujemy:\n\nelastyczny grafik,\natrakcyjne, adekwatne do umiejętności wynagrodzenie,\nmożliwość rozwoju.\n\nCV wraz ze zdjęciem i klauzulą dotyczącą zgody na przetwarzanie danych osobowych prosimy przesłać przez formularz kontaktowy lub na adres klub\"małpa\"bazarklub.pl",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnię ekspedientke do sklepu 24 h",
        "category": "olx",
        "phone": "501821143",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię ekspedientke do sklepu 24 H tel 501-821-143 Możliwa praca na same noce ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnię murarzy i pomocników",
        "category": "olx",
        "phone": "502722900",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię murarzy i pomocników praca na Pradze północ proszę o kontakt pod nr 502722900 w godzinach 7/19",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "zatrudnię do prac remontowo-budowlanych",
        "category": "olx",
        "phone": "601919988",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię do prac remontowo-budowlanych GK, malowanie, szpachlowanie, elektryka.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pracownik biurowy do Fundacji",
        "category": "olx",
        "phone": "604274868",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy pracownika biura Fundacji\n\nPraca w Warszawie, na pełen etat.\n\nMile widziane doświadczenie w pracy w organizacji pozarządowej.\n\nOczekujemy przede wszystkim zaangażowania, dobrego poruszania się w dokumentach i zmysłu organizacyjnego\n\nZakres obowiązków to najogólniej mówiąc koordynacja realizacji projektów i innych bieżących działań.\n\nAplikuj poprzez e-mail: fundacja[at]pociechom.org.pl",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Studentkę do pracy w kwiaciarni",
        "category": "olx",
        "phone": "511283185",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię studentkę do pracy w kwiaciarni w niepełnym wymiarze godzin. \n\nJeśli jesteś osobą twórczą, kochasz rośliny, lubisz się uczyć nowych rzeczy, nie boisz się wyzwań i ciężkiej pracy napisz nam kilka słów o sobie i załącz CV. \n\nMile widziane: doświadczenie w sprzedaży, kierunki ogrodnicze lub artystyczne, podstawowy kurs florystyczny, podstawowa wiedza na temat roślin doniczkowych.\n\nCzego oczekujemy:\n\notwartości w kontaktach z ludźmi\nzapału do samorozwoju i uczenia się nowych rzeczy\numiejętności samoorganizacji na stanowisku pracy\nwysokiej kultury osobistej i odporności na stres\npracowitość\npoczucia odpowiedzialności za powierzone zadania\n\nOferujemy:\n\nelastyczny czas pracy\nmożliwość szkolenia i rozwoju w zawodzie florysty\numowę zlecenie\ndobrą atmosferę w pracy ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnię osobę do sprzątania klatek",
        "category": "olx",
        "phone": "605726258",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię osobę do sprzątania klatek schodowych na 1/2 etatu . Więcej informacji pod numerem telefonu : 605 726 258",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca na magazynie",
        "category": "olx",
        "phone": "515491001",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię do pracy na magazynie. Praca również w warunkach zewnętrznych.\nGłówne obowiązki:\n-  składanie towaru, \n-   sprzątanie obiektu,\n-    jazda samochodem dostawczym.\nWymagania:\n -osoba niepaląca,\n- sprawna fizycznie, wiek max 45 lat,\n- prawo jazdy kategoria B.\nPraca dorywcza w  czwartki, soboty i niedziele.\nWynagrodzenie 18 zł/h na rękę.\nKontakt tylko telefoniczny:\n 515 491 001",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Obsługa Recepcji Centrum rozrywkowo-eventowe",
        "category": "olx",
        "phone": "503684400",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Chcesz pracować w ciekawej branży? Chcesz uniknąć rutyny i pracy za biurkiem? Jeśli do tego jesteś otwarta, komunikatywna i lubisz pracę z ludźmi - zapraszamy! Dołącz do naszego teamu i pracuj w największym centrum rozrywkowo- eventowym w Warszawie.\n\nZakres obowiązków\n\n– obsługa klienta na recepcji i barku\n\n– obsługa systemu\n\n– umiejętność bezkonfliktowego rozwiązywania sporów\n\n– informowanie klientów o promocjach i wydarzeniach\n\n– dbanie o czystość obiektu\n\n– drobne prace biurowe\n\n– dokonywanie zamówień, dbanie o stan zaopatrzenia\n\nWymagania\n\n– komunikatywność\n\n– wysoka kultura osobista\n\n– umiejętność pracy w zespole\n\n– miła aparycja\n\n– mile widziana znajomość j. angielskiego\n\nOferujemy :\n\n-16 zł/h netto\n\n-umowa zlecenie lub umowa o pracę\n\n-możliwość skorzystania z atrakcji obiektu\n\n-Praca zmianowa ok 15 dni w miesiącu, w tym 2 weekendy.\n\n-elastyczny grafik",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zbrojarz/Cieśla PREFABRYKACJA Finlandia Aktualne!!",
        "category": "olx",
        "phone": "539827155",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Pracodawca Fiński Amiko oy Zatrudni zbrojarzy cieśli do  zakładu  elementów prefabrykowanych.\n\nFIRMA ZAPEWNIA\n\n-Umowę o prace Na Fińskich Warunkach.\n\n-Praca od Zaraz\n\n-Atrakcyjne wynagrodzenie\n\n-Dodatek urlopowy 9-12%\n\n-Zakwaterowanie czyste umeblowane mieszkanie, Pracownik Płaci Max 250euro miesiąc\n\n-Ubrania Robocze\n\n-Samochód Służbowy Jeśli istnieje taka potrzeba\n\n-Narzędzia\n\n-Zwrot kosztów przelotu.\n\n-Pomoc w Załatwieniu Spraw Urzędowych.\n\nWYMAGANIA\n\n-Doświadczenie na stanowisku.\n\n-Znajomość rysunku technicznego.\n\n-Umiejętność wiązania kluczem zbrojarskim.\n\n-Ogólne zasady pracy.\n\n-Mile widziany j.Angielski w stopniu komunikatywnym.\n\n-Pracowity, energiczny,samodzielny nie bojący się pracy.\n\n-Prawo jazdy kat B\n\nWięcej informacji:\n\nProszę dzwonić od 08:00-17:00\n\n+48539827155",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Księgowa do Biura Rachunkowego :)",
        "category": "olx",
        "phone": "883777857",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy do swojego zespołu super księgowej, która posiada pozytywne podejście do życia i z zapałem podchodzi do swojej pracy. Na tym stanowisku kluczowy jest stały kontakt z klientem, dlatego szukamy osoby, która kocha ludzi i nie boi się nowych wyzwań, które są nieodłącznym elementem naszej pracy, gdyż każdy kto dobrze zna pracę w księgowości, wie, że z nudą ma ona niewiele wspólnego :)\n\nPraca polega na samodzielnym prowadzeniu księgowości KPiR oraz kadr i płac w programie OPTIMA, a także składaniu zgłoszeń i deklaracji do ZUS w programie Płatnik.\n\nMiejsce pracy: Warszawa\n\nOferujemy:\n\n-stabilne zatrudnienie\n\n-umowę o pracę lub umowę zlecenie (jeśli jesteś studentką)\n\n-przyjazną atmosferę w młodym zespole\n\n-wsparcie merytoryczne\n\n-ciągły rozwój i naukę nowych zagadnień\n\n-brak nudy w pracy ;) \n\n-dogodną lokalizację (Warszawski Koneser)\n\nOczekujemy:\n\n-doświadczenia w samodzielnym prowadzeniu kpir\n\n-znajomości programu OPTIMA\n\n-samodzielności i dokładności w pracy\n\n-zaangażowania\n\n-mile widziana znajomość programu Płatnik\n\n-dobrego kontaktu z innymi ludźmi, ponieważ ci inni ludzie to nasi cudowni klienci ;)\n\nZapraszamy do kontaktu :)",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Найму будівельні бригади",
        "category": "olx",
        "phone": "791808074",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Найму будівельні бригади по 4-5чоловік з досвідом на будівництві  (фасадні роботи ,покрівельників,плиточні роботи та інш.)БЕЗ ШКІДЛИВИХ ЗВИЧОК. Житлом забезпечую та вчасно оплату праці.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "FRYZJERKA męska targówek",
        "category": "olx",
        "phone": "517390400",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Fryzjerka minimum dwa lata stażu pracy.praca zmianowa pensja co dwa tygodnie.tel.517390400",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca Krawcowa i pomoc krawiecka idealna dla kobiet.",
        "category": "olx",
        "phone": "663870103",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię krawcową / szwaczkę i pomoc krawiecką w małej, rodzinnej pracowni produkującej kurtki i śpiwory (głównie puchowe). Firma istnieje od 30 lat dzięki dobremu i zgranemu zespołowi oraz wysokiej jakości produktom. Zapraszamy do współpracy rzetelną i uczciwą krawcową.\n\nMiejsce pracy Warszawa Praga północ.\n\nUl. Kijowska na przeciwko dworca wschodniego. ( Łatwy dojazd komunikacją )\n\nPraca od Poniedziałku do Piątku.\n\nBardzo miła atmosfera",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnie pracownika budowlanego z doświadczeniem",
        "category": "olx",
        "phone": "501554566",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnie pracownika do scianek GK i sufitów podwieszanych z doświadczeniem. Zapewniam dojazd na budowę,  ewentualnie mieszkanie.  Wynagrodzenie do ustalenia indywidualnie.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Opiekun do żłobka Warszawa Praga",
        "category": "olx",
        "phone": "607822808",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Duży, nowoczesny żłobek na Pradze  poszukuje ciepłej i doświadczonej opiekunki.\n\nOferujemy: umowę o pracę, pełny etat, satysfakcjonujące wynagrodzenie,\n\npracę w młodym kreatywnym zespole.\n\nWymagania: wykształcenie kierunkowe lub ukończenie kursu opiekunki dziecięcej lub wykształcenia średniego z min. rocznym doświadczeniem w pracy z dziećmi do lat 3, cierpliwości, komunikatywności, kreatywności w pracy z dziećmi, chęci do pracy oraz punktualności,\n\nZainteresowane osoby proszę o kontakt telefoniczny pod numerem +48 607 822 808",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Sklep spozywczy, Kasjer\\Sprzedawca, ul. Okrzei",
        "category": "olx",
        "phone": "509939321",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnie Pania na stanowisko Kasjer\\Sprzedawca, do sklepu spozywczego na ulicy Okrzei. Bardzo dobry dojazd - blisko autobusy, tramwaje, metro, pociag. Umowa o prace. Mozliwosc wyplaty tygodniowek. Szukam osoby powaznej, odpowiedzialnej, uczciwej, punktualnej, dyspozycyjnej, nie szukajacej pracy na chwile. Mila i bezstresowa atmosfera z dobra dniowka + premie. Zapewniam wszelkie srodki bezpieczenstwa typu maseczka, plyny czy rekawiczki, za kasa szyba. Mile widziane doswiadczenie w sklepie spozywczym. Prosze dzwonic pod moj podany w ogloszeniu numer telefonu: 509-939-321 . Nie zawsze mam dostep do komputera, wiec na wiadomosci nie odpisuje.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnimy kierowcę",
        "category": "olx",
        "phone": "668891915",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma transportowa z 35 letnim doświadczeniem, poszukuje pracownika na stanowisko kierowcy międzynarodowego w systemie 3/1 lub 4/1\n\nNasze wymagania:\n\n - prawo jazdy kategorii C+E\n\n- aktualne dokumenty kierowcy zawodowego\n\n - doświadczenie w prowadzeniu samochodów ciężarowych (min 6 miesięcy)\n\nNasze oczekiwania:\n\n- sumienność, dyspozycyjność, komunikatywność\n\n- dbanie o powierzone mienie\n\nOferujemy:\n\n- dobrze zorganizowaną pracę\n\n- umowę o pracę, lub możliwość współpracy na zasadzie własnej działalności\n\n- nowoczesną flotę (Scania, DAF E6)-na kontraktach serwisowych\n\n- stałą opiekę spedytora\n\n- atrakcyjne i terminowe wynagrodzenie: 280 zł dniówka + 20 zł premia motywacyjna za każdy dzień + 2140 zł (netto) podstawa lub 400zł dniówka\n\nDla samozatrudnionych- zwrot ZUS-u oraz księgowej\n\nKontakt:\n\nMariusz 668 891 915\n\nPatryk 784 060 630\n\nCelina 668 128 915",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Barber - Warszawa Praga",
        "category": "olx",
        "phone": "739299091",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy doświadczonego barbera do naszego salonu Barber Shop Praga, przy ulicy Ząbkowskiej.\n\nJesteśmy zespołem profesjonalistów z pasją, nie bojących się wyzwań i nowości!\n\nCzerpiemy ogromną satysfakcję z pracy oraz usług oferowanych naszym Klientom. Jeśli masz podobne podejście do swojego zawodu nie zwlekaj i wyślij do nas swoje CV za pośrednictwem OLX. Nie pożałujesz! Najlepszym gwarantujemy świetną atmosferę pracy, przeszkolenie pod okiem doświadczonego Szkoleniowca oraz zarobki od 5000 do 10000zł. Praca czeka na Ciebie od zaraz! :) Wymagania: doświadczenie zawodowe\n\n(Twoje umiejętności znaczą dla nas więcej, niż papier! :) ) Język angielski mile widziany. Nie zastanawiaj się, aplikuj !\n\nwww.facebook.com/BarberShopWarszawaPraga\n\n739 299 091",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Praca w punkcie gastronomicznym Lody/Gofry na Saskiej Kępie",
        "category": "olx",
        "phone": "506411466",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Poszukujemy pracownika do punktu gastronomicznego Have an Ice Day zlokalizowanego na Saskiej Kępie\n\nNie wymagamy doświadczenia - wszystkiego Cię nauczymy, wystarczą dobre chęci do pracy i nauki!\n\nPraca polega na przygotowywaniu lodów, gofrów, deserów lodowych, obsłudze klienta i kaso-terminala, utrzymaniu czystości na punkcie.\n\nElastyczny grafik\n\nStawka: 18,50 brutto/h, umowa zlecenie\n\nOferujemy:\n\npremie uzależnione od wykonanego obrotu\nTerminowe wynagrodzenie\numowa zlecenie\n\nWymagamy:\n\nksiążeczki sanepidowskiej\nchęci do pracy i uczenia się\npunktualność i skrupulatność\numiejętność samodzielnej pracy\n\nOsoby zainteresowane proszę o wysłanie CV.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Asystentka Stomatologiczna Warszawa",
        "category": "olx",
        "phone": "790200070",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Nowo powstały gabinet stomatologiczny w Warszawie na Pradze Północ poszukuje pracownika na stanowisko Asystentka Stomatologiczna.\n\nWymagania:\n\nwykształcenie kierunkowe\ndoświadczenie w asyście endodontycznej przy zabiegach z zakresu stomatologii, ortodoncji, protetyki\ndobra organizacja pracy\nkomunikatywność\n\nOferujemy:\n\npracę w miłym miejscu\nsatysfakcjonujące zarobki\ndogodną formę współpracy\nnowoczesny sprzęt i wysokiej jakości materiały\nopiekę stomatologiczną na dogodnych warunkach\n\nZakres obowiązków:\n\nprzygotowywanie gabinetu do zabiegów\nczynne asystowanie lekarzowi\nutrzymanie czystości w asystorach, szafkach z asortymentem\n\nZainteresowane osoby prosimy o przeslanie CV , bądź kontakt pod numerem telefonu 790 200 070",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pracownik produkcji",
        "category": "olx",
        "phone": "517300821",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Firma branży materiałów POS poszukuje kandydatów na stanowisko: pracownik produkcji.\n\nZakres obowiązków:\n\n·        Wykonywanie prac manualnych\n\n·        Efektywna organizacja pracy własnej i współdziałanie z innymi\n\n·        Kontrola terminowości i zgodności wykonywania zleceń\n\nWymagania:\n\n·        Zaangażowanie\n\n·        Zdolności manualne\n\n·        Dyspozycyjność\n\n·        Prawo jazdy kat B\n\nOferujemy :\n\n·        Umowę o pracę\n\n·        Udział w ciekawych projektach\n\n·        Możliwość rozwoju zawodowego\n\nWszelkie informacje związane z ogłoszeniem mogą Państwo uzyskać pod numerem telefonu: 517 300 821\n\nOsoby zainteresowane prosimy o przesyłanie aplikacji klikając w przycisk aplikowania.",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pomocnik stolarza meblowego",
        "category": "olx",
        "phone": "500200023",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnimy pomocnika stolarza meblowego do przyuczenia. \n\nMinimalne doświadczenie w pracy na stolarni mile widziane.\n\nWymagamy: \n\n- zaangażowania i rzetelności w wykonywaniu powierzonych zadań\n\n -punktualności i odpowiedzialności \n\n-mile widziane prawo jazdy \n\nOferujemy:\n\n -zatrudnienie na umowę o pracę \n\n-gwarantujemy możliwość rozwoju zawodowego\n\n -premie finansowe \n\n Stawka początkowa 12-14zł/h\n\n Praca w Warszawie Praga Północ \n\nOsoby zainteresowane proszę o kontakt telefoniczny 500200023",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Zatrudnię do transportu i montażu mebli",
        "category": "olx",
        "phone": "512252623",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Zatrudnię osobę do transportu i montażu mebli. Wymagane doświadczenie w transporcie mebli lub przeprowadzkach.\n\nPraca przy bezpośredniej obsłudze klienta więc wymagana jest również wysoka kultura osobista. Nienormowane godziny pracy.  Więcej informacji pod nr telefonu 512-252-623",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Pomoc na kuchnie z umiejętnością robienia wyrobów mącznych",
        "category": "olx",
        "phone": "504311583",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Bistro Prażanka, firma z wieloletnim doświadczeniem poszukuje pomocy na kuchnię z umiejętnościami wyrobów mącznych.\n\nOczekujemy: \n\n- dobrej organizacji pracy,\n\n- odpowiedzialnej za powierzone obowiązki,\n\n- umiejętności samodzielnej pracy jak i współpracy w zespole,\n\n- gotowej podjąć dłuższą współpracę.\n\nOferujemy:\n\n- Praca zmianowa Pon-Pt 9-18, 12-20 , co druga Sob-Niedz 9-18\n\n- Posiłek pracowniczy\n\n- Umowa o pracę\n\n-Stawka godzinowa 15 zł / okres próbny\n\nOsoby zainteresowane proszę o kontakt pod numerem telefonu 504311583 w godzinach 9-17",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Sprzedawca kasjer w piekarni",
        "category": "olx",
        "phone": "509862870",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "PRACA SZUKA CZŁOWIEKA !!! Jedna z najbardziej rozpoznawalnych marek piekarsko ciastkarskich w regionie mazowieckim rozumiejącą potrzeby klientów oraz spełniającą ich oczekiwania w zakresie najwyższej jakości produktów. Do obowiązków sprzedawcy należy: -obsługa Klienta -zatowarowanie sklepu -utrzymywanie porządku i czystości w sklepie -kontrola towaru -obsługa kasy fiskalnej -obsługa terminala Proponujemy atrakcyjne warunki zatrudnienia: -umowa o pracę, -wynagrodzenia wypłacane zawsze na czas -system premiowy -praca w systemie dwuzmianowym -rozwój poprzez szkolenia Doświadczenie w handlu, w branży piekarniczej będzie dodatkowym atutem książeczka do celów sanitarno-epidemiologicznych Jeśli masz więcej pytań, proszę się kontaktować pod nr: 509 862 870 Prosimy o dołączenie następującej klauzuli: Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w mojej ofercie pracy dla potrzeb niezbędnych do realizacji procesu rekrutacji zgodnie z Ustawą z dn. 29.08.1997 r. o Ochronie Danych Osobowych (Dz.U. nr 133 poz. 883).\n\nWizyty: 8232\n\nPatrycja(Zobacz więcej ogłoszeń)Użytkownik od 10-2011\n\nPołączenia",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "Kelnerka do restauracji Sushi na Pradze",
        "category": "olx",
        "phone": "534822922",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Restauracja Sushi na Pradze Północ poszukuje osoby na stanowisko: kelnerka.\n\nSzukamy osób:\n\nz pozytywnym nastawieniem;-)\nchętnych do pracy\nz pełną dyspozycyjnością 15-16 dni pracy\nminimalna znajomość angielskiego mile widziana\ndoświadczenie na stanowisku kelnerki w restauracji japońskiej mile widziane ale nie jest warunkiem koniecznym\n\nOferujemy:\n\npracę w miłej atmosferze w restauracji w sercu Pragi;-)\n\nStawka wyjściowa 14 zł na godzinę plus premie sprzedazowe, napiwki tylko dla Ciebie\n\nZapraszamy!",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "fryzjer fryzjerka",
        "category": "olx",
        "phone": "690455890",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Bardzo dobrze prosperujące salony Figaro szukają fryzjerów fryzjerki  damsko-męskie i dziecięce praca na zmianę  podstawa plus procent. Zapewniamy szkolenia i stały rozwój. Praca w miłej atmosferze w centrum lub Praga Północ kontakt telefoniczny pod numerem 690455890",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    },
    {
        "id": "",
        "name": "praca",
        "category": "olx",
        "phone": "668861318",
        "email": "",
        "consumption": "",
        "owner": "mateusz.ziolkowski",
        "city": "Warszawa",
        "street": "",
        "streetNumber": "",
        "postalCode": "",
        "description": "Wiodąca na rynku agencja nieruchomości poszukuje w Warszawie kandydatów na :\n\nDoradcę ds Nieruchomości\n\nNasze preferencje:\n\n- osoby młode duchem , aktywne, nastawione pozytywnie do ludzi\n\n- dobrze zorganizowane\n\n- zainteresowane sukcesem finansowym a nie wegetacją\n\n- nastawione na pracę i wysiłek\n\n- zdolne połączyć pracę przy komputerze z pracą w terenie\n\nDamy dobrą pracę, nauczymy zawodu, pomożemy zarobić sensowne pieniądze ale tylko najlepszym!\n\nNasz czas to też pieniądze! Nie tracimy czasu dla przeciętniaków!\n\nZapraszamy, wyślij CV, zaprezentuj się, zaskocz nas swoim potencjałem:)\n\ntel: 668 861 318 ",
        "tasks": [],
        "status": "potencjalny",
        "www": ""
    }
];




// koniec baza do dodania




//dodawanie klientów hurt
// miałem 372 przed
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


module.exports = router;