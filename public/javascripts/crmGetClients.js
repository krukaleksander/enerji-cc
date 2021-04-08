(() => {
    const table = document.querySelector('.clients-table');
    const spinner = document.querySelector('.lds-roller');
    const clientsTable = document.querySelector('.clients-table tbody');
    const numberOfClientsSpan = document.querySelector('.wallet-summary span');
    const getClients = async (start, end) => {
        const clients = await fetch(`${window.location.href}/get-clients/`);
        const clientsArr = await clients.json();
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
    }
    getClients(0, 20);

})()