function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
        index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
        this.frameWidth, this.frameHeight,
        locX, locY,
        this.frameWidth * scaleBy,
        this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game) {
    this.back1 = new Animation(ASSET_MANAGER.getAsset("./img/Background.png"), 0, 0, 1680, 1050, 1, 1, true, true);
    this.tile1 = new Animation(ASSET_MANAGER.getAsset("./img/52Tilea.png"), 0, 0, 52, 52, 1, 1, true, true);
    this.hud = new Animation(ASSET_MANAGER.getAsset("./img/HudPrototype1.png"), 0, 0, 250, 360, 1, 1, true, true);
    Entity.call(this, game, 0, 400);
    this.radius = 200;
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
    ctx.fillStyle = "#808080"; 
    this.back1.drawFrame(this.game.clockTick, ctx, 0, 0, 1);

    var tileSize = 52;
    for (i = 0; i < 20; i++) {
        for (j = 0; j < 3; j++) {
            this.tile1.drawFrame(this.game.clockTick, ctx, i * tileSize, (600 + j * tileSize), 1);
        }

    }

    this.hud.drawFrame(this.game.clockTick, ctx, 875, 0, 1 / 2);
    Entity.prototype.draw.call(this);
}


function Hero(game) {
    this.idleR = new Animation(ASSET_MANAGER.getAsset("./img/Hero.png"), 0, 0, 55, 60, .20, 1, true, true);
    this.idleL = new Animation(ASSET_MANAGER.getAsset("./img/Hero.png"), 220, 60, 55, 60, .20, 1, true, true);
    this.RunningR = new Animation(ASSET_MANAGER.getAsset("./img/Hero.png"), 55, 0, 55, 60, .20, 4, true, false);
    this.RunningL = new Animation(ASSET_MANAGER.getAsset("./img/Hero.png"), 0, 60, 55, 60, .20, 4, true, false);
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/Hero.png"), 0, 0, 55, 60, .20, 5, true, false);
    this.jumpAnimationL = new Animation(ASSET_MANAGER.getAsset("./img/Hero.png"), 0, 60, 55, 60, .20, 5, true, false);
    this.SwordR = new Animation(ASSET_MANAGER.getAsset("./img/HeroSword.png"), 0, 0, 60, 60, .15, 9, true, true);
    this.SwordL = new Animation(ASSET_MANAGER.getAsset("./img/HeroSwordR.png"), 0, 0, 60, 60, .15, 9, true, true);
    this.jumping = false;
    this.attack = false;
    this.moveR = false;
    this.moveL = false;
    this.radius = 50;
    this.ground = 500;
    this.accel = 0;
    this.yAccel = 0;
    this.direction = true;
    this.gravity = 1;
    this.canJump = true;
    Entity.call(this, game, 0, 500);
}

Hero.prototype = new Entity();
Hero.prototype.constructor = Hero;

// The update function
Hero.prototype.update = function () {

    if (this.y > this.ground) {
        this.jumping = false;
        this.y = this.ground;
        this.canJump = true;
        this.yAccel = 0;
    }


    if (this.jumping === false) {
        if (this.accel < -1) {
            this.accel += .2;
        } else if (this.accel > 1) {
            this.accel -= .2;
        } else {
            this.accel = 0;
        }
    }


    this.x = this.x + this.accel;
    this.y = this.y + this.yAccel;


    if (!this.jumping && this.game.keysActive[' '.charCodeAt(0)]) {
        this.jumping = true;
    }

    this.moveR = this.game.keysActive['D'.charCodeAt(0)] ||
        this.game.keysActive[39]; //39 = Left arrow key code
    this.moveL = this.game.keysActive['A'.charCodeAt(0)] ||
        this.game.keysActive[37]; //39 = Right arrow key code


    if (this.jumping) {
        if (this.canJump) {
            this.yAccel = -25;
        }
        this.canJump = false;

        this.yAccel = this.yAccel + this.gravity;

    }

    if (this.moveR) {
        this.direction = true;
        if (this.accel > 0) {
            this.accel = 10;

        } else {
            this.accel = 5;
        }
    }

    if (this.moveL) {
        this.direction = false;
        if (this.accel < 0) {
            this.accel = -10;
        } else {
            this.accel = -5;
        }
    }

    if (this.game.rightMouseDown) {
        var bullet = new Projectile(this.game, this.x + 50, this.y + 50, 0.25, 25);
        bullet.setAngle(bullet.x, bullet.y, bullet.game.mouseX, bullet.game.mouseY);
        this.game.addEntity(bullet);
    }

    Entity.prototype.update.call(this);
}

Hero.prototype.draw = function (ctx) {
	
	// was this.game.attack
	 if (this.game.keysActive['F'.charCodeAt(0)] || this.game.attack) {

	        if (this.direction) {
	            this.SwordR.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
	        } else {
	            this.SwordL.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
	        }


	    }
	
	 else if (this.jumping) {

        if (this.direction) {
            this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
        } else {
            this.jumpAnimationL.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
        }


    }


    else if (this.accel != 0) {
        if (this.direction) {
            this.RunningR.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
        } else {
            this.RunningL.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
        }

    } else {

        if (this.direction) {
            this.idleR.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
        } else {
            this.idleL.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
        }

    }
    Entity.prototype.draw.call(this);
}

// --- End of hero  

// --- Start of Projectile

function Projectile(game, x, y, scale, speed) {
    this.img = new Animation(ASSET_MANAGER.getAsset("./img/bullet.png"), 0, 0, 51, 60, .20, 1, true, true);
    this.scale = scale;
    this.speed = speed;
    this.setAngle(x, y, game.mouseX, game.mouseY);
    this.xSpeed = this.speed * Math.cos(this.angle * Math.PI / 180.0);
    this.ySpeed = this.speed * Math.sin(this.angle * Math.PI / 180.0);
    Entity.call(this, game, x, y);
}

Projectile.prototype = new Entity();
Projectile.prototype.constructor = Projectile;

// Given starting coordinates and ending/target coordinates, sets the angle accordingly
// 0 is right, 90 is down, -90 is up, etc.
Projectile.prototype.setAngle = function(startX, startY, endX, endY) {
    var opp = endY - startY;
    var adj = endX - startX;
    var hyp = Math.sqrt(Math.pow(opp, 2) + Math.pow(adj, 2));
    this.angle = Math.asin(opp / hyp) * 180 / Math.PI;
    if (opp < 0 && adj < 0) {
        this.angle = -180 - this.angle;
    } else if (adj < 0) {
        this.angle = 180 - this.angle;
    }
}

Projectile.prototype.update = function () {
    this.x += this.xSpeed;
    this.y += this.ySpeed;
    Entity.prototype.update.call(this);
}

// Reference: https://www.w3schools.com/graphics/game_rotation.asp 
Projectile.prototype.draw = function (ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle * Math.PI / 180.0);
    this.img.drawFrame(this.game.clockTick, ctx, -1 * this.img.spriteSheet.width * this.scale / 2, -1 * this.img.spriteSheet.height * this.scale / 2, this.scale);
    ctx.restore();
    Entity.prototype.draw.call(this);
}

// --- End of Projectile

// --- Start of Cannon

function Cannon(game) {
    this.C1 = new Animation(ASSET_MANAGER.getAsset("./img/Cannon.png"), 0, 0, 130, 85, .20, 3, true, true);
    this.CR = new Animation(ASSET_MANAGER.getAsset("./img/CannonR.png"), 0, 0, 130, 85, .20, 3, true, true);
    this.jumping = false;
    this.attack = false;
    this.moveR = true;
    this.moveL = false;
    this.radius = 50;
    this.ground = 500;
    this.accel = 0;
    this.yAccel = 0;
    this.direction = true;
    this.gravity = 1;
    this.canJump = true;
    Entity.call(this, game, 200, 500);
}

Cannon.prototype = new Entity();
Cannon.prototype.constructor = Cannon;

// The update function
Cannon.prototype.update = function () {

    if (this.y > this.ground) {
        this.jumping = false;
        this.y = this.ground;
        this.canJump = true;
        this.yAccel = 0;
    }


    if (this.jumping === false) {
        if (this.accel < -1) {
            this.accel += .2;
        } else if (this.accel > 1) {
            this.accel -= .2;
        } else {
            this.accel = 0;
        }
    }

    this.x = this.x + this.accel;  
    
    if (this.x < 150) {
    	this.moveR = true;
    	this.moveL = false;
    }
    if (this.x > 700) {
    	this.moveL = true;
    	this.moveR = false
    }
  

    if (this.moveR) {
        this.direction = true;
        if (this.accel > 0) {
            this.accel = 5;

        } else {
            this.accel = 3;
       }
    }

    if (this.moveL) {
        this.direction = false;
        if (this.accel < 0) {
            this.accel = -5;
        } else {
            this.accel = -3;
        }

    }

    Entity.prototype.update.call(this);
}

Cannon.prototype.draw = function (ctx) {
	
	  if (this.accel != 0) {
        if (this.direction) {
            this.C1.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
        } else {
            this.CR.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
        }

    } else {

        if (this.direction) {
            this.C1.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
        } else {
            this.CR.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
        }

    }
    Entity.prototype.draw.call(this);
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/Hero.png");
ASSET_MANAGER.queueDownload("./img/HeroSword.png");
ASSET_MANAGER.queueDownload("./img/HeroSwordR.png");
ASSET_MANAGER.queueDownload("./img/Background.png");
ASSET_MANAGER.queueDownload("./img/52Tile.png");
ASSET_MANAGER.queueDownload("./img/52Tilea.png");
ASSET_MANAGER.queueDownload("./img/HudPrototype1.png");
ASSET_MANAGER.queueDownload("./img/bullet.png");
ASSET_MANAGER.queueDownload("./img/Cannon.png");
ASSET_MANAGER.queueDownload("./img/CannonR.png");

ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var bg = new Background(gameEngine);
    var hero = new Hero(gameEngine);
    var e1 = new Cannon(gameEngine);

    gameEngine.addEntity(bg);
    gameEngine.addEntity(hero);
    gameEngine.addEntity(e1);

    // gameEngine.addEntity(new Projectile(gameEngine));
 
    gameEngine.init(ctx);
    gameEngine.start();
});
