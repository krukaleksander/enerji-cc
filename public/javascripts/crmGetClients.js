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
                owner
            } = client;
            return clientsTable.innerHTML = clientsTable.innerHTML + `<tr><td>${id}</td><td>${name}</td><td>${phone}</td><td>${consumption}</td><td>${owner}</td></tr>`
        });
        spinner.style.display = 'none';
        table.style.display = 'block';
        numberOfClientsSpan.innerHTML = `${clientsArr.length} klientów. Gratuluję wspólniku =)`;
        updatePage();
    }
    getClients(0, 20);

    //funkcja do zmieniania strony

    function jumpToPage(page = actualPage, direction) {
        btnBackToList.style.display = 'none';
        document.querySelector('.doesnt-find-client').innerHTML = '';
        if (page === 1 && direction === 'prev') return
        if ((page === Math.floor((allClientsFromDB.length / 20)) + 1) && direction === 'next') return

        clientsTable.innerHTML = '<tr><th>NIP</th><th>Nazwa</th><th>Telefon</th><th>Zużycie [MWH]</th><th>Opiekun </th></tr>';

        function changingContent(from, to) {
            const clientsToShow = allClientsFromDB.slice(from, to);
            clientsToShow.forEach(client => {
                const {
                    id,
                    name,
                    phone,
                    consumption,
                    owner
                } = client;
                return clientsTable.innerHTML = clientsTable.innerHTML + `<tr><td>${id}</td><td>${name}</td><td>${phone}</td><td>${consumption}</td><td>${owner}</td></tr>`
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
        console.log(page);
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
            clientsTable.innerHTML = '<tr><th>NIP</th><th>Nazwa</th><th>Telefon</th><th>Zużycie [MWH]</th><th>Opiekun </th></tr>'
            document.querySelector('.doesnt-find-client').innerHTML = 'Nie znaleziono klienta';
        };
        if (clientToShow === undefined) return doesntFindFn();
        const {
            id,
            name,
            phone,
            consumption,
            owner
        } = clientToShow;
        clientsTable.innerHTML = '<tr><th>NIP</th><th>Nazwa</th><th>Telefon</th><th>Zużycie [MWH]</th><th>Opiekun </th></tr>';
        clientsTable.innerHTML = clientsTable.innerHTML + `<tr><td>${id}</td><td>${name}</td><td>${phone}</td><td>${consumption}</td><td>${owner}</td></tr>`;
        btnBackToList.style.display = 'block';
    });

    btnBackToList.addEventListener('click', () => {
        jumpToPage(actualPage, 'jump-to');
    });

    // koniec wyszukiwanie klientów


})()