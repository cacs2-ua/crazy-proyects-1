import React, { useRef } from 'react';
import { useGameLoop } from './hooks/useGameLoop';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useGameLoop(canvasRef);

  return (
    <div className="min-h-screen bg-[#0a1128] flex flex-col items-center justify-center">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-white mb-2">Tux Jump!!🐧🐧</h1>
        <p className="text-gray-300 text-center">
          Use ← → arrows to move<br />
          {gameState.gameOver && 'Press SPACE to restart'}
        </p>
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={600}
        className="border-4 border-indigo-600 rounded-lg shadow-lg"
      />
    </div>
  );
}

export default App;