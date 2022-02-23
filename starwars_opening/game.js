"use strict";

var canvas = document.createElement('canvas');
window.scrollbars = 'no';
document.body.style.margin = 0;
document.body.style.padding = 0;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
var ctx = canvas.getContext('2d');

var text = [
    "           Episode IV",
    "           A NEW HOPE",
    "",
    "It is a period of civil war. Rebel",
    "spaceships,   striking    from   a",
    "hidden base,  have won their first",
    "victory against  the evil Galactic",
    "Empire.",
    "",
    "During  the  battle,  Rebel  spies",
    "managed  to steal secret plans  to",
    "the   Empire's   ultimate  weapon,",
    "the   DEATH   STAR,   an   armored",
    "space  station  with  enough power",
    "to destroy an entire planet.",
    "",
    "Pursued  by  the Empire's sinister",
    "agents,  Princess Leia  races home",
    "aboard her starship,  custodian of",
    "the  stolen  plans  that  can save",
    "her  people  and  restore  freedom",
    "to the galaxy....",
    ""
];

const textSize = 60;
const textSpace = 5;
const textFont = textSize + "px sans-serif"

var starsCv = document.createElement('canvas');
var starsCtx = starsCv.getContext('2d');
starsCv.width = canvas.width;
starsCv.height = canvas.height;

var txtCv = document.createElement('canvas');
var txtCtx = txtCv.getContext('2d');

var time = 0;

function getTextDimensions(text, ctx) {
    var dim = {};
    var i;
    dim.height = (1 + text.length) * (textSize + textSpace);
    dim.width = 0;
    ctx.font = textFont;
    for (i = 0; i < text.length; i++) {
        var w = ctx.measureText(text[i]).width;
        if (w > dim.width) {
            dim.width = w;
        }
    }
    return dim;
}

function drawStarBackground(cv, ctx) {
    var i;
    var x, y, c, s, color;
    ctx.fillStyle = 'rgba(0, 0, 0, 255)';
    ctx.fillRect(0, 0, cv.width, cv.height);
    for (i = 0; i < 1000; i++) {
        x = Math.random() * cv.width;
        y = Math.random() * cv.height;
        c = Math.trunc(Math.random() * 150) + 30;
        s = Math.random() * 3;
        color = "rgb(" + c + "," + c + "," + c + ", 255)";
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}

function updateText(cv, ctx) {
    var i, x, y, t;
    ctx.font = textFont;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0)'; //'magenta';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#ff8';
    var x = 0;
    for (i = 0; i < text.length; i++) {
        x = 0;
        y = cv.height * .6 - time * 0.5 + (1 + i) * (textSize + textSpace);
        t = text[i];
        if (t[0] === ' ') {
            t = t.trim();
            x = cv.width / 2 - ctx.measureText(t).width / 2;
        }
        ctx.fillText(t, x, y);
    }
}

var dim = getTextDimensions(text, txtCtx);
txtCv.width = dim.width;
txtCv.height = dim.height;
drawStarBackground(starsCv, starsCtx);
updateText(txtCv, txtCtx);

function mainLoop() {
    var y, z;
    ctx.globalAlpha = 1;

    //ctx.fillStyle = 'magenta';
    //ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(starsCv, 0, 0, starsCv.width, starsCv.height, 0, 0, canvas.width, canvas.height);

    var prevY = 0;
    for (y = 0; y < canvas.height; y++) {
        var z = 1 - (canvas.height - y) / canvas.height;

        // black magic
        var srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH;
        srcW = txtCv.width;
        srcH = 1;
        srcX = 0;
        srcY = y;
        dstW = canvas.width / 4 + canvas.width * z * z;
        dstX = canvas.width / 2 - dstW / 2;
        dstY = canvas.height / 3 + y * z / 1.5;
        dstH = prevY - dstY;
        prevY = dstY;

        ctx.globalAlpha = z * z;
        ctx.drawImage(txtCv,
            srcX, srcY, srcW, srcH,
            dstX, dstY, dstW, dstH);

        /*
        if ( (y % 20) === 0) {
            ctx.fillStyle = 'cyan';
            ctx.fillText(z, 20, y);
        } 
        */
    }
    ctx.globalAlpha = 1.0;
    /*
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'cyan';
    ctx.fillText(time, 20, 20);
    */
    updateText(txtCv, txtCtx);

    time++;
    if (time > 4500) {
        time = 0;
    }

    requestAnimationFrame(mainLoop);
}
requestAnimationFrame(mainLoop);