import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw } from "lucide-react";

export default function ReactionChainGame() {
  const [position, setPosition] = useState(0); // 0 → 100
  const [direction, setDirection] = useState(1);
  const [feedback, setFeedback] = useState("");
  const [perfects, setPerfects] = useState(0);
  const [running, setRunning] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const requestRef = useRef<number | null>(null); // ✅ type fixed

  // Dot oscillation animation
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (running) {
        setPosition((prev) => {
          let newPos = prev + direction * 90 * delta; // speed
          if (newPos >= 100) {
            setDirection(-1);
            newPos = 100;
          } else if (newPos <= 0) {
            setDirection(1);
            newPos = 0;
          }
          return newPos;
        });
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [running, direction]);

  const handleClick = () => {
    if (gameOver) return;
    const diff = Math.abs(position - 50); // 50 = center line
    let result = "";

    if (diff <= 3) {
      result = "Perfect!";
      setPerfects((p) => p + 1);
    } else if (diff <= 10) {
      result = "Good!";
    } else {
      result = "Miss!";
      setPerfects(0);
    }

    setFeedback(result);

    if (perfects + 1 >= 5 && result === "Perfect!") {
      setGameOver(true);
      setRunning(false);
    }

    setTimeout(() => setFeedback(""), 1000);
  };

  const resetGame = () => {
    setPosition(0);
    setDirection(1);
    setFeedback("");
    setPerfects(0);
    setRunning(true);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <h1 className="text-3xl font-bold mb-2">⚡ Reaction Chain Game</h1>
      <p className="mb-6 text-lg">Click when the dot hits the center line!</p>

      {/* Center line */}
      <div className="relative w-[300px] h-[10px] bg-gray-700 rounded-full">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[3px] h-[10px] bg-yellow-400"></div>

        {/* Moving dot */}
        <motion.div
          animate={{ x: `${position - 50}%` }}
          transition={{ ease: "linear" }}
          className={`absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full ${
            feedback === "Perfect!"
              ? "bg-green-400 scale-125"
              : feedback === "Good!"
              ? "bg-blue-400"
              : feedback === "Miss!"
              ? "bg-red-500"
              : "bg-white"
          } shadow-lg`}
        />
      </div>

      {/* Feedback */}
      <div className="mt-6 h-8">
        {feedback && (
          <motion.span
            key={feedback}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-2xl font-bold ${
              feedback === "Perfect!"
                ? "text-green-400"
                : feedback === "Good!"
                ? "text-blue-400"
                : "text-red-500"
            }`}
          >
            {feedback}
          </motion.span>
        )}
      </div>

      {/* Score */}
      <p className="mt-2 text-lg">Perfect chain: {perfects} / 5</p>

      {/* Game over screen */}
      {gameOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 bg-gray-900/80 p-6 rounded-2xl shadow-lg text-center"
        >
          <Trophy className="mx-auto text-yellow-400 w-10 h-10 mb-2" />
          <h2 className="text-2xl font-bold text-green-400">You Won! 🏆</h2>
          <p className="text-gray-300 mt-1">
            Great reflexes! You nailed all 5 perfect hits!
          </p>
          <Button
            onClick={resetGame}
            className="mt-4 bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Play Again
          </Button>
        </motion.div>
      )}

      {/* Tap button */}
      {!gameOver && (
        <Button
          onClick={handleClick}
          className="mt-6 px-6 py-3 bg-yellow-500 text-black text-lg font-bold hover:bg-yellow-400 transition-all"
        >
          TAP!
        </Button>
      )}
    </div>
  );
}
