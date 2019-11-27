console.log('działam!');
let flag = true;
let mainNav = document.querySelector("nav.main-nav");
let navTrigger = document.querySelector('div.menu-mobile i');
document.querySelector('div.menu-mobile').addEventListener('click', () => {
    if (flag) {
        mainNav.style.top = "0px";
        navTrigger.classList.add('active');
        flag = false;
    } else if (!flag) {
        mainNav.style.top = "-400px"
        navTrigger.classList.remove("active");
        flag = true;
    }
})