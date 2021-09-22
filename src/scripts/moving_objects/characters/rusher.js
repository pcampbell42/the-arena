const Enemy = require("./enemy")


class Rusher extends Enemy {
    constructor(params) {
        super(params);

        this.images = "./dist/assets/rusher";
        this.idleFrames = 6; // # of frames in idle animation
        this.runningFrames = 6; // # of frames in running animation

        this.maxHealth = 20; // Used to figure out when to display healthbar (maxHealth !== health)
        this.health = 20;

        this.attackRange = 80;
        this.speed = 4;
    }


    /**
     * Rusher's custom idle behavior goes here (right now his custom idle behavior
     * is that he just stands there doing nothing). Super is then called for everything
     * else.
     * @param {Number} distanceToPlayer - Length of line drawn between Player and Rusher
     */
    move(distanceToPlayer) {
        if (!this.aggroed) this.status = "idle";
        super.move(distanceToPlayer);
    }
    

    /**
     * Method that handles the actual Rusher attack.
     */
    swing() {
        // Calculating distance between player and enemy        
        let distanceToPlayer = Math.sqrt((this.game.player.position[0] - this.position[0]) ** 2 +
            (this.game.player.position[1] - this.position[1]) ** 2);
        if (distanceToPlayer <= 55 && !this.game.player.rolling) this.game.player.takeDamage(40);
    }
}


module.exports = Rusher;
