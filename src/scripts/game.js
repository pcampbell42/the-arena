// const Enemy = require("./enemy.js");
const Player = require("./player.js");
const Shooter = require("./shooter.js");
const Rusher = require("./rusher.js")
const Projectile = require("./projectile.js");
const Floor = require("./floor.js");

class Game {
    constructor(journalistDifficulty) {
        this.canvasSizeX = 720;
        this.canvasSizeY = 440;
        this.floor = new Floor({
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
        this.spawnEnemies(1);
        
        this.slowed = false;
        this.paused = false;
        
        this.doorOpened = false;
        this.currentFloor = 1;

        this.journalistDifficulty = journalistDifficulty;
    }

    spawnEnemies(num) {
        for (let i = 0; i < num; i++) {

            let enemy;
            let validPosition = false;
            while (!validPosition)
            {
                let randomPos = [((this.canvasSizeX - 200) * Math.random()) + 100, ((this.canvasSizeY - 200) * Math.random()) + 100];
                validPosition = true;
                if (Math.random() * 3 > 1) {
                    enemy = new Shooter({
                        position: randomPos,
                        velocity: [0, 0],
                        game: this
                    });
                } else {
                    enemy = new Rusher({
                        position: randomPos,
                        velocity: [0, 0],
                        game: this
                    })
                }

                if (!enemy.validMove()) validPosition = false;
            }
            this.enemies.push(enemy);
        }
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.canvasSizeX, this.canvasSizeY);
        this.floor.draw(ctx);
        this.player.draw(ctx);
        this.enemies.forEach(ele => ele.draw(ctx));
        this.projectiles.forEach(ele => ele.draw(ctx));
    }


    step() {
        if (key.shift && !this.slowed && this.player.energy > 0) {
            this._slowSpeed();
        } else if ( (!key.shift && this.slowed) || (this.player.energy <= 0 && this.slowed) ) {
            this._restoreSpeed();
        }
        if (this.slowed && this.player.energy > 0) this.player.energy -= 0.05;

        this.player.action();
        this.enemies.forEach(ele => ele.action());
        this.projectiles.forEach(ele => ele.move());
        this.checkProjectileCollisions();

        if (this.enemies.length === 0) {
            this.floor.doorOpened = true;
            if (this.player.position[1] <= -10) {
                this.floor = new Floor({
                    canvasSizeX: this.canvasSizeX,
                    canvasSizeY: this.canvasSizeY
                });
                this.player.position = [this.canvasSizeX / 2 - 50, this.canvasSizeY - 100];
                this.currentFloor += 1;

                this.spawnEnemies(this.currentFloor);
    
                this.player.energy += 20;
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