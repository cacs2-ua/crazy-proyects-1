import { Target, Knife } from '../types/game';
import knifeImg from './bloody-knife.png';

export function drawTarget(ctx: CanvasRenderingContext2D, target: Target) {
  ctx.save();
  ctx.translate(target.x, target.y);
  ctx.rotate(target.rotation);

  // Draw outer glow
  const glowGradient = ctx.createRadialGradient(0, 0, target.radius - 10, 0, 0, target.radius + 10);
  glowGradient.addColorStop(0, 'rgba(255, 165, 0, 0.2)');
  glowGradient.addColorStop(1, 'rgba(255, 165, 0, 0)');
  ctx.beginPath();
  ctx.arc(0, 0, target.radius + 10, 0, Math.PI * 2);
  ctx.fillStyle = glowGradient;
  ctx.fill();

  // Draw wooden texture with enhanced gradient
  const woodGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, target.radius);
  woodGradient.addColorStop(0, '#A0522D');
  woodGradient.addColorStop(0.6, '#8B4513');
  woodGradient.addColorStop(1, '#654321');
  
  ctx.beginPath();
  ctx.arc(0, 0, target.radius, 0, Math.PI * 2);
  ctx.fillStyle = woodGradient;
  ctx.fill();

  // Draw wood grain texture
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, target.radius * (Math.random() * 0.8 + 0.2), 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(101, 67, 33, 0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Draw target rings
  const ringColors = ['#DEB887', '#8B4513', '#A0522D'];
  for (let i = 1; i <= 3; i++) {
    const radius = target.radius * (1 - i * 0.25);
    
    // Draw ring shadow
    ctx.beginPath();
    ctx.arc(2, 2, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw main ring
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = ringColors[i - 1];
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // Add center point
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#4A0404';
  ctx.fill();

  ctx.restore();
}

let knifeImage: HTMLImageElement | null = null;

// Create and load the knife image
const loadKnifeImage = () => {
  return new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Enable CORS
    img.src = knifeImg;
    
    img.onload = () => {
      knifeImage = img;
      resolve();
    };
    
    img.onerror = () => {
      console.error('Failed to load knife image');
      // Fallback to drawing a knife
      reject();
    };
  });
};

// Initialize knife image loading
loadKnifeImage().catch(() => {
  console.warn('Using fallback knife drawing');
});

export function drawKnife(ctx: CanvasRenderingContext2D, knife: Knife) {
  ctx.save();
  ctx.translate(knife.x, knife.y);
  ctx.rotate(knife.rotation);

  if (knifeImage && knifeImage.complete) {
    // Draw the knife image
    const scale = 0.15; // Smaller scale for better proportions
    const width = knifeImage.width * scale;
    const height = knifeImage.height * scale;
    
    ctx.drawImage(
      knifeImage,
      -width / 2,  // Center horizontally
      -height + 10, // Position the tip at the rotation point
      width,
      height
    );
  } else {
    // Fallback to drawing a knife if image fails to load
    // Draw blade
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(4, 0);
    ctx.lineTo(0, -40);
    ctx.closePath();
    ctx.fillStyle = '#silver';
    ctx.fill();
    
    // Draw handle
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-5, 0, 10, 15);
  }

  ctx.restore();
}

export function checkCollision(newKnifeAngle: number, stuckKnives: Knife[]): boolean {
  const collisionAngle = Math.PI / 48; //
  
  return stuckKnives.some(knife => {
    const angleDiff = Math.abs(newKnifeAngle - knife.stickPosition) % (Math.PI * 2);
    return angleDiff < collisionAngle || angleDiff > (Math.PI * 2 - collisionAngle);
  });
}