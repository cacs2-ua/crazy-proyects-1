/*************************************************************
 * FILE: game/Car.ts
 * 
 * CHANGES MADE:
 * 1) Added `maxReverseSpeed` property to limit reverse speed.
 * 2) Modified the `brake()` method to allow speed to decrease below zero.
 * 3) Updated the `update()` method to handle reverse movement.
 *************************************************************/

import { Obstacle } from './Obstacle';        // Ensure these imports are present
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
  maxReverseSpeed: number;                   // NEW: Maximum reverse speed
  currentPowerUp: string | null;
  shieldActive: boolean;
  boostTime: number;
  invulnerableTime: number;

  constructor(x: number, y: number, isPlayer: boolean = false, color: string = '#ff0000') {
    this.x = x;
    this.y = y;
    this.maxSpeed = isPlayer ? 8 : 9;
    this.maxReverseSpeed = isPlayer ? 3 : 5; // NEW: Set max reverse speed based on player or AI
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
      this.speed -= 0.2; // Decrease speed

      // NEW: Allow speed to go below zero up to maxReverseSpeed
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
    // Only crash if NOT already crashed, NO active shield, and NOT invulnerable.
    if (!this.crashed && !this.shieldActive && this.invulnerableTime <= 0) {
      this.crashed = true;
      this.recoveryTime = 2000; // 2 seconds
      this.speed = 0;
      this.currentPowerUp = null;
      this.boostTime = 0;
    }
  }

  checkCollision(other: Car | Obstacle | PowerUp | Projectile): boolean {
    // If invulnerable, skip collisions
    if (this.invulnerableTime > 0) return false;
    
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
    
    // Clear the power-up once used
    this.currentPowerUp = null;
    return projectile;
  }

  updateAI(trackWidth: number, playerY: number, obstacles: (Car | Obstacle | PowerUp | Projectile)[]) {
    if (!this.isPlayer && !this.crashed) {
      const margin = 100;
      const lookAheadDistance = 200;
      
      // Check possible collision ahead
      let potentialCollision = false;
      obstacles.forEach(obstacle => {
        if (obstacle !== this) {
          const futureY = this.y - lookAheadDistance;
          if (
            Math.abs(obstacle.y - futureY) < 100 &&
            Math.abs(obstacle.x - this.x) < 80
          ) {
            potentialCollision = true;
            // Choose a new targetX to avoid
            this.targetX = obstacle.x < this.x
              ? Math.min(this.x + 100, trackWidth - margin)
              : Math.max(this.x - 100, margin);
          }
        }
      });

      // Occasionally change lanes if no immediate danger
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

      // Keep car in track bounds
      if (this.x < margin) this.targetX = margin;
      if (this.x > trackWidth - margin) this.targetX = trackWidth - margin;

      // Use power-ups automatically
      if (this.currentPowerUp && Math.random() < 0.1) {
        this.usePowerUp();
      }

      // Randomly boost speed
      if (Math.random() < 0.05) {
        this.speed = Math.min(this.maxSpeed * (this.boostTime > 0 ? 1.5 : 1), this.speed + 0.5);
      }
    }
  }

  update(deltaTime: number, trackWidth: number) {
    // Update crash recovery
    if (this.crashed) {
      this.recoveryTime -= deltaTime;
      if (this.recoveryTime <= 0) {
        this.crashed = false;
        this.speed = this.isPlayer ? 0 : 2;
        // Temporary invulnerability after recovery
        this.invulnerableTime = 500; // 0.5 seconds
      }
    }

    // Update boost
    if (this.boostTime > 0) {
      this.boostTime -= deltaTime;
    }

    // Update shield/invulnerability
    if (this.invulnerableTime > 0) {
      this.invulnerableTime -= deltaTime;
      if (this.invulnerableTime <= 0) {
        this.shieldActive = false;
      }
    }

    // If not crashed, move the car
    if (!this.crashed) {
      // Horizontal movement
      this.x += this.lateralSpeed;
      // Keep car within bounds
      if (this.x < this.width / 2) {
        this.x = this.width / 2;
        if (!this.isPlayer) this.crash();
      }
      if (this.x > trackWidth - this.width / 2) {
        this.x = trackWidth - this.width / 2;
        if (!this.isPlayer) this.crash();
      }

      // Vertical movement
      this.y -= this.speed; // If speed is negative, y increases (reverse movement)
    }
  }

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
      // Tilt the car to show it crashed
      ctx.rotate(Math.PI / 8);
      ctx.fillStyle = '#666';
    } else {
      ctx.fillStyle = this.color;
    }

    // Car body
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    if (!this.crashed) {
      // Windshield
      ctx.fillStyle = '#333';
      ctx.fillRect(-this.width / 4, -this.height / 4, this.width / 2, this.height / 3);
      
      // Headlights
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(-this.width / 3, -this.height / 2, 10, 5);
      ctx.fillRect(this.width / 3 - 10, -this.height / 2, 10, 5);

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
    } else {
      // Crash lines
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-this.width / 2, -this.height / 2);
      ctx.lineTo(this.width / 2, this.height / 2);
      ctx.moveTo(this.width / 2, -this.height / 2);
      ctx.lineTo(-this.width / 2, this.height / 2);
      ctx.stroke();
    }

    // Power-up text (if any)
    if (this.currentPowerUp) {
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(this.currentPowerUp, 0, -this.height / 2 - 10);
    }

    ctx.restore();
  }
}
