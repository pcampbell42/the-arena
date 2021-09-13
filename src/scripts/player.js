const Character = require("./character.js");

class Player extends Character {
    constructor(params) {
        super(params);
        
        this.images = "./dist/assets/cyborg";
        this.idleFrames = 4;
        this.runningFrames = 6;
        this.animationPace = 2;

        this.health = 100;
        this.energy = 100;
        this.isDead = false;
        this.kicking = false;
    }

    action() {
        this.move();
    }

    move() {
        // --------- Resets velocity immediately (momentum isn't a thing) ---------
        // If kicking, velocity is 0
        if (!this.rolling || this.kicking) {
            this.velocity[0] = 0;
            this.velocity[1] = 0;
        }

        // --------- Setting velocity based on key input ---------
        // If kicking, can't add velocity
        if (!this.rolling && !this.kicking) {
            if (key.isPressed("w")) this.velocity[1] -= (2.5 * this.animationPace);
            if (key.isPressed("s")) this.velocity[1] += (2.5 * this.animationPace);
            if (key.isPressed("a")) {
                this.velocity[0] -= (2.5 * this.animationPace);
                this.direction = "left";
            }
            if (key.isPressed("d")) {
                this.velocity[0] += (2.5 * this.animationPace);
                this.direction = "right"
            }
        }
        // // --------- Call bulk of move function ---------
        super.move();
    }

    draw(ctx) {
        if (this.attacking) {
            let stepXCoord = this._selectFrame(2 / this.animationPace);
            if (this.direction === "right") {
                this.drawing.src = `${this.images}/attack_r.png`;
            } else {
                this.drawing.src = `${this.images}/attack_l.png`;
            }
            if (stepXCoord >= 240) {
                this.attacking = false;
                this.busy = false;
                this.launchProjectile();
            }
            ctx.drawImage(this.drawing, stepXCoord, 0, 40, 80, this.position[0], this.position[1], 75, 90);

        } else if (this.rolling) {
            let stepXCoord = this._selectFrame(9 / this.animationPace);
            if (this.direction === "right") {
                this.drawing.src = `${this.images}/roll_r.png`;
            } else {
                this.drawing.src = `${this.images}/roll_l.png`;
            }
            if (stepXCoord >= 240) {
                this.rolling = false;
                this.busy = false;
            }
            ctx.drawImage(this.drawing, stepXCoord - 5, 0, 35, 80, this.position[0], this.position[1] + 10, 75, 90);

        } else if (this.kicking) {
            let stepXCoord = this._selectFrame(9 / this.animationPace);
            if (this.direction === "right") {
                this.drawing.src = `${this.images}/kick_r.png`;
            } else {
                this.drawing.src = `${this.images}/kick_l.png`;
            }
            if (stepXCoord >= 240) {
                this.kicking = false;
                this.busy = false;
                this.kick();
            }
            ctx.drawImage(this.drawing, stepXCoord, 7, 35, 80, this.position[0], this.position[1] + 10, 75, 90);

        } else {
            super.draw(ctx);
        }
    }

    launchProjectile() {
        if (this.energy > 0) {
            this.energy -= 1;
            super.launchProjectile();
        }
    }

    startKick() {
        this.kicking = true;
        this.busy = true;
        this.step = 5;
        this.target = [];
    }

    kick() {
        for (let i = 0; i < this.game.enemies.length; i++) {
            let distanceToEnemy = Math.sqrt((this.game.enemies[i].position[0] - this.position[0]) ** 2 +
                (this.game.enemies[i].position[1] - this.position[1]) ** 2);
            let enemyDirection = this.game.enemies[i].position[0] - this.position[0];

            if (distanceToEnemy <= 55 && ((this.direction === "right" && enemyDirection >= -18) || 
                                           this.direction === "left" && enemyDirection <= 18)) {

                // Figuring out what direction to knock enemy in
                let knockedDirection;
                let knockedEnemy = this.game.enemies[i];
                if (knockedEnemy.position[1] - this.position[1] > 30) {
                    knockedDirection = "down";
                } else if (knockedEnemy.position[1] - this.position[1] < -30) {
                    knockedDirection = "up";
                } else if (this.direction === "right" && enemyDirection >= 0) {
                    knockedDirection = "right";
                } else {
                    knockedDirection = "left";
                }

                // Knocking enemy
                this.game.enemies[i].startKnockback(knockedDirection);
                this.game.enemies[i].takeDamage(10);
                return;
            }
        }
    }

    dead() {
        this.isDead = true;
    }
}

module.exports = Player;