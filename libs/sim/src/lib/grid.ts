import type { Grid } from '@conways-game-of-life/types';

export function createGrid(width: number, height: number): Grid {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 0 || height < 0) {
    throw new RangeError(
      `Grid dimensions must be non-negative integers, got ${width}x${height}`
    );
  }
  return { width, height, cells: new Uint8Array(width * height) };
}

export function cloneGrid(grid: Grid): Grid {
  return { width: grid.width, height: grid.height, cells: new Uint8Array(grid.cells) };
}

export function getCell(grid: Grid, x: number, y: number): 0 | 1 {
  if (x < 0 || y < 0 || x >= grid.width || y >= grid.height) {
    return 0;
  }
  return grid.cells[y * grid.width + x] as 0 | 1;
}

export function setCell(
  grid: Grid,
  x: number,
  y: number,
  alive: 0 | 1
): Grid {
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= grid.width || y >= grid.height) {
    throw new RangeError(
      `Cell (${x}, ${y}) is out of bounds for ${grid.width}x${grid.height} grid`
    );
  }
  const cells = new Uint8Array(grid.cells);
  cells[y * grid.width + x] = alive;
  return { width: grid.width, height: grid.height, cells };
}

export function toggleCell(grid: Grid, x: number, y: number): Grid {
  const current = getCell(grid, x, y);
  return setCell(grid, x, y, current === 1 ? 0 : 1);
}

export function clearGrid(grid: Grid): Grid {
  return { width: grid.width, height: grid.height, cells: new Uint8Array(grid.width * grid.height) };
}

export function randomizeGrid(
  grid: Grid,
  density = 0.3,
  rng: () => number = Math.random
): Grid {
  if (density < 0 || density > 1 || Number.isNaN(density)) {
    throw new RangeError(`Density must be between 0 and 1, got ${density}`);
  }
  const { width, height } = grid;
  const len = width * height;
  if (density === 0) return { width, height, cells: new Uint8Array(len) };
  if (density === 1) {
    const cells = new Uint8Array(len);
    cells.fill(1);
    return { width, height, cells };
  }
  const cells = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    cells[i] = rng() < density ? 1 : 0;
  }
  return { width, height, cells };
}
