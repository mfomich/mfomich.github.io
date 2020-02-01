// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011


// Requests an animation frame
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();


// A timer for the game
function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

// Tick function
Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;
    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

// Game engine
function GameEngine() {
    this.entities = [];
    this.showOutlines = false;
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.leftMouseDown = null;
    this.rightMouseDown = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.keysActive = null;
}

// The initialized function
GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.leftMouseDown = false;
    this.rightMouseDown = false;
    this.keysActive = new Array(255).fill(false); // Keeps track of active keys on canvas
    this.startInput();
    this.timer = new Timer();
    console.log('game initialized');
}

// Starting the game
GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}


GameEngine.prototype.startInput = function () {
    console.log('Starting input');
    var that = this;

    this.ctx.canvas.addEventListener("keydown", function (e) {
        e.preventDefault();
        //console.log(e);
        // Array of all of the keys on the keyboard
        // Set key that is pressed to true
        that.keysActive[e.which] = true;

    }, false);

    // When a key is released
    this.ctx.canvas.addEventListener("keyup", function (e) {

        that.keysActive[e.which] = false;

    }, false);

    /*
    Set all keys to false when the canvas loses focus so that you character doesn't 
    keep moving without the key pressed
    */
    this.ctx.canvas.addEventListener("focusout", function (e) {
        that.keysActive.fill(false);
        //that.attack = false;
    });

    // Right click event
    this.ctx.canvas.addEventListener("contextmenu", (e) => {
        // Action
    	//that.attack = true;
        console.log("Right Click");
    });

    // Left click event
    this.ctx.canvas.addEventListener("mousedown", (e) => {
        // Action
    	//that.keysActive.fill(true);
    	if (e.which == 1) {
            that.attack = true;
        } else if (e.which == 3) {
            that.rightMouseDown = true;
        }
        console.log("Left Click");
    });
    
    this.ctx.canvas.addEventListener("mouseup", (e) => {
        // Action
    	//that.keysActive.fill(true);
    	if (e.which == 1) {
            that.attack = false;
        } else if (e.which == 3) {
            that.rightMouseDown = false;
        }
        console.log("Left Click");
    });

    this.ctx.canvas.addEventListener("mousemove", function (e) {
        that.mouseX = e.clientX;
        that.mouseY = e.clientY;
    });
      

    console.log('Input started');
}

GameEngine.prototype.addEntity = function (entity) {
    console.log('added entity');
    this.entities.push(entity);
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1);
        }
    }
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    this.space = null;
    this.left = null;
    this.right = null;
    
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
    this.attack = null;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
    }
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
}
