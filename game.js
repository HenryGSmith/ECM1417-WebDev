//=========================================================\\                                   
//                                                         \\
//           ______  __    __  ______  _______             \\
//          /      \|  \  |  \/      \|       \            \\
//          |  ▓▓▓▓▓▓\ ▓▓\ | ▓▓  ▓▓▓▓▓▓\ ▓▓▓▓▓▓▓\          \\
//          | ▓▓___\▓▓ ▓▓▓\| ▓▓ ▓▓__| ▓▓ ▓▓__/ ▓▓          \\
//           \▓▓    \| ▓▓▓▓\ ▓▓ ▓▓    ▓▓ ▓▓    ▓▓          \\
//           _\▓▓▓▓▓▓\ ▓▓\▓▓ ▓▓ ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓           \\
//          |  \__| ▓▓ ▓▓ \▓▓▓▓ ▓▓  | ▓▓ ▓▓                \\
//           \▓▓    ▓▓ ▓▓  \▓▓▓ ▓▓  | ▓▓ ▓▓                \\
//            \▓▓▓▓▓▓ \▓▓   \▓▓\▓▓   \▓▓\▓▓                \\
//                                                         \\
//=========================================================\\                                    
//                                     
    

//=========================================================
//===================== CANVAS SET-UP =====================

const canvas = document.querySelector("canvas");
window.scrollTo({ top: 0, behavior: "auto" });
document.body.style.overflow = "hidden";

// internal canvas space dimenesions
const canvasDims = { width: 1200, height: 740 };
canvas.width = canvasDims.width;
canvas.height = canvasDims.height;

// - 2d context
const ctx = canvas.getContext("2d");

//=========================================================
//======================== UTILITY ========================

const DATA = {
    data: []
}
const playerData = {
    name: "",
    icon: [],
    levelTimes: [],
    levelScores: [],
    unlock: 1
}

// create data profile for player
const account = getCookie("data");
const registered = account !== null;

if (registered) {
    playerData.name = account.username;
    playerData.icon[0] = account.body_radio;
    playerData.icon[1] = account.eyes_radio;
    playerData.icon[2] = account.mouth_radio;
}

const savedGameData = getCookie("gameData");
if (savedGameData !== null) {
    if (savedGameData.name === playerData.name) {
        playerData.levelScores = savedGameData.levelScores;
        playerData.levelTimes = savedGameData.levelTimes;
        playerData.unlock = savedGameData.unlock;
    }
}


saveGameData(playerData);


function saveGameData(playerData) {
    if (registered) {
        updateJSON(playerData);
        setCookie("gameData", playerData, "30");
    }
}

// dynamic screen fit
function debounce(func, wait) {
    let timeout;
    return function () {
        const context = this;
        const args = arguments;
        const later = function () {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


function resizeCanvas() {
    // Get dimensions of the window
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    // Account for any UI elements that reduce available space
    let navbarHeight = document.querySelector('.navbar').offsetHeight;
    let topOffset = navbarHeight + 100;
    let scrollbarWidth = window.innerWidth - document.documentElement.clientWidth + 20;

    // Calculate available canvas dimensions
    let availableWidth = windowWidth - scrollbarWidth;
    let availableHeight = windowHeight - topOffset;

    // Calculate aspect ratio of the canvas
    let aspectRatio = canvasDims.width / canvasDims.height;

    // Calculate dimensions of the canvas
    let canvasWidth = availableWidth;
    let canvasHeight = availableWidth / aspectRatio;

    // If canvas height is too big for the window, adjust canvas dimensions again
    if (canvasHeight > availableHeight) {
        canvasHeight = availableHeight;
        canvasWidth = canvasHeight * aspectRatio;
    }

    // Set canvas dimensions
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Set scale for drawing context
    let scaleX = canvasWidth / canvasDims.width;
    let scaleY = canvasHeight / canvasDims.height;
    ctx.scale(scaleX, scaleY);
}



window.addEventListener("resize", debounce(resizeCanvas, 250));

function lerp(startValue, endValue, t) {
    return startValue + (endValue - startValue) * t;
}

function screenToWorldSpace(x, y) {
    // screen space 0 to 1 on width and height
    // world space = canvas space
    const xWorld = lerp(0, canvasDims.width, x);
    const yWorld = lerp(0, canvasDims.height, y);

    return [xWorld, yWorld];
}

function setCookie(cname, cobject, exdays) {
    const d = new Date();
    var cvalue = JSON.stringify(cobject);
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=').map(c => c.trim());
        if (cookieName === name) {
            const output = decodeURIComponent(cookieValue);
            return JSON.parse(output);
        }
    }
    return null;
}


function getJSON(callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', './gameData.json');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        if (xhr.status === 200) {
            const responseData = JSON.parse(xhr.responseText);
            callback(responseData); // Execute the callback function with the JSON data
        } else {
            console.error('Error:', xhr.statusText);
        }
    };
    xhr.onerror = function () {
        console.error('Error:', xhr.statusText);
    };
    xhr.send();
}

function updateJSON(object) {
    getJSON(function (currentJsonData) {
        let objectExists = false;
        for (let i in currentJsonData.data) {
            if (currentJsonData.data[i].name === object.name) {
                currentJsonData.data[i] = object;
                objectExists = true;
                break;
            }
        }
        if (!objectExists) {
            currentJsonData.data.push(object);
        }
        saveJSON(currentJsonData);
    });
}

function saveJSON(object) {
    var json_string = JSON.stringify(object);
    // AJAX call to save JSON file
    $.ajax({
        url: "save_json_file.php",
        type: "POST",
        data: { json_data: json_string },
        success: function (response) {
            console.log("JSON file saved successfully");
        },
        error: function (xhr, status, error) {
            console.error("Error saving JSON file: " + error);
        }
    });
}

function hasMatchingRows(arr) {
    const numRows = arr.length;

    // Iterate through each row
    for (let i = 0; i < numRows; i++) {
        // Iterate through subsequent rows below current row
        for (let j = i + 1; j < numRows; j++) {
            let isMatch = true;

            // Compare each element of the two rows
            for (let k = 0; k < arr[i].length; k++) {
                if (arr[i][k] !== arr[j][k]) {
                    isMatch = false;
                    break;
                }
            }

            if (isMatch) {
                return true;
            }
        }
    }

    return false;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

//========================================================
//=================== INPUT MANAGEMENT ===================

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvasDims.width / rect.width;
    var scaleY = canvasDims.height / rect.height;

    return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY
    };
}

canvas.addEventListener("mousemove", (e) => {
    GLOBALS.mousePosition = getMousePos(canvas, e);
})

canvas.addEventListener("click", (e) => {
    switch (e.button) {
        case 0:
            for (const ui of UI_FLOAT) {
                if (ui.isZoomed) {
                    ui.onClick();
                }
            }
            if (gameIsPaused) {
                return;
            }
            for (const ui of UI) {
                if (ui.isZoomed) {
                    ui.onClick();
                }
            }
            for (const card of CARDS) {
                if (card.isHovered) {
                    card.onClick();
                }
            }
            break;
        default:
            break;
    }
});

//========================================================
//================== RENDERING PIPELINE ==================

//----------------------------------------------------
//------------------ OBJECT SPRITES ------------------

class UIButton {
    constructor(coords, dims, zDims, onClickFunction, text = "", color = "#f49d37") {
        this.anchor = { x: coords[0], y: coords[1] };
        this.offset = { x: 0, y: 0 };
        this.originalDims = { w: dims[0], h: dims[1] };
        this.currentDims = { w: dims[0], h: dims[1] };
        this.zoomedDims = { w: zDims[0], h: zDims[1] }
        this.isZoomed = false;
        this.text = text;

        this.zoomInAnimRunning = false;
        this.zoomOutAnimRunning = false;

        this.AnimCounter = { zoomIn: 0, zoomOut: 0 };

        this.onClickFunction = onClickFunction;
        this.extraData = 0;

        this.color = color;
    }

    //animations
    zoomInAnim(speed = 20) {
        if (this.AnimCounter.zoomIn < 1) {
            this.currentDims.w = lerp(this.originalDims.w, this.zoomedDims.w, this.AnimCounter.zoomIn);
            this.currentDims.h = lerp(this.originalDims.h, this.zoomedDims.h, this.AnimCounter.zoomIn);
            this.offset.x = (this.originalDims.w - this.currentDims.w) / 2;
            this.offset.y = (this.originalDims.h - this.currentDims.h) / 2;
            this.AnimCounter.zoomIn += speed * deltaTime.get('delta');
        } else {
            this.AnimCounter.zoomIn = 0;
            this.zoomInAnimRunning = false;
        }
    }

    zoomOutAnim(speed = 20) {
        if (this.AnimCounter.zoomOut <= 1) {
            this.currentDims.w = lerp(this.zoomedDims.w, this.originalDims.w, this.AnimCounter.zoomOut);
            this.currentDims.h = lerp(this.zoomedDims.h, this.originalDims.h, this.AnimCounter.zoomOut);
            this.offset.y = (this.originalDims.h - this.currentDims.h) / 2;
            this.offset.x = (this.originalDims.w - this.currentDims.w) / 2;
            this.AnimCounter.zoomOut += speed * deltaTime.get('delta');
        } else {
            this.AnimCounter.zoomOut = 0;
            this.zoomOutAnimRunning = false;
        }
    }

    onClick() {
        if (!updateLimiter) {
            this.onClickFunction(this.extraData);
            updateLimiter = true;
        }
    }

    // object management
    update() {
        // hovering over the button
        var xBound = GLOBALS.mousePosition.x >= this.anchor.x + this.offset.x && GLOBALS.mousePosition.x <= this.anchor.x + this.offset.x + this.currentDims.w;
        var yBound = GLOBALS.mousePosition.y >= this.anchor.y + this.offset.y && GLOBALS.mousePosition.y <= this.anchor.y + this.offset.y + this.currentDims.h;
        if (xBound && yBound) {
            if (!this.zoomInAnimRunning && !this.isZoomed) {
                this.isZoomed = true;
                this.zoomInAnimRunning = true;
            }
        } else if (this.isZoomed) {
            this.isZoomed = false;
            this.zoomOutAnimRunning = true;
        }
    }
    render() {
        //update behaviour
        this.update();
        //run animations
        if (this.zoomInAnimRunning) {
            this.zoomInAnim();
        }
        if (this.zoomOutAnimRunning) {
            this.zoomOutAnim();
        }

        //draw sprite to canvas
        var x = this.anchor.x + this.offset.x;
        var y = this.anchor.y + this.offset.y;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(x, y, this.currentDims.w, this.currentDims.h, 10);
        ctx.fill();
        ctx.font = "30px 'Courier new'";
        ctx.fillStyle = "black";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText(this.text, x + this.currentDims.w / 2, y + this.currentDims.h / 2);
    }
}

class UIText {
    constructor(coords, fontSize, font, color, text, styling = "", alignBase = "top", align = "left") {
        this.coords = { x: coords[0], y: coords[1] };
        this.fontSize = fontSize;
        this.font = font;
        this.color = color;
        this.text = text;
        this.styling = styling;
        this.alignBase = alignBase;
        this.align = align;
    }
    render() {
        ctx.font = this.styling + this.fontSize + "px" + this.font;
        ctx.fillStyle = this.color;
        ctx.textBaseline = this.alignBase;
        ctx.textAlign = this.align;
        ctx.fillText(this.text, this.coords.x, this.coords.y);
    }
}

class UIRect {
    constructor(coords, dims, color, cornerRadii = 10) {
        this.anchor = { x: coords[0], y: coords[1] };
        this.dims = { w: dims[0], h: dims[1] };
        this.color = color;
        this.radii = cornerRadii;
    }
    render() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(this.anchor.x, this.anchor.y, this.dims.w, this.dims.h, this.radii);
        ctx.fill();
    }
}

class card {
    constructor(coords, dims, zoomedDims = [50, 60], fColor = "green", bColor = "red", corner = 5, extraData = [0, 0, 0]) {
        this.anchor = { x: coords[0], y: coords[1] };
        this.corner = corner;
        this.offset = { x: 0, y: 0 };
        this.originalDims = { w: dims[0], h: dims[1] };
        this.currentDims = { w: dims[0], h: dims[1] };
        this.zoomedDims = { w: zoomedDims[0], h: zoomedDims[1] };
        this.isZoomed = false;
        this.isHovered = false;
        this.isFliped = false;
        this.faceDown = true;

        this.flipAnimRunning = false;
        this.isanimFinishedFaceUP = false;
        this.zoomInAnimRunning = false;
        this.zoomOutAnimRunning = false;
        this.removeAnimRunning = false;

        this.AnimCounter = { flip: 0, zoomIn: 0, zoomOut: 0, remove: 0 };

        this.backColor = fColor;
        this.frontColor = bColor;

        this.extraData = extraData;
    }

    //animations
    startFlipAnim() {
        if (!this.flipAnimRunning && !gameIsPaused) {
            this.flipAnimRunning = true;
            this.isFliped = false;
            this.isanimFinishedFaceUP = false;

            if (this.faceDown) {
                level_flippedCards++;
            } else {
                level_flippedCards--;
            }
        }
    }
    flipAnim(speed = 10) {
        this.currentDims.w = Math.abs(Math.cos(this.AnimCounter.flip)) * this.zoomedDims.w;
        this.offset.x = (this.originalDims.w - this.currentDims.w) / 2
        if (this.AnimCounter.flip > Math.PI / 2 && !this.isFliped) {
            this.isFliped = true;
            this.faceDown = !this.faceDown;
            // change image
        }
        if (this.AnimCounter.flip <= Math.PI) {
            this.AnimCounter.flip += speed * deltaTime.get('delta');
        }
        else {
            this.AnimCounter.flip = 0;
            this.flipAnimRunning = false;
            if (!this.faceDown) {
                this.isanimFinishedFaceUP = true;
            }
        }
    }

    zoomInAnim(speed = 20) {
        if (this.AnimCounter.zoomIn < 1) {
            this.currentDims.w = lerp(this.originalDims.w, this.zoomedDims.w, this.AnimCounter.zoomIn);
            this.currentDims.h = lerp(this.originalDims.h, this.zoomedDims.h, this.AnimCounter.zoomIn);
            this.offset.x = (this.originalDims.w - this.currentDims.w) / 2;
            this.offset.y = (this.originalDims.h - this.currentDims.h) / 2;
            this.AnimCounter.zoomIn += speed * deltaTime.get('delta');
        } else {
            this.AnimCounter.zoomIn = 0;
            this.zoomInAnimRunning = false;
        }
    }

    zoomOutAnim(speed = 20) {
        if (this.AnimCounter.zoomOut <= 1) {
            this.currentDims.w = lerp(this.zoomedDims.w, this.originalDims.w, this.AnimCounter.zoomOut);
            this.currentDims.h = lerp(this.zoomedDims.h, this.originalDims.h, this.AnimCounter.zoomOut);
            this.offset.y = (this.originalDims.h - this.currentDims.h) / 2;
            this.offset.x = (this.originalDims.w - this.currentDims.w) / 2;
            this.AnimCounter.zoomOut += speed * deltaTime.get('delta');
        } else {
            this.AnimCounter.zoomOut = 0;
            this.zoomOutAnimRunning = false;
        }
    }

    startRemoveAnim() {
        if (!this.removeAnimRunning) {
            this.removeAnimRunning = true;
        }
    }
    removeAnim(speed = 2500) {
        this.offset.x += speed * deltaTime.get('delta');
        if (this.offset.x + this.anchor.x >= canvasDims.width + this.zoomedDims.w) {
            var index = CARDS.indexOf(this);
            if (index > -1) {
                CARDS.splice(index, 1);
            }
        }
    }

    // object management
    onClick() {
        if (level_flippedCards >= level_setSize && this.faceDown) {
            return;
        }
        if (this.removeAnimRunning) {
            return;
        }
        if (this.faceDown) {
            this.startFlipAnim();
        }
    }

    update() {
        // hovering over the card
        var xBound = GLOBALS.mousePosition.x >= this.anchor.x + this.offset.x && GLOBALS.mousePosition.x <= this.anchor.x + this.offset.x + this.currentDims.w;
        var yBound = GLOBALS.mousePosition.y >= this.anchor.y + this.offset.y && GLOBALS.mousePosition.y <= this.anchor.y + this.offset.y + this.currentDims.h;
        if (!this.flipAnimRunning) {
            if (xBound && yBound) {
                this.isHovered = true;
                if (!this.zoomInAnimRunning && !this.isZoomed) {
                    this.isZoomed = true;
                    this.zoomInAnimRunning = true;
                }
            }
            else if (this.isZoomed) {
                if (this.faceDown) {
                    this.isZoomed = false;
                    this.zoomOutAnimRunning = true;
                }
                this.isHovered = false;
            } else {
                this.isHovered = false;
            }
        }
    }
    render() {
        if (!gameIsPaused) {
            //update behaviour
            this.update();
            //run animations
            if (this.flipAnimRunning) {
                this.flipAnim();
            }
            if (this.zoomInAnimRunning) {
                this.zoomInAnim();
            }
            if (this.zoomOutAnimRunning) {
                this.zoomOutAnim();
            }
            if (this.removeAnimRunning) {
                this.removeAnim();
            }
        }

        // draw sprite to canvas
        var x = this.anchor.x + this.offset.x;
        var y = this.anchor.y + this.offset.y;
        ctx.fillStyle = (this.faceDown) ? this.backColor : this.frontColor;
        ctx.beginPath();
        ctx.roundRect(x, y, this.currentDims.w, this.currentDims.h, this.corner);
        ctx.fill();
        if (this.faceDown) {
            ctx.lineWidth = this.zoomedDims.w / 20;
            ctx.strokeStyle = "#275160"
            ctx.stroke();
        } else {
            var margin = { x: this.currentDims.w / 10, y: this.zoomedDims.w / 10 }
            var img1 = GLOBALS.emojiImages.body[this.extraData[0]];
            var img2 = GLOBALS.emojiImages.eyes[this.extraData[1]];
            var img3 = GLOBALS.emojiImages.mouth[this.extraData[2]];
            var width = this.currentDims.w - margin.x;
            var height = this.zoomedDims.w - margin.y;
            var offset = { x: margin.x / 2, y: (this.zoomedDims.h - height) / 2 };

            ctx.drawImage(img1, x + offset.x, y + offset.y, width, height);
            ctx.drawImage(img2, x + offset.x, y + offset.y, width, height);
            ctx.drawImage(img3, x + offset.x, y + offset.y, width, height);
        }
    }
}

//-----------------------------------------------------
//------------------ FRAME RENDERING ------------------

const GLOBALS = {
    mousePosition: { x: 0, y: 0 },
    screenSize: { width: 0, height: 0 },
    emojiImages: {
        body: [],
        eyes: [],
        mouth: []
    },
    isMusicPlaying: false
};

// Preload images
const preloadImages = () => {
    const preloadContainer = document.createElement("div");
    preloadContainer.style.display = "none";

    const imageUrls = [
        ["/emojiAssets/body/green.png", "/emojiAssets/body/red.png", "/emojiAssets/body/yellow.png"],
        ["/emojiAssets/eyes/closed.png", "/emojiAssets/eyes/laughing.png", "/emojiAssets/eyes/long.png", "/emojiAssets/eyes/normal.png", "/emojiAssets/eyes/rolling.png", "/emojiAssets/eyes/winking.png"],
        ["/emojiAssets/mouth/open.png", "/emojiAssets/mouth/sad.png", "/emojiAssets/mouth/smiling.png", "/emojiAssets/mouth/straight.png", "/emojiAssets/mouth/surprise.png", "/emojiAssets/mouth/teeth.png"]
    ];

    for (let i = 0; i < imageUrls.length; i++) {
        const imageArray = imageUrls[i];
        const imageType = Object.keys(GLOBALS.emojiImages)[i];
        GLOBALS.emojiImages[imageType] = imageArray.map(url => {
            const image = new Image();
            image.src = url;
            preloadContainer.appendChild(image);
            return image;
        });
    }

    document.body.appendChild(preloadContainer);
};

// Call preloadImages to preload the images
preloadImages();

//storage of all interactable elements
const CARDS = [];
const UI = [];
const UI_FLOAT = [];

// renders background elements
const BACKGROUND_ELEMS = [];

function renderBackground() {
    for (let elem of BACKGROUND_ELEMS) {
        elem.render();
    }
}

// renders prop objects from PROPS
function renderProps() {
    const renderOrder = [];
    const zoomedCards = [];
    const numCards = CARDS.length;
    for (let i = 0; i < numCards; i++) {
        const card = CARDS[i];
        if (card.removeAnimRunning) {
            zoomedCards.push(card);
        } else {
            renderOrder.push(card);
        }
    }
    const numZoomedCards = zoomedCards.length;
    for (let i = 0; i < numZoomedCards; i++) {
        renderOrder.push(zoomedCards[i]);
    }
    for (let card of renderOrder) {
        card.render();
    }
    const numUI = UI.length;
    for (let i = 0; i < numUI; i++) {
        UI[i].render();
    }
}


function renderFloatUI() {
    for (let elem of UI_FLOAT) {
        elem.render();
    }
}

// renders out each frame
function startFrames() {
    //reset update limit for on screen button presses.
    updateLimiter = false;
    setDelta();

    //update game logic
    if (currentScene === "level") {
        logicUpdate();
    }

    // erase canvas
    ctx.clearRect(0, 0, canvasDims.width, canvasDims.height);

    // render entities in order
    renderBackground();
    renderProps();
    renderFloatUI();

    // call next frame
    window.requestAnimationFrame(startFrames);
}

const deltaTime = new Map([
    ['now', 0],
    ['delta', 0],
    ['then', 0]
]);

function setDelta() {
    deltaTime.set('then', deltaTime.get('now'));
    deltaTime.set('now', Date.now());
    deltaTime.set('delta', (deltaTime.get('now') - deltaTime.get('then')) / 1000);
}

//========================================================
//====================== GAME LOGIC ======================

// applies initial settings
function init() {
    resizeCanvas();
    setupScene();
}

function generateLevelGrid(anchor, dims, zoom, buffer = 0.04) {
    const grid = [];
    const x = anchor[0];
    const y = anchor[1];
    const gridWidth = dims[0];
    const gridHeight = dims[1];
    const dim = (gridHeight / 3) - screenToWorldSpace(buffer, 0)[0];
    const difference = gridWidth / 3 - dim;
    let color = "";
    let zoomVal = zoom;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const index = 3 * j + i + 1;
            if (index > levelUnlock) {
                color = "#546375";
                zoomVal = 0;
            } else {
                color = "#F49D37";
                zoomVal = zoom;
            }

            const button = new UIButton(
                [x + (i * gridWidth / 3) + difference / 2, y + (j * gridHeight / 3)],
                [dim, dim],
                [dim + zoomVal, dim + zoomVal],
                (n) => {
                    if (n <= levelUnlock) {
                        currentScene = "level"
                        currentLevel = n;
                        setupLevel();
                        setupScene();
                    }
                },
                index,
                color
            );
            button.extraData = index;
            grid.push(button);

            const timeData = playerData.levelTimes[index - 1];
            const levelTime = (timeData === undefined) ? 0 : timeData;
            const min = Math.floor(levelTime / 60);
            const sec = Math.floor(levelTime) % 60;
            const levelTimeStr = `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;

            const time = new UIText(
                [
                    x + (i * gridWidth / 3) + difference / 2 + dim / 2,
                    y + (j * gridHeight / 3) + dim + 5
                ],
                "12px",
                "'Courier new'",
                "white",
                levelTimeStr,
                undefined,
                undefined,
                "centre"
            )
            UI.push(time);
        }
    }

    return grid;
}


var currentScene = "start_menu";
var currentLevel = 0;
var levelUnlock = playerData.unlock;
var gameIsPaused = false;
var updateLimiter = false;

var levelComplete = false;
var levelLost = false;


const SCENES = {
    start_menu: {
        UI: {
            buttons: [
                new UIButton(
                    screenToWorldSpace(0.3, 0.4), screenToWorldSpace(0.4, 0.2), screenToWorldSpace(0.42, 0.22),
                    () => {
                        currentScene = "level_select"
                        setupScene();
                        if (!GLOBALS.isMusicPlaying) {
                            playTracks();
                            GLOBALS.isMusicPlaying = true;
                        }

                    },
                    "Start the game")
            ],
            text: [
                new UIText(screenToWorldSpace(0.1, 0.1), "120", "'Courier new'", "white", "= PAIRS ="),
                new UIText(screenToWorldSpace(0.5, 0.8), "60", "'Courier new'", "white", "A Game of Snap")
            ]
        },
        Background: []
    },
    level_select: {
        UI: {
            buttons: [
                new UIButton(
                    screenToWorldSpace(0.02, 0.02), screenToWorldSpace(0.1, 0.1), screenToWorldSpace(0.11, 0.11),
                    () => {
                        currentScene = "start_menu";
                        setupScene();
                    }, "Back")
            ],
            text: [
                new UIText(screenToWorldSpace(0.5, 0.05), "60", "'Courier new'",
                    "white", "► LEVEL SELECT ◄", undefined, undefined, "center")
            ]
        },
        Background: []
    },
    level: {
        UI: {
            buttons: [
                new UIButton(
                    screenToWorldSpace(0.02, 0.02), screenToWorldSpace(0.1, 0.1), screenToWorldSpace(0.11, 0.11),
                    () => {
                        if (!levelComplete) {
                            if (!gameIsPaused) {
                                gameIsPaused = true;
                                setupScene();
                            }
                        }
                    },
                    "pause")
            ],
            text: [
                new UIText(screenToWorldSpace(0.2, 0.03), "60", "'Courier new'",
                    "white", "Match " + level_setSize + " cards", undefined, undefined, "left")
            ],

            pauseMenu: {
                buttons: [
                    new UIButton(
                        screenToWorldSpace(0.4, 0.4), screenToWorldSpace(0.2, 0.1), screenToWorldSpace(0.21, 0.11),
                        () => {
                            gameIsPaused = false;
                            updateLimiter = true;
                            setupScene();
                        },
                        "Resume"),
                    new UIButton(
                        screenToWorldSpace(0.4, 0.6), screenToWorldSpace(0.2, 0.1), screenToWorldSpace(0.21, 0.11),
                        () => {
                            gameIsPaused = false;
                            currentScene = "level_select";
                            setupScene();
                        },
                        "exit")
                ],
                text: [
                    new UIText(
                        screenToWorldSpace(0.5, 0.22), "62", "'Courier new'", "white", "⊣ PAUSED ⊢",
                        undefined, undefined, "center"
                    )
                ],
                sprites: [
                    new UIRect(screenToWorldSpace(0.325, 0.175), screenToWorldSpace(0.35, 0.65), "#21897e", 10)
                ]
            },

            win_menu: {
                buttons: [
                    new UIButton(
                        screenToWorldSpace(0.4, 0.55), screenToWorldSpace(0.2, 0.1), screenToWorldSpace(0.21, 0.11),
                        () => {
                            levelComplete = false;
                            updateLimiter = true;
                            currentScene = "level";
                            if (currentLevel < 9) {
                                currentLevel = currentLevel + 1
                                setupScene();
                                setupLevel();
                            } else {
                                currentScene = "level_select";
                                setupScene();
                            }
                        },
                        "Next Level"),
                    new UIButton(
                        screenToWorldSpace(0.375, 0.7), screenToWorldSpace(0.25, 0.1), screenToWorldSpace(0.26, 0.11),
                        () => {
                            levelComplete = false;
                            currentScene = "level_select";
                            setupScene();
                        },
                        "Return to Menu")
                ],
                text: [
                    new UIText(
                        screenToWorldSpace(0.5, 0.22), "52", "'Courier new'", "white", "⊣ LEVEL COMPLETE ⊢",
                        undefined, undefined, "center"
                    ),
                    new UIText(
                        screenToWorldSpace(0.2633, 0.32), "52", "'Courier new'", "white", "⊣ TIME:",
                        undefined, undefined, "left"
                    ),
                    new UIText(
                        screenToWorldSpace(0.2633, 0.42), "52", "'Courier new'", "white", "⊣ SCORE:",
                        undefined, undefined, "left"
                    ),
                    new UIText(
                        screenToWorldSpace(0.5, 0.32), "52", "'Courier new'", "white", "00:00",
                        undefined, undefined, "left"
                    ),
                    new UIText(
                        screenToWorldSpace(0.5, 0.42), "52", "'Courier new'", "white", "00000",
                        undefined, undefined, "left"
                    )
                ],
                sprites: [
                    new UIRect(screenToWorldSpace(0.25, 0.175), screenToWorldSpace(0.5, 0.65), "#21897e", 10)
                ]
            },

            loss_menu: {
                buttons: [
                    new UIButton(
                        screenToWorldSpace(0.4, 0.55), screenToWorldSpace(0.2, 0.1), screenToWorldSpace(0.21, 0.11),
                        () => {
                            levelLost = false;
                            updateLimiter = true;
                            currentScene = "level_select";
                            setupScene();
                            currentScene = "level";
                            setupLevel();
                            setupScene();
                        },
                        "Retry"),
                    new UIButton(
                        screenToWorldSpace(0.375, 0.7), screenToWorldSpace(0.25, 0.1), screenToWorldSpace(0.26, 0.11),
                        () => {
                            levelLost = false;
                            currentScene = "level_select";
                            setupScene();
                        },
                        "Return to Menu")
                ],
                text: [
                    new UIText(
                        screenToWorldSpace(0.5, 0.22), "52", "'Courier new'", "white", "⊣ LEVEL LOST ⊢",
                        undefined, undefined, "center"
                    ),
                ],
                sprites: [
                    new UIRect(screenToWorldSpace(0.25, 0.175), screenToWorldSpace(0.5, 0.65), "#21897e", 10)
                ]
            }
        },
        Background: [new UIRect([0, 0], [canvasDims.width, canvasDims.height], "#293e55ff", 0)]
    }
};

function setupScene() {
    BACKGROUND_ELEMS.splice(0, BACKGROUND_ELEMS.length);
    if (currentScene !== "level") {
        CARDS.splice(0, CARDS.length);
    }
    UI.splice(0, UI.length);
    UI_FLOAT.splice(0, UI_FLOAT.length);

    if (!gameIsPaused) {
        for (let i in SCENES[currentScene].UI.buttons) {
            var button = SCENES[currentScene].UI.buttons[i];
            button.currentDims.w = button.originalDims.w;
            button.currentDims.h = button.originalDims.h;
            button.offset.y = (button.originalDims.h - button.currentDims.h) / 2;
            button.offset.x = (button.originalDims.w - button.currentDims.w) / 2;
            UI.push(button);
        }
    }
    if (currentScene === "level_select") {
        var lGrid = generateLevelGrid(
            screenToWorldSpace(0.2, 0.15), screenToWorldSpace(0.6, 0.75), screenToWorldSpace(0.02, 0)[0]
        );
        for (let i in lGrid) {
            UI.push(lGrid[i]);
        }
    }

    if (currentScene === "level") {
        SCENES[currentScene].UI.text[0].text = "Match " + level_setSize + " cards";
    }

    for (let i in SCENES[currentScene].UI.text) {
        UI.push(SCENES[currentScene].UI.text[i]);
    }
    for (let i in SCENES[currentScene].Background) {
        BACKGROUND_ELEMS.push(SCENES[currentScene].Background[i]);
    }

    if (gameIsPaused) {
        for (let i in SCENES.level.UI.pauseMenu.sprites) {
            UI_FLOAT.push(SCENES.level.UI.pauseMenu.sprites[i]);
        }
        for (let i in SCENES.level.UI.pauseMenu.buttons) {
            var button = SCENES.level.UI.pauseMenu.buttons[i];
            button.currentDims.w = button.originalDims.w;
            button.currentDims.h = button.originalDims.h;
            button.offset.y = (button.originalDims.h - button.currentDims.h) / 2;
            button.offset.x = (button.originalDims.w - button.currentDims.w) / 2;
            UI_FLOAT.push(button);
        }
        for (let i in SCENES.level.UI.pauseMenu.text) {
            UI_FLOAT.push(SCENES.level.UI.pauseMenu.text[i]);
        }
    }

    if (levelComplete) {
        for (let i in SCENES.level.UI.win_menu.sprites) {
            UI_FLOAT.push(SCENES.level.UI.win_menu.sprites[i]);
        }
        for (let i in SCENES.level.UI.win_menu.buttons) {
            var button = SCENES.level.UI.win_menu.buttons[i];
            button.currentDims.w = button.originalDims.w;
            button.currentDims.h = button.originalDims.h;
            button.offset.y = (button.originalDims.h - button.currentDims.h) / 2;
            button.offset.x = (button.originalDims.w - button.currentDims.w) / 2;
            UI_FLOAT.push(button);
        }
        var min = Math.floor(Math.floor(level_timer) / 60);
        var sec = Math.floor(level_timer) % 60;
        SCENES.level.UI.win_menu.text[3].text = (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec;

        var score = level_score.toString();
        var zerosToAddToScore = 4 - score.length;
        for (var i = 0; i < zerosToAddToScore; i++) {
            score = '0' + score;
        }
        score = " " + score;
        SCENES.level.UI.win_menu.text[4].text = score;
        for (let i in SCENES.level.UI.win_menu.text) {
            UI_FLOAT.push(SCENES.level.UI.win_menu.text[i]);
        }
    }

    if (levelLost) {
        for (let i in SCENES.level.UI.loss_menu.sprites) {
            UI_FLOAT.push(SCENES.level.UI.loss_menu.sprites[i]);
        }
        for (let i in SCENES.level.UI.loss_menu.buttons) {
            var button = SCENES.level.UI.loss_menu.buttons[i];
            button.currentDims.w = button.originalDims.w;
            button.currentDims.h = button.originalDims.h;
            button.offset.y = (button.originalDims.h - button.currentDims.h) / 2;
            button.offset.x = (button.originalDims.w - button.currentDims.w) / 2;
            UI_FLOAT.push(button);
        }

        for (let i in SCENES.level.UI.loss_menu.text) {
            UI_FLOAT.push(SCENES.level.UI.loss_menu.text[i]);
        }
    }

}

//-----------------------------------------------------
//-------------------- LEVEL LOGIC --------------------

function generateCardGrid(setSize, nSets, anchor, dims) {
    const map = generateMatchMap(setSize, nSets);
    const cardPlaceDims = { w: dims[0] / nSets, h: dims[1] / setSize };
    const buffer = screenToWorldSpace(0.02, 0)[0];
    let cardHeight = cardPlaceDims.h - buffer * 2;
    let cardWidth = cardHeight * (5 / 7);

    if (cardWidth + buffer > cardPlaceDims.w) {
        cardWidth = cardPlaceDims.w - buffer * 2;
        cardHeight = cardWidth * (7 / 5);
    }

    const widthOffset = (cardPlaceDims.w - cardWidth) / 2;
    const faces = [];
    let hasMatching = false;

    do {
        hasMatching = false;
        for (let i = 0; i < nSets; i++) {
            faces[i] = generateFace();
        }
        hasMatching = hasMatchingRows(faces);
    } while (hasMatching);

    for (let j = 0, rows = map.length; j < rows; j++) {
        const columns = map[0].length;
        for (let i = 0; i < columns; i++) {
            const x = anchor[0] + i * cardPlaceDims.w + widthOffset;
            const y = anchor[1] + j * cardPlaceDims.h + buffer / 2;
            const cardWidthWithBuffer = cardWidth + buffer;
            const cardHeightWithBuffer = cardHeight + buffer;
            const cardColor = "#21897e";
            const backColor = "#d72638";
            const borderRadius = 7;
            const cardFace = faces[map[j][i]];

            CARDS.push(new card(
                [x, y],
                [cardWidth, cardHeight],
                [cardWidthWithBuffer, cardHeightWithBuffer],
                cardColor, backColor,
                borderRadius, cardFace
            ));
        }
    }
}


function generateMatchMap(setSize, nSets) {
    var width = setSize;
    var height = nSets;
    const map = Array.from({ length: width }, () => new Array(height).fill(0));
    const availableOptions = Array.from({ length: width }, () => new Array(nSets).fill(true));

    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            let options = [];
            for (let k = 0; k < nSets; k++) {
                if (availableOptions[i][k]) {
                    options.push(k);
                }
            }
            let randomIndex = Math.floor(Math.random() * options.length);
            let randomElement = options[randomIndex];
            map[i][j] = randomElement;
            availableOptions[i][randomElement] = false;
        }
    }

    return map;
}


function generateFace() {
    const features = [3, 6, 6];
    const face = [];
    let bits = Math.floor(Math.random() * (2 ** 15));
    features.forEach(max => {
        face.push(bits % max);
        bits = bits >> (max.toString(2).length - 1);
    });
    return face;
}

function setupLevel() {
    level_setSize = Math.ceil(currentLevel / 3) + 1;
    level_numSets = (currentLevel - 1) % 3 + 3;

    level_timer = 0;
    level_attempts = 0;
    level_flippedCards = 0;
    matchesMade = 0;
    level_lives = level_numSets * 2;

    generateCardGrid(
        level_setSize, level_numSets,
        screenToWorldSpace(0.1, 0.18),
        screenToWorldSpace(0.8, 0.82)
    );
}

function checkForMatch() {
    var cardIDs = []
    for (let i in CARDS) {
        if (CARDS[i].isanimFinishedFaceUP) {
            cardIDs.push(CARDS[i].extraData);
        }
    }
    var IDsMatch = cardIDs.every((val, i, arr) => val === arr[0]);
    for (let i in CARDS) {
        if (CARDS[i].isanimFinishedFaceUP) {
            if (IDsMatch) {
                CARDS[i].startRemoveAnim();
                CARDS[i].isanimFinishedFaceUP = false;
            } else {
                CARDS[i].startFlipAnim();
            }
        }
    }
    if (IDsMatch) {
        level_flippedCards = 0;
        matchesMade++;
    } else {
        level_lives--;
    }
}

var level_flippedCards = 0;
var level_numSets = 0;
var level_setSize = 0;
var matchesMade = 0;

var level_score = 0;
var level_attempts = 0;
var level_lives = level_numSets * 2;

var level_timer = 0;
const level_CLOCK = new UIText(screenToWorldSpace(0.9, 0.03), "60", "'Courier new'",
    "white", "00:00", undefined, undefined, "right");

const LIVES_TEXT = new UIText(screenToWorldSpace(0.9, 0.1), "60", "'Courier new'",
    "white", "00:00", undefined, undefined, "right");

const SCORE = new UIText(screenToWorldSpace(0.2, 0.1), "60", "'Courier new'",
    "white", "00:00", undefined, undefined, "left");

function logicUpdate() {
    var faceUpCards = 0;
    if (level_flippedCards >= level_setSize) {
        for (let i in CARDS) {
            if (CARDS[i].isanimFinishedFaceUP) {
                faceUpCards++;
            }
        }
        if (faceUpCards === level_setSize) {
            checkForMatch();
            level_attempts++;
        }
        if (matchesMade === level_numSets) {
            winLevel();
        }
        if (level_lives <= 0) {
            loseLevel();
        }
    }
    if (!gameIsPaused && !levelComplete) {
        level_timer += deltaTime.get('delta');
    }
    const [min, sec] = calculateTime(level_timer);
    level_CLOCK.text = `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
    UI.push(level_CLOCK);

    level_score = calculateScore();
    BACKGROUND_ELEMS[0].color = level_score > playerData.levelScores[currentLevel - 1] ? "#FFD700" : "#FFD70000";

    LIVES_TEXT.text = `Lives: ${level_lives}`;
    UI.push(LIVES_TEXT);

    SCORE.text = `Score: ${level_score}`;
    UI.push(SCORE);
}

function calculateTime(timer) {
    const min = Math.floor(timer / 60);
    const sec = Math.floor(timer % 60);
    return [min, sec];
}

function calculateScore() {
    const timeScore = Math.floor(level_timer) * 1;
    const attemptsScore = Math.max((level_attempts - level_numSets), 0) * Math.round(100 / (level_setSize - 1));
    return 1000 - (timeScore + attemptsScore);
}

function winLevel() {
    levelComplete = true;
    if (currentLevel === levelUnlock) {
        levelUnlock++;
    }
    level_score = calculateScore();

    var index = currentLevel - 1;
    if (playerData.levelScores.length >= currentLevel) {
        const currentScore = playerData.levelScores[index];
        const currentTime = playerData.levelTimes[index];
        if (currentScore < level_score) {
            playerData.levelScores[index] = level_score;
        }
        if (currentTime > Math.floor(level_timer)) {
            playerData.levelTimes[index] = Math.floor(level_timer);
        }
    } else {
        playerData.levelScores.push(level_score);
        playerData.levelTimes.push(Math.floor(level_timer));
    }

    playerData.unlock = levelUnlock
    saveGameData(playerData);

    setupScene();
}

function loseLevel() {
    levelLost = true;
    setupScene();
}

window.onload = () => {
    init(); // initialize the game
    startFrames(); // start running frames
}

//========================================================
//======================== MUSIC =========================
// All music © 2023 Henry Grantham-Smith.

var currentIndex = 0;

async function playTracks() {
    var tracks = await shuffleArray(["./songs/Bit Vibes.mp3", "./songs/Lofi Vibes.mp3", "./songs/Waltz Vibes.mp3"]);
    // Set the duration of the break between tracks (in milliseconds)
    var breakDuration = 2000;

    // Create an array of Promises to preload the audio files
    var preloadPromises = tracks.map(track => {
        return new Promise(resolve => {
            var audio = new Audio(track);
            audio.addEventListener('canplaythrough', () => {
                resolve();
            });
        });
    });

    // Wait for all the audio files to finish preloading
    await Promise.all(preloadPromises);

    // Create a loop to play each track
    while (true) {
        // Create a new audio element
        var audio = new Audio(tracks[currentIndex]);

        // Play the audio
        audio.play();

        // Wait for the audio to finish playing before scheduling the next track
        await new Promise(resolve => audio.addEventListener('ended', resolve));

        // Increment the current index to play the next track
        currentIndex++;

        // If the current index is equal to the length of the playlist,
        // reset the index to 0 to start playing the playlist from the beginning
        if (currentIndex == tracks.length) {
            currentIndex = 0;
        }

        // Wait for the break duration before playing the next track
        await new Promise(resolve => setTimeout(resolve, breakDuration));
    }
}
