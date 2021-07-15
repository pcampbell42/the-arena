class Room {
    constructor(params) {
        this.tileset = new Image();
        this.tileset.src = "./dist/assets/scifi_tileset.png";
        
        // WTB CLASS VARIABLES
        this.possibleTileSets = [
            [[0, 288], [32, 288], [64, 288], [128, 288], [160, 288], [190, 288], [222, 288], [190, 320], [128, 355], [222, 320]], 
            [[0, 320], [32, 320], [64, 320], [96, 320], [128, 320], [160, 320], [96, 355]],
            [[0, 288], [32, 288], [64, 288], [128, 288], [160, 288], [0, 288], [32, 288], [64, 288], [128, 288], [160, 288], [0, 288], [32, 288], [64, 288], [128, 288], [160, 288], [96, 288]],
            [[0, 320], [32, 320], [64, 320], [96, 320], [160, 355], [0, 320], [32, 320], [64, 320], [96, 320], [0, 320], [32, 320], [64, 320], [96, 320], [0, 320], [32, 320], [64, 320], [96, 320]],
            [[64, 320], [96, 320], [128, 320], [160, 320], [96, 355], [190, 355], [64, 320], [96, 320], [128, 320], [160, 320], [64, 320], [96, 320], [128, 320], [160, 320]],
            [[0, 288], [32, 288], [64, 288], [128, 288], [160, 288], [190, 288], [222, 288], [222, 355], [0, 288], [32, 288], [64, 288], [128, 288], [160, 288], [0, 288], [32, 288], [64, 288], [128, 288], [160, 288]]
        ];

        this.chosenTileSet = this.possibleTileSets[Math.floor(Math.random() * (this.possibleTileSets.length - 1))];

        this.numRows = Math.floor(params["canvasSizeY"] / 40);
        this.numCols = Math.floor(params["canvasSizeX"] / 40);
        this.roomTiles = this.makeRoom();

        this.doorPosition = Math.floor(this.numCols / 2) * 40;
        this.doorOpened = false;
    }

    makeRoom() {
        // 8 tiles per row in image
        let roomTilePositions = [];
        for (let i = 0; i < this.numRows; i++) {
            let row = [];
            for (let j = 0; j < this.numCols; j++) {
                if (i === 0 && j === 0) {
                    row.push([0, 32]);
                } else if (i === 0 && j === (this.numCols - 1)) {
                    row.push([128, 32]);
                } else if (i === (this.numRows - 1) && j === 0) {
                    row.push([0, 96]);
                } else if (i === (this.numRows - 1) && j === (this.numCols - 1)) {
                    row.push([128, 96]);
                } else if (i === 0 && j === Math.floor(this.numCols / 2)) {
                    row.push([128, 128]);
                } else if (j === 0) {
                    row.push([0, 56]);
                } else if (j === ( this.numCols - 1) ) {
                    row.push([128, 56]);
                } else if (i === 0) {
                    row.push([ Math.floor(Math.random() * 7) * 32, 256]);
                } else if (i === ( this.numRows - 1) ) {
                    row.push([0, 192]);
                } else {
                    row.push(this.chosenTileSet[Math.floor(Math.random() * (this.chosenTileSet.length))]);
                }
            }
            roomTilePositions.push(row);
        }
        return roomTilePositions;
    }

    draw(ctx) {
        if (this.doorOpened) this.roomTiles[0][Math.floor(this.numCols / 2)] = this.roomTiles[5][5];
        for (let i = 0; i < this.numRows; i++) {
            for (let j = 0; j < this.numCols; j++) {
                ctx.drawImage(this.tileset, this.roomTiles[i][j][0], this.roomTiles[i][j][1], 32, 32, 40 * j, 40 * i, 40, 40);
            }
        }
        if (this.doorOpened) ctx.drawImage(this.tileset, 128, 160, 32, 32, 40 * Math.floor(this.numCols / 2), 0, 40, 40);
    }
}

module.exports = Room;