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
 *
 * 7) **FIXED THE WHEELS BUG**: Now all four wheels are drawn
 *    with the correct black outer color & gray rim. We added
 *    `ctx.save()` / `ctx.restore()` inside `drawWheelWithRim()`
 *    to prevent the rim color (#777) from affecting subsequent
 *    wheels.
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
      if (this.speed < 0) this.speed = 0;
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
      // Retain currentPowerUp to avoid losing item on crash
      this.boostTime = 0;
    }
  }

  /**
   * Checks collision with other objects, ignoring invincibility for power-ups.
   */
  checkCollision(other: Car | Obstacle | PowerUp | Projectile): boolean {
    // Even if invulnerable, allow collision with PowerUp
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
            // Move horizontally away from obstacle
            this.targetX = obstacle.x < this.x
              ? Math.min(this.x + 100, trackWidth - margin)
              : Math.max(this.x - 100, margin);
          }
        }
      });

      if (!potentialCollision && Math.random() < 0.01) {
        this.targetX = margin + Math.random() * (trackWidth - 2 * margin);
      }

      // Move towards targetX
      if (this.x < this.targetX - 5) {
        this.lateralSpeed = 3;
      } else if (this.x > this.targetX + 5) {
        this.lateralSpeed = -3;
      } else {
        this.lateralSpeed = 0;
      }

      // Keep in track
      if (this.x < margin) this.targetX = margin;
      if (this.x > trackWidth - margin) this.targetX = trackWidth - margin;

      // Occasionally use power-up if we have one
      if (this.currentPowerUp && Math.random() < 0.1) {
        this.usePowerUp();
      }

      // Random speed boost
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

      // Edge collisions -> crash
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
   * Draw the car with a realistic design. If crashed, switch style.
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

    // Draw power-up text
    if (this.currentPowerUp) {
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(this.currentPowerUp, 0, -this.height / 2 - 10);
    }

    ctx.restore();
  }

  /**
   * Normal state design with gradient, stripes, mirrors, spoiler, etc.
   */
  private drawNormalCar(ctx: CanvasRenderingContext2D) {
    // Gradient body
    const bodyGradient = ctx.createLinearGradient(-this.width / 2, 0, this.width / 2, 0);
    bodyGradient.addColorStop(0, this.color);
    bodyGradient.addColorStop(1, '#222');

    // Body
    ctx.fillStyle = bodyGradient;
    this.roundedRect(ctx, -this.width / 2, -this.height / 2, this.width, this.height, 8);

    // Racing stripes
    ctx.fillStyle = '#ffffff';
    const stripeWidth = 3;
    ctx.fillRect(-stripeWidth, -this.height / 2 + 2, stripeWidth, this.height - 4);
    ctx.fillRect(stripeWidth, -this.height / 2 + 2, stripeWidth, this.height - 4);

    // Side mirrors
    ctx.fillStyle = '#444';
    // Left
    ctx.fillRect(-this.width / 2 - 5, -this.height / 4, 5, 3);
    // Right
    ctx.fillRect(this.width / 2, -this.height / 4, 5, 3);

    // Spoiler
    ctx.fillStyle = '#111';
    ctx.fillRect(-this.width / 4, this.height / 2 - 5, this.width / 2, 5);

    // Windows
    ctx.fillStyle = '#333';
    // Front windshield
    ctx.fillRect(-this.width / 4, -this.height / 2 + 5, this.width / 2, this.height / 6);
    // Rear window
    ctx.fillRect(-this.width / 4, this.height / 6, this.width / 2, this.height / 6);

    // Wheels
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
   * Crashed car design with extra debris and shading.
   */
  private drawCrashedCar(ctx: CanvasRenderingContext2D) {
    ctx.rotate(Math.PI / 6);

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

    // Debris lines
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-this.width / 2, -this.height / 2);
    ctx.lineTo(this.width / 2, this.height / 2);
    ctx.moveTo(this.width / 2, -this.height / 2);
    ctx.lineTo(-this.width / 2, this.height / 2);
    ctx.stroke();

    // Smoke puffs
    ctx.fillStyle = 'rgba(50, 50, 50, 0.6)';
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
   *  -- FIX: Add ctx.save() / ctx.restore() so each wheel
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
   * Basic wheel (unused).
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
