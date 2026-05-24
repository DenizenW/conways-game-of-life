import { createGrid, cloneGrid, getCell, setCell, toggleCell, clearGrid } from './grid';

describe('createGrid', () => {
  it('produces cells.length === w * h, all zero', () => {
    const g = createGrid(5, 3);
    expect(g.width).toBe(5);
    expect(g.height).toBe(3);
    expect(g.cells).toHaveLength(15);
    expect(g.cells.every((c) => c === 0)).toBe(true);
  });

  it('handles 1x1 grid', () => {
    const g = createGrid(1, 1);
    expect(g.cells).toHaveLength(1);
    expect(g.cells[0]).toBe(0);
  });

  it('handles 0-dimension grid', () => {
    const g = createGrid(0, 5);
    expect(g.cells).toHaveLength(0);
  });

  it('throws RangeError on negative dimensions', () => {
    expect(() => createGrid(-1, 5)).toThrow(RangeError);
    expect(() => createGrid(5, -1)).toThrow(RangeError);
  });

  it('throws RangeError on non-integer dimensions', () => {
    expect(() => createGrid(2.5, 3)).toThrow(RangeError);
    expect(() => createGrid(3, 2.5)).toThrow(RangeError);
  });
});

describe('setCell', () => {
  it('flips exactly the indexed cell, leaves all others unchanged', () => {
    const g = createGrid(3, 3);
    const g2 = setCell(g, 1, 2, 1);

    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        if (x === 1 && y === 2) {
          expect(getCell(g2, x, y)).toBe(1);
        } else {
          expect(getCell(g2, x, y)).toBe(0);
        }
      }
    }
  });

  it('can set a cell back to dead', () => {
    const g = setCell(createGrid(3, 3), 0, 0, 1);
    const g2 = setCell(g, 0, 0, 0);
    expect(getCell(g2, 0, 0)).toBe(0);
  });

  it('throws RangeError on out-of-bounds coordinates', () => {
    const g = createGrid(3, 3);
    expect(() => setCell(g, -1, 0, 1)).toThrow(RangeError);
    expect(() => setCell(g, 0, -1, 1)).toThrow(RangeError);
    expect(() => setCell(g, 3, 0, 1)).toThrow(RangeError);
    expect(() => setCell(g, 0, 3, 1)).toThrow(RangeError);
  });

  it('throws RangeError on non-integer coordinates', () => {
    const g = createGrid(3, 3);
    expect(() => setCell(g, 1.5, 0, 1)).toThrow(RangeError);
    expect(() => setCell(g, 0, 1.5, 1)).toThrow(RangeError);
  });
});

describe('toggleCell', () => {
  it('is its own inverse (toggle twice = original)', () => {
    const g = createGrid(4, 4);
    const toggled = toggleCell(g, 2, 3);
    expect(getCell(toggled, 2, 3)).toBe(1);

    const toggledBack = toggleCell(toggled, 2, 3);
    expect(getCell(toggledBack, 2, 3)).toBe(0);
    expect(toggledBack.cells).toEqual(g.cells);
  });

  it('throws RangeError on out-of-bounds coordinates', () => {
    const g = createGrid(3, 3);
    expect(() => toggleCell(g, 3, 0)).toThrow(RangeError);
    expect(() => toggleCell(g, 0, -1)).toThrow(RangeError);
  });
});

describe('clearGrid', () => {
  it('zeroes every cell on a grid with some alive cells', () => {
    let g = createGrid(3, 3);
    g = setCell(g, 0, 0, 1);
    g = setCell(g, 1, 1, 1);
    g = setCell(g, 2, 2, 1);

    const cleared = clearGrid(g);
    expect(cleared.width).toBe(3);
    expect(cleared.height).toBe(3);
    expect(cleared.cells.every((c) => c === 0)).toBe(true);
  });
});

describe('cloneGrid', () => {
  it('returns deep-equal but reference-distinct grid', () => {
    let g = createGrid(3, 3);
    g = setCell(g, 1, 1, 1);

    const c = cloneGrid(g);
    expect(c.width).toBe(g.width);
    expect(c.height).toBe(g.height);
    expect(c.cells).toEqual(g.cells);
    expect(c.cells).not.toBe(g.cells);
    expect(c).not.toBe(g);
  });
});

describe('getCell out-of-bounds', () => {
  it('returns 0 for negative x', () => {
    expect(getCell(createGrid(3, 3), -1, 0)).toBe(0);
  });

  it('returns 0 for negative y', () => {
    expect(getCell(createGrid(3, 3), 0, -1)).toBe(0);
  });

  it('returns 0 for x beyond width', () => {
    expect(getCell(createGrid(3, 3), 3, 0)).toBe(0);
  });

  it('returns 0 for y beyond height', () => {
    expect(getCell(createGrid(3, 3), 0, 3)).toBe(0);
  });

  it('returns 0 for both coords far out of range', () => {
    expect(getCell(createGrid(3, 3), 100, 100)).toBe(0);
  });
});

describe('immutability', () => {
  it('setCell does not mutate the original grid cells', () => {
    const g = createGrid(3, 3);
    const original = new Uint8Array(g.cells);
    setCell(g, 1, 1, 1);
    expect(g.cells).toEqual(original);
  });

  it('toggleCell does not mutate the original grid cells', () => {
    const g = createGrid(3, 3);
    const original = new Uint8Array(g.cells);
    toggleCell(g, 1, 1);
    expect(g.cells).toEqual(original);
  });

  it('clearGrid does not mutate the original grid cells', () => {
    let g = createGrid(3, 3);
    g = setCell(g, 0, 0, 1);
    const original = new Uint8Array(g.cells);
    clearGrid(g);
    expect(g.cells).toEqual(original);
  });
});
