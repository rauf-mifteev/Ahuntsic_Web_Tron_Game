/* =========================================
   CONSTANTES GLOBALES
   ========================================= */
const CELL_SIZE = 5;
const CELL_EMPTY = 0;
const CELL_OCCUPIED = 1;

/* =========================================
   CLASSE LIGHTCYCLE
   Rôle : Gère la moto, sa position et son mouvement
   ========================================= */
class LightCycle {
    constructor(startX, startY, color, controls) {
        this.x = startX;
        this.y = startY;
        this.color = color;
        this.vx = 0;
        this.vy = -1; // Commence vers le haut
        this.alive = true;

        // Assignation des touches )
        this.controls = controls;
    }

    // Met à jour la direction selon la touche appuyée
    changeDirection(keyCode) {
        if (!this.alive) return;

        if (keyCode === this.controls.up && this.vy === 0) {
            this.vx = 0; this.vy = -1;
        } else if (keyCode === this.controls.down && this.vy === 0) {
            this.vx = 0; this.vy = 1;
        } else if (keyCode === this.controls.left && this.vx === 0) {
            this.vx = -1; this.vy = 0;
        } else if (keyCode === this.controls.right && this.vx === 0) {
            this.vx = 1; this.vy = 0;
        }
    }

    // Calcule la prochaine position
    getNextPosition() {
        return { x: this.x + this.vx, y: this.y + this.vy };
    }

    // Applique le mouvement
    move(newX, newY) { this.x = newX; this.y = newY; }

    die() { this.alive = false; }

    draw(ctx, xOffset, yOffset) {
        ctx.fillStyle = this.alive ? "#ffffff" : "#555555";
        ctx.fillRect(
            xOffset + this.x * CELL_SIZE,
            yOffset + this.y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
        );
    }
}

/* =========================================
   CLASSE TRONGAME
   Rôle : Gère le moteur du jeu, la grille et le rendu
   ========================================= */
class TronGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");

        // Calculs de la grille
        this.cols = this.canvas.width / CELL_SIZE;
        this.rows = this.canvas.height / CELL_SIZE;
        this.x0 = (this.canvas.width - this.cols * CELL_SIZE) / 2;
        this.y0 = (this.canvas.height - this.rows * CELL_SIZE) / 2;

        this.grid = this.createGrid();

        // Création du joueur (Au centre, en bas)
        this.player1 = new LightCycle(
            this.cols / 2,
            this.rows - 2,
            "#ffffff",
            { up: 38, down: 40, left: 37, right: 39 }
        );

        // Marquer la position de départ
        this.grid[this.player1.x][this.player1.y] = CELL_OCCUPIED;

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
    }

    update() {
        if (!this.player1.alive) return;

        const nextPos = this.player1.getNextPosition();

        if (this.checkCollision(nextPos.x, nextPos.y)) {
            this.player1.die();
            console.log("Game Over");
        } else {
            this.grid[nextPos.x][nextPos.y] = CELL_OCCUPIED;
            this.player1.move(nextPos.x, nextPos.y);
        }
    }

    checkCollision(x, y) {
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return true;
        if (this.grid[x][y] === CELL_OCCUPIED) return true;
        return false;
    }

    draw() {
        // Fond
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Traces
        this.ctx.fillStyle = "#ff0000";
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                if (this.grid[i][j] === CELL_OCCUPIED) {
                    this.ctx.fillRect(
                        this.x0 + i * CELL_SIZE + 1,
                        this.y0 + j * CELL_SIZE + 1,
                        CELL_SIZE - 2,
                        CELL_SIZE - 2
                    );
                }
            }
        }

        // Tête du joueur
        this.player1.draw(this.ctx, this.x0, this.y0);
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
