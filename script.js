/* =========================================
   CONSTANTES GLOBALES
   ========================================= */
const CELL_SIZE    = 5;
const CELL_EMPTY   = 0;
const CELL_PLAYER1 = 1; // Trace du joueur 1
const CELL_PLAYER2 = 2; // Trace du joueur 2

/* =========================================
   CLASSE LIGHTCYCLE
   ========================================= */
class LightCycle {
    constructor(startX, startY, color, controls, initialVY) {
        this.x       = startX;
        this.y       = startY;
        this.color   = color;
        this.vx      = 0;
        this.vy      = initialVY; // Direction initiale (-1 = haut, 1 = bas)
        this.alive   = true;
        this.controls = controls;
    }

    changeDirection(keyCode) {
        if (!this.alive) return;
        if (keyCode === this.controls.up    && this.vy === 0) { this.vx = 0;  this.vy = -1; }
        if (keyCode === this.controls.down  && this.vy === 0) { this.vx = 0;  this.vy =  1; }
        if (keyCode === this.controls.left  && this.vx === 0) { this.vx = -1; this.vy =  0; }
        if (keyCode === this.controls.right && this.vx === 0) { this.vx =  1; this.vy =  0; }
    }

    getNextPosition() {
        return { x: this.x + this.vx, y: this.y + this.vy };
    }

    move(newX, newY) { this.x = newX; this.y = newY; }

    die() { this.alive = false; }

    draw(ctx, xOffset, yOffset) {
        ctx.fillStyle = this.alive ? "#ffffff" : "#555555";
        ctx.fillRect(xOffset + this.x * CELL_SIZE, yOffset + this.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
}

/* =========================================
   CLASSE TRONGAME
   ========================================= */
class TronGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx    = this.canvas.getContext("2d");

        this.cols = this.canvas.width  / CELL_SIZE;
        this.rows = this.canvas.height / CELL_SIZE;
        this.x0   = (this.canvas.width  - this.cols * CELL_SIZE) / 2;
        this.y0   = (this.canvas.height - this.rows * CELL_SIZE) / 2;

        this.grid = this.createGrid();

        // Joueur 1 : bas-centre, monte (touches flèches)
        this.player1 = new LightCycle(
            Math.floor(this.cols / 2), this.rows - 2,
            "#ff0000",
            { up: 38, down: 40, left: 37, right: 39 },
            -1
        );

        // Joueur 2 : haut-centre, descend (touches WASD) — position opposée au J1
        this.player2 = new LightCycle(
            Math.floor(this.cols / 2), 2,
            "#00ff00",
            { up: 87, down: 83, left: 65, right: 68 },
            1
        );

        this.grid[this.player1.x][this.player1.y] = CELL_PLAYER1;
        this.grid[this.player2.x][this.player2.y] = CELL_PLAYER2;

        document.addEventListener('keydown', (e) => this.handleInput(e));
    }

    createGrid() {
        let arr = [];
        for (let c = 0; c < this.cols; c++) {
            arr[c] = new Array(this.rows).fill(CELL_EMPTY);
        }
        return arr;
    }

    handleInput(e) {
        this.player1.changeDirection(e.keyCode);
        this.player2.changeDirection(e.keyCode);
    }

    update() {
        // Note : on traite J1 puis J2 séquentiellement.
        // Limitation : si les deux meurent au même tick, J2 "perd" car J1 est traité en premier.
        // Cette limitation est corrigée à l'étape 4.

        if (!this.player1.alive && !this.player2.alive) return;

        // --- Joueur 1 ---
        if (this.player1.alive) {
            const next1 = this.player1.getNextPosition();
            if (this.checkCollision(next1.x, next1.y)) {
                this.player1.die();
                console.log("Joueur 2 gagne !");
            } else {
                this.grid[next1.x][next1.y] = CELL_PLAYER1;
                this.player1.move(next1.x, next1.y);
            }
        }

        // --- Joueur 2 ---
        if (this.player2.alive) {
            const next2 = this.player2.getNextPosition();
            if (this.checkCollision(next2.x, next2.y)) {
                this.player2.die();
                console.log("Joueur 1 gagne !");
            } else {
                this.grid[next2.x][next2.y] = CELL_PLAYER2;
                this.player2.move(next2.x, next2.y);
            }
        }
    }

    checkCollision(x, y) {
        // Collision avec les bords
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return true;
        // Collision avec une trace (J1 ou J2)
        if (this.grid[x][y] !== CELL_EMPTY) return true;
        return false;
    }

    draw() {
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Traces (couleur selon le joueur)
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                if (this.grid[i][j] === CELL_PLAYER1) {
                    this.ctx.fillStyle = this.player1.color;
                } else if (this.grid[i][j] === CELL_PLAYER2) {
                    this.ctx.fillStyle = this.player2.color;
                } else {
                    continue;
                }
                this.ctx.fillRect(
                    this.x0 + i * CELL_SIZE + 1,
                    this.y0 + j * CELL_SIZE + 1,
                    CELL_SIZE - 2, CELL_SIZE - 2
                );
            }
        }

        // Têtes des joueurs
        this.player1.draw(this.ctx, this.x0, this.y0);
        this.player2.draw(this.ctx, this.x0, this.y0);

        // Message Game Over
        if (!this.player1.alive || !this.player2.alive) {
            this.drawMessage("GAME OVER");
        }
    }

    drawMessage(text) {
        this.ctx.fillStyle = "rgba(0,0,0,0.6)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#008CFF";
        this.ctx.font = "bold 48px monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
    }

    start() {
        setInterval(() => {
            this.update();
            this.draw();
        }, 100);
    }
}

const game = new TronGame("myCanvas");
game.start();
