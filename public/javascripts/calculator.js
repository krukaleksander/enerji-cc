const toLow = 3.99;
let btn = document.getElementById('btn');
const yearIn = document.getElementById('yearIn'); //zuzycie roczne
const power = document.getElementById('power'); // moc instalacji
const monthCost = document.getElementById('monthCost'); // koszt miesieczny
const credit = document.getElementById('credit'); // rata kredytu
const sameEnergy = document.getElementById('same-energy');
const changedEnergy = document.getElementById('changed-energy');
let bill, scope, monthIn, powerCheck, costs; //rachunek, miesiące, ile miesięcznie, ile mocy, koszty(do zysków)
const creditAmmounts = [{
        id: 0,
        power: 3.99,
        cost: 249.82
    },
    {
        id: 1,
        power: 4.56,
        cost: 273.69
    },
    {
        id: 2,
        power: 5.13,
        cost: 300.74
    },
    {
        id: 3,
        power: 5.7,
        cost: 323.01
    },
    {
        id: 4,
        power: 6.84,
        cost: 375.52
    },
    {
        id: 5,
        power: 7.41,
        cost: 421.67
    },
    {
        id: 6,
        power: 7.98,
        cost: 448.72
    },
    {
        id: 7,
        power: 8.55,
        cost: 458.27
    },
    {
        id: 8,
        power: 9.69,
        cost: 521.91
    },
    {
        id: 9,
        power: 10.26,
        cost: 528.28
    },
    {
        id: 10,
        power: 11.4,
        cost: 569.65
    },
    {
        id: 11,
        power: 12.54,
        cost: 615.79
    },
    {
        id: 12,
        power: 13.11,
        cost: 634.89
    },
    {
        id: 13,
        power: 14.25,
        cost: 681.03
    },
    {
        id: 14,
        power: 15.39,
        cost: 728.77
    },
    {
        id: 15,
        power: 19.95,
        cost: 914.94
    },
    {
        id: 16,
        power: 25.08,
        cost: 1166.35
    },
    {
        id: 17,
        power: 30.21,
        cost: 1307.97
    },
    {
        id: 18,
        power: 35.34,
        cost: 1468.68
    },
    {
        id: 19,
        power: 39.9,
        cost: 1685.08
    },
    {
        id: 20,
        power: 49.59,
        cost: 2202.22
    }
];
let compareArrHi = []; //tablica z większymi mocami
let compareArrLow = []; // tablica z mniejszymi mocami
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
const calcProfit = () => {
    sameEnergy.textContent = '';
    sameEnergy.classList.remove('active');
    changedEnergy.textContent = '';
    changedEnergy.classList.remove('active');
    if (powerCheck > toLow && powerCheck < 49.59) {
        let billCost = monthCost.textContent * 12 * 20;
        let billCostHi = billCost * 1.4;
        let costsCost = costs * 12 * 10;
        sameEnergy.textContent = numberWithCommas(Math.round(billCost - costsCost));
        sameEnergy.classList.add('active');
        changedEnergy.textContent = numberWithCommas(Math.round(billCostHi - costsCost));
        changedEnergy.classList.add('active');
    } else {
        return
    }


}
const findCost = (power) => {
    creditAmmounts.forEach(e => {
        if (e.power > power) {
            compareArrHi.push(e);
        }
    })
    creditAmmounts.forEach(e => {
        if (e.power <= power) {
            compareArrLow.push(e);
        }
    })
    let higher = compareArrHi[0];
    let lower = compareArrLow[compareArrLow.length - 1];
    if (higher.power - power > power - lower.power) {
        //niższy    

        credit.textContent = `${lower.cost} zł`;
        costs = lower.cost;
    } else {
        // wyższy
        credit.textContent = `${higher.cost} zł`;
        costs = higher.cost;
        console.log(higher.power - power, power - lower.power);
    }

}

const calcCost = (power) => {
    if (powerCheck < toLow) {
        credit.textContent = 'dla takiej mocy nie znam raty';
    } else if (powerCheck > 49.59) {
        credit.textContent = 'to nie jest mikroinstalacja!';
    } else {
        findCost(power);
    }

}



const calcFn = () => {
    compareArrHi = [];
    compareArrLow = [];
    bill = parseInt(document.getElementById('bill').value);
    if (bill > 149) {
        scope = parseInt(document.getElementById('select').value);

        if (scope === 1) {
            monthCost.textContent = bill;
            monthIn = bill / 0.7;
            yearIn.textContent = Math.round(monthIn * 12 / 1000 * 100) / 100;
            power.textContent = (yearIn.textContent * 1.2).toFixed(1);
            powerCheck = power.textContent;

        } else if (scope === 2) {
            monthCost.textContent = bill / 2;
            monthIn = bill / 2 / 0.7;
            yearIn.textContent = Math.round(monthIn * 12 / 1000 * 100) / 100;
            power.textContent = (yearIn.textContent * 1.2).toFixed(1);
            powerCheck = power.textContent;
        } else if (scope === 12) {
            monthCost.textContent = Math.round(bill / 12);
            monthIn = bill / 12 / 0.7;
            yearIn.textContent = Math.round(monthIn * 12 / 1000 * 100) / 100;
            power.textContent = (yearIn.textContent * 1.2).toFixed(1);
            powerCheck = power.textContent;
        }
        calcCost(power.textContent);
        calcProfit();
    }
}

btn.addEventListener('click', () => calcFn())