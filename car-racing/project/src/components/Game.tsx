import React, { useEffect, useRef, useState } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { Car } from '../game/Car';
import { Track } from '../game/Track';
import { Obstacle } from '../game/Obstacle';
import { PowerUp } from '../game/PowerUp';
import { Projectile } from '../game/Projectile';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const OBSTACLE_SPACING = 200; // Distance between consecutive obstacles vertically
const POWERUP_SPACING = 500; // Distance between consecutive power-ups vertically

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
      const x = 40 + Math.random() * (CANVAS_WIDTH - 80); // Ensure AI cars start within 40px from borders
      const y = CANVAS_HEIGHT - 200 - i * 100; // Stagger AI cars vertically
      const color = colors[i % colors.length];
      cars.push(new Car(x, y, false, color));
    }
    return cars;
  });

  const [track] = useState(() => new Track(CANVAS_WIDTH, CANVAS_HEIGHT));

  /**
   * **UPDATED SPAWNING LOGIC FOR OBSTACLES**
   * Obstacles are now spawned uniformly across the entire width of the map.
   * Previously, obstacles were confined to the left and right borders.
   */
  const [obstacles, setObstacles] = useState<Obstacle[]>(() => {
    const obs: Obstacle[] = [];
    for (let y = CANVAS_HEIGHT - 500; y > track.finishLine + 500; y -= OBSTACLE_SPACING) {
      // **OLD SPAWNING LOGIC: Confined to left or right borders**
      // const side = Math.random() < 0.5 ? 'left' : 'right';
      // let x: number;
      // if (side === 'left') {
      //   x = 40 + Math.random() * 60; // Between 40px and 100px from left
      // } else {
      //   x = CANVAS_WIDTH - 100 + Math.random() * 60; // Between (width - 100)px and (width - 40)px from left
      // }

      // **NEW SPAWNING LOGIC: Uniform distribution across the entire map**
      const x = 40 + Math.random() * (CANVAS_WIDTH - 80); // Ensure obstacles are within 40px from both borders
      const type = Math.random() < 0.7 ? 'rock' : 'oil';
      obs.push(new Obstacle(x, y, type));
    }
    return obs;
  });

  /**
   * **UPDATED SPAWNING LOGIC FOR POWER-UPS**
   * Power-ups are now spawned uniformly across the entire width of the map.
   * Previously, power-ups were confined to the left and right borders.
   */
  const [powerUps, setPowerUps] = useState<PowerUp[]>(() => {
    const pups: PowerUp[] = [];
    for (let y = CANVAS_HEIGHT - 300; y > track.finishLine + 300; y -= POWERUP_SPACING) {
      // **OLD SPAWNING LOGIC: Confined to left or right borders**
      // const side = Math.random() < 0.5 ? 'left' : 'right';
      // let x: number;
      // if (side === 'left') {
      //   x = 40 + Math.random() * 60; // Between 40px and 100px from left
      // } else {
      //   x = CANVAS_WIDTH - 100 + Math.random() * 60; // Between (width - 100)px and (width - 40)px from left
      // }

      // **NEW SPAWNING LOGIC: Uniform distribution across the entire map**
      const x = 40 + Math.random() * (CANVAS_WIDTH - 80); // Ensure power-ups are within 40px from both borders
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
   * **UPDATE FUNCTION**
   * Handles game state updates, including player controls, car movements,
   * power-up usage, collision detection, and game progression.
   */
  const update = (deltaTime: number) => {
    if (!gameStarted || gameFinished) return;

    // Handle player controls
    if (keys.current['ArrowUp']) playerCar.accelerate();
    if (keys.current['ArrowDown']) playerCar.brake();
    if (keys.current['ArrowLeft']) playerCar.moveLeft();
    else if (keys.current['ArrowRight']) playerCar.moveRight();
    else playerCar.stopLateralMovement();

    // **NEW LOGIC: Apply friction when neither ArrowUp nor ArrowDown is pressed**
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

    // Update all cars
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

    // Check collisions with obstacles and projectiles
    const allObjects = [...aiCars, ...obstacles, ...projectiles.filter(p => p.active)];
    
    // Check player collisions
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

    // Check AI car collisions
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

    // Update camera position to follow player
    cameraY.current = playerCar.y - CANVAS_HEIGHT / 2;

    // Update track
    track.update(cameraY.current);

    // Check for finish line
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
   * **DRAW FUNCTION**
   * Handles rendering all game elements onto the canvas.
   */
  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (gameStarted && !gameFinished) {
      track.draw(ctx, cameraY.current);
      obstacles.forEach(obstacle => obstacle.draw(ctx, cameraY.current));
      powerUps.forEach(powerUp => powerUp.draw(ctx, cameraY.current));
      projectiles.forEach(proj => proj.draw(ctx, cameraY.current));
      [...aiCars, playerCar].forEach(car => car.draw(ctx, cameraY.current));

      // Draw UI
      ctx.fillStyle = '#fff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'left';
      
      // Display Speed
      ctx.fillText(`Speed: ${Math.floor(playerCar.speed * 30)}km/h`, 20, 40);
      
      // **ADDED:** Display "Reversing" message when speed is negative
      if (playerCar.speed < 0) {
        ctx.fillStyle = '#ffcc00'; // Optional: Different color for emphasis
        ctx.fillText('Reversing', 20, 70);
        ctx.fillStyle = '#fff'; // Reset to original color
      }

      // Display Power-Up
      if (playerCar.currentPowerUp) {
        ctx.fillText(`Power-up: ${playerCar.currentPowerUp}`, 20, 100);
      }

      // Display Recovery Status
      if (playerCar.crashed) {
        ctx.fillStyle = '#ff0000';
        ctx.fillText(`Recovering: ${Math.ceil(playerCar.recoveryTime / 1000)}s`, 20, 130);
        ctx.fillStyle = '#fff'; // Reset to original color
      }
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
  
  useGameLoop(canvasRef, update, draw);

  /**
   * **GAME RESET LOGIC**
   * Resets the game state when the player presses the Spacebar after game start or finish.
   * This includes repositioning cars, respawning obstacles and power-ups uniformly across the map,
   * and clearing projectiles.
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
          const x = 40 + Math.random() * (CANVAS_WIDTH - 80); // Uniform distribution across width
          const y = CANVAS_HEIGHT - 200 - index * 100; // Stagger AI cars vertically
          car.x = x;
          car.y = y;
          car.speed = 3 + Math.random() * 3;
          car.crashed = false;
          car.currentPowerUp = null;
        });
        
        // **RESET OBSTACLES TO SPAWN UNIFORMLY ACROSS THE MAP**
        const newObstacles: Obstacle[] = [];
        for (let y = CANVAS_HEIGHT - 500; y > track.finishLine + 500; y -= OBSTACLE_SPACING) {
          const x = 40 + Math.random() * (CANVAS_WIDTH - 80); // Uniform distribution across width
          const type = Math.random() < 0.7 ? 'rock' : 'oil';
          newObstacles.push(new Obstacle(x, y, type));
        }
        setObstacles(newObstacles);
        
        // **RESET POWER-UPS TO SPAWN UNIFORMLY ACROSS THE MAP**
        const newPowerUps: PowerUp[] = [];
        for (let y = CANVAS_HEIGHT - 300; y > track.finishLine + 300; y -= POWERUP_SPACING) {
          const x = 40 + Math.random() * (CANVAS_WIDTH - 80); // Uniform distribution across width
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
