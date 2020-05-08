(() => {
    const christmas = new Date(2020, 3, 12);
    const today = new Date();
    const timeToChristmas = christmas - today;
    const daysToChristmas = Math.floor(timeToChristmas / 86400000);
    const hoursToChristmas = Math.floor((timeToChristmas - (daysToChristmas * 86400000)) / 3600000);
    const minutesToChristmas = Math.floor((timeToChristmas - (daysToChristmas * 86400000) - (hoursToChristmas * 3600000)) / 60000);

    document.querySelector('.days-christmas').innerText = ` ${daysToChristmas} dni`;
    document.querySelector('.hours-christmas').innerText = ` ${hoursToChristmas}H`;
    document.querySelector('.minutes-christmas').innerHTML = ` ${minutesToChristmas}min <i class="fas fa-egg"></i>`;
    // <i class="fas fa-glass-cheers"></i>
})()