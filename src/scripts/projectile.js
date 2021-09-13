const MovingObject = require("./moving_object.js");


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

        // THIS WILL CHANGE - HAVE TO JUST CHECK IF IT HITS A TILE THATS A WALL INSTEAD
        // OR just have a switch statement that uses this.game.floor.templateNum and then each template
        // has customized logic

        // Switch statement that checks if the projectile has hit a wall based on which floor template
        // the Game is currently using
        if (this.position[0] < 0 || this.position[1] < 0 || this.position[0] > this.game.canvasSizeX - 40 || 
            this.position[1] > this.game.canvasSizeY - 40) this.remove();
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
     * Checks if two projectiles have collided. Same as MovingObject isCollidedWith, 
     * but for smaller objects.
     * @param {Projectile} proj 
     */
    projectilesCollided(proj) {
        let xDiff = this.position[0] - proj.position[0];
        let yDiff = this.position[1] - proj.position[1]
        return (xDiff > 0) && (xDiff < 10) && (yDiff > 0) && (yDiff < 10);
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
