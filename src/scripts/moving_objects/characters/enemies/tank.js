const Enemy = require("./enemy");


class Tank extends Enemy {
    constructor(params) {
        super(params);

        this.images = "./dist/assets/tank";
        this.idleFrames = 4; // How many frames this Character has in the idle animation
        this.runningFrames = 6; // How many frames this Character has in the running animation

        this.maxHealth = 80;
        this.health = 80;

        this.attackRange = 100; // Slightly larger than Rusher
        this.damage = 40;
        this.speed = 0.5;
    }


    /**
     * Tank's custom idle behavior goes here (right now his custom idle behavior
     * is that he just stands there doing nothing). Super is then called for everything
     * else.
     * @param {Number} distanceToPlayer - Length of line drawn between Player and Rusher
     */
    move(distanceToPlayer) {
        if (!this.aggroed) this.status = "idle";
        super.move(distanceToPlayer);
    }
}


module.exports = Tank;
