import { Alien } from '../types/game';
import { CANVAS_WIDTH, ALIEN_SIZE } from '../constants';

export const createAlienWave = (wave: number): Alien[] => {
  const aliens: Alien[] = [];
  const rows = Math.min(3 + Math.floor(wave / 2), 6);
  const aliensPerRow = Math.min(6 + Math.floor(wave / 3), 10);
  const spacing = (CANVAS_WIDTH - aliensPerRow * ALIEN_SIZE) / (aliensPerRow + 1);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < aliensPerRow; col++) {
      aliens.push({
        x: spacing + col * (ALIEN_SIZE + spacing),
        y: ALIEN_SIZE + row * (ALIEN_SIZE + 20),
        width: ALIEN_SIZE,
        height: ALIEN_SIZE,
        points: (rows - row) * 10,
        active: true,
      });
    }
  }

  return aliens;
};