
class MovingObject {
    constructor(params) {
        this.position = params["position"];
        this.velocity = params["velocity"];
        this.game = params["game"]; // Every MovingObject has access to its Game
        this.animationPace = 1; // Used to slow down animations when the player slows down time
        this.drawing = new Image(); // The src of this is changed when animating
    }


    /**
     * The very basics of moving a MovingObject. Both Projectile and Character call this.
     */
    move() {
        this.position[0] += this.velocity[0];
        this.position[1] += this.velocity[1];
    }

    
    /**
     * A basic collision checking method. Used to check if projectiles have collided
     * with characters.
     * @param {MovingObject} obj - Should be a Character
     * @returns - A boolean, true if collided, false if not
     */
    isCollidedWith(obj) {
        let xDiff = this.position[0] - obj.position[0];
        let yDiff = this.position[1] - obj.position[1]
        return (xDiff > 0) && (xDiff < 45) && (yDiff > 0) && (yDiff < 65);
    }


    /**
     * An alternate collision checking method. Used to check if a character is going
     * to collide with another character. Instead of using the current position, as in
     * isCollidedWith, uses the future position (position + velocity). This is because
     * if the current position were used to detect collision between characters, the 
     * two characters would be stuck together once they collide.
     * @param {MovingObject} obj - Should be a Character
     * @returns - A boolean, true if collided, false if not
     */
    willCollideWith(obj) {
        return Math.abs(this.position[0] + this.velocity[0] - obj.position[0]) < 25 && 
            Math.abs(this.position[1] + this.velocity[1] - obj.position[1]) < 35
    }


    /**
     * Method that calls Game's remove method to remove a MovingObject from the Game.
     */
    remove() {
        this.game.remove(this);
    }
}


module.exports = MovingObject;
