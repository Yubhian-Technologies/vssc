// src/components/NumberSequenceGame.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button"; // from shadcn/ui
import { Trophy, RotateCcw } from "lucide-react";

export default function NumberSequenceGame() {
  const [numbers, setNumbers] = useState([]);
  const [nextNumber, setNextNumber] = useState(1);
  const [startTime, setStartTime] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Generate random 1–25
  const shuffleNumbers = () => {
    const arr = Array.from({ length: 25 }, (_, i) => i + 1);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setNumbers(arr);
  };

  useEffect(() => {
    shuffleNumbers();
  }, []);

  useEffect(() => {
    let interval;
    if (startTime && !gameOver) {
      interval = setInterval(() => {
        setTimeElapsed((Date.now() - startTime) / 1000);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [startTime, gameOver]);

  const handleClick = (num) => {
    if (num === nextNumber) {
      if (nextNumber === 1) setStartTime(Date.now());
      if (nextNumber === 25) {
        setGameOver(true);
      }
      setNextNumber(nextNumber + 1);
    }
  };

  const resetGame = () => {
    setNextNumber(1);
    setStartTime(null);
    setTimeElapsed(0);
    setGameOver(false);
    shuffleNumbers();
  };

  const won = gameOver && timeElapsed <= 20;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white p-4">
      <h1 className="text-3xl font-bold mb-4">🧠 Number Sequence Tap</h1>
      <p className="mb-2 text-lg">Tap numbers from 1 → 25 as fast as you can!</p>
      <div className="mb-4 text-xl">
        {startTime ? (
          <span>⏱️ Time: {timeElapsed.toFixed(1)}s</span>
        ) : (
          <span>Tap 1 to start!</span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-3">
        {numbers.map((num) => (
          <motion.button
            key={num}
            onClick={() => handleClick(num)}
            whileTap={{ scale: 0.9 }}
            disabled={gameOver || num < nextNumber}
            className={`w-16 h-16 rounded-xl text-xl font-semibold transition-all ${
              num < nextNumber
                ? "bg-green-600 text-white"
                : num === nextNumber
                ? "bg-yellow-400 text-black"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {num}
          </motion.button>
        ))}
      </div>

      {gameOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-6 rounded-2xl bg-gray-900/70 shadow-xl text-center"
        >
          {won ? (
            <>
              <Trophy className="mx-auto text-yellow-400 w-10 h-10 mb-2" />
              <h2 className="text-2xl font-bold text-green-400">You Won! 🎉</h2>
              <p className="text-gray-300 mt-1">
                Time: {timeElapsed.toFixed(2)}s
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-red-400">Time’s Up! ⏰</h2>
              <p className="text-gray-300 mt-1">
                You took {timeElapsed.toFixed(2)}s
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
    </div>
  );
}
