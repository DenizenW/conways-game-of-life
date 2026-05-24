import { useCallback, useEffect, useRef } from 'react';
import type { Grid } from '@conways-game-of-life/sim';

interface CanvasProps {
  grid: Grid;
  cellSize: number;
  onCellToggle?: (x: number, y: number) => void;
}

function renderGrid(
  ctx: CanvasRenderingContext2D,
  grid: Grid,
  cellSize: number
) {
  const w = grid.width * cellSize;
  const h = grid.height * cellSize;
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#22d3ee';
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      if (grid.cells[y * grid.width + x] === 1) {
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }
  // Draw grid lines so the empty grid is visible
  ctx.strokeStyle = '#404040';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= grid.width; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize, 0);
    ctx.lineTo(x * cellSize, h);
    ctx.stroke();
  }
  for (let y = 0; y <= grid.height; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize);
    ctx.lineTo(w, y * cellSize);
    ctx.stroke();
  }
}

export default function Canvas({ grid, cellSize, onCellToggle }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderGrid(ctx, grid, cellSize);
  }, [grid, cellSize]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = event.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / cellSize);
      const y = Math.floor((event.clientY - rect.top) / cellSize);
      if (x >= 0 && x < grid.width && y >= 0 && y < grid.height) {
        onCellToggle?.(x, y);
      }
    },
    [cellSize, grid.width, grid.height, onCellToggle]
  );

  const pixelWidth = grid.width * cellSize;
  const pixelHeight = grid.height * cellSize;

  return (
    <canvas
      ref={canvasRef}
      data-testid="canvas"
      width={pixelWidth}
      height={pixelHeight}
      className="max-w-full"
      style={{ width: pixelWidth, height: pixelHeight, touchAction: 'none' }}
      onPointerDown={handlePointerDown}
    />
  );
}
