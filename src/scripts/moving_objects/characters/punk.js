const Enemy = require("./enemy");


class Punk extends Enemy {
    constructor(params) {
        super(params);

        this.images = "./dist/assets/punk";
        this.idleFrames = 4; // How many frames this Character has in the idle animation
        this.runningFrames = 6; // How many frames this Character has in the running animation
        this.animationPace = 2; // Personalized animation pace... changes when time is slowed

        this.maxHealth = 100;
        this.health = 100;

        this.attackRange = 1000; // Entire canvas...
        this.speed = 5;
    }

    
    move() {

    }


    kick() {

    }
}


module.exports = Punk;
