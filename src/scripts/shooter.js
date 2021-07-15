const Enemy = require("./enemy.js")

class Shooter extends Enemy {
    constructor(params) {
        super(params);
        this.images = "./dist/assets/shooter";
        this.health = 30;
        this.speed = 1;
    }
}

module.exports = Shooter;