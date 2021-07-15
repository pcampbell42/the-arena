// webpack --watch --mode=development

const GameView = require('./scripts/game_view.js');

window.addEventListener('DOMContentLoaded', (event) => {
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");

    const gv = new GameView(ctx);
    gv.launch();
});
