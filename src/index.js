// webpack --watch --mode=development

const GameView = require('./scripts/game_view.js');


/**
 * Base method that creates a GameView and launches it once the DOM content is loaded.
 */
window.addEventListener('DOMContentLoaded', (event) => {
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");

    const gv = new GameView(ctx);
    gv.launch();
});
