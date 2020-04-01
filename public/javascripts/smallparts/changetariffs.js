(
    () => {
        const tariff = document.getElementById('tariff');
        const tariffC12a = document.querySelector('.tariffc12a-wrapper');
        const tariffC11 = document.querySelector('.tariffc11-wrapper');
        const tariffC12b = document.querySelector('.tariffc12b-wrapper');
        const tariffC21 = document.querySelector('.tariffc21-wrapper');
        const intakeOneSphere = document.querySelector('.intakec11c21');
        const intakeTwoSpheres = document.querySelector('.intakec12ac12b');

        let tariffsArr = [];
        tariff.addEventListener('change', () => {
            if (tariff.value === "C12a") {
                tariffsArr = [tariffC11, tariffC12b, tariffC21];
                tariffC12a.style.display = "block";
                intakeTwoSpheres.style.display = "block";
                intakeOneSphere.style.display = "none";
                tariffsArr.forEach(e => {
                    e.style.display = "none";
                });
            } else if (tariff.value === "C12b") {
                tariffsArr = [tariffC11, tariffC12a, tariffC21];
                tariffC12b.style.display = "block";
                intakeTwoSpheres.style.display = "block";
                intakeOneSphere.style.display = "none";
                tariffsArr.forEach(e => {
                    e.style.display = "none";
                });
            } else if (tariff.value === "C21") {
                tariffsArr = [tariffC11, tariffC12b, tariffC12a];
                tariffC21.style.display = "block";
                intakeTwoSpheres.style.display = "none";
                intakeOneSphere.style.display = "block";
                tariffsArr.forEach(e => {
                    e.style.display = "none";
                });
            } else if (tariff.value === "C11") {
                tariffsArr = [tariffC12a, tariffC12b, tariffC21];
                tariffC11.style.display = "block";
                intakeTwoSpheres.style.display = "none";
                intakeOneSphere.style.display = "block";
                tariffsArr.forEach(e => {
                    e.style.display = "none";
                });
            }
        })





    }
)()