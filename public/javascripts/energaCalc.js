const btnCalc = document.getElementById('btnCalc');
const summaryCalc = document.getElementById('summaryCalc');
const alertEndOfAgreement = document.getElementById('alertEndOfAgreement');
const alertPriceNow = document.getElementById('alertPriceNow');
const alertPriceInTariff = document.getElementById('alertPriceInTariff');
const alertWear = document.getElementById('alertWear');
const alertProposePrice = document.getElementById('alertProposePrice');
const btnCopyCalc = document.getElementById('btnCopyCalc');

let wearFactor = 1;
let tariff, endOfAgreement, priceNow, priceInTariff, wear, proposePrice, margeMass;

replaceCommasAndParseFn = () => {
    priceInTariff.value = parseFloat(priceInTariff.value.replace(/\,/g, '.'));
    wear.value = parseFloat(wear.value.replace(/\,/g, '.'));
    priceNow.value = parseFloat(priceNow.value.replace(/\,/g, '.'));
    proposePrice.value = parseFloat(proposePrice.value.replace(/\,/g, '.'));
}
verifyValuesFn = () => {
    if (parseInt(endOfAgreement.value) > 2022 || parseInt(endOfAgreement.value) < 2019) {
        alertEndOfAgreement.innerText = "napewno taka data jest w pliku?"
    }
}

getActualValuesFn = () => {
    tariff = document.getElementById('tariff');
    endOfAgreement = document.getElementById('endOfAgreement');
    priceNow = document.getElementById('priceNow');
    priceInTariff = document.getElementById('priceInTariff');
    wear = document.getElementById('wear');
    proposePrice = document.getElementById('proposePrice');
    switch (parseInt(endOfAgreement.value)) {
        case 2021:
            wearFactor = 1;
            break;
        case 2020:
            wearFactor = 2;
            break;
        case 2019:
            wearFactor = 2.5;
            break;
        default:
            wearFactor = 1;

    }

}

calcMargeMass = () => {
    margeMass = Math.floor((proposePrice.value - priceInTariff.value) * wear.value * wearFactor);
}

calcFn = () => {
    getActualValuesFn();
    replaceCommasAndParseFn();
    verifyValuesFn();
    calcMargeMass();
    summaryCalc.innerHTML = `Grupa taryfowa: <span class ="value-of-calc-data">${tariff.value}</span>, Umowa kończy się: <span class ="value-of-calc-data">${endOfAgreement.value}</span>, Klient posiada aktualnie cenę <span class="value-of-calc-data">${priceNow.value}</span>, Cena w cenniku dla taryfy <span class ="value-of-calc-data">${tariff.value}</span>: <span class ="value-of-calc-data">${priceInTariff.value}</span>, Zużycie roczne: <span class ="value-of-calc-data">${wear.value}</span> MWh. Propozycja cenowa: <span class ="value-of-calc-data">${proposePrice.value}</span>, Mnożnik marży <span class ="value-of-calc-data">${wearFactor}</span>, Masa marży: ~ <span class ="value-of-calc-data marge-mass-span">${margeMass}</span> `
}



btnCalc.addEventListener('click', calcFn);