(
    () => {
        btn35zl.addEventListener('click', () => {
            if (info35zlFlag) {
                const actualNote = summaryCalc.innerHTML;
                summaryCalc.innerHTML = actualNote + `<br>Opłata handlowa <span class="value-of-calc-data">35zł / miesięcznie</span>  ----> rocznie <span class="value-of-calc-data">420zł</span> oszczędności <span class="value-of-calc-data">na każdym PPE</span>`;
                info35zlFlag = false;
            }
        })

    }
)()