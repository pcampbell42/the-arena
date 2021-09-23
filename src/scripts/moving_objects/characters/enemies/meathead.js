const Enemy = require("./enemy");


class Meathead extends Enemy {
    constructor(params) {
        super(params);

        this.images = "./dist/assets/meathead";
        this.idleFrames = 4; // How many frames this Character has in the idle animation
        this.runningFrames = 6; // How many frames this Character has in the running animation
        this.animationPace = 1.5; // Custom animation pace for Meathead (default is 1)

        this.maxHealth = 80;
        this.health = 80;

        this.attackRange = 45;
        this.damage = 50;
        this.speed = 0.5;
    }


    /**
     * Meathead's custom idle behavior goes here (right now his custom idle behavior
     * is that he just stands there doing nothing). Super is then called for everything
     * else.
     * @param {Number} distanceToPlayer - Length of line drawn between Player and Meathead
     */
    move(distanceToPlayer) {
        if (!this.aggroed) {
            this.status = "idle";
            this.velocity = [0, 0];
        }
        super.move(distanceToPlayer);
    }


    /**
     * This method is called in Enemy draw() when the Enemy is in its attacking
     * animation. In order to line up the actual attacks with the animation, we call
     * the actual attacks inside draw(). When to call the attacks and when to end the
     * animation is slightly different for each class, so each class gets there own
     * attackAnimationHelper.
     * @param {Number} stepXCoord - The x-coordinate of what to do draw in the attack
     * animation sheet. Basically, we need this to tell when the attack animation is over.
     */
    attackAnimationHelper(stepXCoord) {
        if (!this.game.slowed && Math.floor(this.step) === 45) this.swing();
        if (this.game.slowed && Math.floor(this.step) === 88) this.swing();
        if (stepXCoord >= 288) {
            this.attacking = false;
            this.busy = false;
            this.animationPace = 1.5; // Reset animationPace
        }

        // Basically, when facing left, we step through the animation backwards.
        // This has looked fine (haven't even noticed) up until now, but it looks
        // goofy for the Meathead attack. Thus, here, we adjust stepXCoord to step
        // through the animation sheet backwards and therefore, step through
        // the animation the intended way.
        this.direction === "left" ?
            stepXCoord = 300 - stepXCoord :
            stepXCoord += 5;
        return stepXCoord;
    }
}


module.exports = Meathead;
