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

    move(dt, distanceToPlayer) {
        if (distanceToPlayer > 300) this.status = "idle";
        super.move(dt, distanceToPlayer);
    }

    draw(ctx) {
        if (this.attacking) {
            let stepXCoord = this._selectFrame(18 / this.animationPace);
            if (this.direction === "right") {
                this.drawing.src = `${this.images}/attack_r.png`;
            } else {
                this.drawing.src = `${this.images}/attack_l.png`;
            }
            if (!this.game.slowed && this.step % 9 === 0) this.swing();
            if (this.game.slowed && this.step % 36 === 0) this.swing();
            if (stepXCoord >= 144) {
                this.attacking = false;
                this.busy = false;
            }
            ctx.drawImage(this.drawing, stepXCoord, 0, 40, 80, this.position[0], this.position[1], 75, 90);
        }
        super.draw(ctx);
    }

    swing() {
        // Calculating distance between player and enemy        
        let distanceToPlayer = Math.sqrt((this.game.player.position[0] - this.position[0]) ** 2 +
            (this.game.player.position[1] - this.position[1]) ** 2);
        if (distanceToPlayer <= 55 && !this.game.player.rolling) this.game.player.takeDamage(40);
    }
}

module.exports = Rusher;