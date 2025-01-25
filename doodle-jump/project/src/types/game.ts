export interface Platform {
  x: number;
  y: number;
  width: number;
  type: 'static' | 'moving' | 'disappearing';
  visible?: boolean;
  direction?: number;
}

export interface Player {
  x: number;
  y: number;
  velocityY: number;
  velocityX: number;
  width: number;
  height: number;
  isJumping: boolean;
  hasShield: boolean;
  direction: number;
  highestPlatform: number; // Track the highest platform reached
}

export interface PowerUp {
  x: number;
  y: number;
  type: 'jump' | 'shield' | 'multiplier';
  active: boolean;
}

export interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  direction: number;
}

export interface GameState {
  score: number;
  multiplier: number;
  gameOver: boolean;
  highScore: number;
}