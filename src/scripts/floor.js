// The file of despair, enter at your own risk

const SpecialTile = require("./special_tile.js");


class Floor {
    constructor(params) {
        this.tileset = new Image();
        this.tileset.src = "./dist/assets/scifi_tileset.png";

        this.altTilset = new Image();
        this.altTilset.src = "./dist/assets/tileset.png";
        
        // Positions of possible ground tiles in the tileset image. They're grouped 
        // into sets so that the ground doesn't look super weird (aka, red, blue, yellow, 
        // etc. colors of tiles on one floor - it's visually overwhelming). makeFloorTemplate()
        // then uses one of these sets to create the basic template for a floor.
        this.possibleGroundTiles = [
            [[0, 288], [32, 288], [64, 288], [128, 288], [160, 288], [192, 288], [222, 288], [192, 320], 
                [128, 352], [222, 320]], 
            [[0, 320], [32, 320], [64, 320], [96, 320], [128, 320], [160, 320], [96, 352]],
            [[0, 288], [32, 288], [64, 288], [128, 288], [160, 288], [0, 288], [32, 288], [64, 288], 
                [128, 288], [160, 288], [0, 288], [32, 288], [64, 288], [128, 288], [160, 288], [96, 288]],
            [[0, 320], [32, 320], [64, 320], [96, 320], [160, 352], [0, 320], [32, 320], [64, 320], [96, 320], 
                [0, 320], [32, 320], [64, 320], [96, 320], [0, 320], [32, 320], [64, 320], [96, 320]],
            [[64, 320], [96, 320], [128, 320], [160, 320], [96, 352], [192, 352], [64, 320], [96, 320], 
                [128, 320], [160, 320], [64, 320], [96, 320], [128, 320], [160, 320]],
            [[0, 288], [32, 288], [64, 288], [128, 288], [160, 288], [192, 288], [222, 288], [222, 352], [0, 288], 
                [32, 288], [64, 288], [128, 288], [160, 288], [0, 288], [32, 288], [64, 288], [128, 288], [160, 288]]
        ];
        // Chooses one of the tile sets from possibleGroundTiles
        this.chosenTileSet = this.possibleGroundTiles[Math.floor(Math.random() * (this.possibleGroundTiles.length - 1))];

        // Number of tiles based on canvas size
        this.numRows = Math.floor(params["canvasSizeY"] / 40);
        this.numCols = Math.floor(params["canvasSizeX"] / 40);

        // Creates template, picks which floor to use
        this.floorTiles = this.makeFloorTemplate();
        params["floorNum"] === 1 ? this.floorTiles = this.makeFloorV2() : null;

        // Door related variables
        this.doorPosition = Math.floor(this.numCols / 2) * 40;
        this.doorOpened = false;
        this.extraDoorIndex = [];
        this.extraDoorOpen = false;
    }


    /**
     * Basic draw method for a floor.
     * @param {CanvasRenderingContext2D} ctx - 2D Canvas to draw on
     */
    draw(ctx) {
        // If door is opened, replace the wall tile with a "random" ground tile
        if (this.doorOpened) this.floorTiles[0][Math.floor(this.numCols / 2)] = this.floorTiles[this.numRows - 2][0].position;

        // Draw each tile
        for (let i = 0; i < this.numRows; i++) {
            for (let j = 0; j < this.numCols; j++) {
                let currentTile = this.floorTiles[i][j];

                if (currentTile instanceof SpecialTile) {
                    // Pit images come from different tileset
                    if (currentTile.type === "pit") {
                        ctx.drawImage(this.altTilset, currentTile.position[0], currentTile.position[1], 32, 32, 40 * j, 40 * i, 40, 40 );
                    } else {
                        ctx.drawImage(this.tileset, currentTile.position[0], currentTile.position[1], 32, 32, 40 * j, 40 * i, 40, 40);
                    }
                } 
                // Some tiles require background tiles, and thus are arrays of 2 tiles to be drawn on top of each other
                else if (currentTile.length === 2 && currentTile[0] instanceof Array) {
                    // First tile is always a normal ground tile
                    ctx.drawImage(this.tileset, currentTile[0][0], currentTile[0][1], 32, 32, 40 * j, 40 * i, 40, 40);
                    // Second tile is always a SpecialTile
                    ctx.drawImage(this.tileset, currentTile[1].position[0], currentTile[1].position[1], 32, 32, 40 * j, 40 * i, 40, 40);


                } else {
                    ctx.drawImage(this.tileset, currentTile[0], currentTile[1], 32, 32, 40 * j, 40 * i, 40, 40);
                }

            }
        }

        // Draw opened door (to previous room) on top of ground tile
        ctx.drawImage(this.tileset, 160, 128, 32, 64, 0, 40 * Math.floor(this.numRows) - 120, 40, 80)

        // If door is opened, draw the opened door on top of the random ground tile picked above
        if (this.doorOpened) ctx.drawImage(this.tileset, 128, 160, 32, 32, 40 * Math.floor(this.numCols / 2), 0, 40, 40);
    }


    /**
     * Method that picks tiles and creates the basic template for a floor. The result
     * is a wall on the edges, a door to the next floor, a starting doorway, and a
     * randomly picked layout of ground tiles. This is then used as a starting point
     * for each floor template - the relevant ground tiles are replaced with walls,
     * pits, etc.
     * @returns - Array of tiles for a floor
     */
    makeFloorTemplate() {
        let floorTilePositions = [];
        for (let i = 0; i < this.numRows; i++) {

            let row = [];
            for (let j = 0; j < this.numCols; j++) {
                // Adds the top left corner wall tile
                if (i === 0 && j === 0) {
                    row.push(new SpecialTile({ position: [0, 32], type: "wall" }));
                } 
                // Adds the top right corner wall tile
                else if (i === 0 && j === (this.numCols - 1)) {
                    row.push(new SpecialTile({ position: [128, 32], type: "wall" }));
                } 
                // Adds the bottom left corner wall tile
                else if (i === (this.numRows - 1) && j === 0) {
                    row.push(new SpecialTile({ position: [0, 96], type: "wall" }));
                }
                // Adds the bottom right corner wall tile
                else if (i === (this.numRows - 1) && j === (this.numCols - 1)) {
                    row.push(new SpecialTile({ position: [128, 96], type: "wall" }));
                }
                // Adds the top door
                else if (i === 0 && j === Math.floor(this.numCols / 2)) {
                    // Note that this is a door with the type: "wall"... it should act as a wall
                    row.push(new SpecialTile({ position: [128, 128], type: "wall" })); 
                }
                // Adds the first starting doorway tile
                else if (i === (this.numRows - 3) && j === 0) {
                    row.push(new SpecialTile({ position: [32, 32], type: "wall" }));
                }
                // Adds the second starting doorway tile
                else if (i === (this.numRows - 2) && j === 0) {
                    // Note that this is a tile with the type: "wall"... it should act as a wall
                    // row.push(this.chosenTileSet[Math.floor(Math.random() * (this.chosenTileSet.length))]);
                    let randFloorTilePos = this.chosenTileSet[Math.floor(Math.random() * (this.chosenTileSet.length))];
                    row.push(new SpecialTile({
                        position: [randFloorTilePos[0], randFloorTilePos[1]],
                        type: "wall"
                    }));
                }
                // Adds the left walls
                else if (j === 0) {
                    row.push(new SpecialTile({ position: [0, 56], type: "wall" }));
                }
                // Adds the right walls
                else if (j === ( this.numCols - 1) ) {
                    row.push(new SpecialTile({ position: [128, 56], type: "wall" }));
                }
                // Adds the top walls
                else if (i === 0) {
                    row.push(this._selectRandomTopWallTile());
                }
                // Adds the bottom walls
                else if (i === ( this.numRows - 1) ) {
                    row.push(new SpecialTile({ position: [0, 192], type: "wall" }));
                }
                // Adds a random ground tile from tileset
                else {
                    row.push(this.chosenTileSet[Math.floor(Math.random() * (this.chosenTileSet.length))]);
                }
            }
            floorTilePositions.push(row);
        }
        return floorTilePositions;
    }


    /**
     * Method that finalizes the tiles for the floor. Version 2.
     * @returns New array of tiles for a floor
     */
    makeFloorV1() {
        let newFloorTiles = this.floorTiles;

        for (let i = 0; i < this.floorTiles.length; i++) {
            for (let j = 0; j < this.floorTiles[0].length; j++) {

            }
        }

        return newFloorTiles;
    }

    /**
     * Method that finalizes the tiles for the first floor.
     * @returns - New Array of tiles for a floor
     */
    makeFloorV2() {
        let newFloorTiles = this.floorTiles;
        for (let i = 0; i < this.floorTiles.length; i++) {
            for (let j = 0; j < this.floorTiles[0].length; j++) {

                // -------------- Adding bottom left wall segment --------------
                // Bottom row of wall
                if (i === this.floorTiles.length - 3 && j < Math.floor(this.floorTiles[0].length / 2) + 1) {
                    this.floorTiles[i][j] = this._selectRandomTopWallTile();

                }
                // Bottom right corner of wall
                else if (i === this.floorTiles.length - 3 && j === Math.floor(this.floorTiles[0].length / 2) + 1) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [32, 32], type: "wall" })
                    ];
                }
                // Middle row of wall
                else if (i === this.floorTiles.length - 4 && j < Math.floor(this.floorTiles[0].length / 2) + 1) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [0, 0], type: "wall" });
                }
                // Middle right corner of wall
                else if (i === this.floorTiles.length - 4 && j === Math.floor(this.floorTiles[0].length / 2) + 1) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [0, 64], type: "wall" });
                }
                // Top left corner of wall
                else if (i === this.floorTiles.length - 5 && j === 0) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [0, 96], type: "wall" });
                }
                // Top row of wall
                else if (i === this.floorTiles.length - 5 && j < Math.floor(this.floorTiles[0].length / 2) + 1) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [0, 192], type: "wall" });
                }
                // Top right corner of wall
                else if (i === this.floorTiles.length - 5 && j === Math.floor(this.floorTiles[0].length / 2) + 1) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [32, 96], type: "wall" })
                    ];
                }

                // -------------- Adding pit segment --------------
                // Completely black pit
                else if ((i === 5 && j > 2 && j < 6) || (i === 4 && j > 2 && j < 6) || (i === 3 && j > 2 && j < 6)) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [32, 128], type: "pit" });
                }
                // Top of pit
                else if (i === 2 && j > 2 && j < 6) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [192, 96], type: "pit" });
                }
                // Top left corner of pit
                else if (i === 2 && j === 2) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [160, 96], type: "pit" });
                }
                // Top right corner of pit
                else if (i === 2 && j === 6) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [224, 96], type: "pit" });
                }
                // Right side of pit
                else if (i > 2 && i < 6 && j === 6) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [224, 128], type: "pit" });
                }
                // Left side of pit
                else if (i > 2 && i < 6 && j === 2) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [160, 128], type: "pit" });
                }

                // -------------- Adding top right wall segment --------------
                // Right top wall
                else if (i === 3 && j < this.numCols - 1 && j > this.numCols - 7) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [0, 192], type: "wall" });
                }
                // Right bottom wall
                else if (i === 4 && j < this.numCols - 2 && j > this.numCols - 7) {
                    this.floorTiles[i][j] = this._selectRandomTopWallTile();
                }
                // Right top corner
                else if (i === 3 && j === this.numCols - 1) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [128, 96], type: "wall" });
                }
                // Right bottom corner
                else if (i === 4 && j === this.numCols - 2) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [102, 32], type: "wall" });
                }
                else if (i === 4 && j === this.numCols - 1) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [0, 0], type: "wall" })
                }
                // Door right top corner
                else if (i === 3 && j === this.numCols - 7) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [96, 96], type: "wall" })
                    ];
                }
                // Door right bottom corner
                else if (i === 4 && j === this.numCols - 7) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [96, 32], type: "wall" })
                    ];
                }
                // Door left top corner
                else if (i === 3 && j === this.numCols - 9) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [32, 96], type: "wall" })
                    ];
                }
                // Door left bottom corner
                else if (i === 4 && j === this.numCols - 9) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [32, 32], type: "wall" })
                    ];
                }
                // Top left top corner
                else if (i === 3 && j === this.numCols - 10) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [96, 96], type: "wall" })
                    ];
                }
                // Top left bottom corner
                else if (i === 4 && j === this.numCols - 10) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [96, 32], type: "wall" })
                    ];
                }
                // Top left single wall top
                else if (i === 1 && j === this.numCols - 10) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 32], type: "wall" })
                    ];
                }
                // Top left single wall bottom
                else if (i === 2 && j === this.numCols - 10) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 96], type: "wall" })
                    ];
                }
                // Extra door
                else if (i === 3 && j === this.numCols - 8) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [128, 128], type:"wall" })
                    ];
                    this.extraDoorIndex = [3, this.numCols - 8];
                }
            }



        }

        return newFloorTiles;
    }


    /**
     * Method that finalizes the tiles for the floor. Version 3.
     * @returns New array of tiles for a floor
     */
    makeFloorV3() {
        let newFloorTiles = this.floorTiles;

        for (let i = 0; i < this.floorTiles.length; i++) {
            for (let j = 0; j < this.floorTiles[0].length; j++) {

            }
        }

        return newFloorTiles;
    }


    /**
     * Method that finalizes the tiles for the floor. Version 4.
     * @returns New array of tiles for a floor
     */
    makeFloorV4() {
        let newFloorTiles = this.floorTiles;

        for (let i = 0; i < this.floorTiles.length; i++) {
            for (let j = 0; j < this.floorTiles[0].length; j++) {

            }
        }

        return newFloorTiles;
    }


    /**
     * Method that finalizes the tiles for the floor. Version 5.
     * @returns New array of tiles for a floor
     */
    makeFloorV5() {
        let newFloorTiles = this.floorTiles;

        for (let i = 0; i < this.floorTiles.length; i++) {
            for (let j = 0; j < this.floorTiles[0].length; j++) {

            }
        }

        return newFloorTiles;
    }


    /**
     * Helper method that selects a random top wall tile. Need this so that we can use
     * 1 tile that requires a background tile.
     */
    _selectRandomTopWallTile() {
        let topWallTileXPosition = Math.floor(Math.random() * 7) * 32;
        if (topWallTileXPosition !== 32) {
            return new SpecialTile({ position: [topWallTileXPosition, 256], type: "wall" })
        } else {
            let randFloorTilePos = this.chosenTileSet[Math.floor(Math.random() * (this.chosenTileSet.length))];
            return [
                randFloorTilePos,
                new SpecialTile({ position: [topWallTileXPosition, 256], type: "wall" })
            ];
        }
    }
}


module.exports = Floor;
