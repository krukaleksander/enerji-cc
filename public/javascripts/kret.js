(() => {
    //pokazywanie / chowanie kreta
    const kret = document.querySelector('.kret');
    let shiftFlag = false;
    let altFlag = false;
    const btnShowPrcies = document.querySelector('.show-price-change');
    window.addEventListener('keydown', (e) => {
        if (e.keyCode === 17) {
            shiftFlag = true;
        }
        if (e.keyCode === 16) {
            altFlag = true;
        }
        if (e.keyCode === 27) {
            kret.style.display = 'none';
            shiftFlag = false;
            altFlag = false;
        }
        if (shiftFlag && altFlag) kret.style.display = 'flex';
    })
    // koniec pokazywanie / chowanie kreta

    const btn = document.querySelector('.kret__btn');

    btn.addEventListener('click', (e) => {
        // e.preventDefault();
        console.log('klikam');
    });
})()