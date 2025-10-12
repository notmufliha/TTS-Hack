module.exports = [
"[project]/.next-internal/server/app/trial/page/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[project]/src/app/favicon.ico.mjs { IMAGE => \"[project]/src/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/favicon.ico.mjs { IMAGE => \"[project]/src/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript)"));
}),
"[project]/src/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/src/app/trial/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TicTacToe",
    ()=>TicTacToe,
    "createTicTacToe",
    ()=>createTicTacToe
]);
class TicTacToe {
    currentPlayer = 'X';
    board = Array(9).fill(null);
    gameActive = true;
    container;
    statusElement;
    constructor(containerId){
        this.container = document.getElementById(containerId) || document.body;
        this.statusElement = document.createElement('div');
        this.initializeGame();
    }
    initializeGame() {
        this.container.innerHTML = '';
        this.container.className = 'tic-tac-toe-container';
        // Create game title
        const title = document.createElement('h1');
        title.textContent = 'Tic Tac Toe';
        title.className = 'game-title';
        this.container.appendChild(title);
        // Create status display
        this.statusElement.className = 'game-status';
        this.updateStatus();
        this.container.appendChild(this.statusElement);
        // Create game board
        const boardElement = document.createElement('div');
        boardElement.className = 'game-board';
        for(let i = 0; i < 9; i++){
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i.toString();
            cell.addEventListener('click', ()=>this.handleCellClick(i));
            boardElement.appendChild(cell);
        }
        this.container.appendChild(boardElement);
        // Create reset button
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset Game';
        resetButton.className = 'reset-button';
        resetButton.addEventListener('click', ()=>this.resetGame());
        this.container.appendChild(resetButton);
        // Add styles
        this.addStyles();
    }
    handleCellClick(index) {
        if (!this.gameActive || this.board[index] !== null) {
            return;
        }
        this.board[index] = this.currentPlayer;
        this.updateBoard();
        const winner = this.checkWinner();
        if (winner) {
            this.gameActive = false;
            this.statusElement.textContent = `Player ${winner} wins!`;
            this.highlightWinningCells();
        } else if (this.board.every((cell)=>cell !== null)) {
            this.gameActive = false;
            this.statusElement.textContent = "It's a draw!";
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateStatus();
        }
    }
    checkWinner() {
        const winningCombinations = [
            [
                0,
                1,
                2
            ],
            [
                3,
                4,
                5
            ],
            [
                6,
                7,
                8
            ],
            [
                0,
                3,
                6
            ],
            [
                1,
                4,
                7
            ],
            [
                2,
                5,
                8
            ],
            [
                0,
                4,
                8
            ],
            [
                2,
                4,
                6
            ] // diagonals
        ];
        for (const combination of winningCombinations){
            const [a, b, c] = combination;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return this.board[a];
            }
        }
        return null;
    }
    highlightWinningCells() {
        const winningCombinations = [
            [
                0,
                1,
                2
            ],
            [
                3,
                4,
                5
            ],
            [
                6,
                7,
                8
            ],
            [
                0,
                3,
                6
            ],
            [
                1,
                4,
                7
            ],
            [
                2,
                5,
                8
            ],
            [
                0,
                4,
                8
            ],
            [
                2,
                4,
                6
            ]
        ];
        for (const combination of winningCombinations){
            const [a, b, c] = combination;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                combination.forEach((index)=>{
                    const cell = this.container.querySelector(`[data-index="${index}"]`);
                    if (cell) {
                        cell.classList.add('winning-cell');
                    }
                });
                break;
            }
        }
    }
    updateBoard() {
        const cells = this.container.querySelectorAll('.cell');
        cells.forEach((cell, index)=>{
            cell.textContent = this.board[index] || '';
            if (this.board[index]) {
                cell.classList.add('occupied');
            }
        });
    }
    updateStatus() {
        this.statusElement.textContent = `Current player: ${this.currentPlayer}`;
    }
    resetGame() {
        this.currentPlayer = 'X';
        this.board = Array(9).fill(null);
        this.gameActive = true;
        this.updateBoard();
        this.updateStatus();
        // Remove winning cell highlights
        const cells = this.container.querySelectorAll('.cell');
        cells.forEach((cell)=>{
            cell.classList.remove('winning-cell');
        });
    }
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .tic-tac-toe-container {
                max-width: 400px;
                margin: 0 auto;
                padding: 20px;
                font-family: 'Arial', sans-serif;
                text-align: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                color: white;
            }

            .game-title {
                margin-bottom: 20px;
                font-size: 2.5em;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            }

            .game-status {
                font-size: 1.5em;
                margin-bottom: 20px;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
            }

            .game-board {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                grid-gap: 10px;
                margin-bottom: 20px;
            }

            .cell {
                aspect-ratio: 1;
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2.5em;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }

            .cell:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.05);
            }

            .cell.occupied {
                cursor: not-allowed;
            }

            .cell.occupied:hover {
                transform: none;
                background: rgba(255, 255, 255, 0.1);
            }

            .winning-cell {
                background: linear-gradient(45deg, #ff6b6b, #ffd93d) !important;
                color: #2c3e50;
                animation: pulse 1s infinite;
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }

            .reset-button {
                background: linear-gradient(45deg, #ff6b6b, #ee5a24);
                color: white;
                border: none;
                padding: 12px 30px;
                font-size: 1.1em;
                border-radius: 25px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .reset-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }

            .reset-button:active {
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }
    // Public method to get current game state
    getGameState() {
        return {
            board: [
                ...this.board
            ],
            currentPlayer: this.currentPlayer,
            gameActive: this.gameActive
        };
    }
    // Public method to programmatically make a move
    makeMove(index) {
        if (!this.gameActive || this.board[index] !== null || index < 0 || index > 8) {
            return false;
        }
        this.handleCellClick(index);
        return true;
    }
}
function createTicTacToe(containerId = 'tic-tac-toe') {
    return new TicTacToe(containerId);
}
// Auto-initialize if there's an element with id 'tic-tac-toe'
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', ()=>{
        const container = document.getElementById('tic-tac-toe');
        if (container) {
            new TicTacToe('tic-tac-toe');
        }
    });
}
}),
"[project]/src/app/trial/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/trial/page.tsx [app-rsc] (ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f3b31dfe._.js.map