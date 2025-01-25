import { Board, Piece, Position, PieceType } from '../types/chess';

export const createInitialBoard = (): Board => {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Initialize pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: 'pawn', color: 'black' };
    board[6][i] = { type: 'pawn', color: 'white' };
  }

  // Initialize other pieces
  const pieces: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  pieces.forEach((piece, i) => {
    board[0][i] = { type: piece, color: 'black' };
    board[7][i] = { type: piece, color: 'white' };
  });

  return board;
};

export const isValidMove = (
  board: Board,
  from: Position,
  to: Position,
  piece: Piece
): boolean => {
  const dx = Math.abs(to.col - from.col);
  const dy = Math.abs(to.row - from.row);
  
  // Basic movement validation
  switch (piece.type) {
    case 'pawn':
      const direction = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;
      
      // Regular move
      if (from.col === to.col && to.row === from.row + direction && !board[to.row][to.col]) {
        return true;
      }
      
      // Initial double move
      if (from.col === to.col && from.row === startRow && 
          to.row === from.row + 2 * direction && 
          !board[to.row][to.col] && 
          !board[from.row + direction][from.col]) {
        return true;
      }
      
      // Capture
      if (dy === 1 && dx === 1 && board[to.row][to.col]?.color !== piece.color) {
        return true;
      }
      return false;

    case 'knight':
      return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);

    case 'bishop':
      return dx === dy;

    case 'rook':
      return dx === 0 || dy === 0;

    case 'queen':
      return dx === dy || dx === 0 || dy === 0;

    case 'king':
      return dx <= 1 && dy <= 1;

    default:
      return false;
  }
};