const DIFFICULTIES = {
    beginner: { rows: 9, cols: 9, mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 16, cols: 30, mines: 99 }
};

class Game {
    constructor(difficulty = 'beginner') {
        this.difficulty = difficulty;
        this.rows = DIFFICULTIES[difficulty].rows;
        this.cols = DIFFICULTIES[difficulty].cols;
        this.totalMines = DIFFICULTIES[difficulty].mines;
        this.board = [];
        this.mines = new Set();
        this.gameOver = false;
        this.win = false;
        this.firstClick = true;
        this.flags = 0;
        this.revealedCount = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.cellsToReveal = this.rows * this.cols - this.totalMines;
    }

    initialize() {
        this.stopTimer();
        this.gameOver = false;
        this.win = false;
        this.firstClick = true;
        this.flags = 0;
        this.revealedCount = 0;
        this.timer = 0;
        this.mines.clear();
        this.board = [];
        this.cellsToReveal = this.rows * this.cols - this.totalMines;

        for (let r = 0; r < this.rows; r++) {
            const row = [];
            for (let c = 0; c < this.cols; c++) {
                row.push({
                    row: r,
                    col: c,
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0
                });
            }
            this.board.push(row);
        }

        return this.board;
    }

    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            this.timer++;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    getTimer() {
        return Math.min(this.timer, 999);
    }

    placeMines(excludeRow, excludeCol) {
        let minesPlaced = 0;
        const totalCells = this.rows * this.cols;

        while (minesPlaced < this.totalMines) {
            const randomIndex = Math.floor(Math.random() * totalCells);
            const r = Math.floor(randomIndex / this.cols);
            const c = randomIndex % this.cols;

            const isExclude = r === excludeRow && c === excludeCol;
            const isAlreadyMine = this.mines.has(`${r},${c}`);

            if (!isExclude && !isAlreadyMine) {
                this.mines.add(`${r},${c}`);
                this.board[r][c].isMine = true;
                minesPlaced++;
            }
        }

        this.calculateNeighborMines();
    }

    calculateNeighborMines() {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c].isMine) continue;

                let count = 0;
                for (const [dr, dc] of directions) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (this.isValidCell(nr, nc) && this.board[nr][nc].isMine) {
                        count++;
                    }
                }
                this.board[r][c].neighborMines = count;
            }
        }
    }

    isValidCell(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    getCell(row, col) {
        if (this.isValidCell(row, col)) {
            return this.board[row][col];
        }
        return null;
    }

    revealCell(row, col) {
        if (this.gameOver || this.win) return false;

        const cell = this.getCell(row, col);
        if (!cell || cell.isRevealed || cell.isFlagged) return false;

        if (this.firstClick) {
            this.firstClick = false;
            this.placeMines(row, col);
            this.startTimer();
        }

        cell.isRevealed = true;
        this.revealedCount++;

        if (cell.isMine) {
            this.gameOver = true;
            this.stopTimer();
            return true;
        }

        if (cell.neighborMines === 0) {
            this.floodFill(row, col);
        }

        if (this.revealedCount >= this.cellsToReveal) {
            this.win = true;
            this.gameOver = true;
            this.stopTimer();
            this.flagAllMines();
        }

        return true;
    }

    floodFill(row, col) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (const [dr, dc] of directions) {
            const nr = row + dr;
            const nc = col + dc;

            if (this.isValidCell(nr, nc)) {
                const neighbor = this.board[nr][nc];
                if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
                    neighbor.isRevealed = true;
                    this.revealedCount++;
                    if (neighbor.neighborMines === 0) {
                        this.floodFill(nr, nc);
                    }
                }
            }
        }
    }

    toggleFlag(row, col) {
        if (this.gameOver || this.firstClick) return false;

        const cell = this.getCell(row, col);
        if (!cell || cell.isRevealed) return false;

        cell.isFlagged = !cell.isFlagged;
        this.flags += cell.isFlagged ? 1 : -1;
        return true;
    }

    flagAllMines() {
        for (const [key] of this.mines) {
            const [r, c] = key.split(',').map(Number);
            if (!this.board[r][c].isFlagged) {
                this.board[r][c].isFlagged = true;
            }
        }
        this.flags = this.totalMines;
    }

    getRemainingMines() {
        return this.totalMines - this.flags;
    }

    reset(difficulty = this.difficulty) {
        this.difficulty = difficulty;
        this.rows = DIFFICULTIES[difficulty].rows;
        this.cols = DIFFICULTIES[difficulty].cols;
        this.totalMines = DIFFICULTIES[difficulty].mines;
        return this.initialize();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game;
}
