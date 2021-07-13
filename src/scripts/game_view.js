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
            // that.game.player.shoot(that.mousePos);
            that.game.player.startAttack(that.mousePos);
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, 900, 600);
        this.game.draw(this.ctx);
        this.drawCrosshair();
        this.drawHealth();
    }

    drawCrosshair() {
        this.ctx.beginPath();

        this.ctx.moveTo(this.mousePos[0] - 10, this.mousePos[1]);
        this.ctx.lineTo(this.mousePos[0] + 10, this.mousePos[1]);

        this.ctx.moveTo(this.mousePos[0], this.mousePos[1] - 10);
        this.ctx.lineTo(this.mousePos[0], this.mousePos[1] + 10);

        this.ctx.stroke();
    }

    drawHealth() {
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(20, 540, 200, 40);

        this.ctx.fillStyle = "#32CD32";
        this.ctx.fillRect(20, 540, 200 * (this.game.player.health / 100), 40)

        this.ctx.fillStyle = "black";
        this.ctx.fillText("Health:", 30, 535);
    }
}

module.exports = GameView;