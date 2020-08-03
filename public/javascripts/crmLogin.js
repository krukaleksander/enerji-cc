(function () {
    'use strict';
    const aboutProjectContainer = document.querySelector('.about-project');
    const showBtn = document.querySelector('.show-about-project');
    const closeBtn = document.querySelector('.about-project__close');

    showBtn.addEventListener('click', () => {
        aboutProjectContainer.style.display = 'flex';
    });
    closeBtn.addEventListener('click', () => {
        aboutProjectContainer.style.display = 'none';
    })
})()