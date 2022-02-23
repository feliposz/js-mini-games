var canvas = document.createElement('canvas');
window.scrollbars = 'no';
document.body.style.margin = 0;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
var ctx = canvas.getContext('2d');

function Point(x, y, dx, dy) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;

    this.update = function () {
        this.x += this.dx;
        this.y += this.dy;

        if (this.x <= 0 || this.x > canvas.width) {
            this.dx *= -1;
            this.x += this.dx;
        }
        if (this.y <= 0 || this.y > canvas.height) {
            this.dy *= -1;
            this.y += this.dy;
        }
    }
}

function Line(a, b, c) {
    this.a = a;
    this.b = b;
    this.color = c;

    this.update = function () {
        this.a.update();
        this.b.update();
    }

    this.draw = function () {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.moveTo(this.a.x, this.a.y);
        ctx.lineTo(this.b.x, this.b.y);
        ctx.stroke();
        ctx.closePath();
    }
}

function rndPoint() {
    var x = Math.random() * canvas.width;
    var y = Math.random() * canvas.height;
    var dx = -5 + 10 * Math.random();
    var dy = -5 + 10 * Math.random();
    return new Point(x, y, dx, dy);
}

var lines = [
    new Line(rndPoint(), rndPoint(), 'yellow'),
    new Line(rndPoint(), rndPoint(), 'cyan'),
    new Line(rndPoint(), rndPoint(), 'magenta')
];

var loop = function () {
    ctx.fillStyle = 'black';
    ctx.globalAlpha = 0.05;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;

    for (i = 0; i < lines.length; i++) {
        lines[i].update();
        lines[i].draw();
    }

    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);