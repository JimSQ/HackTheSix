function click() {
    var x = document.getElementById("xValues").value;
    var y = document.getElementById("yValues").value;
    var ctx = document.getElementById("myChart").getContext('2d');
    var message = document.getElementById("message");
    message.innerHTML = "Generating Graph...";
    try {
        var strXArray = x.split(',');
        var strYArray = y.split(',');
        if (strXArray.length != strYArray.length) {
            throw "Wrong number of values.";
        }
        var userData = [];
        for (i = 0; i < strXArray.length; i++) {
            var point = {};
            var xInt = parseInt(strXArray[i]);
            var yInt = parseInt(strYArray[i]);
            if (isNaN(xInt) || isNaN(yInt)) {
                throw "Invalid values: (" + strXArray[i] + ", " + strYArray[i] + ").";
            }
            point.x = xInt;
            point.y = yInt;
            userData.push(point);
        }
        var myChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Scatter Data',
                    data: userData,
                    fill: false,
                    pointRadius: 5,
                    pointBorderWidth: 2,
                    pointBackgroundColor: 'rgba(146, 211, 146, 0.4)',
                    pointBorderColor: 'rgba(0, 58, 0, 0.9)',
                }]
            },
            options: {
                scales: {
                    xAxes: [{
                        type: 'linear',
                        position: 'bottom'
                    }]
                },
                showLines: false,
            }
        });
    } catch (err) {
        message.innerHTML = err;
    } finally {}
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("generateGraph").addEventListener("click", click);
});