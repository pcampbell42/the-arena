const Enemy = require("./enemy")


class Rusher extends Enemy {
    constructor(params) {
        super(params);

        this.images = "./dist/assets/rusher";
        this.idleFrames = 6; // # of frames in idle animation
        this.runningFrames = 6; // # of frames in running animation

        this.maxHealth = 20; // Used to figure out when to display healthbar (maxHealth !== health)
        this.health = 20;

        this.attackRange = 80;
        this.damage = 20;
        this.speed = 3.5;
    }


    /**
     * Rusher's custom idle behavior goes here (right now his custom idle behavior
     * is that he just stands there doing nothing). Super is then called for everything
     * else.
     * @param {Number} distanceToPlayer - Length of line drawn between Player and Rusher
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
     * 
     * @param {Number} stepXCoord - The x-coordinate of what to do draw in the attack
     * animation sheet. Basically, we need this to tell when the attack animation is over.
     * @returns - stepXCoord (Number). For most classes, this will be the same as the input.
     * For some, it will translate it to step through the sprite sheet backwards.
     */
    attackAnimationHelper(stepXCoord) {
        if (!this.game.slowed && Math.floor(this.step) === 35) this.swing();
        if (this.game.slowed && Math.floor(this.step) === 135) this.swing();
        if (stepXCoord >= 144) {
            this.attacking = false;
            this.busy = false;
        }
        return stepXCoord;
    }
}


module.exports = Rusher;
