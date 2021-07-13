const Character = require("./character.js");

class Player extends Character {
    constructor(params) {
        super(params);
        this.images = "./dist/assets/cyborg";
        this.health = 100;
    }

    move(dt) {
        // --------- Setting velocity based on key input ---------
        if (key.isPressed("w")) this.velocity[1] -= 5;
        if (key.isPressed("s")) this.velocity[1] += 5;
        if (key.isPressed("a")) {
            this.velocity[0] -= 5;
            this.direction = "left";
        }
        if (key.isPressed("d")) {
            this.velocity[0] += 5;
            this.direction = "right"
        }
        // // --------- Call bulk of move function ---------
        super.move(dt);
    }

    draw(ctx) {
        if (this.attacking) {
            let stepXCoord = this._selectFrame(1);
            if (this.direction === "right") {
                this.drawing.src = `${this.images}/attack_r.png`;
            } else {
                this.drawing.src = `${this.images}/attack_l.png`;
            }
            if (stepXCoord >= 240) {
                this.attacking = false;
                this.launchProjectile();
            }
            ctx.drawImage(this.drawing, stepXCoord, 0, 40, 80, this.position[0], this.position[1], 75, 90);
        }
        else {
            super.draw(ctx);
        }
    }

    attackHelper(ctx) {
        if (this.direction === "right") {
            this.drawing.src = `${this.images}/attack_r.png`;
        } else {
            this.drawing.src = `${this.images}/attack_l.png`;
        }
        if (stepXCoord >= 240) {
            this.attacking = false;
            this.launchProjectile();
        }
        return this._selectFrame(1);
    }

    dead() {
        window.alert("you died lol");
    }
}

module.exports = Player;