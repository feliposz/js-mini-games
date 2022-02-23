var cv = document.getElementById("cv");
var ct = cv.getContext("2d");
const gravity = 0.15;

function Particle(x, y, vx, vy, sz, color) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.sz = sz;
    this.color = color;

    this.update = function () {
        this.x += this.vx;
        this.y += this.vy;
        if ((this.x - this.sz / 2 < 0) || (this.x + this.sz / 2 > cv.width)) {
            this.x -= this.vx;
            this.vx = -this.vx;
        }
        if (this.y + this.sz / 2 > cv.height) {
            this.y -= this.vy;
            this.vy = -this.vy;
        }
        this.vy += gravity;
    };

    this.draw = function () {
        ct.fillStyle = color;
        ct.beginPath();
        ct.arc(this.x, this.y, this.sz / 2, 0, 2 * Math.PI);
        ct.fill();
        ct.closePath();
        //ct.fillRect(this.x-this.sz/2, this.y-this.sz/2, this.sz, this.sz);
    }
}

var ps = [];

function start() {
    var i;
    var x, y, vx, vy, sz, color;
    var maxPart = 200;
    for (i = 0; i < maxPart; i++) {
        color = "rgb(255, " + (255 - 255 * i / maxPart) + ", 0)";
        x = Math.random() * cv.width;
        y = Math.random() * cv.height;
        vx = 0;
        while (Math.abs(vx) < 0.1) {
            vx = 5 - Math.random() * 10;
        }
        vy = 0;
        while (Math.abs(vy) < 0.1) {
            vy = 5 - Math.random() * 10;
        }
        sz = 10 + Math.random() * 20;
        if (x < sz / 2) {
            x = sz / 2
        };
        if (y < sz / 2) {
            y = sz / 2
        };
        if (x > cv.width - sz / 2) {
            x = cv.width - sz / 2
        };
        if (y > cv.height - sz / 2) {
            y = cv.height - sz / 2
        };
        ps[i] = new Particle(x, y, vx, vy, sz, color);
    }
    update();
}

function update() {

    ct.fillStyle = "black";
    ct.fillRect(0, 0, cv.width, cv.height);

    ct.strokeStyle = "green";
    ct.strokeRect(0, 0, cv.width - 1, cv.height - 1);

    var i;
    for (i = 0; i < ps.length; i++) {
        ps[i].update();
        ps[i].draw();
    }

    window.requestAnimationFrame(update);
}

start();