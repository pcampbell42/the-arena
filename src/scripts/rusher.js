const Enemy = require("./enemy.js")

class Rusher extends Enemy {
    constructor(params) {
        super(params);

        this.images = "./dist/assets/rusher";
        this.idleFrames = 6;
        this.runningFrames = 6;

        this.maxHealth = 20;
        this.health = 20;

        this.attackRange = 80;
        this.speed = 3;
    }

    move(distanceToPlayer) {
        if (distanceToPlayer > 300) this.status = "idle";
        super.move(distanceToPlayer);
    }
    
    swing() {
        // Calculating distance between player and enemy        
        let distanceToPlayer = Math.sqrt((this.game.player.position[0] - this.position[0]) ** 2 +
            (this.game.player.position[1] - this.position[1]) ** 2);
        if (distanceToPlayer <= 55 && !this.game.player.rolling) this.game.player.takeDamage(40);
    }
}

module.exports = Rusher;