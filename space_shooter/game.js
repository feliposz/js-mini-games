"use strict";

const Acceleration = 0.05;
const Friction = 0.9;
const MaxSpeed = 8;
const ShotSpeed = 15;
const EnemySpeed = 4;
const EnemySpawnRate = 1;
const EnemyMinRadius = 30;
const ShotDamage = 2;
const MaxEnergy = 100;

var hobbies = [{
        title: "Arts",
        color: {
            r: 200,
            g: 50,
            b: 50
        },
        enemies: [
            "Drawing",
            "Piano",
            "Guitar",
            "Hard rock",
            "Heavy metal",
            "Classical music"
        ]
    },
    {
        title: "Games",
        color: {
            r: 80,
            g: 150,
            b: 200
        },
        enemies: [
            "Boardgames",
            "PC Games",
            "Rubik's cube",
            "Xbox 360",
            "Playstation 3",
            "PSP"
        ]
    },
    {
        title: "Movies & TV",
        color: {
            r: 200,
            g: 90,
            b: 70
        },
        enemies: [
            "Star Wars",
            "Marvel Universe",
            "Breaking Bad",
            "Game of Thrones",
            "Homeland",
            "House of Cards",
            "Stranger Things"
        ]
    },
    {
        title: "Books",
        color: {
            r: 50,
            g: 200,
            b: 50
        },
        enemies: [
            "Lord of the Rings",
            "O Hobbit",
            "Harry Potter",
            "Animal Farm",
            "Brave New World",
            "The Bible"
        ]
    },
    {
        title: "Culture",
        color: {
            r: 150,
            g: 50,
            b: 150
        },
        enemies: [
            "Travel",
            "Languages",
            "English +++++",
            "German --",
            "French +",
            "Spanish ++",
            "Japanese -----"
        ]
    },
    {
        title: "The End?",
        color: {
            r: 10,
            g: 10,
            b: 10
        },
        enemies: [
            "?",
            "??",
            "???",
            "????",
            "?????"
        ]
    }
];

var levelNum = 0;
var enemyNum = 0;
var activeEnemies = hobbies[levelNum].enemies.length;

var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;
var ctx = canvas.getContext("2d");
var shots = [];
var enemies = [];
var score = 0,
    hiscore = 0;

function RotateGeometry(angle, geometry) {
    var i, gx, gy, sx, sy, rad;
    var result = [];
    rad = angle / 180 * Math.PI;
    for (i = 0; i < geometry.length; i += 2) {
        gx = geometry[i];
        gy = geometry[i + 1];
        sx = gx * Math.cos(rad) - gy * Math.sin(rad);
        sy = gx * Math.sin(rad) + gy * Math.cos(rad);
        result[i] = sx;
        result[i + 1] = sy;
    }
    return result;
}

function DrawGeometry(cx, cy, geometry) {
    var i, gx, gy, first = true;
    for (i = 0; i < geometry.length; i += 2) {
        gx = geometry[i];
        gy = geometry[i + 1];
        if (first) {
            ctx.moveTo(canvas.width / 2 + cx + gx, canvas.height / 2 - cy - gy);
            first = false;
        } else {
            ctx.lineTo(canvas.width / 2 + cx + gx, canvas.height / 2 - cy - gy);
        }
    }
}

function GetAngle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1) / Math.PI * 180;
}

function VectorMag(x, y) {
    return Math.sqrt(x * x + y * y);
}

function Controller() {
    this.x = 0;
    this.y = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouse1Pressed = false;
    this.space = false;

    // WASD

    this.keyup = function (evt) {
        // WASD
        if (evt.keyCode == 87) {
            this.y = 0;
        }
        if (evt.keyCode == 65) {
            this.x = 0;
        }
        if (evt.keyCode == 83) {
            this.y = 0;
        }
        if (evt.keyCode == 68) {
            this.x = 0;
        }
        if (evt.keyCode == 32) {
            this.space = false;
        }
    };

    this.keydown = function (evt) {
        if (evt.keyCode == 87) {
            this.y = 1;
        }
        if (evt.keyCode == 65) {
            this.x = -1;
        }
        if (evt.keyCode == 83) {
            this.y = -1;
        }
        if (evt.keyCode == 68) {
            this.x = 1;
        }
        if (evt.keyCode == 32) {
            this.space = true;
        }
    };

    this.mousemove = function (evt) {
        var rect = canvas.getBoundingClientRect();
        this.mouseX = evt.clientX - rect.left;
        this.mouseY = evt.clientY - rect.top;
    };

    this.mousedown = function (evt) {
        if ((evt.buttons & 1) > 0) {
            this.mouse1Pressed = true;
        }
    }

    this.mouseup = function (evt) {
        if ((evt.buttons & 1) === 0) {
            this.mouse1Pressed = false;
        }
    }
}

// TODO: Make multiple enemy types

function Enemy(x, y, direction, text, color) {
    this.x = x;
    this.y = y;
    this.radius = 60;
    this.direction = direction;
    this.active = true;
    this.text = text;
    this.color = color;
}

Enemy.prototype.move = function () {
    var vx, vy;
    if (this.active) {
        vx = EnemySpeed * Math.cos(this.direction / 180 * Math.PI);
        vy = EnemySpeed * Math.sin(this.direction / 180 * Math.PI);

        this.x += vx;
        this.y += vy;
        this.direction += 10 - Math.random() * 20;
        if (this.direction < 0) {
            this.direction += 360;
        }
        if (this.direction > 360) {
            this.direction -= 360;
        }

        // TODO: Wrap around only if completely outside screen boundaries
        if (this.x < -canvas.width / 2) {
            this.x += canvas.width;
        }
        if (this.x > canvas.width / 2) {
            this.x -= canvas.width;
        }
        if (this.y < -canvas.height / 2) {
            this.y += canvas.height;
        }
        if (this.y > canvas.height / 2) {
            this.y -= canvas.height;
        }
    }
}

Enemy.prototype.damage = function (damage) {
    if (this.active) {
        if (this.radius > EnemyMinRadius) {
            this.radius -= damage;
        } else {
            this.active = false;
        }
    }
}

Enemy.prototype.draw = function () {
    if (this.active) {
        ctx.beginPath();
        var n = Math.floor(Math.random() * 32);
        var r = (this.color.r + (128 + n)) / 2;
        var g = this.color.g;
        var b = (this.color.b + Math.floor(Math.abs(180 - this.direction) / 180 * 255)) / 2;
        ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        ctx.arc(canvas.width / 2 + this.x, canvas.height / 2 - this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.fillStyle = "#fff";
        ctx.font = "20px monospace";
        var tw = ctx.measureText(this.text).width;
        ctx.fillText(this.text, canvas.width / 2 + this.x - tw / 2, canvas.height / 2 - this.y + 5);
    }
}

function Shot(x, y, direction) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    var disturb = 0.9 + Math.random() * 0.2;
    this.vx = disturb * ShotSpeed * Math.cos(direction / 180 * Math.PI);
    this.vy = disturb * ShotSpeed * Math.sin(direction / 180 * Math.PI);
    this.lifetime = 75;
    this.active = true;
}

Shot.prototype.move = function () {
    if (this.active) {
        this.x += this.vx;
        this.y += this.vy;

        /*
        if (this.x < -canvas.width/2) { this.x += canvas.width; }
        if (this.x > canvas.width/2) { this.x -= canvas.width; }
        if (this.y < -canvas.height/2) { this.y += canvas.height; }
        if (this.y > canvas.height/2) { this.y -= canvas.height; }
        */

        this.lifetime--;
        if (this.lifetime <= 0) {
            this.active = false;
        }
    }
}

Shot.prototype.draw = function () {
    if (this.active) {
        ctx.beginPath();
        ctx.strokeStyle = "rgb(" + Math.floor(this.lifetime / 75 * 190 + 64) + ", 0, 0)";
        ctx.arc(canvas.width / 2 + this.x, canvas.height / 2 - this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
    }
}

function Player(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.direction = 0;
    this.geometry = [20, 0, -20, -12, -20, 12];
    this.active = true;
    this.energy = MaxEnergy;
    this.charged = true;

    this.move = function (controller) {
        if (!this.active) {
            return;
        }

        // TODO: Abstract most of this into controller logic
        // TODO: Do the same for right "analog" (arrows)
        if (Math.abs(this.vx) < MaxSpeed) {
            this.vx += controller.x;
        } else {
            this.vx = this.vx > 0 ? MaxSpeed : -MaxSpeed;
        }
        if (Math.abs(this.vy) < MaxSpeed) {
            this.vy += controller.y;
        } else {
            this.vy = this.vy > 0 ? MaxSpeed : -MaxSpeed;
        }
        if (controller.x === 0) {
            this.vx *= Friction;
        }
        if (controller.y === 0) {
            this.vy *= Friction;
        }
        var mag = VectorMag(this.vx, this.vy);
        if (mag > MaxSpeed) {
            this.vx *= 1 / mag * MaxSpeed;
            this.vy *= 1 / mag * MaxSpeed;
        }

        var debugMove = false;
        if (debugMove) {
            ctx.beginPath();
            ctx.strokeStyle = "yellow";
            ctx.arc(canvas.width / 2, canvas.height / 2, 10 * MaxSpeed, 0, Math.PI * 2);
            ctx.stroke();
            ctx.closePath();
            ctx.fillStyle = "yellow";
            ctx.fillRect(canvas.width / 2 + this.vx * 10 - 2, canvas.height / 2 - this.vy * 10 - 2, 4, 4);
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < -canvas.width / 2) {
            this.x += canvas.width;
        }
        if (this.x > canvas.width / 2) {
            this.x -= canvas.width;
        }
        if (this.y < -canvas.height / 2) {
            this.y += canvas.height;
        }
        if (this.y > canvas.height / 2) {
            this.y -= canvas.height;
        }

        this.direction = GetAngle(this.x + canvas.width / 2, canvas.height / 2 + this.y, controller.mouseX, canvas.height - controller.mouseY);

        if (controller.mouse1Pressed) {
            this.shoot();
            if (!this.charged) {
                CenterMessage("OVERHEAT!", canvas.height - 30, Math.random() < 0.5 ? "red" : "white");
            }
        } else {
            if (this.energy < MaxEnergy) {
                this.energy += 1.5;
            } else {
                this.charged = true;
                this.energy = MaxEnergy;
            }
            if (!this.charged) {
                CenterMessage("Charging: " + (Math.floor(this.energy / 10) * 10) + "%", canvas.height - 30, "yellow");
            }
        }

        var debugDirection = false;
        if (debugDirection) {
            ctx.beginPath();
            ctx.strokeStyle = "magenta";
            ctx.moveTo(this.x + canvas.width / 2, canvas.height / 2 - this.y);
            ctx.lineTo(controller.mouseX, controller.mouseY);
            ctx.stroke();
            ctx.closePath();
            ctx.strokeText(this.direction, 30, 30);
        }

    };

    this.draw = function () {
        if (this.active) {
            ctx.fillStyle = "lime";
            ctx.beginPath();
            DrawGeometry(this.x, this.y, RotateGeometry(this.direction, this.geometry));
            ctx.fill();
            ctx.closePath();
        }
    };

    this.shoot = function () {
        if (this.charged) {
            var s = new Shot(this.x, this.y, this.direction);
            shots.push(s);
            //this.energy -= 1;
            if (this.energy < 0) {
                this.charged = false;
            }
        }
    }

    this.die = function () {
        var s, i;
        for (i = 0; i < 360; i += 5) {
            s = new Shot(this.x + Math.random() * 10, this.y + Math.random() * 10, i);
            shots.push(s);
        }
        this.active = false;
    }
}

var player = new Player(0, 0);
var controller = new Controller();
var lastT = +new Date();
var enemyCounter = 0;

function ClearScreen() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function DrawCursor() {
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.arc(controller.mouseX, controller.mouseY, 10, 0, Math.PI * 2);
    ctx.moveTo(controller.mouseX - 10, controller.mouseY);
    ctx.lineTo(controller.mouseX + 10, controller.mouseY);
    ctx.moveTo(controller.mouseX, controller.mouseY - 10);
    ctx.lineTo(controller.mouseX, controller.mouseY + 10);
    ctx.stroke();
    ctx.closePath();
}

function DrawScore() {
    ctx.font = "20px monospace";
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 50, 50);
    ctx.fillText("Hi Score: " + hiscore, canvas.width - 200, 50);
    ctx.fillStyle = "rgb(" + hobbies[levelNum].color.r + "," + hobbies[levelNum].color.g + "," + hobbies[levelNum].color.b + ")";
    ctx.font = "40px monospace";
    var tw = ctx.measureText(hobbies[levelNum].title).width;
    ctx.fillText(hobbies[levelNum].title, canvas.width / 2 - tw / 2, 50);
}

function CenterMessage(text, y, color) {
    var m;
    ctx.font = "20px monospace";
    ctx.fillStyle = color;
    m = ctx.measureText(text);
    ctx.fillText(text, canvas.width / 2 - m.width / 2, y);
}

function SpawnEnemy() {
    var x, y, d;
    // Force spawning away from player
    // TODO: Spawn outside screen boundaries?
    do {
        x = (0.5 - Math.random()) * canvas.width;
        y = (0.5 - Math.random()) * canvas.height;
    } while (VectorMag(x - player.x, y - player.y) < 30 * EnemySpeed);

    if (levelNum < hobbies.length && enemyNum < hobbies[levelNum].enemies.length) {
        var text = hobbies[levelNum].enemies[enemyNum];
        var color = hobbies[levelNum].color;
        enemyNum++;
        enemies.push(new Enemy(x, y, Math.random() * 360, text, color));
    }
}

function ResetGame() {
    player = new Player(0, 0);
    shots = [];
    if (!enemies) {
        enemies = [];
    }
    if (score > hiscore) {
        hiscore = score;
    }
    score = 0;
}

function Loop() {
    var i, j;
    var currentT = +new Date();
    var elapsedT = currentT - lastT;
    lastT = currentT;

    ClearScreen();

    if (player.active) {
        if (enemyCounter <= 0) {
            SpawnEnemy();
            enemyCounter = EnemySpawnRate * 1000;
        }
        enemyCounter -= elapsedT;
    } else {
        CenterMessage("GAME OVER", canvas.height / 2, "red");
        CenterMessage("PRESS SPACE TO PLAY AGAIN", canvas.height - 100, "orange");
    }

    player.move(controller);
    player.draw();

    // TODO: Find a better way to check collision than every enemy with every shot
    for (j = enemies.length - 1; j >= 0; j--) {
        if (enemies[j].active) {
            for (i = shots.length - 1; i >= 0; i--) {
                if (shots[i].active) {
                    if (VectorMag(shots[i].x - enemies[j].x, shots[i].y - enemies[j].y) < shots[i].radius + enemies[j].radius) {
                        shots[i].active = false;
                        enemies[j].damage(ShotDamage);
                        break;
                    }
                }
            }
            if (player.active && VectorMag(player.x - enemies[j].x, player.y - enemies[j].y) < enemies[j].radius) {
                //enemies[j].damage(ShotDamage);
                player.die();
            }
        }
    }

    for (i = shots.length - 1; i >= 0; i--) {
        if (shots[i].active) {
            shots[i].move();
            shots[i].draw();
        } else {
            shots.splice(i, 1);
        }
    }

    for (i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].active) {
            enemies[i].move();
            enemies[i].draw();
        } else {
            enemies.splice(i, 1);
            score++;
            activeEnemies--;
            if (activeEnemies <= 0) {
                levelNum = (levelNum + 1) % hobbies.length;
                enemyNum = 0;
                activeEnemies = hobbies[levelNum].enemies.length;
            }
        }
    }

    if (!player.active && controller.space) {
        ResetGame();
    }

    DrawScore();
    DrawCursor();

    requestAnimationFrame(Loop);
}

window.onkeydown = function (evt) {
    controller.keydown(evt)
};
window.onkeyup = function (evt) {
    controller.keyup(evt)
};
canvas.onmousemove = function (evt) {
    controller.mousemove(evt)
};
canvas.onmousedown = function (evt) {
    controller.mousedown(evt)
};
canvas.onmouseup = function (evt) {
    controller.mouseup(evt)
};

Loop();