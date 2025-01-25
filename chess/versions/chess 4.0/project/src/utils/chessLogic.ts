import { Board, Piece, Position, PieceType, PieceColor } from '../types/chess';

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

export const findKingPosition = (board: Board, color: PieceColor): Position | null => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece?.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
};

export const isKingInCheck = (board: Board, kingColor: PieceColor): boolean => {
  const kingPos = findKingPosition(board, kingColor);
  if (!kingPos) return false;

  // Check if any opponent piece can attack the king
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color !== kingColor) {
        if (isValidMove(board, { row, col }, kingPos, piece, true)) {
          return true;
        }
      }
    }
  }
  return false;
};

export const hasValidMoves = (board: Board, color: PieceColor): boolean => {
  // Try all possible moves for all pieces of the given color
  for (let fromRow = 0; fromRow < 8; fromRow++) {
    for (let fromCol = 0; fromCol < 8; fromCol++) {
      const piece = board[fromRow][fromCol];
      if (piece?.color === color) {
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            // Try the move
            if (isValidMove(board, { row: fromRow, col: fromCol }, { row: toRow, col: toCol }, piece)) {
              // Make temporary move
              const tempBoard = board.map(row => [...row]);
              tempBoard[toRow][toCol] = piece;
              tempBoard[fromRow][fromCol] = null;
              
              // If this move gets us out of check, we have a valid move
              if (!isKingInCheck(tempBoard, color)) {
                return true;
              }
            }
          }
        }
      }
    }
  }
  return false;
};

export const isValidMove = (
  board: Board,
  from: Position,
  to: Position,
  piece: Piece,
  isCheckTest: boolean = false
): boolean => {
  // Basic validation
  if (!isWithinBoard(to)) return false;
  if (isSameColor(board, from, to)) return false;
  
  const dx = to.col - from.col;
  const dy = to.row - from.row;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  
  let isValid = false;

  switch (piece.type) {
    case 'pawn': {
      const direction = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;
      const targetPiece = board[to.row][to.col];
      
      // Regular forward move
      if (dx === 0 && dy === direction && !targetPiece) {
        isValid = true;
      }
      
      // Initial double move
      if (dx === 0 && from.row === startRow && dy === 2 * direction) {
        isValid = !targetPiece && !board[from.row + direction][from.col] && isPathClear(board, from, to);
      }
      
      // Capture move
      if (absDx === 1 && dy === direction && targetPiece && targetPiece.color !== piece.color) {
        isValid = true;
      }
      break;
    }

    case 'knight':
      isValid = (absDx === 2 && absDy === 1) || (absDx === 1 && absDy === 2);
      break;

    case 'bishop':
      if (absDx === absDy) {
        isValid = isPathClear(board, from, to);
      }
      break;

    case 'rook':
      if (dx === 0 || dy === 0) {
        isValid = isPathClear(board, from, to);
      }
      break;

    case 'queen':
      if ((dx === 0 || dy === 0) || (absDx === absDy)) {
        isValid = isPathClear(board, from, to);
      }
      break;

    case 'king':
      isValid = absDx <= 1 && absDy <= 1;
      break;
  }

  if (!isValid) return false;

  // If this is just a check test, we don't need to verify if the move puts own king in check
  if (isCheckTest) return true;

  // Make temporary move and verify it doesn't put/leave own king in check
  const tempBoard = board.map(row => [...row]);
  tempBoard[to.row][to.col] = piece;
  tempBoard[from.row][from.col] = null;

  return !isKingInCheck(tempBoard, piece.color);
};