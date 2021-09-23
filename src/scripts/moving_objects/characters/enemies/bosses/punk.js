const Enemy = require("../enemy");


class Punk extends Enemy {
    constructor(params) {
        super(params);

        this.images = "./dist/assets/punk";
        this.idleFrames = 4; // How many frames this Character has in the idle animation
        this.runningFrames = 6; // How many frames this Character has in the running animation
        this.animationPace = 2; // Personalized animation pace... changes when time is slowed

        this.maxHealth = 150;
        this.health = 150;

        this.attackRange = 1000; // Entire canvas...
        this.damage = 20;
        this.speed = 4;

        this.initialAggro = false; // For bosses, once aggroed, they cannot be unaggroed
    }


    /**
     * The only Enemy with its own action(). This is because Punk has a few unique
     * behaviors amongst Enemies - attacking while moving, kicking, and rolling. 
     * All three of these cases are addressed in this method.
     * @returns - null
     */
    action() {
        if (this.kicking) return; // If kicking, do nothing extra

        // If attacking or rolling, skip the rest of action (super.action() in Enemy)
        // and go straight to move(). This is the only Enemy that can roll as well as
        // the only Enemy that can attack while moving, hence the need for this.
        if (this.attacking || this.rolling) {
            let distanceToPlayer = Math.sqrt((this.game.player.position[0] - this.position[0]) ** 2 +
                (this.game.player.position[1] - this.position[1]) ** 2);
            this.move(distanceToPlayer);
        } else super.action(); // If not kicking, attacking, or rolling, do normal Enemy action()
    }


    /**
     * Helper method that gets called in Enemy's action(). Punk uses most of the generalized
     * action() method in the Enemy class, except for the last part. Therefore, the last part
     * is skipped and this method is called in its stead. Determines whether the Punk will
     * kick, attack and move, or just move.
     * 
     * @param {Number} distanceToPlayer - Length of a line drawn from the Punk to the Player
     * @param {Boolean} facingPlayer - Boolean, determines whether Punk is facing the Player
     * @param {Number} randNum - Random number, calculated in Enemy action()
     */
    actionHelper(distanceToPlayer, facingPlayer, randNum) {
        // If close enough and player not already stunned / knocked back, kick the player
        if (distanceToPlayer < 55 && this.aggroed && facingPlayer && this.playerInLOS() && 
            !this.game.player.knockedBack && !this.game.player.stunned) {
            this.startKick();
        }
        // Small chance to randomly roll (if not already busy)
        else if (randNum > 40 && randNum < 44 && !this.busy && this.aggroed) {
            this.rolling = true; // Now rolling
            this.busy = true; // Busy until roll is over
            this.step = 0; // Animation starts at beginning
        }
        // Else, chance to launch ranged attack while moving
        else if (randNum <= 40 && this.aggroed && facingPlayer && this.playerInLOS()) {
            this.startAttack(this.game.player.position);
            this.move(distanceToPlayer);
        }
        // Else, just move
        else {
            this.move(distanceToPlayer);
        }
    }


    /**
    * Punk's custom idle behavior goes here (right now his custom idle behavior
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
     * The only Enemy with its own custom draw() method. It still uses Enemy's
     * draw() method, but here, we do a few extra things. First, we also cancel 
     * kicking if knocked back (this is the only Enemy that can kick). Second,
     * we animate kicking and rolling (also the only Enemy that can do these).
     * @param {CanvasRenderingContext2D} ctx - 2D canvas context to draw board
     */
    draw(ctx) {
        // Need this at the beginning of the top level draw method
        if (this.knockedBack || this.stunned) {
            this.attacking = false;
            this.kicking = false;
            this.busy = false;
        }

        // Animate roll
        if (this.rolling) {
            // The x-coordinate inside the animation sheet. As animation goes on,
            // move across the animation sheet.
            let stepXCoord = this._selectFrame(9 / this.animationPace);

            if (this.direction === "right") {
                this.drawing.src = `${this.images}/roll_r.png`;
            } else {
                this.drawing.src = `${this.images}/roll_l.png`;
                stepXCoord = 270 - stepXCoord;
            }
            // End of the animation, end the roll
            if (stepXCoord >= 240 && this.direction === "right") {
                this.rolling = false;
                this.busy = false;
            } else if (stepXCoord <= 0 && this.direction === "left") {
                this.rolling = false;
                this.busy = false;
            }
            ctx.drawImage(this.drawing, stepXCoord - 5, 0, 35, 80, this.position[0], this.position[1] + 10, 75, 90);

        }
        // Animate kick
        else if (this.kicking) {
            // The x-coordinate inside the animation sheet. As animation goes on,
            // move across the animation sheet.
            let stepXCoord = this._selectFrame(9 / this.animationPace);

            if (this.direction === "right") {
                this.drawing.src = `${this.images}/kick_r.png`;
            } else {
                this.drawing.src = `${this.images}/kick_l.png`;
            }
            // End of the animation, fire the kick, end the kick
            if (stepXCoord >= 240) {
                this.kicking = false;
                this.busy = false;
                // this.kick();
            }
            ctx.drawImage(this.drawing, stepXCoord, 7, 35, 80, this.position[0], this.position[1] + 10, 75, 90);

        }
        super.draw(ctx); // Have to call this unconditionally to draw boss health bar
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
        if (stepXCoord >= 108) {
            this.attacking = false;
            this.busy = false;
            this.launchProjectile();
        }
        return stepXCoord;
    }


    kick() {

    }
}


module.exports = Punk;
