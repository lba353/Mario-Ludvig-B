// Player (Mario) Codes
game.PlayerEntity = me.Entity.extend({
    init: function(x, y, settings){
        //Sets mario's widht and height.
        this._super(me.Entity, "init", [x, y, {
             image: "mario",
             spritewidth: "128",
             spriteheight: "128",
             width: 128,
             height: 128,
             getShape: function() {
                 return (new me.Rect(0, 0, 30, 128)).toPolygon();
             }
        }]);
        
        //Different animations that Mario uses.
        this.renderable.addAnimation("idle", [3]);
        this.renderable.addAnimation("bigIdle", [0]);
        this.renderable.addAnimation("smallWalk", [8, 9, 10, 11, 12, 13], 80);
        this.renderable.addAnimation("bigWalk", [14, 15, 16, 17, 18, 19], 80);
        this.renderable.addAnimation("shrink", [0, 1, 2, 3], 80);
        this.renderable.addAnimation("grow", [4, 5, 6, 7], 80);
        this.renderable.addAnimation("bigInvincible", [26, 27, 28, 29, 30], 80);
        this.renderable.addAnimation("invincible", [36, 37, 38, 39, 40], 80);
        this.renderable.addAnimation("invincibleIdle", [30], 80);
        this.renderable.addAnimation("bigInvincibleIdle", [40], 80);
        
        //His current animation when the game starts.
        this.renderable.setCurrentAnimation("idle");
        
        //His running and jumping speed.
        this.body.setVelocity(5, 20);
        
        //The camera follows the character.
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
    },
    
    update: function(delta){
        
        //Check if the right button is pressed
        if(me.input.isKeyPressed("left")) {
            
            //This says to unflip the image if it is flipped.
            this.flipX(true);
            //Adds the spped set in the setVeelocity method above to our current position and multiplies be timer.tick to.
            this.body.vel.x -= this.body.accel.x * me.timer.tick;
        } 
        else if(me.input.isKeyPressed("right")) {
            
            //Flips the image
            this.flipX(false);
            this.body.vel.x += this.body.accel.x * me.timer.tick;
        }
        else {
            this.body.vel.x = 0;
        }
        
        if(me.input.isKeyPressed("jump")) {
           if (!this.body.jumping && !this.body.falling) {
                this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
                this.body.jumping = true;
           }
        }
        
        this.body.update(delta);
        me.collision.check(this, true, this.collideHandler.bind(this), true);
        
        if(!this.big){
            if(this.body.vel.x !== 0) {
                if(!this.renderable.isCurrentAnimation("smallWalk") && !this.renderable.isCurrentAnimation("grow") && !this.renderable.isCurrentAnimation("shrink") && !this.renderable.isCurrentAnimation("invincible")) {
                    this.renderable.setCurrentAnimation("smallWalk");
                    this.renderable.setAnimationFrame();
                }
            }
            else{
                this.renderable.setCurrentAnimation("idle");
            }
        }
        else{
            if(this.body.vel.x !== 0) {
                if(!this.renderable.isCurrentAnimation("bigWalk") && !this.renderable.isCurrentAnimation("grow") && !this.renderable.isCurrentAnimation("shrink") && !this.renderable.isCurrentAnimation("bigInvincible")) {
                    this.renderable.setCurrentAnimation("bigWalk");
                    this.renderable.setAnimationFrame();
                }
            }
                else{
            this.renderable.setCurrentAnimation("bigIdle");
        }
    }
        
        
        this._super(me.Entity, "update", [delta]);
        return true;
    },
    
    collideHandler: function(response){
        
        //Sets ydif as the difference in position in between Mario and whatever he hit so we can see if Mario jumoed on something.
        var ydif = this.pos.y - response.b.pos.y;
        console.log(ydif);
        
        if(response.b.type === 'badguy') {
            if(ydif <= -115) {
                response.b.alive = false;
            }
            else {
                //This code shows what to do if it is big.
                if(this.big){
                    this.big = false;
                    this.body.vel.y -= this.body.accel.y * me.timer.tick;
                    this.jumping = true;
                    this.renderable.setCurrentAnimation("shrink", "idle");
                    this.renderable.setAnimationFrame();
                }
                else if(this.invincible){
                    response.b.alive = false;
                }
                else{
                //What to do when he dies.
                me.state.change(me.state.GAMEOVER);
                }
            }
        }
        //what to do if he eats a mushroom.
        else if(response.b.type === 'mushroom') {
            this.renderable.setCurrentAnimation("grow", "bigIdle");
            this.renderable.setAnimationFrame();
            this.big = true;
            me.game.world.removeChild(response.b);
        }
        
        //what to do if he gets a star.
        else if(response.b.type === 'star') {
            if(!this.big) {
                this.renderable.setCurrentAnimation("invincible", "invincibleIdle");
                this.renderable.setAnimationFrame();
                this.invincibility = true;
                me.game.world.removeChild(response.b);
                setInterval("invincible", 6000);
                setInterval("invincibleIdle", 6000);
            }    
            else {
                this.renderable.setCurrentAnimation("bigInvincible", "bigInvincibleIdle");
                this.renderable.setAnimationFrame();
                this.invincibility = true;
                me.game.world.removeChild(response.b);
                setInterval("bigInvincible", 6000);
                setInterval("bigInvincibleIdle", 6000);
            }
        }
    }
});
    
 //Level Trigger Code
game.LevelTrigger = me.Entity.extend({
    init: function(x, y, settings){
        this._super(me.Entity, 'init', [x, y, settings]);
        this.body.onCollision = this.onCollision.bind(this);
        this.level = settings.level;
        this.xSpawn = settings.xSpawn;
        this.ySpawn = settings.ySpawn;
    },
    
    onCollision: function(){
        this.body.setCollisionMask(me.collision.types.NO_OBJECT);
        me.levelDirector.loadLevel(this.level);
        me.state.current().resetPlayer(this.xSpawn, this.ySpawn);
    }
    
});

//Bad Guy Code
game.BadGuy = me.Entity.extend ({
    init: function(x, y, settings) {
        this._super(me.Entity, "init", [x, y, {
             image: "enemy",
             spritewidth: "64",
             spriteheight: "64",
             width: 128,
             height: 128,
             getShape: function() {
                 return (new me.Rect(0, 0, 64, 64)).toPolygon();
             }
        }]);
    
        this.spritewidth = 60;
        var width = settings.width;
        x = this.pos.x;
        this.startX = x;
        this.endX = x + width - this.spritewidth;
        this.pos.X = x + width - this.spritewidth;
        this.updateBounds();
        
        this.alwaysUpdate = true;
        
        this.walkLeft = false;
        this.alive = true;
        this.type = "badguy";
        
        this.renderable.addAnimation("run", [117, 118, 119, 120, 121, 122, 123, 124, 125], 100);
        this.renderable.setCurrentAnimation("run");
        
        this.body.setVelocity(4, 6);
    },
    
    update: function(delta) {
        this.body.update(delta);
        me.collision.check(this, true, this.collideHandler.bind(this), true);
        
        if(this.alive) {
            if(this.walkLeft && this.pos.x <= this.startX) {
                this.walkLeft = false;
            }
            else if (!this.walkLeft && this.pos.x >= this.endX) {
                this.walkLeft = true;
            }
            
            this.flipX(!this.walkLeft);
            //We are adding an amount to our current position, but to decide whether to add a + or - amount, we check to see if
            //this.walkLeft is true. If it is then we do the code to the left. If not, then we do the code to our right.  
            this.body.vel.x += (this.walkLeft) ? -this.body.accel.x * me.timer.tick : this.body.accel.x * me.timer.tick;
            
        }
        else {
            me.game.world.removeChild(this);
        }
        
        this._super(me.Entity, "update", [delta]);
        return true;
    },
    
    collideHandler: function() {
        
    }
});

//Mushroom Code
game.Mushroom = me.Entity.extend ({
    init: function(x, y, settings) {
        this._super(me.Entity, "init", [x, y, {
                image: "mushroom",
                spritewidth: "64",
                spriteheight: "64",
                width: 64,
                height: 64,
                getShape: function() {
                    return (new me.Rect(0, 0, 64, 64)).toPolygon();
                }
        }]);
    
        me.collision.check(this);
        this.type = "mushroom";
        
    }
});

//Star Code
game.Star = me.Entity.extend ({
    init: function(x, y, settings) {
        this._super(me.Entity, "init", [x, y, {
                image: "star",
                spritewidth: "64",
                spriteheight: "64",
                width: 64,
                height: 64,
                getShape: function() {
                    return (new me.Rect(0, 0, 64, 64)).toPolygon();
                }
        }]);
    
        me.collision.check(this);
        this.type = "star";
        
    }
});