const btnCalc = document.getElementById('btnCalc');
const summaryCalc = document.getElementById('summaryCalc');
const btnCopyCalc = document.getElementById('btnCopyCalc');
const onePriceCheckbox = document.getElementById('onePriceForAll');
const tariff = document.getElementById('tariff');
const endOfAgreementMonth = document.getElementById('endOfAgreementMonth');
const endOfAgreement = document.getElementById('endOfAgreement');
const endOfNewAgreement = document.getElementById('endOfNewAgreement');
const btnSavings = document.getElementById('activeCalcSavings');
let tariffCalcFlag = 0;
let info35zlFlag = true;


selectElement('tariff', 'C11');
selectElement('endOfAgreement', '2021');
selectElement('endOfAgreementMonth', '12');
selectElement('endOfNewAgreement', '2023');

const replaceAndParseMainFn = (item) => {
    return parseFloat(item.replace(/\,/g, '.'));
};

function selectElement(id, valueToSelect) {
    let element = document.getElementById(id);
    element.value = valueToSelect;
}
const clearNote = () => {
    summaryCalc.style.padding = "0px";
    summaryCalc.innerHTML = "";
    btnSavings.style.display = 'none';
    info35zlFlag = true;
};
const removeNoteFn = () => {
    const allRemovers = [...document.getElementsByClassName('note-remover')];
    allRemovers.forEach(remover => {
        remover.addEventListener('focus', clearNote);
    });
}

const replaceCommasAndParseFn = () => {
    const valuesArr = [priceInTariff2022, priceInTariff2021, priceInTariff2020, wear, priceNow, proposePrice];
    const replaceAndParseFn = (item) => {
        return parseFloat(item.value.replace(/\,/g, '.'));
    };
    valuesArr.forEach(value => {
        if (value.value.length > 0) {
            value.value = replaceAndParseFn(value);
        } else {
            return
        }
    });

}

const calcForTariff = () => {
    btnSavings.style.display = 'block';
    if (tariffCalcFlag === 0) {
        c11Engine.mainCalcFn();

    } else if (tariffCalcFlag === 1) {
        c12aEngine.mainCalcFn();
    } else if (tariffCalcFlag === 2) {
        c12bEngine.mainCalcFn();
    } else if (tariffCalcFlag === 3) {
        c21Engine.mainCalcFn();
    } else if (tariffCalcFlag === 4) {
        c22aEngine.mainCalcFn();
    } else if (tariffCalcFlag === 5) {
        c22bEngine.mainCalcFn();
    } else if (tariffCalcFlag === 6) {
        b21Engine.mainCalcFn();
    } else if (tariffCalcFlag === 7) {
        b22Engine.mainCalcFn();
    } else if (tariffCalcFlag === 8) {
        b11Engine.mainCalcFn();
    } else if (tariffCalcFlag === 9) {
        g11Engine.mainCalcFn();
    } else if (tariffCalcFlag === 10) {
        g12Engine.mainCalcFn();
    } else if (tariffCalcFlag === 11) {
        g12wEngine.mainCalcFn();
    } else if (tariffCalcFlag === 12) {
        c23Engine.mainCalcFn();
    } else if (tariffCalcFlag === 13) {
        b23Engine.mainCalcFn();
    } else {
        console.log('co jest kurka wódka?')
    }
}


removeNoteFn();

btnCalc.addEventListener('click', calcForTariff);

window.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        calcForTariff();
    }
});