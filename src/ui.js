const GAME_MESSAGE = document.getElementById('game-message');
const MINE_COUNT_DISPLAY = document.getElementById('mine-count');
const TIMER_DISPLAY = document.getElementById('timer');
const RESET_BTN = document.getElementById('reset-btn');
const DIFFICULTY_SELECT = document.getElementById('difficulty');
const GAME_BOARD = document.getElementById('game-board');

let game;
let isMouseDown = false;

function initGame(difficulty = 'beginner') {
    game = new Game(difficulty);
    game.initialize();
    renderBoard();
    updateScoreDisplay();
    updateTimerDisplay();
    setMessage('');
    RESET_BTN.textContent = '🙂';
}

function renderBoard() {
    GAME_BOARD.innerHTML = '';
    GAME_BOARD.style.gridTemplateColumns = `repeat(${game.cols}, 25px)`;
    GAME_BOARD.style.gridTemplateRows = `repeat(${game.rows}, 25px)`;

    for (let r = 0; r < game.rows; r++) {
        for (let c = 0; c < game.cols; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;

            cell.addEventListener('mousedown', (e) => handleMouseDown(e, r, c));
            cell.addEventListener('mouseup', (e) => handleMouseUp(e, r, c));
            cell.addEventListener('contextmenu', (e) => handleRightClick(e, r, c));

            GAME_BOARD.appendChild(cell);
        }
    }
}

function updateBoard() {
    const cells = GAME_BOARD.children;
    const cellCount = GAME_BOARD.children.length;
    const cols = game.cols;

    for (let i = 0; i < cellCount; i++) {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const cellData = game.getCell(r, c);
        const cellDiv = cells[i];

        cellDiv.className = 'cell';
        cellDiv.textContent = '';

        if (cellData.isRevealed) {
            cellDiv.classList.add('revealed');

            if (cellData.isMine) {
                cellDiv.classList.add('mine-revealed');
            } else if (cellData.neighborMines > 0) {
                cellDiv.textContent = cellData.neighborMines;
                cellDiv.classList.add(`number-${cellData.neighborMines}`);
            }
        } else if (cellData.isFlagged) {
            cellDiv.classList.add('flagged');
        }
    }
}

function handleMouseDown(e, row, col) {
    if (game.gameOver) return;
    if (e.button === 0) {
        isMouseDown = true;
        RESET_BTN.textContent = '😮';
    }
}

function handleMouseUp(e, row, col) {
    if (game.gameOver) return;

    if (e.button === 0) {
        isMouseDown = false;
        RESET_BTN.textContent = '🙂';

        if (game.firstClick) {
            game.startTimer();
        }

        if (game.revealCell(row, col)) {
            updateBoard();
            checkGameStatus();
        }
    }
}

function handleRightClick(e, row, col) {
    e.preventDefault();
    if (game.gameOver || game.firstClick) return;

    if (game.toggleFlag(row, col)) {
        updateBoard();
        updateScoreDisplay();
    }
}

function updateScoreDisplay() {
    const remaining = game.getRemainingMines();
    MINE_COUNT_DISPLAY.textContent = String(remaining).padStart(3, '0');
}

function updateTimerDisplay() {
    TIMER_DISPLAY.textContent = String(game.getTimer()).padStart(3, '0');
}

function setMessage(message, type = '') {
    GAME_MESSAGE.textContent = message;
    GAME_MESSAGE.className = 'game-message ' + type;
}

function checkGameStatus() {
    if (game.win) {
        setMessage('You Win!', 'win');
        RESET_BTN.textContent = '😎';
    } else if (game.gameOver) {
        revealAllMines();
        setMessage('Game Over', 'game-over');
        RESET_BTN.textContent = '😵';
    }
}

function revealAllMines() {
    const cells = GAME_BOARD.children;
    const cols = game.cols;

    for (let i = 0; i < cells.length; i++) {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const cellData = game.getCell(r, c);

        if (cellData.isMine) {
            const cellDiv = cells[i];
            cellDiv.classList.add('revealed', 'mine-revealed');
        }
    }
}

RESET_BTN.addEventListener('click', () => {
    initGame(game.difficulty);
});

DIFFICULTY_SELECT.addEventListener('change', (e) => {
    initGame(e.target.value);
});

document.addEventListener('mouseup', () => {
    if (isMouseDown) {
        isMouseDown = false;
        if (!game.gameOver) {
            RESET_BTN.textContent = '🙂';
        }
    }
});

if (typeof Game !== 'undefined') {
    window.Game = Game;
}

initGame('beginner');
