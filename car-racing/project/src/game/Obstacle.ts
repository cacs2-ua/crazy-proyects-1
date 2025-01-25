export class Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'rock' | 'oil';

  constructor(x: number, y: number, type: 'rock' | 'oil') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = type === 'rock' ? 40 : 60;
    this.height = type === 'rock' ? 40 : 30;
  }

  draw(ctx: CanvasRenderingContext2D, cameraY: number) {
    const screenY = this.y - cameraY;

    if (this.type === 'rock') {
      // Draw rock
      ctx.fillStyle = '#666';
      ctx.beginPath();
      ctx.moveTo(this.x - this.width/2, screenY + this.height/2);
      ctx.lineTo(this.x, screenY - this.height/2);
      ctx.lineTo(this.x + this.width/2, screenY + this.height/2);
      ctx.closePath();
      ctx.fill();
      
      // Add details
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      // Draw oil slick
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(this.x, screenY, this.width/2, this.height/2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}