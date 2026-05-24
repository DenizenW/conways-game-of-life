import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Canvas from './Canvas';
import { createGrid } from '@conways-game-of-life/sim';

class MockPointerEvent extends MouseEvent {
  readonly pointerId: number;
  readonly pointerType: string;
  constructor(type: string, params: PointerEventInit & EventInit = {}) {
    super(type, { ...params, bubbles: true });
    this.pointerId = params.pointerId ?? 0;
    this.pointerType = params.pointerType ?? 'mouse';
  }
}

global.PointerEvent = MockPointerEvent as unknown as typeof PointerEvent;

function makeRect(width: number, height: number): DOMRect {
  return {
    top: 0,
    left: 0,
    width,
    height,
    right: width,
    bottom: height,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  };
}

describe('Canvas', () => {
  const grid = createGrid(10, 10);
  const cellSize = 30;

  it('calls onCellToggle with correct grid coordinates on pointerdown', () => {
    const onCellToggle = jest.fn();
    render(<Canvas grid={grid} cellSize={cellSize} onCellToggle={onCellToggle} />);
    const canvas = screen.getByTestId('canvas');
    jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(makeRect(300, 300));

    fireEvent.pointerDown(canvas, { clientX: 95, clientY: 65 });

    expect(onCellToggle).toHaveBeenCalledWith(3, 2);
  });

  it('maps first cell (0,0) correctly', () => {
    const onCellToggle = jest.fn();
    render(<Canvas grid={grid} cellSize={cellSize} onCellToggle={onCellToggle} />);
    const canvas = screen.getByTestId('canvas');
    jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(makeRect(300, 300));

    fireEvent.pointerDown(canvas, { clientX: 5, clientY: 5 });

    expect(onCellToggle).toHaveBeenCalledWith(0, 0);
  });

  it('maps last cell (9,9) correctly', () => {
    const onCellToggle = jest.fn();
    render(<Canvas grid={grid} cellSize={cellSize} onCellToggle={onCellToggle} />);
    const canvas = screen.getByTestId('canvas');
    jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(makeRect(300, 300));

    fireEvent.pointerDown(canvas, { clientX: 295, clientY: 295 });

    expect(onCellToggle).toHaveBeenCalledWith(9, 9);
  });

  it('does not call onCellToggle when pointer is outside grid bounds', () => {
    const onCellToggle = jest.fn();
    render(<Canvas grid={grid} cellSize={cellSize} onCellToggle={onCellToggle} />);
    const canvas = screen.getByTestId('canvas');
    jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(makeRect(300, 300));

    fireEvent.pointerDown(canvas, { clientX: 305, clientY: 150 });

    expect(onCellToggle).not.toHaveBeenCalled();
  });

  it('does not call onCellToggle for negative coordinates', () => {
    const onCellToggle = jest.fn();
    render(<Canvas grid={grid} cellSize={cellSize} onCellToggle={onCellToggle} />);
    const canvas = screen.getByTestId('canvas');
    jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(makeRect(300, 300));

    fireEvent.pointerDown(canvas, { clientX: -5, clientY: 150 });

    expect(onCellToggle).not.toHaveBeenCalled();
  });

  it('does not throw when onCellToggle is not provided', () => {
    render(<Canvas grid={grid} cellSize={cellSize} />);
    const canvas = screen.getByTestId('canvas');
    jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(makeRect(300, 300));

    expect(() => {
      fireEvent.pointerDown(canvas, { clientX: 50, clientY: 50 });
    }).not.toThrow();
  });

  it('handles offset canvas position via getBoundingClientRect', () => {
    const onCellToggle = jest.fn();
    render(<Canvas grid={grid} cellSize={cellSize} onCellToggle={onCellToggle} />);
    const canvas = screen.getByTestId('canvas');
    jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      left: 50,
      width: 300,
      height: 300,
      right: 350,
      bottom: 400,
      x: 50,
      y: 100,
      toJSON: () => ({}),
    });

    fireEvent.pointerDown(canvas, { clientX: 50 + 95, clientY: 100 + 65 });

    expect(onCellToggle).toHaveBeenCalledWith(3, 2);
  });
});
