import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
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
  //{ name: "Color Match Game", component: ColorMatchGame },
  // { name: "Reflex Game", component: ReflexGame },
  //{ name: "Simon Memory Game", component: SimonMemoryGame },
  //{ name: "Number Sequence Game", component: NumberSequenceGame },
  //{ name: "Reaction Chain Game", component: ReactionChainGame },
  // { name: "Spot the Difference", component: SpotTheDifference },
];

const DailyGameModal: React.FC<DailyGameModalProps> = ({
  onComplete,
  onClose,
}) => {
  const [claimedToday, setClaimedToday] = useState(false);
  const [selectedGame, setSelectedGame] = useState<(typeof games)[0] | null>(
    null
  );

  useEffect(() => {
    const checkEligibility = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.log("No user logged in for DailyGameModal");
        setClaimedToday(true);
        return;
      }

      const today = new Date().toDateString();
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          const lastClaimed = data.lastDailyClaim?.toDate?.() || null;
          const isEligible =
            !lastClaimed || lastClaimed.toDateString() !== today;

          console.log("DailyGameModal Firestore check:", {
            isEligible,
            lastClaimed,
            today,
          });

          if (!isEligible) {
            console.log("Game already claimed today (Firestore)");
            setClaimedToday(true);
            localStorage.setItem("dailyGameClaim", today);
          } else {
            // Clear localStorage if eligible to ensure consistency
            localStorage.removeItem("dailyGameClaim");
            const randomGame = games[Math.floor(Math.random() * games.length)];
            setSelectedGame(randomGame);
            console.log("Selected game:", randomGame.name);
          }
        } else {
          console.error("User document not found in DailyGameModal");
          setClaimedToday(true);
        }
      } catch (error) {
        console.error("Error checking eligibility in DailyGameModal:", error);
        setClaimedToday(true);
      }
    };

    checkEligibility();
  }, []);

  const handleComplete = () => {
    const today = new Date().toDateString();
    localStorage.setItem("dailyGameClaim", today);
    setClaimedToday(true);
    onComplete();
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

  if (claimedToday || !selectedGame) {
    console.log("DailyGameModal not rendering:", {
      claimedToday,
      selectedGame,
    });
    return null;
  }

  const GameComponent = selectedGame.component;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full text-center relative transition-transform transform scale-100">
        <button
          onClick={handleSkip}
          className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-lg font-bold"
          title="Skip game"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-2 text-blue-600">
          🎮 {selectedGame.name}
        </h2>
        <p className="text-gray-700 mb-4">
          Solve this game to earn <b>5 points!</b>
        </p>

        <div className="mt-4 flex justify-center">
          <GameComponent onSolve={handleComplete} />
        </div>

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
