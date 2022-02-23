const Gravity = 0.1;
const MaxParticles = 150;
const MinInterval = 30;
const MaxInterval = 150;

var cv = document.getElementById("cv");
var ct = cv.getContext("2d");

var countdown = 0;
var ps = [];

function Particle(x, y, vx, vy, size, lifetime, color) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.lifetime = lifetime;
    this.color = color;
    this.initialLifetime = lifetime;
    this.active = true;
}

Particle.prototype.draw = function () {
    if (this.active) {
        ct.beginPath();
        ct.fillStyle = this.color;
        ct.arc(this.x, this.y, this.size * this.lifetime / this.initialLifetime, 0, Math.PI * 2);
        ct.fill();
        ct.closePath();
    }
};

Particle.prototype.update = function () {
    if (this.active) {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += Gravity;
        // decelerate particles a bit
        this.vx *= 0.99;
        this.lifetime--;
        if (this.lifetime < 0) {
            this.active = false;
        }
    }
};


function RandomColor() {
    return "rgb(" + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + ")";
}

function UpdateFrame() {

    var i, p, x, y, vx, vy, angle, speed;

    countdown--;

    // Time for a new explosion
    if (countdown <= 0) {
        x = Math.random() * cv.width;
        y = Math.random() * cv.height * 0.75; // Keep center a little bit above bottom line
        color = RandomColor();
        for (i = 0; i < MaxParticles; i++) {
            speed = Math.random() * 5;
            angle = Math.random() * Math.PI * 2;
            vx = Math.cos(angle) * speed;
            vy = Math.sin(angle) * speed;
            size = 0.5 + Math.random() * 5;
            lifetime = 50 + Math.random() * 200;
            p = new Particle(x, y, vx, vy, size, lifetime, color);
            ps.push(p);
        }
        countdown = MinInterval + Math.random() * (MaxInterval - MinInterval);
    }

    // Remove inactive particles
    for (i = ps.length - 1; i >= 0; i--) {
        if (!ps[i].active) {
            ps.splice(i, 1);
        }
    }

    ct.fillStyle = "rgb(0, 0, 0)";
    ct.fillRect(0, 0, cv.width, cv.height);

    for (i = 0; i < ps.length; i++) {
        ps[i].draw();
        ps[i].update();
    }


    window.requestAnimationFrame(UpdateFrame);
}

UpdateFrame();