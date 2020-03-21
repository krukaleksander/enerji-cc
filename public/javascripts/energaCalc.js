const btnCalc = document.getElementById('btnCalc');
const summaryCalc = document.getElementById('summaryCalc');
const alertEndOfAgreement = document.getElementById('alertEndOfAgreement');
const alertPriceNow = document.getElementById('alertPriceNow');
const alertPriceInTariff = document.getElementById('alertPriceInTariff');
const alertWear = document.getElementById('alertWear');
const alertProposePrice = document.getElementById('alertProposePrice');

let wearFactor = 1;
let tariff, endOfAgreement, priceNow, priceInTariff, wear, proposePrice, margeMass;

replaceCommasAndParseFn = () => {
    priceInTariff = parseFloat(priceInTariff.replace(/\,/g, '.'));
    wear = parseFloat(wear.replace(/\,/g, '.'));
    priceNow = parseFloat(priceNow.replace(/\,/g, '.'));
    proposePrice = parseFloat(proposePrice.replace(/\,/g, '.'));
}
verifyValuesFn = () => {
    if (typeof endOfAgreement != "number") {
        alertEndOfAgreement.innerText = "podaj datę w cyfrach..."
    } else if (endOfAgreement > 2022 || endOfAgreement < 2019) {
        alertEndOfAgreement.innerText = "napewno taka data jest w pliku?"
    }
    if (typeof priceNow != "number") {
        alertPriceNow.innerText = "cyfrę jeśli łaska.."
    }
    if (typeof priceInTariff != "number") {
        alertPriceInTariff.innerText = "cyfrę jeśli łaska.."
    }
    if (typeof wear != "number") {
        alertWear.innerText = "cyfrę jeśli łaska.."
    }
    if (typeof proposePrice != "number") {
        alertProposePrice.innerText = "cyfrę jeśli łaska.."
    }
}

getActualValuesFn = () => {
    tariff = document.getElementById('tariff').value;
    endOfAgreement = parseInt(document.getElementById('endOfAgreement').value);
    priceNow = document.getElementById('priceNow').value;
    priceInTariff = document.getElementById('priceInTariff').value;
    wear = document.getElementById('wear').value;
    proposePrice = document.getElementById('proposePrice').value;
    switch (endOfAgreement) {
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
    margeMass = Math.floor((proposePrice - priceInTariff) * wear * wearFactor);
}

calcFn = () => {
    getActualValuesFn();
    replaceCommasAndParseFn();
    verifyValuesFn();
    calcMargeMass();
    summaryCalc.innerText = `Grupa taryfowa: ${tariff}, Umowa kończy się: ${endOfAgreement}, Klient posiada aktualnie cenę ${priceNow}, Cena w cenniku dla taryfy ${tariff}: ${priceInTariff}, Zużycie roczne: ${wear} MWh. Propozycja cenowa: ${proposePrice}, Masa marży: ~ ${margeMass} `
}



btnCalc.addEventListener('click', calcFn);