const Character = require("./character.js");

class Enemy extends Character {
    constructor(params) {
        super(params);
        this.chillCounter = 100; // Adding randomness to AI behavior
        this.wanderLeft = 0;
        this.wanderRight = 0;
        this.firingRate = 300; // Way to set difficulty, lower the harder

        this.knockedBack = false;
        this.knockedBackCounter = 0;
        this.stunned = false;
        this.stunnedCounter = 0;
    }


    action() {
        if (this.busy) return;

        if (this.stunnedCounter >= 55) {
            this.stunnedCounter = 0;
            this.stunned = false;
        }

        if (this.stunned) {
            this.stunnedCounter += 1;
            return;
        }

        if (this.knockedBack) {
            this.move();

        } else {
            // Calculating distance between player and enemy        
            let distanceToPlayer = Math.sqrt((this.game.player.position[0] - this.position[0]) ** 2 +
                (this.game.player.position[1] - this.position[1]) ** 2);
    
            let randNum = Math.floor(Math.random() * this.firingRate);
            if (randNum <= 5 && distanceToPlayer < this.attackRange) { // 1 in firingRate chance to fire at player
                this.startAttack(this.game.player.position);
            } else { // Else moves towards player - enemies can't move and shoot at same time - 1 or the other
                this.move(distanceToPlayer);
            }
        }
    }


    move(distanceToPlayer) {
        // Basically, every time this move() is called, knockBackCounter gets incremented, once it's 15,
        // the knockback is over
        if (this.knockedBack && this.knockedBackCounter >= 15) {
            this.knockedBack = false;
        }

        if (this.knockedBack) {
            this.game.slowed ? this.knockedBackCounter += 0.25 : this.knockedBackCounter += 1;
            super.move();

        } else {
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
            super.move();
        }
    }


    draw(ctx) {
        // For some bizarro reason, I have to do this here instead of in startKnockback, which would make way more sense
        // Basically, if an enemy is knockedBack, attacking is canceled and they're no longer busy
        if (this.knockedBack || this.stunned) {
            this.attacking = false;
            this.busy = false;
        }

        // Display health bar
        if (this.health !== this.maxHealth) {
            ctx.fillStyle = "white";
            ctx.fillRect(this.position[0] + 15, this.position[1], this.maxHealth, 10);

            ctx.fillStyle = "#32CD32";
            ctx.fillRect(this.position[0] + 15, this.position[1], this.maxHealth * (this.health / this.maxHealth), 10)
        }

        // Display stun gif
        if (this.stunned) {
            let stunnedImage = new Image();
            stunnedImage.src = "./dist/assets/stunned.png";
            ctx.filter = "invert(1)";
            ctx.drawImage(stunnedImage, this.position[0] + 15, this.position[1] - 30, 30, 30);
            ctx.filter = "invert(0)";
        }

        // Animate if attacking
        if (this.attacking) {
            let stepXCoord = this._selectFrame(18 / this.animationPace);
            if (this.direction === "right") {
                this.drawing.src = `${this.images}/attack_r.png`;
            } else {
                this.drawing.src = `${this.images}/attack_l.png`;
            }
            if (!this.game.slowed && this.step % 9 === 0) this.constructor.name === "Shooter" ? this.launchProjectile() : this.swing();
            if (this.game.slowed && this.step % 36 === 0) this.constructor.name === "Shooter" ? this.launchProjectile() : this.swing();
            if (stepXCoord >= 144) {
                this.attacking = false;
                this.busy = false;
            }
            ctx.drawImage(this.drawing, stepXCoord, 0, 40, 80, this.position[0], this.position[1], 75, 90);
        }

        // Animate if knocked back
        else if (this.knockedBack) {
            if (this.direction === "right") {
                this.drawing.src = `${this.images}/hurt_r.png`;
                ctx.drawImage(this.drawing, (this.knockedBackCounter < 5 ? 42 : 0), 0, 40, 80, this.position[0], this.position[1], 75, 90);

            } else {
                this.drawing.src = `${this.images}/hurt_l.png`;
                ctx.drawImage(this.drawing, (this.knockedBackCounter > 5 ? 15 : 0), 0, 40, 80, this.position[0], this.position[1], 75, 90);
            }
        }

        // Animate if stunned
        else if (this.stunned) {
            let stepXCoord = this._selectFrame(18 / this.animationPace);
            if (this.direction === "right") {
                this.drawing.src = `${this.images}/idle_r.png`;
            } else {
                this.drawing.src = `${this.images}/idle_l.png`;
            }
            ctx.drawImage(this.drawing, stepXCoord, 0, 40, 80, this.position[0], this.position[1], 75, 90);
        }

        // Animate if idle / moving
        else if (!this.attacking) super.draw(ctx);
    }


    startKnockback(knockedDirection) {
        this.knockedBack = true;
        this.knockedBackCounter = 0;
        
        switch (knockedDirection) {
            case "up":
                this.velocity[0] = 0;
                this.velocity[1] = -8;
                break;

            case "down":
                this.velocity[0] = 0;
                this.velocity[1] = 8;
                break;

            case "right":
                this.velocity[0] = 8;
                this.velocity[1] = 0;
                break;

            case "left":
                this.velocity[0] = -8;
                this.velocity[1] = 0;
                break;
        
            default:
                break;
        }

        if (this.game.slowed) {
            this.velocity[0] === 0 ? this.velocity[1] /= 4 : this.velocity[0] /= 4;
        }
    }


    takeDamage(damage) {
        super.takeDamage(damage);
    }


    dead() {
        this.remove();
    }
}

module.exports = Enemy;