
class MovingObject {
    constructor(params) {
        this.position = params["position"];
        this.velocity = params["velocity"];
        this.game = params["game"];
        this.animationPace = 1;
        this.drawing = new Image();
    }


    /**
     * The very basics of moving a MovingObject. Both Projectile and Character call this.
     */
    move() {
        this.position[0] += this.velocity[0];
        this.position[1] += this.velocity[1];
    }

    
    /**
     * 
     * @param {*} obj 
     * @returns 
     */
    isCollidedWith(obj) {
        let xDiff = this.position[0] - obj.position[0];
        let yDiff = this.position[1] - obj.position[1]
        return (xDiff > 0) && (xDiff < 45) && (yDiff > 0) && (yDiff < 65);
    }


    /**
     * 
     * @param {*} obj 
     * @returns 
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
