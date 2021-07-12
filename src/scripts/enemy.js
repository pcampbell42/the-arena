// const MovingObject = require("./moving_object.js");
const Character = require("./character.js");

class Enemy extends Character {
    constructor(params) {
        super(params);
        this.health = 20;
        this.status = "idle"
        this.attacking = false;
        this.direction = "right"
        this.step = 0;
    }

    move(dt) {
        
    }

    draw(ctx) {
        let stepXCoord = this.selectFrame();
        if (this.status === "moving") {
            if (this.direction === "right") {
                this.drawing.src = "./dist/assets/shooter/shooter_walk_r.png";
            } else {
                this.drawing.src = "./dist/assets/shooter/shooter_walk_l.png";
            }
        } else if (this.status === "idle") {
            if (this.direction === "right") {
                this.drawing.src = "./dist/assets/shooter/shooter_idle_r.png";
            } else {
                this.drawing.src = "./dist/assets/shooter/shooter_idle_l.png";
            }
        }
        ctx.drawImage(this.drawing, stepXCoord, 0, 40, 80, this.position[0], this.position[1], 75, 90);
    }

    selectFrame() {
        if (this.status === "idle" && this.step > 44) this.step = 0;
        if (this.status === "moving" && this.step > 90) this.step = 0;

        let selection;
        if (this.step < 18) {
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
        if (this.direction === "left") selection += 10;
        this.step += 1;

        return selection;
    }

    collidedWith(otherObject) {
        
    }
}

module.exports = Enemy;