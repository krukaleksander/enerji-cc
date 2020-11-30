(() => {
    const rippleBtns = [...document.querySelectorAll('.ripple-container__btn')];

    rippleBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {

            let x = e.clientX - e.target.offsetLeft;
            let y = e.clientY - e.target.offsetTop;

            let ripples = document.createElement('span');
            ripples.classList.add('ripple-container__ripple');
            ripples.style.left = x + 'px';
            ripples.style.top = y + 'px';
            console.log(this);
            this.appendChild(ripples);

            setTimeout(() => {
                ripples.remove();
            }, 1000)
        });
    });
})();