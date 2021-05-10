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
            this.wearThreeSpheresSum = (this.weareThreeSpeheresFirst + this.weareThreeSpeheresSecond + this.weareThreeSpeheresThird).toFixed(2);
            document.getElementById('wearSumThreeSpheres').value = this.wearThreeSpheresSum;
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
        let money2026;
        const selectedProduct = document.getElementById('product').value;
        if (selectedProduct === 'SPECJAL TOP') {
            money2026 = 0;
        } else {
            money2026 = ((this.proposeOneSphere - replaceAndParseMainFn(productPrice.price2026)) * this.wearOneSphere * this.calc2026 * this.countsPrice2026);
        }
        const money2025 = ((this.proposeOneSphere - replaceAndParseMainFn(productPrice.price2025)) * this.wearOneSphere * this.countsPrice2025 * this.calc2025);
        const money2024 = ((this.proposeOneSphere - replaceAndParseMainFn(productPrice.price2024)) * this.wearOneSphere * this.countsPrice2024 * this.calc2024);
        const money2023 = ((this.proposeOneSphere - replaceAndParseMainFn(productPrice.price2023)) * this.wearOneSphere * this.countsPrice2023 * this.calc2023);
        const money2022 = ((this.proposeOneSphere - replaceAndParseMainFn(productPrice.price2022)) * this.wearOneSphere * this.countsPrice2022 * this.calc2022);
        const money2021 = ((this.proposeOneSphere - replaceAndParseMainFn(productPrice.price2021)) * this.wearOneSphere * this.countsPrice2021 * this.calc2021)

        this.margeMass = (money2026 + money2025 + money2024 + money2023 + money2022 + money2021).toFixed(2);

    };
    calcTwoSpheres = () => {
        const productPrice = (this.setGoodProduct(document.getElementById('product').value)).prices;

        let money2026;
        const selectedProduct = document.getElementById('product').value;
        if (selectedProduct === 'SPECJAL TOP') {
            money2026 = 0;
        } else {
            money2026 = (((this.proposeTwoSpheresFirst - replaceAndParseMainFn(productPrice.price2026[0])) * this.weareTwoSpeheresFirst) + ((this.proposeTwoSpheresSecond - replaceAndParseMainFn(productPrice.price2026[1])) * this.weareTwoSpeheresSecond)) * this.calc2026 * this.countsPrice2026;
        }

        const money2025 = (((this.proposeTwoSpheresFirst - replaceAndParseMainFn(productPrice.price2025[0])) * this.weareTwoSpeheresFirst) + ((this.proposeTwoSpheresSecond - replaceAndParseMainFn(productPrice.price2025[1])) * this.weareTwoSpeheresSecond)) * this.calc2025 * this.countsPrice2025;

        const money2024 = (((this.proposeTwoSpheresFirst - replaceAndParseMainFn(productPrice.price2024[0])) * this.weareTwoSpeheresFirst) + ((this.proposeTwoSpheresSecond - replaceAndParseMainFn(productPrice.price2024[1])) * this.weareTwoSpeheresSecond)) * this.calc2024 * this.countsPrice2024;

        const money2023 = (((this.proposeTwoSpheresFirst - replaceAndParseMainFn(productPrice.price2023[0])) * this.weareTwoSpeheresFirst) + ((this.proposeTwoSpheresSecond - replaceAndParseMainFn(productPrice.price2023[1])) * this.weareTwoSpeheresSecond)) * this.calc2023 * this.countsPrice2023;

        const money2022 = (((this.proposeTwoSpheresFirst - replaceAndParseMainFn(productPrice.price2022[0])) * this.weareTwoSpeheresFirst) + ((this.proposeTwoSpheresSecond - replaceAndParseMainFn(productPrice.price2022[1])) * this.weareTwoSpeheresSecond)) * this.countsPrice2022 * this.calc2022;

        const money2021 = (((this.proposeTwoSpheresFirst - replaceAndParseMainFn(productPrice.price2021[0])) * this.weareTwoSpeheresFirst) + ((this.proposeTwoSpheresSecond - replaceAndParseMainFn(productPrice.price2021[1])) * this.weareTwoSpeheresSecond)) * this.countsPrice2021 * this.calc2021;
        this.margeMass = (money2026 + money2025 + money2024 + money2023 + money2022 + money2021).toFixed(2);
    };
    calcThreeSpheres = () => {
        const productPrice = (this.setGoodProduct(document.getElementById('product').value)).prices;

        let money2026;
        const selectedProduct = document.getElementById('product').value;

        if (selectedProduct === 'SPECJAL TOP') {
            money2026 = 0;
        } else {
            money2026 = (((this.proposeThreeSpheresFirst - replaceAndParseMainFn(productPrice.price2026[0])) * this.weareThreeSpeheresFirst) + ((this.proposeThreeSpheresSecond - replaceAndParseMainFn(productPrice.price2026[1])) * this.weareThreeSpeheresSecond) + ((this.proposeThreeSpheresThird - replaceAndParseMainFn(productPrice.price2026[2])) * this.weareThreeSpeheresThird)) * this.calc2026 * this.countsPrice2026;
        }

        const money2025 = (((this.proposeThreeSpheresFirst - replaceAndParseMainFn(productPrice.price2025[0])) * this.weareThreeSpeheresFirst) + ((this.proposeThreeSpheresSecond - replaceAndParseMainFn(productPrice.price2025[1])) * this.weareThreeSpeheresSecond) + ((this.proposeThreeSpheresThird - replaceAndParseMainFn(productPrice.price2025[2])) * this.weareThreeSpeheresThird)) * this.calc2025 * this.countsPrice2025;

        const money2024 = (((this.proposeThreeSpheresFirst - replaceAndParseMainFn(productPrice.price2024[0])) * this.weareThreeSpeheresFirst) + ((this.proposeThreeSpheresSecond - replaceAndParseMainFn(productPrice.price2024[1])) * this.weareThreeSpeheresSecond) + ((this.proposeThreeSpheresThird - replaceAndParseMainFn(productPrice.price2024[2])) * this.weareThreeSpeheresThird)) * this.calc2024 * this.countsPrice2024;

        const money2023 = (((this.proposeThreeSpheresFirst - replaceAndParseMainFn(productPrice.price2023[0])) * this.weareThreeSpeheresFirst) + ((this.proposeThreeSpheresSecond - replaceAndParseMainFn(productPrice.price2023[1])) * this.weareThreeSpeheresSecond) + ((this.proposeThreeSpheresThird - replaceAndParseMainFn(productPrice.price2023[2])) * this.weareThreeSpeheresThird)) * this.calc2023 * this.countsPrice2023;

        const money2022 = (((this.proposeThreeSpheresFirst - replaceAndParseMainFn(productPrice.price2022[0])) * this.weareThreeSpeheresFirst) + ((this.proposeThreeSpheresSecond - replaceAndParseMainFn(productPrice.price2022[1])) * this.weareThreeSpeheresSecond) + ((this.proposeThreeSpheresThird - replaceAndParseMainFn(productPrice.price2022[2])) * this.weareThreeSpeheresThird)) * this.countsPrice2022 * this.calc2022;

        const money2021 = (((this.proposeThreeSpheresFirst - replaceAndParseMainFn(productPrice.price2021[0])) * this.weareThreeSpeheresFirst) + ((this.proposeThreeSpheresSecond - replaceAndParseMainFn(productPrice.price2021[1])) * this.weareThreeSpeheresSecond) + ((this.proposeThreeSpheresThird - replaceAndParseMainFn(productPrice.price2021[2])) * this.weareThreeSpeheresThird)) * this.countsPrice2021 * this.calc2021;

        this.margeMass = (money2026 + money2025 + money2024 + money2023 + money2022 + money2021).toFixed(2);
    };
    createNote = () => {
        if (this.numberOfSpheres === 1) {
            const priceNow = document.getElementById('priceNow').value;
            summaryCalc.style.padding = '10px';
            summaryCalc.innerHTML = `Grupa taryfowa: <span class ="value-of-calc-data">${this.name}</span>, Umowa kończy się: <span class ="value-of-calc-data">${endOfAgreement.value}</span>, Klient posiada aktualnie cenę: <span class="value-of-calc-data">${priceNow}</span>, Zużycie roczne: <span class ="value-of-calc-data">${this.wearOneSphere}</span> MWh. Propozycja cenowa: <span class ="value-of-calc-data">${this.proposeOneSphere}</span>, Masa marży: ~ <span class ="value-of-calc-data marge-mass-span">${this.margeMass}</span>`;
            summaryCalc.scrollIntoView();
        } else if (this.numberOfSpheres === 2) {
            const havePriceFirst = document.getElementById('havePriceFirst').value;
            const havePriceSecond = document.getElementById('havePriceSecond').value;
            let spanF = `<span class="value-of-calc-data">`;
            let spanE = `</span>`;
            summaryCalc.style.padding = '10px';
            summaryCalc.innerHTML = `Grupa taryfowa: ${spanF}${this.name}${spanE}, <br>Umowa kończy się: ${spanF}${endOfAgreement.value}${spanE}, <br>Klient posiada aktualnie ceny: I strefa: ${spanF}${havePriceFirst}${spanE} II strefa: ${spanF}${havePriceSecond}${spanE}<br>Zużycie roczne: <span class ="value-of-calc-data">${this.wearTwoSpheresSum}</span> MWh. <br>Propozycja cenowa: I strefa: ${spanF}${this.proposeTwoSpheresFirst}${spanE} II strefa: ${spanF}${this.proposeTwoSpheresSecond}${spanE}, <br>Masa marży: ~ <span class ="value-of-calc-data marge-mass-span">${this.margeMass}</span>`;
            summaryCalc.scrollIntoView();
        } else if (this.numberOfSpheres === 3) {
            const havePriceFirst = document.getElementById('havePriceFirstThree').value;
            const havePriceSecond = document.getElementById('havePriceSecondThree').value;
            const havePriceThird = document.getElementById('havePriceSecondThree').value;
            let spanF = `<span class="value-of-calc-data">`;
            let spanE = `</span>`;
            summaryCalc.style.padding = '10px';
            summaryCalc.innerHTML = `Grupa taryfowa: ${spanF}${this.name}${spanE}, <br>Umowa kończy się: ${spanF}${endOfAgreement.value}${spanE}, <br>Klient posiada aktualnie ceny: I strefa: ${spanF}${havePriceFirst}${spanE} II strefa: ${spanF}${havePriceSecond}${spanE} II strefa: ${spanF}${havePriceThird}${spanE}<br>Zużycie roczne: <span class ="value-of-calc-data">${this.wearThreeSpheresSum}</span> MWh. <br>Propozycja cenowa: I strefa: ${spanF}${this.proposeThreeSpheresFirst}${spanE} II strefa: ${spanF}${this.proposeThreeSpheresSecond}${spanE} II strefa: ${spanF}${this.proposeThreeSpheresThird}${spanE}, <br>Masa marży: ~ <span class ="value-of-calc-data marge-mass-span">${this.margeMass}</span>`;
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
        } else if (this.numberOfSpheres === 3) {
            this.calcThreeSpheres();
        }
        this.createNote();


    }

}

//fragment zabezpieczenie przed wyborem C11 i specjal top



const productSelected = document.getElementById('product');
const tariffSelect = document.getElementById('tariff');
const endOfAgreementSelect = document.getElementById('endOfNewAgreement');

const secureintakeOneSphere = document.querySelector('.intakec11c21');
const secureintakeTwoSpheres = document.querySelector('.intakec12ac12b');
const secureintakeThreeSpheres = document.querySelector('.intakec23b23');
const securepropositionC11C21 = document.querySelector('.propositionc11c21');
const securepropositionC12aC12b = document.querySelector('.propositionc12ac12b');
const securepropositionC23B23 = document.querySelector('.propositionc23b23');
const securehavePricesc23b23 = document.querySelector('.havePricesc23b23');
const securehavePricesC12x = document.querySelector('.havePricesc12ac12b');
const securehavePricesC11 = document.querySelector('.have-prices-c11');

productSelected.addEventListener('change', (e) => {
    if (e.target.value === 'SPECJAL TOP') {
        endOfAgreementSelect.innerHTML = `<option class="option-2022" value="2025">2025</option><option class="option-2022" value="2024">2024</option><option class="option-2022" value="2023">2023</option><option class="option-2022" value="2022">2022</option><option class="option-2021" value="2021">2021</option>`;
        tariffSelect.innerHTML = `<option value="C21">C21</option><option value="C22a">C22a</option><option value="C22b">C22b </option><option value="C23">C23</option><option value="B21">B21</option><option value="B22">B22</option><option value="B23">B23</option>`;
        endOfAgreementSelect.value = '2025';
        tariffSelect.value = 'C21';
        tariffCalcFlag = 3;
        secureintakeThreeSpheres.style.display = "none";
        secureintakeTwoSpheres.style.display = "none";
        secureintakeOneSphere.style.display = "block";
        securepropositionC11C21.style.display = "block";
        securepropositionC23B23.style.display = "none";
        securepropositionC12aC12b.style.display = "none";
        securehavePricesC12x.style.display = "none";
        securehavePricesc23b23.style.display = "none";
        securehavePricesC11.style.display = "block";

        (() => {
            const allTariffNames = ['c11', 'c12a', 'c12b', 'c21', 'c22a', 'c22b', 'c23', 'b21', 'b22', 'b23', 'b11', 'g11', 'g12', 'g12w'];
            allTariffNames.forEach(tariffName => {
                document.querySelector(`.tariff${tariffName}-wrapper`).style.display = "none";
            });
            document.querySelector(`.tariffc21-wrapper`).style.display = "block";

        })()

    } else {
        endOfAgreementSelect.innerHTML = `<option class="option-2022" value="2026">2026</option><option class="option-2022" value="2025">2025</option><option class="option-2022" value="2024">2024</option><option class="option-2022" value="2023">2023</option><option class="option-2022" value="2022">2022</option><option class="option-2021" value="2021">2021</option>`;
        tariffSelect.innerHTML = `<option value="C11">C11</option><option value="C12a">C12a</option><option value="C12b">C12b</option><option value="C21">C21</option><option value="C22a">C22a</option><option value="C22b">C22b </option><option value="C23">C23</option><option value="B21">B21</option><option value="B22">B22</option><option value="B23">B23</option><option value="G11">G11</option><option value="G12">G12</option>`;
        secureintakeThreeSpheres.style.display = "none";
        secureintakeTwoSpheres.style.display = "none";
        secureintakeOneSphere.style.display = "block";
        securepropositionC11C21.style.display = "block";
        securepropositionC23B23.style.display = "none";
        securepropositionC12aC12b.style.display = "none";
        securehavePricesC12x.style.display = "none";
        securehavePricesc23b23.style.display = "none";
        securehavePricesC11.style.display = "block";
        endOfAgreementSelect.value = '2026';
        tariffSelect.value = 'C11';
        tariffCalcFlag = 0;
        (() => {
            const allTariffNames = ['c11', 'c12a', 'c12b', 'c21', 'c22a', 'c22b', 'c23', 'b21', 'b22', 'b23', 'b11', 'g11', 'g12', 'g12w'];
            allTariffNames.forEach(tariffName => {
                document.querySelector(`.tariff${tariffName}-wrapper`).style.display = "none";
            });
            document.querySelector(`.tariffc11-wrapper`).style.display = "block";

        })()
    }
})

//koniec fragment zabezpieczenie przed wyborem C11 i specjal top


const c11Engine = new Tariff(1, 0, 'C11');
const c12aEngine = new Tariff(2, 1, 'C12a');
const c12bEngine = new Tariff(2, 2, 'C12b');
const c21Engine = new Tariff(1, 3, 'C21');
const c22aEngine = new Tariff(2, 4, 'C22a');
const c22bEngine = new Tariff(2, 5, 'C22b');
const c23Engine = new Tariff(3, 12, 'C23');
const b21Engine = new Tariff(1, 6, 'B21');
const b22Engine = new Tariff(2, 7, 'B22');
const b23Engine = new Tariff(3, 13, 'B23');
const g11Engine = new Tariff(1, 9, 'G11');
const g12Engine = new Tariff(2, 10, 'G12');
const g12wEngine = new Tariff(2, 11, 'G12w');