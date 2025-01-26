import { Target, Knife } from '../types/game';
import knifeImg from './bloody-knife.png';

export function drawTarget(ctx: CanvasRenderingContext2D, target: Target) {
  ctx.save();
  ctx.translate(target.x, target.y);
  ctx.rotate(target.rotation);

  // ---- CHANGED: Create a bloody red outer glow
  const glowGradient = ctx.createRadialGradient(0, 0, target.radius - 15, 0, 0, target.radius + 20);
  glowGradient.addColorStop(0, 'rgba(255, 0, 0, 0.4)');
  glowGradient.addColorStop(1, 'rgba(139, 0, 0, 0)');
  ctx.beginPath();
  ctx.arc(0, 0, target.radius + 20, 0, Math.PI * 2);
  ctx.fillStyle = glowGradient;
  ctx.fill();

  // ---- CHANGED: Replacing the wooden texture with a darker, blood-soaked gradient
  const bloodGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, target.radius);
  bloodGradient.addColorStop(0, '#4A0404');    // dark blood red
  bloodGradient.addColorStop(0.4, '#650101'); // deeper red
  bloodGradient.addColorStop(1, '#2e0101');   // near-black red

  ctx.beginPath();
  ctx.arc(0, 0, target.radius, 0, Math.PI * 2);
  ctx.fillStyle = bloodGradient;
  ctx.fill();

  // ---- CHANGED: Add random "blood splatter" arcs
  const splatterCount = 10;
  for (let i = 0; i < splatterCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = target.radius * (0.2 + Math.random() * 0.8);
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.arc(radius, 0, 5 + Math.random() * 15, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(139, 0, 0, ${0.1 + Math.random() * 0.4})`;
    ctx.fill();
    ctx.restore();
  }

  // ---- CHANGED: Dark ring details around the target
  const ringColors = ['#330000', '#4A0404', '#2e0101'];
  for (let i = 1; i <= 3; i++) {
    const ringRadius = target.radius * (1 - i * 0.25);

    // Add a subtle shadow
    ctx.beginPath();
    ctx.arc(2, 2, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw the ring
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = ringColors[i - 1];
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // ---- CHANGED: Center point (dark red)
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#660000';
  ctx.fill();

  ctx.restore();
}

let knifeImage: HTMLImageElement | null = null;

// Create and load the knife image
const loadKnifeImage = () => {
  return new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Enable CORS
    img.src = knifeImg;
    
    img.onload = () => {
      knifeImage = img;
      resolve();
    };
    
    img.onerror = () => {
      console.error('Failed to load knife image');
      // Fallback to drawing a simple knife
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
    // Draw the "bloody" knife image
    const scale = 0.15;
    const width = knifeImage.width * scale;
    const height = knifeImage.height * scale;
    
    ctx.drawImage(
      knifeImage,
      -width / 2,
      -height + 10,
      width,
      height
    );
  } else {
    // Fallback to a basic knife if the image fails
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(4, 0);
    ctx.lineTo(0, -40);
    ctx.closePath();
    ctx.fillStyle = '#a30000';
    ctx.fill();
    
    ctx.fillStyle = '#4A0404';
    ctx.fillRect(-5, 0, 10, 15);
  }

  ctx.restore();
}

// Decreased collision angle for tighter placement
export function checkCollision(newKnifeAngle: number, stuckKnives: Knife[]): boolean {
  const collisionAngle = Math.PI / 40; // 3.75 degrees
  return stuckKnives.some(knife => {
    const angleDiff = Math.abs(newKnifeAngle - (knife.stickPosition || 0)) % (Math.PI * 2);
    return angleDiff < collisionAngle || angleDiff > (Math.PI * 2 - collisionAngle);
  });
}
