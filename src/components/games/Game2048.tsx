import { useState, useEffect } from "react";

interface Game2048Props {
  onSolve: () => void;
}

const SIZE = 4;

const Game2048: React.FC<Game2048Props> = ({ onSolve }) => {
  const [board, setBoard] = useState<number[][]>([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    initBoard();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const initBoard = () => {
    const newBoard = Array(SIZE)
      .fill(0)
      .map(() => Array(SIZE).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setGameOver(false);
  };

  const addRandomTile = (b: number[][]) => {
    const emptyCells: [number, number][] = [];
    b.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (cell === 0) emptyCells.push([r, c]);
      })
    );
    if (emptyCells.length === 0) return;
    const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    b[r][c] = Math.random() < 0.9 ? 2 : 4;
  };

  const handleKey = (e: KeyboardEvent) => {
    if (gameOver) return;
    let moved = false;
    switch (e.key) {
      case "ArrowUp":
        moved = move("up");
        break;
      case "ArrowDown":
        moved = move("down");
        break;
      case "ArrowLeft":
        moved = move("left");
        break;
      case "ArrowRight":
        moved = move("right");
        break;
    }
    if (moved) {
      const newBoard = board.map(row => [...row]);
      addRandomTile(newBoard);
      setBoard(newBoard);
      if (checkWin(newBoard)) {
        setGameOver(true);
        setTimeout(() => {
          alert("You reached 2048! 🎉");
          onSolve();
        }, 100);
      } else if (checkGameOver(newBoard)) {
        setGameOver(true);
        setTimeout(() => alert("Game Over!"), 100);
      }
    }
  };

  const move = (dir: "up" | "down" | "left" | "right") => {
    let moved = false;
    let newBoard = board.map(row => [...row]);

    const rotate = (b: number[][]) => {
      const rotated = Array(SIZE)
        .fill(0)
        .map(() => Array(SIZE).fill(0));
      for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++) rotated[c][SIZE - 1 - r] = b[r][c];
      return rotated;
    };

    const slideRow = (row: number[]) => {
      const filtered = row.filter(v => v !== 0);
      for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
          filtered[i] *= 2;
          filtered[i + 1] = 0;
        }
      }
      const newRow = filtered.filter(v => v !== 0);
      while (newRow.length < SIZE) newRow.push(0);
      return newRow;
    };

    const applyMove = (b: number[][]) => b.map(row => slideRow(row));

    if (dir === "up") {
      newBoard = rotate(newBoard);
      newBoard = applyMove(newBoard);
      newBoard = rotate(rotate(rotate(newBoard)));
    } else if (dir === "down") {
      newBoard = rotate(rotate(rotate(newBoard)));
      newBoard = applyMove(newBoard);
      newBoard = rotate(newBoard);
    } else if (dir === "left") {
      newBoard = applyMove(newBoard);
    } else if (dir === "right") {
      newBoard = newBoard.map(row => row.reverse());
      newBoard = applyMove(newBoard);
      newBoard = newBoard.map(row => row.reverse());
    }

    if (JSON.stringify(newBoard) !== JSON.stringify(board)) moved = true;
    setBoard(newBoard);
    return moved;
  };

  const checkWin = (b: number[][]) => b.flat().includes(2048);

  const checkGameOver = (b: number[][]) => {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (b[r][c] === 0) return false;
        if (r < SIZE - 1 && b[r][c] === b[r + 1][c]) return false;
        if (c < SIZE - 1 && b[r][c] === b[r][c + 1]) return false;
      }
    }
    return true;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${SIZE}, 60px)` }}>
        {board.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`w-14 h-14 flex items-center justify-center font-bold text-lg rounded
                ${cell === 0 ? "bg-gray-300" : "bg-yellow-400 text-black"}`}
            >
              {cell !== 0 ? cell : ""}
            </div>
          ))
        )}
      </div>
      {gameOver && (
        <button
          onClick={initBoard}
          className="mt-3 px-4 py-2 bg-primary text-white rounded hover:bg-black transition"
        >
          Restart Game
        </button>
      )}
      <p className="text-sm text-gray-600">Use arrow keys to merge tiles to reach 2048!</p>
    </div>
  );
};

export default Game2048;
