const Enemy = require("./enemy.js")


class Shooter extends Enemy {
    constructor(params) {
        super(params);

        this.images = "./dist/assets/shooter";
        this.idleFrames = 4; // # of frames in idle animation
        this.runningFrames = 6; // # of frames in running animation

        this.maxHealth = 30; // Used to figure out when to display healthbar (maxHealth !== health)
        this.health = 30;

        this.attackRange = 300;
        this.speed = 1;
    }


    /**
     * Shooter needs its own move() method because it has custom idle behavior. Therefore,
     * this method has the logic for idle behavior, and then calls super() to do normal
     * enemy things (like running at the player and attacking).
     * @param {Number} distanceToPlayer - Length of a line drawn between Player and Shooter
     * @returns - Null
     */
    move(distanceToPlayer) {
        let randNum = Math.floor(Math.random() * 200); // Random # to decide idle behavior

        // Idle behavior
        if (!this.aggroed) {
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


    /**
     * Shooter needs its own takeDamage method because when the Shooter takes damage,
     * it automatically shoots at the player. Calls super to actaully take the damage.
     * @param {Number} damage - Amount of damage to take
     */
    takeDamage(damage) {
        if (!this.busy) {
            this.startAttack(this.game.player.position); // Enemy shoots in players direction if hit
        }
        super.takeDamage(damage);
    }
}


module.exports = Shooter;
