//=====================================================
//=================== CANVAS SET-UP ===================

const canvas = document.querySelector("canvas");

// internal canvas space dimenesions
const canvasDims = { width: 1200, height: 185 * 4 };
canvas.width = canvasDims.width;
canvas.height = canvasDims.height;

// - 2d context
const ctx = canvas.getContext("2d");

//=====================================================
//====================== UTILITY ======================

var DATA = {
    data: []
}
var personalData = {
    name: "",
    icon: [],
    levelTimes: [],
    levelScores: [],
    unlock: 1
}

// create data profile for player
var account = getCookie("data");
var existingData =
    personalData.name = account.username;
personalData.icon[0] = account.body_radio;
personalData.icon[1] = account.eyes_radio;
personalData.icon[2] = account.mouth_radio;
setCookie("gameData", personalData, "30");

updateJSON(personalData);

// dynamic screen fit
function resizeCanvas() {
    // resize the canvas to fit the window while 
    // preserving the aspect ratio and ensuring that
    // the whole canvas is allways on screen

    let dims = {
        width: window.innerWidth,
        height: (canvasDims.height / canvasDims.width) * window.innerWidth
    };

    var aspectRatio = canvasDims.width / canvasDims.height;
    canvas.style.aspectRatio = aspectRatio;

    var distToTop = window.pageYOffset + canvas.getBoundingClientRect().top;
    var vh = window.innerHeight / 100;
    var vw = window.innerWidth / 100;
    var height = window.innerHeight - (distToTop + vh * 10)

    if (height > dims.height) {
        // base height off of width
        canvas.style.width = dims.width - 2 * vw + "px";
        canvas.style.height = dims.height + "px";

        GLOBALS.screen.width = dims.width - 2 * vw;
        GLOBALS.screen.height = dims.height;
    } else {
        // base width off of height
        var width = height * aspectRatio + "px"
        canvas.style.height = height + "px";
        canvas.style.width = width;

        GLOBALS.screen.width = height * aspectRatio;
        GLOBALS.screen.height = height;
    }
}

window.addEventListener("resize", resizeCanvas);

function lerp(startValue, endValue, t) {
    return (startValue + (endValue - startValue) * t);
}

function screenToWorldSpace(x, y) {
    // screen space 0 to 1 on width and height
    // world space = canvas space
    xWorld = lerp(0, canvasDims.width, x);
    yWorld = lerp(0, canvasDims.height, y);

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
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            const jsonStr = cookie.substring(name.length + 1);
            const output = decodeURIComponent(jsonStr)
            return JSON.parse(output);
        }
    }
    return null;
}

function getJSON() {
    var output_data;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', './gameData.json');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
      if (xhr.status === 200) {
        const responseData = JSON.parse(xhr.responseText);
        console.log(responseData);
      } else {
        console.error('Error:', xhr.statusText);
      }
    };
    xhr.onerror = function() {
      console.error('Error:', xhr.statusText);
    };
    xhr.send();

    return output_data;
}

function updateJSON(object) {
    const currentJsonData = getJSON();

    console.log(DATA + " update");
    console.log(currentJsonData + " update");
    if(DATA.data.length === 0){
        DATA.data.push(object);
    }
    for (let i in DATA.data) {
        if (DATA.data[i].name === object.name) {
            console.log(DATA.data[i].name);
            console.log(object.name);
            DATA.data[i] = object;
        } else {
            DATA.data.push(object);
            console.log("add");
        }
    }
    saveJSON(DATA);
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

//====================================================
//================= INPUT MANAGEMENT =================

canvas.addEventListener("mousemove", (e) => {
    GLOBALS.mouse.x = (e.offsetX / GLOBALS.screen.width) * canvas.width;
    GLOBALS.mouse.y = (e.offsetY / GLOBALS.screen.height) * canvas.height;
})

canvas.addEventListener("click", (e) => {
    if (e.button === 0) {
        for (let i in UI_FLOAT) {
            if (UI_FLOAT[i].isZoomed) {
                UI_FLOAT[i].onClick();
            }
        }
        if (gameIsPaused) {
            return;
        }
        for (let i in UI) {
            if (UI[i].isZoomed) {
                UI[i].onClick();
            }
        }
        for (let p in CARDS) {
            if (CARDS[p].isHovered) {
                CARDS[p].onClick();
            }
        }
    }
})

//====================================================
//================ RENDERING PIPELINE ================

//-----------------------------------------------------
//---------------------- SPRITES ----------------------

function square(x, y) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

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
            this.AnimCounter.zoomIn += speed * deltaTime.delta;
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
            this.AnimCounter.zoomOut += speed * deltaTime.delta;
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
        var xBound = GLOBALS.mouse.x >= this.anchor.x + this.offset.x && GLOBALS.mouse.x <= this.anchor.x + this.offset.x + this.currentDims.w;
        var yBound = GLOBALS.mouse.y >= this.anchor.y + this.offset.y && GLOBALS.mouse.y <= this.anchor.y + this.offset.y + this.currentDims.h;
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
            this.AnimCounter.flip += speed * deltaTime.delta;
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
            this.AnimCounter.zoomIn += speed * deltaTime.delta;
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
            this.AnimCounter.zoomOut += speed * deltaTime.delta;
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
        this.offset.x += speed * deltaTime.delta;
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
        var xBound = GLOBALS.mouse.x >= this.anchor.x + this.offset.x && GLOBALS.mouse.x <= this.anchor.x + this.offset.x + this.currentDims.w;
        var yBound = GLOBALS.mouse.y >= this.anchor.y + this.offset.y && GLOBALS.mouse.y <= this.anchor.y + this.offset.y + this.currentDims.h;
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
            var img1 = GLOBALS.Images.body[this.extraData[0]];
            var img2 = GLOBALS.Images.eyes[this.extraData[1]];
            var img3 = GLOBALS.Images.mouth[this.extraData[2]];
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

// globally accessable states
const GLOBALS = {
    mouse: { x: 0, y: 0 },
    screen: { width: 0, height: 0 },
    Images: {
        body: [
            new Image(), new Image(), new Image()],
        eyes: [
            new Image(), new Image(), new Image(),
            new Image(), new Image(), new Image()
        ],
        mouth: [
            new Image(), new Image(), new Image(),
            new Image(), new Image(), new Image()
        ]
    }
};

// emoji images
GLOBALS.Images.body[0].src = "/emojiAssets/body/green.png";
GLOBALS.Images.body[1].src = "/emojiAssets/body/red.png";
GLOBALS.Images.body[2].src = "/emojiAssets/body/yellow.png";

GLOBALS.Images.eyes[0].src = "/emojiAssets/eyes/closed.png";
GLOBALS.Images.eyes[1].src = "/emojiAssets/eyes/laughing.png";
GLOBALS.Images.eyes[2].src = "/emojiAssets/eyes/long.png";
GLOBALS.Images.eyes[3].src = "/emojiAssets/eyes/normal.png";
GLOBALS.Images.eyes[4].src = "/emojiAssets/eyes/rolling.png";
GLOBALS.Images.eyes[5].src = "/emojiAssets/eyes/winking.png";

GLOBALS.Images.mouth[0].src = "/emojiAssets/mouth/open.png";
GLOBALS.Images.mouth[1].src = "/emojiAssets/mouth/sad.png";
GLOBALS.Images.mouth[2].src = "/emojiAssets/mouth/smiling.png";
GLOBALS.Images.mouth[3].src = "/emojiAssets/mouth/straight.png";
GLOBALS.Images.mouth[4].src = "/emojiAssets/mouth/surprise.png";
GLOBALS.Images.mouth[5].src = "/emojiAssets/mouth/teeth.png";

//storage of all interactable elements
const CARDS = [];
const UI = [];
const UI_FLOAT = [];

// renders background elements
const BACKGROUND_ELEMS = [];
function renderBackground() {
    for (let i in BACKGROUND_ELEMS) {
        BACKGROUND_ELEMS[i].render();
    }
}

// renders prop objects from PROPS
function renderProps() {
    var renderOrder = [];
    var zoomedCards = [];
    for (let i in CARDS) {
        if (CARDS[i].removeAnimRunning) {
            zoomedCards.push(CARDS[i]);
        } else {
            renderOrder.push(CARDS[i]);
        }
    }
    renderOrder = renderOrder.concat(zoomedCards);
    for (let i in renderOrder) {
        renderOrder[i].render();
    }
    for (let i in UI) {
        UI[i].render();
    }
}

function renderFloatUI() {
    for (let i in UI_FLOAT) {
        UI_FLOAT[i].render();
    }
}

// renders out each frame
function startFrames() {
    //reset update limit for on screen button presses.
    updateLimiter = false;
    setDelta();
    //console.log(Math.round(1/deltaTime.delta));

    //update game logic
    if (currentScene === "level") {
        logicUpdate();
    }

    // erase canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // render entities in order
    renderBackground();
    renderProps();
    renderFloatUI();

    // call next frame
    window.requestAnimationFrame(startFrames);
}

const deltaTime = {
    now: 0,
    delta: 0,
    then: 0
}
function setDelta() {
    deltaTime.then = deltaTime.now;
    deltaTime.now = Date.now();
    deltaTime.delta = (deltaTime.now - deltaTime.then) / 1000;
}

//====================================================
//==================== GAME LOGIC ====================

// applies initial settings
function init() {
    resizeCanvas();
    setupScene();
}

function generateLevelGrid(anchor, dims, zoom, buffer = 0.04) {
    var grid = [];
    var x = anchor[0];
    var y = anchor[1];
    var gridWidth = dims[0];
    var gridHeight = dims[1];

    var dim = (gridHeight / 3) - screenToWorldSpace(buffer, 0)[0];
    var difference = gridWidth / 3 - dim;

    var zoomVal = zoom

    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            var index = 3 * j + i + 1;
            var color = "";
            if (index > levelUnlock) {
                color = "#546375";
                zoomVal = 0;
            } else {
                color = "#F49D37";
                zoomVal = zoom;
            }

            var button =
                new UIButton(
                    [x + (i * gridWidth / 3) + difference / 2, y + (j * gridHeight / 3)],
                    [dim, dim], [dim + zoomVal, dim + zoomVal],
                    (n) => {
                        if (n <= levelUnlock) {
                            currentScene = "level"
                            currentLevel = n;
                            setupLevel();
                            setupScene();
                        }
                    },
                    index, color
                );
            button.extraData = index;
            grid.push(button);
        }
    }

    return grid;
}

var currentScene = "start_menu";
var currentLevel = 0;
var levelUnlock = 1;
var gameIsPaused = false;
var updateLimiter = false;

var levelComplete = false;


const SCENES = {
    start_menu: {
        UI: {
            buttons: [
                new UIButton(
                    screenToWorldSpace(0.3, 0.4), screenToWorldSpace(0.4, 0.2), screenToWorldSpace(0.42, 0.22),
                    () => {
                        currentScene = "level_select"
                        setupScene();
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
                    "white", "Match " + level_setSize, undefined, undefined, "left")
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
            }
        },
        Background: []
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
        SCENES[currentScene].UI.text[0].text = "Match " + level_setSize;
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

}

//-----------------------------------------------------
//-------------------- LEVEL LOGIC --------------------

function generateCardGrid(setSize, nSets, anchor, dims) {
    var map = generateMatchMap(setSize, nSets);
    do {
        var faces = Array.from({ length: nSets }, () => generateFace());
        if (!hasMatchingRows(faces)) {
            break;
        }
    } while (true)

    var buffer = screenToWorldSpace(0.02, 0)[0];
    var cardPlaceDims = { w: dims[0] / nSets, h: dims[1] / setSize };
    var cardHeight = cardPlaceDims.h - buffer * 2
    var cardWidth = cardHeight * (5 / 7);
    if (cardWidth + buffer > cardPlaceDims.w) {
        cardWidth = cardPlaceDims.w - buffer * 2;
        cardHeight = cardWidth * (7 / 5);
    }
    var widthOffset = (cardPlaceDims.w - cardWidth) / 2;

    for (let j in map) {
        for (let i in map[0]) {
            CARDS.push(new card(
                [anchor[0] + i * cardPlaceDims.w + widthOffset, anchor[1] + j * cardPlaceDims.h + buffer / 2],
                [cardWidth, cardHeight],
                [cardWidth + buffer, cardHeight + buffer],
                "#21897e", "#d72638",
                7, faces[map[j][i]]
            ));
        }
    }
}

function generateMatchMap(setSize, nSets) {
    var width = setSize;
    var height = nSets;
    const map = Array.from({ length: width }, () => new Array(height).fill(0));
    const occurrences = {};

    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            let randomElement;
            do {
                // Generate random number within range
                randomElement = Math.floor(Math.random() * nSets);

                // Check if element has already occurred maxOccurrences times
                if (!occurrences[randomElement] || occurrences[randomElement] < setSize) {
                    // Add element to array and increment occurrence count
                    map[i][j] = randomElement;
                    occurrences[randomElement] = (occurrences[randomElement] || 0) + 1;
                    break;
                }
            } while (true);
        }
    }

    return map;
}

function generateFace() {
    const face = [];
    face.push(Math.floor(Math.random() * 3))
    face.push(Math.floor(Math.random() * 6))
    face.push(Math.floor(Math.random() * 6))
    return face;
}

function setupLevel() {
    level_setSize = Math.ceil(currentLevel / 3) + 1;
    level_numSets = (currentLevel - 1) % 3 + 3;

    level_timer = 0;
    level_attempts = 0;
    level_flippedCards = 0;
    matchesMade = 0;
    generateCardGrid(level_setSize, level_numSets, screenToWorldSpace(0.1, 0.13), screenToWorldSpace(0.8, 0.87));
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
    }
}

var level_flippedCards = 0;
var level_numSets = 0;
var level_setSize = 0;
var matchesMade = 0;

var level_score = 0;
var level_attempts = 0;

var level_timer = 0;
const level_CLOCK = new UIText(screenToWorldSpace(0.8, 0.03), "60", "'Courier new'",
    "white", "00:00", undefined, undefined, "right")

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
    }
    if (!gameIsPaused && !levelComplete) {
        level_timer += deltaTime.delta;
    }
    var min = Math.floor(Math.floor(level_timer) / 60);
    var sec = Math.floor(level_timer) % 60;
    level_CLOCK.text = (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec;
    UI.push(level_CLOCK);
}

function winLevel() {
    levelComplete = true;
    if (currentLevel === levelUnlock) {
        levelUnlock++;
    }
    level_score = 1000 - Math.floor(level_timer * 1) - (level_attempts - level_numSets) * 10
    setupScene();
}

window.onload = () => {
    init(); // initialize the game
    startFrames(); // start running frames
}