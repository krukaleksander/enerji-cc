var price = ``;

// jednostrefowa

var priceOk = price.replace(/[^0-9]/g, '')

function fixPricesOneSphere(price) {
    function addComa(text) {
        return `${text.slice(0,3)},${text.slice(3)}`
    };
    return `
    "price2021": "${addComa(price.slice(0,5))}",
        "price2022": "${addComa(price.slice(5,10))}",
        "price2023": "${addComa(price.slice(10,15))}",
        "price2024": "${addComa(price.slice(15,20))}",
        "price2025": "${addComa(price.slice(20,25))}",
        "price2026": "${addComa(price.slice(25,30))}",
        "ohe": "${price.slice(30, 32)}",
        "oh": "${price.slice(32)}"
    `
}

fixPricesOneSphere(priceOk)

// dwustrefowa

var price = ``;

var priceOk = price.replace(/[^0-9]/g, '')

function fixPricesTwoSphere(price) {

    function addComa(text) {
        return `${text.slice(0,3)},${text.slice(3)}`
    };
    return `
    "price2021": ["${addComa(price.slice(0,5))}", "${addComa(price.slice(5,10))}"],
        "price2022": ["${addComa(price.slice(10,15))}", "${addComa(price.slice(15,20))}"],
        "price2023": ["${addComa(price.slice(20,25))}", "${addComa(price.slice(25,30))}"],
        "price2024": ["${addComa(price.slice(30,35))}", "${addComa(price.slice(35,40))}"],
        "price2025": ["${addComa(price.slice(40,45))}", "${addComa(price.slice(45,50))}"],
        "price2026": ["${addComa(price.slice(50,55))}", "${addComa(price.slice(55,60))}"],
        "ohe": "${price.slice(60, 62)}",
        "oh": "${price.slice(62)}"
    `
}

fixPricesTwoSphere(priceOk)

// trzystrefowa

var price = ``;

var priceOk = price.replace(/[^0-9]/g, '')

function fixPricesThreeSphere(price) {

    function addComa(text) {
        return `${text.slice(0,3)},${text.slice(3)}`
    };
    return `
    "price2021": ["${addComa(price.slice(0,5))}", "${addComa(price.slice(5,10))}", "${addComa(price.slice(10,15))}"],
        "price2022": ["${addComa(price.slice(15,20))}", "${addComa(price.slice(20,25))}", "${addComa(price.slice(25,30))}"],
        "price2023": ["${addComa(price.slice(30,35))}", "${addComa(price.slice(35,40))}", "${addComa(price.slice(40,45))}"],
        "price2024": ["${addComa(price.slice(45,50))}", "${addComa(price.slice(50,55))}", "${addComa(price.slice(55,60))}"],
        "price2025": ["${addComa(price.slice(60,65))}", "${addComa(price.slice(65,70))}", "${addComa(price.slice(70,75))}"],
        "price2026": ["${addComa(price.slice(75,80))}", "${addComa(price.slice(80,85))}", "${addComa(price.slice(85,90))}"],
        "ohe": "${price.slice(90,92)}",
        "oh": "${price.slice(92)}"
    `
}

fixPricesThreeSphere(priceOk)