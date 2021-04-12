(() => {
    const table = document.querySelector('.clients-table');
    const spinner = document.querySelector('.lds-roller');
    const clientsTable = document.querySelector('.clients-table tbody');
    const numberOfClientsSpan = document.querySelector('.wallet-summary span');
    const numberOfPagesContainer = document.querySelector('.number-of-pages');
    const actualPage = 1;
    const allClientsFromDB = [];



    const getClients = async (start, end) => {
        const clients = await fetch(`${window.location.href}/get-clients/`);
        const clientsArr = await clients.json();
        allClientsFromDB = clientsArr;
        clientsToShow = clientsArr.splice(start, end);
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
        numberOfPagesContainer.innerHTML = `Strona ${actualPage} z ${Math.floor((clientsArr.length) / 20) + 1}`
    }
    getClients(0, 20);

    function jumpToPage(page = actualPage, direction) {
        if (page < 1) return

        if (direction === 'next') {
            const from = actualPage * 10;
            const to = actualPage * 10 + 10;
            const clientsToShow = allClientsFromDB.splice(start, end);
        }
        if (direction === 'prev') {
            const from = actualPage * 10;
            const to = actualPage * 10 - 10;
        }
        if (direction === 'jump-to') {

        }
    }



})()