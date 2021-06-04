let allClientsFromDB = [];
let filteredClients = [];
(() => {
    const table = document.querySelector('.clients-table');
    const spinner = document.querySelector('.lds-roller');
    const clientsTable = document.querySelector('.clients-table tbody');
    const numberOfClientsSpan = document.querySelector('.wallet-summary span');
    const numberOfPagesContainer = document.querySelector('.number-of-pages');
    const btnBackToList = document.querySelector('.back-to-all__btn');
    let actualPage = 1;
    let pageForSummary = 1;

    function refreshNotes(clientId, notesContainer) {
        notesContainer.innerHTML = '';
        const client = allClientsFromDB.filter(client => client._id === clientId);
        const tasks = client[0].tasks;
        let taskReverse = tasks.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });



        taskReverse.forEach(note => {
            const {
                title,
                date
            } = note;


            notesContainer.innerHTML = notesContainer.innerHTML + `<div data-id='${date}' class='note-row'>${date.slice(0,21)}  ${title}</div>`
        })
        if (tasks.length > 0) {
            const allNotesInClient = document.querySelectorAll('.note-row');

            allNotesInClient.forEach(note => {
                note.addEventListener('click', (e) => {
                    const noteId = e.target.getAttribute("data-id");
                    const noteToShow = taskReverse.filter(note => note.date === noteId);

                    const {
                        date,
                        title,
                        description
                    } = noteToShow[0];
                    document.querySelector('.note').style.display = 'flex';
                    document.querySelector('.note__created').innerText = `${date.slice(0, 21)}`;
                    document.querySelector('.note__created').setAttribute('data-id', date);
                    document.querySelector('.note__title').value = title;
                    document.querySelector('.note__description').value = description;



                })
            })
        }
    }

    function updatePage() {
        numberOfPagesContainer.innerHTML = `Strona ${pageForSummary} z ${Math.floor((allClientsFromDB.length - 1) / 20) + 1}`;
        return Math.floor((allClientsFromDB.length - 1) / 20) + 1
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
                _id,
                id,
                name,
                phone,
                consumption,
                owner,
                status
            } = client;
            return clientsTable.innerHTML = clientsTable.innerHTML + `<tr><td data-id=${_id}>${id}</td><td>${shortenName(name)}</td><td>${phone}</td><td>${consumption}</td><td>${status}</td><td>${owner}</td></tr>`
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
        if ((page === Math.floor(((allClientsFromDB.length - 1) / 20)) + 1) && direction === 'next') return

        clientsTable.innerHTML = '<tr><th>NIP</th><th>Nazwa</th><th>Telefon</th><th>Zużycie [MWH]</th><th>Status</th><th>Opiekun </th></tr>';

        function changingContent(from, to) {
            const clientsToShow = allClientsFromDB.slice(from, to);
            clientsToShow.forEach(client => {
                const {
                    _id,
                    id,
                    name,
                    phone,
                    consumption,
                    owner,
                    status
                } = client;
                return clientsTable.innerHTML = clientsTable.innerHTML + `<tr><td data-id=${_id}>${id}</td><td>${shortenName(name)}</td><td>${phone}</td><td>${consumption}</td><td>${status}</td><td>${owner}</td></tr>`;

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



    //funkcja do howania wyszukiwania klientów
    function hideSearchBar() {
        const loadDivStyles = 'font-size: 20px;padding: 10px;color: floralwhite;   cursor: pointer;border: 3px solid purple;margin-bottom: 2px;'
        const searchDiv = document.querySelector('.search');
        const loadDiv = document.createElement('div');
        loadDiv.style = loadDivStyles;
        loadDiv.innerText = 'Wróć do klientów';
        searchDiv.innerHTML = '';
        searchDiv.appendChild(loadDiv);
        loadDiv.addEventListener('click', () => location.reload())
    }

    //koniec funkcja do howania wyszukiwania klientów




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
        searchOption = document.querySelector('.search__select-option').value;
        searchInputValue = document.querySelector('.searchTerm').value;

        let filteredClients = [];

        if (searchOption === 'name') {
            const re = RegExp(`${searchInputValue}`, 'gmi');
            filteredClients = allClientsFromDB.filter(value => re.test(value.name));
            allClientsFromDB = filteredClients;
            console.log(allClientsFromDB);
            jumpToPage(1, 'jump-to');

        }
        if (searchOption === 'nip') {
            const re = RegExp(`${searchInputValue}`, 'gmi');
            filteredClients = allClientsFromDB.filter(value => re.test(value.id));
            allClientsFromDB = filteredClients;
            jumpToPage(1, 'jump-to');
        }
        if (searchOption === 'tel') {
            const re = RegExp(`${searchInputValue}`, 'gmi');
            filteredClients = allClientsFromDB.filter(value => re.test(value.phone));
            allClientsFromDB = filteredClients;
            console.log(allClientsFromDB);
            jumpToPage(1, 'jump-to');
        }

        document.querySelector('.searchTerm').value = '';
        btnBackToList.style.display = 'block';
        const doesntFindFn = () => {
            clientsTable.innerHTML = '<tr><th>NIP</th><th>Nazwa</th><th>Telefon</th><th>Zużycie [MWH]</th><th>Status </th><th>Opiekun </th></tr>'
            document.querySelector('.doesnt-find-client').innerHTML = 'Nie znaleziono klienta';
        };
        if (allClientsFromDB.length < 1 || allClientsFromDB[0] === undefined) {
            doesntFindFn()
            hideSearchBar()

        };
        clientsTable.innerHTML = '<tr><th>NIP</th><th>Nazwa</th><th>Telefon</th><th>Zużycie [MWH]</th><th>Status </th><th>Opiekun </th></tr>';
        allClientsFromDB.forEach((client, index) => {
            if (index > 19) return;
            const {
                _id,
                id,
                name,
                phone,
                consumption,
                owner,
                status
            } = client;
            clientsTable.innerHTML = clientsTable.innerHTML + `<tr><td data-id=${_id}>${id}</td><td>${shortenName(name)}</td><td>${phone}</td><td>${consumption}</td><td>${status}</td><td>${owner}</td></tr>`;
            btnBackToList.style.display = 'block';
        })

        setOpenClients();
        hideSearchBar();


    });

    btnBackToList.addEventListener('click', () => {
        location.reload();
    });

    // koniec wyszukiwanie klientów


    // otwieranie poszczególnych klientów
    const particularClientContainer = document.querySelector('.particular-client');
    let notesContainer = document.querySelector('.notes__container');


    function setOpenClients() {
        const nipy = [...document.querySelectorAll('.clients-table tr td:nth-child(1)')];
        nipy.forEach(nip => nip.addEventListener('click', (e) => {
            notesContainer.innerHTML = '';
            particularClientContainer.style.display = 'flex';
            const clientToShow = allClientsFromDB.find(client => client._id == e.target.getAttribute('data-id'));
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
                tasks,
                description,
                status,
                www
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
            const wwwPar = document.querySelector('.particular-client__www');
            const selectStatus = document.querySelector('.particular-client__select-status');

            idPar.value = id;
            idPar.setAttribute('data_id', _id);
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
            wwwPar.value = www;

            // wyświetlanie notatek



            let taskReverse = tasks.sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            });

            taskReverse.forEach(note => {
                const {
                    title,
                    date
                } = note;


                notesContainer.innerHTML = notesContainer.innerHTML + `<div data-id='${date}' class='note-row'>${date.slice(0,21)}  ${title}</div>`
            })
            if (tasks.length > 0) {
                const allNotesInClient = document.querySelectorAll('.note-row');

                allNotesInClient.forEach(note => {
                    note.addEventListener('click', (e) => {
                        const noteId = e.target.getAttribute("data-id");
                        const noteToShow = taskReverse.filter(note => note.date === noteId);

                        const {
                            date,
                            title,
                            description
                        } = noteToShow[0];
                        document.querySelector('.note').style.display = 'flex';
                        document.querySelector('.note__created').innerText = `${date.slice(0, 21)}`;
                        document.querySelector('.note__created').setAttribute('data-id', date);
                        document.querySelector('.note__title').value = title;
                        document.querySelector('.note__description').value = description;



                    })
                })
            }
            // koniec wyświetlanie notatek

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
        data.append("_id", document.querySelector('.particular-client__id').getAttribute('data_id'));
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
        data.append("www", document.querySelector('.particular-client__www').value);
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
        const www = document.querySelector('.particular-client__www').value;
        const status = document.querySelector('.particular-client__select-status').value;
        const mongoId = document.querySelector('.particular-client__id').getAttribute("data_id");
        allClientsFromDB = allClientsFromDB.map(client => {
            if (client._id === mongoId) {

                return {
                    _id: mongoId,
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
                    www: www
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

    let idPar, namePar, ownerPar, phonePar, emailPar, consumptionPar, categoryPar, postalCodePar, cityPar, streetPar, streetNumberPar, descriptionPar, wwwPar, selectStatus;

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
        wwwPar = document.querySelector('.particular-client-new__www').value;
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
        document.querySelector('.particular-client-new__www').value = '';
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
        data.append("www", wwwPar);
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
                window.location.reload(true);

                //stara logika po dodaniu klienta
                // allClientsFromDB.push({
                //     id: idPar,
                //     name: namePar,
                //     owner: ownerPar,
                //     phone: phonePar,
                //     email: emailPar,
                //     consumption: consumptionPar,
                //     category: categoryPar,
                //     postalCode: postalCodePar,
                //     city: cityPar,
                //     street: streetPar,
                //     streetNumber: streetNumberPar,
                //     description: descriptionPar,
                //     status: selectStatus
                // });
                // zeroValues();
                // updatePage();
                // jumpToPage(updatePage(), 'jump-to');
                // numberOfClientsSpan.innerHTML = `${allClientsFromDB.length} klientów. Gratuluję wspólniku =)`;
                // setTimeout(() => updateInfoContainer.style.display = 'none', 1500)
                // koniec stara logika po dodaniu klienta
            })
            .catch(function (error) {
                console.log(error)
            });



    })




    // koniec dodanie klienta próba importu

    // obsługa dodawania zadania

    Date.prototype.addHours = function (h) {
        this.setHours(this.getHours() + h);
        return this;
    }

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
        createTaskDescription = document.querySelector('#taskDescription').value;
        createTaskPhone = document.querySelector('#taskTel').value;
        createTaskDay = document.querySelector('#taskDate').value;
        createTaskHour = document.querySelector('#taskTime').value;
        const dataForServerString = createTaskDay + ' ' + createTaskHour;


        let data = new URLSearchParams();

        data.append("title", document.querySelector('#taskName').value);
        data.append("clientName", document.querySelector('#taskClientName').value);
        data.append("clientNip", document.querySelector('#taskNip').value);
        data.append("description", document.querySelector('#taskDescription').value);
        data.append("phone", document.querySelector('#taskTel').value);
        data.append("date", new Date(dataForServerString).addHours(2));
        data.append("clientId", document.getElementById('taskNip').getAttribute('data-id'));

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
                    taskListContainer.style.bottom = '-100vh';
                    taskListDiv.innerHTML = '';
                    const inputs = [...document.querySelectorAll('.task-window .task-window__input')];
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
    const btnOpenTaskWindowInTaskList = document.querySelector('.sun-button');
    const btnHideTaskList = document.querySelector('.task-list__hide');
    const btnShowTaskList = document.querySelector('.add-task-icon__icon');
    const taskListContainer = document.querySelector('.task-list');
    let nameForTask, idForTask, phoneForTask;


    btnOpenTaskWindowInClient.addEventListener('click', () => {

        createTaskWindow.style.display = 'flex';

        idForTask = document.querySelector('.particular-client__id').value;
        const idInDb = document.querySelector('.particular-client__id').getAttribute('data_id');
        nameForTask = document.querySelector('.particular-client__name').value;
        phoneForTask = document.querySelector('.particular-client__phone').value;


        document.getElementById('taskNip').value = idForTask;
        document.getElementById('taskNip').setAttribute('data-id', idInDb);
        document.getElementById('taskClientName').value = nameForTask;
        document.getElementById('taskTel').value = phoneForTask;


    })

    btnOpenTaskWindowInTaskList.addEventListener('click', () => {
        document.getElementById('taskNip').setAttribute('data-id', 'none');
        const inputs = [...document.querySelectorAll('.task-window .task-window__input')];
        inputs.forEach(input => input.value = '');
        createTaskWindow.style.display = 'flex'
    });

    //pobieranie zadań z serwera
    const theTaskContainer = document.querySelector('.the-task-container');
    let taskList = [];

    function searchAndDisplayTask(id, date) {
        const theTaskArray = taskList.filter(task => task._id === id);
        const theTask = theTaskArray[0];
        const {
            title,
            clientName,
            clientNip,
            description,
            phone,
        } = theTask;
        document.getElementById('theTaskName').value = title;
        document.getElementById('theTaskClientName').value = clientName;
        document.getElementById('theTaskNip').value = clientNip;
        document.getElementById('theTaskDescription').value = description;
        document.getElementById('theTaskTel').value = phone;
        document.getElementById('theTaskTitle').innerHTML = `Zaplanowane na ${date}`;
    };

    function handleDeleteTask(id) {
        const deleteBtn = document.querySelector('.the-task-container__btn');
        deleteBtn.addEventListener('click', async () => {
            const deleteTask = await fetch(`${window.location.href}/delete-task/${id}`);
            const respText = await deleteTask.text();
            taskListContainer.style.bottom = '-100vh';
            document.getElementById('theTaskName').value = '';
            document.getElementById('theTaskClientName').value = '';
            document.getElementById('theTaskNip').value = '';
            document.getElementById('theTaskDescription').value = '';
            document.getElementById('theTaskTel').value = '';
            document.getElementById('theTaskTitle').innerHTML = respText;
        })
    }
    const taskListDiv = document.querySelector('.task-list__list');
    btnShowTaskList.addEventListener('click', async () => {
        if (taskListContainer.style.bottom === '0px') return;
        taskListDiv.innerHTML = '';
        taskListContainer.style.bottom = '0px';
        const tasksFromServer = await fetch(`${window.location.href}/get-tasks/`);
        taskList = sortByDate(await tasksFromServer.json());
        document.querySelector('.lds-ellipsis').style.display = 'none';


        if (taskList.length < 1) return;
        taskList.forEach(task => {
            const {
                _id,
                clientName,
                date,
                title,
                phone,
                description,
                clientNip,
                clientId
            } = task;

            function fixDateNumber(number) {
                if (number.toString().length < 2) return `0${number}`
                return number
            };
            const dateToFix = new Date(date);
            const actualDate = new Date();
            const year = fixDateNumber(dateToFix.getFullYear());
            const day = fixDateNumber(dateToFix.getDate());
            const month = fixDateNumber(dateToFix.getMonth() + 1);
            const hours = fixDateNumber(dateToFix.getUTCHours());
            const minutes = fixDateNumber(dateToFix.getUTCMinutes());
            taskListDiv.innerHTML = taskListDiv.innerHTML + `
            <div class='particular-task'><i class="fas fa-user-tie particular-task__track-client" data-id=${clientId}></i>` + `
            <div class='particular-task__open'><i class="fas fa-folder-open" data-id='${_id}' data-date='${hours}:${minutes} ${day}.${month}.${year}'></i></div>
            <div class='particular-task__date'>${hours}:${minutes} ${day}.${month}.${year}</div>
            <div class='particular-task__title ${dateToFix.getTime() > actualDate.getTime() ? '' : 'particular-task__title-red'}'>${shortenName(title)}</div>
            <div class='particular-task__client-name'>${shortenName(clientName)}</div>
            </div>
            `;
            // wchodzenie w zadanie

            const openTaskBtns = [...document.querySelectorAll('.particular-task__open')];
            console.log(openTaskBtns);


            openTaskBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    theTaskContainer.style.display = 'flex';
                    // poniżej pobieramy id
                    const taskId = e.target.getAttribute("data-id");
                    const taskDate = e.target.getAttribute("data-date");
                    searchAndDisplayTask(taskId, taskDate);
                    handleDeleteTask(taskId);
                });

            });

            //koniec wchodzenie w zadanie

            // przejście z zadania do klienta


            const openClientFromTaskListBtns = [...document.querySelectorAll('.particular-task__track-client')];
            console.log(openClientFromTaskListBtns);

            openClientFromTaskListBtns.forEach(btn => btn.addEventListener('click', (e) => {
                console.log('klikam');
                if (e.target.getAttribute('data-id') === 'none') return
                taskListContainer.style.bottom = '-100vh';
                document.querySelector('.lds-ellipsis').style.display = 'block';
                particularClientContainer.style.display = 'flex';
                const clientToShow = allClientsFromDB.find(client => client._id == e.target.getAttribute('data-id'));
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
                    tasks,
                    description,
                    status,
                    www
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
                const wwwPar = document.querySelector('.particular-client__www');
                const selectStatus = document.querySelector('.particular-client__select-status');

                idPar.value = id;
                idPar.setAttribute('data_id', _id);
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
                wwwPar.value = www;
                if (description.length > 0) return descriptionPar.value = description;
                descriptionPar.value = 'Opis...';
            }));

            // koniecprzejście z zadania do klienta

        });


    });



    // zamykanie kontenera z zadaniem
    const closeTeTaskContainer = document.querySelector('.the-task-container__close');
    closeTeTaskContainer.addEventListener('click', () => {
        theTaskContainer.style.display = 'none'
    });


    // koniec zamykanie kontenera z zadaniem

    function sortByDate(array) {
        const arrayToReturn = array.sort(function (a, b) {
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return new Date(a.date) - new Date(b.date);
        });
        return arrayToReturn;
    }
    // koniec pobieranie zadań z serera
    //koniec obsługa otwierania okna
    btnHideTaskList.addEventListener('click', () => {
        taskListDiv.innerHTML = '';
        taskListContainer.style.bottom = '-100vh';
        document.querySelector('.lds-ellipsis').style.display = 'block';

    });




    // koniec obsługa dodawania zadania

    //fragment socket io
    let nameFoSocket = '';


    const socket = io({
        transports: ['websocket'],
        upgrade: false
    });
    const logOuTBtn = document.querySelector('.logout-energy-btn');
    logOuTBtn.addEventListener('click', () => {
        socket.emit('user-disconnected', nameFoSocket);
    })

    // const socket = io();

    const newUserConnected = (name) => {
        nameFoSocket = name;
        socket.emit("new-user", name);
    };


    socket.on('user-logged', login => {
        newUserConnected(login);
    })

    socket.on('sent-who-is-logged', (list) => {
        console.log(list);
    })


    //koniec fragment socket io

    //start usuwanie klienta

    const removeClientShowWindowBtn = document.querySelector('.particular-client__btn-delete');
    const confirmRemoveClientWindow = document.querySelector('.confirm-remove');
    const notConfirmRemoveBtn = document.querySelector('.confirm-remove__not-confirm');
    const confirmRemoveBtn = document.querySelector('.confirm-remove__confirm');

    removeClientShowWindowBtn.addEventListener('click', () => confirmRemoveClientWindow.style.display = 'block');
    notConfirmRemoveBtn.addEventListener('click', () => confirmRemoveClientWindow.style.display = 'none');


    confirmRemoveBtn.addEventListener('click', async () => {
        const clientId = document.querySelector('.particular-client__id').getAttribute('data_id');
        const deleteClient = await fetch(`${window.location.href}/delete-client/${clientId}`);
        const respText = await deleteClient.text();
        particularClientContainer.style.display = 'none';
        confirmRemoveClientWindow.style.display = 'none';
        alert(respText);
        const clientsToShowAfterDelete = allClientsFromDB.filter(client => client._id != clientId);
        allClientsFromDB = clientsToShowAfterDelete;
        jumpToPage(actualPage, 'jump-to');
    })

    // koniec usuwanie klienta

    //filtrowanie klienta

    let categoryFilter, statusFilter, cityFilter;
    const filterBtn = document.querySelector('.filter-div__btn');
    const removeFiltersBtn = document.getElementById('removeFilters');

    filterBtn.addEventListener('click', () => {
        let temporaryFiltredClients = [];
        removeFiltersBtn.style.display = 'inline-block';
        filterBtn.style.display = 'none';
        categoryFilter = document.getElementById('category').value;
        statusFilter = document.getElementById('filterStatus').value;
        cityFilter = document.getElementById('filterCity').value;

        // if (categoryFilter !== 'nie wybrano') temporaryFiltredClients = allClientsFromDB.filter(client => client.category === filterOption);
        function filteringCategory(base, condition) {
            if (condition === 'nie wybrano' || condition.length < 1) return base
            return base.filter(client => client.category === condition);
        };

        function filteringStatus(base, condition) {
            if (condition === 'nie wybrano' || condition.length < 1) return base
            return base.filter(client => client.status === condition);
        };

        function filteringCity(base, condition) {
            if (condition === 'nie wybrano' || condition.length < 1) return base
            return base.filter(client => client.city === condition);
        };

        allClientsFromDB = filteringCity((filteringStatus(filteringCategory(allClientsFromDB, categoryFilter), statusFilter)), cityFilter);



        // allClientsFromDB = filteredClients;
        jumpToPage(1, 'jump-to');
    })
    removeFiltersBtn.addEventListener('click', () => {
        location.reload();
    })


    // koniec filtrowanie klienta


    // notatki

    const allNotesContainer = document.querySelector('.notes');
    const createNoteContainer = document.querySelector('.create-note');
    const particularNoteContainer = document.querySelector('.note');


    const openNotesContainerBtn = document.querySelector('.particular-client__btn-notes');
    const openCreateNoteContainerBtn = document.querySelector('.notes__create-note');


    const closeCreateNoteContainerBtn = document.querySelector('.create-note__close');
    const closeNotesContainerBtn = document.querySelector('.notes__close');
    const closeparticularNoteContainerBtn = document.querySelector('.note__close');

    const createNoteBtn = document.querySelector('.note__button--create');

    openNotesContainerBtn.addEventListener('click', () => {
        allNotesContainer.style.display = 'flex';
    });

    openCreateNoteContainerBtn.addEventListener('click', () => {
        createNoteContainer.style.display = 'flex';
    });

    closeNotesContainerBtn.addEventListener('click', () => {
        allNotesContainer.style.display = 'none';
        createNoteContainer.style.display = 'none';
        particularNoteContainer.style.display = 'none';
    });

    closeCreateNoteContainerBtn.addEventListener('click', () => {
        createNoteContainer.style.display = 'none';
    });

    closeparticularNoteContainerBtn.addEventListener('click', () => {
        particularNoteContainer.style.display = 'none';
    });

    createNoteBtn.addEventListener('click', async () => {
        const title = document.querySelector('.create-note__title');
        const description = document.querySelector('.create-note__description');
        const clientId = document.querySelector('.particular-client__id').getAttribute('data_id');
        const date = new Date().addHours(0);

        let data = new URLSearchParams();
        data.append("_id", clientId);
        data.append("title", title.value);
        data.append("description", description.value);
        data.append("date", date);


        fetch(`${window.location.href}/add-note/`, {
                method: 'post',
                body: data
            })
            .then(function (response) {
                return response.text();
            })
            .then(function (text) {
                const addInfoContainer = document.querySelector('.create-note__info');
                addInfoContainer.innerHTML = text;
                addInfoContainer.style.display = 'block';
                setTimeout(() => addInfoContainer.style.display = 'none', 1500)
            })
            .then(() => {
                const newClientsFromDb = allClientsFromDB.map(client => {
                    if (client._id == clientId) {
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
                            tasks,
                            description,
                            status,
                            www
                        } = client;


                        const tasksNow = tasks;
                        const newTasks = tasksNow.concat([{
                            title: title.value,
                            description: document.querySelector('.create-note__description').value,
                            date: date.toString(),
                        }]);
                        const newClient = {
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
                            tasks: newTasks,
                            description,
                            status,
                            www
                        };
                        return newClient;

                    } else {
                        return client
                    }
                });
                allClientsFromDB = newClientsFromDb;
                title.value = '';
                description.value = '';

            })
            .then(() => {

                refreshNotes(clientId, notesContainer);
            })

            .catch(function (error) {
                console.log(error)
            });

    })




    //edycja notatki


    const editNoteBtn = document.querySelector('.note__button--edit');

    editNoteBtn.addEventListener('click', () => {
        const clientId = document.querySelector('.particular-client__id').getAttribute('data_id');
        let tasksNow;
        const newClientsFromDb = allClientsFromDB.map(client => {
            if (client._id == clientId) {
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
                    tasks,
                    description,
                    status,
                    www
                } = client;


                tasksNow = tasks;
                const taskId = document.querySelector('.note__created').getAttribute('data-id');
                tasksNow = tasksNow.map(task => {
                    if (task.date === taskId) {
                        return {
                            title: document.querySelector('.note__title').value,
                            description: document.querySelector('.note__description').value,
                            date: task.date
                        }
                    } else {
                        return task
                    }
                });

                const newClient = {
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
                    tasks: tasksNow,
                    description,
                    status,
                    www
                };
                return newClient;

            } else {
                return client
            }
        });
        allClientsFromDB = newClientsFromDb;

        //tutaj bierzemy się za odświeżenie listy notatek o tą zaktualizaowaną.
        refreshNotes(clientId, notesContainer);





        let data = new URLSearchParams();
        data.append("_id", clientId);
        data.append("tasks", JSON.stringify(tasksNow));
        console.log(tasksNow);

        fetch(`${window.location.href}/edit-note/`, {
                method: 'post',
                body: data
            })
            .then(function (response) {
                return response.text();
            })
            .then(function (text) {
                const addInfoContainer = document.querySelector('.note__info');
                addInfoContainer.innerHTML = text;
                addInfoContainer.style.display = 'block';
                setTimeout(() => addInfoContainer.style.display = 'none', 1500)
            })
            .catch(function (error) {
                console.log(error)
            });








    })





    //koniec edycja notatki




    // koniec notatki

})()