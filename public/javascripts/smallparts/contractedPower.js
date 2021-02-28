(() => {

    const container = document.querySelector('.contracted-power');
    const showBtn = document.getElementById('showCalcMwhs');
    const closeBtn = document.querySelector('.contracted-power__close');

    showBtn.addEventListener('click', () => {
        container.style.display = 'flex';
    });

    closeBtn.addEventListener('click', () => {
        container.style.display = 'none';
    })

    // część odpowiadająca za obliczenia
    const calcBtn = document.getElementById('btnCalcMwhs');
    calcBtn.addEventListener('click', () => {
        const b5 = 140;
        const c5 = 400;
        const d5 = 12;
        const e5 = 12;
        const f5 = 0.4;
        const mwhs = Number(document.querySelector('.contracted-power__input').value);
        const scoreParagraph = document.querySelector('.contracted-power__score');
        const score = (mwhs / b5) * c5 * (d5 / e5) * f5;
        if (score >= 0) {
            scoreParagraph.innerHTML = score;
        } else {
            scoreParagraph.innerHTML = 'Sprawdź co wpisujesz'
        }


    });

})()