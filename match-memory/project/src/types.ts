export interface Card {
  id: number;
  imageUrl: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface GameState {
  level: number;
  moves: number;
  score: number;
  timeElapsed: number;
  gameStatus: 'idle' | 'playing' | 'paused' | 'completed';
}

export interface GameStats {
  bestTime: number;
  bestMoves: number;
  highScore: number;
}