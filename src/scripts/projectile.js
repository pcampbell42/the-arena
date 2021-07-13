const MovingObject = require("./moving_object.js");

class Projectile extends MovingObject {
    constructor(params) {
        super(params);
        // this.angle = params["angle"];
        this.damage = 10;
        this.ticksSinceFired = 0;
    }

    move(dt) {
        super.move(dt);
        // this.ticksSinceFired++;
        if (this.position[0] < 0 || this.position[1] < 0 || this.position[0] > 860 || this.position[1] > 550) this.remove();
    }

    collidedWith(obj) {
        obj.takeDamage(this.damage);
        this.remove();
    }
}

module.exports = Projectile;