var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

function Ball() {
    this.xspeed = 5;
    this.yspeed = 3;
    this.radius = 10;

    this.reset = function () {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.vx = Math.random() < 0.5 ? this.xspeed : -this.xspeed;
        this.vy = Math.random() < 0.5 ? this.yspeed : -this.yspeed;
        this.countdown = 5;
    };

    this.draw = function () {
        if (this.countdown > 0) {
            ctx.font = "72px monospace";
            this.countdown -= 0.05;
            ctx.fillStyle = "Black";
            ctx.fillText(Math.ceil(this.countdown), canvas.width / 2 - 15, canvas.height / 2 + 30);
            ctx.fillStyle = "GreenYellow";
            ctx.fillText(Math.ceil(this.countdown), canvas.width / 2 - 15 - 2, canvas.height / 2 + 30 - 2);
        } else {
            ctx.beginPath();
            ctx.fillStyle = "LightYellow ";
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        }
    }

    /*
        this.move = function() {
            if (this.countdown < 0) {
                this.x += this.vx;
                this.y += this.vy;
            }
        }
    */

    this.reset();
}

function Player(num, color) {
    this.num = num;
    this.width = 20;
    this.height = 50;
    this.speed = 5.2;
    this.score = 0;
    this.color = color;

    this.reset = function () {
        this.x = num == 1 ? 0 : canvas.width - this.width;
        this.y = canvas.height / 2 - this.height / 2;
    }

    this.draw = function () {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    this.move = function (dir) {
        this.y += dir * this.speed;
        if (this.y < 0) {
            this.y = 0;
        } else if (this.y > canvas.height - this.height) {
            this.y = canvas.height - this.height;
        }
    }

    this.reset();
}


var ball = new Ball;
var p1 = new Player(1, "DodgerBlue");
var p2 = new Player(2, "DarkOrange");
var humanPlayers = 0;
var p1dir = 0,
    p2dir = 0;
var missed = false;

function Clear() {
    ctx.fillStyle = "Indigo";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function CenterLine() {
    ctx.fillStyle = "Purple";
    for (var y = 0; y < canvas.height; y += 20) {
        ctx.fillRect(canvas.width / 2 - 5, y, 10, 10);
    }
}

function DrawScores() {
    ctx.font = "30px monospace";
    ctx.fillStyle = p1.color;
    ctx.fillText(p1.score, 0.25 * canvas.width, 40);
    ctx.fillStyle = p2.color;
    ctx.fillText(p2.score, 0.75 * canvas.width, 40);
}

function Reset() {
    missed = false;
    ball.reset();
    p1.reset();
    p2.reset();
}

function GameLoop() {
    Clear();
    CenterLine();
    DrawScores();

    if (!missed) {
        p1.move(p1dir);
        p2.move(p2dir);
    }

    var i, iter = 5;

    if (ball.countdown < 0) {
        for (i = 0; i < iter; i++) {

            // move ball
            ball.x += ball.vx / iter;
            ball.y += ball.vy / iter;

            // bounce from wall
            if (ball.y - ball.radius < 0 ||
                ball.y + ball.radius > canvas.height) {
                ball.vy *= -(1 + 0.05 - Math.random() * 0.1);
                ball.y += ball.vy;
                break;
            }

            // collide with pads
            if (!missed) {
                if (ball.x - ball.radius < p1.x + p1.width) {
                    if (ball.y + ball.radius > p1.y &&
                        ball.y - ball.radius < p1.y + p1.height) {
                        ball.vx *= -(1 + Math.random() * 0.05);
                    } else {
                        missed = true;
                    }
                }

                if (ball.x + ball.radius > p2.x) {
                    if (ball.y + ball.radius > p2.y &&
                        ball.y - ball.radius < p2.y + p2.height) {
                        ball.vx *= -(1 + Math.random() * 0.05);
                    } else {
                        missed = true;
                    }
                }
            }
        }
    }

    if (missed) {
        if (ball.x < 0) {
            p2.score++;
            Reset();
        } else if (ball.x > canvas.width) {
            p1.score++;
            Reset();
        }
    }

    if (humanPlayers < 1) {
        p1dir = 0
        if (ball.vx < 0 && ball.x < canvas.width / 2) {
            if (p1.y + p1.height / 2 < ball.y) {
                p1dir = 1;
            } else if (p1.y + p1.height / 2 > ball.y) {
                p1dir = -1;
            }
        }
    }

    if (humanPlayers < 2) {
        p2dir = 0;
        if (ball.vx > 0 && ball.x > canvas.width / 2) {
            if (p2.y + p2.height / 2 < ball.y) {
                p2dir = 1;
            } else if (p2.y + p2.height / 2 > ball.y) {
                p2dir = -1;
            }
        }
    }

    p1.draw();
    p2.draw();
    ball.draw();
    window.requestAnimationFrame(GameLoop);

    /*
        var fps;
        if (ball.x < 60 || ball.x > canvas.width - 60) {
            fps = 3;
        } else {
            fps = 60;
        }

        setTimeout(GameLoop, 1000/fps);
    */
}

function KeyDown(evt) {
    switch (evt.keyCode) {
        case 87:
            p1dir = -1;
            break;
        case 83:
            p1dir = 1
            break;
        case 38:
            p2dir = -1;
            break;
        case 40:
            p2dir = 1;
            break;
    }
}

function KeyUp(evt) {
    switch (evt.keyCode) {
        case 87:
            p1dir = 0;
            break;
        case 83:
            p1dir = 0;
            break;
        case 38:
            p2dir = 0;
            break;
        case 40:
            p2dir = 0;
            break;
    }
}

window.addEventListener("keydown", KeyDown);
window.addEventListener("keyup", KeyUp);
GameLoop();