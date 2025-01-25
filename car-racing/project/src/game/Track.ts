export class Track {
  width: number;
  height: number;
  finishLine: number;
  roadMarkings: number[];
  
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.finishLine = -10000; // Finish line position (10000 pixels up)
    this.roadMarkings = [];
    
    // Create initial road markings
    for (let y = 0; y < height + 200; y += 100) {
      this.roadMarkings.push(y);
    }
  }

  update(cameraY: number) {
    // Remove markings that are too far behind
    this.roadMarkings = this.roadMarkings.filter(y => y - cameraY > -200);
    
    // Add new markings ahead
    while (this.roadMarkings[this.roadMarkings.length - 1] - cameraY < this.height + 200) {
      this.roadMarkings.push(this.roadMarkings[this.roadMarkings.length - 1] + 100);
    }
  }

  draw(ctx: CanvasRenderingContext2D, cameraY: number) {
    // Draw road
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw side barriers
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 20, this.height);
    ctx.fillRect(this.width - 20, 0, 20, this.height);
    
    // Draw road markings
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    
    this.roadMarkings.forEach(y => {
      const screenY = y - cameraY;
      ctx.beginPath();
      ctx.setLineDash([30, 40]);
      ctx.moveTo(this.width / 3, screenY);
      ctx.lineTo(this.width / 3, screenY + 60);
      ctx.moveTo(2 * this.width / 3, screenY);
      ctx.lineTo(2 * this.width / 3, screenY + 60);
      ctx.stroke();
    });

    // Draw finish line when it's in view
    const finishScreenY = this.finishLine - cameraY;
    if (finishScreenY >= -50 && finishScreenY <= this.height) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, finishScreenY, this.width, 50);
      ctx.fillStyle = '#000';
      const squares = 20;
      const squareWidth = this.width / squares;
      for (let i = 0; i < squares; i++) {
        if (i % 2 === 0) {
          ctx.fillRect(i * squareWidth, finishScreenY, squareWidth, 50);
        }
      }
    }
  }

  isFinished(y: number): boolean {
    return y <= this.finishLine;
  }
}