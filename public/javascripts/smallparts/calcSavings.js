// funkcja usuwająca przecinki z wartości

function savingsReplaceAndParseFn(item) {
    return parseFloat(item.replace(/\,/g, '.'));
};



// deklaruje zmienne, które mi są potrzebne globalnie

let savingsWearOneSphere, savingsWearFirstSphere, savingsWearSecondSphere, savingsClientPriceOneSphere, savingsClientPriceAvr, savingsClientPriceFirst, savingsClientPriceSecond;
let savingsPropositionOnesphere, savingsPropositionFirstSphere, savingsPropositionSecondSphere, savingsPropositionAvr;
let savingsTradeFee, savingsTariffName;
let savingsSummary;

// funkcja pobierająca najświeższe dane 

function savingsGetActualData() {



    //zużycia dla jednostrefowej i dwustrefowej
    savingsWearOneSphere = savingsReplaceAndParseFn(document.getElementById('wear').value);
    savingsWearFirstSphere = savingsReplaceAndParseFn(document.getElementById('wearFirst').value);
    savingsWearSecondSphere = savingsReplaceAndParseFn(document.getElementById('wearSecond').value);

    //ceny klienta dla jednostefowej, dwustrefowej i na płasko

    savingsClientPriceOneSphere = savingsReplaceAndParseFn(document.getElementById('priceNow').value);
    savingsClientPriceAvr = savingsReplaceAndParseFn(document.getElementById('havePriceAvr').value);
    savingsClientPriceFirst = savingsReplaceAndParseFn(document.getElementById('havePriceFirst').value);
    savingsClientPriceSecond = savingsReplaceAndParseFn(document.getElementById('havePriceSecond').value);

    //propozycje dla klienta dla jednostrefowej, dwustefowej i na płasko

    savingsPropositionOnesphere = savingsReplaceAndParseFn(document.getElementById('proposePrice').value);
    savingsPropositionFirstSphere = savingsReplaceAndParseFn(document.getElementById('proposePriceFirst').value);
    savingsPropositionSecondSphere = savingsReplaceAndParseFn(document.getElementById('proposePriceSecond').value);
    savingsPropositionAvr = savingsReplaceAndParseFn(document.getElementById('proposePriceAvr').value);


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

    // wylicze oszczędności na prądzie

    //ustawiam zależność od tego czy jest to dwustrefowa czy jednostrefowa

    if (savingsTariffName[2] === "1") {
        // wyliczenia dla taryfy jednostefowej
        const savingsForOneSphereTarriff = ((savingsClientPriceOneSphere - savingsPropositionOnesphere) * savingsWearOneSphere).toFixed(2);
        const actualNote = savingsSummary.innerHTML;
        savingsSummary.innerHTML = actualNote + `<div class="savings-note"><p class="savings-note__par">Klient oszczędzi na opłacie handlowej:  <span>${savingsTradeFeeAnnual}.</span></p><p class="savings-par">Dodatkowo na prądzie:  <span>${savingsForOneSphereTarriff}</span></p><p class="savings-par">Oszczędności suma:  <span>${Number(savingsForOneSphereTarriff) + Number(savingsTradeFeeAnnual)}</span></p></div>`


    } else {
        //wyliczenia dla taryfy dwustefowej
        if (onePriceFlag === 0) {
            const savinfsForTwoSpheresTarriff = (((savingsClientPriceFirst - savingsPropositionFirstSphere) * savingsWearFirstSphere) + ((savingsClientPriceSecond - savingsPropositionSecondSphere) * savingsWearSecondSphere)).toFixed(2);
            const actualNote = savingsSummary.innerHTML;
            savingsSummary.innerHTML = actualNote + `<div class="savings-note"><p class="savings-note__par">Klient oszczędzi na opłacie handlowej:  <span>${savingsTradeFeeAnnual}.</span></p><p class="savings-par">Dodatkowo na prądzie:  <span>${savinfsForTwoSpheresTarriff}</span></p><p class="savings-par">Oszczędności suma:  <span>${Number(savinfsForTwoSpheresTarriff) + Number(savingsTradeFeeAnnual)}</span></p></div>`
        } else {
            const savinfsForTwoSpheresTarriffAvr = ((savingsClientPriceAvr - savingsPropositionAvr) * (savingsWearFirstSphere + savingsWearSecondSphere)).toFixed(2);
            const actualNote = savingsSummary.innerHTML;
            savingsSummary.innerHTML = actualNote + `<div class="savings-note"><p class="savings-note__par">Klient oszczędzi na opłacie handlowej:  <span>${savingsTradeFeeAnnual}.</span></p><p class="savings-par">Dodatkowo na prądzie:  <span>${savinfsForTwoSpheresTarriffAvr}</span></p><p class="savings-par">Oszczędności suma:  <span>${Number(savinfsForTwoSpheresTarriffAvr) + Number(savingsTradeFeeAnnual)}</span></p></div>`
        }



    }


})