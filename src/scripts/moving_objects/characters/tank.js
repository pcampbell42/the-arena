const Enemy = require("./enemy");


class Tank extends Enemy {
    constructor(params) {
        super(params);

        this.images = "./dist/assets/tank";
        this.idleFrames = 4; // How many frames this Character has in the idle animation
        this.runningFrames = 6; // How many frames this Character has in the running animation

        this.maxHealth = 300;
        this.health = 300;

        this.attackRange = 120; // Slightly larger than Rusher
        this.speed = 2;
    }


    move() {

    }
}


module.exports = Tank;
