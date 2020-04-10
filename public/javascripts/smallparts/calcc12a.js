let tariffSelected, priceC12a2022, priceC12a2021, priceC12a2020;
let margeMassC12aAvr, margeMassC12aSum;
let margeMassForNote = 0;
const replaceAndParseMainFn = (item) => {
    return parseFloat(item.replace(/\,/g, '.'));
};

const getPricesForC12a = () => {
    tariffSelected = (document.getElementById('tariff')).value;
    priceC12a2022 = {
        avr: replaceAndParseMainFn(document.getElementById('priceC12a2022Avr').value),
        first: replaceAndParseMainFn(document.getElementById('priceC12a2022First').value),
        second: replaceAndParseMainFn(document.getElementById('priceC12a2022Second').value)
    };
    priceC12a2021 = {
        avr: replaceAndParseMainFn(document.getElementById('priceC12a2021Avr').value),
        first: replaceAndParseMainFn(document.getElementById('priceC12a2021First').value),
        second: replaceAndParseMainFn(document.getElementById('priceC12a2021Second').value)
    };
    priceC12a2020 = {
        avr: replaceAndParseMainFn(document.getElementById('priceC12a2020Avr').value),
        first: replaceAndParseMainFn(document.getElementById('priceC12a2020First').value),
        second: replaceAndParseMainFn(document.getElementById('priceC12a2020Second').value)
    };
    getElementsForC12x()
};

const calcAvrC12a = () => {
    getActualValuesFn();
    const money2022 = (proposeAvr - priceC12a2022.avr) * wearSum.value;
    const money2021 = (proposeAvr - priceC12a2021.avr) * wearSum.value * countsPrice2021;
    const money2020 = (proposeAvr - priceC12a2020.avr) * wearSum.value * countsPrice2020;
    margeMassC12aAvr = (money2022 + money2021 + money2020).toFixed(2);
    margeMassForNote = margeMassC12aAvr;
}

const calcBothC12a = () => {
    getActualValuesFn();
    const money2022 = ((proposeFirst - priceC12a2022.first) * wearFirst) + ((proposeSecond - priceC12a2022.second) * wearSecond);
    const money2021 = (((proposeFirst - priceC12a2021.first) * wearFirst) + ((proposeSecond - priceC12a2021.second) * wearSecond)) * countsPrice2021;
    const money2020 = (((proposeFirst - priceC12a2020.first) * wearFirst) + ((proposeSecond - priceC12a2020.second) * wearSecond)) * countsPrice2020;
    margeMassC12aSum = (money2022 + money2021 + money2020).toFixed(2);
    margeMassForNote = margeMassC12aSum;
}
const calcc12a = () => {

    getPricesForC12a();
    if (onePriceFlag === 1) {
        calcAvrC12a();
    } else {
        calcBothC12a();
    }
    let spanF = `<span class="value-of-calc-data">`;
    let spanE = `</span>`;
    let yearOfEnd = endOfAgreement.value === "9999" ? 2019 : endOfAgreement.value;
    message = `Grupa taryfowa: ${spanF}${tariff.value}${spanE}, <br>Umowa kończy się: ${spanF}${yearOfEnd}${spanE}, <br>Klient posiada aktualnie ceny: Średnia: ${spanF}${haveAvr}${spanE} I strefa: ${spanF}${haveFirst}${spanE} II strefa: ${spanF}${haveSecond}${spanE}, <br>Ceny w cenniku na 2022 dla taryfy ${spanF}${tariff.value}${spanE}: Średnia: ${spanF}${priceC12a2022.avr}${spanE} I strefa ${spanF}${priceC12a2022.first}${spanE} II strefa: ${spanF}${priceC12a2022.second}${spanE}, <br>Zużycie roczne: <span class ="value-of-calc-data">${wearSum.value}</span> MWh. <br>Propozycja cenowa: Średnia: ${spanE}${proposeAvr}${spanE} I strefa: ${spanF}${proposeFirst}${spanE} II strefa: ${spanF}${proposeSecond}${spanE}, <br>Masa marży: ~ <span class ="value-of-calc-data marge-mass-span">${margeMassForNote}</span><br>Osoba kontaktowa:`;
    complexSummaryFn(message);


};



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
            console.log(this.margeMass);
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