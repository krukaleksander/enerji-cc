let allClientsFromDB = [];
(() => {
    const table = document.querySelector('.clients-table');
    const spinner = document.querySelector('.lds-roller');
    const clientsTable = document.querySelector('.clients-table tbody');
    const numberOfClientsSpan = document.querySelector('.wallet-summary span');
    const numberOfPagesContainer = document.querySelector('.number-of-pages');
    const btnBackToList = document.querySelector('.back-to-all__btn');
    let actualPage = 1;
    let pageForSummary = 1;

    function updatePage() {
        numberOfPagesContainer.innerHTML = `Strona ${pageForSummary} z ${Math.floor((allClientsFromDB.length) / 20) + 1}`;
        return Math.floor((allClientsFromDB.length) / 20) + 1
    }

    // funkcja skracająca nazwę

    function shortenName(name) {
        if (name.length < 45) {
            return name;
        } else {
            return `${name.slice(0,45)}...`;
        }

    }


    // koniec funkcja skracająca nazwę

    const getClients = async (start, end) => {
        const clients = await fetch(`${window.location.href}/get-clients/`);
        const clientsArr = await clients.json();
        allClientsFromDB = clientsArr;
        clientsToShow = clientsArr.slice(start, end);
        await clientsToShow.forEach(client => {
            const {
                id,
                name,
                phone,
                consumption,
                owner,
                status
            } = client;
            return clientsTable.innerHTML = clientsTable.innerHTML + `<tr><td>${id}</td><td>${shortenName(name)}</td><td>${phone}</td><td>${consumption}</td><td>${status}</td><td>${owner}</td></tr>`
        });
        spinner.style.display = 'none';
        table.style.display = 'block';
        numberOfClientsSpan.innerHTML = `${clientsArr.length} klientów. Gratuluję wspólniku =)`;
        updatePage();
        setOpenClients();
    }
    getClients(0, 20);

    //funkcja do zmieniania strony

    function jumpToPage(page = actualPage, direction) {
        btnBackToList.style.display = 'none';
        document.querySelector('.doesnt-find-client').innerHTML = '';
        if (page === 1 && direction === 'prev') return
        if ((page === Math.floor((allClientsFromDB.length / 20)) + 1) && direction === 'next') return

        clientsTable.innerHTML = '<tr><th>NIP</th><th>Nazwa</th><th>Telefon</th><th>Zużycie [MWH]</th><th>Status</th><th>Opiekun </th></tr>';

        function changingContent(from, to) {
            const clientsToShow = allClientsFromDB.slice(from, to);
            clientsToShow.forEach(client => {
                const {
                    id,
                    name,
                    phone,
                    consumption,
                    owner,
                    status
                } = client;
                return clientsTable.innerHTML = clientsTable.innerHTML + `<tr><td>${id}</td><td>${shortenName(name)}</td><td>${phone}</td><td>${consumption}</td><td>${status}</td><td>${owner}</td></tr>`
            });
        }

        if (direction === 'next') {
            const from = actualPage * 20;
            const to = from + 20;
            changingContent(from, to);
            actualPage++
            pageForSummary++
            updatePage();


        }
        if (direction === 'prev') {
            const from = (actualPage - 2) * 20;
            const to = from + 20;
            changingContent(from, to);
            actualPage--;
            pageForSummary--;
            updatePage();
        }
        if (direction === 'jump-to') {
            const to = page * 2 * 10;
            const from = to - 20;
            changingContent(from, to);
            pageForSummary = page;
            updatePage();
            actualPage = page;
        }
        setOpenClients();
    }
    // koniec funkcja do zmieniania strony


    // podpięcie zmieninia strony do guzików


    const nextBtn = document.querySelector('.pagination-crm__next');
    const prevBtn = document.querySelector('.pagination-crm__prev');
    const jumpBtn = document.querySelector('.pagination-crm__btn');

    nextBtn.addEventListener('click', () => jumpToPage(actualPage, 'next'));
    prevBtn.addEventListener('click', () => jumpToPage(actualPage, 'prev'));
    jumpBtn.addEventListener('click', () => {
        const page = Number(document.querySelector('.pagination-crm__input').value);
        if (page == NaN || page <= 0 || page > allClientsFromDB.length - 1) return;
        document.querySelector('.pagination-crm__input').value = '';
        jumpToPage(page, 'jump-to');
    });

    // koniec podpięcie zmieniania strony do guzików


    // wyszukiwanie klientów   
    let searchInputValue, searchOption;
    const searchButton = document.querySelector('.searchButton');

    searchButton.addEventListener('click', () => {
        let clientToShow = [];
        searchOption = document.querySelector('.search__select-option').value;
        searchInputValue = document.querySelector('.searchTerm').value;

        if (searchOption === 'name') {
            const re = RegExp(`${searchInputValue}`, 'gmi');
            clientToShow = allClientsFromDB.filter(value => re.test(value.name));
        }
        if (searchOption === 'nip') {
            clientToShow.push(allClientsFromDB.find(client => client.id == searchInputValue));
        }

        document.querySelector('.searchTerm').value = '';
        btnBackToList.style.display = 'block';
        const doesntFindFn = () => {
            clientsTable.innerHTML = '<tr><th>NIP</th><th>Nazwa</th><th>Telefon</th><th>Zużycie [MWH]</th><th>Status </th><th>Opiekun </th></tr>'
            document.querySelector('.doesnt-find-client').innerHTML = 'Nie znaleziono klienta';
        };
        if (clientToShow.length < 1 || clientToShow[0] === undefined) return doesntFindFn();
        clientsTable.innerHTML = '<tr><th>NIP</th><th>Nazwa</th><th>Telefon</th><th>Zużycie [MWH]</th><th>Status </th><th>Opiekun </th></tr>';
        clientToShow.forEach(client => {
            const {
                id,
                name,
                phone,
                consumption,
                owner,
                status
            } = client;
            clientsTable.innerHTML = clientsTable.innerHTML + `<tr><td>${id}</td><td>${shortenName(name)}</td><td>${phone}</td><td>${consumption}</td><td>${status}</td><td>${owner}</td></tr>`;
            btnBackToList.style.display = 'block';
        })

        setOpenClients();

    });

    btnBackToList.addEventListener('click', () => {
        jumpToPage(actualPage, 'jump-to');
    });

    // koniec wyszukiwanie klientów


    // otwieranie poszczególnych klientów
    const particularClientContainer = document.querySelector('.particular-client');

    function setOpenClients() {
        const nipy = [...document.querySelectorAll('.clients-table tr td:nth-child(1)')];
        nipy.forEach(nip => nip.addEventListener('click', (e) => {
            particularClientContainer.style.display = 'flex';
            const clientToShow = allClientsFromDB.find(client => client.id == e.target.innerHTML);
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
                tasks,
                description,
                status
            } = clientToShow;
            const idPar = document.querySelector('.particular-client__id');
            const namePar = document.querySelector('.particular-client__name');
            const ownerPar = document.querySelector('.particular-client__owner');
            const phonePar = document.querySelector('.particular-client__phone');
            const emailPar = document.querySelector('.particular-client__email');
            const consumptionPar = document.querySelector('.particular-client__consumption');
            const categoryPar = document.querySelector('.particular-client__category');
            const postalCodePar = document.querySelector('.particular-client__postal-code');
            const cityPar = document.querySelector('.particular-client__city');
            const streetPar = document.querySelector('.particular-client__street');
            const streetNumberPar = document.querySelector('.particular-client__street-number');
            const descriptionPar = document.querySelector('.particular-client__description');
            const selectStatus = document.querySelector('.particular-client__select-status');

            idPar.value = id;
            namePar.value = name;
            ownerPar.value = owner;
            phonePar.value = phone;
            emailPar.value = email;
            consumptionPar.value = consumption;
            categoryPar.value = category;
            postalCodePar.value = postalCode;
            cityPar.value = city;
            streetPar.value = street;
            streetNumberPar.value = streetNumber;
            selectStatus.value = status;
            if (description.length > 0) return descriptionPar.value = description;
            descriptionPar.value = 'Opis...';
        }));
    };

    document.querySelector('.particular-client__close').addEventListener('click', () => {
        particularClientContainer.style.display = 'none';
    });

    document.querySelector('.particular-client__btn-cancel').addEventListener('click', () => {
        particularClientContainer.style.display = 'none';
    });

    // fragment edycja klienta

    document.querySelector('.particular-client__btn-update').addEventListener('click', (e) => {
        e.preventDefault();
        let data = new URLSearchParams();
        data.append("id", document.querySelector('.particular-client__id').value);
        data.append("name", document.querySelector('.particular-client__name').value);
        data.append("owner", document.querySelector('.particular-client__owner').value);
        data.append("phone", document.querySelector('.particular-client__phone').value);
        data.append("email", document.querySelector('.particular-client__email').value);
        data.append("consumption", document.querySelector('.particular-client__consumption').value);
        data.append("category", document.querySelector('.particular-client__category').value);
        data.append("postalCode", document.querySelector('.particular-client__postal-code').value);
        data.append("city", document.querySelector('.particular-client__city').value);
        data.append("street", document.querySelector('.particular-client__street').value);
        data.append("streetNumber", document.querySelector('.particular-client__street-number').value);
        data.append("description", document.querySelector('.particular-client__description').value);
        data.append("status", document.querySelector('.particular-client__select-status').value);

        fetch(`${window.location.href}/update-client/`, {
                method: 'post',
                body: data
            })
            .then(function (response) {
                return response.text();
            })
            .then(function (text) {
                const updateInfoContainer = document.querySelector('.particular-client__update-info');
                updateInfoContainer.innerHTML = text;
                updateInfoContainer.style.display = 'block';
                setTimeout(() => updateInfoContainer.style.display = 'none', 1500)
            })
            .catch(function (error) {
                console.log(error)
            });

        // edycja na przodzie 
        const id = document.querySelector('.particular-client__id').value;
        const name = document.querySelector('.particular-client__name').value;
        const owner = document.querySelector('.particular-client__owner').value;
        const phone = document.querySelector('.particular-client__phone').value;
        const email = document.querySelector('.particular-client__email').value;
        const consumption = document.querySelector('.particular-client__consumption').value;
        const category = document.querySelector('.particular-client__category').value;
        const postalCode = document.querySelector('.particular-client__postal-code').value;
        const city = document.querySelector('.particular-client__city').value;
        const street = document.querySelector('.particular-client__street').value;
        const streetNumber = document.querySelector('.particular-client__street-number').value;
        const description = document.querySelector('.particular-client__description').value;
        const status = document.querySelector('.particular-client__select-status').value;

        allClientsFromDB = allClientsFromDB.map(client => {
            if (client.id == id) {
                return {
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
                }
            } else {
                return client
            }
        })
        jumpToPage(actualPage, 'jump-to');
        //koniec edycja na przodzie
    })



    //koniec fragment edycja klienta

    // koniec otwieranie poszczególnych klientów

    // dodanie klienta próba impotu


    const newClientContainer = document.querySelector('.particular-client-new');
    const closeNewContainer = document.querySelector('.particular-client-new__close');
    const openNewContainer = document.querySelector('.add-client-icon__icon');
    const cancelBtn = document.querySelector('.particular-client-new__btn-cancel');
    const addClientBtn = document.querySelector('.particular-client-new__btn-update');
    const checkingNipSpinner = document.querySelector('#checking-client');
    openNewContainer.addEventListener('click', () => {
        zeroValues();
        newClientContainer.style.display = 'flex'
    });
    closeNewContainer.addEventListener('click', () => newClientContainer.style.display = 'none');
    cancelBtn.addEventListener('click', () => newClientContainer.style.display = 'none');

    let idPar, namePar, ownerPar, phonePar, emailPar, consumptionPar, categoryPar, postalCodePar, cityPar, streetPar, streetNumberPar, descriptionPar, selectStatus;

    function getActualValues() {
        idPar = document.querySelector('.particular-client-new__id').value;
        namePar = document.querySelector('.particular-client-new__name').value;
        ownerPar = document.querySelector('.particular-client-new__owner').value;
        phonePar = document.querySelector('.particular-client-new__phone').value;
        emailPar = document.querySelector('.particular-client-new__email').value;
        consumptionPar = document.querySelector('.particular-client-new__consumption').value;
        categoryPar = document.querySelector('.particular-client-new__category').value;
        postalCodePar = document.querySelector('.particular-client-new__postal-code').value;
        cityPar = document.querySelector('.particular-client-new__city').value;
        streetPar = document.querySelector('.particular-client-new__street').value;
        streetNumberPar = document.querySelector('.particular-client-new__street-number').value;
        descriptionPar = document.querySelector('.particular-client-new__description').value;
        selectStatus = document.querySelector('.particular-client-new__select-status').value;
    }

    function zeroValues() {
        document.querySelector('.particular-client-new__id').value = '';
        document.querySelector('.particular-client-new__name').value = '';
        document.querySelector('.particular-client-new__owner').value = 'default';
        document.querySelector('.particular-client-new__phone').value = '';
        document.querySelector('.particular-client-new__email').value = '';
        document.querySelector('.particular-client-new__consumption').value = '';
        document.querySelector('.particular-client-new__category').value = 'country';
        document.querySelector('.particular-client-new__postal-code').value = '';
        document.querySelector('.particular-client-new__city').value = '';
        document.querySelector('.particular-client-new__street').value = '';
        document.querySelector('.particular-client-new__street-number').value = '';
        document.querySelector('.particular-client-new__description').value = '';
        document.querySelector('.particular-client-new__select-status').value = 'potencjalny';
    }

    addClientBtn.addEventListener('click', (e) => {
        e.preventDefault();
        getActualValues();
        checkingNipSpinner.style.display = 'block';
        let data = new URLSearchParams();
        data.append("id", idPar);
        data.append("name", namePar);
        data.append("owner", ownerPar);
        data.append("phone", phonePar);
        data.append("email", emailPar);
        data.append("consumption", consumptionPar);
        data.append("category", categoryPar);
        data.append("postalCode", postalCodePar);
        data.append("city", cityPar);
        data.append("street", streetPar);
        data.append("streetNumber", streetNumberPar);
        data.append("description", descriptionPar);
        data.append("status", selectStatus);

        fetch(`${window.location.href}/add-client/`, {
                method: 'post',
                body: data
            })
            .then(function (response) {
                return response.text();
            })
            .then(function (text) {
                checkingNipSpinner.style.display = 'none';
                const updateInfoContainer = document.querySelector('.particular-client-new__add-info');
                updateInfoContainer.innerHTML = text;
                updateInfoContainer.style.display = 'block';
                updateInfoContainer.style.color = '#319968';
                if (text == 'taki nip jest już w bazie') {
                    updateInfoContainer.style.color = 'red';
                    setTimeout(() => updateInfoContainer.style.display = 'none', 3000);
                    return
                }
                allClientsFromDB.push({
                    id: idPar,
                    name: namePar,
                    owner: ownerPar,
                    phone: phonePar,
                    email: emailPar,
                    consumption: consumptionPar,
                    category: categoryPar,
                    postalCode: postalCodePar,
                    city: cityPar,
                    street: streetPar,
                    streetNumber: streetNumberPar,
                    description: descriptionPar,
                    status: selectStatus
                });
                zeroValues();
                updatePage();
                jumpToPage(updatePage(), 'jump-to');
                numberOfClientsSpan.innerHTML = `${allClientsFromDB.length} klientów. Gratuluję wspólniku =)`;
                setTimeout(() => updateInfoContainer.style.display = 'none', 1500)

            })
            .catch(function (error) {
                console.log(error)
            });



    })




    // koniec dodanie klienta próba importu

    // obsługa dodawania zadania
    const myDatePicker = MCDatepicker.create({
        el: '#taskDate',
        customWeekDays: ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'],
        customMonths: [
            'Styczeń',
            'Luty',
            'Marzec',
            'Kwiecień',
            'Maj',
            'Czerwiec',
            'Lipiec',
            'Sierpień',
            'Wrzesień',
            'Październik',
            'Listopad',
            'Grudzień'
        ],
        dateFormat: 'YYYY-MM-DD',
    });

    let createTaskTitle, createTaskClientName, createTaskClientNip, createTaskDescription, createTaskPhone, createTaskDay, createTaskHour;

    const createTaskWindow = document.querySelector('.task-window');
    const createTaskBtnCreate = document.querySelector('.task-window__btn');
    const createTaskBtnClose = document.querySelector('.task-window__close');

    createTaskBtnClose.addEventListener('click', () => createTaskWindow.style.display = 'none');
    createTaskBtnCreate.addEventListener('click', (e) => {
        e.preventDefault();
        createTaskTitle = document.querySelector('#taskName').value;
        createTaskClientName = document.querySelector('#taskClientName').value;
        createTaskClientNip = document.querySelector('#taskNip').value;
        createTaskDescription = document.querySelector('#taskNip').value;
        createTaskPhone = document.querySelector('#taskTel').value;
        createTaskDay = document.querySelector('#taskDate').value;
        createTaskHour = document.querySelector('#taskTime').value;
        const dataForServerString = createTaskDay + ' ' + createTaskHour;


        let data = new URLSearchParams();

        data.append("title", document.querySelector('#taskName').value);
        data.append("clientName", document.querySelector('#taskClientName').value);
        data.append("clientNip", document.querySelector('#taskNip').value);
        data.append("description", document.querySelector('#taskNip').value);
        data.append("phone", document.querySelector('#taskTel').value);
        data.append("date", new Date(dataForServerString));

        fetch(`${window.location.href}/add-task/`, {
                method: 'post',
                body: data
            })
            .then(function (response) {
                return response.text();
            })
            .then(function (text) {
                const taskTitle = document.querySelector('.task-window__title');
                taskTitle.innerHTML = text;
                taskTitle.style.color = 'green';
                if (text === 'Zadanie dodane') {
                    const inputs = [...document.querySelectorAll('.task-window__input')];
                    inputs.forEach(input => input.value = '');
                }

                setTimeout(() => {
                    taskTitle.innerHTML = 'Nowe zadanie';
                    taskTitle.style.color = 'whitesmoke';
                }, 2000)

            })
            .catch(function (error) {
                console.log(error)
            });
    })

    //obsługa otwierania okna


    const btnOpenTaskWindowInClient = document.querySelector('.particular-client__btn-tasks');
    let nameForTask, idForTask, phoneForTask;


    btnOpenTaskWindowInClient.addEventListener('click', () => {

        createTaskWindow.style.display = 'flex';

        idForTask = document.querySelector('.particular-client__id').value;
        nameForTask = document.querySelector('.particular-client__name').value;
        phoneForTask = document.querySelector('.particular-client__phone').value;


        document.getElementById('taskNip').value = idForTask;
        document.getElementById('taskClientName').value = nameForTask;
        document.getElementById('taskTel').value = phoneForTask;


    })

    //koniec obsługa otwierania okna
    // koniec obsługa dodawania zadania
})()