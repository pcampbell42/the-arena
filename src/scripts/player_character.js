// const MovingObject = require("./moving_object.js");
const Character = require("./character.js");
const Projectile = require("./projectile.js");

class PlayerCharacter extends MovingObject {
    constructor(params) {
        super(params);
        this.health = 100;
        this.status = "idle";
        this.attacking = false;
        this.direction = "right";
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

        // const velocityScale = dt / (1000 / 60),
        //     offsetX = this.velocity[0] * velocityScale,
        //     offsetY = this.velocity[1] * velocityScale;

        // this.position = [this.position[0] + offsetX, this.position[1] + offsetY];

        let freePosition = true;
        for (let i = 0; i < this.game.enemies.length; i++) {
            if (this.isCollidedWith(this.game.enemies[i])) freePosition = false;
        }

        if (freePosition) {
            this.position[0] += this.velocity[0];
            this.position[1] += this.velocity[1];
        }

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

    collidedWith(otherObject) {
        // if (!otherObject instanceof Projectile) {
        //     this.runningIntoEnemy = true;
        // }
    }

    

    shoot(target) {
        // FIX THIS SHIT SO ALL MOVE SAME SPEED
        let a = 800 / ((target[0] - this.position[0]) ** 2 + (target[1] - this.position[1]) ** 2)
        this.attacking = true;
        this.step = 0;

        const p = new Projectile({
            position: [this.position[0], this.position[1]],
            velocity: [a * (target[0] - this.position[0]), a * (target[1] - this.position[1])],
            game: this.game
        });
        this.game.projectiles.push(p);
    }
}

module.exports = PlayerCharacter;