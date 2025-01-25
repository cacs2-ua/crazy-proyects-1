import { Obstacle } from './Obstacle';
import { PowerUp } from './PowerUp';
import { Projectile } from './Projectile';

export class Car {
  x: number;
  y: number;
  speed: number;
  lateralSpeed: number;
  width: number;
  height: number;
  color: string;
  isPlayer: boolean;
  targetX: number;
  crashed: boolean;
  recoveryTime: number;
  maxSpeed: number;
  maxReverseSpeed: number;
  currentPowerUp: string | null;
  shieldActive: boolean;
  boostTime: number;
  invulnerableTime: number;

  constructor(x: number, y: number, isPlayer: boolean = false, color: string = '#ff0000') {
    this.x = x;
    this.y = y;
    this.maxSpeed = isPlayer ? 8 : 5;
    this.maxReverseSpeed = isPlayer ? 3 : 5;
    this.speed = isPlayer ? 0 : 3 + Math.random() * 3;
    this.lateralSpeed = 0;
    this.width = 40;
    this.height = 60;
    this.color = color;
    this.isPlayer = isPlayer;
    this.targetX = x;
    this.crashed = false;
    this.recoveryTime = 0;
    this.currentPowerUp = null;
    this.shieldActive = false;
    this.boostTime = 0;
    this.invulnerableTime = 0;
  }

  /**
   * Accelerates the car by increasing speed at a slow rate for smoother control.
   */
  accelerate() {
    if (!this.crashed) {
      this.speed += 0.025; // Slower acceleration
      if (this.speed > this.maxSpeed * (this.boostTime > 0 ? 1.5 : 1)) {
        this.speed = this.maxSpeed * (this.boostTime > 0 ? 1.5 : 1);
      }
    }
  }

  /**
   * Brakes the car by decreasing speed at a slow rate, allowing negative speed.
   */
  brake() {
    if (!this.crashed) {
      this.speed -= 0.025; // Slower braking
      if (this.speed < -this.maxReverseSpeed) {
        this.speed = -this.maxReverseSpeed;
      }
    }
  }

  moveLeft() {
    if (!this.crashed) {
      this.lateralSpeed = -4;
    }
  }

  moveRight() {
    if (!this.crashed) {
      this.lateralSpeed = 4;
    }
  }

  stopLateralMovement() {
    if (!this.crashed) {
      this.lateralSpeed = 0;
    }
  }

  crash() {
    if (!this.crashed && !this.shieldActive && this.invulnerableTime <= 0) {
      this.crashed = true;
      this.recoveryTime = 2000; // 2 seconds
      this.speed = 0;
      // Retain current power-up
      this.boostTime = 0;
    }
  }

  /**
   * Checks collision with another object, ignoring invincibility for PowerUps.
   */
  checkCollision(other: Car | Obstacle | PowerUp | Projectile): boolean {
    // Still allow collision with PowerUp if invulnerable
    if (!(other instanceof PowerUp) && this.invulnerableTime > 0) {
      return false;
    }

    return (
      this.x - this.width / 2 < other.x + other.width / 2 &&
      this.x + this.width / 2 > other.x - other.width / 2 &&
      this.y - this.height / 2 < other.y + other.height / 2 &&
      this.y + this.height / 2 > other.y - other.height / 2
    );
  }

  /**
   * Uses the currently held power-up and returns a projectile if applicable.
   */
  usePowerUp(): Projectile | null {
    if (!this.currentPowerUp) return null;

    let projectile = null;
    switch (this.currentPowerUp) {
      case 'boost':
        this.boostTime = 3000; // 3 seconds
        break;
      case 'missile':
        projectile = new Projectile(this.x, this.y - this.height, 'missile', this);
        break;
      case 'shield':
        this.shieldActive = true;
        this.invulnerableTime = 5000; // 5 seconds
        break;
      case 'oil':
        projectile = new Projectile(this.x, this.y + this.height, 'oil', this);
        break;
    }
    this.currentPowerUp = null;
    return projectile;
  }

  /**
   * AI logic for non-player cars.
   */
  updateAI(trackWidth: number, playerY: number, obstacles: (Car | Obstacle | PowerUp | Projectile)[]) {
    if (!this.isPlayer && !this.crashed) {
      const margin = 100;
      const lookAheadDistance = 200;
      let potentialCollision = false;

      obstacles.forEach(obstacle => {
        if (obstacle !== this) {
          const futureY = this.y - lookAheadDistance;
          if (
            Math.abs(obstacle.y - futureY) < 100 &&
            Math.abs(obstacle.x - this.x) < 80
          ) {
            potentialCollision = true;
            // Attempt to avoid the obstacle horizontally
            this.targetX = obstacle.x < this.x
              ? Math.min(this.x + 100, trackWidth - margin)
              : Math.max(this.x - 100, margin);
          }
        }
      });

      if (!potentialCollision && Math.random() < 0.01) {
        this.targetX = margin + Math.random() * (trackWidth - 2 * margin);
      }

      // Steer toward targetX
      if (this.x < this.targetX - 5) {
        this.lateralSpeed = 3;
      } else if (this.x > this.targetX + 5) {
        this.lateralSpeed = -3;
      } else {
        this.lateralSpeed = 0;
      }

      // Enforce margins
      if (this.x < margin) this.targetX = margin;
      if (this.x > trackWidth - margin) this.targetX = trackWidth - margin;

      // Randomly use power-up
      if (this.currentPowerUp && Math.random() < 0.1) {
        this.usePowerUp();
      }

      // Random small speed boost
      if (Math.random() < 0.05) {
        this.speed = Math.min(this.maxSpeed * (this.boostTime > 0 ? 1.5 : 1), this.speed + 0.5);
      }
    }
  }

  /**
   * Updates car state and handles crashing if needed.
   */
  update(deltaTime: number, trackWidth: number) {
    // Recovery from crash
    if (this.crashed) {
      this.recoveryTime -= deltaTime;
      if (this.recoveryTime <= 0) {
        this.crashed = false;
        this.speed = this.isPlayer ? 0 : 2;
        // Brief invulnerability
        this.invulnerableTime = 750;
      }
    }

    // Decrement boost timer
    if (this.boostTime > 0) {
      this.boostTime -= deltaTime;
    }

    // Shield (invulnerability) timer
    if (this.invulnerableTime > 0) {
      this.invulnerableTime -= deltaTime;
      if (this.invulnerableTime <= 0) {
        this.shieldActive = false;
      }
    }

    // Move if not crashed
    if (!this.crashed) {
      this.x += this.lateralSpeed;

      // **UPDATED COLLISION LOGIC WITH RED BORDERS**
      // Crash if touching the left red border (20px wide)
      if (this.x - this.width / 2 <= 20) {
        this.x = 20 + this.width / 2;
        this.crash();
      }
      // Crash if touching the right red border (20px wide)
      if (this.x + this.width / 2 >= trackWidth - 20) {
        this.x = trackWidth - 20 - this.width / 2;
        this.crash();
      }

      // Update vertical position (negative speed means reverse)
      this.y -= this.speed;
    }
  }

  /**
   * Applies friction to gradually decelerate the car towards zero speed.
   * This method should be called when neither accelerating nor braking.
   */
  applyFriction() {
    const friction = 0.02; // Adjust this value for smoother or faster deceleration
    if (this.speed > 0) {
      this.speed -= friction;
      if (this.speed < 0) this.speed = 0;
    } else if (this.speed < 0) {
      this.speed += friction;
      if (this.speed > 0) this.speed = 0;
    }
  }

  /**
   * Primary draw method: decides between normal or crashed visuals.
   */
  draw(ctx: CanvasRenderingContext2D, cameraY: number) {
    const screenY = this.y - cameraY;

    ctx.save();
    ctx.translate(this.x, screenY);

    // Draw shield glow if active
    if (this.shieldActive) {
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 3]);
      // **MODIFIED:** Increased shield radius to cover the entire car
      ctx.beginPath();
      ctx.arc(0, 0, this.width * 1.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (this.crashed) {
      this.drawCrashedCar(ctx);
    } else {
      this.drawNormalCar(ctx);
    }

    // Show current power-up text if present
    if (this.currentPowerUp) {
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(this.currentPowerUp, 0, -this.height / 2 - 12);
    }

    ctx.restore();
  }

  /**
   * Enhanced normal car visuals:
   *  - Multi-layer gradient
   *  - Glossy highlight (reflection)
   *  - Chrome edges
   *  - Racing stripes (2 stripes down center)
   *  - Enhanced spoiler
   *  - **Blue windows instead of gray**
   */
  private drawNormalCar(ctx: CanvasRenderingContext2D) {
    // Multi-layer gradient for the car body
    const mainGradient = ctx.createLinearGradient(-this.width / 2, 0, this.width / 2, 0);
    mainGradient.addColorStop(0, this.color);
    mainGradient.addColorStop(0.5, '#444');
    mainGradient.addColorStop(1, '#000');

    ctx.fillStyle = mainGradient;
    this.roundedRect(ctx, -this.width / 2, -this.height / 2, this.width, this.height, 10);

    // Chrome edge at the bottom
    ctx.save();
    ctx.fillStyle = '#cfcfcf';
    ctx.fillRect(-this.width / 2, this.height / 2 - 4, this.width, 4);
    ctx.restore();

    // Draw reflection highlight on top (thin gradient arc)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, -this.height / 4, this.width / 2, 8, 0, 0, Math.PI * 2);
    const reflectGradient = ctx.createRadialGradient(0, -this.height / 4, 1, 0, -this.height / 4, this.width / 2);
    reflectGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    reflectGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = reflectGradient;
    ctx.fill();
    ctx.restore();

    // Dual racing stripes
    ctx.fillStyle = '#fff';
    const stripeWidth = 3;
    ctx.fillRect(-stripeWidth, -this.height / 2 + 3, stripeWidth, this.height - 6);
    ctx.fillRect(stripeWidth, -this.height / 2 + 3, stripeWidth, this.height - 6);

    // Side mirrors (angled)
    ctx.save();
    ctx.fillStyle = '#666';
    // Left
    ctx.translate(-this.width / 2 - 6, -this.height / 4);
    ctx.rotate(-Math.PI / 10);
    ctx.fillRect(0, 0, 8, 3);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#666';
    // Right
    ctx.translate(this.width / 2 + 1, -this.height / 4);
    ctx.rotate(Math.PI / 10);
    ctx.fillRect(0, 0, 8, 3);
    ctx.restore();

    // Spoiler (extended)
    ctx.save();
    ctx.fillStyle = '#222';
    ctx.fillRect(-this.width / 4 - 3, this.height / 2 - 8, this.width / 2 + 6, 4);
    // Spoiler top
    ctx.fillRect(-this.width / 4 - 1, this.height / 2 - 12, this.width / 2 + 2, 4);
    ctx.restore();

    // **CHANGED WINDOW COLORS FROM GRAY TO BLUE**
    ctx.fillStyle = '#4169E1'; // RoyalBlue for windows
    // Front window
    ctx.fillRect(-this.width / 4, -this.height / 2 + 6, this.width / 2, this.height / 6);
    // Rear window
    ctx.fillRect(-this.width / 4, this.height / 6, this.width / 2, this.height / 6);

    // Draw wheels with rims
    ctx.save();
    ctx.fillStyle = '#000';
    this.drawWheelWithRim(ctx, -this.width / 2 + 6, -this.height / 4);
    this.drawWheelWithRim(ctx, this.width / 2 - 6, -this.height / 4);
    this.drawWheelWithRim(ctx, -this.width / 2 + 6, this.height / 4);
    this.drawWheelWithRim(ctx, this.width / 2 - 6, this.height / 4);
    ctx.restore();

    // Headlights (enhanced glow)
    ctx.save();
    ctx.fillStyle = '#fffd82';
    ctx.beginPath();
    ctx.ellipse(-this.width / 3 + 2, -this.height / 2 + 1, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(this.width / 3 - 2, -this.height / 2 + 1, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Boost flame effect if active
    if (this.boostTime > 0) {
      ctx.save();
      ctx.fillStyle = '#ff5500';
      ctx.beginPath();
      ctx.moveTo(-this.width / 5, this.height / 2);
      ctx.lineTo(this.width / 5, this.height / 2);
      ctx.lineTo(0, this.height / 2 + 20);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * More impressive crashed design with additional debris, sparks, and shading.
   */
  private drawCrashedCar(ctx: CanvasRenderingContext2D) {
    // Tilt the car further for a dramatic crash effect
    ctx.rotate(Math.PI / 5);

    // Main body in a dark, twisted shape
    ctx.fillStyle = '#282828';
    ctx.beginPath();
    ctx.moveTo(-this.width / 2, -this.height / 2);
    ctx.lineTo(0, -this.height / 3);
    ctx.lineTo(this.width / 2, -this.height / 2 + 12);
    ctx.lineTo(this.width / 2, this.height / 2 - 12);
    ctx.lineTo(0, this.height / 3);
    ctx.lineTo(-this.width / 2, this.height / 2);
    ctx.closePath();
    ctx.fill();

    // Outer cracks / stripes
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-this.width / 2, -this.height / 2);
    ctx.lineTo(this.width / 2, this.height / 2);
    ctx.moveTo(this.width / 2, -this.height / 2);
    ctx.lineTo(-this.width / 2, this.height / 2);
    ctx.stroke();

    // Additional cracks in the center
    ctx.strokeStyle = '#ff5500';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-this.width / 4, -this.height / 2 + 10);
    ctx.lineTo(-this.width / 8, this.height / 4);
    ctx.moveTo(this.width / 4, -this.height / 2 + 10);
    ctx.lineTo(this.width / 8, this.height / 4);
    ctx.stroke();

    // Shards of "glass" effect near top
    ctx.save();
    ctx.fillStyle = 'rgba(180, 240, 255, 0.4)';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-this.width / 8 + i * 6, -this.height / 2 - 5 - i * 3);
      ctx.lineTo(-this.width / 10 + i * 6, -this.height / 2 + 0 - i * 3);
      ctx.lineTo(-this.width / 14 + i * 6, -this.height / 2 + 5 - i * 3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Sparks or small flame near bottom
    ctx.save();
    ctx.fillStyle = '#ff9900';
    for (let i = 0; i < 4; i++) {
      const sparkX = -this.width / 6 + i * (this.width / 12);
      const sparkY = this.height / 2 - 8 + Math.random() * 4;
      ctx.beginPath();
      ctx.ellipse(sparkX, sparkY, 2, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Smoke puffs
    ctx.fillStyle = 'rgba(70, 70, 70, 0.6)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const puffX = -this.width / 4 + i * (this.width / 8);
      const puffY = -this.height / 2 - 10 - i * 5;
      ctx.ellipse(puffX, puffY, 9, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Helper to draw a wheel with a "rim" effect, ensuring correct fill styles.
   */
  private drawWheelWithRim(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
    ctx.save();
    // Outer tire
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(offsetX, offsetY, 6, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rim
    ctx.fillStyle = '#aaa';
    ctx.beginPath();
    ctx.ellipse(offsetX, offsetY, 2.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Basic wheel drawing (unused).
   */
  private drawWheel(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
    ctx.beginPath();
    ctx.ellipse(offsetX, offsetY, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Helper to draw a rounded rectangle for the car body.
   */
  private roundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }
}
