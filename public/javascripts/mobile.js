(() => {
    const showMenuBtn = document.querySelector('.menu-mobile');
    const navigation = document.querySelector('.main-nav');
    showMenuBtn.addEventListener('click', () => {
        navigation.classList.toggle('show');
    })
})();