const Game = require("./game.js");

class GameView {
    constructor(ctx) {
        this.ctx = ctx;
        this.game = new Game();
        this.mousePos = [0, 0];
    }

    start() {
        this.lastTime = 0;
        this.mouseHandler();
        requestAnimationFrame(this.animate.bind(this));
    }

    animate(time) {
        const dt = time - this.lastTime;

        this.game.step(dt);
        this.draw();
        this.lastTime = time;

        requestAnimationFrame(this.animate.bind(this));
    }

    mouseHandler() {
        let that = this;

        document.onmousemove = (e) => {
            that.mousePos = [e.clientX, e.clientY]
        }

        document.addEventListener("click", (e) => {
            
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, 900, 600);
        this.game.draw(this.ctx);
        this.drawCrosshair();
    }

    drawCrosshair() {
        this.ctx.beginPath();
        this.ctx.arc(this.mousePos[0], this.mousePos[1], 4, 0, 2 * Math.PI, true);
        this.ctx.stroke();
    }
}

module.exports = GameView;