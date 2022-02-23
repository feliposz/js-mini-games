function V2(x, y) {
    this.x = x;
    this.y = y;
}

V2.prototype.add = function (v) {
    this.x += v.x;
    this.y += v.y;
};

V2.prototype.scale = function (a) {
    this.x *= a;
    this.y *= a;
};

var cv = document.createElement("canvas");
cv.width = 800;
cv.height = 600;
document.body.appendChild(cv);
var ctx = cv.getContext("2d");

function calcMotion(t, acc, vel, pos) {
    // new position
    // p' = 0.5*a*t*t + v*t + p
    var v1 = new V2(acc.x, acc.y);
    v1.scale(0.5 * t * t);

    var v2 = new V2(vel.x, vel.y);
    v2.scale(t);

    pos.add(v1);
    pos.add(v2);

    // new velocity
    // v' = a*t + v
    var v3 = new V2(acc.x, acc.y);
    v2.scale(t);

    vel.add(v2);
}

function Thing(x, y, color) {
    this.pos = new V2(x, y);
    this.vel = new V2(0, 0);
    this.acc = new V2(0, 0);
    this.angle = Math.random() * Math.PI * 2;
    this.size = 10;
    this.color = color;
    this.lifetime = Math.random() * 1000;
    this.alive = true;
}

Thing.prototype.update = function (t) {
    this.angle += 0.33 * (0.5 - Math.random());
    this.acc.x = Math.cos(this.angle) * 5;
    this.acc.y = Math.sin(this.angle) * 5;

    calcMotion(t / 15, this.acc, this.vel, this.pos);

    //wrap
    if (this.pos.x < 0) {
        this.pos.x = cv.width;
    }
    if (this.pos.x > cv.width) {
        this.pos.x = 0;
    }
    if (this.pos.y < 0) {
        this.pos.y = cv.height;
    }
    if (this.pos.y > cv.height) {
        this.pos.y = 0;
    }

    this.lifetime -= t / 15;
    if (this.lifetime < 0) {
        this.alive = false;
    }
    this.size = this.lifetime / 50;
};

Thing.prototype.draw = function () {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.pos.x - this.size / 2, this.pos.y - this.size / 2, this.size, this.size);
};

function randColor() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
}

var things = [];
var lastT = performance.now();


function update() {
    var i = 0;
    var currentT = performance.now();
    var elapsedT = currentT - lastT;
    lastT = currentT;
    //console.log(elapsedT);

    // "Fake" motion blur
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.globalAlpha = 1;

    if (things.length < 100) {
        things.push(new Thing(Math.random() * cv.width,
            Math.random() * cv.height, randColor()));
    }

    for (i = things.length - 1; i >= 0; i--) {
        if (!things[i].alive) {
            things.splice(i, 1);
        }
    }

    for (i = 0; i < things.length; i++) {
        things[i].draw();
        things[i].update(elapsedT);
    }

    requestAnimationFrame(update);
}

update();