import React, { useState, useEffect } from 'react';
import { Card as CardType, GameState } from '../types';
import { Card } from './Card';
import { generateCards, calculateScore } from '../utils/gameLogic';
import { Timer } from 'lucide-react';

interface GameBoardProps {
  gameState: GameState;
  onGameStateChange: (state: Partial<GameState>) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ gameState, onGameStateChange }) => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const newCards = generateCards(gameState.level);
    setCards(newCards);
    setFlippedCards([]);
  }, [gameState.level]);

  const handleCardClick = (cardId: number) => {
    if (isChecking || flippedCards.length === 2) return;
    
    const clickedCard = cards.find(card => card.id === cardId);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    const newCards = cards.map(card =>
      card.id === cardId ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      onGameStateChange({ moves: gameState.moves + 1 });
      
      const [firstCard, secondCard] = newFlippedCards.map(id =>
        cards.find(card => card.id === id)!
      );

      if (firstCard.imageUrl === secondCard.imageUrl) {
        setTimeout(() => {
          setCards(cards =>
            cards.map(card =>
              newFlippedCards.includes(card.id)
                ? { ...card, isFlipped: true, isMatched: true }
                : card
            )
          );
          setFlippedCards([]);
          setIsChecking(false);

          const allMatched = cards.every(card => 
            card.isMatched || newFlippedCards.includes(card.id)
          );
          
          if (allMatched) {
            const score = calculateScore(gameState.moves, gameState.timeElapsed, gameState.level);
            onGameStateChange({
              gameStatus: 'completed',
              score
            });
          }
        }, 500);
      } else {
        setTimeout(() => {
          setCards(cards =>
            cards.map(card =>
              newFlippedCards.includes(card.id)
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4 text-gray-800 dark:text-white">
          <span className="text-lg font-semibold">Level {gameState.level}</span>
          <span className="text-lg">Moves: {gameState.moves}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-800 dark:text-white">
          <Timer className="w-5 h-5" />
          <span className="text-lg">
            {Math.floor(gameState.timeElapsed / 60)}:
            {(gameState.timeElapsed % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className={`
        grid gap-4
        ${gameState.level === 1 ? 'grid-cols-4' : ''}
        ${gameState.level === 2 ? 'grid-cols-6' : ''}
        ${gameState.level === 3 ? 'grid-cols-8' : ''}
      `}>
        {cards.map(card => (
          <Card
            key={card.id}
            card={card}
            onClick={() => handleCardClick(card.id)}
            disabled={isChecking || gameState.gameStatus !== 'playing'}
          />
        ))}
      </div>
    </div>
  );
}