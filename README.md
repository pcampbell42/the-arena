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
Collision has two parts to it. The first is checking if two `MovingObjects` have collided. Conceptually, this is very simple, and only requires you to compare the positions of each `MovingObject`. The second is checking if a `MovingObject` has moved into a wall. When I first made the game, this was even simpler because walls were only on the outer edge of the map, and thus I simply hard coded collision into the outer edge of the map. However, later on in development, I decided I wanted more interesting floor layouts. This meant that I couldn't hard code in wall collision, and thus, enter dynamic collision.

Each `Floor` is made up of a 2D array of tiles. If a tile causes collision or death, its an object of type `SpecialTile`. Thus, the cornerstone of dynamic collision is to check if a `MovingObject` is moving into a tile of type `SpecialTile`. To do this, we can use the `MovingObject's` position to get the value of the tile it's currently on. This looks something like this:
```javascript
let nextTileIndices = [Math.floor(this.position[1] / 40) + 1, Math.floor((this.position[0] / 40) + 1];
let nextTile = this.game.floor.floorTiles[nextTileIndices[0]][nextTileIndices[1]];
if (nextTile instanceof SpecialTile && nextTile.type === "wall") return false;
```
Although in implementation the details got very sticky, this is the basic idea of dynamic collision.

### Pathfinding
The basic algorithm for enemy pathfinding is to build a Polytree of all the possible moves. When adding a new move to the poly tree, you check if that position is the target position (aka, the player's position). If it is, you simply step through the parent nodes, and now you have your path. To implement this algorithm, I made a class `EnemyPathfinder`, which has an instance variable `moveList`. Each `Enemy` has its own `EnemyPathfinder` instance variable. Thus, at each step of the game, the `Enemy` can use `this.pathfinder.moveList` to check where to move.

### Line of Sight

### Time Slow

## Future Directions
Of course, there are countless things I could add to this game, and I could spend the next year doing it. That said, here are some immediate and small things I could add:
* Highscores
* Healing item that randomly spawns on the ground and activate when moved over
* Oil barrels that can be kicked to move around and then shot to blow up
* Death animations, falling animations
* SFX

## Local Installation Guide
Running this code locally is very simple. All you have to do is clone the repo and open index.html with a live server. Note that in package.json, we have a script "watch" which, if run, will automatically update the page as you change the code. This is run using npm run watch.
