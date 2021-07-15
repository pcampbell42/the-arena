const Character = require("./character.js");

class Enemy extends Character {
    constructor(params) {
        super(params);
        this.images = "./dist/assets/shooter";
        this.health = 30;
        this.chillCounter = 100; // Adding randomness to AI behavior
        // this.sprintCounter = 50; // Adding more randomness to AI behavior
        this.wanderLeft = 0;
        this.wanderRight = 0;
        this.firingRate = 300; // Way to set difficulty, lower the harder
    }

    action(dt) {
        if (this.busy) return;

        // Calculating distance between player and enemy        
        let distanceToPlayer = Math.sqrt((this.game.player.position[0] - this.position[0]) ** 2 +
            (this.game.player.position[1] - this.position[1]) ** 2);

        let randNum = Math.floor(Math.random() * this.firingRate);
        if (randNum <= 5 && distanceToPlayer < 300) { // 1 in firingRate chance to fire at player
            // this.shoot(this.game.player.position);
            this.startAttack(this.game.player.position);
        } else { // Else moves towards player - enemies can't move and shoot at same time - 1 or the other
            this.move(dt, distanceToPlayer);
        }
    }

    move(dt, distanceToPlayer) {
        let randNum = Math.floor(Math.random() * 200); // For later use

        // --------- If enemy is close to player, enemy will chase player down ---------
        if (distanceToPlayer < 300) {
            // --------- Getting the direction the player is in and setting velocity ---------
            let xDir = Math.sign(this.game.player.position[0] - this.position[0]);
            let yDir = Math.sign(this.game.player.position[1] - this.position[1]);
            this.velocity = [xDir, yDir]; // The AI is very slow
            (Math.sign(this.velocity[0]) === -1) ? this.direction = "left" : this.direction = "right";
        } else {
            // --------- AI decides to chill for a bit ---------
            if (randNum <= 10) this.status = "idle";

            // --------- AI is chilling, standing around ---------
            if (this.status === "idle") {
                this.chillCounter -= 1;
                if (this.chillCounter === 0) {
                    this.status = "moving";
                    this.chillCounter = 300;
                }
                return; // Break out
            }

            // --------- AI moves randomly ---------
            let possibleDirs = [1, -1];

            if (this.wanderLeft > 0) {
                this.velocity = [-1 * Math.random(), possibleDirs[Math.floor(Math.random() * 2)] * Math.random()];
                this.wanderLeft--;
            } else if (this.wanderRight > 0) {
                this.velocity = [Math.random(), possibleDirs[Math.floor(Math.random() * 2)] * Math.random()];
                this.wanderRight--;
            } else {
                this.velocity = [possibleDirs[Math.floor(Math.random() * 2)] * Math.random(), 
                                possibleDirs[Math.floor(Math.random() * 2)] * Math.random()];
                (Math.sign(this.velocity[0]) === -1) ? this.wanderLeft = 50 : this.wanderRight = 50;
                (Math.sign(this.velocity[0]) === -1) ? this.direction = "left" : this.direction = "right";
            }
        }

        if (this.game.slowed) {
            this.velocity[0] /= 4;
            this.velocity[1] /= 4;
        }
        super.move(dt); // Bulk of move work happens here
    }

    draw(ctx) {
        // --------- If not full health, display health bar ---------
        if (this.health !== 30) {
            ctx.fillStyle = "white";
            ctx.fillRect(this.position[0] + 15, this.position[1], 30, 10);

            ctx.fillStyle = "#32CD32";
            ctx.fillRect(this.position[0] + 15, this.position[1], 30 * (this.health / 30), 10)
        }

        if (this.attacking) {
            let stepXCoord = this._selectFrame(18 / this.animationPace);
            if (this.direction === "right") {
                this.drawing.src = `${this.images}/attack_r.png`;
            } else {
                this.drawing.src = `${this.images}/attack_l.png`;
            }
            if (!this.game.slowed && this.step % 9 === 0) this.launchProjectile();
            if (this.game.slowed && this.step % 36 === 0) this.launchProjectile();
            if (stepXCoord >= 144) {
                this.attacking = false;
                this.busy = false;
            }
            ctx.drawImage(this.drawing, stepXCoord, 0, 40, 80, this.position[0], this.position[1], 75, 90);

        } else {
            super.draw(ctx); // Handles bulk of drawing
        }
    }

    takeDamage(damage) {
        if (!this.busy) this.startAttack(this.game.player.position); // Enemy shoots in players direction if hit
        super.takeDamage(damage);
    }

    dead() {
        this.game.numEnemiesKilled += 1;
        this.remove();
    }
}

module.exports = Enemy;