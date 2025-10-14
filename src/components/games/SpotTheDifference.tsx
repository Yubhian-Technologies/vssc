import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw, Timer } from "lucide-react";

export default function SpotTheDifference() {
  const gridSize = 5;
  const totalSquares = gridSize * gridSize;
  const differenceCount = 4; // number of mismatched squares

  const [differences, setDifferences] = useState<number[]>([]);
  const [found, setFound] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [timer, setTimer] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  useEffect(() => {
    // Generate random difference positions
    const diffSet = new Set<number>();
    while (diffSet.size < differenceCount) {
      diffSet.add(Math.floor(Math.random() * totalSquares));
    }
    setDifferences(Array.from(diffSet));
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timer > 0 && !gameOver) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setGameOver(true);
    }
  }, [timer, gameOver]);

  const handleClick = (index: number) => {
    if (gameOver || found.includes(index)) return;
    setAttempts((a) => a + 1);

    if (differences.includes(index)) {
      setFound((prev) => [...prev, index]);
      if (found.length + 1 === differences.length) {
        setWin(true);
        setGameOver(true);
      }
    } else {
      // Shake animation trigger
      const el = document.getElementById(`left-${index}`);
      el?.classList.add("animate-shake");
      setTimeout(() => el?.classList.remove("animate-shake"), 500);
    }
  };

  const resetGame = () => {
    const diffSet = new Set<number>();
    while (diffSet.size < differenceCount) {
      diffSet.add(Math.floor(Math.random() * totalSquares));
    }
    setDifferences(Array.from(diffSet));
    setFound([]);
    setAttempts(0);
    setTimer(60);
    setGameOver(false);
    setWin(false);
  };

  // Generate random colors for the base grid
  const colors = Array.from({ length: totalSquares }, () =>
    Math.random() > 0.5 ? "bg-purple-400" : "bg-blue-400"
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white p-6">
      <h1 className="text-3xl font-bold mb-2">🕵️‍♂️ Spot the Difference</h1>
      <p className="text-lg mb-4">Find all {differenceCount} differences before time runs out!</p>

      <div className="flex items-center gap-6">
        {/* Left Grid */}
        <div className="grid grid-cols-5 gap-1 border-4 border-gray-700 p-2 rounded-xl">
          {colors.map((color, i) => {
            const isDifferent = differences.includes(i);
            const isFound = found.includes(i);
            return (
              <motion.div
                key={i}
                id={`left-${i}`}
                onClick={() => handleClick(i)}
                whileTap={{ scale: 0.9 }}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-md cursor-pointer transition-all duration-200 
                  ${isFound ? "bg-green-400" : color} 
                  ${isDifferent && !isFound ? "opacity-80" : ""}
                `}
              ></motion.div>
            );
          })}
        </div>

        {/* Right Grid (With subtle differences) */}
        <div className="grid grid-cols-5 gap-1 border-4 border-gray-700 p-2 rounded-xl">
          {colors.map((color, i) => {
            const isDifferent = differences.includes(i);
            const alteredColor = isDifferent ? "bg-pink-400" : color;
            return (
              <div
                key={i}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-md ${alteredColor} transition-all`}
              ></div>
            );
          })}
        </div>
      </div>

      {/* Status */}
      <div className="mt-6 flex items-center gap-6 text-lg">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-yellow-400" />
          <span>Time: {timer}s</span>
        </div>
        <span>Attempts: {attempts}</span>
        <span>Found: {found.length}/{differenceCount}</span>
      </div>

      {/* Game Over or Win Modal */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 bg-gray-900/80 p-6 rounded-2xl shadow-lg text-center"
          >
            {win ? (
              <>
                <Trophy className="mx-auto text-yellow-400 w-10 h-10 mb-2" />
                <h2 className="text-2xl font-bold text-green-400">You Found Them All! 🏆</h2>
                <p className="text-gray-300 mt-1">
                  Great observation! You nailed it in {attempts} attempts.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-red-400">Time’s Up! ⏳</h2>
                <p className="text-gray-300 mt-1">
                  You found {found.length}/{differenceCount} differences.
                </p>
              </>
            )}
            <Button
              onClick={resetGame}
              className="mt-4 bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}
