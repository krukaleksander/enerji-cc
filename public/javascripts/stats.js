const allCases = [...document.querySelectorAll('span.case-name')];
const allAmmounts = [...document.querySelectorAll('span.case-ammount')];
let allbase = {};
let tableOfDataNumbers = [];
let flagForInsertAmmounts = 0;

const createTableOfNumbers = (data) => {
    data.forEach(record => {
        tableOfDataNumbers.push(record.ammount);
    })
}
const insertNumbersToTable = () => {
    allAmmounts.forEach(ammount => {
        ammount.textContent = tableOfDataNumbers[flagForInsertAmmounts];
        flagForInsertAmmounts++
        if (flagForInsertAmmounts > tableOfDataNumbers.length - 1) {
            flagForInsertAmmounts = 0;
        }
    })
}
allCases.forEach(name => {
    name.addEventListener('mouseover', (e) => {
        const nameClass = e.toElement.classList[1];
        const descriptionToShow = document.querySelector(`[data-show=${nameClass}]`);
        descriptionToShow.style.display = "block";
    })
    name.addEventListener('mouseout', () => {
        const descriptionsToHide = [...document.querySelectorAll("[data-show]")];
        descriptionsToHide.forEach(description => {
            description.style.display = "none";
        })
    })
})

const fetchAll = () => {
    fetch(`${document.URL}/show`)
        .then(response => response.json())
        .then(response => {
            console.log(response)
            createTableOfNumbers(response);
            insertNumbersToTable();
            // allbase = response;
            console.log(tableOfDataNumbers)
            tableOfDataNumbers = [];
        })
}
const fetchDataPlus = () => {
    fetch(`${document.URL}/addone/6/2`)
        .then(response => response.json())
        .then(response => {
            console.log(response)
        })
    fetchAll()
}
const fetchDataMinus = () => {
    fetch(`${document.URL}/removeone/6/1`)
        .then(response => response.json())
        .then(response => {
            console.log(response)
        })
    fetchAll()
}
// show ma złe dane! to w nim trzeba poprawić sprawę!