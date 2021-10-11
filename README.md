# [The Factory](https://pcampbell42.github.io/the-factory/)
[![The Factory](https://github.com/pcampbell42/the-factory/blob/main/dist/assets/readme_assets/home_page.png)](https://pcampbell42.github.io/the-factory/)
[The Factory](https://pcampbell42.github.io/the-factory/) is a top-down browser game. The game was originally designed to be a full on dungeon crawler, but for the sake of keeping things short and sweet, it now has a fixed 10 levels. The player plays as a cyborg, and must defeat all enemies on a floor to move to the next one. There are two boss fights, one on floor 5 and the other on floor 10. Once the final boss is defeated, the game is completed.

## Contents
* [Technologies Used](#technologies-used)
* [Class Diagram](#class-diagram)
* [Features](#features)
* [Future Directions](#future-directions)
* [Local Installation Guide](#local-installation-guide)

## Technologies Used
[The Factory](https://pcampbell42.github.io/the-factory/) is a game built entirely in JavaScript, HTML5, and CSS3. It uses mostly ES6 syntax, with a small amount of ES5 sprinkled in. This project takes advantage of D3.js and npm. The game is drawn using Canvas and a 2D rendering context. The animation takes advantage of request animation frame. UI elements are rendered using event listeners. 

## Class Diagram
A basic conceptual class diagram to show the general layout of the project.
![Class Diagram](https://github.com/pcampbell42/the-factory/blob/main/dist/assets/readme_assets/classDiagram.drawio.png)

## Features
In this section, I highlight a few of the more challenging features that I Implemented.

### Dynamic Collision
Collision has two parts to it. The first is checking if two `MovingObjects` have collided. Conceptually, this is very simple, and only requires you to compare the positions of the two `MovingObjects`. The second is checking if a `MovingObject` has moved into a wall. When I first made the game, this was even simpler because walls were only on the outer edge of the map, and thus I simply hard coded collision into the outer edge of the map. However, later on in development, I decided I wanted more interesting floor layouts. This meant that I couldn't hard code in wall collision, and thus, enter dynamic collision.

Each `Floor` is made up of a 2D array of tiles. If a tile causes collision or death, its an object of type `SpecialTile`. Thus, the cornerstone of dynamic collision is to check if a `MovingObject` is moving into a tile of type `SpecialTile`. To do this, we can use the `MovingObject's` position to get the value of the tile it's currently on. This looks something like this:
```javascript
let nextTileIndices = [Math.floor(this.position[1] / 40) + 1, Math.floor((this.position[0] / 40) + 1];
let nextTile = this.game.floor.floorTiles[nextTileIndices[0]][nextTileIndices[1]];
if (nextTile instanceof SpecialTile && nextTile.type === "wall") return false;
```
Although in implementation the details got very sticky, this is the basic idea of dynamic collision.

### Pathfinding
The basic algorithm for enemy pathfinding is to build a polytree of all the possible moves for a given `Enemy`. When adding a new move to the polytree, you check if that position is the target position (aka, the player's position). If it is, you simply step through the parent nodes, and now you have your path. In essence, we're performing a BFS on a polytree as we build it.

To implement this algorithm, I made a class `EnemyPathfinder`, which has an instance variable `moveList` and a method `findPath`. The `findPath` method updates the `moveList` instance variable when called. The `moveList` variable is the shortest possible path from point A to point B, given in tile indices - thus, the `moveList` might look something like this: `[[2, 3], [2, 4], [3, 5], [4, 5]]`.
```javascript
findPath(currentPos, playerPos) {
    // Translate Enemy's position in the indices of the tile they're currently on,
    // and then make it into a node
    let enemyIndices = this._getTileIndices(currentPos);
    if (!enemyIndices) return; // If _getTileIndices, returns false, the indices are invalid and we exit out
    let rootNode = new PolyTreeNode({ indices: enemyIndices });

    // Translate Player's position into the indices of the tile they're currently on.
    let playerIndices = this._getTileIndices(playerPos);

    let queue = [rootNode];
    while (queue.length > 0) {
        // Checking if next node is where the player is
        let node = queue.shift();
        if (node.indices[0] === playerIndices[0] && node.indices[1] === playerIndices[1]) {
            this._updateMoveList(node); // Player found, update Enemy's moveList
            queue = []; // Set queue to empty array to break out of while loop and exit method
        }
        // Player not found, so add next node's children to the queue
        else {
            queue = queue.concat(this._nextPossibleMoves(node));
        }
    }
}
```
Each `Enemy` has its own `EnemyPathfinder` as an instance variable. Thus, at each step of the game, the `Enemy` calls `this.pathfinder.findPath(this.position, this.game.player.position)` to update the shortest path, and then uses `this.pathfinder.moveList` to check where to move.

This is the basic idea of pathfinding in my game. Keep in mind that, as is often the case in programming, the devil was in the details. Mainly, the hardest part of implementing this was not actually getting the path for the `Enemy` to take, but rather translating that path into moving the `Enemy` correctly without colliding with any walls. However, I won't go into the details here, as it's all rather mundane and was mostly busywork. If you'd like to see how this is done, it's in the `move()` method of the `Enemy` class.

### Line of Sight
When I added more complex floors with walls all over the place, it didn't make sense for enemies to notice the player through walls. Thus, I had to implement a line of sight system to prevent this. The idea that I came up with was very simple. Draw a line from the `Player's` position to the `Enemy's` position. If at any point the line crosses a wall, they aren't in line of sight.

To implement this, I wrote a `playerInLOS()` method that returns a boolean for whether or not the `Player` is in LOS of the `Enemy`. This was one of those satisfying implementations that worked exactly how I thought it would. Note that, as we did in pathfinding, we use the dynamic collision system to translate from position to tile indices and check if the tile is a `SpecialTile` of `type` wall.
```javascript
playerInLOS() {
    let playerPos = this.game.player.position;
    let enemyPos = this.position;

    // Dealing with ultra-rare edge case where you would be dividing by 0 to find m
    if (enemyPos[1] === playerPos[1]) return true;

    // Finding mx + b values, as well as endpoint x2 value
    let x1;
    let x2;
    let y1;
    let m;
    if (enemyPos[0] < playerPos[0]) {
        x1 = enemyPos[0];
        y1 = enemyPos[1];
        x2 = playerPos[0];
        m = (playerPos[1] - enemyPos[1]) / (playerPos[0] - enemyPos[0]);
    } else {
        x1 = playerPos[0];
        y1 = playerPos[1];
        x2 = enemyPos[0];
        m = (enemyPos[1] - playerPos[1]) / (enemyPos[0] - playerPos[0])
    }
    let b = y1 - (m * x1);

    // Iterating along line
    while (x1 < x2) {
        let currentY = (m * x1) + b

        // Check that tile indices are valid
        let currentTileIndices = [Math.floor(currentY / 40) + 1, Math.floor(x1 / 40) + 1];
        if (currentTileIndices[0] <= 0 || currentTileIndices[0] >= this.game.floor.numRows ||
            currentTileIndices[1] <= 0 || currentTileIndices[1] >= this.game.floor.numCols) return false;

        // Get current tile and check it
        let currentTile = this.game.floor.floorTiles[currentTileIndices[0]][currentTileIndices[1]];
        if ((currentTile instanceof SpecialTile && currentTile.type === "wall") ||
            currentTile[0] instanceof Array && currentTile[1].type === "wall") return false;

        x1++;
    }
    return true;
}
```


## Future Directions
Of course, there are countless things I could add to this game, and I could spend the next year doing it. That said, here are some immediate and small things I could add:
* Highscores
* Healing item that randomly spawns on the ground and activate when moved over
* Oil barrels that can be kicked to move around and then shot to blow up
* Death animations, falling animations
* SFX

## Local Installation Guide
Running this code locally is very simple. All you have to do is clone the repo and open index.html with a live server. Note that in package.json, we have a script "watch" which, if run, will automatically update the page as you change the code. This is run using npm run watch.
