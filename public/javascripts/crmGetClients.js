(() => {
    const table = document.querySelector('.clients-table');
    const spinner = document.querySelector('.lds-roller');
    const clientsTable = document.querySelector('.clients-table tbody');
    const numberOfClientsSpan = document.querySelector('.wallet-summary span');
    const numberOfPagesContainer = document.querySelector('.number-of-pages');
    const btnBackToList = document.querySelector('.back-to-all__btn');
    let actualPage = 1;
    let pageForSummary = 1;
    let allClientsFromDB = [];

    function updatePage() {
        numberOfPagesContainer.innerHTML = `Strona ${pageForSummary} z ${Math.floor((allClientsFromDB.length) / 20) + 1}`;
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
    let searchInputValue;
    const searchButton = document.querySelector('.searchButton');

    searchButton.addEventListener('click', () => {
        searchInputValue = document.querySelector('.searchTerm').value;
        const clientToShow = allClientsFromDB.find(client => client.id == searchInputValue);
        document.querySelector('.searchTerm').value = '';
        btnBackToList.style.display = 'block';
        const doesntFindFn = () => {
            clientsTable.innerHTML = '<tr><th>NIP</th><th>Nazwa</th><th>Telefon</th><th>Zużycie [MWH]</th><th>Status </th><th>Opiekun </th></tr>'
            document.querySelector('.doesnt-find-client').innerHTML = 'Nie znaleziono klienta';
        };
        if (clientToShow === undefined) return doesntFindFn();
        const {
            id,
            name,
            phone,
            consumption,
            owner,
            status
        } = clientToShow;
        clientsTable.innerHTML = '<tr><th>NIP</th><th>Nazwa</th><th>Telefon</th><th>Zużycie [MWH]</th><th>Status </th><th>Opiekun </th></tr>';
        clientsTable.innerHTML = clientsTable.innerHTML + `<tr><td>${id}</td><td>${shortenName(name)}</td><td>${phone}</td><td>${consumption}</td><td>${status}</td><td>${owner}</td></tr>`;
        btnBackToList.style.display = 'block';
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

    })

    //koniec fragment edycja klienta
    // koniec otwieranie poszczególnych klientów

})()