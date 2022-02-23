var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

function linear(x) {
    return x;
}

function easeIn(x) {
    return x * x;
}

function easeOut(x) {
    return 1 - (1 - x) * (1 - x);
}

function easeInOut(x) {
    return (0.5 - 0.5 * Math.cos(Math.PI * x));
}

function rushInOut(x) {
    //return 0.5+Math.sign(x-0.5)*(x-0.5)*(x-0.5)*2;
    return Math.pow(x * 2 - 1, 3) * 0.5 + 0.5;
}

function softRushInOut(x) {
    return (Math.tan((x - 0.5) * 2 * Math.PI / 2.5) / Math.tan(Math.PI / 2.5) + 1) / 2;
    //return Math.sign(x*2-1)*Math.pow(Math.abs(x*2-1), 1/3)*0.5+0.5;
}

function easeInCubic(x) {
    return x * x * x;
}

const size = 30;
const space = 70;

var t = 0,
    dt = 1,
    pairs = [{
            f: linear,
            color: "red"
        },
        {
            f: easeIn,
            color: "green"
        },
        {
            f: easeOut,
            color: "blue"
        },
        {
            f: easeInOut,
            color: "yellow"
        },
        {
            f: rushInOut,
            color: "orange"
        },
        {
            f: softRushInOut,
            color: "magenta"
        },
        {
            f: easeInCubic,
            color: "purple"
        }
    ];

function loop() {

    var x, y, f, i, t2, x2;

    t += dt;
    if (t < 0) {
        t = 0;
        dt *= -1;
    }
    if (t > 100) {
        t = 100;
        dt *= -1;
    }

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "20px monospace";
    ctx.fillStyle = "white";
    ctx.fillText("t = " + t, 50, canvas.height - 50);

    y = 0;
    for (i = 0; i < pairs.length; i++) {
        f = pairs[i].f;
        x = f(t / 100) * (canvas.width - size * 3) + size;
        y += space;
        ctx.strokeStyle = "gray";
        for (t2 = 0; t2 < 100; t2++) {
            x2 = f(t2 / 100) * (canvas.width - size * 3) + size;
            ctx.beginPath();
            ctx.moveTo(x2 + size / 2, y + size * 0.25);
            ctx.lineTo(x2 + size / 2, y + size * 0.75);
            ctx.closePath();
            ctx.stroke();
        }
        ctx.font = "14px monospace";
        ctx.fillStyle = pairs[i].color;
        ctx.fillText(pairs[i].f.name, size / 2, y - size / 2);
        ctx.fillRect(x, y, size, size);
    }

    requestAnimationFrame(loop);
}

loop();