const christmas = new Date(2019, 11, 24);
const party = new Date(2019, 11, 6, 17, 0, 0, 0);
const today = new Date();
const timeToChristmas = christmas - today;
const timeToParty = party - today;
const daysToChristmas = Math.floor(timeToChristmas / 86400000);
const hoursToChristmas = Math.floor((timeToChristmas - (daysToChristmas * 86400000)) / 3600000);
const minutesToChristmas = Math.floor((timeToChristmas - (daysToChristmas * 86400000) - (hoursToChristmas * 3600000)) / 60000);
const daysToParty = Math.floor(timeToParty / 86400000);
const hoursToParty = Math.floor((timeToParty - (daysToParty * 86400000)) / 3600000);
const minutesToParty = Math.floor((timeToParty - (daysToParty * 86400000) - (hoursToParty * 3600000)) / 60000);

// impreza

document.querySelector('.days-party').innerText = ` ${daysToParty} dni`;
document.querySelector('.hours-party').innerText = ` ${hoursToParty}H`;
document.querySelector('.minutes-party').innerText = ` ${minutesToParty}min`;

//  święta

document.querySelector('.days-christmas').innerText = ` ${daysToChristmas} dni`;
document.querySelector('.hours-christmas').innerText = ` ${hoursToChristmas}H`;
document.querySelector('.minutes-christmas').innerText = ` ${minutesToChristmas}min`;