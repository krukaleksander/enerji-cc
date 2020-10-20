var easyPrices = {
    input: document.querySelector('.easy-prices__input'),
    btn: document.querySelector('.easy-prices__btn'),
    value: [],
    pricesAsObject: {},
    init: function () {
        //destrukturyzacja
        var input = easyPrices.input,
            btn = easyPrices.btn,
            value = easyPrices.value,
            pricesAsObject = easyPrices.pricesAsObject;
        btn.addEventListener('click', function () {
            var flag = document.querySelector('.easy-prices__select-sphere').value;
            var tariff = document.querySelector('.easy-prices__select-tariff').value;
            //zamiana stringa na tablicę z cenami
            value = input.value.split(" ");
            if (flag === 'one') {
                //przerobienie tablicy z cenami na obiekt
                pricesAsObject = {
                    price2020: value[1],
                    price2021: value[3],
                    price2022: value[5],
                    price2023: value[7]
                };
                console.log(pricesAsObject);
            } else if (flag === 'two') {
                //funkcja, która w grupach dwutaryfowych zwraca tablicę z cenami
                var changeStringPrices = function (prices) {
                    return prices.split('\t');
                };
                pricesAsObject = {
                    price2020: changeStringPrices(value[1]),
                    price2021: changeStringPrices(value[3]),
                    price2022: changeStringPrices(value[5]),
                    price2023: changeStringPrices(value[7])
                };
                console.log(pricesAsObject);
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