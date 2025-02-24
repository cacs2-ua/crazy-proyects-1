import { Player, Alien, Projectile, GameState } from '../types/game';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

// Store star positions for consistent starfield
const stars = Array.from({ length: 100 }, () => ({
  x: Math.random() * CANVAS_WIDTH,
  y: Math.random() * CANVAS_HEIGHT,
  size: Math.random() * 2 + 1,
  speed: Math.random() * 2 + 1,
  twinkle: Math.random(),
}));

const drawStarfield = (ctx: CanvasRenderingContext2D, time: number) => {
  // Create a dynamic starfield effect with twinkling and parallax
  stars.forEach(star => {
    // Update star position with parallax effect
    star.y = (star.y + star.speed) % CANVAS_HEIGHT;
    
    // Calculate twinkle effect
    const twinkle = Math.sin(time * 0.001 + star.twinkle * Math.PI * 2) * 0.5 + 0.5;
    
    // Draw star with glow effect
    const gradient = ctx.createRadialGradient(
      star.x, star.y, 0,
      star.x, star.y, star.size * 2
    );
    gradient.addColorStop(0, `rgba(255, 255, 255, ${0.8 * twinkle})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
    ctx.fill();
  });
};

const drawNebula = (ctx: CanvasRenderingContext2D, time: number) => {
  // Create a subtle nebula effect in the background
  const gradient = ctx.createRadialGradient(
    CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.5, 0,
    CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.5, CANVAS_HEIGHT
  );
  
  // Shift colors over time for a subtle animation
  const hue1 = (time * 0.01) % 360;
  const hue2 = (hue1 + 60) % 360;
  
  gradient.addColorStop(0, `hsla(${hue1}, 50%, 15%, 0.3)`);
  gradient.addColorStop(0.5, `hsla(${hue2}, 50%, 10%, 0.2)`);
  gradient.addColorStop(1, 'rgba(0, 0, 20, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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

const createAlienSprite = (baseColor: string, lightColor: string) => [
  [' ', 'b', ' ', ' ', ' ', ' ', 'b', ' '],
  [' ', ' ', 'b', 'b', 'b', 'b', ' ', ' '],
  [' ', 'b', 'B', 'b', 'b', 'B', 'b', ' '],
  ['b', 'b', 'b', 'b', 'b', 'b', 'b', 'b'],
  ['b', ' ', 'b', ' ', ' ', 'b', ' ', 'b'],
].map(row => row.map(pixel => 
  pixel === 'b' ? baseColor : 
  pixel === 'B' ? lightColor : 
  ' '
));

const alienColors = [
  ['#ff0000', '#ff8080'], // Red alien
  ['#00ffff', '#80ffff'], // Cyan alien
  ['#ff00ff', '#ff80ff'], // Magenta alien
  ['#ffff00', '#ffff80'], // Yellow alien
  ['#ff8000', '#ffb080'], // Orange alien
  ['#0080ff', '#80bfff'], // Blue alien
];

const drawExplosion = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, frame: number, color: string) => {
  const particles = 16;
  const maxRadius = size * (1 - frame / 10) * 2;
  
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  
  // Draw shockwave
  const shockwaveRadius = size * (frame / 5);
  const shockwaveGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, shockwaveRadius);
  shockwaveGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0)');
  shockwaveGradient.addColorStop(0.9, `${color}66`);
  shockwaveGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = shockwaveGradient;
  ctx.beginPath();
  ctx.arc(0, 0, shockwaveRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw particle trails
  for (let i = 0; i < particles; i++) {
    const angle = (i / particles) * Math.PI * 2;
    const radius = maxRadius * (0.5 + Math.random() * 0.5);
    const trailLength = radius * 0.5;
    
    const gradient = ctx.createLinearGradient(
      Math.cos(angle) * (radius - trailLength),
      Math.sin(angle) * (radius - trailLength),
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(angle) * (radius - trailLength),
      Math.sin(angle) * (radius - trailLength)
    );
    ctx.lineTo(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    );
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
  const time = performance.now();

  // Clear canvas with a dark background
  ctx.fillStyle = '#000033';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw nebula effect
  drawNebula(ctx, time);

  // Draw starfield
  drawStarfield(ctx, time);

  // Draw player with engine glow
  drawPixelArt(ctx, player.x, player.y, playerSprite, 5);
  
  // Add engine glow effect
  const engineGlow = ctx.createRadialGradient(
    player.x + player.width / 2, player.y + player.height,
    0, player.x + player.width / 2, player.y + player.height,
    player.height / 2
  );
  engineGlow.addColorStop(0, 'rgba(0, 255, 0, 0.3)');
  engineGlow.addColorStop(1, 'rgba(0, 255, 0, 0)');
  ctx.fillStyle = engineGlow;
  ctx.beginPath();
  ctx.arc(
    player.x + player.width / 2,
    player.y + player.height,
    player.height / 2,
    0, Math.PI * 2
  );
  ctx.fill();

  // Draw aliens with glow effects
  aliens.forEach((alien, index) => {
    if (alien.active) {
      const row = Math.floor(index / 6);
      const [baseColor, lightColor] = alienColors[row % alienColors.length];
      const alienSprite = createAlienSprite(baseColor, lightColor);
      
      // Add alien glow effect
      const glow = ctx.createRadialGradient(
        alien.x + alien.width / 2, alien.y + alien.height / 2,
        0, alien.x + alien.width / 2, alien.y + alien.height / 2,
        alien.width
      );
      glow.addColorStop(0, `${baseColor}33`);
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(
        alien.x + alien.width / 2,
        alien.y + alien.height / 2,
        alien.width,
        0, Math.PI * 2
      );
      ctx.fill();
      
      drawPixelArt(ctx, alien.x, alien.y, alienSprite, 4);
    } else if (alien.explosionFrame !== undefined && alien.explosionFrame < 10) {
      const row = Math.floor(index / 6);
      const [baseColor] = alienColors[row % alienColors.length];
      drawExplosion(ctx, alien.x, alien.y, alien.width, alien.explosionFrame, baseColor);
    }
  });

  // Draw projectiles with enhanced glow effect
  projectiles.forEach(projectile => {
    if (projectile.active) {
      // Outer glow
      const outerGlow = ctx.createRadialGradient(
        projectile.x + projectile.width / 2,
        projectile.y + projectile.height / 2,
        0,
        projectile.x + projectile.width / 2,
        projectile.y + projectile.height / 2,
        projectile.width * 3
      );
      outerGlow.addColorStop(0, 'rgba(0, 255, 0, 0.3)');
      outerGlow.addColorStop(1, 'rgba(0, 255, 0, 0)');
      
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(
        projectile.x + projectile.width / 2,
        projectile.y + projectile.height / 2,
        projectile.width * 3,
        0, Math.PI * 2
      );
      ctx.fill();
      
      // Inner glow
      const innerGlow = ctx.createRadialGradient(
        projectile.x + projectile.width / 2,
        projectile.y + projectile.height / 2,
        0,
        projectile.x + projectile.width / 2,
        projectile.y + projectile.height / 2,
        projectile.width
      );
      innerGlow.addColorStop(0, '#ffffff');
      innerGlow.addColorStop(0.5, '#00ff00');
      innerGlow.addColorStop(1, 'rgba(0, 255, 0, 0)');
      
      ctx.fillStyle = innerGlow;
      ctx.beginPath();
      ctx.arc(
        projectile.x + projectile.width / 2,
        projectile.y + projectile.height / 2,
        projectile.width,
        0, Math.PI * 2
      );
      ctx.fill();
    }
  });

  // Draw score with glow effect
  const drawGlowingText = (text: string, x: number, y: number, color: string) => {
    ctx.font = '20px "Press Start 2P", monospace';
    
    // Draw glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    
    // Draw text
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x, y);
  };

  drawGlowingText(`SCORE: ${gameState.score}`, 10, 30, '#00ff00');
  drawGlowingText(`WAVE: ${gameState.wave}`, CANVAS_WIDTH - 150, 30, '#00ff00');
  
  if (gameState.gameOver) {
    // Create dramatic game over effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw glowing game over text
    ctx.font = '40px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ff0000';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  }
};