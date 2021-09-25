const Enemy = require("../enemy");


class Tank extends Enemy {
    constructor(params) {
        super(params);

        this.images = "./dist/assets/tank";
        this.idleFrames = 4; // How many frames this Character has in the idle animation
        this.runningFrames = 6; // How many frames this Character has in the running animation

        this.maxHealth = 125;
        this.health = 125;

        this.attackRange = 65;
        this.damage = 15;
        this.speed = 2;

        this.initialAggro = false; // For bosses, once aggroed, they cannot be unaggroed
    }


    /**
    * Tank's custom idle behavior goes here (right now his custom idle behavior
    * is that he just stands there doing nothing). Super is then called for everything
    * else.
    * @param {Number} distanceToPlayer - Length of line drawn between Player and Tank
    */
    move(distanceToPlayer) {
        // Starts off idle and unaggroed when player enters room
        if (!this.aggroed && !this.initialAggro) {
            this.status = "idle";
            this.velocity = [0, 0];
        } 
        // If aggroed and initialAggro hasn't been toggled, toggle it
        else if (this.aggroed && !this.initialAggro) {
            this.initialAggro = true;
        }
        // If unaggroed, but has been aggroed before, flip back to aggroed
        else if (!this.aggroed && this.initialAggro) {
            this.aggroed = true;
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
        if (!this.game.slowed && Math.floor(this.step) === 41) this.swing();
        if (this.game.slowed && Math.floor(this.step) === 75) this.swing();
        if (stepXCoord >= 216) {
            this.attacking = false;
            this.busy = false;
            this.animationPace = 1; // Reset animationPace
        }

        // Basically, when facing left, we step through the animation backwards.
        // This has looked fine (haven't even noticed) up until now, but it looks
        // goofy for the Tank attack. Thus, here, we adjust stepXCoord to step
        // through the animation sheet backwards and therefore, step through
        // the animation the intended way.
        this.direction === "left" ?
            stepXCoord = 208 - stepXCoord :
            stepXCoord -= 2;
        return stepXCoord;
    }
}


module.exports = Tank;
