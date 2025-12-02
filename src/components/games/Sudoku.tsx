import { useState, useEffect } from "react";

interface SudokuProps {
  onSolve: () => void;
}

// Simple 4x4 Sudoku generator
const Sudoku: React.FC<SudokuProps> = ({ onSolve }) => {
  const SIZE = 4; // 4x4 grid
  const SUBGRID = 2; // 2x2 subgrid

  const [board, setBoard] = useState<(number | null)[][]>([]);
  const [solution, setSolution] = useState<(number)[][]>([]);

  useEffect(() => {
    const { puzzle, solved } = generatePuzzle();
    setBoard(puzzle);
    setSolution(solved);
  }, []);

  // Generate simple 4x4 Sudoku puzzle
  const generatePuzzle = () => {
    // Full solved board
    const solved: number[][] = [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 1, 4, 3],
      [4, 3, 2, 1],
    ];

    // Remove some numbers to make puzzle
    const puzzle: (number | null)[][] = solved.map(row => row.map(num => (Math.random() < 0.5 ? num : null)));

    return { puzzle, solved };
  };

  const handleChange = (row: number, col: number, value: string) => {
    const num = parseInt(value);
    if (isNaN(num) || num < 1 || num > SIZE) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = num;
    setBoard(newBoard);

    if (checkSolved(newBoard)) {
      setTimeout(() => onSolve(), 300);
    }
  };

  const checkSolved = (current: (number | null)[][]) => {
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        if (current[i][j] !== solution[i][j]) return false;
      }
    }
    return true;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${SIZE}, 60px)`,
          gridTemplateRows: `repeat(${SIZE}, 60px)`,
        }}
      >
        {board.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <input
              key={`${rIdx}-${cIdx}`}
              className={`border text-center text-lg font-bold ${
                (rIdx % SUBGRID === SUBGRID - 1 && rIdx !== SIZE - 1 ? "border-b-2" : "") +
                (cIdx % SUBGRID === SUBGRID - 1 && cIdx !== SIZE - 1 ? " border-r-2" : "")
              }`}
              value={cell ?? ""}
              onChange={(e) => handleChange(rIdx, cIdx, e.target.value)}
              disabled={cell !== null}
            />
          ))
        )}
      </div>
      <p className="text-sm text-gray-600">Fill all empty cells with numbers 1-4. Correct solution awards points!</p>
    </div>
  );
};

export default Sudoku;
