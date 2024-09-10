document.addEventListener('DOMContentLoaded', () => {
    const boardSize = 8;  // 8x8 grid
    const mineCount = 10; // Number of mines
    let gameBoard = [];
    let mineLocations = [];
    let flagCount = 0;
    let revealedCount = 0;
    let gameOver = false; // Track whether the game is over

    const gameBoardElement = document.getElementById('gameBoard');
    const restartButton = document.getElementById('restart');
    const flagsElement = document.getElementById('flags');
    const messageElement = document.getElementById('message');

    // Start the game on load
    restartButton.addEventListener('click', startGame);

    function startGame() {
        gameBoard = [];
        mineLocations = [];
        flagCount = 0;
        revealedCount = 0;
        gameOver = false;  // Reset the game state
        messageElement.textContent = '';
        flagsElement.textContent = `Flags: 0`;

        // Set the grid layout to be a perfect square
        gameBoardElement.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
        gameBoardElement.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;
        gameBoardElement.innerHTML = ''; // Clear any existing cells

        generateBoard(); // Create an empty game board
        placeMines();    // Randomly place mines
        renderBoard();   // Render the game board
    }

    // Generate an empty board with default values
    function generateBoard() {
        for (let row = 0; row < boardSize; row++) {
            gameBoard[row] = [];
            for (let col = 0; col < boardSize; col++) {
                gameBoard[row][col] = { revealed: false, mine: false, flag: false, neighbors: 0 };
            }
        }
    }

    // Place mines randomly on the board
    function placeMines() {
        let minesPlaced = 0;
        while (minesPlaced < mineCount) {
            const row = Math.floor(Math.random() * boardSize);
            const col = Math.floor(Math.random() * boardSize);
            if (!gameBoard[row][col].mine) {
                gameBoard[row][col].mine = true;
                mineLocations.push({ row, col });
                minesPlaced++;
            }
        }
        updateNeighborCounts(); // After placing mines, update the count of neighboring mines
    }

    // Update the neighbor count for each non-mine cell
    function updateNeighborCounts() {
        mineLocations.forEach(({ row, col }) => {
            for (let r = -1; r <= 1; r++) {
                for (let c = -1; c <= 1; c++) {
                    const neighborRow = row + r;
                    const neighborCol = col + c;
                    if (isValidCell(neighborRow, neighborCol) && !gameBoard[neighborRow][neighborCol].mine) {
                        gameBoard[neighborRow][neighborCol].neighbors++;
                    }
                }
            }
        });
    }

    // Check if a given cell is within the grid
    function isValidCell(row, col) {
        return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
    }

    // Render the game board on the page
    function renderBoard() {
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => revealCell(row, col));   // Left-click to reveal
                cell.addEventListener('contextmenu', (e) => {                 // Right-click to flag
                    e.preventDefault();
                    toggleFlag(row, col);
                });
                gameBoardElement.appendChild(cell);
            }
        }
    }

    // Reveal a cell, checking for mines or neighbors
    function revealCell(row, col) {
        if (gameOver) return; // Prevent further interaction after the game is over

        const cellData = gameBoard[row][col];
        const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

        // Ignore already revealed or flagged cells
        if (cellData.revealed || cellData.flag) return;

        cellData.revealed = true;
        revealedCount++;
        cellElement.classList.add('revealed');

        if (cellData.mine) {
            // Game over if mine is revealed: Show bomb icon and reveal all
            cellElement.innerHTML = '<i class="fas fa-bomb"></i>'; // Display the bomb icon
            cellElement.classList.add('mine');
            messageElement.textContent = 'Game Over! You hit a mine!';
            gameOver = true;  // Set the game over state
            revealAll();      // Reveal all mines and numbers
            return;
        }

        if (cellData.neighbors > 0) {
            cellElement.textContent = cellData.neighbors; // Show number of neighboring mines
        } else {
            revealNeighbors(row, col); // If no neighbors, reveal surrounding cells
        }

        if (revealedCount === boardSize * boardSize - mineCount) {
            messageElement.textContent = 'You win!';
            gameOver = true;  // Set the game over state
        }
    }

    // Reveal all neighboring cells if they are safe
    function revealNeighbors(row, col) {
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                const neighborRow = row + r;
                const neighborCol = col + c;
                if (isValidCell(neighborRow, neighborCol) && !gameBoard[neighborRow][neighborCol].revealed) {
                    revealCell(neighborRow, neighborCol);
                }
            }
        }
    }

    // Toggle flag on right-click and dynamically add/remove FontAwesome flag icon
    function toggleFlag(row, col) {
        if (gameOver) return; // Prevent flagging after the game is over

        const cellData = gameBoard[row][col];
        const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

                // Don't flag revealed cells
                if (cellData.revealed) return;

                if (cellData.flag) {
                    // Unflag the cell: Remove flag icon
                    cellData.flag = false;
                    flagCount--;
                    cellElement.innerHTML = ''; // Remove the flag icon
                    cellElement.classList.remove('flag');
                } else if (flagCount < mineCount) {
                    // Flag the cell: Add FontAwesome flag icon
                    cellData.flag = true;
                    flagCount++;
                    cellElement.innerHTML = '<i class="fas fa-flag"></i>'; // Add the flag icon
                    cellElement.classList.add('flag');
                }
        
                flagsElement.textContent = `Flags: ${flagCount}`;
            }
        
            // Reveal all cells (both numbers and mines) when the game is over
            function revealAll() {
                for (let row = 0; row < boardSize; row++) {
                    for (let col = 0; col < boardSize; col++) {
                        const cellData = gameBoard[row][col];
                        const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
                        if (!cellData.revealed) {
                            if (cellData.mine) {
                                // Reveal all mines
                                cellElement.innerHTML = '<i class="fas fa-bomb"></i>';
                                cellElement.classList.add('mine');
                            } else if (cellData.neighbors > 0) {
                                // Reveal all numbers
                                cellElement.textContent = cellData.neighbors;
                                cellElement.classList.add('revealed');
                            } else {
                                // Reveal empty cells
                                cellElement.classList.add('revealed');
                            }
                        }
                    }
                }
            }
        
            // Reveal all mines when the game is over
            function revealMines() {
                mineLocations.forEach(({ row, col }) => {
                    const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    cellElement.innerHTML = '<i class="fas fa-bomb"></i>'; // Display the bomb icon
                    cellElement.classList.add('mine');
                });
            }
        
            // Start the game for the first time
            startGame();
        });
        
