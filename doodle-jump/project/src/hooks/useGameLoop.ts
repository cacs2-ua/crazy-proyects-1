import { useEffect, useRef } from 'react';
import { Platform, Player, PowerUp, Enemy, GameState } from '../types/game';

const GRAVITY = 0.5;
const JUMP_FORCE = -15; // Reduced from -15 for slower jumps
const MOVE_SPEED = 5;
const PLATFORM_COUNT = 10;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;

// Store star positions to prevent flickering
const stars = Array.from({ length: 50 }, () => ({
  x: Math.random() * CANVAS_WIDTH,
  y: Math.random() * CANVAS_HEIGHT,
  radius: Math.random() * 1.5,
  opacity: Math.random() * 0.8 + 0.2,
  speed: Math.random() * 0.05 + 0.02,
}));

export const useGameLoop = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const playerRef = useRef<Player>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 100,
    velocityY: 0,
    velocityX: 0,
    width: 40,
    height: 45,
    isJumping: false,
    hasShield: false,
    direction: 1,
    highestPlatform: CANVAS_HEIGHT, // Track the highest platform reached
  });

  const platformsRef = useRef<Platform[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const gameStateRef = useRef<GameState>({
    score: 0,
    multiplier: 1,
    gameOver: false,
    highScore: 0,
  });

  const generatePlatforms = () => {
    const platforms: Platform[] = [];
    
    // Add initial platform directly under the player
    platforms.push({
      x: CANVAS_WIDTH / 2 - 30,
      y: CANVAS_HEIGHT - 50,
      width: 60,
      type: 'static',
      visible: true,
      direction: 1,
    });

    // Generate remaining platforms
    for (let i = 0; i < PLATFORM_COUNT - 1; i++) {
      platforms.push({
        x: Math.random() * (CANVAS_WIDTH - 60),
        y: (CANVAS_HEIGHT / PLATFORM_COUNT) * i,
        width: 60,
        type: Math.random() < 0.7 ? 'static' : Math.random() < 0.85 ? 'moving' : 'disappearing',
        visible: true,
        direction: Math.random() < 0.5 ? -1 : 1,
      });
    }
    return platforms;
  };

  const drawPenguin = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, direction: number, hasShield: boolean) => {
    ctx.save();
    
    // Shield effect
    if (hasShield) {
      ctx.shadowColor = '#2196F3';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(x + width/2, y + height/2, Math.max(width, height)/1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(33, 150, 243, 0.3)';
      ctx.fill();
    }

    // Body
    ctx.fillStyle = '#2C3E50';
    ctx.beginPath();
    ctx.ellipse(x + width/2, y + height/2, width/2, height/2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = '#ECF0F1';
    ctx.beginPath();
    ctx.ellipse(x + width/2, y + height/2 + 5, width/3, height/3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    const eyeX = direction === 1 ? x + width * 0.7 : x + width * 0.3;
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(eyeX, y + height * 0.3, width * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupils
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(eyeX + (direction * 2), y + height * 0.3, width * 0.07, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#E67E22';
    ctx.beginPath();
    ctx.moveTo(x + (direction === 1 ? width * 0.8 : width * 0.2), y + height * 0.4);
    ctx.lineTo(x + (direction === 1 ? width : 0), y + height * 0.45);
    ctx.lineTo(x + (direction === 1 ? width * 0.8 : width * 0.2), y + height * 0.5);
    ctx.closePath();
    ctx.fill();

    // Feet
    ctx.fillStyle = '#E67E22';
    ctx.beginPath();
    ctx.ellipse(x + width * 0.3, y + height * 0.9, width * 0.15, height * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + width * 0.7, y + height * 0.9, width * 0.15, height * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const spawnPowerUp = () => {
    if (Math.random() < 0.1 && powerUpsRef.current.length < 2) {
      powerUpsRef.current.push({
        x: Math.random() * (CANVAS_WIDTH - 20),
        y: Math.random() * CANVAS_HEIGHT / 2,
        type: ['jump', 'shield', 'multiplier'][Math.floor(Math.random() * 3)] as 'jump' | 'shield' | 'multiplier',
        active: true,
      });
    }
  };

  const spawnEnemy = () => {
    if (Math.random() < 0.1 && enemiesRef.current.length < 3) {
      enemiesRef.current.push({
        x: Math.random() * (CANVAS_WIDTH - 30),
        y: -30,
        width: 30,
        height: 30,
        active: true,
        direction: Math.random() < 0.5 ? -1 : 1,
      });
    }
  };

  const drawStars = (ctx: CanvasRenderingContext2D) => {
    stars.forEach(star => {
      // Update star position
      star.y = (star.y + star.speed) % CANVAS_HEIGHT;
      
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctx.fill();
    });
  };

  const update = () => {
    const player = playerRef.current;
    const platforms = platformsRef.current;
    const gameState = gameStateRef.current;

    if (gameState.gameOver) return;

    // Update player position
    player.velocityY += GRAVITY;
    player.y += player.velocityY;
    player.x += player.velocityX;

    // Update player direction based on movement
    if (player.velocityX > 0) player.direction = 1;
    if (player.velocityX < 0) player.direction = -1;

    // Screen wrapping
    if (player.x > CANVAS_WIDTH) player.x = 0;
    if (player.x < 0) player.x = CANVAS_WIDTH;

    // Platform collision
    platforms.forEach((platform) => {
      if (platform.visible && 
          player.velocityY > 0 &&
          player.y + player.height > platform.y &&
          player.y + player.height < platform.y + 20 &&
          player.x + player.width > platform.x &&
          player.x < platform.x + platform.width) {
        
        if (platform.type === 'disappearing') {
          platform.visible = false;
        }
        
        player.velocityY = JUMP_FORCE;
        player.isJumping = true;

        // Only increase score if this platform is higher than the highest reached
        if (platform.y < player.highestPlatform) {
          player.highestPlatform = platform.y;
          gameState.score += 10 * gameState.multiplier;
        }
      }
    });

    // Update platforms
    platforms.forEach((platform) => {
      if (platform.type === 'moving') {
        platform.x += platform.direction! * 2;
        if (platform.x <= 0 || platform.x + platform.width >= CANVAS_WIDTH) {
          platform.direction! *= -1;
        }
      }
    });

    // Camera follow
    if (player.y < CANVAS_HEIGHT / 2) {
      const diff = CANVAS_HEIGHT / 2 - player.y;
      player.y = CANVAS_HEIGHT / 2;
      player.highestPlatform += diff; // Adjust the highest platform tracking with camera
      platforms.forEach((platform) => {
        platform.y += diff;
        if (platform.y > CANVAS_HEIGHT) {
          platform.y = 0;
          platform.x = Math.random() * (CANVAS_WIDTH - platform.width);
          platform.visible = true;
          spawnPowerUp();
          spawnEnemy();
        }
      });
    }

    // Game over condition
    if (player.y > CANVAS_HEIGHT) {
      gameState.gameOver = true;
      gameState.highScore = Math.max(gameState.score, gameState.highScore);
    }

    draw();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw nighttime background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#0a1128');
    gradient.addColorStop(1, '#1a237e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars
    drawStars(ctx);

    // Draw platforms with glowing effect
    platformsRef.current.forEach((platform) => {
      if (!platform.visible) return;
      
      const gradient = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + 10);
      if (platform.type === 'static') {
        gradient.addColorStop(0, '#483D8B');
        gradient.addColorStop(1, '#00008B');
      } else if (platform.type === 'moving') {
        gradient.addColorStop(0, '#00BFFF');
        gradient.addColorStop(1, '#1E90FF');
      } else {
        gradient.addColorStop(0, '#800000');
        gradient.addColorStop(1, '#8B0000');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(platform.x, platform.y, platform.width, 10);
      
      ctx.shadowColor = platform.type === 'static' ? '#7B68EE' :
                       platform.type === 'moving' ? '#0000FF' : '#F44336';
      ctx.shadowBlur = 10;
      ctx.fillRect(platform.x, platform.y, platform.width, 10);
      ctx.shadowBlur = 0;
    });

    // Draw penguin character
    const player = playerRef.current;
    drawPenguin(ctx, player.x, player.y, player.width, player.height, player.direction, player.hasShield);

    // Draw score with glow effect
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${gameStateRef.current.score}`, 10, 30);
    ctx.shadowBlur = 0;

    if (gameStateRef.current.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#fff';
      ctx.font = '40px Arial';
      ctx.fillText('Game Over!', CANVAS_WIDTH / 2 - 100, CANVAS_HEIGHT / 2);
      ctx.font = '20px Arial';
      ctx.fillText(`High Score: ${gameStateRef.current.highScore}`, CANVAS_WIDTH / 2 - 70, CANVAS_HEIGHT / 2 + 40);
      ctx.shadowBlur = 0;
    }
  };

  useEffect(() => {
    platformsRef.current = generatePlatforms();
    let animationId: number;

    const gameLoop = () => {
      update();
      animationId = requestAnimationFrame(gameLoop);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        playerRef.current.velocityX = -MOVE_SPEED;
      } else if (e.key === 'ArrowRight') {
        playerRef.current.velocityX = MOVE_SPEED;
      } else if (e.key === ' ' && gameStateRef.current.gameOver) {
        // Reset game
        playerRef.current = {
          x: CANVAS_WIDTH / 2,
          y: CANVAS_HEIGHT - 100,
          velocityY: 0,
          velocityX: 0,
          width: 40,
          height: 45,
          isJumping: false,
          hasShield: false,
          direction: 1,
          highestPlatform: CANVAS_HEIGHT,
        };
        platformsRef.current = generatePlatforms();
        powerUpsRef.current = [];
        enemiesRef.current = [];
        gameStateRef.current = {
          score: 0,
          multiplier: 1,
          gameOver: false,
          highScore: gameStateRef.current.highScore,
        };
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        playerRef.current.velocityX = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    gameLoop();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return gameStateRef.current;
};