import React, { useEffect, useRef, useState } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { Car } from '../game/Car';
import { Track } from '../game/Track';
import { Obstacle } from '../game/Obstacle';
import { PowerUp } from '../game/PowerUp';
import { Projectile } from '../game/Projectile';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const OBSTACLE_SPACING = 350; // Distance between consecutive obstacles vertically
const POWERUP_SPACING = 300;  // Distance between consecutive power-ups vertically

export function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize the player car
  const [playerCar] = useState(() =>
    new Car(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100, true, '#4B0082')
  );

  // Initialize 7 AI cars with unique positions and colors
  const [aiCars] = useState(() => {
    const colors = ['#ff0000', '#0000ff', '#ff8000', '#006400', '#ff00ff', '#00ffff', '#ffffff'];
    const cars: Car[] = [];
    for (let i = 0; i < 7; i++) {
      const x = 40 + Math.random() * (CANVAS_WIDTH - 80); 
      const y = CANVAS_HEIGHT - 200 - i * 100;
      const color = colors[i % colors.length];
      cars.push(new Car(x, y, false, color));
    }
    return cars;
  });

  const [track] = useState(() => new Track(CANVAS_WIDTH, CANVAS_HEIGHT));

  // Spawn obstacles uniformly
  const [obstacles, setObstacles] = useState<Obstacle[]>(() => {
    const obs: Obstacle[] = [];
    for (let y = CANVAS_HEIGHT - 500; y > track.finishLine + 500; y -= OBSTACLE_SPACING) {
      const x = 40 + Math.random() * (CANVAS_WIDTH - 80);
      const type = Math.random() < 0.7 ? 'rock' : 'oil';
      obs.push(new Obstacle(x, y, type));
    }
    return obs;
  });

  // Spawn power-ups uniformly
  const [powerUps, setPowerUps] = useState<PowerUp[]>(() => {
    const pups: PowerUp[] = [];
    for (let y = CANVAS_HEIGHT - 300; y > track.finishLine + 300; y -= POWERUP_SPACING) {
      const x = 40 + Math.random() * (CANVAS_WIDTH - 80);
      const types: ('boost' | 'missile' | 'shield' | 'oil')[] = ['boost', 'missile', 'shield', 'oil'];
      const type = types[Math.floor(Math.random() * types.length)];
      pups.push(new PowerUp(x, y, type));
    }
    return pups;
  });

  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [winner, setWinner] = useState<string>('');

  const keys = useRef<{ [key: string]: boolean }>({});
  const cameraY = useRef(CANVAS_HEIGHT - 200);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  /**
   * UPDATE FUNCTION
   */
  const update = (deltaTime: number) => {
    if (!gameStarted || gameFinished) return;

    // Handle player controls
    if (keys.current['ArrowUp']) playerCar.accelerate();
    if (keys.current['ArrowDown']) playerCar.brake();
    if (keys.current['ArrowLeft']) playerCar.moveLeft();
    else if (keys.current['ArrowRight']) playerCar.moveRight();
    else playerCar.stopLateralMovement();

    // Apply friction when not accelerating/braking
    if (!keys.current['ArrowUp'] && !keys.current['ArrowDown']) {
      playerCar.applyFriction();
    }

    // Use power-up with spacebar
    if (keys.current[' ']) {
      const projectile = playerCar.usePowerUp();
      if (projectile) {
        setProjectiles(prev => [...prev, projectile]);
      }
    }

    // Update cars
    playerCar.update(deltaTime, track.width);
    aiCars.forEach(car => {
      car.updateAI(track.width, playerCar.y, [...aiCars, playerCar, ...obstacles, ...powerUps, ...projectiles]);
      car.update(deltaTime, track.width);
    });

    // Update projectiles
    projectiles.forEach(proj => proj.update());

    // Check power-up collisions
    powerUps.forEach(powerUp => {
      if (powerUp.active) {
        [...aiCars, playerCar].forEach(car => {
          if (!car.currentPowerUp && car.checkCollision(powerUp)) {
            car.currentPowerUp = powerUp.type;
            powerUp.active = false;
          }
        });
      }
    });

    // Check collisions with obstacles/projectiles
    const allObjects = [...aiCars, ...obstacles, ...projectiles.filter(p => p.active)];
    
    // Player collisions
    allObjects.forEach(obj => {
      if (playerCar.checkCollision(obj)) {
        if (obj instanceof Projectile) {
          if (obj.owner !== playerCar) {
            playerCar.crash();
            obj.active = false;
          }
        } else {
          playerCar.crash();
        }
      }
    });

    // AI car collisions
    aiCars.forEach(car => {
      allObjects.forEach(obj => {
        if (obj !== car && car.checkCollision(obj)) {
          if (obj instanceof Projectile) {
            if (obj.owner !== car) {
              car.crash();
              obj.active = false;
            }
          } else {
            car.crash();
          }
        }
      });
    });

    // Clean up inactive projectiles
    setProjectiles(prev => prev.filter(p => p.active));

    // Update camera position
    cameraY.current = playerCar.y - CANVAS_HEIGHT / 2;

    // Update track
    track.update(cameraY.current);

    // Check finish line
    const allCars = [playerCar, ...aiCars];
    for (const car of allCars) {
      if (track.isFinished(car.y) && !gameFinished) {
        setGameFinished(true);
        setWinner(car.isPlayer ? 'Player' : 'AI');
        break;
      }
    }
  };

  /**
   * DRAW FUNCTION
   */
  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (gameStarted && !gameFinished) {
      track.draw(ctx, cameraY.current);
      obstacles.forEach(obstacle => obstacle.draw(ctx, cameraY.current));
      powerUps.forEach(powerUp => powerUp.draw(ctx, cameraY.current));
      projectiles.forEach(proj => proj.draw(ctx, cameraY.current));
      [...aiCars, playerCar].forEach(car => car.draw(ctx, cameraY.current));

      // =====================
      // === UI & POSITION ===
      // =====================
      ctx.fillStyle = '#fff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'left';

      // Speed
      ctx.fillText(`Speed: ${Math.floor(playerCar.speed * 30)}km/h`, 20, 40);

      // Reversing message
      if (playerCar.speed < 0) {
        ctx.fillStyle = '#ffcc00';
        ctx.fillText('Reversing', 20, 70);
        ctx.fillStyle = '#fff';
      }

      // Power-up
      if (playerCar.currentPowerUp) {
        ctx.fillText(`Power-up: ${playerCar.currentPowerUp}`, 20, 100);
      }

      // Recovery
      if (playerCar.crashed) {
        ctx.fillStyle = '#ff0000';
        ctx.fillText(`Recovering: ${Math.ceil(playerCar.recoveryTime / 1000)}s`, 20, 130);
        ctx.fillStyle = '#fff';
      }

      // **NEW**: Show player's current position in the race
      // 1) Combine player + AI cars
      const allCars = [playerCar, ...aiCars];
      // 2) Sort them by 'y' ascending (lowest y = furthest ahead)
      const sorted = allCars.slice().sort((a, b) => a.y - b.y);
      // 3) Find player's index => position
      const playerIndex = sorted.indexOf(playerCar);
      const playerPosition = playerIndex + 1; // 1-based rank

      // Optional: Convert numeric rank to "1st", "2nd", "3rd", etc.
      const ordinal = getOrdinal(playerPosition);

      // Draw position text
      ctx.fillStyle = '#fff';
      ctx.fillText(`Position: ${ordinal}`, 20, 160);

    } else if (!gameStarted) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#fff';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Press SPACE to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.font = '24px Arial';
      ctx.fillText('Use arrow keys to control your car', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
      ctx.fillText('Press SPACE to use power-ups', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);
      ctx.fillText('Collect power-ups and avoid obstacles!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 130);

    } else if (gameFinished) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#fff';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${winner} Wins!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.font = '24px Arial';
      ctx.fillText('Press SPACE to Play Again', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    }
  };

  // Use game loop
  useGameLoop(canvasRef, update, draw);

  /**
   * GAME RESET LOGIC
   */
  useEffect(() => {
    const handleSpace = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (!gameStarted || gameFinished)) {
        // Reset player car
        playerCar.x = CANVAS_WIDTH / 2;
        playerCar.y = CANVAS_HEIGHT - 100;
        playerCar.speed = 0;
        playerCar.crashed = false;
        playerCar.currentPowerUp = null;

        // Reset AI cars
        aiCars.forEach((car, index) => {
          const x = 40 + Math.random() * (CANVAS_WIDTH - 80);
          const y = CANVAS_HEIGHT - 200 - index * 100;
          car.x = x;
          car.y = y;
          car.speed = 3 + Math.random() * 3;
          car.crashed = false;
          car.currentPowerUp = null;
        });

        // Reset obstacles
        const newObstacles: Obstacle[] = [];
        for (let y = CANVAS_HEIGHT - 500; y > track.finishLine + 500; y -= OBSTACLE_SPACING) {
          const x = 40 + Math.random() * (CANVAS_WIDTH - 80);
          const type = Math.random() < 0.7 ? 'rock' : 'oil';
          newObstacles.push(new Obstacle(x, y, type));
        }
        setObstacles(newObstacles);

        // Reset power-ups
        const newPowerUps: PowerUp[] = [];
        for (let y = CANVAS_HEIGHT - 300; y > track.finishLine + 300; y -= POWERUP_SPACING) {
          const x = 40 + Math.random() * (CANVAS_WIDTH - 80);
          const types: ('boost' | 'missile' | 'shield' | 'oil')[] = ['boost', 'missile', 'shield', 'oil'];
          const type = types[Math.floor(Math.random() * types.length)];
          newPowerUps.push(new PowerUp(x, y, type));
        }
        setPowerUps(newPowerUps);

        // Clear projectiles
        setProjectiles([]);

        // Reset camera
        cameraY.current = CANVAS_HEIGHT - 200;
        setGameFinished(false);
        setGameStarted(true);
      }
    };

    window.addEventListener('keydown', handleSpace);
    return () => window.removeEventListener('keydown', handleSpace);
  }, [gameStarted, gameFinished, aiCars, track]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-4 border-blue-500 rounded-lg shadow-xl"
      />
    </div>
  );
}

/**
 * OPTIONAL HELPER FUNCTION:
 * Convert numeric rank (1, 2, 3, 4...) to string with ordinal suffix.
 */
function getOrdinal(n: number): string {
  if (n > 10 && n < 14) return `${n}th`;
  const lastDigit = n % 10;
  switch (lastDigit) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}
