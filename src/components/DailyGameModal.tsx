import { useEffect, useState } from "react";

// TicTacToe implementation
const TicTacToe = ({ onSolve }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");

  const checkWinner = (b) => {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (let [a,bIndex,c] of lines) {
      if (b[a] && b[a] === b[bIndex] && b[a] === b[c]) return b[a];
    }
    return null;
  };

  const handleClick = (i) => {
    if (board[i]) return;
    const newBoard = [...board];
    newBoard[i] = turn;
    setBoard(newBoard);
    const winner = checkWinner(newBoard);
    if (winner) onSolve();
    setTurn(turn === "X" ? "O" : "X");
  };

  return (
    <div className="grid grid-cols-3 gap-1 w-48 h-48">
      {board.map((val, i) => (
        <button
          key={i}
          className="border flex items-center justify-center text-2xl"
          onClick={() => handleClick(i)}
        >
          {val}
        </button>
      ))}
    </div>
  );
};

// Stub: Memory game (expand as needed)
const MemoryGame = ({ onSolve }) => (
  <div className="flex flex-col items-center">
    <div>Memory Game (Demo)</div>
    {/* Add real memory game logic here */}
    <button onClick={onSolve} className="hidden"></button>
  </div>
);

// Stub: Sliding Puzzle (expand as needed)
const SlidingPuzzle = ({ onSolve }) => (
  <div className="flex flex-col items-center">
    <div>Sliding Puzzle (Demo)</div>
    {/* Add real sliding puzzle logic here */}
    <button onClick={onSolve} className="hidden"></button>
  </div>
);

// Stub: Sudoku game (expand as needed)
const Sudoku = ({ onSolve }) => (
  <div className="flex flex-col items-center">
    <div>Sudoku Game (Demo)</div>
    {/* Add real sudoku logic here */}
    <button onClick={onSolve} className="hidden"></button>
  </div>
);

// Stub: Minesweeper (expand as needed)
const Minesweeper = ({ onSolve }) => (
  <div className="flex flex-col items-center">
    <div>Minesweeper Game (Demo)</div>
    {/* Add real minesweeper logic here */}
    <button onClick={onSolve} className="hidden"></button>
  </div>
);

// Stub: 2048 (expand as needed)
const Game2048 = ({ onSolve }) => (
  <div className="flex flex-col items-center">
    <div>2048 Game (Demo)</div>
    {/* Add real 2048 logic here */}
    <button onClick={onSolve} className="hidden"></button>
  </div>
);

// Main DailyGameModal
const DailyGameModal = ({ onComplete }) => {
  const [gameIndex, setGameIndex] = useState(null);
  const [solved, setSolved] = useState(false);

  const hasClaimedToday = () =>
    localStorage.getItem("dailyPointsDate") === new Date().toDateString();

  const handleSolve = () => {
    setSolved(true);
    onComplete();
    localStorage.setItem("dailyPointsDate", new Date().toDateString());
  };

  // All games shown directly, no "Click to Solve" button for selection
  const gameComponents = [
    <TicTacToe onSolve={handleSolve} />,
    <MemoryGame onSolve={handleSolve} />,
    <SlidingPuzzle onSolve={handleSolve} />,
    <Sudoku onSolve={handleSolve} />,
    <Minesweeper onSolve={handleSolve} />,
    <Game2048 onSolve={handleSolve} />
  ];

  useEffect(() => {
    if (!hasClaimedToday()) {
      setGameIndex(Math.floor(Math.random() * gameComponents.length));
    }
  }, []);

  if (hasClaimedToday() || gameIndex === null) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full text-center space-y-4">
        <h2 className="text-xl font-bold">Daily Puzzle</h2>
        <p>Solve this puzzle to earn 5 points!</p>
        <div className="flex justify-center items-center h-64">
          {gameComponents[gameIndex]}
        </div>
        {!solved && (
          <button
            onClick={handleSolve}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-black transition"
          >
            Claim Points (Skip)
          </button>
        )}
      </div>
    </div>
  );
};

export default DailyGameModal;