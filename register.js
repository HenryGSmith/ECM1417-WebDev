function openTab(e, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tabcontent[0].style.borderRadius = "0px 10px 10px 10px"

    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    e.currentTarget.className += " active"
}

document.getElementById("default-open").click();

function changeLayer(layer, image) {
    var layerElement = document.getElementById("layer-" + layer);
    layerElement.src = image;
}

window.onload = function () {
    var input = document.getElementById("username-input");
    var error = document.getElementById("username-error");
    var submit = document.getElementById("submit-button");
    var isValid = true;

    var invalidChars = ["\"", "!", "@", "#", "%", "&", "*", "(", ")", "+", "=", "^", "{", "}", "[", "]", "—", "-", ";", ":", "“", "`", "<", ">", "?", "/", " "];
    input.oninput = function () {
        isValid = true;
        var problemCharacter = ""
        for (var i = 0; i < invalidChars.length; i++) {
            if (input.value.includes(invalidChars[i])) {
                console.log(invalidChars[i]);
                isValid = false;
                problemCharacter += invalidChars[i];
            }
        }
        if (!isValid) {
            error.innerHTML = "username must not contain: \"" + problemCharacter + "\"";
            if (problemCharacter.includes(" ")) {
                error.innerHTML += "(SPACE)"
            }
            submit.disabled = true;
        }
        else if (input.value.length <= 1) {
            error.innerHTML = "username must be longer than 1 character"
            submit.disabled = true;
        }
        else {
            error.innerHTML = "";
            submit.disabled = false;
        }
    }
}