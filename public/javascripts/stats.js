const allCases = [...document.querySelectorAll('span.case-name')];


allCases.forEach(name => {
    name.addEventListener('mouseover', (e) => {
        const nameClass = e.toElement.classList[1];
        const descriptionToShow = document.querySelector(`[data-show=${nameClass}]`);
        descriptionToShow.style.display = "block";
    })
    name.addEventListener('mouseout', () => {
        const descriptionsToHide = [...document.querySelectorAll("[data-show]")];
        console.log(descriptionsToHide);
        descriptionsToHide.forEach(description => {
            description.style.display = "none";
        })
    })
})