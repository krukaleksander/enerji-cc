const calcConsuption = (beginingDate, endDate, numberOne, numberTwo, container) => {
    const numberOfDays = (endDate - beginingDate) / 86400000;
    const consumptionInperiod = numberTwo - numberOne;
    const yearConsumption = (consumptionInperiod / numberOfDays) * 365;
    container.innerHTML = `Zużycie klienta roczne to ${yearConsumption / 1000} mWh`;
};


window.addEventListener('DOMContentLoaded', () => {

    function replaceAndParseFn(item) {
        return parseFloat(item.replace(/\,/g, '.'));
    };

    const btn = document.getElementById('conumptionBtn');
    const scorePar = document.getElementById('consumption-score');
    btn.addEventListener('click', () => {
        const beginingDate = document.getElementById('beginingDate');
        const endDate = document.getElementById('endDate');
        const numberOne = document.getElementById('numberOne');
        const numberTwo = document.getElementById('numberTwo');
        const allInputs = [beginingDate, endDate, numberOne, numberTwo];
        allInputs.forEach(input => {
            input.addEventListener('focus', () => {
                scorePar.innerHTML = '';
            })
        });
        if (beginingDate.value >= endDate.value) return scorePar.innerHTML = `Chyba coś nie tak z datami... ;]`;
        if (numberOne.value === numberTwo.value) return scorePar.innerHTML = `Spójrz na wskazania, klient nic nie zużył?`;
        if (numberOne.value > numberTwo.value) return scorePar.innerHTML = `Wskazanie poprzednie nie może być większe od obecnego`;


        calcConsuption(new Date(beginingDate.value), new Date(endDate.value), replaceAndParseFn(numberOne.value), replaceAndParseFn(numberTwo.value), scorePar);
    })
})