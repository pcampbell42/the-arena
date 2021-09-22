const Enemy = require("./enemy")


class Shooter extends Enemy {
    constructor(params) {
        super(params);

        this.images = "./dist/assets/shooter";
        this.idleFrames = 4; // # of frames in idle animation
        this.runningFrames = 6; // # of frames in running animation

        this.maxHealth = 30; // Used to figure out when to display healthbar (maxHealth !== health)
        this.health = 30;

        this.attackRange = 700; // Basically can fire across entire map, kind of obsolete now
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
     * This method is called in Enemy draw() when the Enemy is in its attacking
     * animation. In order to line up the actual attacks with the animation, we call
     * the actual attacks inside draw(). When to call the attacks and when to end the
     * animation is slightly different for each class, so each class gets there own
     * attackAnimationHelper.
     * 
     * @param {Number} stepXCoord - The x-coordinate of what to do draw in the attack
     * animation sheet. Basically, we need this to tell when the attack animation is over.
     * @returns - stepXCoord (Number). For most classes, this will be the same as the input.
     * For some, it will translate it to step through the sprite sheet backwards.
     */
    attackAnimationHelper(stepXCoord) {
        if (!this.game.slowed && Math.floor(this.step % 9) === 0) this.launchProjectile();
        if (this.game.slowed && Math.floor(this.step % 36) === 0) this.launchProjectile();
        if (stepXCoord >= 144) {
            this.attacking = false;
            this.busy = false;
        }
        return stepXCoord; // Return same input, nothing needs to change
    }


    /**
     * Shooter needs its own takeDamage method because when the Shooter takes damage,
     * it automatically shoots at the player. Calls super to actaully take the damage.
     * @param {Number} damage - Amount of damage to take
     */
    takeDamage(damage) {
        // Enemy shoots in players direction if hit
        if (!this.busy && this.playerInLOS()) this.startAttack(this.game.player.position);
        super.takeDamage(damage);
    }
}


module.exports = Shooter;
