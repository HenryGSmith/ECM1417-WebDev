//=====================================================
//=================== CANVAS SET-UP ===================

const canvas = document.querySelector("canvas");

// internal canvas space dimenesions
const canvasDims = { width: 300, height: 185 };
canvas.width = canvasDims.width;
canvas.height = canvasDims.height;

//=====================================================
//====================== UTILITY ======================

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
    var height = window.innerHeight - (distToTop + vh)

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

//====================================================
//================= INPUT MANAGEMENT =================

canvas.addEventListener("mousemove", (e) => {
    GLOBALS.mouse.x = (e.offsetX / GLOBALS.screen.width) * canvas.width;
    GLOBALS.mouse.y = (e.offsetY / GLOBALS.screen.height) * canvas.height;
})

canvas.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
        for (let p in CARDS) {
            if (CARDS[p].isZoomed) {
                CARDS[p].startFlipAnim();
            }
        }
    }
})

//====================================================
//================ RENDERING PIPELINE ================

// - 2d context
const ctx = canvas.getContext("2d");

//-----------------------------------------------------
//---------------------- SPRITES ----------------------

function square(x, y) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

//----------------------------------------------------
//------------------ OBJECT SPRITES ------------------

class card {
    constructor(x, y, w, h, zw = 50, zh = 60) {
        this.anchor = { x: x, y: y };
        this.offset = { x: 0, y: 0 };
        this.originalDims = { w: w, h: h };
        this.currentDims = { w: w, h: h };
        this.zoomedDims = { w: zw, h: zh }
        this.isZoomed = false;
        this.isFliped = false;
        this.faceDown = true;

        this.flipAnimRunning = false;
        this.zoomInAnimRunning = false;
        this.zoomOutAnimRunning = false;
        this.removeAnimRunning = false;

        this.AnimCounter = { flip: 0, zoomIn: 0, zoomOut: 0, remove: 0 };
    }

    //animations
    startFlipAnim() {
        if (!this.flipAnimRunning) {
            this.flipAnimRunning = true;
            this.isFliped = false;
        }
    }
    flipAnim(speed = 0.03) {
        this.currentDims.w = Math.abs(Math.cos(this.AnimCounter.flip)) * this.zoomedDims.w;
        this.offset.x = (this.originalDims.w - this.currentDims.w) / 2
        if (this.AnimCounter.flip > Math.PI / 2 && !this.isFliped) {
            this.isFliped = true;
            this.faceDown = !this.faceDown;
            // change image
        }
        if (this.AnimCounter.flip <= Math.PI) {
            this.AnimCounter.flip += speed;
        }
        else {
            this.AnimCounter.flip = 0;
            this.flipAnimRunning = false;
        }
    }

    zoomInAnim(speed = 0.1) {
        if (this.AnimCounter.zoomIn < 1) {
            this.currentDims.w = lerp(this.originalDims.w, this.zoomedDims.w, this.AnimCounter.zoomIn);
            this.currentDims.h = lerp(this.originalDims.h, this.zoomedDims.h, this.AnimCounter.zoomIn);
            this.offset.x = (this.originalDims.w - this.currentDims.w) / 2;
            this.offset.y = (this.originalDims.h - this.currentDims.h) / 2;
            this.AnimCounter.zoomIn += speed;
        } else {
            this.AnimCounter.zoomIn = 0;
            this.zoomInAnimRunning = false;
        }
    }

    zoomOutAnim(speed = 0.1) {
        if (this.AnimCounter.zoomOut <= 1) {
            this.currentDims.w = lerp(this.zoomedDims.w, this.originalDims.w, this.AnimCounter.zoomOut);
            this.currentDims.h = lerp(this.zoomedDims.h, this.originalDims.h, this.AnimCounter.zoomOut);
            this.offset.y = (this.originalDims.h - this.currentDims.h) / 2;
            this.offset.x = (this.originalDims.w - this.currentDims.w) / 2;
            this.AnimCounter.zoomOut += speed;
        } else {
            this.AnimCounter.zoomOut = 0;
            this.zoomOutAnimRunning = false;
        }
    }

    removeAnim() {

    }

    // object management
    update() {
        // hovering over the card
        var xBound = GLOBALS.mouse.x >= this.anchor.x + this.offset.x && GLOBALS.mouse.x <= this.anchor.x + this.offset.x + this.currentDims.w;
        var yBound = GLOBALS.mouse.y >= this.anchor.y + this.offset.y && GLOBALS.mouse.y <= this.anchor.y + this.offset.y + this.currentDims.h;
        if (!this.flipAnimRunning) {
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
    }
    render() {
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

        // draw sprite to canvas
        var x = this.anchor.x + this.offset.x;
        var y = this.anchor.y + this.offset.y;
        ctx.fillStyle = (this.faceDown) ? "green" : "red";
        ctx.fillRect(x, y, this.currentDims.w, this.currentDims.h);
    }
}

//-----------------------------------------------------
//------------------ FRAME RENDERING ------------------

// globally accessable states
const GLOBALS = {
    mouse: { x: 0, y: 0 },
    screen: { width: 0, height: 0 }
};

//storage of all interactable elements
const CARDS = [];
CARDS.push(new card(10, 10, 38, 50, 48, 60));


// applies initial settings
function init() {
    resizeCanvas();
}

// renders background elements
function renderBackground() {
    //square(0,0);
}

// renders prop objects from PROPS
function renderProps() {
    for (let p in CARDS) {
        CARDS[p].render();
    }
}

// renders out each frame
function startFrames() {
    // erase canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // render entities in order
    renderBackground();
    renderProps();

    // call next frame
    window.requestAnimationFrame(startFrames);
}

init(); // initialize the game
startFrames(); // start running frames