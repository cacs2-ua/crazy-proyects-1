import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { Player, Alien, Projectile, GameState } from '../types/game';
import { CANVAS_HEIGHT, CANVAS_WIDTH, PLAYER_SIZE, ALIEN_SIZE, PROJECTILE_SIZE } from '../constants';
import { drawGame } from '../utils/renderer';
import { checkCollision } from '../utils/collision';
import { createAlienWave } from '../utils/gameSetup';

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    gameOver: false,
    wave: 1,
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

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
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
  }, []);

  const shoot = useCallback(() => {
    const currentTime = Date.now();
    if (currentTime - lastShotTimeRef.current < 250) return; // 250ms cooldown between shots
    
    lastShotTimeRef.current = currentTime;

    const projectileX = player.x + (PLAYER_SIZE / 2) - (PROJECTILE_SIZE / 2);
    const projectileY = player.y - PROJECTILE_SIZE;

    setProjectiles(prev => [
      ...prev.filter(p => p.active),
      {
        x: projectileX,
        y: projectileY,
        width: PROJECTILE_SIZE,
        height: PROJECTILE_SIZE * 2,
        active: true,
      }
    ]);

    shootSound.current.currentTime = 0;
    shootSound.current.play().catch(() => {});
  }, [player.x, player.y]);

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
    
    // Handle shooting
    if (keys.has(' ')) {
      shoot();
    }

    if (newX !== player.x) {
      setPlayer(prev => ({ ...prev, x: newX }));
    }

    // Update projectiles
    setProjectiles(prev => 
      prev.map(projectile => ({
        ...projectile,
        y: projectile.y - 10,
        active: projectile.y > -PROJECTILE_SIZE
      }))
    );

    // Update aliens and handle collisions
    setAliens(prev => {
      const newAliens = prev.map(alien => ({
        ...alien,
        y: alien.y + 0.5 * (1 + gameState.wave * 0.1),
        explosionFrame: alien.explosionFrame !== undefined ? alien.explosionFrame + 1 : undefined,
      }));

      // Check for collisions between projectiles and aliens
      projectiles.forEach(projectile => {
        if (!projectile.active) return;

        newAliens.forEach((alien, index) => {
          if (!alien.active || alien.explosionFrame !== undefined) return;

          if (checkCollision(alien, projectile)) {
            // Mark alien as destroyed
            newAliens[index] = {
              ...alien,
              active: false,
              explosionFrame: 0,
            };

            // Deactivate the projectile
            projectile.active = false;

            // Play explosion sound and update score
            explosionSound.current.currentTime = 0;
            explosionSound.current.play().catch(() => {});
            
            setGameState(prev => ({
              ...prev,
              score: prev.score + alien.points,
            }));
          }
        });
      });

      return newAliens;
    });

    // Check for game over
    if (aliens.some(alien => alien.active && alien.y + ALIEN_SIZE > player.y)) {
      setGameState(prev => ({ ...prev, gameOver: true }));
    }

    // Check for wave completion
    if (aliens.every(alien => !alien.active)) {
      setGameState(prev => ({ ...prev, wave: prev.wave + 1 }));
      setAliens(createAlienWave(gameState.wave + 1));
    }

    // Render game
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      drawGame(ctx, player, aliens, projectiles, gameState);
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
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-green-500 text-black font-bold rounded hover:bg-green-400 transition-colors"
        >
          Play Again
        </button>
      )}
      <div className="text-green-500 mt-4 font-['Press_Start_2P'] text-sm">
        Use ← → to move, SPACE to shoot
      </div>
    </div>
  );
};

export default Game;