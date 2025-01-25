import { Card } from '../types';

const LEVEL_CONFIGS = [
  { gridSize: 4, pairs: 8 },   // 4x4 grid
  { gridSize: 6, pairs: 18 },  // 6x6 grid
  { gridSize: 8, pairs: 32 }   // 8x8 grid
];

// Updated with working Unsplash image URLs
const IMAGES = [
  'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=200&h=200&fit=crop', // turtle
  'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=200&h=200&fit=crop', // fox
  'https://images.unsplash.com/photo-1484406566174-9da000fda645?w=200&h=200&fit=crop', // elephant
  'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200&h=200&fit=crop', // bird
  'https://images.unsplash.com/photo-1497206365907-f5e630693df0?w=200&h=200&fit=crop', // panda
  'https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=200&h=200&fit=crop', // giraffe
  'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=200&h=200&fit=crop', // dog
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop', // cat
  'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=200&h=200&fit=crop', // koala
  'https://images.unsplash.com/photo-1531989417401-0f85f7e673f8?w=200&h=200&fit=crop', // zebra
  'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=200&h=200&fit=crop', // penguin
  'https://images.unsplash.com/photo-1463852247062-1bbca38f7805?w=200&h=200&fit=crop', // lion
  'https://images.unsplash.com/photo-1559253664-ca249d4608c6?w=200&h=200&fit=crop', // kangaroo
  'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=200&h=200&fit=crop', // tiger
  'https://images.unsplash.com/photo-1591824438708-ce405f36ba3d?w=200&h=200&fit=crop', // deer
  'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=200&h=200&fit=crop', // panda
];

export const generateCards = (level: number): Card[] => {
  const { pairs } = LEVEL_CONFIGS[level - 1];
  const cards: Card[] = [];
  
  // Ensure all cards start face down
  for (let i = 0; i < pairs; i++) {
    const imageUrl = IMAGES[i % IMAGES.length];
    cards.push(
      { id: i * 2, imageUrl, isFlipped: false, isMatched: false },
      { id: i * 2 + 1, imageUrl, isFlipped: false, isMatched: false }
    );
  }
  
  return shuffleCards(cards);
};

export const shuffleCards = (cards: Card[]): Card[] => {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const calculateScore = (moves: number, timeElapsed: number, level: number): number => {
  const baseScore = 1000 * level;
  const movesPenalty = moves * 10;
  const timePenalty = Math.floor(timeElapsed / 2);
  return Math.max(0, baseScore - movesPenalty - timePenalty);
};