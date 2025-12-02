import { useEffect, useState } from "react";

interface MemoryGameProps {
  onSolve: () => void;
}

interface CardType {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
}

const cardValues = ["🍎", "🍌", "🍇", "🍉", "🍒", "🥝"]; // 6 pairs

const MemoryGame: React.FC<MemoryGameProps> = ({ onSolve }) => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [firstCard, setFirstCard] = useState<CardType | null>(null);
  const [secondCard, setSecondCard] = useState<CardType | null>(null);
  const [disableClick, setDisableClick] = useState(false);

  // Initialize and shuffle cards
  useEffect(() => {
    const initCards: CardType[] = [];
    cardValues.forEach((value, index) => {
      initCards.push({ id: index * 2, value, flipped: false, matched: false });
      initCards.push({ id: index * 2 + 1, value, flipped: false, matched: false });
    });
    // Shuffle
    initCards.sort(() => Math.random() - 0.5);
    setCards(initCards);
  }, []);

  // Check match
  useEffect(() => {
    if (firstCard && secondCard) {
      setDisableClick(true);
      if (firstCard.value === secondCard.value) {
        setCards(prev =>
          prev.map(card =>
            card.value === firstCard.value ? { ...card, matched: true } : card
          )
        );
        resetSelection();
      } else {
        setTimeout(() => {
          setCards(prev =>
            prev.map(card =>
              card.id === firstCard.id || card.id === secondCard.id
                ? { ...card, flipped: false }
                : card
            )
          );
          resetSelection();
        }, 1000);
      }
    }
  }, [secondCard]);

  const resetSelection = () => {
    setFirstCard(null);
    setSecondCard(null);
    setDisableClick(false);
  };

  const handleCardClick = (card: CardType) => {
    if (disableClick || card.flipped || card.matched) return;
    const updatedCards = cards.map(c =>
      c.id === card.id ? { ...c, flipped: true } : c
    );
    setCards(updatedCards);

    if (!firstCard) setFirstCard(card);
    else if (!secondCard) setSecondCard(card);
  };

  // Check if all matched
  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.matched)) {
      setTimeout(() => {
        onSolve(); // user solved the game
      }, 500);
    }
  }, [cards]);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {cards.map(card => (
        <div
          key={card.id}
          className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-2xl border rounded cursor-pointer
            ${card.flipped || card.matched ? "bg-white" : "bg-gray-500"}`}
          onClick={() => handleCardClick(card)}
        >
          {(card.flipped || card.matched) && card.value}
        </div>
      ))}
    </div>
  );
};

export default MemoryGame;
