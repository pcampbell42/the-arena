const MovingObject = require("./moving_object");
const Projectile = require("./projectile.js");
// const Game = require("./game.js");

class Character extends MovingObject {
    constructor(params) {
        super(params);
        this.status = "idle"
        this.attacking = false;
        this.direction = "right";
        this.step = 0;
    }

    move(dt) {
        // --------- Moves character if future position is valid ---------
        let validMove = this.validMove();
        if (validMove) super.move(dt);

        // --------- Sets status (used in animation) of character based on velocity ---------
        // if (!this.attacking) {
        // }
        if (this.velocity[0] === 0 && this.velocity[1] === 0) this.status = "idle";
        if (this.velocity[0] !== 0 || this.velocity[1] !== 0) this.status = "moving";

        // --------- Resets velocity immediately (momentum isn't a thing) ---------
        this.velocity[0] = 0;
        this.velocity[1] = 0;
    }

    draw(ctx) {
        // --------- Figuring out which part of animation to do next ---------
        let stepXCoord = this._selectFrame();

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

    _selectFrame() {
        // --------- If past last step of animation, reset to first step ---------
        if (this.status === "idle" && this.step > 44) this.step = 0;
        if (this.status === "moving" && this.step > 90) this.step = 0;

        // --------- Using step to find correct part of animation ---------
        let selection;
        if (this.step < 18) { // Values are large to slow animation down
            selection = 48;
        } else if (this.step < 36) {
            selection = 96;
        } else if (this.step < 54) {
            selection = 144;
        } else if (this.step < 72) {
            selection = 192;
        } else if (this.step < 90) {
            selection = 240;
        } else {
            selection = 288;
        }
        
        // --------- Correcting x values for left facing animations, incrementing step ---------
        if (this.direction === "left") selection += 10;
        this.step += 1;

        return selection;
    }

    shoot(target) {
        // FIX THIS TRASH SO ALL MOVE SAME SPEED AND FIRE FROM MORE LOGICAL SPOT
        // let angle = Math.atan((target[1] - this.position[1] + 30), (target[0] - this.position[0] + 25));
        // this.attacking = true;
        this.step = 0;
        // this.status = "idle";

        let a = 800 / ((target[0] - (this.position[0] + 30)) ** 2 + (target[1] - (this.position[1] + 25)) ** 2)
        const p = new Projectile({
            position: [this.position[0] + 30, this.position[1] + 25],
            velocity: [a * (target[0] - (this.position[0] + 30)), a * (target[1] - (this.position[1] + 25))],
            game: this.game
        });
        this.game.projectiles.push(p);
    }

    validMove() {
        // --------- Checking if moving into an enemy ---------
        for (let i = 0; i < this.game.enemies.length; i++) {
            if (this !== this.game.enemies[i]) {
                if (this.willCollideWith(this.game.enemies[i])) return false;
            }
        }
        // --------- Checking if moving into a wall ---------
        const futureXCoord = this.position[0] + this.velocity[0];
        const futureYCoord = this.position[1] + this.velocity[1];
        if (futureXCoord < 0 || futureYCoord < 0 || futureXCoord > 850 || futureYCoord > 530) return false;

        // --------- Checking if moving into player ---------
        if (this !== this.game.player && this.willCollideWith(this.game.player)) return false;

        return true;
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) this.dead(); 
    }
}

module.exports = Character;