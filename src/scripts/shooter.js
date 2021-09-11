const Enemy = require("./enemy.js")

class Shooter extends Enemy {
    constructor(params) {
        super(params);

        this.images = "./dist/assets/shooter";
        this.idleFrames = 4;
        this.runningFrames = 6;

        this.maxHealth = 30;
        this.health = 30;

        this.attackRange = 300;
        this.speed = 1;
    }

    move(distanceToPlayer) {
        let randNum = Math.floor(Math.random() * 200); // For later use

        if (distanceToPlayer > 300) {
            // --------- AI decides to chill for a bit ---------
            if (randNum <= 10) this.status = "idle";

            // --------- AI is chilling, standing around ---------
            if (this.status === "idle") {
                this.chillCounter -= 1;
                if (this.chillCounter === 0) {
                    this.status = "moving";
                    this.chillCounter = 300;
                }
                return; // Break out
            }

            // --------- AI moves randomly ---------
            let possibleDirs = [1, -1];

            if (this.wanderLeft > 0) {
                this.velocity = [-1 * Math.random(), possibleDirs[Math.floor(Math.random() * 2)] * Math.random()];
                this.wanderLeft--;
            } else if (this.wanderRight > 0) {
                this.velocity = [Math.random(), possibleDirs[Math.floor(Math.random() * 2)] * Math.random()];
                this.wanderRight--;
            } else {
                this.velocity = [possibleDirs[Math.floor(Math.random() * 2)] * Math.random(),
                possibleDirs[Math.floor(Math.random() * 2)] * Math.random()];
                (Math.sign(this.velocity[0]) === -1) ? this.wanderLeft = 50 : this.wanderRight = 50;
                (Math.sign(this.velocity[0]) === -1) ? this.direction = "left" : this.direction = "right";
            }
        }
        super.move(distanceToPlayer);
    }

    draw(ctx) {
        // For some bizarro reason, I have to do this here instead of in startKnockback, which would make way more sense
        // Basically, if an enemy is knockedBack, attacking is canceled and they are no longer busy
        if (this.knockedBack) {
            this.attacking = false;
            this.busy = false;
        }
        
        if (this.attacking) {
            let stepXCoord = this._selectFrame(18 / this.animationPace);
            if (this.direction === "right") {
                this.drawing.src = `${this.images}/attack_r.png`;
            } else {
                this.drawing.src = `${this.images}/attack_l.png`;
            }
            if (!this.game.slowed && this.step % 9 === 0) this.launchProjectile();
            if (this.game.slowed && this.step % 36 === 0) this.launchProjectile();
            if (stepXCoord >= 144) {
                this.attacking = false;
                this.busy = false;
            }
            ctx.drawImage(this.drawing, stepXCoord, 0, 40, 80, this.position[0], this.position[1], 75, 90);
        }
        super.draw(ctx);
    }

    takeDamage(damage) {
        if (!this.busy) this.startAttack(this.game.player.position); // Enemy shoots in players direction if hit
        super.takeDamage(damage);
    }
}

module.exports = Shooter;