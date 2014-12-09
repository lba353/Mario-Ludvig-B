game.GameOverScreen = me.ScreenObject.extend({
	/**	
	 *  action to perform on state change
	 */
	onResetEvent: function() {	
                //Added a new image in the title screen
		var titleImage = new me.Sprite(0, 0, me.loader.getImage("title-screen"));
                me.game.world.addChild(titleImage, -10);
                
                //Binds the key ENTER to restart the game.
                me.input.bindKey(me.input.KEY.ENTER, "start");
                
                //Sets the text font and color on the  title screen.
                me.game.world.addChild(new (me.Renderable.extend ({
                    init: function() {
                        this._super(me.Renderable, 'init', [510, 30, me.game.viewport.width, me.game.viewport.height]);
                        this.font = new me.Font("Broadway",  46, "red");
                        
                    },
                    
                    //Creates text on the title screen starting at certain positions.
                    draw: function(renderer) {
                        this.font.draw(renderer.getContext(), "Game Over", 420, 130);
                        this.font.draw(renderer.getContext(), "Press ENTER to restart", 300, 330);
                        
                    }
                    
                })));
                
                //Says if you hit start(ENTER), then restart the game.
                this.handler = me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge){
                    if(action === "start")
                        me.state.change(me.state.PLAY);
                });
                    
	},
	
	
	/**	
	 *  action to perform when leaving this screen (state change)
	 */
	onDestroyEvent: function() {
		me.input.unbindKey(me.input.KEY.ENTER);
                me.event.unsubscribe(this.handler);
	}
});
