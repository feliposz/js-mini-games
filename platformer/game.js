// TODO: Sound?
// TODO: Enemies?
// TODO: Damage?
// TODO: Moving platforms?
// TODO: Down => fall through platform

const Gravity = 0.1;
const PlayerJump = -3;
const PlayerSpeed = 3;
const MaxPlatforms = 20;

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var platforms = [];
var coins = [];
var score = 0;

function Platform(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.draw = function () {
        ctx.fillStyle = "magenta";
        ctx.fillRect(this.x, this.y, this.w, this.h);
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
var left, up, right;

// TODO: Transition?
function NewLevel() {
    var i, coin, x, y, w, h;

    // TODO: Avoid overlapping platforms
    platforms = [];
    for (i = 0; i < MaxPlatforms; i++) {
        w = Math.random() * 70 + 30;
        h = Math.random() * 20 + 10;
        x = Math.random() * (canvas.width - w);
        y = 40 + Math.random() * (canvas.height - 50 - h);
        platforms[i] = new Platform(x, y, w, h);
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
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < platforms.length; i++) {
        platforms[i].draw();
    }

    for (var i = 0; i < coins.length; i++) {
        coins[i].draw();
    }

    if (up) {
        player.jump();
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
    ctx.fillText("Coins: " + score, 30, 30);

    requestAnimationFrame(Loop);
}

window.onkeydown = function (evt) {
    switch (evt.keyCode) {
        case 37:
            left = true;
            break;
        case 38:
            up = true;
            break;
        case 39:
            right = true;
            break;
    }
}

window.onkeyup = function (evt) {
    switch (evt.keyCode) {
        case 37:
            left = false;
            break;
        case 38:
            up = false;
            break;
        case 39:
            right = false;
            break;
    }
}

NewLevel();
Loop();