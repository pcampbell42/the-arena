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
            canvasSizeY: this.canvasSizeY,
            floorNum: 1
        });
        this.doorOpened = false;
        this.currentFloor = 1;

        this.player = new Player({
            position: [35, this.canvasSizeY - 100],
            velocity: [0, 0],
            game: this
        });
        this.projectiles = [];
        this.enemies = [];
        this.spawnEnemies(0);
        
        this.slowed = false;
        this.paused = false;

        this.journalistDifficulty = journalistDifficulty;
    }


    /**
     * One of the two main methods that plays the game (they both get called in a loop
     * in the GameView class). Takes care of drawing everything.
     * @param {CanvasRenderingContext2D} ctx - 2D Canvas context to draw the game
     */
    draw(ctx) {
        ctx.clearRect(0, 0, this.canvasSizeX, this.canvasSizeY); // Clear canvas

        // Draw everything. Delegates to draw(ctx) methods of each class
        this.floor.draw(ctx);
        this.player.draw(ctx);
        this.enemies.forEach(ele => ele.draw(ctx));
        this.projectiles.forEach(ele => ele.draw(ctx));
    }


    /**
     * One of the two main methods that plays the game (they both get called in a loop
     * in the GameView class). Takes care of the game's logic.
     */
    step() {
        // ------------- Time slow logic -------------
        if (key.shift && !this.slowed && this.player.energy > 0) {
            this._slowSpeed();
        } else if ( (!key.shift && this.slowed) || (this.player.energy <= 0 && this.slowed) ) {
            this._restoreSpeed();
        }
        if (this.slowed && this.player.energy > 0) this.player.energy -= 0.05; // Energy drains while time is slowed


        // ------------- Basic game logic -------------
        this.player.action();
        this.enemies.forEach(ele => ele.action());
        this.projectiles.forEach(ele => ele.move());
        this.checkProjectileCollisions();


        // ------------- Move to next floor logic -------------
        if (this.enemies.length === 0) {
            this.floor.doorOpened = true; // Opens the door to next floor

            if (this.player.position[1] <= -10) { // The player has moved through door to next floor
                this.floor = new Floor({
                    canvasSizeX: this.canvasSizeX,
                    canvasSizeY: this.canvasSizeY
                });
                this.player.position = [35, this.canvasSizeY - 100];
                this.currentFloor += 1;

                let numEnemiesToSpawn = this.currentFloor <= 5 ? this.currentFloor :
                        Math.floor((Math.random() * 6)) + 3; // Number enemies to spawn is random after floor 5
                this.spawnEnemies(numEnemiesToSpawn);
    
                this.player.energy += 20; // Player receives 20 energy on moving to next floor
                if (this.player.energy > 100) this.player.energy = 100;
            }
        }
    }


    /**
     * Helper method to check projectile collisions. Gets called at each step().
     */
    checkProjectileCollisions() {
        this.projectiles.forEach(projectile => {

            // Check if a player OR enemy projectile has collided with an enemy
            this.enemies.forEach(enemy => {
                if (projectile.shooter !== enemy && projectile.isCollidedWith(enemy)) projectile.collidedWith(enemy);
            });

            // Check if an enemy projectile has collided with the player
            if (projectile.shooter !== this.player && projectile.isCollidedWith(this.player)) projectile.collidedWith(this.player);

            // Check if two projectiles have collided
            this.projectiles.forEach(otherProjectile => {
                if (projectile !== otherProjectile && projectile.projectilesCollided(otherProjectile)) projectile.collidedWith(otherProjectile);
            });
        });
    }


    /**
     * Helper method to spawn enemies for a new floor.
     * @param {Number} num - Number of enemies to spawn.
     */
    spawnEnemies(num) {
        for (let i = 0; i < num; i++) {
            let enemy;
            let validPosition = false;

            // Until a valid position for the enemy is found...
            while (!validPosition) {
                let randomPos = [((this.canvasSizeX - 200) * Math.random()) + 100, ((this.canvasSizeY - 200) * Math.random()) + 100];
                validPosition = true;

                // Randomly decide if enemy is a shooter or a rusher
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

                // Uses validMove() in the Character class to check if valid spawn location
                if (!enemy.validMove()) validPosition = false;
            }
            this.enemies.push(enemy);
        }
    }


    /**
     * Helper method that gets called in the MovingObject class, which is in turn called in
     * the Enemy / Projectile classes, that removes the MovingObject from the Game.
     * @param {MovingObject} obj - Some form of moving object (Rusher, Shooter, Projectile)
     */
    remove(obj) {
        if (obj instanceof Projectile) {
            this.projectiles.splice(this.projectiles.indexOf(obj), 1);
        } else if (obj instanceof Shooter || obj instanceof Rusher) {
            this.enemies.splice(this.enemies.indexOf(obj), 1);
        }
    }


    /**
     * Helper method that slows the speed of the game. All it does is set slowed
     * to true, and then divide the animationPace and velocities of everything. The 
     * reason the player's velocity is not cut is that it's dealt with in the
     * Player class.
     */
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


    /**
     * Helper method that restores the speed of the game to normal. All it does is
     * set slowed to false, and then multiply the animationPace and velocities of everything.
     */
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
