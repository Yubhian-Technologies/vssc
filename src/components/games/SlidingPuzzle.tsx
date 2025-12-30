import { useEffect, useState } from "react";

interface SlidingPuzzleProps {
  onSolve: () => void;
}

const SIZE = 3; // 3x3 grid

const SlidingPuzzle: React.FC<SlidingPuzzleProps> = ({ onSolve }) => {
  const [tiles, setTiles] = useState<number[]>([]);

  // Shuffle tiles initially
  useEffect(() => {
    const initialTiles = [...Array(SIZE * SIZE).keys()]; // [0..8], 0 is empty
    let shuffled = [...initialTiles];
    do {
      shuffled = shuffleArray(shuffled);
    } while (!isSolvable(shuffled)); // ensure puzzle is solvable
    setTiles(shuffled);
  }, []);

  const shuffleArray = (arr: number[]) => {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const isSolvable = (arr: number[]) => {
    let inversions = 0;
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] && arr[j] && arr[i] > arr[j]) inversions++;
      }
    }
    return inversions % 2 === 0;
  };

  const handleTileClick = (index: number) => {
    const emptyIndex = tiles.indexOf(0);
    const canMove =
      index === emptyIndex - 1 && index % SIZE !== SIZE - 1 ||
      index === emptyIndex + 1 && index % SIZE !== 0 ||
      index === emptyIndex - SIZE ||
      index === emptyIndex + SIZE;

    if (canMove) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);

      if (isSolved(newTiles)) {
        setTimeout(() => onSolve(), 300);
      }
    }
  };

  const isSolved = (arr: number[]) => {
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] !== i + 1) return false;
    }
    return arr[arr.length - 1] === 0;
  };

  return (
    <div className="grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${SIZE}, 80px)`,
        gridTemplateRows: `repeat(${SIZE}, 80px)`,
      }}
    >
      {tiles.map((tile, idx) => (
        <div
          key={idx}
          className={`flex items-center justify-center border rounded text-xl font-bold cursor-pointer
            ${tile === 0 ? "bg-gray-300 cursor-default" : "bg-primary text-white"}`}
          onClick={() => tile !== 0 && handleTileClick(idx)}
        >
          {tile !== 0 ? tile : ""}
        </div>
      ))}
    </div>
  );
};

export default SlidingPuzzle;
