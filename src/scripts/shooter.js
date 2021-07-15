const Enemy = require("./enemy.js")

class Shooter extends Enemy {
    constructor(params) {
        super(params);
        this.images = "./dist/assets/shooter";
        this.maxHealth = 30;
        this.health = 30;
        this.speed = 1;
    }

    takeDamage(damage) {
        if (!this.busy) this.startAttack(this.game.player.position); // Enemy shoots in players direction if hit
        super.takeDamage(damage);
    }
}

module.exports = Shooter;