var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var gridSize = 40;
var cellSize = canvas.width / gridSize;
var player = {
    x: gridSize / 2,
    y: gridSize / 2,
    direction: 0
};
var apple = {
    x: 0,
    y: 0
};
var cellsPerSecond = 10;
var lastT = +new Date;
var elapsedT = 0;
var tail = [];
var tailSize = 5;
var score = 0;
var maxScore = 0;
var paused = true;
var moved = true;
var gameOver = false;

function NewApple() {
    var valid;
    do {
        apple.x = Math.floor(Math.random() * gridSize);
        apple.y = Math.floor(Math.random() * gridSize);
        valid = true;
        for (var i = 0; i < tail.length; i++) {
            if (apple.x === tail[i].x && apple.y === tail[i].y) {
                valid = false;
                break;
            }
        }
    } while (!valid);
}

function MovePlayer() {

    tail.push({
        x: player.x,
        y: player.y
    });

    switch (player.direction) {
        case 0:
            player.x++;
            break;
        case 1:
            player.y++;
            break;
        case 2:
            player.x--;
            break;
        case 3:
            player.y--;
            break;
    }

    if (player.x < 0) {
        player.x = gridSize - 1;
    }
    if (player.x >= gridSize) {
        player.x = 0;
    }
    if (player.y < 0) {
        player.y = gridSize - 1;
    }
    if (player.y >= gridSize) {
        player.y = 0;
    }

    if (tail.length > tailSize) {
        tail.shift();
    }

    moved = true;
}

function ClearScreen() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function DrawScore() {
    ctx.font = "25px monospace"
    ctx.fillStyle = "yellow";
    ctx.fillText("Score: " + score + " (Max: " + maxScore + ")", 30, 30);
}

function DrawPause() {
    ctx.font = "25px monospace"
    var text;
    if (gameOver) {
        text = "G A M E  O V E R :(";
        ctx.fillStyle = "orange";
    } else {
        text = "P A U S E";
        ctx.fillStyle = "white";
    }
    var metrics = ctx.measureText(text);
    ctx.fillText(text, canvas.width / 2 - metrics.width / 2, canvas.height / 2);
}

function DrawApple() {
    ctx.fillStyle = "red";
    ctx.fillRect(apple.x * cellSize, apple.y * cellSize, cellSize - 1, cellSize - 1);
}

function DrawPlayer() {
    ctx.fillStyle = "green";
    for (var i = 0; i < tail.length; i++) {
        ctx.fillRect(tail[i].x * cellSize, tail[i].y * cellSize, cellSize - 1, cellSize - 1);
    }
    ctx.fillStyle = "lime";
    ctx.fillRect(player.x * cellSize, player.y * cellSize, cellSize - 1, cellSize - 1);
}

function GameOver() {
    NewApple();
    player.x = player.y = gridSize / 2;
    score = 0;
    tailSize = 5;
    tail = [];
    paused = true;
    gameOver = true;
}

function CheckCollision() {
    for (var i = 0; i < tail.length; i++) {
        if (player.x === tail[i].x && player.y === tail[i].y) {
            GameOver();
            break;
        }
    }
    if (player.x === apple.x && player.y === apple.y) {
        NewApple();
        tailSize++;
        score++;
        if (score > maxScore) {
            maxScore = score;
        }
    }
}

function Loop() {
    var currentT = +new Date
    var deltaT = currentT - lastT;
    lastT = currentT;

    ClearScreen();

    if (paused) {
        DrawPause();
    } else {
        DrawPlayer();
        DrawApple();
        elapsedT += deltaT;
        if (elapsedT > 1000 / cellsPerSecond) {
            elapsedT -= 1000 / cellsPerSecond;
            MovePlayer();
            CheckCollision();
        }
    }

    DrawScore();

    requestAnimationFrame(Loop);
}

function KeyDown(event) {
    if (event.keyCode === 80 || event.keyCode === 32) {
        paused = true;
    } else {
        paused = false;
        gameOver = false;
    }
    if (moved) {
        if (event.keyCode === 37 && player.direction !== 0) {
            player.direction = 2;
        } else if (event.keyCode === 38 && player.direction !== 1) {
            player.direction = 3;
        } else if (event.keyCode === 39 && player.direction !== 2) {
            player.direction = 0;
        } else if (event.keyCode === 40 && player.direction !== 3) {
            player.direction = 1;
        }
        moved = false;
    }
}

window.onkeydown = KeyDown;
window.onblur = function () {
    paused = true;
};
NewApple();
Loop();