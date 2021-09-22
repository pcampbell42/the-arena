const Enemy = require("../enemy");


class Punk extends Enemy {
    constructor(params) {
        super(params);

        this.images = "./dist/assets/punk";
        this.idleFrames = 4; // How many frames this Character has in the idle animation
        this.runningFrames = 6; // How many frames this Character has in the running animation
        this.animationPace = 2; // Personalized animation pace... changes when time is slowed

        this.maxHealth = 100;
        this.health = 100;

        this.attackRange = 1000; // Entire canvas...
        this.speed = 4;
    }

    
    move() {

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
        if (!this.game.slowed && Math.floor(this.step) === 85) this.swing();
        if (this.game.slowed && Math.floor(this.step) === 325) this.swing();
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


    kick() {

    }
}


module.exports = Punk;
