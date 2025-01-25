/*************************************************************
 * FILE: game/Car.ts
 *
 * CHANGES MADE:
 * 1) Overhauled the `draw()` method to create a more appealing
 *    and "realistic" car design using canvas shapes.
 * 2) Enhanced the crashed state visuals with a distinct design.
 * 3) Updated the boundary collision logic to crash all cars
 *    (player and AI) when touching the left or right edges.
 * 4) **MODIFICATIONS ADDED:**
 *    - Prevent clearing the `currentPowerUp` when a crash occurs
 *      to ensure the car retains its power-up after recovering.
 *    - Adjusted the `checkCollision` method to allow collisions
 *      with power-ups regardless of the invincibility state.
 *************************************************************/

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
    this.maxSpeed = isPlayer ? 6 : 5;        // Adjusted maxSpeed for better balance
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

  accelerate() {
    if (!this.crashed) {
      this.speed += 0.2;
      if (this.speed > this.maxSpeed * (this.boostTime > 0 ? 1.5 : 1)) {
        this.speed = this.maxSpeed * (this.boostTime > 0 ? 1.5 : 1);
      }
    }
  }

  brake() {
    if (!this.crashed) {
      this.speed -= 0.2;
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
      // **MODIFICATION:** Removed the following line to retain the current power-up after a crash
      // this.currentPowerUp = null;
      this.boostTime = 0;
    }
  }

  /**
   * Checks for collision with another object.
   * - Allows collision with PowerUps regardless of invincibility.
   * - Ignores collision with other objects if invulnerable, except PowerUps.
   */
  checkCollision(other: Car | Obstacle | PowerUp | Projectile): boolean {
    // **MODIFICATION ADDED:**
    // Allow collision with PowerUp regardless of invincibility
    if (!(other instanceof PowerUp) && this.invulnerableTime > 0) return false;

    return (
      this.x - this.width / 2 < other.x + other.width / 2 &&
      this.x + this.width / 2 > other.x - other.width / 2 &&
      this.y - this.height / 2 < other.y + other.height / 2 &&
      this.y + this.height / 2 > other.y - other.height / 2
    );
  }

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
            this.targetX = obstacle.x < this.x
              ? Math.min(this.x + 100, trackWidth - margin)
              : Math.max(this.x - 100, margin);
          }
        }
      });

      if (!potentialCollision && Math.random() < 0.01) {
        this.targetX = margin + Math.random() * (trackWidth - 2 * margin);
      }

      if (this.x < this.targetX - 5) {
        this.lateralSpeed = 3;
      } else if (this.x > this.targetX + 5) {
        this.lateralSpeed = -3;
      } else {
        this.lateralSpeed = 0;
      }

      if (this.x < margin) this.targetX = margin;
      if (this.x > trackWidth - margin) this.targetX = trackWidth - margin;

      if (this.currentPowerUp && Math.random() < 0.1) {
        this.usePowerUp();
      }

      if (Math.random() < 0.05) {
        this.speed = Math.min(this.maxSpeed * (this.boostTime > 0 ? 1.5 : 1), this.speed + 0.5);
      }
    }
  }

  update(deltaTime: number, trackWidth: number) {
    if (this.crashed) {
      this.recoveryTime -= deltaTime;
      if (this.recoveryTime <= 0) {
        this.crashed = false;
        this.speed = this.isPlayer ? 0 : 2;
        this.invulnerableTime = 500; // 0.5 seconds
      }
    }

    if (this.boostTime > 0) {
      this.boostTime -= deltaTime;
    }

    if (this.invulnerableTime > 0) {
      this.invulnerableTime -= deltaTime;
      if (this.invulnerableTime <= 0) {
        this.shieldActive = false;
      }
    }

    if (!this.crashed) {
      this.x += this.lateralSpeed;

      // **Boundary Collision Logic**
      // Crash the car if it touches the left or right edge
      if (this.x < this.width / 2) {
        this.x = this.width / 2;
        this.crash(); // Crash regardless of player or AI
      }
      if (this.x > trackWidth - this.width / 2) {
        this.x = trackWidth - this.width / 2;
        this.crash(); // Crash regardless of player or AI
      }

      this.y -= this.speed;
    }
  }

  /**
   * Draws the car in a more visually appealing manner.
   * - If crashed, a different style is used.
   */
  draw(ctx: CanvasRenderingContext2D, cameraY: number) {
    const screenY = this.y - cameraY;

    ctx.save();
    ctx.translate(this.x, screenY);

    // Draw shield if active (glowing circle)
    if (this.shieldActive) {
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.width, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Decide design based on crashed state
    if (this.crashed) {
      this.drawCrashedCar(ctx);
    } else {
      this.drawNormalCar(ctx);
    }

    // Draw power-up text (if any) above the car
    if (this.currentPowerUp) {
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(this.currentPowerUp, 0, -this.height / 2 - 10);
    }

    ctx.restore();
  }

  /**
   * Draws the car in its normal (not crashed) state.
   */
  private drawNormalCar(ctx: CanvasRenderingContext2D) {
    // Car body: Rounded rectangle for a more "car-like" appearance
    ctx.fillStyle = this.color;
    this.roundedRect(ctx, -this.width / 2, -this.height / 2, this.width, this.height, 8);

    // Windshield & windows
    ctx.fillStyle = '#222'; // Dark glass
    // Rectangle in the upper center of the car (windshield + roof)
    ctx.fillRect(-this.width / 4, -this.height / 2 + 5, this.width / 2, this.height / 4);

    // Wheels: Two ellipses at the corners
    ctx.fillStyle = '#000';
    // Front wheels
    this.drawWheel(ctx, -this.width / 2 + 5, -this.height / 4);
    this.drawWheel(ctx, this.width / 2 - 5, -this.height / 4);
    // Rear wheels
    this.drawWheel(ctx, -this.width / 2 + 5, this.height / 4);
    this.drawWheel(ctx, this.width / 2 - 5, this.height / 4);

    // Headlights (optional, at the front)
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(-this.width / 3, -this.height / 2, 8, 4);
    ctx.fillRect(this.width / 3 - 8, -this.height / 2, 8, 4);

    // Boost effect if applicable
    if (this.boostTime > 0) {
      ctx.fillStyle = '#ff7700';
      ctx.beginPath();
      ctx.moveTo(-this.width / 4, this.height / 2);
      ctx.lineTo(this.width / 4, this.height / 2);
      ctx.lineTo(0, this.height / 2 + 20);
      ctx.closePath();
      ctx.fill();
    }
  }

  /**
   * Draws the car in a crashed state with a twisted shape
   * and some "smoke" effect for a more dramatic appearance.
   */
  private drawCrashedCar(ctx: CanvasRenderingContext2D) {
    // Tilt the car for a crashed effect
    ctx.rotate(Math.PI / 6);

    // Main body as a "damaged" polygon
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.moveTo(-this.width / 2, -this.height / 2);
    ctx.lineTo(0, -this.height / 4);
    ctx.lineTo(this.width / 2, -this.height / 2 + 10);
    ctx.lineTo(this.width / 2, this.height / 2 - 10);
    ctx.lineTo(0, this.height / 4);
    ctx.lineTo(-this.width / 2, this.height / 2);
    ctx.closePath();
    ctx.fill();

    // Add crash lines or cracks
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // A big 'X' across the body
    ctx.moveTo(-this.width / 2, -this.height / 2);
    ctx.lineTo(this.width / 2, this.height / 2);
    ctx.moveTo(this.width / 2, -this.height / 2);
    ctx.lineTo(-this.width / 2, this.height / 2);
    ctx.stroke();

    // Smoke puffs
    ctx.fillStyle = 'rgba(50, 50, 50, 0.6)';
    // Draw a few circles near the top for smoke
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      const puffX = -this.width / 4 + i * (this.width / 6);
      const puffY = -this.height / 2 - 10 - i * 5;
      ctx.ellipse(puffX, puffY, 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Helper method to draw a wheel at the given (x, y) offset.
   */
  private drawWheel(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
    ctx.beginPath();
    ctx.ellipse(offsetX, offsetY, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Helper method to draw a rounded rectangle.
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
