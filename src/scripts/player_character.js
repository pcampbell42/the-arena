const MovingObject = require("./moving_object.js");

class PlayerCharacter extends MovingObject {
    constructor(params) {
        super(params);
        this.health = 100;
        this.status = "idle";
        this.step = 0;
    }

    move(dt) {
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

        const velocityScale = dt / (1000 / 60),
            offsetX = this.velocity[0] * velocityScale,
            offsetY = this.velocity[1] * velocityScale;

        this.position = [this.position[0] + offsetX, this.position[1] + offsetY];

        this.position[0] += this.velocity[0];
        this.position[1] += this.velocity[1];

        if (this.velocity[0] !== 0 || this.velocity[1] !== 0) this.status = "moving";
        if (this.velocity[0] === 0 && this.velocity[1] === 0) this.status = "idle";

        this.velocity[0] = 0;
        this.velocity[1] = 0;
    }

    draw(ctx) {
        let stepXCoord = this.selectFrame();
        if (this.status === "moving") {
            if (this.direction === "right") {
                this.drawing.src = "./dist/assets/cyborg/cyborg_run_r.png";
            } else {
                this.drawing.src = "./dist/assets/cyborg/cyborg_run_l.png";
            }
        } else if (this.status === "idle") {
            if (this.direction === "right") {
                this.drawing.src = "./dist/assets/cyborg/cyborg_idle_r.png";
            } else {
                this.drawing.src = "./dist/assets/cyborg/cyborg_idle_l.png";
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

    // selectFrameIdle() {
    //     if (this.step > 3) this.step = 0;

    //     let selection;

    //     switch (this.step) {
    //         case 0:

    //             break;
    //         case 1:
    //             break;
    //         case 2:
    //             break;
    //         case 3:

    //     }
    //     this.step += 1;
    //     if (this.step === 4) this.step = 0;

    //     return selection;
    // }

    collidedWith(otherObject) {

    }
}

module.exports = PlayerCharacter;