// webpack --watch --mode=development

const GameView = require('./scripts/game_view.js');
// const PlayerCharacter = require('./scripts/player_character.js');


window.addEventListener('DOMContentLoaded', (event) => {
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");

    // const p = new PlayerCharacter([0, 0], [0, 0]);
    // console.log(p);

    const gv = new GameView(ctx);
    console.log(gv);
    gv.start();
});
