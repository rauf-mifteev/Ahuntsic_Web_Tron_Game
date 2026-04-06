const CELL_SIZE    = 5;
const CELL_EMPTY   = 0;
const CELL_PLAYER1 = 1;
const CELL_PLAYER2 = 2;

class LightCycle {
    constructor(startX, startY, color, controls, initialVY) {
        this.x        = startX;
        this.y        = startY;
        this.color    = color;
        this.vx       = 0;
        this.vy       = initialVY;
        this.alive    = true;
        this.controls = controls;
    }

    changeDirection(keyCode) {
        if (!this.alive) return;
        if (keyCode === this.controls.up    && this.vy === 0) { this.vx = 0;  this.vy = -1; }
        if (keyCode === this.controls.down  && this.vy === 0) { this.vx = 0;  this.vy =  1; }
        if (keyCode === this.controls.left  && this.vx === 0) { this.vx = -1; this.vy =  0; }
        if (keyCode === this.controls.right && this.vx === 0) { this.vx =  1; this.vy =  0; }
    }

    getNextPosition() { return { x: this.x + this.vx, y: this.y + this.vy }; }
    move(newX, newY)  { this.x = newX; this.y = newY; }
    die()             { this.alive = false; }

    draw(ctx, xOffset, yOffset) {
        ctx.fillStyle = this.alive ? "#ffffff" : "#555555";
        ctx.fillRect(xOffset + this.x * CELL_SIZE, yOffset + this.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
}

class TronGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx    = this.canvas.getContext("2d");

        this.cols = this.canvas.width  / CELL_SIZE;
        this.rows = this.canvas.height / CELL_SIZE;
        this.x0   = (this.canvas.width  - this.cols * CELL_SIZE) / 2;
        this.y0   = (this.canvas.height - this.rows * CELL_SIZE) / 2;

        // Scores conservés entre les tours
        this.scores = { p1: 0, p2: 0, draws: 0 };
        this.result = null;

        this.player1 = new LightCycle(
            Math.floor(this.cols / 2), this.rows - 2,
            "#ff0000", { up: 38, down: 40, left: 37, right: 39 }, -1
        );
        this.player2 = new LightCycle(
            Math.floor(this.cols / 2), 2,
            "#00ff00", { up: 87, down: 83, left: 65, right: 68 }, 1
        );

        this.grid = this.createGrid();
        this.grid[this.player1.x][this.player1.y] = CELL_PLAYER1;
        this.grid[this.player2.x][this.player2.y] = CELL_PLAYER2;

        document.addEventListener('keydown', (e) => this.handleInput(e));
    }

    createGrid() {
        let arr = [];
        for (let c = 0; c < this.cols; c++) arr[c] = new Array(this.rows).fill(CELL_EMPTY);
        return arr;
    }

    handleInput(e) {
        // Touche ENTER pendant Game Over - nouveau tour
        if (e.keyCode === 13 && this.result !== null) {
            this.resetRound();
            return;
        }
        this.player1.changeDirection(e.keyCode);
        this.player2.changeDirection(e.keyCode);
    }

    // Remet les positions et la grille à zéro (les scores restent)
    resetRound() {
        this.result  = null;
        this.grid    = this.createGrid();

        this.player1.x = Math.floor(this.cols / 2);
        this.player1.y = this.rows - 2;
        this.player1.vx = 0; this.player1.vy = -1;
        this.player1.alive = true;

        this.player2.x = Math.floor(this.cols / 2);
        this.player2.y = 2;
        this.player2.vx = 0; this.player2.vy = 1;
        this.player2.alive = true;

        this.grid[this.player1.x][this.player1.y] = CELL_PLAYER1;
        this.grid[this.player2.x][this.player2.y] = CELL_PLAYER2;
    }

    update() {
        if (!this.player1.alive || !this.player2.alive) return;

        const next1 = this.player1.getNextPosition();
        const next2 = this.player2.getNextPosition();

        const p1crashes = this.checkCollision(next1.x, next1.y);
        const p2crashes = this.checkCollision(next2.x, next2.y);
        const headOn    = (next1.x === next2.x && next1.y === next2.y);

        if ((p1crashes && p2crashes) || headOn) {
            this.player1.die(); this.player2.die();
            this.result = "draw";
            this.scores.draws++;
        } else if (p1crashes) {
            this.player1.die();
            this.result = "player2";
            this.scores.p2++;
        } else if (p2crashes) {
            this.player2.die();
            this.result = "player1";
            this.scores.p1++;
        } else {
            this.grid[next1.x][next1.y] = CELL_PLAYER1;
            this.player1.move(next1.x, next1.y);
            this.grid[next2.x][next2.y] = CELL_PLAYER2;
            this.player2.move(next2.x, next2.y);
        }

        // Mettre à jour l'affichage des scores dans le DOM
        if (this.result) this.updateScoreDisplay();
    }

    checkCollision(x, y) {
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return true;
        if (this.grid[x][y] !== CELL_EMPTY) return true;
        return false;
    }

    updateScoreDisplay() {
        document.getElementById("score-p1").textContent    = "J1 : " + this.scores.p1;
        document.getElementById("score-draws").textContent = "Nuls : " + this.scores.draws;
        document.getElementById("score-p2").textContent    = "J2 : " + this.scores.p2;
    }

    draw() {
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                if (this.grid[i][j] === CELL_PLAYER1)      this.ctx.fillStyle = this.player1.color;
                else if (this.grid[i][j] === CELL_PLAYER2) this.ctx.fillStyle = this.player2.color;
                else continue;
                this.ctx.fillRect(this.x0 + i * CELL_SIZE + 1, this.y0 + j * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            }
        }

        this.player1.draw(this.ctx, this.x0, this.y0);
        this.player2.draw(this.ctx, this.x0, this.y0);

        if (this.result) this.drawResult();
    }

    drawResult() {
        const messages = { player1: "JOUEUR 1 GAGNE !", player2: "JOUEUR 2 GAGNE !", draw: "MATCH NUL !" };
        this.ctx.fillStyle = "rgba(0,0,0,0.6)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#008CFF";
        this.ctx.font = "bold 48px monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText(messages[this.result], this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.fillStyle = "#fff";
        this.ctx.font = "22px monospace";
        this.ctx.fillText("Appuyez ENTER pour rejouer", this.canvas.width / 2, this.canvas.height / 2 + 30);
    }

    start() {
        setInterval(() => { this.update(); this.draw(); }, 100);
    }
}

const game = new TronGame("myCanvas");
game.start();
