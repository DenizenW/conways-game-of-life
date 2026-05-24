import { step } from './conway';
import { createGrid, setCell, getCell, cloneGrid } from '../grid';

describe('Rule 1: underpopulation', () => {
  it('single live cell on 3x3 dies (0 neighbors)', () => {
    let grid = createGrid(3, 3);
    grid = setCell(grid, 1, 1, 1);

    const next = step(grid);

    expect(getCell(next, 1, 1)).toBe(0);
  });

  it('live cell with exactly 1 neighbor dies', () => {
    let grid = createGrid(3, 3);
    grid = setCell(grid, 1, 1, 1);
    grid = setCell(grid, 2, 1, 1);

    const next = step(grid);

    expect(getCell(next, 1, 1)).toBe(0);
    expect(getCell(next, 2, 1)).toBe(0);
  });
});

describe('Rule 2: survival', () => {
  it('2x2 block still-life is stable for 5 generations', () => {
    let grid = createGrid(4, 4);
    grid = setCell(grid, 1, 1, 1);
    grid = setCell(grid, 2, 1, 1);
    grid = setCell(grid, 1, 2, 1);
    grid = setCell(grid, 2, 2, 1);

    for (let gen = 0; gen < 5; gen++) {
      const next = step(grid);
      expect(next.cells).toEqual(grid.cells);
      grid = next;
    }
  });

  it('dead cell with 2 neighbors does not come alive', () => {
    let grid = createGrid(3, 3);
    grid = setCell(grid, 0, 0, 1);
    grid = setCell(grid, 2, 0, 1);

    const next = step(grid);

    expect(getCell(next, 1, 0)).toBe(0);
  });
});

describe('Rule 3: overpopulation', () => {
  it('live cell with 4 neighbors dies', () => {
    let grid = createGrid(5, 5);
    // Plus/cross pattern: center has 4 neighbors
    grid = setCell(grid, 2, 2, 1); // center
    grid = setCell(grid, 1, 2, 1); // left
    grid = setCell(grid, 3, 2, 1); // right
    grid = setCell(grid, 2, 1, 1); // top
    grid = setCell(grid, 2, 3, 1); // bottom

    const next = step(grid);

    expect(getCell(next, 2, 2)).toBe(0);
  });

  it('live cell with 5+ neighbors dies', () => {
    let grid = createGrid(5, 5);
    grid = setCell(grid, 2, 2, 1); // center
    grid = setCell(grid, 1, 1, 1);
    grid = setCell(grid, 2, 1, 1);
    grid = setCell(grid, 3, 1, 1);
    grid = setCell(grid, 1, 2, 1);
    grid = setCell(grid, 3, 2, 1);

    const next = step(grid);

    expect(getCell(next, 2, 2)).toBe(0);
  });
});

describe('Rule 4: reproduction', () => {
  it('dead cell with exactly 3 neighbors becomes alive', () => {
    let grid = createGrid(3, 3);
    grid = setCell(grid, 0, 0, 1);
    grid = setCell(grid, 1, 0, 1);
    grid = setCell(grid, 2, 0, 1);

    const next = step(grid);

    expect(getCell(next, 1, 1)).toBe(1);
  });

  it('dead cell with 2 neighbors stays dead', () => {
    let grid = createGrid(3, 3);
    grid = setCell(grid, 0, 0, 1);
    grid = setCell(grid, 1, 0, 1);

    const next = step(grid);

    expect(getCell(next, 0, 1)).toBe(0);
  });
});

describe('Blinker oscillator', () => {
  it('horizontal blinker becomes vertical and back (period 2)', () => {
    // Gen 0: horizontal blinker at row 2
    let grid = createGrid(5, 5);
    grid = setCell(grid, 1, 2, 1);
    grid = setCell(grid, 2, 2, 1);
    grid = setCell(grid, 3, 2, 1);

    // Gen 1: vertical blinker at col 2
    const gen1 = step(grid);
    expect(getCell(gen1, 1, 2)).toBe(0);
    expect(getCell(gen1, 2, 1)).toBe(1);
    expect(getCell(gen1, 2, 2)).toBe(1);
    expect(getCell(gen1, 2, 3)).toBe(1);
    expect(getCell(gen1, 3, 2)).toBe(0);

    // Gen 2: back to horizontal
    const gen2 = step(gen1);
    expect(getCell(gen2, 1, 2)).toBe(1);
    expect(getCell(gen2, 2, 2)).toBe(1);
    expect(getCell(gen2, 3, 2)).toBe(1);
    expect(getCell(gen2, 2, 1)).toBe(0);
    expect(getCell(gen2, 2, 3)).toBe(0);
  });
});

describe('Glider spaceship', () => {
  it('translates by (+1, +1) every 4 steps', () => {
    // Canonical glider: (1,0), (2,1), (0,2), (1,2), (2,2)
    let grid = createGrid(10, 10);
    grid = setCell(grid, 1, 0, 1);
    grid = setCell(grid, 2, 1, 1);
    grid = setCell(grid, 0, 2, 1);
    grid = setCell(grid, 1, 2, 1);
    grid = setCell(grid, 2, 2, 1);

    // Apply 4 steps
    let result = grid;
    for (let i = 0; i < 4; i++) {
      result = step(result);
    }

    // Expected: translated by (+1, +1) → (2,1), (3,2), (1,3), (2,3), (3,3)
    const expectedAlive = [
      [2, 1],
      [3, 2],
      [1, 3],
      [2, 3],
      [3, 3],
    ];

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const shouldBeAlive = expectedAlive.some(([ex, ey]) => ex === x && ey === y);
        expect(getCell(result, x, y)).toBe(shouldBeAlive ? 1 : 0);
      }
    }
  });
});

describe('Determinism', () => {
  it('100 independent step() calls on same input produce identical output', () => {
    // Create a non-trivial grid
    let grid = createGrid(10, 10);
    grid = setCell(grid, 1, 0, 1);
    grid = setCell(grid, 2, 1, 1);
    grid = setCell(grid, 0, 2, 1);
    grid = setCell(grid, 1, 2, 1);
    grid = setCell(grid, 2, 2, 1);
    grid = setCell(grid, 5, 5, 1);
    grid = setCell(grid, 6, 5, 1);
    grid = setCell(grid, 5, 6, 1);
    grid = setCell(grid, 6, 6, 1);

    const results: Uint8Array[] = [];
    for (let i = 0; i < 100; i++) {
      const copy = cloneGrid(grid);
      results.push(step(copy).cells);
    }

    const reference = results[0];
    for (let i = 1; i < 100; i++) {
      expect(results[i]).toEqual(reference);
    }
  });
});
