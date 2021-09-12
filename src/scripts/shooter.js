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

    takeDamage(damage) {
        if (!this.busy) this.startAttack(this.game.player.position); // Enemy shoots in players direction if hit
        super.takeDamage(damage);
    }
}

module.exports = Shooter;