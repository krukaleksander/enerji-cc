// funkcja usuwająca przecinki z wartości

function savingsReplaceAndParseFn(item) {
    return parseFloat(item.replace(/\,/g, '.'));
};



// deklaruje zmienne, które mi są potrzebne globalnie

let savingsWearOneSphere, savingsWearFirstSphere, savingsWearSecondSphere, savingsClientPriceOneSphere, savingsClientPriceFirst, savingsClientPriceSecond;
let savingsWearThreeFirstSphere, savingsWearThreeSecondSphere, savingsWearThreeThirdSphere;
let savingsPropositionThreeFirstSphere, savingsPropositionThreeSecondSphere, savingsPropositionThreeThirdSphere;
let savingsClientPriceThreeFirst, savingsClientPriceThreeSecond, savingsClientPriceThreeThird;
let savingsTradeFee, savingsTariffName;
let savingsSummary;
let differanceInOh;

// funkcja pobierająca najświeższe dane 

function savingsGetActualData() {



    //zużycia dla jednostrefowej, dwustrefowej i trzystrefowej
    savingsWearOneSphere = savingsReplaceAndParseFn(document.getElementById('wear').value);
    savingsWearFirstSphere = savingsReplaceAndParseFn(document.getElementById('wearFirst').value);
    savingsWearSecondSphere = savingsReplaceAndParseFn(document.getElementById('wearSecond').value);

    savingsWearThreeFirstSphere = savingsReplaceAndParseFn(document.getElementById('wearFirstThreeSpheres').value);
    savingsWearThreeSecondSphere = savingsReplaceAndParseFn(document.getElementById('wearSecondThreeSpheres').value);
    savingsWearThreeThirdSphere = savingsReplaceAndParseFn(document.getElementById('wearThirdThreeSpheres').value);

    //ceny klienta dla jednostefowej, dwustrefowej i trzystrefowej

    savingsClientPriceOneSphere = savingsReplaceAndParseFn(document.getElementById('priceNow').value);
    savingsClientPriceFirst = savingsReplaceAndParseFn(document.getElementById('havePriceFirst').value);
    savingsClientPriceSecond = savingsReplaceAndParseFn(document.getElementById('havePriceSecond').value);

    savingsClientPriceThreeFirst = savingsReplaceAndParseFn(document.getElementById('havePriceFirstThree').value);
    savingsClientPriceThreeSecond = savingsReplaceAndParseFn(document.getElementById('havePriceSecondThree').value);
    savingsClientPriceThreeThird = savingsReplaceAndParseFn(document.getElementById('havePriceThirdThree').value);


    //propozycje dla klienta dla jednostrefowej, dwustefowej, trzystrefowej

    savingsPropositionOnesphere = savingsReplaceAndParseFn(document.getElementById('proposePrice').value);
    savingsPropositionFirstSphere = savingsReplaceAndParseFn(document.getElementById('proposePriceFirst').value);
    savingsPropositionSecondSphere = savingsReplaceAndParseFn(document.getElementById('proposePriceSecond').value);

    savingsPropositionThreeFirstSphere = savingsReplaceAndParseFn(document.getElementById('proposePriceFirstThreeSpheres').value);
    savingsPropositionThreeSecondSphere = savingsReplaceAndParseFn(document.getElementById('proposePriceSecondThreeSpheres').value);
    savingsPropositionThreeThirdSphere = savingsReplaceAndParseFn(document.getElementById('proposePriceThirdThreeSpheres').value);


    //pobieram opłatę handlową

    savingsTradeFee = savingsReplaceAndParseFn(document.getElementById('tradeFee').value);


    // pobieram nazwę taryfy aby sprawdzić czy mam do czynienia z jedną czy też dwu strefową

    savingsTariffName = document.getElementById('tariff').value;

    // pobieram podsumowanie 

    savingsSummary = document.getElementById('summaryCalc');

}

//pobieram button 

const savingsCalcBtn = document.getElementById('activeCalcSavings');



// główna funkcja owijająca nastawiona na kliknięcie guzika

savingsCalcBtn.addEventListener('click', function () {

    //pobieram aktualne dane
    savingsGetActualData();
    //oblicza oszczędność z opłaty handlowej
    const savingsTradeFeeAnnual = (Number(savingsTradeFee) * 12).toFixed(2);

    // jeżeli notatka o oszczędnościach istnieje to ją usuwam zanim dodam nową

    savingsSummary.innerHTML = doNotDoubleSavings(savingsSummary.innerHTML);

    // wylicze oszczędności na prądzie

    //ustawiam zależność od tego czy jest to dwustrefowa czy jednostrefowa

    if (savingsTariffName[2] === "1") {
        // wyliczenia dla taryfy jednostefowej 
        differanceInOh = (Number(document.getElementById('tradeFee').value)) - (Number(document.getElementById('tradeFeeOur').value));
        const savingsForOneSphereTarriff = ((savingsClientPriceOneSphere - savingsPropositionOnesphere) * savingsWearOneSphere).toFixed(2);
        const actualNote = savingsSummary.innerHTML;
        savingsSummary.innerHTML = actualNote + `<div class="savings-note"><p class="savings-note__par">Klient oszczędzi na opłacie handlowej:  <span>${differanceInOh * 12}.</span></p><p class="savings-par">Dodatkowo na prądzie:  <span>${savingsForOneSphereTarriff}</span></p><p class="savings-par">Oszczędności suma:  <span>${Number(savingsForOneSphereTarriff) + Number(differanceInOh * 12)}</span></p></div>`


    } else if (savingsTariffName[2] === "2") {
        //wyliczenia dla taryfy dwustefowej
        differanceInOh = (Number(document.getElementById('tradeFee').value)) - (Number(document.getElementById('tradeFeeOur').value));
        const savinfsForTwoSpheresTarriff = (((savingsClientPriceFirst - savingsPropositionFirstSphere) * savingsWearFirstSphere) + ((savingsClientPriceSecond - savingsPropositionSecondSphere) * savingsWearSecondSphere)).toFixed(2);
        const actualNote = savingsSummary.innerHTML;
        savingsSummary.innerHTML = actualNote + `<div class="savings-note"><p class="savings-note__par">Klient oszczędzi na opłacie handlowej:  <span>${differanceInOh * 12}.</span></p><p class="savings-par">Dodatkowo na prądzie:  <span>${savinfsForTwoSpheresTarriff}</span></p><p class="savings-par">Oszczędności suma:  <span>${Number(savinfsForTwoSpheresTarriff) + Number(differanceInOh * 12)}</span></p></div>`

        // const savinfsForTwoSpheresTarriffAvr = ((savingsClientPriceAvr - savingsPropositionAvr) * (savingsWearFirstSphere + savingsWearSecondSphere)).toFixed(2);
        // const actualNote = savingsSummary.innerHTML;
        // savingsSummary.innerHTML = actualNote + `<div class="savings-note"><p class="savings-note__par">Klient oszczędzi na opłacie handlowej:  <span>${savingsTradeFeeAnnual}.</span></p><p class="savings-par">Dodatkowo na prądzie:  <span>${savinfsForTwoSpheresTarriffAvr}</span></p><p class="savings-par">Oszczędności suma:  <span>${Number(savinfsForTwoSpheresTarriffAvr) + Number(savingsTradeFeeAnnual)}</span></p></div>`




    } else {
        // wyliczenia dla taryfy trzystrefowej
        differanceInOh = (Number(document.getElementById('tradeFee').value)) - (Number(document.getElementById('tradeFeeOur').value));

        const savinfsForThreeSpheresTarriff = (((savingsClientPriceThreeFirst - savingsPropositionThreeFirstSphere) * savingsWearThreeFirstSphere) + ((savingsClientPriceThreeSecond - savingsPropositionThreeSecondSphere) * savingsWearThreeSecondSphere) + ((savingsClientPriceThreeThird - savingsPropositionThreeThirdSphere) * savingsWearThreeThirdSphere)).toFixed(2);
        const actualNote = savingsSummary.innerHTML;
        savingsSummary.innerHTML = actualNote + `<div class="savings-note"><p class="savings-note__par">Klient oszczędzi na opłacie handlowej:  <span>${differanceInOh * 12}.</span></p><p class="savings-par">Dodatkowo na prądzie:  <span>${savinfsForThreeSpheresTarriff}</span></p><p class="savings-par">Oszczędności suma:  <span>${Number(savinfsForThreeSpheresTarriff) + Number(differanceInOh * 12)}</span></p></div>`
    }


});

// funkcja ma za zadanie przeciwdzaiłać dublowaniu sie paragrafów z wyliczeniem oszczędności.
function doNotDoubleSavings(note) {
    //wyszukuje index klasy i odejmuje 12 znaków aby wycinać cały fragment kodu
    const indexOfParClass = note.indexOf('savings-note') - 12;
    if (indexOfParClass != -13) {
        // wycinam notatkę od początku notatatki do początku wyliczenia oszczędności
        const pureNote = note.slice(0, indexOfParClass);
        // zwracam czystą notatkę bez wstawki
        return pureNote;

    } else {
        return note;
    }

}