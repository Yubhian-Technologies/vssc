import { useState, useEffect } from "react";
import Game2048 from "../components/games/Game2048";
import MemoryGame from "../components/games/MemoryGame";
import SlidingPuzzle from "../components/games/SlidingPuzzle";
import Sudoku from "../components/games/Sudoku";
import Minesweeper from "../components/games/Minesweeper";

interface DailyGameModalProps {
  onComplete: () => void;
  onClose?: () => void;
}

const games = [
  { name: "Memory Game", component: MemoryGame },
  { name: "Sliding Puzzle", component: SlidingPuzzle },
  { name: "Sudoku", component: Sudoku },
  { name: "Minesweeper", component: Minesweeper },
  { name: "2048", component: Game2048 },
];

const DailyGameModal: React.FC<DailyGameModalProps> = ({ onComplete, onClose }) => {
  const [claimedToday, setClaimedToday] = useState(false);
  const [selectedGame, setSelectedGame] = useState<typeof games[0] | null>(null);

  useEffect(() => {
    const lastClaim = localStorage.getItem("dailyGameClaim");
    const today = new Date().toDateString();

    if (lastClaim === today) {
      setClaimedToday(true); // Already claimed today
    } else {
      // Pick a random game
      const randomGame = games[Math.floor(Math.random() * games.length)];
      setSelectedGame(randomGame);
    }
  }, []);

  const handleComplete = () => {
    const today = new Date().toDateString();
    localStorage.setItem("dailyGameClaim", today);
    setClaimedToday(true);
    onComplete(); // Award 5 points
  };

  if (claimedToday || !selectedGame) return null;

  const GameComponent = selectedGame.component;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full text-center">
        <h2 className="text-xl font-bold mb-4">{selectedGame.name}</h2>
        <p>Solve this game to earn 5 points!</p>

        <div className="mt-4">
          <GameComponent onSolve={handleComplete} />
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default DailyGameModal;
