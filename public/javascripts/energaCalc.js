const btnCalc = document.getElementById('btnCalc');
const summaryCalc = document.getElementById('summaryCalc');
const btnCopyCalc = document.getElementById('btnCopyCalc');
const divWhenOption2020 = document.querySelector('.when-option-2020');
const divWhenOption2019 = document.querySelector('.when-option-2019');
const option2021 = document.querySelector('.option-2021');
const option2020 = document.querySelector('.option-2020');
const option2019 = document.querySelector('.option-2019');
let countsPrice2021 = 0;
let countsPrice2020 = 0;
let tariff, endOfAgreement, priceNow, priceInTariff2022, priceInTariff2021, priceInTariff2020, wear, proposePrice, margeMass;


selectElement('tariff', 'C11');
selectElement('endOfAgreement', '2021');


function selectElement(id, valueToSelect) {
    let element = document.getElementById(id);
    element.value = valueToSelect;
}

removeNoteFn = () => {
    getActualValuesFn();
    console.log(summaryCalc.style.padding);
    let noteRemoversWhenFocus = [tariff, endOfAgreement, priceNow, priceInTariff2022, priceInTariff2021, priceInTariff2020, wear, proposePrice];
    noteRemoversWhenFocus.forEach(remover => {
        remover.addEventListener('focus', () => {
            summaryCalc.style.padding = "0px";
            summaryCalc.innerHTML = "";
        })
    });
}

replaceCommasAndParseFn = () => {
    priceInTariff2022.value = parseFloat(priceInTariff2022.value.replace(/\,/g, '.'));
    priceInTariff2021.value = parseFloat(priceInTariff2021.value.replace(/\,/g, '.'));
    priceInTariff2020.value = parseFloat(priceInTariff2020.value.replace(/\,/g, '.'));
    wear.value = parseFloat(wear.value.replace(/\,/g, '.'));
    priceNow.value = parseFloat(priceNow.value.replace(/\,/g, '.'));
    proposePrice.value = parseFloat(proposePrice.value.replace(/\,/g, '.'));
}

getActualValuesFn = () => {
    tariff = document.getElementById('tariff');
    endOfAgreement = document.getElementById('endOfAgreement');
    priceNow = document.getElementById('priceNow');
    priceInTariff2022 = document.getElementById('priceInTariff2022');
    priceInTariff2021 = document.getElementById('priceInTariff2021');
    priceInTariff2020 = document.getElementById('priceInTariff2020');
    wear = document.getElementById('wear');
    proposePrice = document.getElementById('proposePrice');
    switch (parseInt(endOfAgreement.value)) {
        case 2021:
            countsPrice2020 = 0;
            countsPrice2021 = 0;
            break;
        case 2020:
            countsPrice2020 = 0;
            countsPrice2021 = 1;
            break;
        case 2019:
            countsPrice2020 = 1;
            countsPrice2021 = 1;
            break;
        default:
            countsPrice2020 = 0;
            countsPrice2021 = 0;

    }

}

calcMargeMass = () => {
    margeMass = Math.floor(((proposePrice.value - priceInTariff2022.value) * wear.value) + ((proposePrice.value - priceInTariff2021.value) * wear.value * countsPrice2021) + ((proposePrice.value - priceInTariff2020.value) * wear.value * countsPrice2020));
}

calcFn = () => {
    getActualValuesFn();
    replaceCommasAndParseFn();
    if (priceNow.value > 0 && priceInTariff2022.value > 0 && wear.value > 0 && proposePrice.value > 0) {

        calcMargeMass();
        summaryCalc.style.padding = '10px';
        summaryCalc.innerHTML = `Grupa taryfowa: <span class ="value-of-calc-data">${tariff.value}</span>, Umowa kończy się: <span class ="value-of-calc-data">${endOfAgreement.value}</span>, Klient posiada aktualnie cenę: <span class="value-of-calc-data">${priceNow.value}</span>, Cena w cenniku dla taryfy <span class ="value-of-calc-data">${tariff.value}</span>: <span class ="value-of-calc-data">${priceInTariff2022.value}</span>, Zużycie roczne: <span class ="value-of-calc-data">${wear.value}</span> MWh. Propozycja cenowa: <span class ="value-of-calc-data">${proposePrice.value}</span>, Masa marży: ~ <span class ="value-of-calc-data marge-mass-span">${margeMass}</span>, Różnica w cenie: <span class ="value-of-calc-data client-income-span">${(proposePrice.value - priceNow.value).toFixed(2)}</span> `;
        const margeMassSpan = document.querySelector('.marge-mass-span');
        const clientIncomeSpan = document.querySelector('.client-income-span');
        if (margeMass < 300) {
            margeMassSpan.style.color = "red";
        }
        if ((proposePrice.value - priceNow.value) < 0) {
            clientIncomeSpan.style.color = 'green';
        } else {
            clientIncomeSpan.style.color = 'red';
        }
    } else {
        return;
    }
}


removeNoteFn();

btnCalc.addEventListener('click', calcFn);
endOfAgreement.addEventListener('change', () => {
    const optionDivs = [divWhenOption2019, divWhenOption2020];
    if (endOfAgreement.value === "2021") {
        optionDivs.forEach(div => {
            div.style.display = "none";
        });
    } else if (endOfAgreement.value === "2020") {
        divWhenOption2019.style.display = "none";
        divWhenOption2020.style.display = "block";
    } else if (endOfAgreement.value === "2019") {
        optionDivs.forEach(div => {
            div.style.display = "block";
        })
    }
})