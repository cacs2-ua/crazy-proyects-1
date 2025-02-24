export interface Position {
  x: number;
  y: number;
}

export interface GameObject extends Position {
  width: number;
  height: number;
}

export interface Projectile extends GameObject {
  active: boolean;
}

export interface Player extends GameObject {
  speed: number;
  lives: number;
}

export interface Alien extends GameObject {
  points: number;
  active: boolean;
  explosionFrame?: number;
}

export interface GameState {
  score: number;
  gameOver: boolean;
  wave: number;
}