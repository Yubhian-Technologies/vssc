// ColorMatchGame.tsx
import { useEffect, useState } from "react";

interface ColorMatchGameProps {
  onSolve: () => void;
}

const colors = ["red", "green", "blue", "yellow", "purple"];

const ColorMatchGame: React.FC<ColorMatchGameProps> = ({ onSolve }) => {
  const [targetColor, setTargetColor] = useState("");
  const [textColor, setTextColor] = useState("");
  const [score, setScore] = useState(0);

  const nextRound = () => {
    setTargetColor(colors[Math.floor(Math.random() * colors.length)]);
    setTextColor(colors[Math.floor(Math.random() * colors.length)]);
  };

  useEffect(() => {
    nextRound();
  }, []);

  const handleClick = (color: string) => {
    if (color === targetColor) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore >= 5) onSolve();
    } else {
      alert("Wrong! Try again.");
    }
    nextRound();
  };

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h2 className="text-xl font-bold">Color Match</h2>
      <p className="text-lg" style={{ color: textColor }}>
        {targetColor.toUpperCase()}
      </p>
      <div className="flex gap-2">
        {colors.map(c => (
          <button
            key={c}
            className={`px-4 py-2 rounded text-white`}
            style={{ backgroundColor: c }}
            onClick={() => handleClick(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <p>Score: {score}/5</p>
    </div>
  );
};

export default ColorMatchGame;
