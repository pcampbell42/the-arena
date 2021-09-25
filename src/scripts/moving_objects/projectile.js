const MovingObject = require("./moving_object");
const SpecialTile = require("../floors/special_tile");


class Projectile extends MovingObject {
    constructor(params) {
        super(params);
        this.damage = params["damage"];
        this.shooter = params["shooter"];
        this.drawing.src = "./dist/assets/bullets.png";
    }


    /**
     * Basic move method for projectiles.
     */
    move() {
        super.move(); // Moves projectile

        // Bug fix for if someone shoots a perfectly aligned projectile out of an 
        // already opened door. Also fix visual bug where projectile looks like its 
        // moving through wall on right side of floor.
        if (this.position[1] <= 0 || this.position[1] >= this.game.canvasSizeX) {
            this.remove();
            return;
        }

        this.hitWall() ? this.remove() : null; // If projectile has hit a wall, remove it
    }


    /**
     * Same logic as the custom validMove() functions in Player and Enemy, but with
     * adjustments made for projectiles (they're small). Called in move() above.
     * @returns - Boolean, true if the projectile has hit a wall, false if not
     */
    hitWall() {
        // ---------------- Checking if the projectile has collided with a wall ----------------

        let xCoord = this.position[0];
        let yCoord = this.position[1];
        
        // Using position to find what kind of Tile the projectile is on.
        let xAdjustedTileNegative = this.game.floor.floorTiles[Math.floor((yCoord - 30) / 40) + 1][Math.floor((xCoord - 50) / 40) + 1];
        let xAdjustedTilePositive = this.game.floor.floorTiles[Math.floor((yCoord - 30) / 40) + 1][Math.floor((xCoord - 30) / 40) + 1];
        let yAdjustedTileNegative = this.game.floor.floorTiles[Math.floor((yCoord - 40) / 40) + 1][Math.floor((xCoord - 40) / 40) + 1];
        let yAdjustedTilePositive = this.game.floor.floorTiles[Math.floor((yCoord - 20) / 40) + 1][Math.floor((xCoord - 40) / 40) + 1];

        // Make sure none of them are undefined (will throw nasty error)
        if (xAdjustedTileNegative !== undefined && xAdjustedTilePositive !== undefined &&
            yAdjustedTileNegative !== undefined && yAdjustedTilePositive !== undefined) {

            // If all of the tiles are a wall, the projectile has hit a wall. The reason they all have
            // to be true is so that projectile wall collision is very forgiving (it feels better to play).
            if (((xAdjustedTileNegative instanceof SpecialTile && xAdjustedTileNegative.type === "wall") ||
                (xAdjustedTileNegative[0] instanceof Array && xAdjustedTileNegative[1].type === "wall")) &&
                ((xAdjustedTilePositive instanceof SpecialTile && xAdjustedTilePositive.type === "wall") ||
                (xAdjustedTilePositive[0] instanceof Array && xAdjustedTilePositive[1].type === "wall")) &&
                ((yAdjustedTileNegative instanceof SpecialTile && yAdjustedTileNegative.type === "wall") ||
                (yAdjustedTileNegative[0] instanceof Array && yAdjustedTileNegative[1].type === "wall")) &&
                ((yAdjustedTilePositive instanceof SpecialTile && yAdjustedTilePositive.type === "wall") ||
                (yAdjustedTilePositive[0] instanceof Array && yAdjustedTilePositive[1].type === "wall")))
                return true;
        }
    }


    /**
     * Basic draw method for projectiles.
     * @param {CanvasRenderingContext2D} ctx - 2D Canvas context to draw the game
     */
    draw(ctx) {
        if (this.shooter === this.game.player) { // Draws Player's lasers
            ctx.drawImage(this.drawing, 123, 295, 19, 19, this.position[0], this.position[1], 15, 15);
        } else if (this.shooter.constructor.name === "Punk") { // Draws Punk's lasers
            ctx.drawImage(this.drawing, 164, 295, 19, 19, this.position[0], this.position[1], 15, 15);
        } else { // Draws Shooter's bullets
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.position[0], this.position[1], 4, 0, 2 * Math.PI, true);
            ctx.stroke();
            ctx.fillStyle = "black";
            ctx.fill();
        }
    }

    
    /**
     * An third collision checking method (the other two are in MovingObject). This 
     * method checks if two projectiles have collided. Same as MovingObject isCollidedWith, 
     * but for smaller objects.
     * @param {Projectile} proj 
     */
    projectilesCollided(proj) {
        let xDiff = this.position[0] - proj.position[0];
        let yDiff = this.position[1] - proj.position[1]
        return (xDiff > 0) && (xDiff < 5) && (yDiff > 0) && (yDiff < 5);
    }


    /**
     * Method that handles the logic for what to do if a Projectile collides with
     * another MovingObject.
     * @param {MovingObject} obj - Any kind of MovingObject
     */
    collidedWith(obj) {
        // Projectiles don't hit rolling targets. Also Enemy Projectiles don't hit Rushers
        if (obj.rolling || (obj.maxHealth === 20 && this.shooter !== this.game.player)) {
            // Do nothing
        } 
        // If a projectile hits another projectile, they cancel each other
        else if (obj instanceof Projectile) {
            this.remove();
            obj.remove();
        } 
        // If a Shooter or Meathead is hit by an Enemy projectile, they take a reduced amount of damage
        else if ((obj.constructor.name === "Shooter" && this.shooter !== this.game.player) ||
                 (obj.constructor.name === "Meathead" && this.shooter !== this.game.player)) {
            obj.takeDamage(2);
            this.remove();
        }
        // The Tank boss has special mechanics for being hit
        else if (obj.constructor.name === "Tank") {
            // Boolean - true if Tank is facing the projectile
            let facingProjectile = ((obj.direction === "right" && this.velocity[0] < 0) || 
                                    (obj.direction === "left" && this.velocity[0] > 0))

            // If the Tank is facing the projectile, not attacking, not knocked back, and not 
            // stunned, he absorbs the projectile without taking damage
            if (facingProjectile && !obj.attacking && !obj.knockedBack && !obj.stunned) {
                this.remove();
            } else { // Else he takes damage as normal
                obj.takeDamage(this.damage);
                this.remove();
            }
        }
        // The Punk boss has a chance to roll right as hes hit, avoiding damage
        else if (obj.constructor.name === "Punk") {
            let randNum = Math.floor(Math.random() * 100);
            if (!obj.busy && randNum <= 65) {
                obj.aggroed = true;
                obj.roll();
            } else {
                obj.takeDamage(this.damage);
                this.remove();
            }
        }
        // For normal Character + Projectile collision
        else {
            obj.takeDamage(this.damage);
            this.remove();
        }
    }
}


module.exports = Projectile;
