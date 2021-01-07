function setTariffInputs(tariff, prices, flag) {
    let pricesRev = prices.reverse();
    let pricesInOneTable = [];
    const insertToInputs = (prices) => {
        inputs.forEach((input, index) => {
            input.value = prices[index];
        });
    };
    const inputs = [...document.querySelectorAll(`.wrap-change-price-${tariff} div input`)];
    if (flag === 'one') {
        insertToInputs(pricesRev);
    } else {
        pricesRev.forEach(table => pricesInOneTable = pricesInOneTable.concat(table));
        insertToInputs(pricesInOneTable);

    }
};


var easyPrices = {
    input: document.querySelector('.easy-prices__input'),
    btn: document.querySelector('.easy-prices__btn'),
    value: [],
    pricesAsObject: {},
    pricesAsArr: [],
    init: function () {
        //destrukturyzacja
        var input = easyPrices.input,
            btn = easyPrices.btn,
            value = easyPrices.value,
            pricesAsArr = easyPrices.pricesAsArr;
        btn.addEventListener('click', function () {
            var flag = document.querySelector('.easy-prices__select-sphere').value;
            var tariff = document.querySelector('.easy-prices__select-tariff').value;
            //zamiana stringa na tablicę z cenami
            value = input.value.split(" ");
            if (flag === 'one') {
                //przerobienie tablicy z cenami na obiekt
                pricesAsArr = [value[1], value[3], value[5], value[7]];
                setTariffInputs(tariff, pricesAsArr, flag);
                console.log(value);
                console.log(pricesAsArr);
            } else if (flag === 'two') {
                //funkcja, która w grupach dwutaryfowych zwraca tablicę z cenami
                var changeStringPrices = function (prices) {
                    return prices.split('\t');
                };
                pricesAsArr = [changeStringPrices(value[1]), changeStringPrices(value[3]), changeStringPrices(value[5]), changeStringPrices(value[7])];
                setTariffInputs(tariff, pricesAsArr, flag);
            }
        });
    }
};

function helpWithPrices() {
    easyPrices.input = document.querySelector('.easy-prices__input');
    easyPrices.btn = document.querySelector('.easy-prices__btn');
    easyPrices.init();

};

helpWithPrices();

showChangePrices = function (pass) {
    if (pass) {
        document.querySelector('.show-price-change').style.display = 'block';
        return ('Hello admin :)');
    }
    return ('Wrong pass');
}