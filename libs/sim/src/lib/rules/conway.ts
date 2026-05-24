import type { Grid, RuleSet } from '@conways-game-of-life/types';
import { getCell } from '../grid.js';

function countNeighbors(grid: Grid, x: number, y: number): number {
  return (
    getCell(grid, x - 1, y - 1) +
    getCell(grid, x, y - 1) +
    getCell(grid, x + 1, y - 1) +
    getCell(grid, x - 1, y) +
    getCell(grid, x + 1, y) +
    getCell(grid, x - 1, y + 1) +
    getCell(grid, x, y + 1) +
    getCell(grid, x + 1, y + 1)
  );
}

export function step(grid: Grid): Grid {
  const { width, height, cells } = grid;
  const next = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const neighbors = countNeighbors(grid, x, y);
      const alive = cells[y * width + x] as 0 | 1;
      if (neighbors === 3 || (neighbors === 2 && alive)) {
        next[y * width + x] = 1;
      }
    }
  }

  return { width, height, cells: next };
}

export const conwayRules: RuleSet = {
  id: 'conway',
  name: "Conway's Game of Life",
  step,
};
