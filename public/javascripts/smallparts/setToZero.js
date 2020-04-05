(() => {
    const btn = document.getElementById('clearInputsBtn');
    const inputsToClear = [...document.getElementsByClassName('set-to-zero')];

    btn.addEventListener('click', () => {
        inputsToClear.forEach(input => {
            input.value = 0;
        })
    })
})()