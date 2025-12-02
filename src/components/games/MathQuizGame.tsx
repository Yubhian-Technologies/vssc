// MathQuizGame.tsx
import { useEffect, useState } from "react";

interface MathQuizGameProps {
  onSolve: () => void;
}

const MathQuizGame: React.FC<MathQuizGameProps> = ({ onSolve }) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);

  const newQuestion = () => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
    setAnswer("");
  };

  useEffect(() => {
    newQuestion();
  }, []);

  const checkAnswer = () => {
    if (parseInt(answer) === num1 + num2) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore >= 5) {
        onSolve();
      } else {
        newQuestion();
      }
    } else {
      alert("Wrong! Try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-bold">Math Quiz</h2>
      <p className="text-lg">{num1} + {num2} = ?</p>
      <input
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        type="number"
        className="border rounded p-2 w-20 text-center"
      />
      <button onClick={checkAnswer} className="px-4 py-2 bg-green-600 text-white rounded">
        Submit
      </button>
      <p>Score: {score}/5</p>
    </div>
  );
};

export default MathQuizGame;
