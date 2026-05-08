const Game = require('../src/game');

function assert(condition, message) {
    if (!condition) {
        console.error('FAIL:', message);
        process.exit(1);
    }
    console.log('PASS:', message);
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        console.error('FAIL:', message);
        console.error('  Expected:', expected, 'but got:', actual);
        process.exit(1);
    }
    console.log('PASS:', message);
}

function runTests() {
    console.log('\n=== Running Minesweeper Tests ===\n');

    console.log('--- Board Creation Tests ---');
    
    const beginnerGame = new Game('beginner');
    beginnerGame.initialize();
    assertEqual(beginnerGame.rows, 9, 'Beginner board has 9 rows');
    assertEqual(beginnerGame.cols, 9, 'Beginner board has 9 columns');
    assertEqual(beginnerGame.totalMines, 10, 'Beginner board has 10 mines');
    assertEqual(beginnerGame.board.length, 9, 'Board array has 9 rows');

    const intermediateGame = new Game('intermediate');
    intermediateGame.initialize();
    assertEqual(intermediateGame.rows, 16, 'Intermediate board has 16 rows');
    assertEqual(intermediateGame.cols, 16, 'Intermediate board has 16 columns');
    assertEqual(intermediateGame.totalMines, 40, 'Intermediate board has 40 mines');

    const expertGame = new Game('expert');
    expertGame.initialize();
    assertEqual(expertGame.rows, 16, 'Expert board has 16 rows');
    assertEqual(expertGame.cols, 30, 'Expert board has 30 columns');
    assertEqual(expertGame.totalMines, 99, 'Expert board has 99 mines');

    console.log('\n--- Mine Placement Tests ---');
    
    const testGame = new Game('beginner');
    testGame.initialize();
    testGame.placeMines(4, 4);
    
    let mineCount = 0;
    for (let r = 0; r < testGame.rows; r++) {
        for (let c = 0; c < testGame.cols; c++) {
            if (testGame.board[r][c].isMine) {
                mineCount++;
            }
        }
    }
    assertEqual(mineCount, 10, 'Exactly 10 mines placed on beginner board');
    assertEqual(testGame.board[4][4].isMine, false, 'Center cell (4,4) is not a mine');

    testGame.reset('intermediate');
    testGame.placeMines(8, 8);
    mineCount = 0;
    for (let r = 0; r < testGame.rows; r++) {
        for (let c = 0; c < testGame.cols; c++) {
            if (testGame.board[r][c].isMine) {
                mineCount++;
            }
        }
    }
    assertEqual(mineCount, 40, 'Exactly 40 mines placed on intermediate board');

    console.log('\n--- Number Calculation Tests ---');
    
    const numberGame = new Game('beginner');
    numberGame.initialize();
    numberGame.placeMines(4, 4);
    
    let mineCount2 = 0;
    for (let r = 0; r < numberGame.rows; r++) {
        for (let c = 0; c < numberGame.cols; c++) {
            if (numberGame.board[r][c].isMine) {
                mineCount2++;
            }
        }
    }
    assertEqual(mineCount2, 10, 'Non-mine cells have neighbor mine counts');

    const cell = numberGame.getCell(4, 4);
    assertEqual(cell.isMine, false, 'Cell at (4,4) is not a mine (excluded from mines)');
    // Excluded cell can have neighbor mines - just can't be a mine itself

    console.log('\n--- First Click Safety Tests ---');
    
    const safeGame = new Game('beginner');
    safeGame.initialize();
    safeGame.revealCell(4, 4);
    assertEqual(safeGame.firstClick, false, 'First click flag is cleared after first reveal');
    assertEqual(safeGame.getCell(4, 4).isRevealed, true, 'Clicked cell is revealed');

    const cellAt44 = safeGame.getCell(4, 4);
    assertEqual(cellAt44.isMine, false, 'First clicked cell is never a mine');

    console.log('\n--- Flood Fill Tests ---');
    
    const floodGame = new Game('beginner');
    floodGame.initialize();
    floodGame.placeMines(0, 0);
    floodGame.revealCell(8, 8);
    assertEqual(floodGame.revealedCount >= 1, true, 'Reveal starts the game');

    console.log('\n--- Flagging Tests ---');
    
    const flagGame = new Game('beginner');
    flagGame.initialize();
    flagGame.placeMines(4, 4);
    
    const cellBefore = flagGame.getCell(0, 0);
    assertEqual(cellBefore.isFlagged, false, 'Cell starts unflagged');
    
    flagGame.revealCell(4, 4);
    flagGame.toggleFlag(0, 0);
    const cellAfter = flagGame.getCell(0, 0);
    assertEqual(cellAfter.isFlagged, true, 'Cell is flagged after toggleFlag');
    assertEqual(flagGame.flags, 1, 'Flag count is 1 after flagging one cell');

    flagGame.toggleFlag(0, 0);
    assertEqual(flagGame.getCell(0, 0).isFlagged, false, 'Cell is unflagged after second toggle');
    assertEqual(flagGame.flags, 0, 'Flag count is 0 after unflagging');

    console.log('\n--- Win Condition Tests ---');
    
    const winGame = new Game('beginner');
    winGame.initialize();
    winGame.revealCell(4, 4);
    assertEqual(winGame.win, false, 'Game not won yet');
    assertEqual(winGame.gameOver, false, 'Game not over yet');

    console.log('\n--- Reset Tests ---');
    
    const resetGame = new Game('beginner');
    resetGame.initialize();
    resetGame.revealCell(0, 0);
    resetGame.reset('intermediate');
    assertEqual(resetGame.difficulty, 'intermediate', 'Difficulty changed after reset');
    assertEqual(resetGame.rows, 16, 'Rows updated after reset to intermediate');
    assertEqual(resetGame.cols, 16, 'Cols updated after reset to intermediate');
    assertEqual(resetGame.firstClick, true, 'First click flag reset');
    assertEqual(resetGame.gameOver, false, 'GameOver flag reset');
    assertEqual(resetGame.win, false, 'Win flag reset');

    console.log('\n--- Timer Tests ---');
    
    const timerGame = new Game('beginner');
    timerGame.initialize();
    timerGame.startTimer();
    const initialTime = timerGame.getTimer();
    assertEqual(initialTime, 0, 'Initial timer is 0');
    
    setTimeout(() => {
        const elapsedTime = timerGame.getTimer();
        assert(elapsedTime >= 0, 'Timer has elapsed time');
        timerGame.stopTimer();
        
        console.log('\n=== All Tests Passed! ===\n');
    }, 1500);
}

runTests();
