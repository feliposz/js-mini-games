"use strict";

var cv = document.getElementById("cv");
var ctx = cv.getContext("2d");

// TODO: High scores/Best times (cookies?)
// TODO: Preset levels
// TODO: Custom field size and difficulty
// TODO: Fixed cell size? Resize canvas instead?
// TODO: Field formats
// TODO: Animations
// TODO: Other grid formats (Hex, Triangular) - Do it in other games?!
// TODO: Digital display

var field = [];
var cover = [];
var fieldWidth = 20;
var fieldHeight = 15;
var topHeight = 50;
var numBombs = Math.floor(fieldWidth * fieldHeight / 10); // TODO: What is a good percentage to fill?
var cellWidth = cv.width / fieldWidth;
var cellHeight = (cv.height - topHeight) / fieldHeight;
var fontSize = Math.floor(0.75 * Math.min(cellWidth, cellHeight));
var cellColor = [null, "blue", "green", "red", "darkblue", "purple", "teal", "black", "darkgray"];
var BOMB = 10,
    TRIGGERED_BOMB = 11,
    WRONG_BOMB = 12,
    EMPTY = 0,
    CLOSED = 0,
    OPEN = 1,
    FLAGGED = 2,
    SUSPECT = 3;
var firstMove = true,
    gameOver = false,
    gameWon = false;
var flagsLeft = numBombs;
var startTime = 0,
    endTime = 0,
    timer = 0,
    mousePressed = false;

function checkBomb(i, j) {
    if (i >= 0 && i < fieldHeight && j >= 0 && j < fieldWidth) {
        return field[i][j] === BOMB;
    } else {
        return false;
    }
}

function emptyField() {
    var i, j;
    // Empty field
    field = [];
    cover = [];
    for (i = 0; i < fieldHeight; i++) {
        field[i] = [];
        cover[i] = [];
        for (j = 0; j < fieldWidth; j++) {
            field[i][j] = EMPTY;
            cover[i][j] = CLOSED;
        }
    }
}

function placeBombs(iEmpty, jEmpty) {
    var i, j, b;
    // Place bombs
    for (b = 0; b < numBombs; b++) {
        i = Math.floor(Math.random() * fieldHeight);
        j = Math.floor(Math.random() * fieldWidth);
        if (i >= iEmpty - 1 && i <= iEmpty + 1 && j >= jEmpty - 1 && j <= jEmpty + 1) {
            b--;
        } else if (field[i][j] === EMPTY) {
            field[i][j] = BOMB;
        } else {
            b--; // Try another location
        }
    }
    // Count numBombs
    for (i = 0; i < fieldHeight; i++) {
        for (j = 0; j < fieldWidth; j++) {
            if (field[i][j] === EMPTY) {
                if (checkBomb(i, j - 1)) {
                    field[i][j]++;
                }
                if (checkBomb(i, j + 1)) {
                    field[i][j]++;
                }
                if (checkBomb(i - 1, j)) {
                    field[i][j]++;
                }
                if (checkBomb(i - 1, j - 1)) {
                    field[i][j]++;
                }
                if (checkBomb(i - 1, j + 1)) {
                    field[i][j]++;
                }
                if (checkBomb(i + 1, j)) {
                    field[i][j]++;
                }
                if (checkBomb(i + 1, j - 1)) {
                    field[i][j]++;
                }
                if (checkBomb(i + 1, j + 1)) {
                    field[i][j]++;
                }
            }
        }
    }
}

function drawFace() {
    var faceSize = topHeight * 0.5;

    ctx.fillStyle = "rgb(255, 240, 50)";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1.5;

    // face O
    ctx.beginPath();
    ctx.arc(cv.width / 2, topHeight / 2, faceSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    if (!gameOver) {
        // eyes ..
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(cv.width / 2 - faceSize * 0.15, topHeight / 2 - faceSize * 0.15, 2, 0, Math.PI * 2);
        ctx.arc(cv.width / 2 + faceSize * 0.15, topHeight / 2 - faceSize * 0.15, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        // mouth :)
        ctx.strokeStyle = "black";
        if (mousePressed) {
            ctx.beginPath();
            ctx.arc(cv.width / 2, topHeight / 2 + faceSize * 0.2, faceSize / 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.closePath();
        } else {
            ctx.beginPath();
            ctx.arc(cv.width / 2, topHeight / 2 + faceSize * 0.05, faceSize / 4, 0, Math.PI);
            ctx.stroke();
            ctx.closePath();
        }
    } else if (gameWon) {
        // glasses B
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(cv.width / 2 - faceSize * 0.15, topHeight / 2 - faceSize * 0.15, 4, -Math.PI * 0.1, Math.PI * 1.1);
        ctx.arc(cv.width / 2 + faceSize * 0.15, topHeight / 2 - faceSize * 0.15, 4, -Math.PI * 0.1, Math.PI * 1.1);
        ctx.fill();
        ctx.closePath();
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(cv.width / 2 - faceSize * 0.15 - 3.5, topHeight / 2 - faceSize * 0.15);
        ctx.lineTo(cv.width / 2 - faceSize / 2, topHeight / 2);
        ctx.moveTo(cv.width / 2 + faceSize * 0.15 + 3.5, topHeight / 2 - faceSize * 0.15);
        ctx.lineTo(cv.width / 2 + faceSize / 2, topHeight / 2);
        ctx.stroke();
        ctx.closePath();
        // mouth B)
        ctx.beginPath();
        ctx.arc(cv.width / 2, topHeight / 2 + faceSize * 0.05, faceSize / 4, 0, Math.PI);
        ctx.stroke();
        ctx.closePath();
    } else {
        // eyes X X
        ctx.fillStyle = "black";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cv.width / 2 - faceSize * 0.2, topHeight / 2 - faceSize * 0.2);
        ctx.lineTo(cv.width / 2 - faceSize * 0.1, topHeight / 2 - faceSize * 0.1);
        ctx.moveTo(cv.width / 2 - faceSize * 0.2, topHeight / 2 - faceSize * 0.1);
        ctx.lineTo(cv.width / 2 - faceSize * 0.1, topHeight / 2 - faceSize * 0.2);
        ctx.moveTo(cv.width / 2 + faceSize * 0.2, topHeight / 2 - faceSize * 0.2);
        ctx.lineTo(cv.width / 2 + faceSize * 0.1, topHeight / 2 - faceSize * 0.1);
        ctx.moveTo(cv.width / 2 + faceSize * 0.2, topHeight / 2 - faceSize * 0.1);
        ctx.lineTo(cv.width / 2 + faceSize * 0.1, topHeight / 2 - faceSize * 0.2);
        ctx.stroke();
        ctx.closePath();
        // mouth :(
        ctx.lineWidth = 1.5;
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(cv.width / 2, topHeight / 2 + faceSize * 0.33, faceSize / 4, Math.PI, 0);
        ctx.stroke();
        ctx.closePath();
    }
}

function drawDisplay() {
    var m;
    // TODO: Center text vertically
    ctx.font = Math.floor(topHeight / 2) + "px monospace";
    ctx.fillStyle = "rgb(100, 0, 200)";
    ctx.fillRect(0, 0, cv.width, topHeight);
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillText("Flags: " + flagsLeft, 10, 5 + fontSize * 0.65);
    m = ctx.measureText("Timer: " + timer);
    ctx.fillText("Timer: " + timer, cv.width - m.width - 10, 5 + fontSize * 0.65);
    drawFace();
}

function drawField() {
    var i, j, x, y, m, c, timer;
    ctx.font = fontSize + "px monospace";
    for (i = 0; i < fieldHeight; i++) {
        y = i * cellHeight + topHeight;
        for (j = 0; j < fieldWidth; j++) {
            x = j * cellWidth;
            c = field[i][j];
            if (cover[i][j] === OPEN) {
                ctx.strokeStyle = "black";
                ctx.fillStyle = c === TRIGGERED_BOMB ? "red" : "lightgray";
                ctx.fillRect(x, y, cellWidth, cellHeight);
                ctx.strokeRect(x, y, cellWidth, cellHeight);
                if (c >= 1 && c <= 8) {
                    ctx.fillStyle = cellColor[c];
                    m = ctx.measureText(c);
                    ctx.fillText(c, x + cellWidth / 2 - m.width / 2, y + cellHeight * 0.75);
                } else if (c === BOMB || c === TRIGGERED_BOMB || c === WRONG_BOMB) {
                    ctx.beginPath();
                    ctx.fillStyle = "black";
                    ctx.arc(x + cellWidth / 2, y + cellHeight / 2, fontSize * 0.33, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.closePath();
                    if (c === WRONG_BOMB) {
                        ctx.beginPath();
                        ctx.strokeStyle = "red";
                        ctx.moveTo(x, y);
                        ctx.lineTo(x + cellWidth, y + cellHeight);
                        ctx.moveTo(x, y + cellHeight);
                        ctx.lineTo(x + cellWidth, y);
                        ctx.stroke();
                        ctx.closePath();
                    }
                }
            } else {
                // base
                ctx.fillStyle = "rgb(175, 175, 255)";
                ctx.fillRect(x, y, cellWidth, cellHeight);
                // bright
                ctx.fillStyle = "rgb(200, 200, 255)";
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + cellWidth, y);
                ctx.lineTo(x + cellWidth - 5, y + 5);
                ctx.lineTo(x + 5, y + 5);
                ctx.lineTo(x + 5, y + cellHeight - 5);
                ctx.lineTo(x, y + cellHeight);
                ctx.lineTo(x, y);
                ctx.fill();
                ctx.closePath();
                // shadow
                ctx.fillStyle = "rgb(50, 50, 150)";
                ctx.beginPath();
                ctx.moveTo(x + cellWidth, y);
                ctx.lineTo(x + cellWidth - 5, y + 5);
                ctx.lineTo(x + cellWidth - 5, y + cellHeight - 5);
                ctx.lineTo(x + 5, y + cellHeight - 5);
                ctx.lineTo(x, y + cellHeight);
                ctx.lineTo(x + cellWidth, y + cellHeight);
                ctx.lineTo(x + cellWidth, y);
                ctx.fill();
                ctx.closePath();
                if (cover[i][j] === FLAGGED) {
                    // TODO: Draw a proper flag!
                    c = "!";
                    m = ctx.measureText(c);
                    ctx.fillStyle = "red";
                    ctx.fillText(c, x + cellWidth / 2 - m.width / 2, y + cellHeight * 0.75);
                } else if (cover[i][j] === SUSPECT) {
                    c = "?";
                    m = ctx.measureText(c);
                    ctx.fillStyle = "black";
                    ctx.fillText(c, x + cellWidth / 2 - m.width / 2, y + cellHeight * 0.75);
                }
            }
        }
    }
}

function revealEmpty(i, j) {
    if (i >= 0 && i < fieldHeight && j >= 0 && j < fieldWidth) {
        if (cover[i][j] === OPEN) {
            return;
        } else if (cover[i][j] === CLOSED) {
            cover[i][j] = OPEN;
            if (field[i][j] === EMPTY) {
                revealEmpty(i, j - 1);
                revealEmpty(i, j + 1);
                revealEmpty(i - 1, j);
                revealEmpty(i - 1, j - 1);
                revealEmpty(i - 1, j + 1);
                revealEmpty(i + 1, j);
                revealEmpty(i + 1, j - 1);
                revealEmpty(i + 1, j + 1);
            }
        }
    }
}

function revealBombs() {
    var i, j;
    for (i = 0; i < fieldHeight; i++) {
        for (j = 0; j < fieldWidth; j++) {
            if (field[i][j] === BOMB) {
                if (cover[i][j] === CLOSED || cover[i][j] === SUSPECT) {
                    cover[i][j] = OPEN;
                }
            } else {
                if (cover[i][j] === FLAGGED) {
                    cover[i][j] = OPEN;
                    field[i][j] = WRONG_BOMB;
                }
            }
        }
    }
}

function uncover(i, j) {
    if (gameOver) {
        return;
    }
    if (i < 0 || j < 0 || i >= fieldHeight || j >= fieldWidth) {
        return;
    }
    if (firstMove) {
        placeBombs(i, j);
        firstMove = false;
    }
    if (cover[i][j] === CLOSED) {
        if (field[i][j] === BOMB) {
            field[i][j] = TRIGGERED_BOMB;
            revealBombs();
            gameOver = true;
        } else if (field[i][j] === EMPTY) {
            revealEmpty(i, j);
        }
        cover[i][j] = OPEN;
    }
}

function checkFlags() {
    var i, j;
    if (flagsLeft > 0) {
        return;
    } else {
        for (i = 0; i < fieldHeight; i++) {
            for (j = 0; j < fieldWidth; j++) {
                if (field[i][j] === BOMB && cover[i][j] !== FLAGGED) {
                    return;
                }
            }
        }
        gameOver = true;
        gameWon = true;
    }
}

function cycle(i, j) {
    if (gameOver) {
        return;
    }
    if (cover[i][j] === CLOSED && flagsLeft > 0) {
        cover[i][j] = FLAGGED;
        flagsLeft--;
        checkFlags();
    } else if (cover[i][j] === FLAGGED) {
        cover[i][j] = SUSPECT;
        flagsLeft++;
    } else if (cover[i][j] === SUSPECT) {
        cover[i][j] = CLOSED;
    }
}

function getCoord(x, y) {
    var rect, i, j;
    rect = cv.getBoundingClientRect();
    x = x - rect.left;
    y = y - rect.top - topHeight;
    i = Math.floor(y / cellHeight);
    j = Math.floor(x / cellWidth);
    return {
        i: i,
        j: j
    };
}

function onclick(evt) {
    var coord = getCoord(evt.clientX, evt.clientY);
    if (!gameOver) {
        uncover(coord.i, coord.j);
        drawField();
    } else {
        if (coord.i < 0) {
            resetGame();
        }
    }
}

function oncontextmenu(evt) {
    var coord = getCoord(evt.clientX, evt.clientY);
    if (!gameOver) {
        cycle(coord.i, coord.j);
        drawField();
    }
    return false;
}

function update() {
    if (!gameOver) {
        timer = Math.floor((new Date() - startTime) / 1000);
    }
    drawDisplay();
}

function resetGame() {
    startTime = +new Date();
    emptyField();
    flagsLeft = numBombs;
    gameOver = false;
    gameWon = false;
    firstMove = true;
    drawField();
    drawDisplay();
}

function setup() {
    cv.onclick = onclick;
    cv.oncontextmenu = oncontextmenu;
    cv.onmousedown = function () {
        mousePressed = true;
    };
    cv.onmouseup = function () {
        mousePressed = false;
    };
    resetGame();
    setInterval(update, 200);
}

window.onload = setup;