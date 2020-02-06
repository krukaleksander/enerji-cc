const allCases = [...document.querySelectorAll('span.case-name')];


allCases.forEach(name => {
    name.addEventListener('mouseover', (e) => {
        const nameClass = e.toElement.classList[1];
        const descriptionToShow = document.querySelector(`[data-show=${nameClass}]`);
        descriptionToShow.style.display = "block";
    })
    name.addEventListener('mouseout', () => {
        const descriptionsToHide = [...document.querySelectorAll("[data-show]")];
        descriptionsToHide.forEach(description => {
            description.style.display = "none";
        })
    })
})

// fetch('https://jsonplaceholder.typicode.com/users')
//     .then(response => response.json())
//     .then(response => {
//         console.log(response)
//     });

// const addForm = document.querySelector('form.add-form');
// addForm.addEventListener('submit', function (e) {
//     e.preventDefault()
//     console.log(e.target.action);
//     const formData = new FormData();
//     formData.append('name', 'name')
//     fetch('http://localhost:5000/stats/add', {
//         method: "get",
//     })

// })
const fetchData = () => {
    fetch(`${document.URL}/add`)
        .then(response => response.json())
        .then(response => {
            console.log(response)
        })
}