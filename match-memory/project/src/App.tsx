import React, { useState, useEffect } from 'react';
import { GameBoard } from './components/GameBoard';
import { GameState } from './types';
import { Play, Trophy, Sun, Moon } from 'lucide-react';

function App() {
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    moves: 0,
    score: 0,
    timeElapsed: 0,
    gameStatus: 'idle'
  });
  const [isDark, setIsDark] = useState(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    let timer: number;
    if (gameState.gameStatus === 'playing') {
      timer = window.setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState.gameStatus]);

  const handleGameStateChange = (newState: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...newState }));
  };

  const startNewGame = (level: number = 1) => {
    setGameState({
      level,
      moves: 0,
      score: 0,
      timeElapsed: 0,
      gameStatus: 'playing'
    });
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900 p-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            Memory Match
          </h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-6 h-6 text-yellow-400" />
            ) : (
              <Moon className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {gameState.gameStatus === 'idle' && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
              Welcome to Memory Match!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Test your memory by matching pairs of cards. Complete levels with fewer moves and faster times to achieve higher scores!
            </p>
            <button
              onClick={() => startNewGame()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg
                hover:bg-blue-700 transition-colors flex items-center justify-center
                space-x-2 mx-auto"
            >
              <Play className="w-5 h-5" />
              <span>Start Game</span>
            </button>
          </div>
        )}

        {gameState.gameStatus === 'playing' && (
          <GameBoard
            gameState={gameState}
            onGameStateChange={handleGameStateChange}
          />
        )}

        {gameState.gameStatus === 'completed' && (
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Level {gameState.level} Completed!
              </h2>
            </div>
            <div className="space-y-2 text-gray-700 dark:text-gray-200">
              <p className="text-lg">Score: {gameState.score}</p>
              <p className="text-gray-600 dark:text-gray-400">
                Time: {Math.floor(gameState.timeElapsed / 60)}:
                {(gameState.timeElapsed % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Moves: {gameState.moves}</p>
            </div>
            <div className="space-x-4">
              {gameState.level < 3 && (
                <button
                  onClick={() => startNewGame(gameState.level + 1)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg
                    hover:bg-blue-700 transition-colors"
                >
                  Next Level
                </button>
              )}
              <button
                onClick={() => startNewGame(1)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow-lg
                  hover:bg-purple-700 transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;