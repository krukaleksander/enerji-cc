let productName = 'TOP';

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
        this.calc2024 = 0;
        this.calc2025 = 0;
        this.calc2026 = 0;
    }
    setGoodProduct = (name) => this.pricesFromDb.find(product => product.name === name);

    getPricesFromDb = () => {
        fetch(`${window.location.href}/get-prices`, {
                method: 'GET',

            })
            .then(response => response.json())
            .then(result => {
                this.pricesFromDb = result.map(product => {
                    return {
                        name: product.name,
                        description: product.description,
                        prices: product.tariffs.find(goodTariff => goodTariff.name === this.name)
                    }
                });
            })
            .then(() => console.log(this.pricesFromDb))
            .catch(err => {
                console.log('Błąd w Fetch' + err)
            })
        return true;
    };
    checkEndOfNewAgreement = (start, end) => {
        const options = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
        let chosenYears = [];
        let correctStart = start;
        chosenYears.push(start);
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
        if (chosenYears.indexOf(2024) > -1) {
            this.calc2024 = 1;
        } else {
            this.calc2024 = 0;
        };
        if (chosenYears.indexOf(2025) > -1) {
            this.calc2025 = 1;
        } else {
            this.calc2025 = 0;
        };
        if (chosenYears.indexOf(2026) > -1) {
            this.calc2026 = 1;
        } else {
            this.calc2026 = 0;
        };
    };
    checkEndOfAgreementMonth = (monthIndex) => parseFloat(((monthIndex - 1) / 12).toFixed(2));
    checkEndOfAgreement = () => {
        this.checkEndOfNewAgreement(+endOfAgreement.value, +endOfNewAgreement.value);
        switch (parseInt(endOfAgreement.value)) {
            case 2026:
                this.countsPrice2020 = 0;
                this.countsPrice2021 = 0;
                this.countsPrice2022 = 0;
                this.countsPrice2023 = 0;
                this.countsPrice2024 = 0;
                this.countsPrice2025 = 0;
                this.countsPrice2026 = 0 + this.checkEndOfAgreementMonth(+endOfAgreementMonth.value);
                break;
            case 2025:
                this.countsPrice2020 = 0;
                this.countsPrice2021 = 0;
                this.countsPrice2022 = 0;
                this.countsPrice2023 = 0;
                this.countsPrice2024 = 0;
                this.countsPrice2025 = 0 + this.checkEndOfAgreementMonth(+endOfAgreementMonth.value);
                this.countsPrice2026 = 1;
                break;
            case 2024:
                this.countsPrice2020 = 0;
                this.countsPrice2021 = 0;
                this.countsPrice2022 = 0;
                this.countsPrice2023 = 0;
                this.countsPrice2024 = 0 + this.checkEndOfAgreementMonth(+endOfAgreementMonth.value);
                this.countsPrice2025 = 1;
                this.countsPrice2026 = 1;
                break;
            case 2023:
                this.countsPrice2020 = 0;
                this.countsPrice2021 = 0;
                this.countsPrice2022 = 0;
                this.countsPrice2023 = 0 + this.checkEndOfAgreementMonth(+endOfAgreementMonth.value);
                this.countsPrice2024 = 1;
                this.countsPrice2025 = 1;
                this.countsPrice2026 = 1;
                break;
            case 2022:
                this.countsPrice2020 = 0;
                this.countsPrice2021 = 0;
                this.countsPrice2022 = 0 + this.checkEndOfAgreementMonth(+endOfAgreementMonth.value);
                this.countsPrice2023 = 1;
                this.countsPrice2024 = 1;
                this.countsPrice2025 = 1;
                this.countsPrice2026 = 1;
                break;
            case 2021:
                this.countsPrice2020 = 0;
                this.countsPrice2021 = 0 + this.checkEndOfAgreementMonth(+endOfAgreementMonth.value);
                this.countsPrice2022 = 1;
                this.countsPrice2023 = 1;
                this.countsPrice2024 = 1;
                this.countsPrice2025 = 1;
                this.countsPrice2026 = 1;
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
        } else if (this.numberOfSpheres === 3) {
            this.weareThreeSpeheresFirst = replaceAndParseMainFn(document.getElementById('wearFirstThreeSpheres').value);
            this.weareThreeSpeheresSecond = replaceAndParseMainFn(document.getElementById('wearSecondThreeSpheres').value);
            this.weareThreeSpeheresThird = replaceAndParseMainFn(document.getElementById('wearThirdThreeSpheres').value);
            this.wearTwoSpheresSum = (this.weareTwoSpeheresFirst + this.weareTwoSpeheresSecond + this.weareThreeSpeheresThird).toFixed(2);
            document.getElementById('wearSumThreeSpheres').value = this.wearTwoSpheresSum;
        }
    };
    getProposition = () => {
        if (this.numberOfSpheres === 1) {
            this.proposeOneSphere = replaceAndParseMainFn(document.getElementById('proposePrice').value);
        } else if (this.numberOfSpheres === 2) {
            this.proposeTwoSpheresFirst = replaceAndParseMainFn(document.getElementById('proposePriceFirst').value);
            this.proposeTwoSpheresSecond = replaceAndParseMainFn(document.getElementById('proposePriceSecond').value);
        } else if (this.numberOfSpheres === 3) {
            this.proposeThreeSpheresFirst = replaceAndParseMainFn(document.getElementById('proposePriceFirstThreeSpheres').value);
            this.proposeThreeSpheresSecond = replaceAndParseMainFn(document.getElementById('proposePriceSecondThreeSpheres').value);
            this.proposeThreeSpheresThird = replaceAndParseMainFn(document.getElementById('proposePriceThirdThreeSpheres').value);
        }
    };
    calcOneSphere = () => {
        const productPrice = (this.setGoodProduct(document.getElementById('product').value)).prices;
        this.margeMass = Math.floor(((this.proposeOneSphere - replaceAndParseMainFn(productPrice.price2026)) * this.wearOneSphere * this.calc2026 * this.countsPrice2026) + ((this.proposeOneSphere - replaceAndParseMainFn(productPrice.price2025)) * this.wearOneSphere * this.countsPrice2025 * this.calc2025) + ((this.proposeOneSphere - replaceAndParseMainFn(productPrice.price2024)) * this.wearOneSphere * this.countsPrice2024 * this.calc2024) + ((this.proposeOneSphere - replaceAndParseMainFn(productPrice.price2023)) * this.wearOneSphere * this.countsPrice2023 * this.calc2023) + ((this.proposeOneSphere - replaceAndParseMainFn(productPrice.price2022)) * this.wearOneSphere * this.countsPrice2022 * this.calc2022) + ((this.proposeOneSphere - replaceAndParseMainFn(productPrice.price2021)) * this.wearOneSphere * this.countsPrice2021 * this.calc2021));

    };
    calcTwoSpheres = () => {
        if (onePriceFlag === 1) {
            const money2023 = (this.proposeTwoSpheresAvr - replaceAndParseMainFn(this.pricesFromDb.tariff.price2023.avr)) * this.wearTwoSpheresSum * this.calc2023;
            const money2022 = (this.proposeTwoSpheresAvr - replaceAndParseMainFn(this.pricesFromDb.tariff.price2022.avr)) * this.wearTwoSpheresSum * this.countsPrice2022 * this.calc2022;
            const money2021 = (this.proposeTwoSpheresAvr - replaceAndParseMainFn(this.pricesFromDb.tariff.price2021.avr)) * this.wearTwoSpheresSum * this.countsPrice2021 * this.calc2021;
            this.margeMass = (money2023 + money2022 + money2021).toFixed(2);

        } else {
            const money2023 = ((this.proposeTwoSpheresFirst - replaceAndParseMainFn(this.pricesFromDb.tariff.price2023.first)) * this.weareTwoSpeheresFirst) + ((this.proposeTwoSpheresSecond - replaceAndParseMainFn(this.pricesFromDb.tariff.price2023.second)) * this.weareTwoSpeheresSecond) * this.calc2023;
            const money2022 = (((this.proposeTwoSpheresFirst - replaceAndParseMainFn(this.pricesFromDb.tariff.price2022.first)) * this.weareTwoSpeheresFirst) + ((this.proposeTwoSpheresSecond - replaceAndParseMainFn(this.pricesFromDb.tariff.price2022.second)) * this.weareTwoSpeheresSecond)) * this.countsPrice2022 * this.calc2022;
            const money2021 = (((this.proposeTwoSpheresFirst - replaceAndParseMainFn(this.pricesFromDb.tariff.price2021.first)) * this.weareTwoSpeheresFirst) + ((this.proposeTwoSpheresSecond - replaceAndParseMainFn(this.pricesFromDb.tariff.price2021.second)) * this.weareTwoSpeheresSecond)) * this.countsPrice2021 * this.calc2021;
            this.margeMass = (money2023 + money2022 + money2021).toFixed(2);

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
const c23Engine = new Tariff(3, 12, 'C23');
const b21Engine = new Tariff(1, 6, 'B21');
const b22Engine = new Tariff(2, 7, 'B22');
const b23Engine = new Tariff(2, 13, 'B23');
const g11Engine = new Tariff(1, 9, 'G11');
const g12Engine = new Tariff(2, 10, 'G12');
const g12wEngine = new Tariff(2, 11, 'G12w');