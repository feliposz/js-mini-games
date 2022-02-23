"use strict";

var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    board = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ],
    border = 30,
    lineSep = 10,
    padding = 10,
    squareWidth = (canvas.width - border * 2 - lineSep * 2) / 3,
    squareHeight = (canvas.height - border * 2 - lineSep * 2) / 3,
    mouseX = 0,
    mouseY = 0,
    mouseIsPressed = false,
    mouseWasPressed = false,
    mouseClicked = false,
    player = 1,
    winner = 0;

function drawCross(x, y, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(x + padding, y + padding);
    ctx.lineTo(x + squareWidth - padding, y + squareHeight - padding);
    ctx.moveTo(x + padding, y + squareHeight - padding);
    ctx.lineTo(x + squareWidth - padding, y + padding);
    ctx.stroke();
    ctx.closePath();
}

function drawCircle(x, y, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(x + squareWidth / 2, y + squareHeight / 2, Math.min(squareWidth, squareHeight) / 2 - padding, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();
}

function drawBoard() {
    var col, row, x, y, mouseOver;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.fillRect(border, border, canvas.width - border * 2, canvas.height - border * 2);

    for (col = 0; col < 3; col++) {
        for (row = 0; row < 3; row++) {
            x = border + col * (squareWidth + lineSep);
            y = border + row * (squareHeight + lineSep);
            if (mouseX >= x && mouseX <= x + squareWidth && mouseY >= y && mouseY <= y + squareHeight) {
                mouseOver = true;
            } else {
                mouseOver = false;
            }
            ctx.fillStyle = mouseOver ? "lightgray" : "gray";
            ctx.fillRect(x, y, squareWidth, squareHeight);
            if (board[row][col] === 1) {
                drawCircle(x, y, "red");
            } else if (board[row][col] === 2) {
                drawCross(x, y, "blue");
            } else if (board[row][col] === 0 && mouseOver && player === 1) {
                drawCircle(x, y, "darkred");
            } else if (board[row][col] === 0 && mouseOver && player === 2) {
                drawCross(x, y, "darkblue");
            }
        }
    }
}

function newGame() {
    var row, col;
    winner = 0;
    for (col = 0; col < 3; col++) {
        for (row = 0; row < 3; row++) {
            board[row][col] = 0;
        }
    }
}

function checkAction() {
    var row, col, x, y;
    if (winner === 0 && mouseClicked) {
        for (col = 0; col < 3; col++) {
            for (row = 0; row < 3; row++) {
                x = border + col * (squareWidth + lineSep);
                y = border + row * (squareHeight + lineSep);
                if (mouseX >= x && mouseX <= x + squareWidth && mouseY >= y && mouseY <= y + squareHeight) {
                    if (board[row][col] === 0) {
                        board[row][col] = player;
                        player = player === 1 ? 2 : 1;
                        return;
                    }
                }
            }
        }
    }
    if (winner > 0 && mouseClicked) {
        newGame();
    }
}

function checkBoard() {
    var row, col;
    for (row = 0; row < 3; row++) {
        if (board[row][0] === board[row][1] && board[row][0] === board[row][2]) {
            winner = board[row][0];
            return;
        }
    }
    for (col = 0; col < 3; col++) {
        if (board[0][col] === board[1][col] && board[0][col] === board[2][col]) {
            winner = board[0][col];
            return;
        }
    }
    if (board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
        winner = board[0][0];
        return;
    }
    if (board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
        winner = board[0][2];
        return;
    }
    // TODO: Check for early tie
    for (row = 0; row < 3; row++) {
        for (col = 0; col < 3; col++) {
            if (board[row][col] === 0) {
                winner = 0;
                return; // Found empty spot
            }
        }
    }
    winner = 3; // Tie
}

function drawResult() {
    var text, m;
    if (winner > 0) {
        switch (winner) {
            case 1:
                text = "Player O wins!";
                break;
            case 2:
                text = "Player X wins!";
                break;
            default:
                text = "Game tied!";
                break;
        }
        ctx.font = "48px sans-serif"
        m = ctx.measureText(text);
        ctx.fillStyle = "purple";
        ctx.fillText(text, canvas.width / 2 - m.width / 2, canvas.height / 2);
        ctx.fillStyle = "yellow";
        ctx.fillText(text, canvas.width / 2 - m.width / 2 - 3, canvas.height / 2 - 3);
        ctx.font = "24px sans-serif"
        text = "click for new game";
        m = ctx.measureText(text);
        ctx.fillStyle = "yellow";
        ctx.fillStyle = "purple";
        ctx.fillText(text, canvas.width / 2 - m.width / 2, canvas.height / 2 + 50);
        ctx.fillStyle = "lime";
        ctx.fillText(text, canvas.width / 2 - m.width / 2 - 1, canvas.height / 2 - 1 + 50);
    }
}

function loop() {
    checkAction();
    checkBoard();
    drawBoard();
    drawResult();

    // TODO: Allow new game
    // TODO: AI player
    requestAnimationFrame(loop);

    mouseClicked = !mouseIsPressed && mouseWasPressed;
    mouseWasPressed = mouseIsPressed;
}

window.onload = function () {
    requestAnimationFrame(loop);
};

canvas.onmousemove = function (evt) {
    var rect = canvas.getBoundingClientRect();
    mouseX = evt.x - rect.left;
    mouseY = evt.y - rect.top;
}

canvas.onmousedown = function (evt) {
    if ((evt.buttons & 1) > 0) {
        mouseIsPressed = true;
    }
}

canvas.onmouseup = function (evt) {
    if ((evt.buttons & 1) === 0) {
        mouseIsPressed = false;
    }
}