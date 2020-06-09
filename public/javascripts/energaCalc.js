const btnCalc = document.getElementById('btnCalc');
const summaryCalc = document.getElementById('summaryCalc');
const btnCopyCalc = document.getElementById('btnCopyCalc');
const divWhenOption2020 = document.querySelector('.when-option-2020');
const divWhenOption2019 = document.querySelector('.when-option-2019');
const onePriceCheckbox = document.getElementById('onePriceForAll');
const tariff = document.getElementById('tariff');
const endOfAgreement = document.getElementById('endOfAgreement');
const btn35zl = document.getElementById('info35zl');
let tariffCalcFlag = 0;
let onePriceFlag = 0;
let info35zlFlag = true;

onePriceCheckbox.checked = false;
selectElement('tariff', 'C11');
selectElement('endOfAgreement', '2021');

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
    btn35zl.style.display = 'none';
    info35zlFlag = true;
};
removeNoteFn = () => {
    const allRemovers = [...document.getElementsByClassName('note-remover')];
    allRemovers.forEach(remover => {
        remover.addEventListener('focus', clearNote);
    });
}

replaceCommasAndParseFn = () => {
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
onePriceCheckbox.addEventListener('click', () => {
    if (onePriceFlag === 0) {
        onePriceFlag = 1
    } else {
        onePriceFlag = 0;
    }
});

const calcForTariff = () => {
    btn35zl.style.display = 'block';
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
    } else {
        console.log('co jest kurka wódka?')
    }
}


removeNoteFn();

btnCalc.addEventListener('click', calcForTariff);

endOfAgreement.addEventListener('change', () => {
    const optionDivs = [divWhenOption2019, divWhenOption2020];
    if (endOfAgreement.value === "2021") {
        optionDivs.forEach(div => {
            div.style.display = "none";
        });
    } else if (endOfAgreement.value === "2020") {
        divWhenOption2019.style.display = "none";
        divWhenOption2020.style.display = "block";
    } else if (endOfAgreement.value === "9999") {
        optionDivs.forEach(div => {
            div.style.display = "block";
        })
    }
});
window.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        calcForTariff();
    }
});