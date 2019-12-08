console.log('podpięte pod kalendarz!')

function loadDoc() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var text = JSON.parse(this.responseText);
            txtToPut = [];
            text.forEach(element => {
                txtToPut.push(`<option>${element.name}</option>`)
            });
            document.getElementById("experts-calendar").innerHTML = txtToPut.join("");
        }
    };
    xhttp.open("GET", "/panel/calendar/eksperci", true);
    xhttp.send();
}
loadDoc();