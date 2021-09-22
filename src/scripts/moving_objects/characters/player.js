const Character = require("./character");
const SpecialTile = require("../../floors/special_tile");


class Player extends Character {
    constructor(params) {
        super(params);
        
        this.images = "./dist/assets/cyborg";
        this.idleFrames = 4; // How many frames this Character has in the idle animation
        this.runningFrames = 6; // How many frames this Character has in the running animation
        this.animationPace = 2; // Personalized animation pace... changes when time is slowed

        this.health = 100;
        this.energy = 100;
        this.isDead = false;
    }


    /**
     * Method that's called instead of move() in Game. Does some extra logic then
     * calls move().
     */
    action() {
        // Checking if on top of switch (if on the same tile, turn the switch on)
        if (this.game.floor.hasExtraDoor) {
            let currentTilePosition = [Math.floor((this.position[0]) / 40) + 1, Math.floor((this.position[1]) / 40) + 1];
            if (currentTilePosition[0] === this.game.floor.switchPosition[0] && 
                currentTilePosition[1] === this.game.floor.switchPosition[1]) {
                this.game.floor.extraDoorOpen = true;
            }
        } 
        this.move();
    }


    /**
     * Movement method for the player character. Handles keybinds.
     */
    move() {
        // Resets velocity immediately (momentum isn't a thing. Also, if kicking, velocity is 0
        if (!this.rolling || this.kicking) {
            this.velocity[0] = 0;
            this.velocity[1] = 0;
        }

        // --------- Setting velocity based on key input ---------

        // If kicking or rolling, can't add velocity
        if (!this.rolling && !this.kicking) {
            if (key.isPressed("w")) this.velocity[1] -= (2.5 * this.animationPace);
            if (key.isPressed("s")) this.velocity[1] += (2.5 * this.animationPace);
            if (key.isPressed("a")) {
                this.velocity[0] -= (2.5 * this.animationPace);
                this.direction = "left";
            }
            if (key.isPressed("d")) {
                this.velocity[0] += (2.5 * this.animationPace);
                this.direction = "right"
            }
        }
        super.move();
    }


    /**
     * Normal draw() method that handles the Player-specific animations, and then
     * calls the Character draw() method to handle the animations it has in common
     * with other Characters.
     * @param {CanvasRenderingContext2D} ctx - 2D canvas context to draw board 
     */
    draw(ctx) {
        // For some bizarro reason, I have to do this here instead of in startKnockback, which would make way more sense
        // Basically, if an enemy is knockedBack, attacking is canceled and they're no longer busy
        if (this.knockedBack || this.stunned) {
            this.attacking = false;
            this.busy = false;
        }

        // Animate normal attack
        if (this.attacking) {
            // The x-coordinate inside the animation sheet. As animation goes on,
            // move across the animation sheet.
            let stepXCoord = this._selectFrame(2 / this.animationPace);

            if (this.direction === "right") {
                this.drawing.src = `${this.images}/attack_r.png`;
            } else {
                this.drawing.src = `${this.images}/attack_l.png`;
            }
            // End of the animation, fire the projectile, end attack
            if (stepXCoord >= 240) {
                this.attacking = false;
                this.busy = false;
                this.launchProjectile();
            }
            ctx.drawImage(this.drawing, stepXCoord, 0, 40, 80, this.position[0], this.position[1], 75, 90);

        } 
        // Animate roll
        else if (this.rolling) {
            // The x-coordinate inside the animation sheet. As animation goes on,
            // move across the animation sheet.
            let stepXCoord = this._selectFrame(9 / this.animationPace);

            if (this.direction === "right") {
                this.drawing.src = `${this.images}/roll_r.png`;
            } else {
                this.drawing.src = `${this.images}/roll_l.png`;
            }
            // End of the animation, end the roll
            if (stepXCoord >= 240) {
                this.rolling = false;
                this.busy = false;
            }
            ctx.drawImage(this.drawing, stepXCoord - 5, 0, 35, 80, this.position[0], this.position[1] + 10, 75, 90);

        } 
        // Animate kick
        else if (this.kicking) {
            // The x-coordinate inside the animation sheet. As animation goes on,
            // move across the animation sheet.
            let stepXCoord = this._selectFrame(9 / this.animationPace);

            if (this.direction === "right") {
                this.drawing.src = `${this.images}/kick_r.png`;
            } else {
                this.drawing.src = `${this.images}/kick_l.png`;
            }
            // End of the animation, fire the kick, end the kick
            if (stepXCoord >= 240) {
                this.kicking = false;
                this.busy = false;
                this.kick();
            }
            ctx.drawImage(this.drawing, stepXCoord, 7, 35, 80, this.position[0], this.position[1] + 10, 75, 90);

        } 
        // If not attacking, rolling, or kicking...
        else {
            super.draw(ctx);
        }
    }


    /**
     * This method checks wall collision for the Player, and then calls the Character
     * validMove() to check all other collisions.
     * @returns - Boolean, true if the move is valid, false if invalid
     */
    validMove() {
        // Finding what type of tile the Character is moving into based on position / velocity
        let futureXCoord = this.position[0] + this.velocity[0];
        let futureYCoord = this.position[1] + this.velocity[1];

        // Get tiles. Note don't need to check indices here like we do in the Enemy validMove(). This is because
        // there's no reason the Player would ever have an out-of-bounds index.
        let xAdjustedTileNegative = this.game.floor.floorTiles[Math.floor((futureYCoord + 5) / 40) + 1][Math.floor((futureXCoord - 10) / 40) + 1];
        let xAdjustedTilePositive = this.game.floor.floorTiles[Math.floor((futureYCoord + 5) / 40) + 1][Math.floor((futureXCoord - 2) / 40) + 1];
        let yAdjustedTileNegative = this.game.floor.floorTiles[Math.floor((futureYCoord + 12) / 40) + 1][Math.floor((futureXCoord - 5) / 40) + 1];
        let yAdjustedTilePositive = this.game.floor.floorTiles[Math.floor((futureYCoord - 4) / 40) + 1][Math.floor((futureXCoord - 5) / 40) + 1];

        // If any of the tiles are a wall, the move is invalid
        if ((xAdjustedTileNegative instanceof SpecialTile && xAdjustedTileNegative.type === "wall") ||
            (xAdjustedTileNegative[0] instanceof Array && xAdjustedTileNegative[1].type === "wall") ||
            (xAdjustedTilePositive instanceof SpecialTile && xAdjustedTilePositive.type === "wall") ||
            (xAdjustedTilePositive[0] instanceof Array && xAdjustedTilePositive[1].type === "wall") ||
            (yAdjustedTileNegative instanceof SpecialTile && yAdjustedTileNegative.type === "wall") ||
            (yAdjustedTileNegative[0] instanceof Array && yAdjustedTileNegative[1].type === "wall") ||
            (yAdjustedTilePositive instanceof SpecialTile && yAdjustedTilePositive.type === "wall") ||
            (yAdjustedTilePositive[0] instanceof Array && yAdjustedTilePositive[1].type === "wall")) {

            if (this.knockedBack) {
                this.knockedBack = false;
                this.stunned = true;
                this.stunnedCounter = 0;
                this.velocity = [0, 0];
                this.step = 0;
                this.takeDamage(5);
            }
            return false;
        }
        return super.validMove() ? true : false;
    }


    /**
     * Overrides launchProjectile in Character. The only reason for this is to deal
     * with Player energy.
     */
    launchProjectile() {
        // Can't shoot if out of energy
        if (this.energy > 0) {
            this.energy -= 0.5; // Shooting costs 0.5 energy
            super.launchProjectile();
        }
    }


    /**
     * Called in the Player draw() method to align with the animation. Checks all
     * Enemies in the game and if any are in range of the kick, handles appropriate
     * logic.
     */
    kick() {
        // Loop through all Enemies
        for (let i = 0; i < this.game.enemies.length; i++) {
            let distanceToEnemy = Math.sqrt((this.game.enemies[i].position[0] - this.position[0]) ** 2 +
                (this.game.enemies[i].position[1] - this.position[1]) ** 2);

            // This checks what direction (left or right) the Enemy is in from the Player (kick is directional)
            let enemyDirection = this.game.enemies[i].position[0] - this.position[0];

            if (distanceToEnemy <= 55 && ((this.direction === "right" && enemyDirection >= -18) ||
                this.direction === "left" && enemyDirection <= 18)) {

                // Figuring out what direction to knock enemy in
                let knockedDirection;
                let knockedEnemy = this.game.enemies[i];
                if (knockedEnemy.position[1] - this.position[1] > 30) {
                    knockedDirection = "down";
                } else if (knockedEnemy.position[1] - this.position[1] < -30) {
                    knockedDirection = "up";
                } else if (this.direction === "right" && enemyDirection >= 0) {
                    knockedDirection = "right";
                } else {
                    knockedDirection = "left";
                }

                // Knocking enemy
                this.game.enemies[i].startKnockback(knockedDirection);
                this.game.enemies[i].takeDamage(10);
            }
        }
    }


    /**
     * Sets isDead, which is a trigger in Game to show the Game Over screen.
     */
    dead() {
        this.isDead = true;
    }
}


module.exports = Player;
