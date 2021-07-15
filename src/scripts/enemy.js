const Character = require("./character.js");

class Enemy extends Character {
    constructor(params) {
        super(params);
        this.chillCounter = 100; // Adding randomness to AI behavior
        // this.sprintCounter = 50; // Adding more randomness to AI behavior
        this.wanderLeft = 0;
        this.wanderRight = 0;
        this.firingRate = 300; // Way to set difficulty, lower the harder
    }

    action(dt) {
        if (this.busy) return;

        // Calculating distance between player and enemy        
        let distanceToPlayer = Math.sqrt((this.game.player.position[0] - this.position[0]) ** 2 +
            (this.game.player.position[1] - this.position[1]) ** 2);

        let randNum = Math.floor(Math.random() * this.firingRate);
        if (randNum <= 5 && distanceToPlayer < this.attackRange) { // 1 in firingRate chance to fire at player
            this.startAttack(this.game.player.position);
        } else { // Else moves towards player - enemies can't move and shoot at same time - 1 or the other
            this.move(dt, distanceToPlayer);
        }
    }

    move(dt, distanceToPlayer) {
        // --------- If enemy is close to player, enemy will chase player down ---------
        if (distanceToPlayer < 300) {
            // --------- Getting the direction the player is in and setting velocity ---------
            let xDir = Math.sign(this.game.player.position[0] - this.position[0]);
            let yDir = Math.sign(this.game.player.position[1] - this.position[1]);
            this.velocity = [xDir * this.speed, yDir * this.speed];
            (Math.sign(this.velocity[0]) === -1) ? this.direction = "left" : this.direction = "right";
            this.status = "moving";
        }

        if (this.game.slowed) {
            this.velocity[0] /= 4;
            this.velocity[1] /= 4;
        }
        super.move(dt); // Bulk of move work happens here
    }

    draw(ctx) {
        // --------- If not full health, display health bar ---------
        if (this.health !== this.maxHealth) {
            ctx.fillStyle = "white";
            ctx.fillRect(this.position[0] + 15, this.position[1], this.maxHealth, 10);

            ctx.fillStyle = "#32CD32";
            ctx.fillRect(this.position[0] + 15, this.position[1], this.maxHealth * (this.health / this.maxHealth), 10)
        }
        if (!this.attacking) super.draw(ctx);
    }

    takeDamage(damage) {
        super.takeDamage(damage);
    }

    dead() {
        this.remove();
    }
}

module.exports = Enemy;