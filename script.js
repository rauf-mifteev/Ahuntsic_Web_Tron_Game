// Étapes  
// Étape 07 : Trois buttons pour contrôler le jeu : Start, Pause, Restart
// Étape 08 : Gérer le déplacement avec la souris
// Étape 09 : Gérer le fil d'exécution avec setTimeout() au lieu de setInterval() 
// Étape 10 : Gérer l’accélération

const CELL_SIZE    = 5;
const CELL_EMPTY   = 0;
const CELL_PLAYER1 = 1;
const CELL_PLAYER2 = 2;

// Paramètres d'accélération - step 10
const INTERVAL_START = 200;  // Délai initial (ms) — lent
const INTERVAL_MIN   = 50;   // Délai minimum (ms) — limite de vitesse
const ACCEL_STEP     = 1;    // Réduction du délai à chaque tick (ms)

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

    setDirection(vx, vy) {
        if (!this.alive) return;
        if (vx !== 0 && this.vx === 0) { this.vx = vx; this.vy = 0; }
        if (vy !== 0 && this.vy === 0) { this.vx = 0;  this.vy = vy; }
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

        this.scores   = { p1: 0, p2: 0, draws: 0 };
        this.result   = null;
        this.running  = false;
        this.interval = INTERVAL_START; // Délai au debut, diminue à chaque tick

        this.mouseX0 = 0;
        this.mouseY0 = 0;

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

        document.getElementById("color1").addEventListener("input", (e) => {
            this.player1.color = e.target.value;
        });
        document.getElementById("color2").addEventListener("input", (e) => {
            this.player2.color = e.target.value;
        });


        // Stocker les coordonnées de souris au début du glissement - step 8 
        this.canvas.addEventListener("mousedown", (e) => {
            this.mouseX0 = e.clientX;
            this.mouseY0 = e.clientY;
        });

        // Calculer les deltas à la fin du glissement et changer la direction -step 8
        this.canvas.addEventListener("mouseup", (e) => {
            const dx = e.clientX - this.mouseX0;
            const dy = e.clientY - this.mouseY0;
            if (Math.abs(dx) > Math.abs(dy)) {
                this.player1.setDirection(dx > 0 ? 1 : -1, 0);
            } else {
                this.player1.setDirection(0, dy > 0 ? 1 : -1);
            }
        });

        this.draw();
    }

    createGrid() {
        let arr = [];
        for (let c = 0; c < this.cols; c++) arr[c] = new Array(this.rows).fill(CELL_EMPTY);
        return arr;
    }

    handleInput(e) {
        if (e.keyCode === 13 && this.result !== null) { this.restartRound(); return; }
        this.player1.changeDirection(e.keyCode);
        this.player2.changeDirection(e.keyCode);
    }

    // Bouton Pause : arrête la boucle de jeu - step 7

    pauseGame() { this.running = false; }

    // Bouton Start : (re)démarre la boucle de jeu - step 7

    startGame() {
        if (!this.running) { this.running = true; this.loop(); }
    }
    
    // Bouton Restart : remet le tour à zéro sans effacer les scores - step 7
    restartRound() {
        this.result   = null;
        this.running  = false;
        this.interval = INTERVAL_START; // Réinitialise la vitesse au redémarrage
        this.grid     = this.createGrid();

        this.player1.x = Math.floor(this.cols / 2); this.player1.y = this.rows - 2;
        this.player1.vx = 0; this.player1.vy = -1; this.player1.alive = true;

        this.player2.x = Math.floor(this.cols / 2); this.player2.y = 2;
        this.player2.vx = 0; this.player2.vy = 1;  this.player2.alive = true;

        this.grid[this.player1.x][this.player1.y] = CELL_PLAYER1;
        this.grid[this.player2.x][this.player2.y] = CELL_PLAYER2;
        this.draw();
    }

    // Quand running = false, on sort sans planifier un autre setTimeout - step 9

    loop() {
	//console.log("La boucle de jeu tourne..."); //Verification step 9
        if (!this.running) return;

        this.update();
        this.draw();

        // Accélération progressive - step 10
        
        this.interval = Math.max(INTERVAL_MIN, this.interval - ACCEL_STEP);
	// Se re-planifie une seule fois - step 9
        setTimeout(() => this.loop(), this.interval);
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
            this.result = "draw"; this.scores.draws++;
            this.running = false;
        } else if (p1crashes) {
            this.player1.die();
            this.result = "player2"; this.scores.p2++;
            this.running = false;
        } else if (p2crashes) {
            this.player2.die();
            this.result = "player1"; this.scores.p1++;
            this.running = false;
        } else {
            this.grid[next1.x][next1.y] = CELL_PLAYER1;
            this.player1.move(next1.x, next1.y);
            this.grid[next2.x][next2.y] = CELL_PLAYER2;
            this.player2.move(next2.x, next2.y);
        }

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
        this.ctx.fillText("ENTER pour rejouer  |  Restart pour recommencer", this.canvas.width / 2, this.canvas.height / 2 + 30);
    }

    start() { this.draw(); }
}

const game = new TronGame("myCanvas");
game.start();
