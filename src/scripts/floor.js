
class Floor {
    constructor(params) {
        this.tileset = new Image();
        this.tileset.src = "./dist/assets/scifi_tileset.png";
        
        // Positions of possible ground tiles in the tileset image. They're grouped 
        // into sets so that the ground doesn't look super weird (aka, red, blue, yellow, 
        // etc. colors of tiles on one floor - it's visually overwhelming). makeFloorTemplate()
        // then uses one of these sets to create the basic template for a floor.
        this.possibleFloorTiles = [
            [[0, 288], [32, 288], [64, 288], [128, 288], [160, 288], [190, 288], [222, 288], [190, 320], 
                [128, 355], [222, 320]], 
            [[0, 320], [32, 320], [64, 320], [96, 320], [128, 320], [160, 320], [96, 355]],
            [[0, 288], [32, 288], [64, 288], [128, 288], [160, 288], [0, 288], [32, 288], [64, 288], 
                [128, 288], [160, 288], [0, 288], [32, 288], [64, 288], [128, 288], [160, 288], [96, 288]],
            [[0, 320], [32, 320], [64, 320], [96, 320], [160, 355], [0, 320], [32, 320], [64, 320], [96, 320], 
                [0, 320], [32, 320], [64, 320], [96, 320], [0, 320], [32, 320], [64, 320], [96, 320]],
            [[64, 320], [96, 320], [128, 320], [160, 320], [96, 355], [190, 355], [64, 320], [96, 320], 
                [128, 320], [160, 320], [64, 320], [96, 320], [128, 320], [160, 320]],
            [[0, 288], [32, 288], [64, 288], [128, 288], [160, 288], [190, 288], [222, 288], [222, 355], [0, 288], 
                [32, 288], [64, 288], [128, 288], [160, 288], [0, 288], [32, 288], [64, 288], [128, 288], [160, 288]]
        ];
        // Chooses one of the tile sets from possibleFloorTiles
        this.chosenTileSet = this.possibleFloorTiles[Math.floor(Math.random() * (this.possibleFloorTiles.length - 1))];

        // Number of tiles based on canvas size
        this.numRows = Math.floor(params["canvasSizeY"] / 40);
        this.numCols = Math.floor(params["canvasSizeX"] / 40);

        // Creates template, picks which floor to use
        this.floorTiles = this.makeFloorTemplate();
        params["floorNum"] === 1 ? this.floorTiles = this.makeStartingFloor() : null;

        // Door related variables
        this.doorPosition = Math.floor(this.numCols / 2) * 40;
        this.doorOpened = false;
    }


    /**
     * Basic draw method for a floor.
     * @param {CanvasRenderingContext2D} ctx - 2D Canvas to draw on
     */
    draw(ctx) {
        // If door is opened, replace the wall tile with a "random" ground tile
        if (this.doorOpened) this.floorTiles[0][Math.floor(this.numCols / 2)] = this.floorTiles[5][5];

        // Draw each tile
        for (let i = 0; i < this.numRows; i++) {
            for (let j = 0; j < this.numCols; j++) {
                ctx.drawImage(this.tileset, this.floorTiles[i][j][0], this.floorTiles[i][j][1], 32, 32, 40 * j, 40 * i, 40, 40);
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
                    row.push([0, 32]);
                } 
                // Adds the top right corner wall tile
                else if (i === 0 && j === (this.numCols - 1)) {
                    row.push([128, 32]);
                } 
                // Adds the bottom left corner wall tile
                else if (i === (this.numRows - 1) && j === 0) {
                    row.push([0, 96]);
                }
                // Adds the bottom right corner wall tile
                else if (i === (this.numRows - 1) && j === (this.numCols - 1)) {
                    row.push([128, 96]);
                }
                // Adds the top door
                else if (i === 0 && j === Math.floor(this.numCols / 2)) {
                    row.push([128, 128]);
                }
                // Adds the first starting doorway tile
                else if (i === (this.numRows - 3) && j === 0) {
                    row.push([32, 32]);
                }
                // Adds the second starting doorway tile
                else if (i === (this.numRows - 2) && j === 0) {
                    row.push(this.chosenTileSet[Math.floor(Math.random() * (this.chosenTileSet.length))]);
                }
                // Adds the left walls
                else if (j === 0) {
                    row.push([0, 56]);
                }
                // Adds the right walls
                else if (j === ( this.numCols - 1) ) {
                    row.push([128, 56]);
                }
                // Adds the top walls
                else if (i === 0) {
                    row.push([ Math.floor(Math.random() * 7) * 32, 256]);
                }
                // Adds the bottom walls
                else if (i === ( this.numRows - 1) ) {
                    row.push([0, 192]);
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
     * Method that finalizes the tiles for the first floor.
     * @returns - New Array of tiles for a floor
     */
    makeStartingFloor() {
        let newFloorTiles = this.floorTiles;
        for (let i = 0; i < this.floorTiles.length; i++) {
            for (let j = 0; j < this.floorTiles[0].length; j++) {

                // -------------- Adding bottom left wall segment --------------

                // Bottom row of wall
                if (i === this.floorTiles.length - 3 && j < Math.floor(this.floorTiles[0].length / 2) + 1) {
                    this.floorTiles[i][j] = [Math.floor(Math.random() * 7) * 32, 256];
                }

                // Bottom right corner of wall
                else if (i === this.floorTiles.length - 3 && j === Math.floor(this.floorTiles[0].length / 2) + 1) {
                    this.floorTiles[i][j] = [32, 32];
                }
            }
        }

        return newFloorTiles;
    }
    

    /**
     * Method that finalizes the tiles for the floor. Version 1.
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
     * Method that finalizes the tiles for the floor. Version 2.
     * @returns New array of tiles for a floor
     */
    makeFloorV2() {
        let newFloorTiles = this.floorTiles;

        for (let i = 0; i < this.floorTiles.length; i++) {
            for (let j = 0; j < this.floorTiles[0].length; j++) {

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
     * Method that finalizes the tiles for the floor. Version 6.
     * @returns New array of tiles for a floor
     */
    makeFloorV6() {
        let newFloorTiles = this.floorTiles;

        for (let i = 0; i < this.floorTiles.length; i++) {
            for (let j = 0; j < this.floorTiles[0].length; j++) {

            }
        }

        return newFloorTiles;
    }


    /**
     * Method that finalizes the tiles for the floor. Version 7.
     * @returns New array of tiles for a floor
     */
    makeFloorV7() {
        let newFloorTiles = this.floorTiles;

        for (let i = 0; i < this.floorTiles.length; i++) {
            for (let j = 0; j < this.floorTiles[0].length; j++) {

            }
        }

        return newFloorTiles;
    }


    /**
     * Method that finalizes the tiles for the floor. Version 8.
     * @returns New array of tiles for a floor
     */
    makeFloorV8() {
        let newFloorTiles = this.floorTiles;

        for (let i = 0; i < this.floorTiles.length; i++) {
            for (let j = 0; j < this.floorTiles[0].length; j++) {

            }
        }

        return newFloorTiles;
    }


    /**
     * Method that finalizes the tiles for the floor. Version 9.
     * @returns New array of tiles for a floor
     */
    makeFloorV9() {
        let newFloorTiles = this.floorTiles;

        for (let i = 0; i < this.floorTiles.length; i++) {
            for (let j = 0; j < this.floorTiles[0].length; j++) {

            }
        }

        return newFloorTiles;
    }


    /**
     * Method that finalizes the tiles for the floor. Version 10.
     * @returns New array of tiles for a floor
     */
    makeFloorV10() {
        let newFloorTiles = this.floorTiles;

        for (let i = 0; i < this.floorTiles.length; i++) {
            for (let j = 0; j < this.floorTiles[0].length; j++) {

            }
        }

        return newFloorTiles;
    }
}


module.exports = Floor;
