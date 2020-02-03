const loginWrapper = document.querySelector('div.login-wrapper');
const tableWrapper = document.querySelector('div.table-wrapper');
const person = [...document.querySelectorAll('div.person')];
const tablesDown = [...document.querySelectorAll('div.table-dark')];
const churchWrapper = document.querySelector('div.church-wrap');
const tableChurch = document.querySelector('.table-dark');
const parChurch = document.querySelector('.church-desc');
const working = [...document.querySelectorAll('.working')];
const bellImg = document.querySelector('div.bell');
const femaleLink = document.querySelector('li.female-link');
const maleLink = document.querySelector('li.male-link');
const christmasLink = document.querySelector('li.christmas-link');
const arrowMotive = document.querySelector('.arrow-motive');
const changeMotiveDiv = document.querySelector('.change-motive');
let flagMotive = true;

arrowMotive.addEventListener('click', () => {
    if (flagMotive) {
        arrowMotive.classList.add('active');
        changeMotiveDiv.classList.add('active');
        flagMotive = false;
    } else {
        arrowMotive.classList.remove('active');
        changeMotiveDiv.classList.remove('active');
        flagMotive = true;
    }

})

const changeMotive = (motive) => {
    localStorage.setItem('motive', motive);
}
const changeFn = () => {
    if (loginWrapper != null) {
        loginWrapper.classList.add('male');
    }
    if (tableWrapper != null) {
        tableWrapper.classList.add('male');
        person.forEach(e => {
            e.classList.add('male');
        });
        tablesDown.forEach(e => {
            e.classList.add('male');
        });
        bellImg.style.display = 'none';
    }
    if (churchWrapper != null) {
        churchWrapper.classList.add('male');
        tableChurch.classList.add('male');
        parChurch.classList.add('male');
        working.forEach(e => {
            e.classList.add('male');
        });

    }

}
if (window.localStorage.motive === undefined) {
    window.localStorage.setItem('motive', 'unset');
}

if (window.localStorage.motive === "male") {
    document.body.style.backgroundImage = "url(../images/malebg.jpg)";
    changeFn();


} else if (window.localStorage.motive === "female") {
    document.body.style.backgroundImage = "url(../images/femalebg.jpg)";
    changeFn();
}
femaleLink.addEventListener('click', () => {
    changeMotive('female');
})
maleLink.addEventListener('click', () => {
    changeMotive('male');
})
christmasLink.addEventListener('click', () => {
    changeMotive('unset');
})