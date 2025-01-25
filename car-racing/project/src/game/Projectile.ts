export class Projectile {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: 'missile' | 'oil';
  active: boolean;
  owner: any; // Reference to the car that fired it

  constructor(x: number, y: number, type: 'missile' | 'oil', owner: any) {
    this.x = x;
    this.y = y;
    this.width = type === 'missile' ? 20 : 40;
    this.height = type === 'missile' ? 30 : 20;
    this.speed = type === 'missile' ? 15 : 0;
    this.type = type;
    this.active = true;
    this.owner = owner;
  }

  update() {
    if (this.type === 'missile') {
      this.y -= this.speed;
    }
  }

  draw(ctx: CanvasRenderingContext2D, cameraY: number) {
    if (!this.active) return;

    const screenY = this.y - cameraY;

    if (this.type === 'missile') {
      // Draw missile
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.moveTo(this.x, screenY - this.height/2);
      ctx.lineTo(this.x - this.width/2, screenY + this.height/2);
      ctx.lineTo(this.x + this.width/2, screenY + this.height/2);
      ctx.closePath();
      ctx.fill();

      // Draw flame
      ctx.fillStyle = '#ff7700';
      ctx.beginPath();
      ctx.moveTo(this.x - this.width/4, screenY + this.height/2);
      ctx.lineTo(this.x + this.width/4, screenY + this.height/2);
      ctx.lineTo(this.x, screenY + this.height/2 + 10);
      ctx.closePath();
      ctx.fill();
    } else {
      // Draw oil slick
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(this.x, screenY, this.width/2, this.height/2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}