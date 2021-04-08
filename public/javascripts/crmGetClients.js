(() => {
    const clientsTable = document.querySelector('.clients-table tbody');
    const getClients = async () => {
        const clients = await fetch(`${window.location.href}/get-clients/`);
        const clientsArr = await clients.json();
        console.log(clientsArr);
        clientsArr.forEach(client => {
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
    getClients();

})()