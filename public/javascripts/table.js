closeSessionDiv = document.querySelector('.confirm-close-session');
closeSessionDivWeek = document.querySelector('.confirm-close-session-week');

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