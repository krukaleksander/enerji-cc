let tariffSelected, priceC12a2022, priceC12a2021, priceC12a2020, wearFirst, wearSecond, wearSum;
const replaceAndParseMainFn = (item) => {
    return parseFloat(item.replace(/\,/g, '.'));
};

const getElementsForC12a = () => {
    tariffSelected = (document.getElementById('tariff')).value;
    priceC12a2022 = {
        avr: replaceAndParseMainFn(document.getElementById('priceC12a2022Avr').value),
        first: replaceAndParseMainFn(document.getElementById('priceC12a2022First').value),
        second: replaceAndParseMainFn(document.getElementById('priceC12a2022Second').value)
    };
    priceC12a2021 = {
        avr: replaceAndParseMainFn(document.getElementById('priceC12a2021Avr').value),
        first: replaceAndParseMainFn(document.getElementById('priceC12a2021First').value),
        second: replaceAndParseMainFn(document.getElementById('priceC12a2021Second').value)
    };
    priceC12a2020 = {
        avr: replaceAndParseMainFn(document.getElementById('priceC12a2020Avr').value),
        first: replaceAndParseMainFn(document.getElementById('priceC12a2020First').value),
        second: replaceAndParseMainFn(document.getElementById('priceC12a2020Second').value)
    };
    wearFirst = replaceAndParseMainFn(document.getElementById('wearFirst').value);
    wearSecond = replaceAndParseMainFn(document.getElementById('wearFirst').value);
    wearSum = document.getElementById('wearSum');
    console.log(priceC12a2020);
};

const calcc12a = () => {
    getElementsForC12a();


};