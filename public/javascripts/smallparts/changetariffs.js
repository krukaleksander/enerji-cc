(
    () => {
        const allTariffNames = ['c11', 'c12a', 'c12b', 'c21', 'c22a', 'c22b', 'c23', 'b21', 'b22', 'b23', 'b11', 'g11', 'g12', 'g12w'];
        const tariff = document.getElementById('tariff');
        const intakeOneSphere = document.querySelector('.intakec11c21');
        const intakeTwoSpheres = document.querySelector('.intakec12ac12b');
        const intakeThreeSpheres = document.querySelector('.intakec23b23');
        const propositionC11C21 = document.querySelector('.propositionc11c21');
        const propositionC12aC12b = document.querySelector('.propositionc12ac12b');
        const propositionC23B23 = document.querySelector('.propositionc23b23');
        const havePricesc23b23 = document.querySelector('.havePricesc23b23');
        const havePricesC12x = document.querySelector('.havePricesc12ac12b');
        const havePricesC11 = document.querySelector('.have-prices-c11');

        const setDisplayOfTariffs = (tariffArr, showTariffName) => {
            tariffArr.forEach(tariffName => {
                document.querySelector(`.tariff${tariffName}-wrapper`).style.display = "none";
            });
            document.querySelector(`.tariff${showTariffName}-wrapper`).style.display = "block";
            setIntakeAndProposition(showTariffName);
        };
        const setIntakeAndProposition = (tariffName) => {
            if (tariffName[2] === "1") {
                intakeThreeSpheres.style.display = "none";
                intakeTwoSpheres.style.display = "none";
                intakeOneSphere.style.display = "block";
                propositionC11C21.style.display = "block";
                propositionC23B23.style.display = "none";
                propositionC12aC12b.style.display = "none";
                havePricesC12x.style.display = "none";
                havePricesc23b23.style.display = "none";
                havePricesC11.style.display = "block";
            } else if (tariffName[2] === "2") {
                intakeTwoSpheres.style.display = "block";
                intakeOneSphere.style.display = "none";
                intakeThreeSpheres.style.display = "none";
                propositionC11C21.style.display = "none";
                propositionC23B23.style.display = "none";
                propositionC12aC12b.style.display = "block";
                havePricesC12x.style.display = "block";
                havePricesC11.style.display = "none";
                havePricesc23b23.style.display = "none";
            } else if (tariffName[2] === "3") {
                intakeTwoSpheres.style.display = "none";
                intakeOneSphere.style.display = "none";
                intakeThreeSpheres.style.display = "block";
                propositionC11C21.style.display = "none";
                propositionC12aC12b.style.display = "none";
                propositionC23B23.style.display = "block";
                havePricesC12x.style.display = "none";
                havePricesC11.style.display = "none";
                havePricesc23b23.style.display = "block";
            };
        };

        tariff.addEventListener('change', () => {
            if (tariff.value === "C12a") {
                setDisplayOfTariffs(allTariffNames, 'c12a');
                tariffCalcFlag = 1;

            } else if (tariff.value === "C12b") {
                setDisplayOfTariffs(allTariffNames, 'c12b');
                tariffCalcFlag = 2;

            } else if (tariff.value === "C21") {
                setDisplayOfTariffs(allTariffNames, 'c21');
                tariffCalcFlag = 3;

            } else if (tariff.value === "C11") {
                setDisplayOfTariffs(allTariffNames, 'c11');
                tariffCalcFlag = 0;

            } else if (tariff.value === "C22a") {
                setDisplayOfTariffs(allTariffNames, 'c22a');
                tariffCalcFlag = 4;

            } else if (tariff.value === "C22b") {
                setDisplayOfTariffs(allTariffNames, 'c22b');
                tariffCalcFlag = 5;

            } else if (tariff.value === "C23") {
                setDisplayOfTariffs(allTariffNames, 'c23');
                tariffCalcFlag = 12;

            } else if (tariff.value === "B21") {
                setDisplayOfTariffs(allTariffNames, 'b21');
                tariffCalcFlag = 6;

            } else if (tariff.value === "B23") {
                setDisplayOfTariffs(allTariffNames, 'b23');
                tariffCalcFlag = 13;

            } else if (tariff.value === "B22") {
                setDisplayOfTariffs(allTariffNames, 'b22');
                tariffCalcFlag = 7;

            } else if (tariff.value === "B11") {
                setDisplayOfTariffs(allTariffNames, 'b11');
                tariffCalcFlag = 8;

            } else if (tariff.value === "G11") {
                setDisplayOfTariffs(allTariffNames, 'g11');
                tariffCalcFlag = 9;

            } else if (tariff.value === "G12") {
                setDisplayOfTariffs(allTariffNames, 'g12');
                tariffCalcFlag = 10;

            } else if (tariff.value === "G12w") {
                setDisplayOfTariffs(allTariffNames, 'g12w');
                tariffCalcFlag = 11;

            }
            summaryCalc.scrollIntoView();
        });





    }
)()