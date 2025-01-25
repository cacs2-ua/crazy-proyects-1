import React, { useState } from 'react';
import { Board, Position, PieceColor } from '../types/chess';
import { createInitialBoard, isValidMove } from '../utils/chessLogic';
import { ChevronRight as ChessKnight, BookCheck as ChessRook, CopyCheck as ChessBishop, Parentheses as ChessQueen, Check as ChessKing, Dot, RotateCcw } from 'lucide-react';

const ChessBoard: React.FC = () => {
  const [board, setBoard] = useState<Board>(createInitialBoard());
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('white');
  const [winner, setWinner] = useState<PieceColor | null>(null);

  const resetGame = () => {
    setBoard(createInitialBoard());
    setSelectedPosition(null);
    setCurrentPlayer('white');
    setWinner(null);
  };

  const getPieceIcon = (type: string, color: PieceColor) => {
    const className = `w-8 h-8 ${color === 'white' ? 'text-gray-100' : 'text-gray-900'}`;
    
    switch (type) {
      case 'pawn':
        return <Dot className={`${className} w-6 h-6`} />;
      case 'knight':
        return <ChessKnight className={className} />;
      case 'rook':
        return <ChessRook className={className} />;
      case 'bishop':
        return <ChessBishop className={className} />;
      case 'queen':
        return <ChessQueen className={className} />;
      case 'king':
        return <ChessKing className={className} />;
      default:
        return null;
    }
  };

  const handleSquareClick = (row: number, col: number) => {
    if (winner) return; // Prevent moves after game is won

    if (!selectedPosition) {
      const piece = board[row][col];
      if (piece && piece.color === currentPlayer) {
        setSelectedPosition({ row, col });
      }
    } else {
      const from = selectedPosition;
      const to = { row, col };
      const piece = board[from.row][from.col];
      const targetPiece = board[to.row][to.col];

      if (piece && isValidMove(board, from, to, piece)) {
        const newBoard = board.map(row => [...row]);
        
        // Check if a king is captured
        if (targetPiece?.type === 'king') {
          setWinner(currentPlayer);
        }

        newBoard[to.row][to.col] = piece;
        newBoard[from.row][from.col] = null;
        
        setBoard(newBoard);
        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
      }
      
      setSelectedPosition(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      {winner ? (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-100 mb-4">
              {winner.charAt(0).toUpperCase() + winner.slice(1)} Wins!
            </h2>
            <button
              onClick={resetGame}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-4 text-2xl font-bold text-gray-100">
          {currentPlayer === 'white' ? "White's Turn" : "Black's Turn"}
        </div>
      )}
      <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
        <div className="grid grid-cols-8 gap-0 border-2 border-gray-700">
          {board.map((row, rowIndex) => (
            row.map((piece, colIndex) => {
              const isSelected = selectedPosition?.row === rowIndex && selectedPosition?.col === colIndex;
              const isLight = (rowIndex + colIndex) % 2 === 0;
              
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    w-16 h-16 flex items-center justify-center cursor-pointer
                    ${isLight ? 'bg-gray-600' : 'bg-gray-800'}
                    ${isSelected ? 'ring-2 ring-blue-400' : ''}
                    hover:opacity-75 transition-opacity
                  `}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                >
                  {piece && getPieceIcon(piece.type, piece.color)}
                </div>
              );
            })
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;