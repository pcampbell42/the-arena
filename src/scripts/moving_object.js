class MovingObject {

    constructor(params) {
        this.position = params["position"];
        this.velocity = params["velocity"];
        this.drawing = new Image();
        this.direction = "right";

        // this.status;
        // this.size
        // this.game = params["game"];
    }

    draw(ctx) {
        this.drawing.src = "./dist/assets/cyborg/Cyborg_idle.png";
        ctx.drawImage(this.drawing, 0, 0, 40, 80, this.position[0], this.position[1], 20, 30);
    }

    move() {
        this.position[0] += this.velocity[0];
        this.position[1] += this.velocity[1];
    }

    isCollidedWith(otherMO) {

    }

}

module.exports = MovingObject;