// zmienna odpowiadająca za mnożnik w 9999 w tym momencie wyliczona od miesiąca grudnia
const factor999 = 0.08;

class Tariff {
    constructor(numberOfSpheres, indexOfData, name) {
        this.numberOfSpheres = numberOfSpheres;
        this.indexOfData = indexOfData;
        this.pricesFromDbDone = this.getPricesFromDb();
        this.name = name;
        this.calc2020 = 0;
        this.calc2021 = 0;
        this.calc2022 = 0;
        this.calc2023 = 0;


    }
    getPricesFromDb = () => {
        fetch(`${window.location.href}/get-prices`, {
                method: 'GET',

            })
            .then(response => response.json())
            .then(result => {
                this.pricesFromDb = result[this.indexOfData];
            })
            .catch(err => {
                console.log('Błąd w Fetch' + err)
            })
        return true;
    };
    checkEndOfNewAgreement = (start, end) => {
        const options = [2020, 2021, 2022, 2023];
        let chosenYears = [];
        let correctStart = start;
        if (start === 9999) correctStart = 2019;
        options.forEach(option => {
            if (option > correctStart && option <= end) {
                chosenYears.push(option);
            };
        });

        if (chosenYears.indexOf(2020) > -1) {
            this.calc2020 = 1;
        } else {
            this.calc2020 = 0;
        };
        if (chosenYears.indexOf(2021) > -1) {
            this.calc2021 = 1;
        } else {
            this.calc2021 = 0;
        };
        if (chosenYears.indexOf(2022) > -1) {
            this.calc2022 = 1;
        } else {
            this.calc2022 = 0;
        };
        if (chosenYears.indexOf(2023) > -1) {
            this.calc2023 = 1;
        } else {
            this.calc2023 = 0;
        };

    };
    checkEndOfAgreement = () => {
        this.checkEndOfNewAgreement(+endOfAgreement.value, +endOfNewAgreement.value);
        switch (parseInt(endOfAgreement.value)) {
            case 2022:
                this.countsPrice2020 = 0;
                this.countsPrice2021 = 0;
                this.countsPrice2022 = 0;
                break;
            case 2021:
                this.countsPrice2020 = 0;
                this.countsPrice2021 = 0;
                this.countsPrice2022 = 1;
                break;
            case 2020:
                this.countsPrice2020 = 0;
                this.countsPrice2021 = 1;
                this.countsPrice2022 = 1;
                break;
            case 9999:
                //poniżej mnożnik dziewiątek
                this.countsPrice2020 = factor999;
                this.countsPrice2021 = 1;
                this.countsPrice2022 = 1;
                break;
            default:
                this.countsPrice2020 = 0;
                this.countsPrice2021 = 0;
                this.countsPrice2022 = 0;

        }
    };
    getWear = () => {
        if (this.numberOfSpheres === 1) {
            this.wearOneSphere = replaceAndParseMainFn(document.getElementById('wear').value);
        } else if (this.numberOfSpheres === 2) {
            this.weareTwoSpeheresFirst = replaceAndParseMainFn(document.getElementById('wearFirst').value);
            this.weareTwoSpeheresSecond = replaceAndParseMainFn(document.getElementById('wearSecond').value);
            this.wearTwoSpheresSum = (this.weareTwoSpeheresFirst + this.weareTwoSpeheresSecond).toFixed(2);
            document.getElementById('wearSum').value = this.wearTwoSpheresSum;
        }
    };
    getProposition = () => {
        if (this.numberOfSpheres === 1) {
            this.proposeOneSphere = replaceAndParseMainFn(document.getElementById('proposePrice').value);
        } else if (this.numberOfSpheres === 2) {
            this.proposeTwoSpheresAvr = replaceAndParseMainFn(document.getElementById('proposePriceAvr').value);
            this.proposeTwoSpheresFirst = replaceAndParseMainFn(document.getElementById('proposePriceFirst').value);
            this.proposeTwoSpheresSecond = replaceAndParseMainFn(document.getElementById('proposePriceSecond').value);
        }
    };
    calcOneSphere = () => {
        this.margeMass = Math.floor(((this.proposeOneSphere - replaceAndParseMainFn(this.pricesFromDb.tariff.price2023)) * this.wearOneSphere * this.calc2023) + ((this.proposeOneSphere - replaceAndParseMainFn(this.pricesFromDb.tariff.price2022)) * this.wearOneSphere * this.countsPrice2022 * this.calc2022) + ((this.proposeOneSphere - replaceAndParseMainFn(this.pricesFromDb.tariff.price2021)) * this.wearOneSphere * this.countsPrice2021 * this.calc2021) + ((this.proposeOneSphere - replaceAndParseMainFn(this.pricesFromDb.tariff.price2020)) * this.wearOneSphere * this.countsPrice2020 * this.calc2020));
    };
    calcTwoSpheres = () => {
        if (onePriceFlag === 1) {
            const money2023 = (this.proposeTwoSpheresAvr - replaceAndParseMainFn(this.pricesFromDb.tariff.price2023.avr)) * this.wearTwoSpheresSum * this.calc2023;
            const money2022 = (this.proposeTwoSpheresAvr - replaceAndParseMainFn(this.pricesFromDb.tariff.price2022.avr)) * this.wearTwoSpheresSum * this.countsPrice2022 * this.calc2022;
            const money2021 = (this.proposeTwoSpheresAvr - replaceAndParseMainFn(this.pricesFromDb.tariff.price2021.avr)) * this.wearTwoSpheresSum * this.countsPrice2021 * this.calc2021;
            const money2020 = (this.proposeTwoSpheresAvr - replaceAndParseMainFn(this.pricesFromDb.tariff.price2020.avr)) * this.wearTwoSpheresSum * this.countsPrice2020 * this.calc2020;
            this.margeMass = (money2023 + money2022 + money2021 + money2020).toFixed(2);

        } else {
            const money2023 = ((this.proposeTwoSpheresFirst - replaceAndParseMainFn(this.pricesFromDb.tariff.price2023.first)) * this.weareTwoSpeheresFirst) + ((this.proposeTwoSpheresSecond - replaceAndParseMainFn(this.pricesFromDb.tariff.price2023.second)) * this.weareTwoSpeheresSecond) * this.calc2023;
            const money2022 = (((this.proposeTwoSpheresFirst - replaceAndParseMainFn(this.pricesFromDb.tariff.price2022.first)) * this.weareTwoSpeheresFirst) + ((this.proposeTwoSpheresSecond - replaceAndParseMainFn(this.pricesFromDb.tariff.price2022.second)) * this.weareTwoSpeheresSecond)) * this.countsPrice2022 * this.calc2022;
            const money2021 = (((this.proposeTwoSpheresFirst - replaceAndParseMainFn(this.pricesFromDb.tariff.price2021.first)) * this.weareTwoSpeheresFirst) + ((this.proposeTwoSpheresSecond - replaceAndParseMainFn(this.pricesFromDb.tariff.price2021.second)) * this.weareTwoSpeheresSecond)) * this.countsPrice2021 * this.calc2021;
            const money2020 = (((this.proposeTwoSpheresFirst - replaceAndParseMainFn(this.pricesFromDb.tariff.price2020.first)) * this.weareTwoSpeheresFirst) + ((this.proposeTwoSpheresSecond - replaceAndParseMainFn(this.pricesFromDb.tariff.price2020.second)) * this.weareTwoSpeheresSecond)) * this.countsPrice2020 * this.calc2020;
            this.margeMass = (money2023 + money2022 + money2021 + money2020).toFixed(2);

        }
    };
    createNote = () => {
        if (this.numberOfSpheres === 1) {
            const priceNow = document.getElementById('priceNow').value;
            summaryCalc.style.padding = '10px';
            summaryCalc.innerHTML = `Grupa taryfowa: <span class ="value-of-calc-data">${this.name}</span>, Umowa kończy się: <span class ="value-of-calc-data">${endOfAgreement.value}</span>, Klient posiada aktualnie cenę: <span class="value-of-calc-data">${priceNow}</span>, Zużycie roczne: <span class ="value-of-calc-data">${this.wearOneSphere}</span> MWh. Propozycja cenowa: <span class ="value-of-calc-data">${this.proposeOneSphere}</span>, Masa marży: ~ <span class ="value-of-calc-data marge-mass-span">${this.margeMass}</span>`;
            summaryCalc.scrollIntoView();
        } else if (this.numberOfSpheres === 2) {
            const havePriceAvr = document.getElementById('havePriceAvr').value;
            const havePriceFirst = document.getElementById('havePriceFirst').value;
            const havePriceSecond = document.getElementById('havePriceSecond').value;
            let spanF = `<span class="value-of-calc-data">`;
            let spanE = `</span>`;
            summaryCalc.style.padding = '10px';
            summaryCalc.innerHTML = `Grupa taryfowa: ${spanF}${this.name}${spanE}, <br>Umowa kończy się: ${spanF}${endOfAgreement.value}${spanE}, <br>Klient posiada aktualnie ceny: Średnia: ${spanF}${havePriceAvr}${spanE} I strefa: ${spanF}${havePriceFirst}${spanE} II strefa: ${spanF}${havePriceSecond}${spanE}<br>Zużycie roczne: <span class ="value-of-calc-data">${this.wearTwoSpheresSum}</span> MWh. <br>Propozycja cenowa: Średnia: ${spanF}${this.proposeTwoSpheresAvr}${spanE} I strefa: ${spanF}${this.proposeTwoSpheresFirst}${spanE} II strefa: ${spanF}${this.proposeTwoSpheresSecond}${spanE}, <br>Masa marży: ~ <span class ="value-of-calc-data marge-mass-span">${this.margeMass}</span>`;
            summaryCalc.scrollIntoView();
        }
    }
    checkWhatIsBetter = () => {
        if (this.numberOfSpheres === 2) {
            this.getWear();
            this.getProposition();
            const wearSum = Number(this.wearTwoSpheresSum);
            const costAvr = (wearSum * this.proposeTwoSpheresAvr).toFixed(2);
            const costInSpheres = ((this.weareTwoSpeheresFirst * this.proposeTwoSpheresFirst) + (this.weareTwoSpeheresSecond * this.proposeTwoSpheresSecond)).toFixed(2);
            console.log(`Na płasko klient zapłaci za rok: ${costAvr}`);
            console.log(`W podziale na strefy klient zapłaci za rok: ${costInSpheres}`);
        } else {
            return
        }
    }
    mainCalcFn = () => {
        this.checkEndOfAgreement();
        this.getWear();
        this.getProposition();
        if (this.numberOfSpheres === 1) {
            this.calcOneSphere();
        } else if (this.numberOfSpheres === 2) {
            this.calcTwoSpheres();
        }
        this.createNote();


    }

}

const c11Engine = new Tariff(1, 0, 'C11');
const c12aEngine = new Tariff(2, 1, 'C12a');
const c12bEngine = new Tariff(2, 2, 'C12b');
const c21Engine = new Tariff(1, 3, 'C21');
const c22aEngine = new Tariff(2, 4, 'C22a');
const c22bEngine = new Tariff(2, 5, 'C22b');
const b21Engine = new Tariff(1, 6, 'B21');
const b11Engine = new Tariff(1, 8, 'B11');
const b22Engine = new Tariff(2, 7, 'B22');