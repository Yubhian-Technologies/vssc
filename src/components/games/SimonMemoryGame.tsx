// SimonMemoryGame.tsx
import { useState, useEffect } from "react";

const colors = ["red", "blue", "green", "yellow"];

interface SimonMemoryGameProps {
  onSolve: () => void;
}

const SimonMemoryGame: React.FC<SimonMemoryGameProps> = ({ onSolve }) => {
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSeq, setUserSeq] = useState<string[]>([]);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [level, setLevel] = useState(1);
  const [playing, setPlaying] = useState(false);

  const playSequence = async (seq: string[]) => {
    setPlaying(true);
    for (let i = 0; i < seq.length; i++) {
      setActiveColor(seq[i]);
      await new Promise(r => setTimeout(r, 600));
      setActiveColor(null);
      await new Promise(r => setTimeout(r, 300));
    }
    setPlaying(false);
  };

  const nextRound = async () => {
    const next = [...sequence, colors[Math.floor(Math.random() * 4)]];
    setSequence(next);
    setUserSeq([]);
    await playSequence(next);
  };

  useEffect(() => {
    nextRound();
  }, []);

  const handleClick = async (color: string) => {
    if (playing) return;
    const newUserSeq = [...userSeq, color];
    setUserSeq(newUserSeq);

    if (color !== sequence[newUserSeq.length - 1]) {
      alert("❌ Wrong pattern! Try again.");
      setLevel(1);
      setSequence([]);
      nextRound();
      return;
    }

    if (newUserSeq.length === sequence.length) {
      if (sequence.length === 6) {
        onSolve();
        alert("🎉 You mastered it!");
      } else {
        setLevel(l => l + 1);
        await new Promise(r => setTimeout(r, 1000));
        nextRound();
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold">Pattern Memory (Level {level})</h2>
      <div className="grid grid-cols-2 gap-4">
        {colors.map(c => (
          <button
            key={c}
            className={`w-20 h-20 rounded-full transition-all ${
              activeColor === c ? "opacity-100" : "opacity-50"
            }`}
            style={{ backgroundColor: c }}
            onClick={() => handleClick(c)}
          />
        ))}
      </div>
    </div>
  );
};

export default SimonMemoryGame;
