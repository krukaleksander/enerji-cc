const formPost = document.querySelector('.post-news')
document.querySelector('.btn-add-post').addEventListener('click', () => {
    formPost.classList.add('active');
});
document.querySelector('.btn-cancel-post').addEventListener('click', () => {
    formPost.classList.remove('active');
});