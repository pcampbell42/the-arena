const MovingObject = require("./moving_object.js");
const SpecialTile = require("./special_tile.js");


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

        // Bug fix for if someone shoots a perfectly aligned projectile out of an already opened door
        if (this.position[1] <= -10) {
            this.remove();
            return;
        }

        // ---------------- Checking if the projectile has collided with a wall ----------------

        let xCoord = this.position[0];
        let yCoord = this.position[1];

        // Using position to find what kind of Tile the projectile is on. Have to
        // adjust the xCoord & yCoord differently for the Player's Projectiles and the
        // Shooter's Projectiles.
        let nextTile;
        this.shooter === this.game.player ? 
            nextTile = this.game.floor.floorTiles[Math.floor((yCoord - 20) / 40) + 1][Math.floor((xCoord - 25) / 40) + 1] :
            nextTile = this.game.floor.floorTiles[Math.floor((yCoord - 30) / 40) + 1][Math.floor((xCoord - 40) / 40) + 1];

        if (nextTile instanceof SpecialTile || (nextTile.length === 2 && nextTile[0] instanceof Array)) {
            if (nextTile.type === "wall") {
                this.remove();
            } else if (nextTile[1] instanceof SpecialTile) {
                nextTile[1].type === "wall" ? this.remove() : null;
            }
        }
    }


    /**
     * Basic draw method for projectiles.
     * @param {CanvasRenderingContext2D} ctx - 2D Canvas context to draw the game
     */
    draw(ctx) {
        if (this.shooter === this.game.player) { // Draws Player's lasers
            ctx.drawImage(this.drawing, 123, 295, 19, 19, this.position[0], this.position[1], 15, 15);
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
        // Projectiles don't hit rolling targets. Also enemy Projectiles don't hit Rushers
        if (obj.rolling || (obj.maxHealth === 20 && this.shooter !== this.game.player)) {
            // Do nothing
        } else if (obj instanceof Projectile) {
            this.remove();
            obj.remove();
        } 
        // If a Shooter is hit by an Enemy projectile, they take a small amount of damage
        else if (obj.maxHealth === 30 && this.shooter !== this.game.player) {
            obj.takeDamage(2);
            this.remove();
        } else {
            obj.takeDamage(this.damage);
            this.remove();
        }
    }
}


module.exports = Projectile;
