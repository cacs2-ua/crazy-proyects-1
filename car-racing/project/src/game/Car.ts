/*************************************************************
 * FILE: game/Car.ts
 *
 * CHANGES MADE:
 * 1) Overhauled the `draw()` method to create a more appealing
 *    and "realistic" car design using canvas shapes.
 * 2) Enhanced the crashed state visuals with a distinct design.
 * 3) Updated the boundary collision logic to crash all cars
 *    (player and AI) when touching the left or right edges.
 * 4) Prevent clearing the `currentPowerUp` when a crash occurs,
 *    so the car retains it after recovering.
 * 5) Allows collisions with power-ups even during invincibility.
 * 6) Added "NEW VISUAL IMPROVEMENTS" for a more realistic look.
 * 7) **RE-IMPLEMENTED BACKWARD MOVEMENT**:
 *    - Modified the `brake()` method to allow negative speeds,
 *      enabling the car to move backward when the down arrow is pressed.
 * 8) **SLOWED ACCELERATION AND BRAKING RATES**:
 *    - Reduced the rate at which speed increases and decreases when
 *      pressing the up or down arrow keys for smoother control.
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
    this.maxSpeed = isPlayer ? 6 : 5;
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
   * Accelerates the car by increasing the speed.
   * **MODIFICATION:** Reduced acceleration rate from 0.2 to 0.1 for smoother speed increases.
   */
  accelerate() {
    if (!this.crashed) {
      this.speed += 0.1; // Reduced from 0.2
      if (this.speed > this.maxSpeed * (this.boostTime > 0 ? 1.5 : 1)) {
        this.speed = this.maxSpeed * (this.boostTime > 0 ? 1.5 : 1);
      }
    }
  }

  /**
   * Brakes the car by decreasing the speed.
   * **MODIFICATION:** Reduced braking rate from 0.2 to 0.1 for smoother speed decreases.
   * **ALSO:** Removed the line that prevented speed from going negative to allow reverse movement.
   */
  brake() {
    if (!this.crashed) {
      this.speed -= 0.1; // Reduced from 0.2
      // **REMOVED:** if (this.speed < 0) this.speed = 0;
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
      // Retain the current power-up after a crash; do not reset currentPowerUp.
      this.boostTime = 0;
    }
  }

  /**
   * Checks for collision with another object.
   * - Allows collision with PowerUps regardless of invincibility.
   * - Ignores collision with other objects if invulnerable, except PowerUps.
   */
  checkCollision(other: Car | Obstacle | PowerUp | Projectile): boolean {
    // Allow collision with PowerUp regardless of invincibility
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

      // Boundary collision logic for all cars
      if (this.x < this.width / 2) {
        this.x = this.width / 2;
        this.crash();
      }
      if (this.x > trackWidth - this.width / 2) {
        this.x = trackWidth - this.width / 2;
        this.crash();
      }

      this.y -= this.speed;
    }
  }

  /**
   * Draw the car with a realistic and appealing design.
   * - If crashed, calls drawCrashedCar instead.
   */
  draw(ctx: CanvasRenderingContext2D, cameraY: number) {
    const screenY = this.y - cameraY;

    ctx.save();
    ctx.translate(this.x, screenY);

    // Draw shield if active
    if (this.shieldActive) {
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.width, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (this.crashed) {
      this.drawCrashedCar(ctx);
    } else {
      this.drawNormalCar(ctx);
    }

    // Draw power-up text (if any)
    if (this.currentPowerUp) {
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(this.currentPowerUp, 0, -this.height / 2 - 10);
    }

    ctx.restore();
  }

  /**
   * Normal (not crashed) car design:
   *  - Gradient body with stripes.
   *  - Front and rear windshields + side mirrors.
   *  - Spoiler at the back.
   */
  private drawNormalCar(ctx: CanvasRenderingContext2D) {
    // Create a gradient fill for the car body
    const bodyGradient = ctx.createLinearGradient(-this.width / 2, 0, this.width / 2, 0);
    bodyGradient.addColorStop(0, this.color);
    bodyGradient.addColorStop(1, '#222'); // darker shade for a subtle gradient

    // Car body with a gradient
    ctx.fillStyle = bodyGradient;
    this.roundedRect(ctx, -this.width / 2, -this.height / 2, this.width, this.height, 8);

    // Add racing stripes: 2 narrow stripes down the center
    ctx.fillStyle = '#ffffff';
    const stripeWidth = 3;
    ctx.fillRect(-stripeWidth, -this.height / 2 + 2, stripeWidth, this.height - 4);
    ctx.fillRect(stripeWidth, -this.height / 2 + 2, stripeWidth, this.height - 4);

    // Side mirrors
    ctx.fillStyle = '#444';
    // Left mirror
    ctx.fillRect(-this.width / 2 - 5, -this.height / 4, 5, 3);
    // Right mirror
    ctx.fillRect(this.width / 2, -this.height / 4, 5, 3);

    // Spoiler at the back
    ctx.fillStyle = '#111';
    ctx.fillRect(-this.width / 4, this.height / 2 - 5, this.width / 2, 5);

    // Windshield + windows (front + back)
    ctx.fillStyle = '#333';
    // Front windshield
    ctx.fillRect(-this.width / 4, -this.height / 2 + 5, this.width / 2, this.height / 6);
    // Rear window
    ctx.fillRect(-this.width / 4, this.height / 6, this.width / 2, this.height / 6);

    // Wheels (with a slight offset to represent rims)
    ctx.save();
    ctx.fillStyle = '#000';
    // Front wheels
    this.drawWheelWithRim(ctx, -this.width / 2 + 5, -this.height / 4);
    this.drawWheelWithRim(ctx, this.width / 2 - 5, -this.height / 4);
    // Rear wheels
    this.drawWheelWithRim(ctx, -this.width / 2 + 5, this.height / 4);
    this.drawWheelWithRim(ctx, this.width / 2 - 5, this.height / 4);
    ctx.restore();

    // Headlights
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(-this.width / 3, -this.height / 2, 8, 4);
    ctx.fillRect(this.width / 3 - 8, -this.height / 2, 8, 4);

    // Boost effect
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
   * Crashed car design with more debris and shading.
   */
  private drawCrashedCar(ctx: CanvasRenderingContext2D) {
    // Tilt the car for a crashed effect
    ctx.rotate(Math.PI / 6);

    // Body polygon with a darker shade
    ctx.fillStyle = '#444';
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
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      const puffX = -this.width / 4 + i * (this.width / 8);
      const puffY = -this.height / 2 - 10 - i * 5;
      ctx.ellipse(puffX, puffY, 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Helper to draw a wheel with a "rim" effect.
   *  -- FIX: Added ctx.save() / ctx.restore() so each wheel
   *     properly resets the fillStyle to black after drawing the rim.
   */
  private drawWheelWithRim(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
    ctx.save();

    // Outer tire (black)
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(offsetX, offsetY, 6, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner rim (gray)
    ctx.fillStyle = '#777';
    ctx.beginPath();
    ctx.ellipse(offsetX, offsetY, 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Basic wheel drawing (unused here, but left for reference).
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
