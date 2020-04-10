class Tariff {
    constructor(numberOfSpheres, indexOfData) {
        this.numberOfSpheres = numberOfSpheres;
        this.indexOfData = indexOfData;
        this.pricesFromDbDone = this.getPricesFromDb();

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
    getWear = () => {
        if (this.numberOfSpheres === 1) {
            this.wearOneSphere = replaceAndParseMainFn(document.getElementById('wear').value);
        } else if (this.numberOfSpheres === 2) {
            this.weareTwoSpeheresFirst = replaceAndParseMainFn(document.getElementById('wearFirst').value);
            this.weareTwoSpeheresSecond = replaceAndParseMainFn(document.getElementById('wearSecond').value);
            this.wearTwoSpheresSum = this.weareTwoSpeheresFirst + this.weareTwoSpeheresSecond;
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
        this.margeMass = Math.floor(((this.proposeOneSphere - replaceAndParseMainFn(this.pricesFromDb.tariff.price2022)) * this.wearOneSphere) + ((this.proposeOneSphere - replaceAndParseMainFn(this.pricesFromDb.tariff.price2021)) * this.wearOneSphere * countsPrice2021) + ((this.proposeOneSphere - replaceAndParseMainFn(this.pricesFromDb.tariff.price2020)) * this.wearOneSphere * countsPrice2020));
    };
    calcTwoSpheres = () => {
        if (onePriceFlag === 1) {
            const money2022 = (this.proposeTwoSpheresAvr - replaceAndParseMainFn(this.pricesFromDb.tariff.price2022.avr)) * this.wearTwoSpheresSum;
            const money2021 = (this.proposeTwoSpheresAvr - replaceAndParseMainFn(this.pricesFromDb.tariff.price2021.avr)) * this.wearTwoSpheresSum * countsPrice2021;
            const money2020 = (this.proposeTwoSpheresAvr - replaceAndParseMainFn(this.pricesFromDb.tariff.price2020.avr)) * this.wearTwoSpheresSum * countsPrice2020;
            this.margeMass = (money2022 + money2021 + money2020).toFixed(2);
            margeMassForNote = this.margeMass;

        } else {
            console.log('w podziale na strefy');
            const money2022 = ((this.proposeTwoSpheresFirst - replaceAndParseMainFn(this.pricesFromDb.tariff.price2022.first)) * this.weareTwoSpeheresFirst) + ((this.proposeTwoSpheresSecond - replaceAndParseMainFn(this.pricesFromDb.tariff.price2022.second)) * this.weareTwoSpeheresSecond);
            const money2021 = (((this.proposeTwoSpheresFirst - replaceAndParseMainFn(this.pricesFromDb.tariff.price2021.first)) * this.weareTwoSpeheresFirst) + ((this.proposeTwoSpheresSecond - replaceAndParseMainFn(this.pricesFromDb.tariff.price2021.second)) * this.weareTwoSpeheresSecond)) * countsPrice2021;
            const money2020 = (((this.proposeTwoSpheresFirst - replaceAndParseMainFn(this.pricesFromDb.tariff.price2020.first)) * this.weareTwoSpeheresFirst) + ((this.proposeTwoSpheresSecond - replaceAndParseMainFn(this.pricesFromDb.tariff.price2020.second)) * this.weareTwoSpeheresSecond)) * countsPrice2020;
            this.margeMass = (money2022 + money2021 + money2020).toFixed(2);
            margeMassForNote = this.margeMass;
        }
    }
    mainCalcFn = () => {
        this.getWear();
        this.getProposition();
        if (this.numberOfSpheres === 1) {
            this.calcOneSphere();
        } else if (this.numberOfSpheres === 2) {
            this.calcTwoSpheres();
        }


    }

}

const c11Engine = new Tariff(1, 0);
const c12aEngine = new Tariff(2, 1);
const c12bEngine = new Tariff(2, 2);