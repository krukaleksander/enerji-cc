(() => {
    const insertPriceBtn = document.querySelector('.gazomierz__insert-price');
    const insertPriceContainer = document.querySelector('.insert-price');
    const closeInsertPriceContainer = document.getElementById('closeInsertGazPrice');
    const calcBtn = document.querySelector('.gazomierz__calc');
    const summary = document.querySelector('.gazomierz__summary');
    const inputs = [...document.querySelectorAll('input')];
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            summary.style.display = 'none';
        });
    });
    const replaceAndParseMainFn = (item) => {
        return parseFloat(item.replace(/\,/g, '.'));
    };

    calcBtn.scrollIntoView();
    insertPriceBtn.addEventListener('click', () => insertPriceContainer.style.display = 'block');

    closeInsertPriceContainer.addEventListener('click', () => insertPriceContainer.style.display = 'none');

    function calcFn() {
        const gazOh = replaceAndParseMainFn(document.getElementById('gazOh').value);
        const gazActualPrice = replaceAndParseMainFn(document.getElementById('gazActualPrice').value);
        const gazMwh = replaceAndParseMainFn(document.getElementById('gazMwh').value);
        const gazProposition = replaceAndParseMainFn(document.getElementById('gazProposition').value);
        const priceDbGaz = replaceAndParseMainFn(document.getElementById('priceDbGaz').value);
        const agreementStart = replaceAndParseMainFn(document.getElementById('agreementStart').value);
        const endOfNewAgreementGaz = replaceAndParseMainFn(document.getElementById('endOfNewAgreementGaz').value);
        const partOfFirstYear = replaceAndParseMainFn(document.getElementById('agreementStartGazMonth').value);


        const savingsFromOh = Number((gazOh * 12).toFixed(2));
        const savingsFromMwh = Number(((gazActualPrice - gazProposition) * gazMwh).toFixed(2));
        const savingsTotal = (savingsFromOh + savingsFromMwh).toFixed(2);
        const differenceInPrice = (gazProposition - priceDbGaz).toFixed(2);
        const factor = ((endOfNewAgreementGaz - agreementStart) + 1 - (partOfFirstYear / 12).toFixed(2));
        const margeMass = (differenceInPrice * gazMwh * factor).toFixed(2);
        summary.style.display = 'block';
        summary.innerHTML = `<p>Masa marży: ${margeMass} </p><p>Oszczędności OH: ${savingsFromOh}</p><p>Oszczędności gaz: ${savingsFromMwh}</p><p>Suma oszczędności [ROK]: ${savingsTotal}</p>`
        summary.scrollIntoView();
    };

    calcBtn.addEventListener('click', calcFn);




})()