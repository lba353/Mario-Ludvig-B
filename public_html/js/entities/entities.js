// TODO
game.PlayerEntity = me.Entity.extend({
    init: function(x, y, settings){
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
    
        this.renderable.addAnimation("idle", [3]);
        this.renderable.addAnimation("smallWalk", [8, 9, 10, 11, 12, 13], 80);
        
        this.renderable.setCurrentAnimation("idle");
        
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
        
        if(this.body.vel.x !== 0) {
            if(!this.renderable.isCurrentAnimation("smallWalk")) {
                this.renderable.setCurrentAnimation("smallWalk");
                this.renderable.setAnimationFrame();
            }
        }
        else {
            this.renderable.setCurrentAnimation("idle");
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
                me.state.change(me.state.MENU);
            }
        }
    }
});
    
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

game.BadGuy = me.Entity.extend ({
    init: function(x, y, settings) {
        this._super(me.Entity, "init", [x, y, {
             image: "slime",
             spritewidth: "60",
             spriteheight: "28",
             width: 60,
             height: 28,
             getShape: function() {
                 return (new me.Rect(0, 0, 60, 28)).toPolygon();
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
        
        this.renderable.addAnimation("run", [0, 1, 2], 80);
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