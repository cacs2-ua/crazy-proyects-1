import React, { useEffect, useRef, useState } from 'react';
import { Target, Knife } from '../types/game';
import { useGameLoop } from '../hooks/useGameLoop';
import { drawTarget, drawKnife, checkCollision } from '../utils/gameUtils';

const CANVAS_SIZE = 800;
const TARGET_RADIUS = 180;
const KNIFE_HEIGHT = 50;
const KNIFE_WIDTH = 8;
const INITIAL_ROTATION_SPEED = 0.01;
const SPEED_INCREMENT = 0.0075; // Slower increment for difficulty
const THROW_SPEED = 20;
const OUTER_RING_WIDTH = 40; // Width of the outer ring where knives can stick
const STICK_OFFSET = -55;    // Distance from the outer edge where knives will stick

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('knifeHitHighScore');
    return saved ? parseInt(saved) : 0;
  });

  const gameState = useRef({
    target: {
      x: CANVAS_SIZE / 2,
      y: CANVAS_SIZE / 2,
      radius: TARGET_RADIUS,
      rotation: 0,
      rotationSpeed: INITIAL_ROTATION_SPEED
    } as Target,
    knives: [] as Knife[],
    throwingKnife: {
      x: CANVAS_SIZE / 2,
      y: CANVAS_SIZE - 60,
      rotation: 0,
      throwing: false,
      stickPosition: 0
    } as Knife
  });

  const throwKnife = () => {
    if (!gameOver && !gameState.current.throwingKnife.throwing) {
      gameState.current.throwingKnife.throwing = true;
    }
  };

  const resetGame = () => {
    gameState.current = {
      ...gameState.current,
      knives: [],
      throwingKnife: {
        x: CANVAS_SIZE / 2,
        y: CANVAS_SIZE - 60,
        rotation: 0,
        throwing: false,
        stickPosition: 0
      },
      target: {
        ...gameState.current.target,
        rotationSpeed: INITIAL_ROTATION_SPEED
      }
    };
    setGameOver(false);
    setScore(0);
  };

  const updateGame = (ctx: CanvasRenderingContext2D) => {
    const { target, knives, throwingKnife } = gameState.current;

    // ---- CHANGED: Dark, bloody gradient for background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE);
    bgGradient.addColorStop(0, '#0d0d0d');      // near-black
    bgGradient.addColorStop(1, '#330000');      // deep red/burgundy
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Update target rotation
    target.rotation += target.rotationSpeed;

    // Draw target (bloody style in gameUtils)
    drawTarget(ctx, target);

    // Update and draw stuck knives
    knives.forEach((knife) => {
      // Position knives at the desired STICK_DISTANCE inside the outer edge
      const STICK_DISTANCE = target.radius - STICK_OFFSET;

      const knifeX =
        target.x +
        STICK_DISTANCE * Math.cos(target.rotation + knife.stickPosition);
      const knifeY =
        target.y +
        STICK_DISTANCE * Math.sin(target.rotation + knife.stickPosition);

      knife.x = knifeX;
      knife.y = knifeY;
      knife.rotation = target.rotation + knife.stickPosition - Math.PI / 2;

      drawKnife(ctx, knife);
    });

    // Update throwing knife
    if (throwingKnife.throwing) {
      throwingKnife.y -= THROW_SPEED;

      const distanceToCenter = Math.sqrt(
        Math.pow(throwingKnife.x - target.x, 2) +
          Math.pow(throwingKnife.y - target.y, 2)
      );

      const collisionMargin = STICK_OFFSET;
      const outerRingDistance = target.radius - collisionMargin;
      const innerRingDistance = target.radius - OUTER_RING_WIDTH - collisionMargin;

      if (
        distanceToCenter <= outerRingDistance &&
        distanceToCenter >= innerRingDistance
      ) {
        // Calculate angle of impact
        const impactAngle =
          Math.atan2(throwingKnife.y - target.y, throwingKnife.x - target.x) -
          target.rotation;

        // Check collision with other knives
        const collision = checkCollision(impactAngle, knives);

        if (collision) {
          setGameOver(true);
          const newHighScore = Math.max(score, highScore);
          setHighScore(newHighScore);
          localStorage.setItem('knifeHitHighScore', newHighScore.toString());
          return;
        }

        // Stick knife to target
        const STICK_DISTANCE = target.radius - STICK_OFFSET;
        const newKnifeX =
          target.x + STICK_DISTANCE * Math.cos(target.rotation + impactAngle);
        const newKnifeY =
          target.y + STICK_DISTANCE * Math.sin(target.rotation + impactAngle);

        const newKnife = {
          x: newKnifeX,
          y: newKnifeY,
          rotation: target.rotation + impactAngle - Math.PI / 2,
          stickPosition: impactAngle
        };
        gameState.current.knives.push(newKnife);

        // Reset throwing knife
        gameState.current.throwingKnife = {
          x: CANVAS_SIZE / 2,
          y: CANVAS_SIZE - 60,
          rotation: 0,
          throwing: false,
          stickPosition: 0
        };

        // Increase score and difficulty
        setScore((prev) => prev + 1);
        target.rotationSpeed += SPEED_INCREMENT;
      } else if (distanceToCenter < innerRingDistance || throwingKnife.y < 0) {
        // Knife missed the outer ring or went off screen
        setGameOver(true);
        const newHighScore = Math.max(score, highScore);
        setHighScore(newHighScore);
        localStorage.setItem('knifeHitHighScore', newHighScore.toString());
        return;
      }
    }

    // Draw throwing knife
    drawKnife(ctx, throwingKnife);
  };

  useGameLoop(canvasRef, updateGame);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (gameOver) {
          resetGame();
        } else {
          throwKnife();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black to-red-900 text-white">
      <div className="relative shadow-2xl rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="rounded-lg"
          onClick={() => (!gameOver ? throwKnife() : resetGame())}
        />
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm animate-fade-in">
            <h2 className="text-6xl font-bold mb-6 text-red-600 drop-shadow-lg animate-pulse">
            <strong>Game Over!</strong>
            </h2>
            <p className="text-2xl mb-2 text-white drop-shadow-lg">
            <strong>Score: {score}</strong>
            </p>
            <p className="text-2xl mb-6 text-white drop-shadow-lg">
            <strong>High Score: {highScore}</strong>
            </p>
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-red-700 hover:bg-red-800 rounded-lg text-xl font-semibold text-white border-2 border-red-900 shadow-lg transform hover:scale-105 hover:shadow-2xl transition duration-300 ease-in-out"
            >
              <strong>Play Again</strong>
            </button>
          </div>
        )}
      </div>
      <div className="mt-8 text-center text-red-500">
        <p className="text-3xl font-bold mb-2 drop-shadow-lg">
          <strong>Score: {score}</strong>
        </p>
        <p className="text-2xl mb-4 drop-shadow-lg">
        <strong>High Score: {highScore}</strong>
        </p>
        <p className="text-lg opacity-90 text-red-300 drop-shadow-lg">
        <strong>Click or press SPACE to throw knives</strong>
        </p>
      </div>
    </div>
  );
}
