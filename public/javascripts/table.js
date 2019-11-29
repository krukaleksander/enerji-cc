closeSessionDiv = document.querySelector('.confirm-close-session');

document.getElementById('close-session-btn').addEventListener('click', () => {
    closeSessionDiv.classList.add('active');
});
document.querySelector('.close-session.no').addEventListener('click', () => {
    closeSessionDiv.classList.remove("active");
})