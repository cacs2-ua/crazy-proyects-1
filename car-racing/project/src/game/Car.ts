import { Obstacle } from './Obstacle';        // NEW: Import Obstacle
import { PowerUp } from './PowerUp';          // NEW: Import PowerUp
import { Projectile } from './Projectile';    // NEW: Import Projectile


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
  currentPowerUp: string | null;
  shieldActive: boolean;
  boostTime: number;
  invulnerableTime: number;

  constructor(x: number, y: number, isPlayer: boolean = false, color: string = '#ff0000') {
    this.x = x;
    this.y = y;
    this.maxSpeed = isPlayer ? 8 : 10;
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
    // Solo choca si NO está ya chocado, NO tiene escudo y NO está en tiempo invulnerable.
    if (!this.crashed && !this.shieldActive && this.invulnerableTime <= 0) {
      this.crashed = true;
      this.recoveryTime = 2000; // 2 segundos de recuperación
      this.speed = 0;
      this.currentPowerUp = null;
      this.boostTime = 0;
    }
  }

  checkCollision(other: Car | Obstacle | PowerUp | Projectile): boolean {
    // Si está en tiempo invulnerable, no colisiona.
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
        this.boostTime = 3000; // 3 segundos de boost
        break;
      case 'missile':
        projectile = new Projectile(this.x, this.y - this.height, 'missile', this);
        break;
      case 'shield':
        this.shieldActive = true;
        this.invulnerableTime = 5000; // 5 segundos de shield
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
      
      // Comprobar posible colisión cercana
      let potentialCollision = false;
      obstacles.forEach(obstacle => {
        if (obstacle !== this) {
          const futureY = this.y - lookAheadDistance;
          if (
            Math.abs(obstacle.y - futureY) < 100 &&
            Math.abs(obstacle.x - this.x) < 80
          ) {
            potentialCollision = true;
            // Elegir nuevo target para esquivar
            this.targetX = obstacle.x < this.x
              ? Math.min(this.x + 100, trackWidth - margin)
              : Math.max(this.x - 100, margin);
          }
        }
      });

      // Si no hay peligro inmediato, ocasionalmente cambiar de carril
      if (!potentialCollision && Math.random() < 0.01) {
        this.targetX = margin + Math.random() * (trackWidth - 2 * margin);
      }

      // Moverse hacia target
      if (this.x < this.targetX - 5) {
        this.lateralSpeed = 3;
      } else if (this.x > this.targetX + 5) {
        this.lateralSpeed = -3;
      } else {
        this.lateralSpeed = 0;
      }

      // Mantenerse dentro de los márgenes de la pista
      if (this.x < margin) this.targetX = margin;
      if (this.x > trackWidth - margin) this.targetX = trackWidth - margin;

      // Usar power-ups automáticamente
      if (this.currentPowerUp && Math.random() < 0.1) {
        this.usePowerUp();
      }

      // Aumentar velocidad aleatoriamente
      if (Math.random() < 0.05) {
        this.speed = Math.min(this.maxSpeed * (this.boostTime > 0 ? 1.5 : 1), this.speed + 0.5);
      }
    }
  }

  update(deltaTime: number, trackWidth: number) {
    // Actualizar tiempos
    if (this.crashed) {
      this.recoveryTime -= deltaTime;
      if (this.recoveryTime <= 0) {
        this.crashed = false;
        this.speed = this.isPlayer ? 0 : 2;
        // NUEVO: invulnerable tras recovery
        this.invulnerableTime = 500; // por ejemplo, 0.5s de invulnerabilidad
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
      // Actualizar posición horizontal
      this.x += this.lateralSpeed;
      
      // Mantener el auto dentro de la pista
      if (this.x < this.width / 2) {
        this.x = this.width / 2;
        if (!this.isPlayer) this.crash();
      }
      if (this.x > trackWidth - this.width / 2) {
        this.x = trackWidth - this.width / 2;
        if (!this.isPlayer) this.crash();
      }

      // Actualizar posición vertical (avanza en Y)
      this.y -= this.speed;
    }
  }

  draw(ctx: CanvasRenderingContext2D, cameraY: number) {
    const screenY = this.y - cameraY;
    
    ctx.save();
    ctx.translate(this.x, screenY);

    // Dibujar escudo si está activo
    if (this.shieldActive) {
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.width, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (this.crashed) {
      // Carro chocado
      ctx.rotate(Math.PI / 8);
      ctx.fillStyle = '#666';
    } else {
      ctx.fillStyle = this.color;
    }

    // Carro
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    if (!this.crashed) {
      // Parabrisas
      ctx.fillStyle = '#333';
      ctx.fillRect(-this.width / 4, -this.height / 4, this.width / 2, this.height / 3);
      
      // Faros
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(-this.width / 3, -this.height / 2, 10, 5);
      ctx.fillRect(this.width / 3 - 10, -this.height / 2, 10, 5);

      // Efecto boost
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
      // Efectos de choque
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-this.width / 2, -this.height / 2);
      ctx.lineTo(this.width / 2, this.height / 2);
      ctx.moveTo(this.width / 2, -this.height / 2);
      ctx.lineTo(-this.width / 2, this.height / 2);
      ctx.stroke();
    }

    // Indicador de power-up activo
    if (this.currentPowerUp) {
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(this.currentPowerUp, 0, -this.height / 2 - 10);
    }

    ctx.restore();
  }
}
