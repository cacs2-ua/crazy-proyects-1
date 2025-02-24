import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { Player, Alien, Projectile, GameState } from '../types/game';
import { CANVAS_HEIGHT, CANVAS_WIDTH, PLAYER_SIZE, ALIEN_SIZE, PROJECTILE_SIZE } from '../constants';
import { drawGame } from '../utils/renderer';
import { checkCollision } from '../utils/collision';
import { createAlienWave } from '../utils/gameSetup';
import { Skull, RotateCcw, Trophy } from 'lucide-react';

const ALIEN_SPEED = 2;
const ALIEN_DROP_DISTANCE = 20;

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    gameOver: false,
    wave: 1,
    alienDirection: 1,
    alienStepDown: false,
    highScore: parseInt(localStorage.getItem('highScore') || '0', 10),
  });

  const [player, setPlayer] = useState<Player>({
    x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2,
    y: CANVAS_HEIGHT - PLAYER_SIZE * 2,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    speed: 5,
    lives: 3,
  });

  const [aliens, setAliens] = useState<Alien[]>(createAlienWave(1));
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const keysRef = useRef<Set<string>>(new Set());
  const lastShotTimeRef = useRef<number>(0);

  // Sound effects
  const shootSound = useRef(new Audio('/sounds/shoot.wav'));
  const explosionSound = useRef(new Audio('/sounds/explosion.wav'));

  const restartGame = () => {
    setGameState({
      score: 0,
      gameOver: false,
      wave: 1,
      alienDirection: 1,
      alienStepDown: false,
      highScore: gameState.highScore,
    });
    setPlayer({
      x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2,
      y: CANVAS_HEIGHT - PLAYER_SIZE * 2,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      speed: 5,
      lives: 3,
    });
    setAliens(createAlienWave(1));
    setProjectiles([]);
  };

  const shoot = useCallback(() => {
    const currentTime = Date.now();
    if (currentTime - lastShotTimeRef.current < 250) return;
    
    lastShotTimeRef.current = currentTime;

    setProjectiles(prev => [
      ...prev.filter(p => p.active),
      {
        x: player.x + (PLAYER_SIZE / 2) - (PROJECTILE_SIZE / 2),
        y: player.y - PROJECTILE_SIZE,
        width: PROJECTILE_SIZE,
        height: PROJECTILE_SIZE * 2,
        active: true,
      }
    ]);

    shootSound.current.currentTime = 0;
    shootSound.current.play().catch(() => {});
  }, [player.x, player.y]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (e.code === 'Space') {
        e.preventDefault();
        shoot();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [shoot]);

  const gameLoop = useCallback(() => {
    if (gameState.gameOver) return;

    // Player movement
    const keys = keysRef.current;
    let newX = player.x;
    
    if (keys.has('ArrowLeft')) {
      newX = Math.max(0, player.x - player.speed);
    }
    if (keys.has('ArrowRight')) {
      newX = Math.min(CANVAS_WIDTH - PLAYER_SIZE, player.x + player.speed);
    }

    if (newX !== player.x) {
      setPlayer(prev => ({ ...prev, x: newX }));
    }

    // Update projectiles
    let updatedProjectiles = projectiles.map(projectile => ({
      ...projectile,
      y: projectile.y - 10,
      active: projectile.y > -PROJECTILE_SIZE
    }));

    // Update aliens with horizontal movement
    let shouldStepDown = false;
    let newDirection = gameState.alienDirection;

    aliens.forEach(alien => {
      if (!alien.active) return;
      const nextX = alien.x + ALIEN_SPEED * gameState.alienDirection;
      if (nextX <= 0 || nextX + ALIEN_SIZE >= CANVAS_WIDTH) {
        shouldStepDown = true;
        newDirection = -gameState.alienDirection;
      }
    });

    let updatedAliens = aliens.map(alien => ({
      ...alien,
      x: alien.x + (shouldStepDown ? 0 : ALIEN_SPEED * gameState.alienDirection),
      y: alien.y + (shouldStepDown ? ALIEN_DROP_DISTANCE : 0),
      explosionFrame: alien.explosionFrame !== undefined ? alien.explosionFrame + 1 : undefined,
    }));

    // Check for collisions
    projectileLoop: for (let projectileIndex = 0; projectileIndex < updatedProjectiles.length; projectileIndex++) {
      const projectile = updatedProjectiles[projectileIndex];
      if (!projectile.active) continue;

      for (let alienIndex = 0; alienIndex < updatedAliens.length; alienIndex++) {
        const alien = updatedAliens[alienIndex];
        if (!alien.active || alien.explosionFrame !== undefined) continue;

        if (checkCollision(projectile, alien)) {
          updatedProjectiles[projectileIndex].active = false;
          updatedAliens[alienIndex] = {
            ...alien,
            active: false,
            explosionFrame: 0,
          };

          explosionSound.current.currentTime = 0;
          explosionSound.current.play().catch(() => {});
          
          setGameState(prev => ({
            ...prev,
            score: prev.score + alien.points,
          }));

          break projectileLoop;
        }
      }
    }

    setProjectiles(updatedProjectiles);
    setAliens(updatedAliens);

    if (shouldStepDown) {
      setGameState(prev => ({
        ...prev,
        alienDirection: newDirection,
      }));
    }

    // Check for game over
    if (updatedAliens.some(alien => alien.active && alien.y + ALIEN_SIZE > player.y)) {
      const finalScore = gameState.score;
      const newHighScore = Math.max(finalScore, gameState.highScore);
      
      if (newHighScore > gameState.highScore) {
        localStorage.setItem('highScore', newHighScore.toString());
      }
      
      setGameState(prev => ({ 
        ...prev, 
        gameOver: true,
        highScore: newHighScore
      }));
    }

    // Check for wave completion
    if (updatedAliens.every(alien => !alien.active)) {
      setGameState(prev => ({
        ...prev,
        wave: prev.wave + 1,
        alienDirection: 1,
      }));
      setAliens(createAlienWave(gameState.wave + 1));
    }

    // Render game
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      drawGame(ctx, player, updatedAliens, updatedProjectiles, gameState);
    }
  }, [player, aliens, projectiles, gameState, shoot]);

  useGameLoop(gameLoop);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-4 border-green-500 rounded-lg shadow-[0_0_20px_rgba(0,255,0,0.5)]"
      />
      {gameState.gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className="bg-black border-2 border-red-500 p-8 rounded-lg shadow-[0_0_30px_rgba(255,0,0,0.3)] text-center">
            <div className="flex justify-center mb-4">
              <Skull className="w-16 h-16 text-red-500" />
            </div>
            <h2 className="text-3xl font-['Press_Start_2P'] text-red-500 mb-6">GAME OVER</h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between gap-4 text-green-500 font-['Press_Start_2P']">
                <span className="text-sm">Final Score:</span>
                <span className="text-xl">{gameState.score}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-yellow-500 font-['Press_Start_2P']">
                <span className="text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  High Score:
                </span>
                <span className="text-xl">{gameState.highScore}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-blue-500 font-['Press_Start_2P']">
                <span className="text-sm">Wave:</span>
                <span className="text-xl">{gameState.wave}</span>
              </div>
            </div>
            <button
              onClick={restartGame}
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-red-500 text-white font-['Press_Start_2P'] text-sm rounded hover:bg-red-400 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </button>
          </div>
        </div>
      )}
      <div className="text-green-500 mt-4 font-['Press_Start_2P'] text-sm">
        Use ← → to move, SPACE to shoot
      </div>
    </div>
  );
};

export default Game;