const Character = require("./character");
const SpecialTile = require("../../floors/special_tile");
const EnemyPathfinder = require("../../util/enemy_pathfinder");


class Enemy extends Character {
    constructor(params) {
        super(params);
        this.firingRate = 300; // Way to set difficulty, lower the harder

        // AI behavior & aggro
        this.aggroed = false;
        this.losingAggroCounter = 0; // Allows for Enemies to lose aggro slowly
        this.loseAggroThreshold = 125; // When counter hits this #, Enemy loses aggro

        // Each Enemy has its own pathfinder that stores the next 3 tiles the Enemy should
        // move to to get to the player. These 3 tiles are updated at each iteration of the
        // game loop via this.pathfinder.findPath().
        this.pathfinder = new EnemyPathfinder({ floor: params["game"].floor });
        this.positionedInTile = false;
        this.positionReference = [];

        // Currently, only Shooter uses these 3 variables, but they are in the
        // Enemy class because future Enemies may use them as well. These are
        // used to add randomness to the AI idle behavior
        this.chillCounter = 100;
        this.wanderLeft = 0;
        this.wanderRight = 0;

        // Knockback / stun
        this.knockedBack = false;
        this.knockedBackCounter = 0;
        this.stunned = false;
        this.stunnedCounter = 0;
        this.stunnedImage = new Image();
        this.stunnedImage.src = "./dist/assets/stunned.png";
    }


    /**
     * Method that's called instead of move() in Game. Takes care of some extra
     * logic and then calls move().
     * @returns - Null
     */
    action() {
        if (this.busy) return; // If busy, do nothing extra

        // Ending stun when stun counter reaches 55
        if (this.stunnedCounter >= 55) {
            this.stunnedCounter = 0;
            this.stunned = false;
        }
        // If stunned, keep adding to stun counter, do nothing extra
        if (this.stunned) {
            // Adjusting for refresh rate. The basic idea here is this.game.dt is 
            // a Number that more or less represents the refresh rate. The higher
            // the refresh rate, the lower the number. On higher refresh rate monitors,
            // the game loop happens much faster. Therefore, we use this.game.dt to 
            // slow everything down. In addition to slowing the velocity and animation
            // down, we also need to slow down all the counters in the game,
            // because they go up much faster on a high refresh rate monitor.
            this.stunnedCounter += (1 * (this.game.dt / (1000 / 60)));
            return;
        }
        // If knocked back, just do move logic
        if (this.knockedBack) {
            this.move(); // Takes us up a level to Shooter / Rusher move()
        } 
        // Under normal circumstances...
        else {
            // Calculating distance between player and enemy        
            let distanceToPlayer = Math.sqrt((this.game.player.position[0] - this.position[0]) ** 2 +
            (this.game.player.position[1] - this.position[1]) ** 2);
            
            this.pullAggro(distanceToPlayer); // Check if player has pulled aggro

            // Random num to determine Enemy behavior
            let randNum = Math.floor(Math.random() * this.firingRate);

            // Boolean - true if Enemy is facing player. Enemies only attack player when they are facing them
            let facingPlayer = ((this.position[0] - this.game.player.position[0]) >= 0 && this.direction === "left" ||
                (this.position[0] - this.game.player.position[0]) <= 0 && this.direction === "right");

            // If everything aligns, attack the Player
            if (randNum <= 5 && distanceToPlayer < this.attackRange && this.aggroed && facingPlayer && this.playerInLOS()) {
                this.startAttack(this.game.player.position);
            }
            // Else moves towards player - enemies can't move and shoot at same time - 1 or the other
            else {
                this.move(distanceToPlayer); // Takes us up a level to Shooter / Rusher move()
            }
        }
    }


    /**
     * Basic move function for Enemies.
     * @param {Number} distanceToPlayer - Passed number from action(). Only passed on to avoid calculating again.
     */
    move(distanceToPlayer) {
        // End knockback once counter is 15
        if (this.knockedBackCounter >= 15) {
            this.knockedBack = false;
        }
        // Increment knockback counter, call super for basic move logic
        if (this.knockedBack) {
            this.attacking = false;
            // If game is slowed, increment counter slower
            this.game.slowed ? 
                this.knockedBackCounter += (0.25 * (this.game.dt / (1000 / 60))) : // Adjusting for refresh rate
                this.knockedBackCounter += (1 * ((this.game.dt / (1000 / 60)))); // Adjusting for refresh rate
            super.move();
        }
        // Under normal circumstances...
        else {
            // --------- If enemy is close to player and aggroed, enemy will chase player down ---------
            if (this.aggroed) {

                // This method updates the moveList attribute of the pathfinder object.
                // This moveList is a list of tile indices that give a valid path to the Player.
                this.pathfinder.findPath(this.position, this.game.player.position);
                console.log(this.pathfinder.moveList)

                // Get first tile to move to
                let nextTileIndices = this.pathfinder.moveList[0];
                if (nextTileIndices === undefined) return; // If nothing in moveList, exit out

                // Get tile the Character is currently on
                let currentTileIndices = [Math.floor((this.position[1] + 5) / 40) + 1, Math.floor((this.position[0] - 5) / 40) + 1];

                // When the Character moves into a new tile, positionedInTile is set to false
                if (this.positionReference[0] !== currentTileIndices[0] || this.positionReference[1] !== currentTileIndices[1])
                    this.positionedInTile = false;

                // Sets the target position within the new tile that the Character must get to
                // before moving onto the next tile. This is to avoid collision with neighboring
                // walls and pits.
                let targetPosition = [(nextTileIndices[1] - 1) * 40 + 25, (nextTileIndices[0] - 1) * 40 + 15];

                // Once the Character makes it to the target position in the tile, 2 instance
                // variables are set. positionedInTile is set to true, which is used below when
                // setting velocity. Basically, it tells the Character to move to the next tile.
                // positionReference is set to the current tile. This is used above, so that when
                // the Character makes it to the next tile, we can flip positionedInTile back to
                // false, thus starting the cycle over again.
                if (Math.abs(targetPosition[0] - Math.floor(this.position[0])) <= 5 && 
                    Math.abs(targetPosition[1] - Math.floor(this.position[1])) <= 5 &&
                    this.positionedInTile === false) {

                    this.positionedInTile = true;
                    this.positionReference = currentTileIndices;
                }

                // Once properly positioned in the current tile, set nextTile to the next tile.
                if (this.positionedInTile) {
                    nextTileIndices = this.pathfinder.moveList[1];
                    if (nextTileIndices === undefined) return; // If nothing there, exit out
                }

                // Setting velocities
                let xDir;
                let yDir;
                // If already positioned, use tile indices rather than exact positions - less accurate, but smoother looking
                if (this.positionedInTile) {
                    xDir = Math.sign(nextTileIndices[1] - currentTileIndices[1]);
                    yDir = Math.sign(nextTileIndices[0] - currentTileIndices[0]);
                }
                // If not positioned, use exact positions to get the Character to the target position in the tile
                else {
                    // If the difference is less than 5, velocity is 0... Prevents shaking
                    Math.abs(targetPosition[0] - Math.floor(this.position[0])) <= 5 ? xDir = 0 :
                        xDir = Math.sign(targetPosition[0] - Math.floor(this.position[0]));
                    
                    Math.abs(targetPosition[1] - Math.floor(this.position[1])) <= 5 ? yDir = 0 :
                        yDir = Math.sign(targetPosition[1] - Math.floor(this.position[1]));
                }
                this.velocity = [xDir * this.speed, yDir * this.speed]; // Sets velocity with custom class speed

                // Set direction, status
                this.position[0] - this.game.player.position[0] < 0 ? this.direction = "right" : this.direction = "left";
                this.status = "moving";
            }
            // If time is slowed, slow velocity
            if (this.game.slowed) {
                this.velocity[0] /= 4;
                this.velocity[1] /= 4;
            }
            super.move();
        }
    }


    /**
     * Normal draw() method that handles the Enemy-specific animations, and then
     * calls the Character draw() method to handle the animations it has in common
     * with other Characters.
     * @param {CanvasRenderingContext2D} ctx - 2D canvas context to draw board
     */
    draw(ctx) {
        // For some bizarro reason, I have to do this here instead of in startKnockback, which would make way more sense
        // Basically, if an enemy is knockedBack, attacking is canceled and they're no longer busy
        if (this.knockedBack || this.stunned) {
            this.attacking = false;
            this.busy = false;
        }

        // Draw health bar
        if (this.health !== this.maxHealth) {
            ctx.fillStyle = "white";
            ctx.fillRect(this.position[0] + 15, this.position[1], this.maxHealth, 10);

            ctx.fillStyle = "#32CD32";
            ctx.fillRect(this.position[0] + 15, this.position[1], this.maxHealth * (this.health / this.maxHealth), 10)
        }

        // Animate if attacking
        if (this.attacking) {
            let stepXCoord = this._selectFrame(18 / this.animationPace);
            if (this.direction === "right") {
                this.drawing.src = `${this.images}/attack_r.png`;
            } else {
                this.drawing.src = `${this.images}/attack_l.png`;
            }
            if (!this.game.slowed && Math.floor(this.step % 9) === 0) this.constructor.name === "Shooter" ? this.launchProjectile() : this.swing();
            if (this.game.slowed && Math.floor(this.step % 36) === 0) this.constructor.name === "Shooter" ? this.launchProjectile() : this.swing();
            if (stepXCoord >= 144) {
                this.attacking = false;
                this.busy = false;
            }
            ctx.drawImage(this.drawing, stepXCoord, 0, 40, 80, this.position[0], this.position[1], 75, 90);
        }

        // Animate if knocked back
        else if (this.knockedBack) {
            if (this.direction === "right") {
                this.drawing.src = `${this.images}/hurt_r.png`;
                ctx.drawImage(this.drawing, (this.knockedBackCounter < 5 ? 42 : 0), 0, 40, 80, this.position[0], this.position[1], 75, 90);

            } else {
                this.drawing.src = `${this.images}/hurt_l.png`;
                ctx.drawImage(this.drawing, (this.knockedBackCounter > 5 ? 15 : 20), 0, 40, 80, this.position[0], this.position[1], 75, 90);
            }
        }
        // Animate if stunned
        else if (this.stunned) {
            let stepXCoord = this._selectFrame(18 / this.animationPace);
            if (this.direction === "right") {
                this.drawing.src = `${this.images}/idle_r.png`;
            } else {
                this.drawing.src = `${this.images}/idle_l.png`;
            }
            // Draw stun icon
            ctx.filter = "invert(1)";
            ctx.drawImage(this.stunnedImage, this.position[0] + 15, this.position[1] - 30, 30, 30);
            ctx.filter = "invert(0)";

            ctx.drawImage(this.drawing, stepXCoord, 0, 40, 80, this.position[0], this.position[1], 75, 90);
        }

        // Animate if idle / moving
        else if (!this.attacking) super.draw(ctx);
    }


    /**
     * This method is called at the beginning of each step for each Enemy (near the
     * top of the action() method). It checks if the Enemy meets all the conditions
     * to be aggroed by the Player. If it does, this.aggroed is set to true and the 
     * Enemy starts chasing / attacking the Player. If it doesn't, rather then immediately
     * lose aggro, the Enemy slowly loses aggro. This allows for behavior such as LOSing
     * and Enemy until it deaggros.
     * 
     * @param {Number} distanceToPlayer - Length of line drawn between Enemy and 
     * Player. Only passed in because we happen to have distanceToPlayer where we 
     * call this, so we can just pass it in and avoid doing the calculation again.
     */
    pullAggro(distanceToPlayer) {
        let facingPlayer = ((this.position[0] - this.game.player.position[0]) >= 0 && this.direction === "left" ||
            (this.position[0] - this.game.player.position[0]) <= 0 && this.direction === "right");

        // To aggro, Enemy must be facing the Player and within LOS / 300px of the Player
        if (facingPlayer && this.playerInLOS() && distanceToPlayer < 300) {
            this.aggroed = true;
            this.losingAggroCounter = 0; // Reset losing aggro counter
        } else if (this.aggroed) {
            // If Enemy doesn't meet all 3 of these conditions, they start to lose
            // aggro - once losingAggroCounter reaches a certain number, they deaggro
            this.losingAggroCounter++;
        }

        if (this.losingAggroCounter >= this.loseAggroThreshold) {
            this.aggroed = false;
            this.loseAggroThreshold = 125; // Reset threshold
            this.losingAggroCounter = 0; // Reset losing aggro counter
        }
    }


    /**
     * A helper method that's called in a couple move()'s to check if the player 
     * is in LOS of the enemy. Affects AI behavior. The basic logic is to draw a 
     * line from one character to the other, find the mx + b, and then iterate 
     * through the x values, checking if any tile along the way is a wall.
     * @returns - A boolean, true if player is in LOS of the enemy, false if not.
     */
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

    
    /**
     * This method checks wall collision for Enemies, and then calls the Character
     * validMove() to check all other collisions.
     * 
     * The purpose of this method is to add custom adjustments for checking wall 
     * collisions for Enemies. Basically, with Enemies, the adjustments are larger 
     * so that Enemies collide with walls before the Player would. This is because 
     * it looks really bad to have Enemy sprites slightly clipping into walls. This 
     * happens with the Player sprite as well, but is necessary so that the player 
     * has plenty of room to move and feels like they collide with the wall at the 
     * right time. Realistically, this is a bandaid fix for choosing the wrong sprites
     * to use for a top down game.
     * @returns - Boolean, true if the move is valid, false if invalid
     */
    validMove() {
        let futureXCoord = this.position[0] + this.velocity[0];
        let futureYCoord = this.position[1] + this.velocity[1];

        // Checks four tiles so that I can make custom adjustments in all four directions. Note that we
        // are only getting the indices here, not the actual tiles. This is so that we can check that the
        // indices are in bounds of the tile array (aka, not negative or larger than the array). If we 
        // didn't check this, we would get a rare nasty error when trying to spawn enemies in.
        // Old adjustment values were 22, 20, 15, 10 - had to shrink hitboxes to accomodate pathfinding
        let xIndicesNegative = [Math.floor((futureYCoord + 5) / 40) + 1, Math.floor((futureXCoord - 10) / 40) + 1];
        let xIndicesPositive = [Math.floor((futureYCoord + 5) / 40) + 1, Math.floor((futureXCoord + 8) / 40) + 1];
        let yIndicesNegative = [Math.floor((futureYCoord + 8) / 40) + 1, Math.floor((futureXCoord - 5) / 40) + 1];
        let yIndicesPositive = [Math.floor((futureYCoord - 3) / 40) + 1, Math.floor((futureXCoord - 5) / 40) + 1];

        // Bug fix - if any of our indices are negative or out of bounds, we get a nasty error. This can
        // happen when spawning in enemies (spawnEnemies in Game uses validMove to check if the spawn position
        // is valid).
        let cols = this.game.floor.numCols;
        let rows = this.game.floor.numRows;
        if (xIndicesNegative[0] < 0 || xIndicesNegative[1] < 0 || xIndicesPositive[0] < 0 || xIndicesPositive[1] < 0 ||
            yIndicesNegative[0] < 0 || yIndicesNegative[1] < 0 || yIndicesPositive[0] < 0 || yIndicesPositive[1] < 0 || 
            xIndicesNegative[0] > rows - 1 || xIndicesNegative[1] > cols - 1 || xIndicesPositive[0] > rows - 1 || xIndicesPositive[1] > cols - 1 ||
            yIndicesNegative[0] > rows - 1 || yIndicesNegative[1] > cols - 1 || yIndicesPositive[0] > rows - 1 || yIndicesPositive[1] > cols - 1) {
            // this.dead() is a bug fix. There's a bizarre and very rare bug where, when spawning an Enemy, 
            // it spawns them in a valid position and then immediately seems to move them out of bounds. This bug
            // appeared when I implemented game.dt (refresh rate fix). Likely it has something to do with not
            // using the adjusted velocities when checking collision. Even then though, that oversight doesn't 
            // explain the bizarre teleporting of position and why this only happens immediately after being 
            // spawned in. Being that this is such a rare bug and not particularly game breaking, rather than
            // fix the source of this, we can simply remove the Enemy from the Game if they are out of bounds.
            this.dead();
            return false;
        }
        
        // Indices are valid, now we can get the tiles
        let xAdjustedTileNegative = this.game.floor.floorTiles[xIndicesNegative[0]][xIndicesNegative[1]];
        let xAdjustedTilePositive = this.game.floor.floorTiles[xIndicesPositive[0]][xIndicesPositive[1]];
        let yAdjustedTileNegative = this.game.floor.floorTiles[yIndicesNegative[0]][yIndicesNegative[1]];
        let yAdjustedTilePositive = this.game.floor.floorTiles[yIndicesPositive[0]][yIndicesPositive[1]];

        // If any of the tiles are a wall, the move is invalid
        if ((xAdjustedTileNegative instanceof SpecialTile && xAdjustedTileNegative.type === "wall") ||
            (xAdjustedTileNegative[0] instanceof Array && xAdjustedTileNegative[1].type === "wall") ||
            (xAdjustedTilePositive instanceof SpecialTile && xAdjustedTilePositive.type === "wall") ||
            (xAdjustedTilePositive[0] instanceof Array && xAdjustedTilePositive[1].type === "wall") ||
            (yAdjustedTileNegative instanceof SpecialTile && yAdjustedTileNegative.type === "wall") ||
            (yAdjustedTileNegative[0] instanceof Array && yAdjustedTileNegative[1].type === "wall") ||
            (yAdjustedTilePositive instanceof SpecialTile && yAdjustedTilePositive.type === "wall") ||
            (yAdjustedTilePositive[0] instanceof Array && yAdjustedTilePositive[1].type === "wall")) {

            // If a character is knocked into a wall, the knockback is halted,
            // the character is stunned, and the character takes small damage
            if (this.knockedBack) {
                this.knockedBack = false;
                this.stunned = true;
                this.stunnedCounter = 0;
                this.velocity = [0, 0];
                this.step = 0;
                this.takeDamage(5);
            }
            return false;
        }
        return super.validMove() ? true : false;
    }


    /**
     * Simple method that's called in kick() when a kick lands on an Enemy. Initiates
     * a knockback by setting this.knockedBack to true.
     * @param {String} knockedDirection - Specified in kick(), "up", "down", "left", or "right"
     */
    startKnockback(knockedDirection) {
        // Setting instance vars
        this.knockedBack = true;
        this.knockedBackCounter = 0;
        this.step = 0;
        
        // Figuring out direction to knock enemy and setting velocity
        switch (knockedDirection) {
            case "up":
                this.velocity[0] = 0;
                this.velocity[1] = -8;
                break;

            case "down":
                this.velocity[0] = 0;
                this.velocity[1] = 8;
                break;

            case "right":
                this.velocity[0] = 8;
                this.velocity[1] = 0;
                break;

            case "left":
                this.velocity[0] = -8;
                this.velocity[1] = 0;
                break;
        
            default:
                break;
        }

        // If time is slowed, cut the velocity
        if (this.game.slowed) {
            this.velocity[0] === 0 ? this.velocity[1] /= 4 : this.velocity[0] /= 4;
        }
    }


    /**
     * Takes a specified amount of damage and turns the Enemy towards the Player.
     * @param {Number} damage 
     */
    takeDamage(damage) {
        // When an Enemy takes damage, you aggro them. Additionally, the Enemy
        // is extra determined to kill you, and thus it takes longer to deaggro them
        // (the threshold is set to 45 instead of 15).
        this.aggroed = true;
        this.loseAggroThreshold = 275;

        // Turns enemy in the direction of the player
        this.position[0] - this.game.player.position[0] >= 0 ? this.direction = "left" : this.direction = "right";
        super.takeDamage(damage);
    }


    /**
     * Removes the enemy from Game.
     */
    dead() {
        this.remove();
    }
}


module.exports = Enemy;
