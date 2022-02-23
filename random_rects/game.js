var cv = document.createElement("canvas");
var ctx = cv.getContext("2d");

cv.width = 800;
cv.height = 600;
document.body.appendChild(cv);

ctx.fillStyle = "black";
ctx.fillRect(0, 0, cv.width, cv.height);

function randColor() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
}

function loop() {
    var w = Math.random() * (cv.width / 2);
    var h = Math.random() * (cv.height / 2);
    var x = Math.random() * (cv.width - w);
    var y = Math.random() * (cv.height - h);

    ctx.beginPath();
    ctx.lineWidth = Math.random() * 10;
    ctx.fillStyle = randColor();
    ctx.strokeStyle = randColor();
    ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);