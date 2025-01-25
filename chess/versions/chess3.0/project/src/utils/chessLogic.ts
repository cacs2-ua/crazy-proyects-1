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

const isPathClear = (board: Board, from: Position, to: Position): boolean => {
  const dx = to.col - from.col;
  const dy = to.row - from.row;
  const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
  const stepY = dy === 0 ? 0 : dy / Math.abs(dy);
  
  let currentRow = from.row + stepY;
  let currentCol = from.col + stepX;
  
  // Check each square along the path
  while (currentRow !== to.row || currentCol !== to.col) {
    if (board[currentRow][currentCol] !== null) {
      return false;
    }
    currentRow += stepY;
    currentCol += stepX;
  }
  
  return true;
};

const isSameColor = (board: Board, from: Position, to: Position): boolean => {
  const sourcePiece = board[from.row][from.col];
  const targetPiece = board[to.row][to.col];
  return targetPiece !== null && sourcePiece?.color === targetPiece.color;
};

const isWithinBoard = (position: Position): boolean => {
  return position.row >= 0 && position.row < 8 && position.col >= 0 && position.col < 8;
};

export const isValidMove = (
  board: Board,
  from: Position,
  to: Position,
  piece: Piece
): boolean => {
  // Basic validation
  if (!isWithinBoard(to)) return false;
  if (isSameColor(board, from, to)) return false;
  
  const dx = to.col - from.col;
  const dy = to.row - from.row;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  
  switch (piece.type) {
    case 'pawn': {
      const direction = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;
      const targetPiece = board[to.row][to.col];
      
      // Regular forward move
      if (dx === 0 && dy === direction && !targetPiece) {
        return true;
      }
      
      // Initial double move
      if (dx === 0 && from.row === startRow && dy === 2 * direction) {
        return !targetPiece && !board[from.row + direction][from.col] && isPathClear(board, from, to);
      }
      
      // Capture move
      if (absDx === 1 && dy === direction && targetPiece && targetPiece.color !== piece.color) {
        return true;
      }
      
      return false;
    }

    case 'knight':
      // Knights can jump over pieces, so we don't need to check the path
      return (absDx === 2 && absDy === 1) || (absDx === 1 && absDy === 2);

    case 'bishop': {
      if (absDx !== absDy) return false;
      return isPathClear(board, from, to);
    }

    case 'rook': {
      if (dx !== 0 && dy !== 0) return false;
      return isPathClear(board, from, to);
    }

    case 'queen': {
      if ((dx !== 0 && dy !== 0) && (absDx !== absDy)) return false;
      return isPathClear(board, from, to);
    }

    case 'king': {
      // Basic king movement (one square in any direction)
      return absDx <= 1 && absDy <= 1;
    }

    default:
      return false;
  }
};