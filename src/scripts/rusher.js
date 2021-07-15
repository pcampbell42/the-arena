const Enemy = require("./enemy.js")

class Rusher extends Enemy {
    constructor(params) {
        super(params);
        this.images = "./dist/assets/rusher";
        this.maxHealth = 20;
        this.health = 20;
        this.speed = 3;
    }
    startAttack() {
        console.log("attacking");
    }
}

module.exports = Rusher;