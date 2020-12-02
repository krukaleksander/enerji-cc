//obiekt odpowiedzialny za wyliczanie zużycia rocznego

const calcWear = {
    calcWearContainer: document.querySelector('.calc-wear'),
    hideWearContBtn: document.querySelector('.calc-wear__hide'),
    calcWearBtn: document.querySelector('.calc-wear__btn'),
    scorePlace: document.querySelector('.calc-wear__score'),
    mainCalcFn: function () {
        this.wearFistSphere = Number(document.querySelector('.calc-wear__input--first-sphere').value);
        this.wearSecondSphere = Number(document.querySelector('.calc-wear__input--second-sphere').value);
        this.wearDays = Number(document.querySelector('.calc-wear__input--days').value);
        this.sum = ((this.wearFistSphere / this.wearDays + this.wearSecondSphere / this.wearDays) * 365) / 1000;
        this.scorePlace.innerHTML =
            `Zużycie roczne w I strefie [MWh] <span id="wearFirstSpan">${((this.wearFistSphere / this.wearDays * 365) /1000).toFixed(2)}</span>
        <br>
        Zużycie roczne w II strefie [MWh] <span id="wearSecondSpan">${((this.wearSecondSphere / this.wearDays * 365) /1000).toFixed(2)}</span>
        <br>
        Zużycie roczne suma [MWh] <span>${(this.sum).toFixed(2)}</span>
        `
    },
    addAnimationToCont: function (flag) {
        if (flag) {
            this.calcWearContainer.style.animation = 'showCalcWear 1s linear both';
        } else {
            this.calcWearContainer.style.animation = 'none';
        }

    }
}

// nasłuch na guzik pokazujący kalkulator zużyć

document.querySelector('.show-calc-wear').addEventListener('click', () => {
    calcWear.calcWearContainer.style.display = 'flex';
    calcWear.addAnimationToCont(true);
});

// nasłuch na guzik zamykający kalkulator

document.querySelector('.calc-wear__hide').addEventListener('click', () => {
    calcWear.calcWearContainer.style.display = 'none';
    calcWear.addAnimationToCont(false);
});

// nastawiam nasłuch na guzik do przeliczania

document.querySelector('.calc-wear__btn').addEventListener('click', () => {
    calcWear.mainCalcFn();
    // pojawienie się guzika eksportu i opisu
    document.querySelector('.calc-wear__btn--import').style.display = 'block';
    document.querySelector('.calc-wear__info').style.display = 'block';
});

// nastawiam nasłuch na guzik do eksportu

document.querySelector('.calc-wear__btn--import').addEventListener('click', () => {
    const wearFirst = document.getElementById('wearFirstSpan').innerText;
    const wearSecond = document.getElementById('wearSecondSpan').innerText;
    console.log(wearFirst);
    console.log(wearSecond);
    document.getElementById('wear').value = wearFirst;
    document.getElementById('wearFirst').value = wearFirst;
    document.getElementById('wearSecond').value = wearSecond;
});

// focus na inputy żeby znikała reszta jak się coś edytuje

const inputsCalcWear = [...document.querySelectorAll('.calc-wear input')];
inputsCalcWear.forEach(input => {
    input.addEventListener('focus', () => {
        document.querySelector('.calc-wear__btn--import').style.display = 'none';
        document.querySelector('.calc-wear__info').style.display = 'none';
        document.querySelector('.calc-wear__score').innerHTML = '';
    })
})