// const Enemy = require("./enemy.js");
const Player = require("./player.js");
const Shooter = require("./shooter.js");
const Rusher = require("./rusher.js")
const Projectile = require("./projectile.js");
const Room = require("./room.js");

class Game {
    constructor() {
        this.canvasSizeX = 720;
        this.canvasSizeY = 440;
        this.room = new Room({
            canvasSizeX: this.canvasSizeX,
            canvasSizeY: this.canvasSizeY
        });

        this.player = new Player({
            position: [this.canvasSizeX / 2 - 50, this.canvasSizeY - 100],
            velocity: [0, 0],
            game: this
        });
        this.projectiles = [];
        this.enemies = [];
        this.spawnEnemies(6);

        this.slowed = false;
        this.paused = false;

        this.doorOpened = false;
        this.currentRoom = 1;
    }

    spawnEnemies(num) {
        for (let i = 0; i < num; i++) {
            let randomPos = [(this.canvasSizeX - 100) * Math.random(), (this.canvasSizeY - 100) * Math.random()];
            let e = new Shooter({
                position: randomPos,
                velocity: [0, 0],
                game: this
            });
            this.enemies.push(e);
        }
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.canvasSizeX, this.canvasSizeY);
        this.room.draw(ctx);
        this.player.draw(ctx);
        this.enemies.forEach(ele => ele.draw(ctx));
        this.projectiles.forEach(ele => ele.draw(ctx));
    }

    step(dt) {
        if (key.shift && !this.slowed && this.player.energy > 0) {
            this._slowSpeed();
        } else if ( (!key.shift && this.slowed) || (this.player.energy <= 0 && this.slowed) ) {
            this._restoreSpeed();
        }
        if (this.slowed && this.player.energy > 0) this.player.energy -= 0.2;

        this.player.action(dt);
        this.enemies.forEach(ele => ele.action(dt));
        this.projectiles.forEach(ele => ele.move(dt));
        this.checkProjectileCollisions();
        if (this.enemies.length === 0) {
            this.room.doorOpened = true;
            if (this.player.position[1] <= -10) {
                this.room = new Room({
                    canvasSizeX: this.canvasSizeX,
                    canvasSizeY: this.canvasSizeY
                });
                this.player.position = [this.canvasSizeX / 2 - 50, this.canvasSizeY - 100];
                this.currentRoom += 1;

                this.spawnEnemies(6);
    
                this.player.energy += 10;
                if (this.player.energy > 100) this.player.energy = 100;
            }
        }
    }

    checkProjectileCollisions() {
        this.projectiles.forEach( proj => {
            this.enemies.forEach( enemy => {
                if (proj.shooter !== enemy && proj.isCollidedWith(enemy)) proj.collidedWith(enemy);
            });
            if (proj.shooter !== this.player && proj.isCollidedWith(this.player)) proj.collidedWith(this.player);
        });
    }

    remove(obj) {
        if (obj instanceof Projectile) {
            this.projectiles.splice(this.projectiles.indexOf(obj), 1);
        } else if (obj instanceof Shooter || obj instanceof Rusher) {
            this.enemies.splice(this.enemies.indexOf(obj), 1);
        }
    }

    _slowSpeed() {
        this.slowed = true;
        this.player.animationPace = 0.5;
        this.enemies.forEach(ele => {
            ele.animationPace = 0.25;
            ele.velocity[0] /= 4;
            ele.velocity[1] /= 4;
        });
        this.projectiles.forEach(ele => {
            ele.velocity[0] /= 4;
            ele.velocity[1] /= 4;
        });
    }

    _restoreSpeed() {
        this.slowed = false;
        this.player.animationPace = 2;
        this.enemies.forEach(ele => {
            ele.animationPace = 1;
            ele.velocity[0] *= 4;
            ele.velocity[1] *= 4;
        });
        this.projectiles.forEach(ele => {
            ele.velocity[0] *= 4;
            ele.velocity[1] *= 4;
        });
    }
}

module.exports = Game;