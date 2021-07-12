const MovingObject = require("./moving_object.js");

class Projectile extends MovingObject {
    constructor(params) {
        super(params);
        this.damage = 20;
        this.direction;
    }

    collidedWith(otherObject) {
        
    }
}

module.exports = Projectile;