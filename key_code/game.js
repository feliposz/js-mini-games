function keydown(event) {
    var result = document.getElementById("result");
    var detail = document.getElementById("detail");
    result.innerText = event.keyCode;
    detail.innerText = "code: " + event.code + "\n key: " + event.key;
    console.log(event);
    event.preventDefault();
}

window.addEventListener("keydown", keydown);