// ReflexGame.tsx
import { useEffect, useState } from "react";

interface ReflexGameProps {
  onSolve: () => void;
}

const ReflexGame: React.FC<ReflexGameProps> = ({ onSolve }) => {
  const [isGreen, setIsGreen] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [message, setMessage] = useState("Wait for green...");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [reaction, setReaction] = useState<number | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsGreen(true);
      setMessage("Click now!");
      setStartTime(Date.now());
    }, Math.random() * 3000 + 2000);
    return () => clearTimeout(timeout);
  }, []);

  const handleClick = () => {
    if (!isGreen) {
      setMessage("Too early! 😅");
      setWaiting(false);
    } else {
      const time = Date.now() - (startTime ?? 0);
      setReaction(time);
      setMessage(`Your reaction: ${time} ms`);
      if (time < 350) onSolve();
      setWaiting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h2 className="text-xl font-bold">Reflex Game</h2>
      <div
        className={`w-24 h-24 rounded-full cursor-pointer transition-all duration-300 ${
          isGreen ? "bg-green-500" : "bg-red-500"
        }`}
        onClick={handleClick}
      ></div>
      <p>{message}</p>
      {reaction && <p>Try to get below 350ms!</p>}
    </div>
  );
};

export default ReflexGame;
