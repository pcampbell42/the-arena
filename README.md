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


## Features


## Future Directions
Of course, I could spend the next year adding to this game. I could make the game a fully fledged dungeon crawler, complete with a biome swap every 10 floors or so. I could improve the AI. This list goes on and on. That said, here are some immediate and small things I could add:
* Healing item that randomly spawns on the ground and activates when moved over
* Death animations, falling animations
* Animate the stunned icon
* Add more floor templates
* 

## Local Installation Guide
Running this code locally is very simple. All you have to do is clone the repo and open index.html with a live server. Note that in package.json, we have a script "watch" which, if run, will automatically update the page as you change the code. This is run using npm run watch.
