const PlayerCharacter = require("./player_character.js");

class Game {
    constructor() {
        this.player = new PlayerCharacter({position: [0, 300], velocity: [1, 1]});
        // this.room
        // this.enemies
    }

    draw(ctx) {
        ctx.clearRect(0, 0, 900, 600);
        this.player.draw(ctx);
        // this.allObjects().forEach(ele => ele.draw(ctx));
    }

    step(dt) {
        this.player.move(dt);
    }
}

module.exports = Game;