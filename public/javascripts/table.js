closeSessionDiv = document.querySelector('.confirm-close-session');
closeSessionDivWeek = document.querySelector('.confirm-close-session-week');
closeSessionDivMonth = document.querySelector('.confirm-close-session-month');
profileBtns = [...document.querySelectorAll('span.profile')];
document.getElementById('close-session-btn').addEventListener('click', () => {
    closeSessionDiv.classList.add('active');
});
document.querySelector('.close-session.no').addEventListener('click', () => {
    closeSessionDiv.classList.remove("active");
});


document.getElementById('close-session-btn-week').addEventListener('click', () => {
    closeSessionDivWeek.classList.add('active');
});
document.querySelector('.close-session-week.no').addEventListener('click', () => {
    closeSessionDivWeek.classList.remove("active");
});
document.getElementById('close-session-btn-month').addEventListener('click', () => {
    closeSessionDivMonth.classList.add('active');
});
document.querySelector('.close-session-month.no').addEventListener('click', () => {
    closeSessionDivMonth.classList.remove('active');
})
profileBtns.forEach(e => {
    e.addEventListener('click', () => {
        // console.log(e.id);
    })
})