(() => {
    //pokazywanie / chowanie kreta
    const kret = document.querySelector('.kret');

    window.addEventListener('keydown', (e) => {
        if (e.keyCode === 107) {
            kret.style.display = 'flex';
        }
        if (e.keyCode === 27) {
            kret.style.display = 'none';
        }
    })
    // koniec pokazywanie / chowanie kreta

    const btn = document.querySelector('.kret__btn');

    btn.addEventListener('click', (e) => {
        // e.preventDefault();
        console.log('klikam');
    });
})()