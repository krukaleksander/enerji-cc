(() => {
    const container = document.querySelector('.know-how');
    document.getElementById('showKnowHow').addEventListener('click', () => {
        container.style.display = 'block';
    });
    document.getElementById('hideKnowHow').addEventListener('click', () => container.style.display = 'none');
})()