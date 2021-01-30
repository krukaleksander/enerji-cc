(() => {

    const insertPriceBtn = document.querySelector('.gazomierz__insert-price');
    const insertPriceContainer = document.querySelector('.insert-price');
    const closeInsertPriceContainer = document.getElementById('closeInsertGazPrice');
    const calcBtn = document.querySelectorAll('.gazomierz__calc');

    const replaceAndParseMainFn = (item) => {
        return parseFloat(item.replace(/\,/g, '.'));
    };

    insertPriceBtn.addEventListener('click', () => insertPriceContainer.style.display = 'block');

    closeInsertPriceContainer.addEventListener('click', () => insertPriceContainer.style.display = 'none');

    function calcFn() {
        const gazOh = replaceAndParseMainFn(document.getElementById('gazOh').value);
        const gazActualPrice = replaceAndParseMainFn(document.getElementById('gazActualPrice').value);
        const gazMwh = replaceAndParseMainFn(document.getElementById('gazMwh').value);
        const gazProposition = replaceAndParseMainFn(document.getElementById('gazProposition').value);

        const savingsFromOh = (gazOh * 12).toFixed(2);
        const savingsFromMwh = ((gazActualPrice - gazProposition) * gazMwh).toFixed(2);


    };

    calcBtn.addEventListener('click', calcFn);




})()