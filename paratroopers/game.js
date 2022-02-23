"use strict";

// ================
// Constants
// ================

const screenWidth = 800;
const screenHeight = 600;
const framesPerSecond = 60;
const cannonSpeed = 0.075;
const cannonAngleLimit = Math.PI * .45;
const cannonDefaultAngle = -Math.PI / 2;
const cannonLength = 50;
const playerHeight = 60;
const playerWidth = 80;
const playerFlashCountdown = 10;
const playerMaxHp = 10;
const trooperWidth = 10;
const trooperHeight = 20;
const trooperFallSpeed = 3;
const trooperChuteSpeed = 1;
const trooperAttackSpeed = 1.5;
const trooperChuteHeight = trooperHeight * 1.5;
const trooperChuteWidth = trooperChuteHeight * 2;
const trooperChuteDeployHeight = screenHeight * .6;
const playerSafeArea = playerWidth + trooperWidth * 4;
const planeSpawnMargin = 50;
const planeSpawnHeight = screenHeight * .33;
const planeSpeed = 2;
const planeWidth = 60;
const planeHeight = 25;
const bulletSpeed = 5;
const bulletSize = 3;
const scorePointsPlane = 10;
const scorePointsTrooper = 15;
const scorePointsChute = 5;
const scorePointsSkillShot = 25;
const levels = [
    {planeSpawnChance: 0.0, maxPlaneSpawnCount: 0}, // unused
    {planeSpawnChance: 1.0, maxPlaneSpawnCount: 10},
    {planeSpawnChance: 1.2, maxPlaneSpawnCount: 20},
    {planeSpawnChance: 1.5, maxPlaneSpawnCount: 25},
    {planeSpawnChance: 2.0, maxPlaneSpawnCount: 40},
    {planeSpawnChance: 2.5, maxPlaneSpawnCount: 50},
    {planeSpawnChance: 3.0, maxPlaneSpawnCount: 60},
    {planeSpawnChance: 3.5, maxPlaneSpawnCount: 70},
    {planeSpawnChance: 4.0, maxPlaneSpawnCount: 80},
    {planeSpawnChance: 5.0, maxPlaneSpawnCount: 100},
    {planeSpawnChance: 6.0, maxPlaneSpawnCount: 120},
    {planeSpawnChance: 7.0, maxPlaneSpawnCount: 140},
    {planeSpawnChance: 8.0, maxPlaneSpawnCount: 150},
    {planeSpawnChance: 9.0, maxPlaneSpawnCount: 180}
];

// ================
// Globals
// ================

// TODO: Remove as many globals as possible!

const control = { reset: false, left: false, right: false, fire: false, energy: 3, energyMax: 3 };
let ctx;
let planes;
let bullets;
let troopers;
let player;
let currentState;
let countdown;
let currentLevel;
let planeSpawnChance;
let planeSpawnCount;
let maxPlaneSpawnCount;


// ===================
// Game initialization
// ===================

gameInit();

function gameInit() {
    // setup screen
    let canvas = document.createElement('canvas');
    canvas.width = screenWidth;
    canvas.height = screenHeight;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');

    // setup controls
    document.addEventListener('keydown', function (e) {
        switch (e.keyCode) {
            case 13:
                control.reset = true;
                break;
            case 32:
                control.fire = true;
                break;
            case 37:
                control.left = true;
                break;
            case 39:
                control.right = true;
                break;
        }
    });
    document.addEventListener('keyup', function (e) {
        switch (e.keyCode) {
            case 13:
                control.reset = false;
                break;
            case 32:
                control.fire = false;
                break;
            case 37:
                control.left = false;
                break;
            case 39:
                control.right = false;
                break;
        }
    });

    gameReset();

    // game loop
    setInterval(gameUpdate, 1000 / framesPerSecond);
}

// ================
// State management
// ================

function gameUpdate() {
    currentState();
}

function gameReset() {
    ctx.globalAlpha = 1;
    player = new Player();
    currentLevel = 0;
    nextLevel();
}

function nextLevel() {
    currentLevel++;
    if (currentLevel < levels.length) {
        planeSpawnCount = 0;
        planeSpawnChance = levels[currentLevel].planeSpawnChance;
        maxPlaneSpawnCount = levels[currentLevel].maxPlaneSpawnCount;
        planes = [];
        troopers = [];
        bullets = [];
        countdown = 100;
        currentState = stateCountDown;
    } else {
        countdown = 100;
        currentState = stateGameWon;
    }
}

function stateCountDown() {
    clearScreen();
    handleControl(false);
    handlePlayer();
    drawHUD();
    ctx.fillStyle = 'magenta';
    ctx.font = '20px monospace';
    var y = screenHeight/2;
    centerText('Wave #' + currentLevel, y);
    y += 20;
    ctx.fillStyle = Math.floor(countdown/3) % 2 ? 'blue' : 'cyan';
    centerText('Enemies aproaching in ' + Math.ceil(countdown/20), y);
    countdown--;
    if (countdown < 0) {
        currentState = statePlaying;
    }
}

function statePlaying() {
    clearScreen();
    handleControl(true);
    handleBullets();
    handlePlanes();
    handleTroopers();
    handlePlayer();
    handleCollisions();
    handleSpawning();
    handleLevelCondition();
    drawHUD();
}

function stateGameOver() {
    countdown--;
    if (countdown > 0) {
        ctx.globalAlpha = 0.05;
        clearScreen();
    } else {
        ctx.globalAlpha = 1;
        clearScreen();
        ctx.fillStyle = 'red';
        ctx.font = '20px monospace';
        var y = screenHeight/2;
        centerText('G A M E  O V E R', y);
        y += 20;
        ctx.fillStyle = 'white';
        centerText('Press ENTER to play again', y);
    }
    if (control.reset) {
        gameReset();
    }
}

function stateGameWon() {
    countdown--;
    if (countdown > 0) {
        ctx.globalAlpha = 0.05;
        clearScreen();
    } else {
        ctx.globalAlpha = 1;
        clearScreen();
        ctx.fillStyle = 'green';
        ctx.font = '20px monospace';
        var y = screenHeight/2;
        centerText('C O N G R A T U L A T I O N S', y);
        y += 20;
        ctx.fillStyle = 'yellow';
        centerText('You won the game!', y);
        y += 20;
        ctx.fillStyle = 'white';
        centerText('Press ENTER to play again', y);
    }
    if (control.reset) {
        gameReset();
    }
}

function centerText(text, y) {
    var w = ctx.measureText(text).width;
    ctx.fillText(text, (screenWidth - w)/2, y);
}

function clearScreen() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, screenWidth, screenHeight);
}

function drawHUD() {
    var x = 50, y = 50;
    ctx.fillStyle = 'cyan';
    ctx.font = '14px monospace';
    ctx.fillText('score: ' + player.score, x, y);
    y += 20;
    ctx.fillText('hp: ' + player.hp, x, y);
}

// =============
// Handlers
// =============

function handlePlayer() {
    player.draw();
}

function handleControl(allowFire) {
    if (control.left) {
        player.cannonAngle -= cannonSpeed;
    }
    if (control.right) {
        player.cannonAngle += cannonSpeed;
    }
    if (player.cannonAngle < cannonDefaultAngle - cannonAngleLimit) {
        player.cannonAngle = cannonDefaultAngle - cannonAngleLimit;
    } else if (player.cannonAngle > cannonDefaultAngle + cannonAngleLimit) {
        player.cannonAngle = cannonDefaultAngle + cannonAngleLimit;
    }
    if (control.fire && allowFire) {
        if (control.energy === control.energyMax) {
            spawnBullet();
            control.energy = 0;
        }
    }
    if (control.energy > control.energyMax) {
        control.energy = control.energyMax;
    } else {
        control.energy++;
    }
}

function handleSpawning() {
    if (Math.random() * 100 < planeSpawnChance && planeSpawnCount < maxPlaneSpawnCount) {
        spawnPlane();
    }
}

function handleBullets() {
    var i;
    for (i = bullets.length - 1; i >= 0; i--) {
        if (bullets[i].remove) {
            bullets.splice(i, 1);
        } else {
            bullets[i].update();
            bullets[i].draw();
        }
    }
}

function handlePlanes() {
    var i;
    for (i = planes.length - 1; i >= 0; i--) {
        if (planes[i].remove) {
            planes.splice(i, 1);
        } else {
            planes[i].update();
            planes[i].draw();
        }
    }
}

function handleTroopers() {
    var i;
    for (i = troopers.length - 1; i >= 0; i--) {
        if (troopers[i].remove) {
            troopers.splice(i, 1);
        } else {
            troopers[i].update();
            troopers[i].draw();
        }
    }
}

function handleCollisions() {
    var i, j;
    for (i = 0; i < bullets.length; i++) {
        // Bullets vs. Planes
        for (j = 0; j < planes.length; j++) {
            if (checkPointInRect(bullets[i], planes[j].getRect())) {
                bullets[i].remove = true;
                planes[j].remove = true;
                player.addScore(scorePointsPlane);
            }
        }
        // Bullets vs. Troopers and parachutes
        for (j = 0; j < troopers.length; j++) {
            if (checkPointInRect(bullets[i], troopers[j].getRect())) {
                bullets[i].remove = true;
                troopers[j].remove = true;
                if (troopers[j].isChuteDeployed && !troopers[j].isChuteOpen) {
                    player.addScore(scorePointsSkillShot);
                } else {
                    player.addScore(scorePointsTrooper);
                }
            }
            if (checkPointInRect(bullets[i], troopers[j].getChuteRect())) {
                bullets[i].remove = true;
                troopers[j].isChuteOpen = false;
                player.addScore(scorePointsChute);
            }

        }
    }
}

function handleLevelCondition() {
    if (planeSpawnCount >= maxPlaneSpawnCount && planes.length === 0 && troopers.length === 0 && player.hp > 0) {
        nextLevel();
    }
}

function checkPointInRect(point, rect) {
    // No need to check if one of them is already flagged for removal
    if (point.remove || rect.remove) {
        return false;
    }
    return point.x >= rect.x1 && point.x < rect.x2 && point.y >= rect.y1 && point.y < rect.y2;
}

// =============
// Spawners
// =============

function spawnBullet() {
    bullets.push(new Bullet(player.cannonX, player.cannonY, player.cannonAngle));
}

function spawnTrooper(x, y) {
    troopers.push(new Trooper(x, y));
}

function spawnPlane() {
    var x, y, xv, yv;
    var goingRight = Math.random() < 0.5;
    xv = goingRight ? planeSpeed : -planeSpeed;
    yv = 0;
    x = goingRight ? (-planeWidth / 2) : (screenWidth + planeWidth / 2);
    y = Math.random() * planeSpawnHeight + planeSpawnMargin;
    planes.push(new Plane(x, y, xv, yv));
    planeSpawnCount++;
}

// =============
// Plane class
// =============

function Plane(x, y, xv, yv) {
    this.x = x;
    this.y = y;
    this.xv = xv;
    this.yv = yv;
    this.t = Math.random();
    this.tv = 0.1 + Math.random() / 20;
    this.w = planeWidth;
    this.h = planeHeight;
    this.trooperDropped = false;
    this.trooperDropCoordX = Math.random() * (screenWidth - playerSafeArea);
    // If trooper spawns too close to player, move it outside of player area
    if (this.trooperDropCoordX >= player.x - playerSafeArea / 2) {
        this.trooperDropCoordX += playerSafeArea;
    }
    this.remove = false;
}

Plane.prototype.update = function () {
    this.x += this.xv;
    this.y += this.yv;
    this.t += this.tv;
    this.yv = Math.sin(this.t);
    // Remove planes that moved out of screen
    if (this.x + this.w / 2 < 0 || this.x - this.w / 2 > screenWidth || this.y + this.h / 2 < 0 || this.y - this.h / 2 > screenHeight) {
        this.remove = true;
    }
    // Reached droping position
    if (!this.trooperDropped && Math.abs(this.x - this.trooperDropCoordX) < 1) {
        spawnTrooper(this.x, this.y);
        this.trooperDropped = true;
    }
}

Plane.prototype.draw = function () {
    ctx.fillStyle = 'orange';
    ctx.fillRect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
}

Plane.prototype.getRect = function () {
    return {
        x1: this.x - this.w / 2,
        y1: this.y - this.h / 2,
        x2: this.x + this.w / 2,
        y2: this.y + this.h / 2
    };
}

// =============
// Bullet class
// =============

function Bullet(x, y, angle) {
    this.x = x;
    this.y = y;
    this.xv = Math.cos(angle) * bulletSpeed;
    this.yv = Math.sin(angle) * bulletSpeed;
    this.r = bulletSize;
    this.color = 'yellow';
    this.remove = false;
}

Bullet.prototype.update = function () {
    this.x += this.xv;
    this.y += this.yv;
    if (this.x < 0 || this.x > screenWidth || this.y < 0 || this.y > screenHeight) {
        this.remove = true;
    }
}

Bullet.prototype.draw = function () {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

// =============
// Player class
// =============

function Player() {
    this.w = playerWidth;
    this.h = playerHeight;
    this.x = screenWidth / 2;
    this.y = screenHeight - this.h;
    this.cannonAngle = cannonDefaultAngle;
    this.cannonX = 0;
    this.cannonY = 0;
    this.hp = playerMaxHp;
    this.score = 0;
    this.flashCountdown = 0;
}

Player.prototype.draw = function () {
    if (this.flashCountdown > 0) {
        ctx.fillStyle = Math.floor(this.flashCountdown / 2) % 2 ? 'white' : 'red';
        this.flashCountdown--;
    } else {
        ctx.fillStyle = 'lightgray';
    }
    ctx.fillRect(this.x - this.w / 2, this.y, this.w, this.h);
    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    this.cannonX = this.x + Math.cos(this.cannonAngle) * cannonLength;
    this.cannonY = this.y + Math.sin(this.cannonAngle) * cannonLength;
    ctx.lineTo(this.cannonX, this.cannonY);
    ctx.stroke();
    ctx.closePath();
};

Player.prototype.dealDamage = function () {
    if (this.hp > 0) {
        this.hp--;
        this.flashCountdown = playerFlashCountdown;
    } 
    if (this.hp === 0) {
        countdown = 100;
        currentState = stateGameOver;
    }
}

Player.prototype.addScore = function (points) {
    // Each 1000 points gives 1 more hp
    if (Math.floor(this.score / 1000) != Math.floor((this.score + points) / 1000)) {
        this.hp++;
    }
    this.score += points;
}

// =============
// Trooper class
// =============

function Trooper(x, y) {
    this.x = x;
    this.y = y;
    this.w = trooperWidth;
    this.h = trooperHeight;
    this.isFalling = true;
    this.isChuteDeployed = false;
    this.isChuteOpen = false;
    this.isAttacking = false;
    this.color = 'red';
    this.chuteColor = 'white';
    this.remove = false;
}

Trooper.prototype.draw = function () {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.w / 2, this.y - this.h, this.w, this.h);
    if (this.isChuteOpen) {
        ctx.fillStyle = this.chuteColor;
        ctx.fillRect(this.x - trooperChuteWidth / 2, this.y - this.h - trooperChuteHeight, trooperChuteWidth, trooperChuteHeight);
    }
}

Trooper.prototype.update = function () {
    if (this.isFalling) {
        if (this.isChuteOpen) {
            this.y += trooperChuteSpeed;
        } else {
            this.y += trooperFallSpeed;
        }
        if (this.y >= screenHeight) {
            if (!this.isChuteOpen) {
                // Trooper crashed on the ground
                this.remove = true;
            } else {
                // Safe landing, start attack
                this.y = screenHeight;
                this.isFalling = false;
                this.isChuteOpen = false;
                this.isAttacking = true;
            }
        }
    }
    if (!this.isChuteDeployed) {
        if (this.y >= trooperChuteDeployHeight) {
            this.isChuteOpen = true;
            this.isChuteDeployed = true;
        }
    }
    if (this.isAttacking) {
        if (this.x < player.x - player.w / 2) { 
            // Left of target
            this.x += trooperAttackSpeed;
        } else if (this.x > player.x + player.w / 2) { 
            // Right of target
            this.x -= trooperAttackSpeed;
        } else { 
            // Reached target
            // TODO: Move this to handleCollisions!
            this.isAttacking = false;
            this.remove = true;
            player.dealDamage();
        }
    }
}

Trooper.prototype.getRect = function () {
    return {
        x1: this.x - this.w / 2,
        y1: this.y - this.h,
        x2: this.x + this.w / 2,
        y2: this.y
    };
}

Trooper.prototype.getChuteRect = function () {
    return {
        x1: this.x - trooperChuteWidth / 2,
        y1: this.y - this.h - trooperChuteHeight,
        x2: this.x + trooperChuteWidth / 2,
        y2: this.y - this.h
    };
}

