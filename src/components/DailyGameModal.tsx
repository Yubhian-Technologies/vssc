import { useState, useEffect } from "react";

// Import all games

import MemoryGame from "../components/games/MemoryGame";
import SlidingPuzzle from "../components/games/SlidingPuzzle";
import Sudoku from "../components/games/Sudoku";
import Minesweeper from "../components/games/Minesweeper";
import MathQuizGame from "../components/games/MathQuizGame";
import ColorMatchGame from "../components/games/ColorMatchGame";
import ReflexGame from "../components/games/ReflexGame";
import SimonMemoryGame from "../components/games/SimonMemoryGame";
import NumberSequenceGame from "../components/games/NumberSequenceGame";
import ReactionChainGame from "../components/games/ReactionChainGame";
import SpotTheDifference from "../components/games/SpotTheDifference";
interface DailyGameModalProps {
  onComplete: () => void;
  onClose?: () => void;
}

const games = [
  { name: "Memory Game", component: MemoryGame },
  { name: "Sliding Puzzle", component: SlidingPuzzle },
  { name: "Sudoku", component: Sudoku },
  { name: "Minesweeper", component: Minesweeper },
  { name: "Math Quiz Game", component: MathQuizGame },
  { name: "Color Match Game", component: ColorMatchGame },
  { name: "Reflex Game", component: ReflexGame },
  { name: "Simon Memory Game", component: SimonMemoryGame },
  { name: "Number Sequence Game", component: NumberSequenceGame },
  { name: "Reaction Chain Game", component: ReactionChainGame },
  { name: "Spot the Difference", component: SpotTheDifference },
];

const DailyGameModal: React.FC<DailyGameModalProps> = ({ onComplete, onClose }) => {
  const [claimedToday, setClaimedToday] = useState(false);
  const [selectedGame, setSelectedGame] = useState<typeof games[0] | null>(null);

  useEffect(() => {
    const lastClaim = localStorage.getItem("dailyGameClaim");
    const today = new Date().toDateString();

    if (lastClaim === today) {
      setClaimedToday(true); // already claimed
    } else {
      const randomGame = games[Math.floor(Math.random() * games.length)];
      setSelectedGame(randomGame);
    }
  }, []);

  const handleComplete = () => {
    const today = new Date().toDateString();
    localStorage.setItem("dailyGameClaim", today);
    setClaimedToday(true);
    onComplete(); // award points
  };

  const handleSkip = () => {
    const confirmSkip = window.confirm(
      "Are you sure you want to skip? You will not receive any points."
    );
    if (confirmSkip) {
      setSelectedGame(null);
      if (onClose) onClose();
    }
  };

  if (claimedToday || !selectedGame) return null;

  const GameComponent = selectedGame.component;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full text-center relative transition-transform transform scale-100">
        {/* Skip / Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-lg font-bold"
          title="Skip game"
        >
          ✖
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-2 text-blue-600">
          🎮 {selectedGame.name}
        </h2>
        <p className="text-gray-700 mb-4">Solve this game to earn <b>5 points!</b></p>

        {/* Game Area */}
        <div className="mt-4 flex justify-center">
          <GameComponent onSolve={handleComplete} />
        </div>

        {/* Optional Close */}
        {onClose && (
          <button
            onClick={onClose}
            className="mt-5 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default DailyGameModal;
