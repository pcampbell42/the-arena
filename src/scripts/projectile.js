const MovingObject = require("./moving_object.js");

class Projectile extends MovingObject {
    constructor(params) {
        super(params);
        this.damage = params["damage"];
        this.shooter = params["shooter"];
        this.drawing.src = "./dist/assets/bullets.png";
    }

    move() {
        super.move();
        if (this.position[0] < 0 || this.position[1] < 0 || this.position[0] > this.game.canvasSizeX - 40 || this.position[1] > this.game.canvasSizeY - 40) this.remove();
    }

    draw(ctx) {
        if (this.shooter === this.game.player) {
            ctx.drawImage(this.drawing, 123, 295, 19, 19, this.position[0], this.position[1], 15, 15);
        } else {
            super.draw(ctx);
        }
    }

    collidedWith(obj) {
        if (obj.rolling || (obj.maxHealth === 20 && this.shooter !== this.game.player) ) return; // Doesn't hit rolling targets
        obj.takeDamage(this.damage);
        this.remove();
    }
}

module.exports = Projectile;