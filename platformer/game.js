// TODO: Sound?
// TODO: Enemies?
// TODO: Damage?
// TODO: Moving platforms?
// TODO: Down => fall through platform

const Gravity = 0.2;
const PlayerJump = -8;
const PlayerSpeed = 5;

var skills = [
    {title: "PL/SQL", level: 3},
    {title: "C#", level: 3},
    {title: "ASP.Net", level: 3},
    {title: "HTML", level: 3},
    {title: "CSS", level: 3},
    {title: "Javascript", level: 3},
    {title: "Shell Scripts", level: 3},
    {title: "C/C++", level: 2},
    {title: "Visual Basic", level: 2},
    {title: "Java", level: 2},
    {title: "Python", level: 2},
    {title: "Node.JS", level: 2},
    {title: "Delphi", level: 1},
    {title: "PHP", level: 1},
    {title: "Oracle DB", level: 3},
    {title: "PC Hardware", level: 4},
    {title: "Linux", level: 4},
    {title: "HP-UX", level: 4},
    {title: "Solaris OS", level: 4},
    {title: "AIX", level: 4},
    {title: "HP-UX", level: 4},
    {title: "Networking", level: 4},
    {title: "English", level: 3}
];

const MaxPlatforms = skills.length;

var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;

var ctx = canvas.getContext("2d");

var platforms = [];
var coins = [];
var score = 0;

function Platform(x, y, w, h, text, color) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.text = text;
    this.color = color;

    this.draw = function () {
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = "white";
        var tw = ctx.measureText(this.text).width;
        ctx.fillText(this.text, this.x + this.w / 2 - tw / 2, this.y + 20);
    };
}

function Coin(x, y) {
    this.x = x;
    this.y = y;
    this.size = 4;

    this.draw = function () {
        ctx.fillStyle = "yellow";
        // TODO: Round coins!
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }
}

function Player() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.vy = 0;
    this.w = 10;
    this.h = 20;
    this.jumping = false;

    this.move = function (dir) {
        this.x += dir * PlayerSpeed;

        if (this.x < 0) {
            this.x += canvas.width;
        }
        if (this.x > canvas.width) {
            this.x -= canvas.width;
        }
    };

    this.jump = function () {
        // TODO: Enable only double-jumping, not multiple jumps
        // TODO: Only reenable jump if UP key is released (avoid constant jumping)
        if (!this.jumping) {
            this.vy += PlayerJump;
            this.jumping = true;
        }
    };

    this.update = function () {
        this.vy += Gravity;
        this.y += this.vy;

        if (this.y < 0) {
            this.y += canvas.height;
        }

        if (this.y > canvas.height) {
            this.y -= canvas.height;
        }

        if (this.vy > 0) {
            this.jumping = false;
            for (var i = 0; i < platforms.length; i++) {
                if (this.x >= platforms[i].x &&
                    this.x <= platforms[i].x + platforms[i].w &&
                    this.y >= platforms[i].y &&
                    this.y - this.vy <= platforms[i].y) {
                    this.y = platforms[i].y;
                    this.vy = 0;
                    break;
                }
            }
        }

        for (var i = coins.length - 1; i >= 0; i--) {
            if (coins[i].x >= this.x - this.w / 2 &&
                coins[i].x <= this.x + this.w / 2 &&
                coins[i].y >= this.y - this.h &&
                coins[i].y <= this.y) {
                score++;
                coins.splice(i, 1);
            }
        }
    };

    // TODO: Draw a player character facing left/right/jumping...
    // TODO: Animation?
    this.draw = function () {
        ctx.fillStyle = "cyan";
        ctx.fillRect(this.x - this.w / 2, this.y - this.h, this.w, this.h);
    };
}

var player = new Player;
var left, up, right, down;

// TODO: Transition?
function NewLevel() {
    var i, j, k, coin, x, y, w, h, collided;

    ctx.font = "20px monospace";
    // TODO: Avoid overlapping platforms
    platforms = [];
    for (i = 0; i < MaxPlatforms; i++) {

        for (j = 0; j < 10; j++) {
            w = ctx.measureText(skills[i].title).width + 50; //Math.random()*70+30;  
            h = 30; //Math.random()*20+10;
            x = Math.random() * (canvas.width - w);
            y = 40 + 30 * Math.round(Math.random() * (canvas.height - 50 - h) / 30);

            collided = false;

            for (k = 0; k < i; k++) {
                if ((x >= platforms[k].x) && (x <= platforms[k].x + platforms[k].w) && (y >= platforms[k].y) && x <= (platforms[k].y + platforms[k].h)) {
                    collided = true;
                    break;
                }
                if ((x + w >= platforms[k].x) && (x + w <= platforms[k].x + platforms[k].w) && (y >= platforms[k].y) && y <= (platforms[k].y + platforms[k].h)) {
                    collided = true;
                    break;
                }
                if ((x + w >= platforms[k].x) && (x + w <= platforms[k].x + platforms[k].w) && (y + h >= platforms[k].y) && y + h <= (platforms[k].y + platforms[k].h)) {
                    collided = true;
                    break;
                }
                if ((x >= platforms[k].x) && (x <= platforms[k].x + platforms[k].w) && (y + h >= platforms[k].y) && y + h <= (platforms[k].y + platforms[k].h)) {
                    collided = true;
                    break;
                }
            }

            if (!collided) {
                break;
            }
        }

        var color = ["#000", "#a00", "#f80", "#0a0", "#06f"][skills[i].level];
        platforms[i] = new Platform(x, y, w, h, skills[i].title, color);
    }

    // TODO: Center coins on platform
    // TODO: Different values/sizes/colors
    coins = [];
    for (i = 0; i < platforms.length; i++) {
        for (x = 0; x < platforms[i].w - 10; x += 10) {
            coin = new Coin(platforms[i].x + x + 5, platforms[i].y - 5);
            coins.push(coin);
        }
    }

    i = Math.floor(Math.random() * platforms.length);

    player.x = platforms[i].x + platforms[i].w / 2;
    player.y = platforms[i].y;
    player.vy = 0;
    player.jumping = false;
}

function Loop() {
    ctx.font = "20px monospace";
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;

    for (var i = 0; i < platforms.length; i++) {
        platforms[i].draw();
    }

    for (var i = 0; i < coins.length; i++) {
        coins[i].draw();
    }

    if (up) {
        player.jump();
    }
    if (down) {
        player.y++;
    }
    if (left) {
        player.move(-1);
    }
    if (right) {
        player.move(1);
    }

    player.draw();
    player.update();

    if (coins.length === 0) {
        NewLevel();
    }

    ctx.font = "20px monospace";
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 30, 30);

    ctx.fillText("Platformer Demo", canvas.width - 200, 30);

    requestAnimationFrame(Loop);
}

window.onkeydown = function (evt) {
    switch (evt.keyCode) {
        case 65:
        case 37:
            left = true;
            break;
        case 87:
        case 38:
            up = true;
            break;
        case 39:
        case 68:
            right = true;
            break;
        case 83:
        case 40:
            down = true;
            break;
    }
}

window.onkeyup = function (evt) {
    switch (evt.keyCode) {
        case 65:
        case 37:
            left = false;
            break;
        case 87:
        case 38:
            up = false;
            break;
        case 39:
        case 68:
            right = false;
            break;
        case 83:
        case 40:
            down = false;
            break;
    }
}

NewLevel();
Loop();
