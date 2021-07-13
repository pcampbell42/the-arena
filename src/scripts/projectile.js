const MovingObject = require("./moving_object.js");
// const Character = require("./character.js");
// const Enemy = require("./enemy.js");

class Projectile extends MovingObject {
    constructor(params) {
        super(params);
        this.damage = params["damage"];
        this.shooter = params["shooter"];
        this.drawing.src = "./dist/assets/bullets.png";
    }

    move(dt) {
        super.move(dt);
        if (this.position[0] < 0 || this.position[1] < 0 || this.position[0] > 860 || this.position[1] > 570) this.remove();
    }

    draw(ctx) {
        if (this.shooter === this.game.player) {
            ctx.drawImage(this.drawing, 123, 295, 19, 19, this.position[0], this.position[1], 15, 15);
        } else {
            super.draw(ctx);
            // ctx.drawImage(this.drawing, 262, 155, 14, 14, this.position[0], this.position[1], 15, 15);
        }
    }

    collidedWith(obj) {
        obj.takeDamage(this.damage);
        this.remove();
    }
}

module.exports = Projectile;