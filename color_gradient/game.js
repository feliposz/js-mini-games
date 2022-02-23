var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

function map(value, origA, origB, destA, destB) {
    return (value - origA) / (origA - origB) * (destA - destB) + destA;
}

function drawGradient() {
    var h, s, x1, y1, x2, y2;
    var hstep = 4,
        sstep = 5;
    for (h = 0; h <= 360; h += hstep) {
        x1 = Math.floor(map(h, 0, 360, 0, canvas.width));
        x2 = Math.floor(map(h + hstep, 0, 359, 0, canvas.width));
        for (s = 0; s < 100; s += sstep) {
            y1 = Math.floor(map(s, 99, 0, 0, canvas.height));
            y2 = Math.floor(map(s + sstep, 99, 0, 0, canvas.height));
            ctx.fillStyle = "hsl(" + h + "," + s + "%," + "50%)"
            ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
            y1 = y2;
        }
        x1 = x2;
    }
}

function drawCircle() {
    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var radius = Math.min(canvas.width, canvas.height) / 2;
    var deg1, deg2, x1, x2, y1, y2, x3, y3, x4, y4, r1, r2, h, s;
    var hstep = 9,
        sstep = 10;
    for (h = 0; h <= 360; h += hstep) {
        for (s = 0; s < 100; s += sstep) {
            deg1 = map(h, 0, 360, 0, Math.PI * 2);
            deg2 = map(h + hstep, 0, 360, 0, Math.PI * 2);
            r1 = map(s, 0, 105, 0, radius);
            r2 = map(s + sstep, 0, 105, 0, radius);
            x1 = centerX + Math.cos(deg1) * r1;
            y1 = centerY + Math.sin(deg1) * r1;
            x2 = centerX + Math.cos(deg2) * r1;
            y2 = centerY + Math.sin(deg2) * r1;
            x3 = centerX + Math.cos(deg2) * r2;
            y3 = centerY + Math.sin(deg2) * r2;
            x4 = centerX + Math.cos(deg1) * r2;
            y4 = centerY + Math.sin(deg1) * r2;
            ctx.beginPath();
            ctx.fillStyle = "hsl(" + h + "," + s + "%," + "50%)";
            ctx.strokeStyle = "hsl(" + h + "," + s + "%," + "35%)";
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.lineTo(x4, y4);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
        }
    }
}

window.onload = drawCircle;

window.onkeyup = function (event) {
    if (event.keyCode === 49) {
        drawGradient();
    }
    if (event.keyCode === 50) {
        drawCircle();
    }
}