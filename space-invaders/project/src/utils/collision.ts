import { GameObject } from '../types/game';

export const checkCollision = (obj1: GameObject, obj2: GameObject): boolean => {
  // More precise collision detection with smaller hitboxes
  const margin = 2;
  
  const box1 = {
    left: obj1.x + margin,
    right: obj1.x + obj1.width - margin,
    top: obj1.y + margin,
    bottom: obj1.y + obj1.height - margin
  };
  
  const box2 = {
    left: obj2.x + margin,
    right: obj2.x + obj2.width - margin,
    top: obj2.y + margin,
    bottom: obj2.y + obj2.height - margin
  };
  
  return (
    box1.left < box2.right &&
    box1.right > box2.left &&
    box1.top < box2.bottom &&
    box1.bottom > box2.top
  );
};