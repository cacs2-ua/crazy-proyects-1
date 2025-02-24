import { Player, Alien, Projectile, GameState } from '../types/game';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

const drawStarfield = (ctx: CanvasRenderingContext2D) => {
  // Create a subtle starfield effect
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * CANVAS_WIDTH;
    const y = (Math.random() * CANVAS_HEIGHT + performance.now() * 0.02) % CANVAS_HEIGHT;
    const size = Math.random() * 2;
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`;
    ctx.fillRect(x, y, size, size);
  }
};

const drawPixelArt = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  pixels: string[][],
  scale: number = 1
) => {
  pixels.forEach((row, i) => {
    row.forEach((color, j) => {
      if (color !== ' ') {
        ctx.fillStyle = color;
        ctx.fillRect(x + j * scale, y + i * scale, scale, scale);
      }
    });
  });
};

const playerSprite = [
  [' ', ' ', ' ', 'g', 'g', ' ', ' ', ' '],
  [' ', ' ', 'g', 'g', 'g', 'g', ' ', ' '],
  [' ', 'g', 'g', 'G', 'G', 'g', 'g', ' '],
  ['g', 'g', 'g', 'G', 'G', 'g', 'g', 'g'],
  ['g', 'g', 'g', 'g', 'g', 'g', 'g', 'g'],
].map(row => row.map(pixel => 
  pixel === 'g' ? '#00ff00' : 
  pixel === 'G' ? '#80ff80' : 
  ' '
));

const alienSprite = [
  [' ', 'r', ' ', ' ', ' ', ' ', 'r', ' '],
  [' ', ' ', 'r', 'r', 'r', 'r', ' ', ' '],
  [' ', 'r', 'R', 'r', 'r', 'R', 'r', ' '],
  ['r', 'r', 'r', 'r', 'r', 'r', 'r', 'r'],
  ['r', ' ', 'r', ' ', ' ', 'r', ' ', 'r'],
].map(row => row.map(pixel => 
  pixel === 'r' ? '#ff0000' : 
  pixel === 'R' ? '#ff8080' : 
  ' '
));

const drawExplosion = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, frame: number) => {
  const particles = 12;
  const maxRadius = size * (1 - frame / 10);
  
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  
  for (let i = 0; i < particles; i++) {
    const angle = (i / particles) * Math.PI * 2;
    const radius = maxRadius * (0.5 + Math.random() * 0.5);
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    );
    
    const gradient = ctx.createLinearGradient(0, 0, radius, 0);
    gradient.addColorStop(0, '#ff8800');
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  ctx.restore();
};

export const drawGame = (
  ctx: CanvasRenderingContext2D,
  player: Player,
  aliens: Alien[],
  projectiles: Projectile[],
  gameState: GameState
) => {
  // Clear canvas with a dark background
  ctx.fillStyle = '#000033';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw starfield
  drawStarfield(ctx);

  // Draw player
  drawPixelArt(ctx, player.x, player.y, playerSprite, 5);

  // Draw aliens with potential explosions
  aliens.forEach(alien => {
    if (alien.active) {
      drawPixelArt(ctx, alien.x, alien.y, alienSprite, 4);
    } else if (alien.explosionFrame !== undefined && alien.explosionFrame < 10) {
      drawExplosion(ctx, alien.x, alien.y, alien.width, alien.explosionFrame);
    }
  });

  // Draw projectiles with glow effect
  projectiles.forEach(projectile => {
    if (projectile.active) {
      // Glow effect
      const gradient = ctx.createRadialGradient(
        projectile.x + projectile.width / 2,
        projectile.y + projectile.height / 2,
        0,
        projectile.x + projectile.width / 2,
        projectile.y + projectile.height / 2,
        projectile.width * 2
      );
      gradient.addColorStop(0, '#00ff00');
      gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(
        projectile.x + projectile.width / 2,
        projectile.y + projectile.height / 2,
        projectile.width * 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Core of the projectile
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(
        projectile.x,
        projectile.y,
        projectile.width,
        projectile.height
      );
    }
  });

  // Draw score with retro effect
  ctx.font = '20px "Press Start 2P", monospace';
  ctx.fillStyle = '#00ff00';
  ctx.textBaseline = 'top';
  ctx.fillText(`SCORE: ${gameState.score}`, 10, 10);
  ctx.fillText(`WAVE: ${gameState.wave}`, CANVAS_WIDTH - 150, 10);
  
  if (gameState.gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.font = '40px "Press Start 2P", monospace';
    ctx.fillStyle = '#ff0000';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  }
};