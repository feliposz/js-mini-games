const FocalLength = 20;
const Width = 100000;
const Height = 100000;
const Depth = 10000;
const Speed = 50;
const MinSize = 50;
const MaxSize = 550;
const MaxStars = 1000;

var cv = document.getElementById("cv");
var ct = cv.getContext("2d");

function Star(x, y, z, r, g, b, size) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.r = r;
    this.g = g;
    this.b = b;
    this.size = size;

    this.draw = function () {
        var x, y, size, color, r, g, b;

        // Coordinates and size projection
        x = cv.width / 2 + this.x * FocalLength / this.z;
        y = cv.height / 2 + this.y * FocalLength / this.z;
        size = this.size * FocalLength / this.z;

        // Stars get brighter as they get closer
        r = Math.floor(this.r * (Depth - this.z) / Depth);
        g = Math.floor(this.g * (Depth - this.z) / Depth);
        b = Math.floor(this.b * (Depth - this.z) / Depth);
        color = "rgb(" + r + "," + g + "," + b + ")";

        ct.beginPath();
        ct.fillStyle = color;
        ct.arc(x, y, size, 0, Math.PI * 2);
        ct.fill();
        ct.closePath();
    }

    this.update = function () {
        this.z -= Speed;
        if (this.z < FocalLength) {
            this.z += Depth;
        }
    }
}

var stars = [];

function start() {
    var i;
    for (i = 0; i < MaxStars; i++) {
        stars[i] = new Star(
            Width / 2 - Math.random() * Width,
            Height / 2 - Math.random() * Height,
            Math.random() * Depth,
            128 + Math.floor(Math.random() * 128),
            128 + Math.floor(Math.random() * 128),
            128 + Math.floor(Math.random() * 128),
            MinSize + Math.random() * (MaxSize - MinSize)
        );
    }
}

function update() {
    ct.fillStyle = "rgb(0, 0, 0)";
    ct.fillRect(0, 0, cv.width, cv.height);

    var i;

    for (i = 0; i < stars.length; i++) {
        stars[i].draw();
        stars[i].update();
    }

    // Z-order (Ensure drawing stars from back to front)
    stars.sort(function (a, b) {
        return a.z < b.z;
    });

    window.requestAnimationFrame(update);
    //setTimeout(update, 1000/5);
}

start();
update();