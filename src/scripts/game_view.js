const Game = require("./game.js");

class GameView {
    constructor(ctx) {
        this.ctx = ctx;
        this.game;
        this.mousePos = [0, 0];

        this.healthBar = document.getElementById("health");
        this.energyBar = document.getElementById("energy");
        this.enemyKillCounter = document.getElementById("counter");

        this.song;
        this.audioMuted = false;
        this.endCurrentGame = false;
        
        this.firstGame = true;
        this.journalist = true;
    }

    launch() {
        this.song = new Audio("./dist/assets/music/star_eater.mp3");
        this.song.volume = 0.125;

        // Weird authorization error for playing music on initial launch
        if (!this.firstGame) {
            this.song.play();
            this.audioMuted = false;
        }

        if (this.firstGame) this.mainMenuButtonHandlers();
    }

    start() {
        this.game = new Game(this.journalist);
        this.song = new Audio("./dist/assets/music/AEON.mp3");
        this.song.volume = 0.125;
        this.endCurrentGame = false;

        this.keyBindHandler();

        if (this.firstGame) {
            this.mouseHandler();
            this.menuBarButtonHandler();
        }
        this.firstGame = false;

        this.lastTime = 0;
        requestAnimationFrame(this.animate.bind(this));
    }

    animate() {
        if (this.endCurrentGame) return;
        
        if (!this.audioMuted && !this.game.paused) this.song.play();
        if (!this.game.paused){
            this.game.step();
            this.draw();
        }

        if (this.game.player.isDead) this.gameOver();

        requestAnimationFrame(this.animate.bind(this));
    }

    draw() {
        this.ctx.clearRect(0, 0, this.game.canvasSizeX, this.game.canvasSizeY);
        this.game.draw(this.ctx);
        this.drawCrosshair();
        this.drawHealthAndEnergy();
        this.drawKillCounter();
    }

    drawCrosshair() {
        if (!document.getElementById("game-canvas").matches(":hover")) return;

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
        this.healthBar.setAttribute("style", `width: ${200 * this.game.player.health / 100}px;`);
        this.energyBar.setAttribute("style", `width: ${200 * this.game.player.energy / 100}px;`);
    }

    drawKillCounter() {
        this.enemyKillCounter.innerHTML = `Floor: ${this.game.currentFloor}`;
    }

    gameOver() {
        this.endCurrentGame = true;

        const enemiesKilledBanner = document.getElementById("enemies-killed-banner");
        enemiesKilledBanner.innerHTML = `You were on the floor ${this.game.currentFloor}`;
        enemiesKilledBanner.classList.toggle("on");
        document.getElementById("game-over-banner").classList.toggle("on");
    }

    keyBindHandler() {
        let that = this;

        key("f, shift + f", () => {
            if (!that.game.player.busy) that.game.player.startKick();
        });

        key("space, shift + space", () => {
            if (!that.game.player.busy) that.game.player.roll();
        });
    }

    mouseHandler() {
        let that = this;
        const canvas = document.getElementById("game-canvas");

        canvas.onmousemove = (e) => {
            let offsetX = (window.innerWidth - this.game.canvasSizeX) / 2;
            let offsetY = (window.innerHeight - this.game.canvasSizeY) / 2;
            that.mousePos = [e.clientX - offsetX, e.clientY - offsetY]
        }

        canvas.addEventListener("click", (e) => {
            if (!that.game.player.busy) that.game.player.startAttack(that.mousePos);
        });
    }

    menuBarButtonHandler() {
        const muteButton = document.getElementById("mute");

        muteButton.addEventListener("click", () => {
            if (this.audioMuted) {
                this.song.play();
                muteButton.classList.toggle("on");
                this.audioMuted = false;
            } else {
                this.song.pause();
                muteButton.classList.toggle("on");
                this.audioMuted = true;
            }
        });


        const canvas = document.getElementById("game-canvas");
        const pauseButton = document.getElementById("pause");
        const pausedBanner = document.getElementById("paused-banner")

        pauseButton.addEventListener("click", (e) => {
            if (this.game.paused) {
                canvas.setAttribute("style", "cursor: none;");
                pauseButton.classList.toggle("on");
                pausedBanner.classList.toggle("on");
                // this.song.play();
                this.game.paused = false;
            } else {
                canvas.setAttribute("style", "cursor: default;");
                pauseButton.classList.toggle("on");
                pausedBanner.classList.toggle("on");
                // this.song.pause();
                this.game.paused = true;
            }
        });


        const mainMenuButton = document.getElementById("main-menu")
        const menuDisplay = document.getElementById("menu-display");
        const gameDisplay = document.getElementById("game-display");

        mainMenuButton.addEventListener("click", () => {
            if (this.audioMuted) muteButton.click();
            if (this.game.paused) pauseButton.click();
            
            menuDisplay.classList.toggle("hidden");
            gameDisplay.classList.toggle("play");
            document.getElementById("enemies-killed-banner").classList.toggle("on");
            document.getElementById("game-over-banner").classList.toggle("on");

            this.song.pause();
            this.endCurrentGame = true;
            this.game = null;

            key.unbind("space");
            key.unbind("f");


            this.launch();
        });


        const controlsButton = document.getElementById("controls");
        const controlsMenu = document.getElementById("controls-container")

        controlsButton.addEventListener("click", (e) => {
            if (this.game.paused) {
                controlsButton.classList.toggle("on");
                controlsMenu.classList.toggle("show");
                // pauseButton.click();
            } else {
                controlsButton.classList.toggle("on");
                controlsMenu.classList.toggle("show");
                // pauseButton.click();
            }
        });
    }

    mainMenuButtonHandlers() {
        const playButton = document.getElementById("menu-play-button");
        const menuDisplay = document.getElementById("menu-display");
        const gameDisplay = document.getElementById("game-display");

        playButton.addEventListener("click", (e) => {
            menuDisplay.classList.toggle("hidden");
            gameDisplay.classList.toggle("play");

            const gameOverDisplay = document.getElementById("game-over-banner");
            const floor = document.getElementById("enemies-killed-banner");
            if (gameOverDisplay.classList.length === 1) gameOverDisplay.classList.toggle("on");
            if (floor.classList.length === 1) floor.classList.toggle("on");

            this.song.pause();
            this.start();
        });

        const muteButton = document.getElementById("menu-mute-button");

        muteButton.addEventListener("click", (e) => {
            if (this.audioMuted) {
                this.song.play();
                muteButton.classList.toggle("on");
                this.audioMuted = false;
            } else {
                this.song.pause();
                muteButton.classList.toggle("on");
                this.audioMuted = true;
            }
        })

        const journalistButton = document.getElementById("menu-difficulty-selector");

        journalistButton.addEventListener("click", (e) => {
            if (journalistButton.innerHTML === "Journalist") {
                journalistButton.innerHTML = "Hard";
                this.journalist = false;
            } else {
                journalistButton.innerHTML = "Journalist";
                this.journalist = true;

            }
        })
    }
}

module.exports = GameView;