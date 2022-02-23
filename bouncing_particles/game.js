// TODO: Consider particles real SIZE

var MAX_PARTICLES = 100;
var MAX_WALLS = 20;
var DEBUG = 0;


var canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);
var ctx = canvas.getContext("2d");

function V2(x, y) {
    this.x = x;
    this.y = y;
}

V2.prototype.add = function (v) {
    this.x += v.x;
    this.y += v.y;
};

V2.prototype.sub = function (v) {
    this.x -= v.x;
    this.y -= v.y;
};

V2.prototype.scale = function (s) {
    this.x *= s;
    this.y *= s;
}

V2.prototype.inner = function (v) {
    return this.x * v.x + this.y * v.y;
};

V2.prototype.copy = function () {
    return new V2(this.x, this.y);
};

V2.prototype.length = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

V2.prototype.normalize = function () {
    var l = this.length();
    if (l !== 0) {
        this.x /= l;
        this.y /= l;
    }
};

function Wall(a, b) {
    this.a = a;
    this.b = b;
    this.normal = new V2(a.y - b.y, b.x - a.x);
    this.normal.normalize();
}

function Particle(pos, vel, color) {
    this.pos = pos;
    this.vel = vel;
    this.color = color;
}

var walls = [];
var particles = [];

function setupWalls() {
    var a, b, w, i;

    if (DEBUG === 1) {
        // Rectangular frame
        walls.push(new Wall(new V2(0, 50), new V2(canvas.width, 50)));
        walls.push(new Wall(new V2(canvas.width - 50, 0), new V2(canvas.width - 50, canvas.height)));
        walls.push(new Wall(new V2(canvas.width, canvas.height - 50), new V2(0, canvas.height - 50)));
        walls.push(new Wall(new V2(50, canvas.height), new V2(50, 0)));
    } else if (DEBUG === 2) {
        // Small triangle
        walls.push(new Wall(new V2(canvas.width / 2 - 50, canvas.height / 2 - 50), new V2(canvas.width / 2 + 50, canvas.height / 2 + 50)));
        walls.push(new Wall(new V2(canvas.width / 2 - 100, canvas.height / 2), new V2(canvas.width / 2 + 150, canvas.height / 2 - 10)));
        walls.push(new Wall(new V2(canvas.width / 2 + 100, canvas.height / 2 + 50), new V2(canvas.width / 2 - 150, canvas.height / 2 - 50)));
    } else {
        for (i = 0; i < MAX_WALLS; i++) {
            a = new V2(Math.random() * canvas.width, Math.random() * canvas.height);
            //b = new V2(a.x + 150 - Math.random() * 300, a.y + 100 - Math.random() * 200);
            b = new V2(Math.random() * canvas.width, Math.random() * canvas.height);
            w = new Wall(a, b);
            walls.push(w);
        }
    }
}

function setupParticles() {
    var angle, pos, vel, particle;

    if (DEBUG === 2) {
        // Single particle on center
        particle = new Particle(new V2(canvas.width / 2, canvas.height / 2), new V2(0, 0), "#ff0000");
        particles.push(particle);
    } else {
        for (i = 0; i < MAX_PARTICLES; i++) {
            angle = Math.random() * Math.PI * 2;
            speed = 1 + Math.random() * 1;
            pos = new V2(Math.random() * canvas.width, Math.random() * canvas.height);
            vel = new V2(Math.cos(angle) * speed, Math.sin(angle) * speed);
            particle = new Particle(pos, vel, "#ff0000");
            particles.push(particle);
        }
    }
}

// Calculate the reflection v1 of a vector given a normal vector v2
function reflectVector(v1, v2) {
    var t, s, vr;
    s = v1.inner(v2);
    t = v2.copy();
    t.scale(s);
    vr = v1.copy();
    vr.sub(t);
    vr.sub(t);
    return vr;
}

// Distance of 2 points squared (to avoid unecessary sqrt)
function distanceSq(p1, p2) {
    var dx = p1.x - p2.x,
        dy = p1.y - p2.y;
    return dx * dx + dy * dy;
}

function updateParticles() {
    var i, j, tmp, newVel, ip, oldPos = new V2(0, 0);
    var distSq, minDistSq, closestIp, closestWall, tryCount = 0;
    for (i = 0; i < particles.length; i++) {
        oldPos.x = particles[i].pos.x;
        oldPos.y = particles[i].pos.y;
        particles[i].pos.x += particles[i].vel.x;
        particles[i].pos.y += particles[i].vel.y;

        // Check interception with closest wall
        // TODO: Check if really necessary or if ANY intercepting wall will do...
        minDistSq = undefined;
        closestIp = undefined;
        closestWall = undefined;
        for (j = 0; j < walls.length; j++) {
            ip = interceptPoint(oldPos, particles[i].pos, walls[j].a, walls[j].b);
            if (ip) {
                distSq = distanceSq(oldPos, ip);
                if (!minDistSq || minDistSq > distSq) {
                    minDistSq = distSq;
                    closestIp = ip;
                    closestWall = walls[j];
                }
            }
        }

        if (closestIp) {
            // change color to show bouncing
            particles[i].color = "#00ff00";
            particles[i].vel = reflectVector(particles[i].vel, closestWall.normal);

            // restitution (?)
            particles[i].vel.scale(.99);

            // after collision, force to old position but with new velocity
            particles[i].pos.x = oldPos.x;
            particles[i].pos.y = oldPos.y;
            // TODO: try to simulate the actual bouncing...
        }

        // wrap around screen edges
        if (particles[i].pos.x < 0) {
            particles[i].pos.x += canvas.width;
        }
        if (particles[i].pos.x > canvas.width) {
            particles[i].pos.x -= canvas.width;
        }

        // went above screen...
        if (particles[i].pos.y < 0) {
            //particles[i].pos.y += canvas.height;
            particles[i].color = "#00ffff";
        }

        // went below screen, randomize particle...
        if (particles[i].pos.y > canvas.height) {
            particles[i].pos.y -= canvas.height;
            particles[i].vel.y = 0;
            particles[i].vel.x = 3 * (0.5 - Math.random());
            particles[i].pos.x = Math.random() * canvas.width;
            particles[i].color = "#ff0000";
        }

        particles[i].vel.y += 0.05;

        // air friction (?!)
        //particles[i].vel.scale(.999);
    }
}

// Check if a given coordinate (x, y) is inside a rect defined by 2 points
function coordInRect(x, y, p1, p2) {
    if ((p1.x <= p2.x && x >= p1.x && x <= p2.x) ||
        (p2.x <= p1.x && x >= p2.x && x <= p1.x)) {
        if ((p1.y <= p2.y && y >= p1.y && y <= p2.y) ||
            (p2.y <= p1.y && y >= p2.y && y <= p1.y)) {
            return true;
        }
    }
    return false;
}

// Calculate the interception point of two lines defined by 2 points each
// Reference: https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_points_on_each_line
function interceptPoint(p1, p2, p3, p4) {
    var den = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    if (den === 0) {
        return undefined;
    }
    var x = ((p1.x * p2.y - p1.y * p2.x) * (p3.x - p4.x) - (p1.x - p2.x) * (p3.x * p4.y - p3.y * p4.x)) / den;
    var y = ((p1.x * p2.y - p1.y * p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x * p4.y - p3.y * p4.x)) / den;
    if (coordInRect(x, y, p1, p2) && coordInRect(x, y, p3, p4)) {
        return new V2(x, y);
    }
    return undefined;
}

function drawParticles() {
    var i;
    for (i = 0; i < particles.length; i++) {
        ctx.fillStyle = particles[i].color;
        ctx.beginPath();
        ctx.arc(particles[i].pos.x, particles[i].pos.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}

function drawWalls() {
    var i, a, b;
    for (i = 0; i < walls.length; i++) {
        a = walls[i].a;
        b = walls[i].b;
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#8080ff";
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.closePath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#0000ff";
        ctx.strokeText(i, a.x, a.y);
    }
}

// Show the points of interceptions of walls
function drawWallInterceptions() {
    var i, j, p;
    ctx.fillStyle = "#ff8000";
    for (i = 0; i < walls.length; i++) {
        a = walls[i].a;
        b = walls[i].b;
        for (j = i + 1; j < walls.length; j++) {
            p = interceptPoint(walls[i].a, walls[i].b, walls[j].a, walls[j].b);
            if (p) {
                //console.log(i, j, p);
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
                ctx.fillText(i + "x" + j, p.x, p.y);
            }
        }
    }
}

function drawBackground() {
    ctx.globalAlpha = 0.2; // Fake "Motion blur"
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
}

function loop() {
    drawBackground();
    drawWalls();
    drawWallInterceptions();
    drawParticles();
    updateParticles();
    requestAnimationFrame(loop);
}

setupWalls();
setupParticles();
loop();