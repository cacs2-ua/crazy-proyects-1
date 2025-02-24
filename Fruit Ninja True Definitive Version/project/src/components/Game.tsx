import React, { useEffect, useRef, useState } from 'react';
import { Swords } from 'lucide-react';

interface Fruit {
  x: number;
  y: number;
  radius: number;
  velocityY: number;
  velocityX: number;
  color: string;
  sliced: boolean;
  rotation: number;
  type: string;
  particles: Particle[];
  sliceAngle: number;
  sliceTime: number;
  innerColor: string;
  shadowColor: string;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  velocityX: number;
  velocityY: number;
  alpha: number;
}

const FRUITS = [
  { 
    type: 'watermelon',
    color: '#ff6b6b',
    innerColor: '#ff9f9f',
    shadowColor: '#d44d4d',
    radius: 40,
    pattern: (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
      // Draw seeds
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const seedX = x + Math.cos(angle) * radius * 0.5;
        const seedY = y + Math.sin(angle) * radius * 0.5;
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.ellipse(seedX, seedY, 4, 2, angle, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },
  { 
    type: 'orange',
    color: '#ffa502',
    innerColor: '#ffd080',
    shadowColor: '#cc8401',
    radius: 30,
    pattern: (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
      // Draw segments
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.strokeStyle = '#cc8401';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
        ctx.stroke();
      }
    }
  },
  { 
    type: 'kiwi',
    color: '#badc58',
    innerColor: '#6c8436',
    shadowColor: '#95b348',
    radius: 25,
    pattern: (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
      // Draw seeds
      for (let i = 0; i < 12; i++) {
        for (let j = 0; j < 3; j++) {
          const angle = (i / 12) * Math.PI * 2;
          const distance = (j + 1) * radius * 0.25;
          const seedX = x + Math.cos(angle) * distance;
          const seedY = y + Math.sin(angle) * distance;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(seedX, seedY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  },
  {
    type: 'dragon-fruit',
    color: '#fd79a8',
    innerColor: '#ffffff',
    shadowColor: '#e84393',
    radius: 35,
    pattern: (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
      // Draw scales
      for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 2; j++) {
          const angle = (i / 16) * Math.PI * 2;
          const distance = (j + 1) * radius * 0.4;
          const scaleX = x + Math.cos(angle) * distance;
          const scaleY = y + Math.sin(angle) * distance;
          ctx.fillStyle = '#2d3436';
          ctx.beginPath();
          ctx.arc(scaleX, scaleY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  },
  {
    type: 'passion-fruit',
    color: '#6c5ce7',
    innerColor: '#a8a0e3',
    shadowColor: '#4834d4',
    radius: 28,
    pattern: (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
      // Draw seeds
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius * 0.7;
        const seedX = x + Math.cos(angle) * distance;
        const seedY = y + Math.sin(angle) * distance;
        ctx.fillStyle = '#ffeaa7';
        ctx.beginPath();
        ctx.arc(seedX, seedY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },
  {
    type: 'pomegranate',
    color: '#e17055',
    innerColor: '#ff7675',
    shadowColor: '#d63031',
    radius: 32,
    pattern: (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
      // Draw seeds
      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        const distance = radius * 0.6;
        const seedX = x + Math.cos(angle) * distance;
        const seedY = y + Math.sin(angle) * distance;
        ctx.fillStyle = '#ff7675';
        ctx.beginPath();
        ctx.arc(seedX, seedY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
];

const GRAVITY = 0.5;
const PARTICLE_COUNT = 12;
const COMBO_TIME = 500;
const SLICE_ANIMATION_DURATION = 300;
const SPAWN_INTERVAL = 400;
const FRUITS_PER_SPAWN = 2;
const TRAIL_LENGTH = 25;
const TRAIL_FADE_SPEED = 0.02;

interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
  size: number;
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const fruitsRef = useRef<Fruit[]>([]);
  const mouseTrailRef = useRef<TrailPoint[]>([]);
  const animationFrameRef = useRef<number>();
  const lastSpawnTimeRef = useRef(0);
  const lastSliceTimeRef = useRef(0);
  const [bestCombo, setBestCombo] = useState(0);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const isMouseDownRef = useRef(false);

  const createParticles = (x: number, y: number, color: string): Particle[] => {
    return Array.from({ length: PARTICLE_COUNT }, () => ({
      x,
      y,
      radius: Math.random() * 4 + 2,
      color,
      velocityX: (Math.random() - 0.5) * 12,
      velocityY: (Math.random() - 0.5) * 12,
      alpha: 1
    }));
  };

  const createFruit = (xOffset = 0) => {
    const fruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
    const canvasWidth = canvasRef.current?.width || 800;
    const x = (Math.random() * (canvasWidth * 0.6)) + (canvasWidth * 0.2) + xOffset;
    return {
      x,
      y: (canvasRef.current?.height || 600) + 30,
      radius: fruit.radius,
      velocityY: -15 - Math.random() * 5,
      velocityX: (Math.random() - 0.5) * 8,
      color: fruit.color,
      innerColor: fruit.innerColor,
      shadowColor: fruit.shadowColor,
      type: fruit.type,
      sliced: false,
      rotation: Math.random() * Math.PI * 2,
      particles: [],
      sliceAngle: 0,
      sliceTime: 0
    };
  };

  const drawFruit = (ctx: CanvasRenderingContext2D, fruit: Fruit) => {
    const fruitType = FRUITS.find(f => f.type === fruit.type);
    if (!fruitType) return;

    ctx.save();
    ctx.translate(fruit.x, fruit.y);
    ctx.rotate(fruit.rotation);

    if (fruit.sliced) {
      // Draw sliced fruit with animation
      const progress = Math.min((Date.now() - fruit.sliceTime) / SLICE_ANIMATION_DURATION, 1);
      const separation = progress * fruit.radius;
      
      // Draw top half
      ctx.save();
      ctx.rotate(fruit.sliceAngle);
      ctx.translate(0, -separation);
      ctx.rotate(-fruit.sliceAngle);
      
      // Draw the top half of the fruit
      ctx.beginPath();
      ctx.arc(0, 0, fruit.radius, -Math.PI, 0);
      ctx.fillStyle = fruit.shadowColor;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, fruit.radius * 0.9, -Math.PI, 0);
      ctx.fillStyle = fruit.color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, fruit.radius * 0.8, -Math.PI, 0);
      ctx.fillStyle = fruit.innerColor;
      ctx.fill();
      
      // Draw pattern on top half
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, fruit.radius * 0.8, -Math.PI, 0);
      ctx.clip();
      fruitType.pattern(ctx, 0, 0, fruit.radius);
      ctx.restore();
      
      ctx.restore();
      
      // Draw bottom half
      ctx.save();
      ctx.rotate(fruit.sliceAngle);
      ctx.translate(0, separation);
      ctx.rotate(-fruit.sliceAngle);
      
      // Draw the bottom half of the fruit
      ctx.beginPath();
      ctx.arc(0, 0, fruit.radius, 0, Math.PI);
      ctx.fillStyle = fruit.shadowColor;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, fruit.radius * 0.9, 0, Math.PI);
      ctx.fillStyle = fruit.color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, fruit.radius * 0.8, 0, Math.PI);
      ctx.fillStyle = fruit.innerColor;
      ctx.fill();
      
      // Draw pattern on bottom half
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, fruit.radius * 0.8, 0, Math.PI);
      ctx.clip();
      fruitType.pattern(ctx, 0, 0, fruit.radius);
      ctx.restore();
      
      ctx.restore();

      // Draw slice effect
      ctx.beginPath();
      ctx.moveTo(-fruit.radius * 1.2, 0);
      ctx.lineTo(fruit.radius * 1.2, 0);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else {
      // Draw whole fruit
      ctx.beginPath();
      ctx.arc(0, 0, fruit.radius, 0, Math.PI * 2);
      ctx.fillStyle = fruit.shadowColor;
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(0, 0, fruit.radius * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = fruit.color;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, fruit.radius * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = fruit.innerColor;
      ctx.fill();

      // Draw shine
      const gradient = ctx.createRadialGradient(
        -fruit.radius * 0.3,
        -fruit.radius * 0.3,
        0,
        -fruit.radius * 0.3,
        -fruit.radius * 0.3,
        fruit.radius * 0.5
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw pattern
      fruitType.pattern(ctx, 0, 0, fruit.radius);
    }
    
    ctx.restore();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Calculate mouse velocity for trail effect
    const dx = x - lastMousePos.current.x;
    const dy = y - lastMousePos.current.y;
    const speed = Math.sqrt(dx * dx + dy * dy);
    
    // Create new trail point with size based on mouse speed
    const newPoint: TrailPoint = {
      x,
      y,
      alpha: 1,
      size: Math.min(8 + speed * 0.5, 20)
    };

    mouseTrailRef.current = [...mouseTrailRef.current, newPoint].slice(-TRAIL_LENGTH);
    lastMousePos.current = { x, y };

    // Check for collisions with fruits
    fruitsRef.current = fruitsRef.current.map(fruit => {
      if (!fruit.sliced) {
        const distance = Math.sqrt(
          Math.pow(x - fruit.x, 2) + Math.pow(y - fruit.y, 2)
        );
        if (distance < fruit.radius) {
          const now = Date.now();
          if (now - lastSliceTimeRef.current < COMBO_TIME) {
            setCombo(prev => {
              const newCombo = prev + 1;
              setBestCombo(current => Math.max(current, newCombo));
              return newCombo;
            });
          } else {
            setCombo(1);
          }
          lastSliceTimeRef.current = now;
          setScore(prev => prev + (combo + 1));

          const lastPoint = mouseTrailRef.current[mouseTrailRef.current.length - 2] || { x, y };
          const angle = Math.atan2(y - lastPoint.y, x - lastPoint.x);

          return {
            ...fruit,
            sliced: true,
            sliceTime: now,
            sliceAngle: angle,
            particles: createParticles(fruit.x, fruit.y, fruit.color)
          };
        }
      }
      return fruit;
    });
  };

  const handleMouseDown = () => {
    isMouseDownRef.current = true;
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || gameOver) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(1, '#3498db');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update trail points
    mouseTrailRef.current = mouseTrailRef.current
      .map(point => ({
        ...point,
        alpha: Math.max(0, point.alpha - TRAIL_FADE_SPEED)
      }))
      .filter(point => point.alpha > 0);

    // Draw enhanced mouse trail
    if (mouseTrailRef.current.length > 1) {
      ctx.save();
      
      // Draw glow effect
      ctx.filter = 'blur(8px)';
      ctx.globalCompositeOperation = 'lighter';
      
      mouseTrailRef.current.forEach((point, i) => {
        if (i === 0) return;
        const prevPoint = mouseTrailRef.current[i - 1];
        
        const gradient = ctx.createLinearGradient(
          prevPoint.x, prevPoint.y,
          point.x, point.y
        );
        
        gradient.addColorStop(0, `rgba(255, 255, 255, ${prevPoint.alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${point.alpha * 0.5})`);
        
        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = point.size * 2;
        ctx.lineCap = 'round';
        ctx.moveTo(prevPoint.x, prevPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      });
      
      // Draw main trail
      ctx.filter = 'none';
      mouseTrailRef.current.forEach((point, i) => {
        if (i === 0) return;
        const prevPoint = mouseTrailRef.current[i - 1];
        
        const gradient = ctx.createLinearGradient(
          prevPoint.x, prevPoint.y,
          point.x, point.y
        );
        
        gradient.addColorStop(0, `rgba(255, 255, 255, ${prevPoint.alpha})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${point.alpha})`);
        
        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = point.size;
        ctx.lineCap = 'round';
        ctx.moveTo(prevPoint.x, prevPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      });
      
      ctx.restore();
    }

    // Spawn new fruits
    const now = Date.now();
    if (now - lastSpawnTimeRef.current > SPAWN_INTERVAL) {
      const newFruits = Array.from({ length: FRUITS_PER_SPAWN }, (_, i) => 
        createFruit((i - (FRUITS_PER_SPAWN - 1) / 2) * 100)
      );
      fruitsRef.current = [...fruitsRef.current, ...newFruits];
      lastSpawnTimeRef.current = now;
    }

    // Update and draw fruits
    fruitsRef.current = fruitsRef.current
      .map(fruit => ({
        ...fruit,
        y: fruit.y + fruit.velocityY,
        x: fruit.x + fruit.velocityX,
        velocityY: fruit.velocityY + GRAVITY,
        rotation: fruit.rotation + (fruit.sliced ? 0.1 : 0.02),
        particles: fruit.particles.map(particle => ({
          ...particle,
          x: particle.x + particle.velocityX,
          y: particle.y + particle.velocityY,
          velocityY: particle.velocityY + GRAVITY * 0.5,
          alpha: particle.alpha - 0.02
        })).filter(particle => particle.alpha > 0)
      }))
      .filter(fruit => fruit.y < canvas.height + 50);

    // Draw fruits and particles
    fruitsRef.current.forEach(fruit => {
      drawFruit(ctx, fruit);
      
      // Draw juice particles
      fruit.particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${fruit.color}${Math.floor(particle.alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
      });
    });

    // Draw combo
    if (combo > 1) {
      ctx.font = 'bold 48px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(`${combo}x COMBO!`, canvas.width / 2, canvas.height / 2);
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Set canvas size with proper scaling
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    }
    
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    gameLoop();
    
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const restartGame = () => {
    setScore(0);
    setCombo(0);
    setGameOver(false);
    fruitsRef.current = [];
    mouseTrailRef.current = [];
    lastSpawnTimeRef.current = 0;
    lastSliceTimeRef.current = 0;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="text-white mb-4 flex items-center gap-8">
        <div className="flex items-center gap-2">
          <Swords className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Fruit Ninja
          </h1>
        </div>
        <div className="flex gap-8 text-lg">
          <div>
            <span className="text-gray-400">Score:</span>{' '}
            <span className="font-bold text-yellow-400">{score}</span>
          </div>
          <div>
            <span className="text-gray-400">Best Combo:</span>{' '}
            <span className="font-bold text-green-400">{bestCombo}x</span>
          </div>
        </div>
      </div>
      
      <div className="relative rounded-lg overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.3)]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          className="bg-gray-800 w-[800px] h-[600px]"
        />
      </div>

      <div className="mt-6 text-gray-400 text-sm flex flex-col items-center gap-2">
        <p className="font-medium">Slice fruits with your cursor to score points!</p>
        <p>Quick consecutive slices build up your combo multiplier</p>
      </div>
    </div>
  );
}