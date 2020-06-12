//obiekt odpowiedzialny za wyliczanie zużycia rocznego

const calcWear = {
    calcWearContainer: document.querySelector('.calc-wear'),
    hideWearContBtn: document.querySelector('.calc-wear__hide'),
    calcWearBtn: document.querySelector('.calc-wear__btn'),
    scorePlace: document.querySelector('.calc-wear__score'),
    mainCalcFn: function () {
        this.wearFistSphere = Number(document.querySelector('.calc-wear__input--first-sphere').value);
        this.wearSecondSphere = Number(document.querySelector('.calc-wear__input--second-sphere').value);
        this.sum = ((this.wearFistSphere + this.wearSecondSphere) * 12) / 1000;
        this.scorePlace.innerHTML =
            `Zużycie roczne w I strefie <span>${((this.wearFistSphere * 12) /1000).toFixed(2)} mWh</span>
        <br>
        Zużycie roczne w II strefie <span>${((this.wearSecondSphere * 12) /1000).toFixed(2)} mWh</span>
        <br>
        Zużycie roczne suma <span>${(this.sum).toFixed(2)} mWh</span>
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
});