const calcConsuption = (beginingDate, endDate, numberOne, numberTwo, numberOneSecondSphere, numberTwoSecondSphere, container) => {
    const numberOfDays = (endDate - beginingDate) / 86400000;
    const consumptionInperiod = numberTwo - numberOne;
    const consumptionInperiodSecond = numberTwoSecondSphere - numberOneSecondSphere;
    const yearConsumption = (consumptionInperiod / numberOfDays) * 365;
    const yearConsumptionSecond = (consumptionInperiodSecond / numberOfDays) * 365;
    container.innerHTML = `Faktury są za okres: ${numberOfDays} dni, <br> Zużycie roczne w I strefie to ${yearConsumption / 1000} MWh <br> Zużycie roczne w II strefie to ${yearConsumptionSecond / 1000} MWh <br> Zużycie suma dla obu stref: ${(yearConsumption + yearConsumptionSecond) / 1000} MWh`;
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
        const numberOneSecondSphere = document.getElementById('numberOneSecondSphere');
        const numberTwoSecondSphere = document.getElementById('numberTwoSecondSphere');
        const allInputs = [beginingDate, endDate, numberOne, numberTwo, numberOneSecondSphere, numberTwoSecondSphere];
        allInputs.forEach(input => {
            input.addEventListener('focus', () => {
                scorePar.innerHTML = '';
            })
        });
        if (beginingDate.value >= endDate.value) return scorePar.innerHTML = `Chyba coś nie tak z datami... ;]`;
        if (numberOne.value === numberTwo.value) return scorePar.innerHTML = `Spójrz na wskazania, klient nic nie zużył?`;
        if (+numberOne.value > +numberTwo.value) return scorePar.innerHTML = `Wskazanie poprzednie nie może być większe od obecnego`;


        calcConsuption(new Date(beginingDate.value), new Date(endDate.value), replaceAndParseFn(numberOne.value), replaceAndParseFn(numberTwo.value), replaceAndParseFn(numberOneSecondSphere.value), replaceAndParseFn(numberTwoSecondSphere.value), scorePar);
        scorePar.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest"
        });
    });


    const aboutConsumption = document.querySelector('.about-consumption');
    document.getElementById('showAboutConsumption').addEventListener('click', () => {
        aboutConsumption.style.display = 'block';
    });
    document.querySelector('.about-consumption__close').addEventListener('click', () => {
        aboutConsumption.style.display = 'none';
    });
})