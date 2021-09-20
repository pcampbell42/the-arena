// The file of despair, enter at your own risk

const SpecialTile = require("./special_tile.js");


class Floor {
    constructor(params) {
        this.tileset = new Image();
        this.tileset.src = "./dist/assets/scifi_tileset.png";

        this.altTilset = new Image();
        this.altTilset.src = "./dist/assets/tileset.png";

        this.switchOn = new Image();
        this.switchOn.src = "./dist/assets/switch2.png";

        this.switchOff = new Image();
        this.switchOff.src = "./dist/assets/switch0.png";
        
        // Positions of possible ground tiles in the tileset image. They're grouped 
        // into sets so that the ground doesn't look super weird (aka, red, blue, yellow, 
        // etc. colors of tiles on one floor - it's visually overwhelming). makeFloorTemplate()
        // then uses one of these sets to create the basic template for a floor. This could definitely
        // be refactored into its own class with properties such as tile color, gridTile, etc.
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

        // Next room door related variables
        this.doorPosition = Math.floor(this.numCols / 2) * 40;
        this.doorOpened = false;

        // Extra door related variables
        this.hasExtraDoor = false;
        this.extraDoorPosition = [];
        this.extraDoorOpen = false;
        this.switchPosition = [];

        // Creates template, picks which floor to use
        this.floorTiles = this.makeFloorTemplate();
        params["floorNum"] === 1 ? null : this.pickFloor(); // Floor 1 is empty room
    }


    /**
     * Basic draw method for a floor.
     * @param {CanvasRenderingContext2D} ctx - 2D Canvas to draw on
     */
    draw(ctx) {
        // If a door is opened, replace the door tile with a "random" ground tile
        if (this.doorOpened) this.floorTiles[0][Math.floor(this.numCols / 2)] = this.floorTiles[this.numRows - 2][0].position;
        if (this.extraDoorOpen) this.floorTiles[this.extraDoorPosition[0]][this.extraDoorPosition[1]][1] = [128, 160];

        // Drawing each tile
        for (let i = 0; i < this.numRows; i++) {
            for (let j = 0; j < this.numCols; j++) {
                let currentTile = this.floorTiles[i][j];

                // Wall or pit tile
                if (currentTile instanceof SpecialTile) {
                    // Pit images come from different tileset
                    if (currentTile.type === "pit") {
                        ctx.drawImage(this.altTilset, currentTile.position[0], currentTile.position[1], 32, 32, 40 * j, 40 * i, 40, 40 );
                    } else {
                        ctx.drawImage(this.tileset, currentTile.position[0], currentTile.position[1], 32, 32, 40 * j, 40 * i, 40, 40);
                    }
                } 
                // Some wall tiles require background tiles, and thus are arrays of 2 tiles to be drawn on top of each other
                else if (currentTile[1] instanceof SpecialTile) {
                    // First tile is always a normal ground tile
                    ctx.drawImage(this.tileset, currentTile[0][0], currentTile[0][1], 32, 32, 40 * j, 40 * i, 40, 40);
                    // Second tile is always a SpecialTile
                    ctx.drawImage(this.tileset, currentTile[1].position[0], currentTile[1].position[1], 32, 32, 40 * j, 40 * i, 40, 40);
                }
                // In some cases, non-wall tiles require background tiles, and must be handled differently from above
                else if (currentTile[1] instanceof Array && currentTile.length === 2) {
                    ctx.drawImage(this.tileset, currentTile[0][0], currentTile[0][1], 32, 32, 40 * j, 40 * i, 40, 40);
                    ctx.drawImage(this.tileset, currentTile[1][0], currentTile[1][1], 32, 32, 40 * j, 40 * i, 40, 40);
                }
                // Normal ground tiles
                else {
                    ctx.drawImage(this.tileset, currentTile[0], currentTile[1], 32, 32, 40 * j, 40 * i, 40, 40);
                }
            }
        }

        // Draw closed door (to previous room) on top of ground tile
        ctx.drawImage(this.tileset, 160, 128, 32, 64, 0, 40 * Math.floor(this.numRows) - 120, 40, 80)

        // If next floor door is opened, draw the opened door on top of the random ground tile picked above
        if (this.doorOpened) ctx.drawImage(this.tileset, 128, 160, 32, 32, 40 * Math.floor(this.numCols / 2), 0, 40, 40);

        // Drawing extra door switch
        if (this.hasExtraDoor) {
            if (this.extraDoorOpen) {
                ctx.drawImage(this.switchOn, 0, 0, 32, 64, this.switchPosition[0] * 40 + 3, this.switchPosition[1] * 40 - 5, 40, 80);
            } else {
                ctx.drawImage(this.switchOff, 0, 0, 32, 64, this.switchPosition[0] * 40 + 3, this.switchPosition[1] * 40 - 5, 40, 80);
            }
        }
    }
    

    /**
     * Simple helper method that picks and calls one of the floor versions.
     */
    pickFloor() {
        let num = Math.floor(Math.random() * 5 + 1);
        switch(num) {
            case 1:
                this.makeFloorV1();
                break;
            case 2:
                this.makeFloorV2();
                break;
            case 3:
                this.makeFloorV3();
                break;
            case 4:
                this.makeFloorV4();
                break;
            case 5:
                this.makeFloorV5();
                break;
            default:
                break;
        }
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
     * Method that finalizes the tiles for the floor. Version 1. Lots of pipes.
     * @returns New array of tiles for a floor
     */
    makeFloorV1() {
        let newFloorTiles = this.floorTiles;

        for (let i = 0; i < this.floorTiles.length; i++) {
            for (let j = 0; j < this.floorTiles[0].length; j++) {

                // -------------- Bottom pipes --------------
                // 1 pipe
                if (i <= this.numRows - 2 && i >= this.numRows - 4 && j === 4) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [160, 512], type: "wall" })
                    ];
                } else if (i === this.numRows - 5 && j === 4) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 512], type: "wall" })
                    ];
                }
                // 1 pipe
                if (i <= this.numRows - 2 && i >= this.numRows - 4 && j === 5) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [160, 512], type: "wall" })
                    ];
                } else if (i === this.numRows - 5 && j === 5) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 512], type: "wall" })
                    ];
                }
                // 1 pipe
                if (i <= this.numRows - 2 && i >= this.numRows - 4 && j === 6) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [160, 512], type: "wall" })
                    ];
                } else if (i === this.numRows - 5 && j === 6) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 512], type: "wall" })
                    ];
                }
                // 1 pipe
                if (i <= this.numRows - 2 && i >= this.numRows - 4 && j === 10) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [160, 512], type: "wall" })
                    ];
                } else if (i === this.numRows - 5 && j === 10) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 512], type: "wall" })
                    ];
                }
                // 1 pipe
                if (i <= this.numRows - 2 && i >= this.numRows - 4 && j === 11) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [160, 512], type: "wall" })
                    ];
                } else if (i === this.numRows - 5 && j === 11) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 512], type: "wall" })
                    ];
                }
                // 1 pipe
                if (i <= this.numRows - 2 && i >= this.numRows - 4 && j === 12) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [160, 512], type: "wall" })
                    ];
                } else if (i === this.numRows - 5 && j === 12) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 512], type: "wall" })
                    ];
                }

                // -------------- Circle pipes --------------
                // Top
                else if (i === 2 && j === this.numCols - 4) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [96, 512], type: "wall" })
                    ];
                } else if (i === 2 && j === this.numCols - 3) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [128, 512], type: "wall" })
                    ];
                } else if (i === 3 && j === this.numCols - 4) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [96, 544], type: "wall" })
                    ];
                } else if (i === 3 && j === this.numCols - 3) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [128, 544], type: "wall" })
                    ];
                }
                // Middle
                else if (i === 5 && j === this.numCols - 4) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [96, 512], type: "wall" })
                    ];
                } else if (i === 5 && j === this.numCols - 3) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [128, 512], type: "wall" })
                    ];
                } else if (i === 6 && j === this.numCols - 4) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [96, 544], type: "wall" })
                    ];
                } else if (i === 6 && j === this.numCols - 3) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [128, 544], type: "wall" })
                    ];
                }
                // Bottom
                else if (i === 8 && j === this.numCols - 4) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [96, 512], type: "wall" })
                    ];
                } else if (i === 8 && j === this.numCols - 3) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [128, 512], type: "wall" })
                    ];
                } else if (i === 9 && j === this.numCols - 4) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [96, 544], type: "wall" })
                    ];
                } else if (i === 9 && j === this.numCols - 3) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [128, 544], type: "wall" })
                    ];
                }

                // -------------- Long pipes --------------
                // Left 1
                else if (i === 2 && j === 3) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [0, 512], type: "wall" })
                    ];
                } else if (i === 2 && j === 4) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [32, 512], type: "wall" })
                    ];
                } else if (i === 2 && j === 5) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [64, 512], type: "wall" })
                    ];
                }
                // Left 2
                else if (i === 3 && j === 3) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [0, 512], type: "wall" })
                    ];
                } else if (i === 3 && j === 4) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [32, 512], type: "wall" })
                    ];
                } else if (i === 3 && j === 5) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [64, 512], type: "wall" })
                    ];
                }
                // Left 3
                else if (i === 4 && j === 3) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [0, 512], type: "wall" })
                    ];
                } else if (i === 4 && j === 4) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [32, 512], type: "wall" })
                    ];
                } else if (i === 4 && j === 5) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [64, 512], type: "wall" })
                    ];
                }
                // Right 1
                else if (i === 2 && j === 9) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [0, 512], type: "wall" })
                    ];
                } else if (i === 2 && j === 10) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [32, 512], type: "wall" })
                    ];
                } else if (i === 2 && j === 11) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [64, 512], type: "wall" })
                    ];
                }
                // Right 2
                else if (i === 3 && j === 9) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [0, 512], type: "wall" })
                    ];
                } else if (i === 3 && j === 10) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [32, 512], type: "wall" })
                    ];
                } else if (i === 3 && j === 11) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [64, 512], type: "wall" })
                    ];
                }
                // Right 3
                else if (i === 4 && j === 9) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [0, 512], type: "wall" })
                    ];
                } else if (i === 4 && j === 10) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [32, 512], type: "wall" })
                    ];
                } else if (i === 4 && j === 11) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [64, 512], type: "wall" })
                    ];
                }

                // -------------- Walls --------------
                // Left trio
                else if (i === 2 && j === 6) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 32], type: "wall" })
                    ];
                } else if (i === 3 && j === 6) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 64], type: "wall" })
                    ];
                } else if (i === 4 && j === 6) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 96], type: "wall" })
                    ];
                }
                // Right trio
                else if (i === 2 && j === 12) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 32], type: "wall" })
                    ];
                } else if (i === 3 && j === 12) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 64], type: "wall" })
                    ];
                } else if (i === 4 && j === 12) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 96], type: "wall" })
                    ];
                }

                // -------------- Decorations --------------
                // Area #
                else if (i === 1 && j === 1) {
                    this.floorTiles[i][j] = [
                        [0, 352],
                        [128, 384]
                    ];
                } else if (i === 1 && j === 2) {
                    this.floorTiles[i][j] = [
                        [32, 352],
                        [160, 384]
                    ];
                } else if (i === 2 && j === 1) {
                    this.floorTiles[i][j] = [
                        [0, 384],
                        [Math.floor(Math.random() * 8) * 32, 416] // Randomize the #
                    ];
                } else if (i === 2 && j === 2) {
                    this.floorTiles[i][j] = [
                        [32, 384],
                        [Math.floor(Math.random() * 8) * 32 + 13, 416] // Randomize the #
                    ];
                }
            }
        }

        return newFloorTiles;
    }


    /**
     * Method that finalizes the tiles for the floor. Version 2. Pit, extra door, lots of walls.
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
                    this.hasExtraDoor = true;
                    this.extraDoorPosition = [3, this.numCols - 8];
                    this.switchPosition = [1, this.numRows - 6];
                }

                // -------------- Decorations --------------
                // Area #
                else if (i === this.numRows - 4 && j === this.numCols - 4) {
                    this.floorTiles[i][j] = [
                        [0, 352],
                        [192, 384]
                    ];
                } else if (i === this.numRows - 4 && j === this.numCols - 3) {
                    this.floorTiles[i][j] = [
                        [32, 352],
                        [224, 384]
                    ];
                } else if (i === this.numRows - 3 && j === this.numCols - 4) {
                    this.floorTiles[i][j] = [
                        [0, 384],
                        [Math.floor(Math.random() * 8) * 32, 416] // Randomize the #
                    ];
                } else if (i === this.numRows - 3 && j === this.numCols - 3) {
                    this.floorTiles[i][j] = [
                        [32, 384],
                        [Math.floor(Math.random() * 8) * 32 + 13, 416] // Randomize the #
                    ];
                }
            }
        }
        return newFloorTiles;
    }


    /**
     * Method that finalizes the tiles for the floor. Version 3. Paintball style (lots of cover, but open)
     * @returns New array of tiles for a floor
     */
    makeFloorV3() {
        let newFloorTiles = this.floorTiles;

        for (let i = 0; i < this.floorTiles.length; i++) {
            for (let j = 0; j < this.floorTiles[0].length; j++) {

                // -------------- Adding random wall segments --------------
                if (i === 2 && j === 2) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [160, 0], type: "wall" })
                    ];
                } else if (i === 2 && j === 3) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [192, 0], type: "wall" })
                    ];
                } else if (i === 2 && j === 4) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 0], type: "wall" })
                    ];
                } else if (i === 4 && j === 2) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 32], type: "wall" })
                    ];
                } else if (i === 5 && j === 2) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 64], type: "wall" })
                    ];
                } else if (i === 6 && j === 2) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 96], type: "wall" })
                    ];
                } else if (i === 5 && j === 5) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [160, 64], type: "wall" })
                    ];
                } else if (i === this.numRows - 4 && j === 4) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 32], type: "wall" })
                    ];
                } else if (i === this.numRows - 3 && j === 4) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 96], type: "wall" })
                    ];
                } else if (i === this.numRows - 3 && j === 10) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [160, 64], type: "wall" })
                    ];
                } else if (i === this.numRows - 5 && j === 8) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [160, 0], type: "wall" })
                    ];
                } else if (i === this.numRows - 5 && j >= 9 && j <= 12) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [192, 0], type: "wall" })
                    ];
                } else if (i === this.numRows - 5 && j === 13) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 0], type: "wall" })
                    ];
                } else if (i === 2 && j === 8) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [160, 64], type: "wall" })
                    ];
                } else if (i === 2 && j === this.numCols - 4) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 32], type: "wall" })
                    ];
                } else if (i === 3 && j === this.numCols - 4) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 64], type: "wall" })
                    ];
                } else if (i === 4 && j === this.numCols - 4) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 96], type: "wall" })
                    ];
                }
                
                // -------------- Adding pit segment --------------
                else if (i === 2 && j === 9) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [0, 96], type: "pit" });
                } else if (i === 2 && j === 10) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [32, 96], type: "pit" });
                } else if (i === 2 && j === 11) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [64, 96], type: "pit" });
                } else if (i === 3 && j === 9) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [0, 128], type: "pit" });
                } else if (i === 3 && j === 10) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [32, 128], type: "pit" });
                } else if (i === 3 && j === 11) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [64, 128], type: "pit" });
                } else if (i === 4 && j === 9) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [0, 160], type: "pit" });
                } else if (i === 4 && j === 10) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [32, 160], type: "pit" });
                } else if (i === 4 && j === 11) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [64, 160], type: "pit" });
                }

                // -------------- Decorations --------------
                // Area #
                else if (i === 3 && j === 6) {
                    this.floorTiles[i][j] = [
                        [0, 352],
                        [192, 384]
                    ];
                } else if (i === 3 && j === 7) {
                    this.floorTiles[i][j] = [
                        [32, 352],
                        [224, 384]
                    ];
                } else if (i === 4 && j === 6) {
                    this.floorTiles[i][j] = [
                        [0, 384],
                        [Math.floor(Math.random() * 8) * 32, 416] // Randomize the #
                    ];
                } else if (i === 4 && j === 7) {
                    this.floorTiles[i][j] = [
                        [32, 384],
                        [Math.floor(Math.random() * 8) * 32 + 13, 416] // Randomize the #
                    ];
                }
            }
        }

        return newFloorTiles;
    }


    /**
     * Method that finalizes the tiles for the floor. Version 4. Massive pit.
     * @returns New array of tiles for a floor
     */
    makeFloorV4() {
        let newFloorTiles = this.floorTiles;

        for (let i = 0; i < this.floorTiles.length; i++) {
            for (let j = 0; j < this.floorTiles[0].length; j++) {

                // -------------- Adding big pit --------------
                // Top left corner
                if (i === 2 && j === 4) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [160, 96], type: "pit" });
                }
                // Top right corner
                else if (i === 2 && j === this.numCols - 5) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [224, 96], type: "pit" });
                }
                // Bottom left corner
                else if (i === this.numRows - 3 && j === 4) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [160, 160], type: "pit" });
                }
                // Bottom right corner
                else if (i === this.numRows - 3 && j === this.numCols - 5) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [224, 160], type: "pit" });
                }
                // Top row
                else if (i === 2 && j > 4 && j < this.numCols - 5) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [192, 96], type: "pit" });
                }
                // Bottom row
                else if (i === this.numRows - 3 && j > 4 && j < this.numCols - 5) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [192, 160], type: "pit" });
                }
                // Left side
                else if (i > 2 && i < this.numRows - 3 && j === 4) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [160, 128], type: "pit" });
                }
                // Right side
                else if (i > 2 && i < this.numRows - 3 && j === this.numCols - 5) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [224, 128], type: "pit" });
                }
                // Left Pyramid
                else if (i === 4 && j === 6) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [256, 96], type: "pit" });
                } else if (i === 4 && j === 7) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [288, 96], type: "pit" });
                } else if (i === 5 && j === 6) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [256, 128], type: "pit" });
                } else if (i === 5 && j === 7) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [288, 128], type: "pit" });
                }
                // Middle Pyramid
                else if (i === this.numRows - 5 && j === 7) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [256, 96], type: "pit" });
                } else if (i === this.numRows - 5 && j === 8) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [288, 96], type: "pit" });
                } else if (i === this.numRows - 4 && j === 7) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [256, 128], type: "pit" });
                } else if (i === this.numRows - 4 && j === 8) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [288, 128], type: "pit" });
                }
                // Right Pyramid
                else if (i === 3 && j === this.numCols - 7) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [256, 96], type: "pit" });
                } else if (i === 3 && j === this.numCols - 6) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [288, 96], type: "pit" });
                } else if (i === 4 && j === this.numCols - 7) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [256, 128], type: "pit" });
                } else if (i === 4 && j === this.numCols - 6) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [288, 128], type: "pit" });
                }
                // Above Ground Pyramid
                else if (i === 4 && j === 9) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [256, 96], type: "pit" });
                } else if (i === 4 && j === 10) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [288, 96], type: "pit" });
                } else if (i === 5 && j === 9) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [256, 128], type: "pit" });
                } else if (i === 5 && j === 10) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [288, 128], type: "pit" });
                }
                // Black pit
                else if (i >= 3 && i <= 7 && j === 5) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [32, 128], type: "pit" });
                } else if ((i === 3 || i === 6 || i === 7) && j === 6) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [32, 128], type: "pit" });
                } else if ((i === this.numRows - 5 || i === this.numRows - 4 || i === 7) && j >= this.numCols - 9 && j <= this.numCols - 6) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [32, 128], type: "pit" });
                } else if (i === 3 && j >= 7 && j <= 10) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [32, 128], type: "pit" });
                } 
                else if (i === 5 && (j === this.numCols - 7 || j === this.numCols - 6)) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [32, 128], type: "pit" });
                } else if ((i === 4 || i === 5) && j === 8) {
                    this.floorTiles[i][j] = new SpecialTile({ position: [32, 128], type: "pit" });
                }

                // -------------- Adding random walls --------------
                else if (i === 3 && j === 2) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 32], type: "wall" })
                    ];
                } else if (i === 4 && j === 2) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 64], type: "wall" })
                    ];
                } else if (i === 5 && j === 2) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 96], type: "wall" })
                    ];
                } else if (i === 7 && j === 2) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [160, 0], type: "wall" })
                    ];
                } else if (i === 7 && j === 3) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 0], type: "wall" })
                    ];
                } else if (i === 8 && j === 3) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [160, 64], type: "wall" })
                    ];
                } else if (i === 2 && j === this.numCols - 4) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 32], type: "wall" })
                    ];
                } else if (i === 3 && j === this.numCols - 4) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 64], type: "wall" })
                    ];
                } else if (i === 4 && j === this.numCols - 4) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 64], type: "wall" })
                    ];
                } else if (i === 5 && j === this.numCols - 4) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 96], type: "wall" })
                    ];
                } else if (i === this.numRows - 4 && j === this.numCols - 3) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [160, 64], type: "wall" })
                    ];
                }

                // -------------- Decorations --------------
                // Area #
                else if (i === 1 && j === this.numCols - 3) {
                    this.floorTiles[i][j] = [
                        [0, 352],
                        [192, 480]
                    ];
                } else if (i === 1 && j === this.numCols - 2) {
                    this.floorTiles[i][j] = [
                        [32, 352],
                        [224, 480]
                    ];
                } else if (i === 2 && j === this.numCols - 3) {
                    this.floorTiles[i][j] = [
                        [0, 384],
                        [Math.floor(Math.random() * 8) * 32, 416] // Randomize the #
                    ];
                } else if (i === 2 && j === this.numCols - 2) {
                    this.floorTiles[i][j] = [
                        [32, 384],
                        [Math.floor(Math.random() * 8) * 32 + 13, 416] // Randomize the #
                    ];
                }
            }
        }

        return newFloorTiles;
    }


    /**
     * Method that finalizes the tiles for the floor. Version 5. Wall protrusions + pipes.
     * @returns New array of tiles for a floor
     */
    makeFloorV5() {
        let newFloorTiles = this.floorTiles;

        for (let i = 0; i < this.floorTiles.length; i++) {
            for (let j = 0; j < this.floorTiles[0].length; j++) {

                // -------------- Top wall protrusions --------------
                // Initial top wall hump
                if (i === 0 && j === 1) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [64, 0], type: "wall" })
                    ];
                } 
                // Row 1
                else if (i === 0 && j === 2) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [96, 0], type: "wall" })
                    ];
                } else if (i === 1 && j === 2) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [128, 64], type: "wall" })
                    ];
                } else if (i === 2 && j === 2) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [96, 32], type: "wall" })
                    ];
                }
                // Row 2
                else if (i === 0 && j === 3) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [32, 0], type: "wall" })
                    ];
                } else if (i === 1 && j === 3) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [0, 64], type: "wall" })
                    ];
                } else if (i === 2 && j === 3) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [32, 32], type: "wall" })
                    ];
                }


                // Initial top wall hump
                else if (i === 0 && j === 4) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [64, 0], type: "wall" })
                    ];
                }
                // Row 1
                else if (i === 0 && j === 5) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [96, 0], type: "wall" })
                    ];
                } else if (i === 1 && j === 5) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [128, 64], type: "wall" })
                    ];
                } else if (i === 2 && j === 5) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [96, 32], type: "wall" })
                    ];
                }
                // Row 2
                else if (i === 0 && j === 6) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [32, 0], type: "wall" })
                    ];
                } else if (i === 1 && j === 6) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [0, 64], type: "wall" })
                    ];
                } else if (i === 2 && j === 6) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [32, 32], type: "wall" })
                    ];
                }

                // Extra top wall hump
                else if (i === 0 && j === 7) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [64, 0], type: "wall" })
                    ];
                }

                // Initial top wall hump
                else if (i === 0 && j === 10) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [64, 0], type: "wall" })
                    ];
                }
                // Row 1
                else if (i === 0 && j === 11) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [96, 0], type: "wall" })
                    ];
                } else if (i === 1 && j === 11) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [128, 64], type: "wall" })
                    ];
                } else if (i === 2 && j === 11) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [96, 32], type: "wall" })
                    ];
                }
                // Row 2
                else if (i === 0 && j === 12) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [32, 0], type: "wall" })
                    ];
                } else if (i === 1 && j === 12) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [0, 64], type: "wall" })
                    ];
                } else if (i === 2 && j === 12) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [32, 32], type: "wall" })
                    ];
                }


                // Initial top wall hump
                else if (i === 0 && j === 13) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [64, 0], type: "wall" })
                    ];
                }
                // Row 1
                else if (i === 0 && j === 14) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [96, 0], type: "wall" })
                    ];
                } else if (i === 1 && j === 14) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [128, 64], type: "wall" })
                    ];
                } else if (i === 2 && j === 14) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [96, 32], type: "wall" })
                    ];
                }
                // Row 2
                else if (i === 0 && j === 15) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [32, 0], type: "wall" })
                    ];
                } else if (i === 1 && j === 15) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [0, 64], type: "wall" })
                    ];
                } else if (i === 2 && j === 15) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [32, 32], type: "wall" })
                    ];
                }
                // Extra top wall hump
                else if (i === 0 && j === 16) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [64, 0], type: "wall" })
                    ];
                }

                // -------------- Top wall protrusion extra walls --------------
                // Triple wall
                else if (i === 3 && j === 2) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 32], type: "wall" })
                    ];
                } else if (i === 4 && j === 2) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 64], type: "wall" })
                    ];
                } else if (i === 5 && j === 2) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 96], type: "wall" })
                    ];
                }
                // Triple wall
                else if (i === 3 && j === 3) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 32], type: "wall" })
                    ];
                } else if (i === 4 && j === 3) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 64], type: "wall" })
                    ];
                } else if (i === 5 && j === 3) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 96], type: "wall" })
                    ];
                }
                // Triple wall
                else if (i === 3 && j === 5) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 32], type: "wall" })
                    ];
                } else if (i === 4 && j === 5) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 64], type: "wall" })
                    ];
                } else if (i === 5 && j === 5) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 96], type: "wall" })
                    ];
                }
                // Triple wall
                else if (i === 3 && j === 6) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 32], type: "wall" })
                    ];
                } else if (i === 4 && j === 6) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 64], type: "wall" })
                    ];
                } else if (i === 5 && j === 6) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 96], type: "wall" })
                    ];
                }
                // Triple wall
                else if (i === 3 && j === 11) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 32], type: "wall" })
                    ];
                } else if (i === 4 && j === 11) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 64], type: "wall" })
                    ];
                } else if (i === 5 && j === 11) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 96], type: "wall" })
                    ];
                }
                // Triple wall
                else if (i === 3 && j === 12) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 32], type: "wall" })
                    ];
                } else if (i === 4 && j === 12) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 64], type: "wall" })
                    ];
                } else if (i === 5 && j === 12) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 96], type: "wall" })
                    ];
                }
                // Triple wall
                else if (i === 3 && j === 14) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 32], type: "wall" })
                    ];
                } else if (i === 4 && j === 14) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 64], type: "wall" })
                    ];
                } else if (i === 5 && j === 14) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 96], type: "wall" })
                    ];
                }
                // Triple wall
                else if (i === 3 && j === 15) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 32], type: "wall" })
                    ];
                } else if (i === 4 && j === 15) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 64], type: "wall" })
                    ];
                } else if (i === 5 && j === 15) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 96], type: "wall" })
                    ];
                }

                // -------------- Bottom pipes --------------
                else if (i === this.numRows - 2 && j === 2) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 512], type: "wall" })
                    ];
                } else if (i === this.numRows - 2 && j === 3) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 512], type: "wall" })
                    ];
                } else if (i === this.numRows - 2 && j === 5) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 512], type: "wall" })
                    ];
                } else if (i === this.numRows - 2 && j === 6) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 512], type: "wall" })
                    ];
                } else if (i === this.numRows - 2 && j === 11) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 512], type: "wall" })
                    ];
                } else if (i === this.numRows - 2 && j === 12) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 512], type: "wall" })
                    ];
                } else if (i === this.numRows - 2 && j === 14) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 512], type: "wall" })
                    ];
                } else if (i === this.numRows - 2 && j === 15) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [224, 512], type: "wall" })
                    ];
                } 

                // -------------- Spiral pipes --------------
                // Top
                else if (i === 3 && j === 8) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [96, 512], type: "wall" })
                    ];
                } else if (i === 3 && j === 9) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [128, 512], type: "wall" })
                    ];
                } else if (i === 4 && j === 8) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [96, 544], type: "wall" })
                    ];
                } else if (i === 4 && j === 9) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [128, 544], type: "wall" })
                    ];
                }
                // Bottom
                else if (i === 7 && j === 8) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [96, 512], type: "wall" })
                    ];
                } else if (i === 7 && j === 9) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [128, 512], type: "wall" })
                    ];
                } else if (i === 8 && j === 8) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [96, 544], type: "wall" })
                    ];
                } else if (i === 8 && j === 9) {
                    this.floorTiles[i][j] = [
                        this.floorTiles[this.numRows - 2][0].position,
                        new SpecialTile({ position: [128, 544], type: "wall" })
                    ];
                }

                // -------------- Decorations --------------
                // Area #
                else if (i === 5 && j === 8) {
                    this.floorTiles[i][j] = [
                        [0, 352],
                        [128, 384]
                    ];
                } else if (i === 5 && j === 9) {
                    this.floorTiles[i][j] = [
                        [32, 352],
                        [160, 384]
                    ];
                } else if (i === 6 && j === 8) {
                    this.floorTiles[i][j] = [
                        [0, 384],
                        [Math.floor(Math.random() * 8) * 32, 416] // Randomize the #
                    ];
                } else if (i === 6 && j === 9) {
                    this.floorTiles[i][j] = [
                        [32, 384],
                        [Math.floor(Math.random() * 8) * 32 + 13, 416] // Randomize the #
                    ];
                }
            }
        }

        return newFloorTiles;
    }


    /**
     * Helper method that selects a random top wall tile. Need this so that we can use
     * 1 top wall tile that requires a background tile.
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
