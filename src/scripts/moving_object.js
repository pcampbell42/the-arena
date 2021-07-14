
class MovingObject {
    constructor(params) {
        this.position = params["position"];
        this.velocity = params["velocity"];
        this.game = params["game"];
        this.animationPace = 1;
        this.drawing = new Image();
    }

    draw(ctx) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.position[0], this.position[1], 4, 0, 2 * Math.PI, true);
        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.fill();
    }

    move(dt) {
        // const velocityScale = dt / (1000 / 60),
        //     offsetX = this.velocity[0] * velocityScale,
        //     offsetY = this.velocity[1] * velocityScale;

        // this.position = [this.position[0] + offsetX, this.position[1] + offsetY];

        this.position[0] += this.velocity[0];
        this.position[1] += this.velocity[1];
    }

    isCollidedWith(obj) {
        let xDiff = this.position[0] - obj.position[0];
        let yDiff = this.position[1] - obj.position[1]
        return (xDiff > 0) && (xDiff < 45) && (yDiff > 0) && (yDiff < 65);
    }

    willCollideWith(obj) {
        return Math.abs(this.position[0] + this.velocity[0] - obj.position[0]) < 25 && 
            Math.abs(this.position[1] + this.velocity[1] - obj.position[1]) < 35
    }

    remove() {
        this.game.remove(this);
    }
}

module.exports = MovingObject;