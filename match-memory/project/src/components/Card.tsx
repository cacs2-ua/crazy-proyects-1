import React from 'react';
import { Card as CardType } from '../types';
import { Check } from 'lucide-react';

interface CardProps {
  card: CardType;
  onClick: () => void;
  disabled: boolean;
}

export const Card: React.FC<CardProps> = ({ card, onClick, disabled }) => {
  return (
    <div 
      onClick={() => !disabled && !card.isMatched && onClick()}
      className="relative w-24 h-24 cursor-pointer"
      style={{ perspective: '1000px' }}
    >
      <div
        className={`
          relative w-full h-full transition-all duration-500 preserve-3d
          ${card.isFlipped ? '[transform:rotateY(180deg)]' : ''}
          ${card.isMatched ? 'ring-4 ring-green-400 dark:ring-green-500 ring-opacity-75 rounded-lg' : ''}
        `}
      >
        {/* Card Back */}
        <div
          className="absolute w-full h-full bg-gradient-to-br from-blue-500 to-purple-600
            dark:from-blue-700 dark:to-purple-800
            rounded-lg shadow-lg flex items-center justify-center backface-hidden
            border-2 border-white/20 dark:border-white/10"
        >
          <div className="text-white text-4xl">?</div>
        </div>
        
        {/* Card Front */}
        <div
          className="absolute w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg 
            overflow-hidden backface-hidden [transform:rotateY(180deg)]
            border-2 border-gray-200 dark:border-gray-700"
        >
          <img
            src={card.imageUrl}
            alt="card"
            className="w-full h-full object-cover"
            loading="eager"
          />
          {card.isMatched && (
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-500 dark:text-green-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};