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
        this.keyBindHandler();
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
            if (!that.game.player.busy) that.game.player.startAttack(that.mousePos);
        });
    }

    keyBindHandler() {
        let that = this;

        key("f", () => {
            // if (!that.game.player.busy) that.game.player.kick();
        });

        key("space, shift + space", () => {
            if (!that.game.player.busy) that.game.player.roll();
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.game.canvasSizeX, this.game.canvasSizeY);
        this.game.draw(this.ctx);
        this.drawCrosshair();
        this.drawHealthAndEnergy();
    }

    drawCrosshair() {
        this.ctx.strokeStyle = "green";
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();

        this.ctx.moveTo(this.mousePos[0] - 10, this.mousePos[1]);
        this.ctx.lineTo(this.mousePos[0] + 10, this.mousePos[1]);

        this.ctx.moveTo(this.mousePos[0], this.mousePos[1] - 10);
        this.ctx.lineTo(this.mousePos[0], this.mousePos[1] + 10);

        this.ctx.stroke();
    }

    drawHealthAndEnergy() {
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(10, this.game.canvasSizeY - 40, 150, 30);

        this.ctx.fillStyle = "#32CD32";
        this.ctx.fillRect(10, this.game.canvasSizeY - 40, 150 * (this.game.player.health / 100), 30)

        this.ctx.fillStyle = "white";
        this.ctx.fillRect(170, this.game.canvasSizeY - 40, 150, 30);

        this.ctx.fillStyle = "blue";
        this.ctx.fillRect(170, this.game.canvasSizeY - 40, 150 * (this.game.player.energy / 100), 30)

        // this.ctx.fillStyle = "black";
        // this.ctx.font = '20px sans';
        // this.ctx.fillText("Health:", 30, this.game.canvasSizeY - 65);
    }
}

module.exports = GameView;