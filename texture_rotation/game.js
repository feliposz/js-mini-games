var canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

var ctx = canvas.getContext("2d");
var angle = 0.0;
var bitmap = ctx.getImageData(0, 0, canvas.width, canvas.height)

var originX = canvas.width / 2;
var originY = canvas.height / 2;
var scaleX = 1;
var scaleY = 1;

loop = function () {
    var offset = 0;
    var sin = Math.sin(angle);
    var cos = Math.cos(angle);
    for (var y = bitmap.height; y >= 0; y--) {
        for (var x = 0; x < bitmap.width; x++) {
            var sx = Math.floor(originX + 1 / scaleX * ((x - originX) * sin - (y - originY) * cos));
            var sy = Math.floor(originY + 1 / scaleY * ((x - originX) * cos + (y - originY) * sin));
            while (sx < 0) sx += 256;
            while (sy < 0) sy += 256;
            //var c = (sx*sx - sy*sy) % 256;
            //var c = (sx*sx + sy*sy) % 256;
            //var c = (sx & sy) % 256;
            //var c = (sx | sy) % 256;
            //var c = (sx ^ sy) % 256;
            //var c = Math.sqrt(sx*sx + sy*sy) % 256;
            //var c = (sx^y) % 256;
            var c = (sx ^ sy) % 256;
            while (c < 0) c += 256;
            bitmap.data[offset + 0] = x === originX ? 255 : c;
            bitmap.data[offset + 1] = y === originY ? 255 : c;
            bitmap.data[offset + 2] = c;
            bitmap.data[offset + 3] = 255;
            offset += 4;
        }
    }
    ctx.putImageData(bitmap, 0, 0);
    angle = (angle + 0.01) % (Math.PI * 2);
    //originX = (originX + 1) % bitmap.width;
    //originY = (originY + 1) % bitmap.height;
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);