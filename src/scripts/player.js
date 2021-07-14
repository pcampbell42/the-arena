const Character = require("./character.js");

class Player extends Character {
    constructor(params) {
        super(params);
        this.images = "./dist/assets/cyborg";
        this.health = 100;
        this.energy = 100;
        this.animationPace = 2;
    }

    action(dt) {
        if (false) {

        } else {
            this.move(dt);
        }
    }

    move(dt) {
        // --------- Resets velocity immediately (momentum isn't a thing) ---------
        if (!this.rolling) {
            this.velocity[0] = 0;
            this.velocity[1] = 0;
        }

        // --------- Setting velocity based on key input ---------
        if (!this.rolling) {
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
        super.move(dt);
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
            let stepXCoord = this._selectFrame(9/ this.animationPace);
            if (this.direction === "right") {
                this.drawing.src = `${this.images}/roll_r.png`;
            } else {
                this.drawing.src = `${this.images}/roll_l.png`;
            }
            if (stepXCoord >= 240) {
                this.rolling = false;
            }
            ctx.drawImage(this.drawing, stepXCoord - 5, 0, 35, 80, this.position[0], this.position[1] + 10, 75, 90);

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

    dead() {
        window.alert("you died lol");
    }
}

module.exports = Player;