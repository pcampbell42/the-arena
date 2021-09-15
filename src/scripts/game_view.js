const Game = require("./game.js");


class GameView {
    constructor(ctx) {
        this.ctx = ctx;
        this.mousePos = [0, 0];
        
        // UI elements
        this.healthBar = document.getElementById("health");
        this.energyBar = document.getElementById("energy");
        this.floorCounter = document.getElementById("counter");
        
        // Game variables
        this.game;
        this.firstGame = true;
        this.endCurrentGame = false;
        this.journalist = true;

        // Audio
        this.song;
        this.audioMuted = false;
    }


    /**
     * This method launches the GameView. Loads the main menu.
     */
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


    /**
     * This method is called when the user clicks Play. Launches the Game.
     */
    start() {
        this.game = new Game(this.journalist);
        this.song = new Audio("./dist/assets/music/AEON.mp3");
        this.song.volume = 0.125;
        this.endCurrentGame = false;

        this.keyBindHandler();

        // If it's not the first game, the mouse and menu bar already have event listeners
        if (this.firstGame) {
            this.mouseHandler();
            this.menuBarButtonHandler();
        }
        this.firstGame = false;

        // Start the game loop
        requestAnimationFrame(this.animate.bind(this));
    }


    /**
     * The main Game loop method
     * @returns - Null
     */
    animate() {
        if (this.endCurrentGame) return; // Stops loop if game is ended
        if (!this.audioMuted) this.song.play(); // Play song
        if (!this.game.paused) {
            this.game.step(); // Takes care of game logic
            this.draw(); // Takes care of drawing everything
        }
        if (this.game.player.isDead) this.gameOver(); // End game when player is dead

        requestAnimationFrame(this.animate.bind(this));
    }


    /**
     * One of the two main methods that play the game, called in animate(). Draws
     * high level things (crosshair, UI elements) and then calls Game's draw() method
     * to draw the board.
     */
    draw() {
        this.ctx.clearRect(0, 0, this.game.canvasSizeX, this.game.canvasSizeY);
        this.game.draw(this.ctx);
        this.drawCrosshair();
        this.drawHealthAndEnergy();
        this.drawFloorCounter();
    }


    /**
     * Draws the crosshair
     * @returns - Null
     */
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


    /**
     * Draws the health and energy bars.
     */
    drawHealthAndEnergy() {
        this.healthBar.setAttribute("style", `width: ${200 * this.game.player.health / 100}px;`);
        this.energyBar.setAttribute("style", `width: ${200 * this.game.player.energy / 100}px;`);
    }


    /**
     * Draws the floor counter.
     */
    drawFloorCounter() {
        this.floorCounter.innerHTML = `Floor: ${this.game.currentFloor}`;
    }


    /**
     * Ends the current game and displays the game over banner.
     */
    gameOver() {
        this.endCurrentGame = true;

        const enemiesKilledBanner = document.getElementById("enemies-killed-banner");
        enemiesKilledBanner.innerHTML = `You were on floor ${this.game.currentFloor}`;
        enemiesKilledBanner.classList.toggle("on");
        document.getElementById("game-over-banner").classList.toggle("on");
    }


    /**
     * Basic keybind handler.
     */
    keyBindHandler() {
        let that = this;

        // Note that shift + f and shift + space are also bound - this is so that 
        // the kick and roll keybinds still work while the user is holding down shift
        // to slow down time.
        key("f, shift + f", () => {
            if (!that.game.player.busy) that.game.player.startKick();
        });

        key("space, shift + space", () => {
            if (!that.game.player.busy) that.game.player.roll();
        });
    }


    /**
     * Basic mouse move / click handler.
     */
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


    /**
     * Large method that adds event listeners for all the in-game menu buttons.
     * Could probably be split into a couple methods, but whatever.
     */
    menuBarButtonHandler() {

        // ------------------------ Mute button ------------------------

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


        // ------------------------ Pause button ------------------------

        const canvas = document.getElementById("game-canvas");
        const pauseButton = document.getElementById("pause");
        const pausedBanner = document.getElementById("paused-banner")

        pauseButton.addEventListener("click", (e) => {
            if (this.game.paused) {
                // Gives user back his cursor
                canvas.setAttribute("style", "cursor: none;");
                
                // Toggle highlighted and toggle pause banner
                pauseButton.classList.toggle("on");
                pausedBanner.classList.toggle("on");
                this.game.paused = false;
            } else {
                // Turn cursor back into crosshair
                canvas.setAttribute("style", "cursor: default;");

                // Toggle highlighted and toggle pause banner
                pauseButton.classList.toggle("on");
                pausedBanner.classList.toggle("on");
                this.game.paused = true;
            }
        });


        // ------------------------ Main Menu button ------------------------

        const mainMenuButton = document.getElementById("main-menu")
        const menuDisplay = document.getElementById("menu-display");
        const gameDisplay = document.getElementById("game-display");

        mainMenuButton.addEventListener("click", () => {
            // Reset mute and pause so that if user plays another game, it doesn't
            // open as muted or open as paused.
            if (this.audioMuted) muteButton.click();
            if (this.game.paused) pauseButton.click();
            
            // Toggle main menu
            menuDisplay.classList.toggle("hidden");
            gameDisplay.classList.toggle("play");

            // 
            // document.getElementById("enemies-killed-banner").classList.toggle("on");
            // document.getElementById("game-over-banner").classList.toggle("on");

            // Pause song, endCurrentGame, and reset Game object
            this.song.pause();
            this.endCurrentGame = true;
            this.game = null;

            // Unbind key handlers
            key.unbind("space");
            key.unbind("f");

            // Call initial GameView method
            this.launch();
        });


        // ------------------------ Controls button ------------------------

        const controlsButton = document.getElementById("controls");
        const controlsMenu = document.getElementById("controls-container")

        controlsButton.addEventListener("click", (e) => {
            if (this.game.paused) {
                controlsButton.classList.toggle("on");
                controlsMenu.classList.toggle("show");
            } else {
                controlsButton.classList.toggle("on");
                controlsMenu.classList.toggle("show");
            }
        });
    }


    /**
     * Large method that adds event listeners for all the main menu buttons. Could
     * probably be split into a couple methods, but whatever.
     */
    mainMenuButtonHandlers() {
        // ------------------------ Play button ------------------------
        const playButton = document.getElementById("menu-play-button");
        const menuDisplay = document.getElementById("menu-display");
        const gameDisplay = document.getElementById("game-display");

        playButton.addEventListener("click", (e) => {
            // Turn the in-game display on
            menuDisplay.classList.toggle("hidden");
            gameDisplay.classList.toggle("play");

            // Making sure the game over and enemies-killed banners are off 
            const gameOverDisplay = document.getElementById("game-over-banner");
            const floor = document.getElementById("enemies-killed-banner");
            if (gameOverDisplay.classList.length === 1) gameOverDisplay.classList.toggle("on");
            if (floor.classList.length === 1) floor.classList.toggle("on");

            // Start music
            this.song.pause();
            this.start();
        });


        // ------------------------ Mute button ------------------------

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


        // ------------------------ Difficulty button ------------------------

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
