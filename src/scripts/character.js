const MovingObject = require("./moving_object");
const Projectile = require("./projectile.js");
// const Game = require("./game.js");

class Character extends MovingObject {
    constructor(params) {
        super(params);
        this.status = "idle"
        this.attacking = false;
        this.rolling = false;
        this.busy = false;
        this.direction = "right";
        this.step = 0;
        this.target = [];
    }

    move() {
        // --------- Moves character if future position is valid ---------
        let validMove = this.validMove();
        if (validMove) super.move();

        // --------- Sets status (used in animation) of character based on velocity ---------
        if (this.game.player === this) {
            if (this.velocity[0] === 0 && this.velocity[1] === 0) this.status = "idle";
            if (this.velocity[0] !== 0 || this.velocity[1] !== 0) this.status = "moving";
        }
    }

    draw(ctx) {
        // --------- Figuring out which part of animation to do next ---------
        let stepXCoord = this._selectFrame(18 / this.animationPace);

        // --------- Figuring out which general animation to do ---------
        if (this.status === "moving") {
            if (this.direction === "right") {
                this.drawing.src = `${this.images}/run_r.png`;
            } else {
                this.drawing.src = `${this.images}/run_l.png`;
            }
        } else if (this.status === "idle") {
            if (this.direction === "right") {
                this.drawing.src = `${this.images}/idle_r.png`;
            } else {
                this.drawing.src = `${this.images}/idle_l.png`;
            }
        }
        // --------- Drawing image ---------
        ctx.drawImage(this.drawing, stepXCoord, 0, 40, 80, this.position[0], this.position[1], 75, 90);
    }

    _selectFrame(stepFactor) {
        // --------- If past last step of animation, reset to first step ---------
        if (this.status === "idle" && !this.busy && this.step >= this.idleFrames * stepFactor) this.step = 0;
        if (this.status === "moving" && !this.busy && this.step >= this.runningFrames * stepFactor) this.step = 0;

        // --------- Using step to find correct part of animation ---------
        let selection;
        if (this.step < 1 * stepFactor) { // Values are large to slow animation down
            selection = 0;
        } else if (this.step < 2 * stepFactor) {
            selection = 48;
        } else if (this.step < 3 * stepFactor) {
            selection = 96;
        } else if (this.step < 4 * stepFactor) {
            selection = 144;
        } else if (this.step < 5 * stepFactor) {
            selection = 196;
        } else {
            selection = 240;
        }

        // --------- Correcting x values for left facing animations, incrementing step ---------
        if (this.direction === "left") selection += 10;
        this.step += 1;

        return selection;
    }

    validMove() {
        // --------- Checking if moving into an enemy ---------
        for (let i = 0; i < this.game.enemies.length; i++) {
            if (!this.rolling && this !== this.game.enemies[i]) {
                if (this.willCollideWith(this.game.enemies[i])) {
                    if (this.knockedBack) {
                        this.takeDamage(5);
                        this.knockedBack = false;
                        this.stunned = true;
                        this.stunnedCounter = 0;

                        if (this.game.enemies[i]) {
                            this.game.enemies[i].takeDamage(5);
                            this.game.enemies[i].stunned = true;
                            this.game.enemies[i].stunnedCounter = 0;
                        }
                    }
                    return false;
                }
            }
        }
        // --------- Checking if moving into a wall ---------
        const futureXCoord = this.position[0] + this.velocity[0];
        const futureYCoord = this.position[1] + this.velocity[1];
        if (this.game.floor.doorOpened && futureXCoord >= (this.game.floor.doorPosition - 35) && futureXCoord <= (this.game.floor.doorPosition + 10) && 
            futureYCoord <= 30) return true;
        if (futureXCoord < 15 || futureYCoord < 15 || futureXCoord > this.game.canvasSizeX - 85 || 
            futureYCoord > this.game.canvasSizeY - 93) {
                if (this.knockedBack) {
                    this.takeDamage(5);
                    this.knockedBack = false;
                    this.stunned = true;
                    this.stunnedCounter = 0;
                }
                return false;
            }

        // --------- Checking if moving into player ---------
        if (this !== this.game.player && this.willCollideWith(this.game.player)) return false;

        return true;
    }

    startAttack(target) {
        this.attacking = true;
        this.busy = true;
        this.step = 0;
        this.target = target;
    }

    launchProjectile() {
        let z = Math.sqrt((this.target[0] - (this.position[0] + 30)) ** 2 + (this.target[1] - (this.position[1] + 25)) ** 2);

        let speed;
        (this.game.player === this) ? speed = 10 : speed = 7;
        const p = new Projectile({
            position: [this.position[0] + 30, this.position[1] + 25],
            velocity: [(this.target[0] - (this.position[0] + 30)) / z * speed, (this.target[1] - (this.position[1] + 25)) / z * speed],
            damage: 10,
            shooter: this,
            game: this.game
        });
        
        if (this.game.slowed) {
            p.velocity[0] /= 4;
            p.velocity[1] /= 4;
        }
        this.game.projectiles.push(p);
    }

    roll() {
        if (this.velocity[0] === 0 && this.velocity[1] === 0) return;
        this.rolling = true;
        this.step = 0;
    }

    takeDamage(damage) {
        if (this.game.journalistDifficulty && this.game.player === this) {
            this.health -= 1;
        } else {
            this.health -= damage;
        }
        if (this.health <= 0) this.dead(); 
    }
}

module.exports = Character;