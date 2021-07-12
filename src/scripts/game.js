const Enemy = require("./enemy.js");
const PlayerCharacter = require("./player_character.js");

class Game {
    constructor() {
        this.player = new PlayerCharacter({
            position: [0, 300],
            velocity: [0, 0],
            game: this
        });
        this.projectiles = [];
        this.enemies = [];
        this.spawnEnemies(6);
    }

    spawnEnemies(num) {
        for (let i = 0; i < num; i++) {
            let randomPos = [800 * Math.random(), 500 * Math.random()];
            let e = new Enemy({
                position: randomPos,
                velocity: [0, 0],
                game: this
            });
            this.enemies.push(e);
        }
    }

    draw(ctx) {
        ctx.clearRect(0, 0, 900, 600);
        this.player.draw(ctx);
        this.enemies.forEach(ele => ele.draw(ctx));
        this.projectiles.forEach(ele => ele.draw(ctx));
    }

    step(dt) {
        this.player.move(dt);
        this.enemies.forEach(ele => ele.move(dt));
        this.projectiles.forEach(ele => ele.move(dt));
        this.checkCollisions();
    }

    allObjects() {
        return [this.player].concat(this.enemies).concat(this.projectiles);
    }

    checkCollisions() {
        const allMOs = this.allObjects();
        for (let i = 0; i < allMOs.length; i++) {
            for (let j = 0; j < allMOs.length; j++) {
                if (allMOs[i].isCollidedWith(allMOs[j])) {
                    allMOs[i].collidedWith(allMOs[j]);
                }
            }
        }
    }

    remove(obj) {
        if (obj instanceof Projectile) {
            this.projectiles.splice(this.projectiles.indexOf(obj), 1);
        } else if (obj instanceof Enemy) {
            this.enemies.splice(this.enemies.indexOf(obj), 1);
        }
    }
}

module.exports = Game;