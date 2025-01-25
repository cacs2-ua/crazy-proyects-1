export type PowerUpType = 'boost' | 'missile' | 'shield' | 'oil';

export class PowerUp {
  x: number;
  y: number;
  width: number;
  height: number;
  type: PowerUpType;
  active: boolean;

  constructor(x: number, y: number, type: PowerUpType) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
    this.type = type;
    this.active = true;
  }

  draw(ctx: CanvasRenderingContext2D, cameraY: number) {
    if (!this.active) return;

    const screenY = this.y - cameraY;
    
    // Draw box
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x - this.width/2, screenY - this.height/2, this.width, this.height);

    // Draw icon based on type
    ctx.fillStyle = this.getColor();
    ctx.beginPath();
    switch (this.type) {
      case 'boost':
        // Lightning bolt
        ctx.fillStyle = '#ffff00';
        ctx.moveTo(this.x - 5, screenY - 10);
        ctx.lineTo(this.x + 5, screenY - 10);
        ctx.lineTo(this.x, screenY);
        ctx.lineTo(this.x + 8, screenY);
        ctx.lineTo(this.x - 5, screenY + 10);
        ctx.lineTo(this.x, screenY);
        ctx.lineTo(this.x - 8, screenY);
        break;
      case 'missile':
        // Missile shape
        ctx.fillStyle = '#ff0000';
        ctx.moveTo(this.x, screenY - 10);
        ctx.lineTo(this.x - 5, screenY);
        ctx.lineTo(this.x - 5, screenY + 5);
        ctx.lineTo(this.x + 5, screenY + 5);
        ctx.lineTo(this.x + 5, screenY);
        break;
      case 'shield':
        // Shield circle
        ctx.fillStyle = '#00ffff';
        ctx.arc(this.x, screenY, 10, 0, Math.PI * 2);
        break;
      case 'oil':
        // Oil puddle
        ctx.fillStyle = '#4a4a4a';
        ctx.ellipse(this.x, screenY, 10, 8, 0, 0, Math.PI * 2);
        break;
    }
    ctx.fill();
  }

  getColor(): string {
    switch (this.type) {
      case 'boost': return '#ffff00';
      case 'missile': return '#ff0000';
      case 'shield': return '#00ffff';
      case 'oil': return '#4a4a4a';
    }
  }
}