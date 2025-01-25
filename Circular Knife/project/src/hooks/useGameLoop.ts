import { useEffect, useRef } from 'react';

export function useGameLoop(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  updateFn: (ctx: CanvasRenderingContext2D) => void
) {
  const frameIdRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      updateFn(ctx);
      frameIdRef.current = requestAnimationFrame(animate);
    };

    frameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [canvasRef, updateFn]);
}