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
    let grid = createGrid(3, 3);
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

    // Gen 1: vertical blinker at col 2 — verify entire grid
    const gen1 = step(grid);
    const gen1Alive = [[2, 1], [2, 2], [2, 3]];
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const expected = gen1Alive.some(([ex, ey]) => ex === x && ey === y) ? 1 : 0;
        expect(getCell(gen1, x, y)).toBe(expected);
      }
    }

    // Gen 2: back to horizontal — verify entire grid
    const gen2 = step(gen1);
    const gen2Alive = [[1, 2], [2, 2], [3, 2]];
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const expected = gen2Alive.some(([ex, ey]) => ex === x && ey === y) ? 1 : 0;
        expect(getCell(gen2, x, y)).toBe(expected);
      }
    }
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

describe('Edge cases and boundary behavior', () => {
  it('empty grid stays empty (no spontaneous life)', () => {
    const grid = createGrid(5, 5);

    const next = step(grid);

    expect(next.width).toBe(5);
    expect(next.height).toBe(5);
    expect(next.cells.every((c) => c === 0)).toBe(true);
  });

  it('3×3 all-alive: corners survive, edges and center die', () => {
    let grid = createGrid(3, 3);
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        grid = setCell(grid, x, y, 1);
      }
    }

    const next = step(grid);

    const expectedAlive = [[0, 0], [2, 0], [0, 2], [2, 2]];
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        const expected = expectedAlive.some(([ex, ey]) => ex === x && ey === y) ? 1 : 0;
        expect(getCell(next, x, y)).toBe(expected);
      }
    }
  });

  it('corner cell (0,0) on 5×5 with no neighbors dies and grid stays empty', () => {
    let grid = createGrid(5, 5);
    grid = setCell(grid, 0, 0, 1);

    const next = step(grid);

    expect(next.cells.every((c) => c === 0)).toBe(true);
  });

  it('1×1 grid single live cell dies', () => {
    let grid = createGrid(1, 1);
    grid = setCell(grid, 0, 0, 1);

    const next = step(grid);

    expect(getCell(next, 0, 0)).toBe(0);
  });

  it('non-square grid (5×1) — wide: center survives, edges die', () => {
    let grid = createGrid(5, 1);
    grid = setCell(grid, 1, 0, 1);
    grid = setCell(grid, 2, 0, 1);
    grid = setCell(grid, 3, 0, 1);

    const next = step(grid);

    for (let x = 0; x < 5; x++) {
      const expected = x === 2 ? 1 : 0;
      expect(getCell(next, x, 0)).toBe(expected);
    }
  });

  it('non-square grid (1×5) — tall: center survives, edges die', () => {
    let grid = createGrid(1, 5);
    grid = setCell(grid, 0, 1, 1);
    grid = setCell(grid, 0, 2, 1);
    grid = setCell(grid, 0, 3, 1);

    const next = step(grid);

    for (let y = 0; y < 5; y++) {
      const expected = y === 2 ? 1 : 0;
      expect(getCell(next, 0, y)).toBe(expected);
    }
  });

  it('dead corner cell (0,0) with 3 neighbors is born at grid edge', () => {
    let grid = createGrid(5, 5);
    grid = setCell(grid, 1, 0, 1);
    grid = setCell(grid, 0, 1, 1);
    grid = setCell(grid, 1, 1, 1);

    const next = step(grid);

    const expectedAlive = [[0, 0], [1, 0], [0, 1], [1, 1]];
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const expected = expectedAlive.some(([ex, ey]) => ex === x && ey === y) ? 1 : 0;
        expect(getCell(next, x, y)).toBe(expected);
      }
    }
  });
});

describe('Purity', () => {
  it('does not mutate the input grid', () => {
    let grid = createGrid(5, 5);
    grid = setCell(grid, 1, 2, 1);
    grid = setCell(grid, 2, 2, 1);
    grid = setCell(grid, 3, 2, 1);
    const originalCells = new Uint8Array(grid.cells);
    step(grid);
    expect(grid.cells).toEqual(originalCells);
  });

  it('returns a grid with a new cells buffer', () => {
    let grid = createGrid(3, 3);
    grid = setCell(grid, 1, 1, 1);
    const result = step(grid);
    expect(result.cells).not.toBe(grid.cells);
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
