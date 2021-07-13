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

    dead() {
        window.alert("you died lol");
    }
}

module.exports = Player;