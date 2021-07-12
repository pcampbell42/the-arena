class MovingObject {
    constructor(params) {
        this.position = params['pos'];
        this.velocity = params['velocity'];
        // this.images
        // this.game = params['game'];
    }

    draw(ctx) {
        let drawing = new Image();
        drawing.src = './dist/assets/cyborg/Cyborg_idle.png'

        let that = this
        drawing.onload = function () {
            ctx.drawImage(drawing, that.position[0], that.position[1]);
        }
    }

    move() {

    }
}