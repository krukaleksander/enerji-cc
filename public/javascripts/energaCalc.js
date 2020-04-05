const btnCalc = document.getElementById('btnCalc');
const summaryCalc = document.getElementById('summaryCalc');
const btnCopyCalc = document.getElementById('btnCopyCalc');
const divWhenOption2020 = document.querySelector('.when-option-2020');
const divWhenOption2019 = document.querySelector('.when-option-2019');
const onePriceCheckbox = document.getElementById('onePriceForAll');
let countsPrice2021 = 0;
let countsPrice2020 = 0;
let tariff, endOfAgreement, priceNow, priceInTariff2022, priceInTariff2021, priceInTariff2020, wear, proposePrice, margeMass;
let tariffCalcFlag = 0;
let onePriceFlag = 0;
let wearFirst, wearSecond, wearSum;
let haveAvr, haveFirst, haveSecond;
let proposeAvr, proposeFirst, proposeSecond;


selectElement('tariff', 'C11');
selectElement('endOfAgreement', '2021');


function selectElement(id, valueToSelect) {
    let element = document.getElementById(id);
    element.value = valueToSelect;
}
const clearNote = () => {
    summaryCalc.style.padding = "0px";
    summaryCalc.innerHTML = "";
};
removeNoteFn = () => {
    getActualValuesFn();
    let noteRemoversWhenFocus = [tariff, endOfAgreement, priceNow, priceInTariff2022, priceInTariff2021, priceInTariff2020, wear, proposePrice];
    const allInputs = [...document.getElementsByClassName('note-remover')];
    const allRemovers = noteRemoversWhenFocus.concat(allInputs);
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
        case 9999:
            countsPrice2020 = 0.66;
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
    if (tariffCalcFlag === 0) {


        getActualValuesFn();
        replaceCommasAndParseFn();
        if (priceNow.value > 0 && priceInTariff2022.value > 0 && wear.value > 0 && proposePrice.value > 0) {

            calcMargeMass();
            summaryCalc.style.padding = '10px';
            summaryCalc.innerHTML = `Grupa taryfowa: <span class ="value-of-calc-data">${tariff.value}</span>, Umowa kończy się: <span class ="value-of-calc-data">${endOfAgreement.value}</span>, Klient posiada aktualnie cenę: <span class="value-of-calc-data">${priceNow.value}</span>, Cena w cenniku dla taryfy <span class ="value-of-calc-data">${tariff.value}</span>: <span class ="value-of-calc-data">${priceInTariff2022.value}</span>, Zużycie roczne: <span class ="value-of-calc-data">${wear.value}</span> MWh. Propozycja cenowa: <span class ="value-of-calc-data">${proposePrice.value}</span>, Masa marży: ~ <span class ="value-of-calc-data marge-mass-span">${margeMass}</span>, Różnica w cenie: <span class ="value-of-calc-data client-income-span">${(proposePrice.value - priceNow.value).toFixed(2)}</span> <br>Osoba kontaktowa:`;
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
    } else if (tariffCalcFlag === 1) {
        calcc12a()
    } else if (tariffCalcFlag === 2) {
        calcc12b()
    } else if (tariffCalcFlag === 3) {
        calcc21()
    } else {
        console.log('What the fuck?')
    }
}

const getElementsForC12x = () => {
    wearFirst = replaceAndParseMainFn(document.getElementById('wearFirst').value);
    wearSecond = replaceAndParseMainFn(document.getElementById('wearSecond').value);
    wearSum = document.getElementById('wearSum');
    wearSum.value = (wearFirst + wearSecond).toFixed(2);

    haveAvr = replaceAndParseMainFn(document.getElementById('havePriceAvr').value);
    haveFirst = replaceAndParseMainFn(document.getElementById('havePriceFirst').value);
    haveSecond = replaceAndParseMainFn(document.getElementById('havePriceSecond').value);

    proposeAvr = replaceAndParseMainFn(document.getElementById('proposePriceAvr').value);
    proposeFirst = replaceAndParseMainFn(document.getElementById('proposePriceFirst').value);
    proposeSecond = replaceAndParseMainFn(document.getElementById('proposePriceSecond').value);
}

onePriceCheckbox.addEventListener('click', () => {
    if (onePriceFlag === 0) {
        onePriceFlag = 1
    } else {
        onePriceFlag = 0;
    }
})


const complexSummaryFn = (message) => {
    summaryCalc.style.padding = '10px';
    summaryCalc.innerHTML = message;
    const margeMassSpan = document.querySelector('.marge-mass-span');
    if (margeMass < 300) {
        margeMassSpan.style.color = "red";
    } else {
        margeMassSpan.style.color = "green"
    }
    summaryCalc.scrollIntoView();

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
    } else if (endOfAgreement.value === "9999") {
        optionDivs.forEach(div => {
            div.style.display = "block";
        })
    }
})