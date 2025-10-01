import { useState, useEffect } from "react";

interface MinesweeperProps {
  onSolve: () => void;
}

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  adjacentMines: number;
}

const Minesweeper: React.FC<MinesweeperProps> = ({ onSolve }) => {
  const SIZE = 5; // 5x5 grid
  const MINES_COUNT = 5;

  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    initializeBoard();
  }, []);

  const initializeBoard = () => {
    // Create empty board
    let newBoard: Cell[][] = Array(SIZE)
      .fill(null)
      .map(() =>
        Array(SIZE).fill(null).map(() => ({
          isMine: false,
          isRevealed: false,
          adjacentMines: 0,
        }))
      );

    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < MINES_COUNT) {
      const r = Math.floor(Math.random() * SIZE);
      const c = Math.floor(Math.random() * SIZE);
      if (!newBoard[r][c].isMine) {
        newBoard[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate adjacent mines
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!newBoard[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
                if (newBoard[nr][nc].isMine) count++;
              }
            }
          }
          newBoard[r][c].adjacentMines = count;
        }
      }
    }

    setBoard(newBoard);
    setGameOver(false);
  };

  const revealCell = (r: number, c: number) => {
    if (gameOver || board[r][c].isRevealed) return;

    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    newBoard[r][c].isRevealed = true;

    if (newBoard[r][c].isMine) {
      setBoard(newBoard);
      setGameOver(true);
      alert("Game Over! You hit a mine.");
      return;
    }

    // Auto reveal neighbors if no adjacent mines
    if (newBoard[r][c].adjacentMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
            if (!newBoard[nr][nc].isRevealed) revealCell(nr, nc);
          }
        }
      }
    }

    setBoard(newBoard);

    if (checkWin(newBoard)) {
      setGameOver(true);
      setTimeout(() => {
        alert("Congratulations! You cleared the minefield!");
        onSolve();
      }, 200);
    }
  };

  const checkWin = (currentBoard: Cell[][]) => {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!currentBoard[r][c].isMine && !currentBoard[r][c].isRevealed) return false;
      }
    }
    return true;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${SIZE}, 50px)` }}>
        {board.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <button
              key={`${rIdx}-${cIdx}`}
              onClick={() => revealCell(rIdx, cIdx)}
              className={`w-12 h-12 border flex items-center justify-center font-bold text-lg
                          ${cell.isRevealed ? "bg-gray-300" : "bg-gray-700 text-white"}`}
            >
              {cell.isRevealed && cell.isMine ? "💣" : cell.isRevealed && cell.adjacentMines > 0 ? cell.adjacentMines : ""}
            </button>
          ))
        )}
      </div>
      {gameOver && (
        <button
          onClick={initializeBoard}
          className="mt-3 px-4 py-2 bg-primary text-white rounded hover:bg-black transition"
        >
          Restart Game
        </button>
      )}
      <p className="text-sm text-gray-600">Clear all safe cells to claim your points!</p>
    </div>
  );
};

export default Minesweeper;
