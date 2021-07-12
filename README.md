Background:
    The game I'm planning to make will be a top-down 2D game (think old Legend of Zelda games). The goal of the game will be to kill enemies that spawn while avoiding taking damage from said enemies (once your health reaches 0, it's game over). The player will be in a static room. If I have time, I would like to make the game more of a dungeon crawler / roguelike game, where you can move to a new room once defeating all the enemies in the current room. Thematically, I hope to make the game cyberpunk-esque by using publically available 2D assets. This means that the player and the enemies will have guns that fire projectiles.


In the arena, users will be able to:
    - Start, restart, and mute
    - Move the player character with wasd
    - Aim and shoot with the mouse to defeat enemies

In addition, this project will include:
    - An instructions button that will bring up keybinds (not customizable) and general instructions
    - A production README


Wireframe:
    https://wireframe.cc/6nmsmw


Technologies:
    - This project will use canvas to render the game
    - Webpack and Babel to bundle and transpile
    - npm to manage dependecies


Implementation Timeline:
    1. Basic Game Logic:
        - Render the board (room)
        - Create the player character and handle basic wasd input
            - Render character correctly as it moves
        - Create the projectile class, handle mouse input to aim
            - Render projectiles properly as they move
        - Create enemies, initially spawning them in unmoving
        - Collision! Lots of things to check for
            - The player should collide with enemies / walls
            - Enemies should collide with walls
            - Projectiles should collide with the player, enemies, and walls, despawning / dealing the appropriate damage when they do
        - Enemy AI: This will be tricky, but the enemies should try to move towards and shoot at the player position
    2. Game UI:
        - Add player health bar
        - Add crosshair at mouse position
        - If time, add health bar above enemy heads
        - Implement play, restart buttons
        - When the player's health reaches 0, the game ends and a Game Over message is displayed
    3. Styling:
        - Add game board pixel art
        - Add sprites for enemies and player character - this will probably be hard as will have to deal with different directions
            - If time, add animations for attacking
        - Add music, mute button
        - If time, add sound effects for shooting, taking damage, moving?
    4. Deploy to github pages, rewrite readme


Bonus Features:
    Hopefully I'll be able to get to:
        - Add dungeon crawler functionality (as mentioned in background)
        - Make rooms more interesting (randomly spawn different things in each room, walls, etc. - this could mess with the AI though)
    If I get through all of the above:
        - Add a button that, when held, slows down time
        - Add a button that causes the player character to roll, triggering an iframe
        - Add multiple enemy types
        - Add multiple weapon types