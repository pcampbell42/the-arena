const Enemy = require("../enemy");


class Shield extends Enemy {
    constructor(params) {
        super(params);

        this.images = "./dist/assets/shield";
        this.idleFrames = 4; // How many frames this Character has in the idle animation
        this.runningFrames = 6; // How many frames this Character has in the running animation

        this.maxHealth = 150;
        this.health = 150;

        this.attackRange = 120; // Slightly larger than Rusher
        this.damage = 25;
        this.speed = 2;
    }


    move() {

    }
}


module.exports = Shield;
