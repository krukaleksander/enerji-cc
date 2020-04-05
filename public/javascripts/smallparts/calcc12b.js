let priceC12b2022, priceC12b2021, priceC12b2020;
let margeMassC12bAvr, margeMassC12bSumb

const getPricesForC12b = () => {
    tariffSelected = (document.getElementById('tariff')).value;
    priceC12b2022 = {
        avr: replaceAndParseMainFn(document.getElementById('priceC12b2022Avr').value),
        first: replaceAndParseMainFn(document.getElementById('priceC12b2022First').value),
        second: replaceAndParseMainFn(document.getElementById('priceC12b2022Second').value)
    };
    priceC12b2021 = {
        avr: replaceAndParseMainFn(document.getElementById('priceC12b2021Avr').value),
        first: replaceAndParseMainFn(document.getElementById('priceC12b2021First').value),
        second: replaceAndParseMainFn(document.getElementById('priceC12b2021Second').value)
    };
    priceC12b2020 = {
        avr: replaceAndParseMainFn(document.getElementById('priceC12b2020Avr').value),
        first: replaceAndParseMainFn(document.getElementById('priceC12b2020First').value),
        second: replaceAndParseMainFn(document.getElementById('priceC12b2020Second').value)
    };
    getElementsForC12x()
};

const calcAvrC12b = () => {
    getActualValuesFn();
    const money2022 = (proposeAvr - priceC12b2022.avr) * wearSum.value;
    const money2021 = (proposeAvr - priceC12b2021.avr) * wearSum.value * countsPrice2021;
    const money2020 = (proposeAvr - priceC12b2020.avr) * wearSum.value * countsPrice2020;
    margeMassC12bAvr = (money2022 + money2021 + money2020).toFixed(2);
    margeMassForNote = margeMassC12bAvr;
}

const calcBothC12b = () => {
    getActualValuesFn();
    const money2022 = ((proposeFirst - priceC12b2022.first) * wearFirst) + ((proposeSecond - priceC12b2022.second) * wearSecond);
    const money2021 = (((proposeFirst - priceC12b2021.first) * wearFirst) + ((proposeSecond - priceC12b2021.second) * wearSecond)) * countsPrice2021;
    const money2020 = (((proposeFirst - priceC12b2020.first) * wearFirst) + ((proposeSecond - priceC12b2022.second) * wearSecond)) * countsPrice2020;
    margeMassC12bSum = (money2022 + money2021 + money2020).toFixed(2);
    margeMassForNote = margeMassC12bSum;
}
const calcc12b = () => {

    getPricesForC12b();
    if (onePriceFlag === 1) {
        calcAvrC12b();
    } else {
        calcBothC12b();
    }
    let spanF = `<span class="value-of-calc-data">`;
    let spanE = `</span>`;
    let yearOfEnd = endOfAgreement.value === "9999" ? 2019 : endOfAgreement.value;
    message = `Grupa taryfowa: ${spanF}${tariff.value}${spanE}, <br>Umowa kończy się: ${spanF}${yearOfEnd}${spanE}, <br>Klient posiada aktualnie ceny: Średnia: ${spanF}${haveAvr}${spanE} I strefa: ${spanF}${haveFirst}${spanE} II strefa: ${spanF}${haveSecond}${spanE}, <br>Ceny w cenniku na 2022 dla taryfy ${spanF}${tariff.value}${spanE}: Średnia: ${spanF}${priceC12b2022.avr}${spanE} I strefa ${spanF}${priceC12b2022.first}${spanE} II strefa: ${spanF}${priceC12b2022.second}${spanE}, <br>Zużycie roczne: <span class ="value-of-calc-data">${wearSum.value}</span> MWh. <br>Propozycja cenowa: Średnia: ${spanE}${proposeAvr}${spanE} I strefa: ${spanF}${proposeFirst}${spanE} II strefa: ${spanF}${proposeSecond}${spanE}, <br>Masa marży: ~ <span class ="value-of-calc-data marge-mass-span">${margeMassForNote}</span><br>Osoba kontaktowa:`;
    complexSummaryFn(message);


};