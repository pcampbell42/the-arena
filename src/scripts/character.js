const MovingObject = require("./moving_object");
const Projectile = require("./projectile.js");
const SpecialTile = require("./special_tile.js");


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


    /**
     * 
     */
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


    /**
     * 
     * @param {*} ctx 
     */
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


    /**
     * 
     * @param {*} stepFactor 
     * @returns 
     */
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


    /**
     * Important helper method that's used to check if a Character's move is going to be valid.
     * Checks if moving into the player, an enemy, a wall, or a pit.
     * @returns - A boolean (true for valid move, false for not)
     */
    validMove() {
        // --------- Checking if moving into player ---------
        if (this !== this.game.player && this.willCollideWith(this.game.player)) return false;

        // --------- Checking if moving into an enemy ---------
        for (let i = 0; i < this.game.enemies.length; i++) {
            if (!this.rolling && this !== this.game.enemies[i]) {
                if (this.willCollideWith(this.game.enemies[i])) {

                    // If a character was knocked into another character, the knockback is 
                    // halted, they both get stunned, and they both take small damage
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

        // --------- Checking if moving into a wall / pit ---------
        let futureXCoord = this.position[0] + this.velocity[0];
        let futureYCoord = this.position[1] + this.velocity[1];
        // Using future position to find what kind of Tile the character is moving into
        let nextTile = this.game.floor.floorTiles[Math.floor((futureYCoord + 5) / 40) + 1][Math.floor((futureXCoord - 5) / 40) + 1];
        
        if (nextTile instanceof SpecialTile || (nextTile.length === 2 && nextTile[0] instanceof Array)) {
            if (nextTile.type === "pit") {
                this.dead();
            } else if (nextTile.type === "wall" || nextTile[1].type === "wall") {

                // If a character is knocked into a wall, the knockback is halted,
                // the character is stunned, and the character takes small damage
                if (this.knockedBack) {
                    this.takeDamage(5);
                    this.knockedBack = false;
                    this.stunned = true;
                    this.stunnedCounter = 0;
                }
                return false;
            }
        }

        return true;
    }


    /**
     * 
     * @param {*} target 
     */
    startAttack(target) {
        this.attacking = true;
        this.busy = true;
        this.step = 0;
        this.target = target;
    }


    /**
     * 
     */
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


    /**
     * 
     * @returns 
     */
    roll() {
        if (this.velocity[0] === 0 && this.velocity[1] === 0) return;
        this.rolling = true;
        this.busy = true;
        this.step = 0;
    }


    /**
     * 
     * @param {*} damage 
     */
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
