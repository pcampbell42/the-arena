const PolyTreeNode = require("./poly_tree_node");
const SpecialTile = require("../floors/special_tile");


class EnemyPathfinder {
    constructor(params) {
        this.floor = params["floor"];
        this.consideredPositions = []; // Prevent the algorithm from looking at same tile twice
        this.moveList = []; // Path to Player, given in tile indices
    }


    /**
     * This is the main method for Enemy pathfinding. This method gets called in 
     * Enemy's move() each iteration of the game loop. It builds a poly tree of the 
     * possible moves the Enemy can make, while simultaneously performing a bfs 
     * (breadth first search) to look for the Player's position. When the node where the 
     * Player is is found, the path to the Player is obtained by simply looking at the 
     * node's parent, and then that node's parent, etc. this.moveList is then updated, 
     * which allows the Enemy to see where to move next.
     * 
     * @param {Array} currentPos - The Enemy's current position, given in [x, y], 
     * where x and y are the normal pixel values (not the tile indices).
     * @param {Array} playerPos - The Player's current position, given in [x, y],
     * where x and y are the normal pixel values (not the tile indices).
     */
    findPath(currentPos, playerPos) {
        // Translate Enemy's position in the indices of what tile they're currently on,
        // and then make it into a node
        let enemyIndices = this._getTileIndices(currentPos);
        if (!enemyIndices) return; // If _getTileIndices, returns false, the indices are invalid and we exit out
        let rootNode = new PolyTreeNode({ indices: enemyIndices });

        // Translate Player's position into the indices of what tile they're currently on.
        // Note that we don't have to check if the indices are invalid, because the Player
        // will never be out of bounds.
        let playerIndices = this._getTileIndices(playerPos);

        let queue = [rootNode];
        while (queue.length > 0) {
            // Checking if next node is where the player is
            let node = queue.shift();
            if (node.indices[0] === playerIndices[0] && node.indices[1] === playerIndices[1]) {
                this._updateMoveList(node); // Player found, update Enemy's next 3 moves
                queue = []; // Set queue to empty array to break out of while loop and exit method
            }
            // Player not found, so add next node's children to the queue
            else {
                queue = queue.concat(this._nextPossibleMoves(node));
            }
        }
    }


    /**
     * Helper method that takes in a node (that represents a tile) and returns an 
     * Array of the valid tiles (as PolyTreeNodes) the Character could move to from this tile.
     * @param {PolyTreeNode} currentNode - PolyTreeNode representing the current position of the algorithm
     * @returns - Array of PolyTreeNodes that represent possible moves from the currentNode
     */
    _nextPossibleMoves(currentNode) {
        let nextMoves = [];

        // This is just so we don't have to write all this long shit out repeatedly
        let tiles = this.floor.floorTiles;
        let rows = this.floor.numRows - 1;
        let cols = this.floor.numCols - 1;
        let currIdx = currentNode.indices;

        // Check all 8 adjacent tiles to see if valid - diagonal tiles have more checks
        let childNode;

        // Check top tile. Checks the following: 1) Not looking out of bounds. 2) If position
        // has already been considered. 3) If the tile is a wall or a pit (this can be formatted
        // in 2 different ways, hence two checks are needed for this condition).
        if (currIdx[0] > 0 && !this._consideredPosition([currIdx[0] - 1, currIdx[1]]) &&
            !(tiles[currIdx[0] - 1][currIdx[1]][1] instanceof SpecialTile) &&
            !(tiles[currIdx[0] - 1][currIdx[1]] instanceof SpecialTile)) {

            childNode = new PolyTreeNode({ indices: [currIdx[0] - 1, currIdx[1]] }); // Create node out of position
            childNode.parent = currentNode; // Set the new node's parent to the current node
            currentNode.children.push(childNode); // Add the new node to the current node's children
            nextMoves.push(childNode); // Add the new node to the return move list
            // Add the new node's position to consideredPositions. Very important, if we don't do this we get a memory error
            this.consideredPositions.push(childNode.indices);
        }

        // Check right tile
        if (currIdx[1] < cols && !this._consideredPosition([currIdx[0], currIdx[1] + 1]) &&
            !(tiles[currIdx[0]][currIdx[1] + 1][1] instanceof SpecialTile) && 
            !(tiles[currIdx[0]][currIdx[1] + 1] instanceof SpecialTile)) {

            childNode = new PolyTreeNode({ indices: [currIdx[0], currIdx[1] + 1] });
            childNode.parent = currentNode;
            currentNode.children.push(childNode);
            nextMoves.push(childNode);
            this.consideredPositions.push(childNode.indices);
        }

        // Check bottom tile
        if (currIdx[0] < rows && !this._consideredPosition([currIdx[0] + 1, currIdx[1]]) &&
            !(tiles[currIdx[0] + 1][currIdx[1]][1] instanceof SpecialTile) &&
            !(tiles[currIdx[0] + 1][currIdx[1]] instanceof SpecialTile)) {

            childNode = new PolyTreeNode({ indices: [currIdx[0] + 1, currIdx[1]] });
            childNode.parent = currentNode;
            currentNode.children.push(childNode);
            nextMoves.push(childNode);
            this.consideredPositions.push(childNode.indices);
        }

        // Check left tile
        if (currIdx[1] > 0 && !this._consideredPosition([currIdx[0], currIdx[1] - 1]) &&
            !(tiles[currIdx[0]][currIdx[1] - 1][1] instanceof SpecialTile) &&
            !(tiles[currIdx[0]][currIdx[1] - 1] instanceof SpecialTile)) {

            childNode = new PolyTreeNode({ indices: [currIdx[0], currIdx[1] - 1] });
            childNode.parent = currentNode;
            currentNode.children.push(childNode);
            nextMoves.push(childNode);
            this.consideredPositions.push(childNode.indices);
        }

        // Check top right diagonal tile. In addition to the normal checks, for a 
        // diagonal tile to be a valid move, The other two adjacent tiles can't be
        // walls or pits (to avoid collision issues). For example, for the top right
        // diagonal tile, the top tile and the right tile cannot be walls / pits
        // because we're going to slightly move through them.
        if (currIdx[1] < cols && currIdx[0] > 0 && !this._consideredPosition([currIdx[0] - 1, currIdx[1] + 1]) &&
            !(tiles[currIdx[0] - 1][currIdx[1] + 1][1] instanceof SpecialTile) && !(tiles[currIdx[0] - 1][currIdx[1] + 1] instanceof SpecialTile) &&
            !(tiles[currIdx[0]][currIdx[1] + 1][1] instanceof SpecialTile) && !(tiles[currIdx[0]][currIdx[1] + 1] instanceof SpecialTile) &&
            !(tiles[currIdx[0] - 1][currIdx[1]][1] instanceof SpecialTile) && !(tiles[currIdx[0] - 1][currIdx[1]] instanceof SpecialTile)) {

            childNode = new PolyTreeNode({ indices: [currIdx[0] - 1, currIdx[1] + 1] });
            childNode.parent = currentNode;
            currentNode.children.push(childNode);
            nextMoves.push(childNode);
            this.consideredPositions.push(childNode.indices);
        }

        // Check top left diagonal tile
        if (currIdx[1] > 0 && currIdx[0] > 0 && !this._consideredPosition([currIdx[0] - 1, currIdx[1] - 1]) &&
            !(tiles[currIdx[0] - 1][currIdx[1] - 1][1] instanceof SpecialTile) && !(tiles[currIdx[0] - 1][currIdx[1] - 1] instanceof SpecialTile) &&
            !(tiles[currIdx[0]][currIdx[1] - 1][1] instanceof SpecialTile) && !(tiles[currIdx[0]][currIdx[1] - 1] instanceof SpecialTile) &&
            !(tiles[currIdx[0] - 1][currIdx[1]][1] instanceof SpecialTile) && !(tiles[currIdx[0] - 1][currIdx[1]] instanceof SpecialTile)) {

            childNode = new PolyTreeNode({ indices: [currIdx[0] - 1, currIdx[1] - 1] });
            childNode.parent = currentNode;
            currentNode.children.push(childNode);
            nextMoves.push(childNode);
            this.consideredPositions.push(childNode.indices);
        }

        // Check bottom right diagonal tile
        if (currIdx[0] < rows && currIdx[1] < cols && !this._consideredPosition([currIdx[0] + 1, currIdx[1] + 1]) &&
            !(tiles[currIdx[0] + 1][currIdx[1] + 1][1] instanceof SpecialTile) && !(tiles[currIdx[0] + 1][currIdx[1] + 1] instanceof SpecialTile) &&
            !(tiles[currIdx[0] + 1][currIdx[1]][1] instanceof SpecialTile) && !(tiles[currIdx[0] + 1][currIdx[1]] instanceof SpecialTile) &&
            !(tiles[currIdx[0]][currIdx[1] + 1][1] instanceof SpecialTile) && !(tiles[currIdx[0]][currIdx[1] + 1] instanceof SpecialTile)) {

            childNode = new PolyTreeNode({ indices: [currIdx[0] + 1, currIdx[1] + 1] });
            childNode.parent = currentNode;
            currentNode.children.push(childNode);
            nextMoves.push(childNode);
            this.consideredPositions.push(childNode.indices);
        }

        // Check bottom left diagonal tile
        if (currIdx[0] < rows && currIdx[1] > 0 && !this._consideredPosition([currIdx[0] + 1, currIdx[1] - 1]) &&
            !(tiles[currIdx[0] + 1][currIdx[1] - 1][1] instanceof SpecialTile) && !(tiles[currIdx[0] + 1][currIdx[1] - 1] instanceof SpecialTile) &&
            !(tiles[currIdx[0]][currIdx[1] - 1][1] instanceof SpecialTile) && !(tiles[currIdx[0]][currIdx[1] - 1] instanceof SpecialTile) &&
            !(tiles[currIdx[0] + 1][currIdx[1]][1] instanceof SpecialTile) && !(tiles[currIdx[0] + 1][currIdx[1]] instanceof SpecialTile)) {

            childNode = new PolyTreeNode({ indices: [currIdx[0] + 1, currIdx[1] - 1] });
            childNode.parent = currentNode;
            currentNode.children.push(childNode);
            nextMoves.push(childNode);
            this.consideredPositions.push(childNode.indices);
        }
        
        return nextMoves;
    }


    /**
     * Helper method that updates this.moveList once a valid path to the Player
     * is found. Starts at the endNode and steps through parents to get to the 
     * starting node.
     * @param {PolyTreeNode} endNode - The PolyTreeNode where the Player is. 
     */
    _updateMoveList(endNode) {
        let foundPath = [endNode.indices];
        let currentNode = endNode;

        // The rootNode's parent will be undefined
        while (currentNode.parent !== undefined) {
            currentNode = currentNode.parent; // Step to the next node
            foundPath.push(currentNode.indices); // Add node's indices
        }

        this.moveList = foundPath.reverse(); // Update moveList
        this.consideredPositions = []; // Clear considered positions
    }


    /**
        * Helper method that translates position to the indices (in floor.floorTiles) 
        * of the tile the Character is currently on.
        * @param {Array} position - A normal position given as [x, y]
        * @returns - Indices of the tile given as [row, col]. If indices are invalid,
        * returns false and findPath() is exited.
        */
    _getTileIndices(position) {
        let currentTileIndices = [Math.floor((position[1] + 5) / 40) + 1, Math.floor((position[0] - 5) / 40) + 1];

        // If invalid indices...
        if (currentTileIndices[0] <= 0 || currentTileIndices[0] >= this.floor.numRows - 1 ||
            currentTileIndices[1] <= 0 || currentTileIndices[1] >= this.floor.numCols - 1) return false;

        return currentTileIndices;
    }


    /**
     * Basic helper method to check if this.consideredPositions includes a position.
     * The only reason we need this is because Array.includes doesn't work for subarrays in JS.
     * @param {Array} position - Position in tile index form ([row, col])
     */
    _consideredPosition(position) {
        let alreadyConsidered = false;
        this.consideredPositions.forEach(consideredPos => {
            if (position[0] === consideredPos[0] && position[1] === consideredPos[1]) alreadyConsidered = true;
        });
        return alreadyConsidered;
    }
}


module.exports = EnemyPathfinder;
