export interface Target {
  x: number;
  y: number;
  radius: number;
  rotation: number;
  rotationSpeed: number;
}

export interface Knife {
  x: number;
  y: number;
  rotation: number;
  throwing?: boolean;
  stickPosition?: number;
}