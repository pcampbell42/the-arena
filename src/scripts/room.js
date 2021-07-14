class Room {
    constructor(params) {
        this.tileset = new Image();
        this.tileset.src = "./dist/assets/scifi_tileset.png";
        this.darkGrayTilePositions = [[0, 288], [32, 288], [64, 288], [128, 288], [160, 288], [190, 288], [222, 288], [190, 320], [128, 355], [222, 320]];
        this.lightGrayTilePositions = [[0, 320], [32, 320], [64, 320], [96, 320], [128, 320], [160, 320], [96, 355]];
        this.otherFloorTilePositions = [[96, 288], [160, 355], [190, 355], [222, 355]];

        this.numRows = Math.floor(params["canvasSizeY"] / 40);
        this.numCols = Math.floor(params["canvasSizeX"] / 40);
        this.roomTiles = this.makeRoom();
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
                } else if (j === 0) {
                    row.push([0, 56]);
                } else if (j === ( this.numCols - 1) ) {
                    row.push([128, 56]);
                } else if (i === 0) {
                    row.push([ Math.floor(Math.random() * 7) * 32, 256]);
                } else if (i === ( this.numRows - 1) ) {
                    row.push([0, 192]);
                } else {
                    row.push(this.darkGrayTilePositions[Math.floor(Math.random() * 8)]);
                }
            }
            roomTilePositions.push(row);
        }
        return roomTilePositions;
    }

    draw(ctx) {
        for (let i = 0; i < this.numRows; i++) {
            for (let j = 0; j < this.numCols; j++) {
                ctx.drawImage(this.tileset, this.roomTiles[i][j][0], this.roomTiles[i][j][1], 32, 32, 40 * j, 40 * i, 40, 40);
            }
        }
    }
}

module.exports = Room;