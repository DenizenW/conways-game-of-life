'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { clearGrid, createGrid, randomizeGrid, step, toggleCell, type Grid } from '@conways-game-of-life/sim';
import Canvas from './components/Canvas';
import Controls from './components/Controls';
import GridSizeForm from './components/GridSizeForm';
import { useSimulationLoop } from './hooks/use-simulation-loop';

const DEFAULT_WIDTH = 30;
const DEFAULT_HEIGHT = 30;

interface State {
  grid: Grid;
  genCount: number;
  running: boolean;
  dimensions: { width: number; height: number };
}

const DEFAULT_GEN_PER_SEC = 10;

type Action =
  | { type: 'SET_DIMENSIONS'; width: number; height: number }
  | { type: 'RESET' }
  | { type: 'TICK' }
  | { type: 'TOGGLE_CELL'; x: number; y: number }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'STEP' }
  | { type: 'CLEAR' }
  | { type: 'RANDOMIZE' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_DIMENSIONS':
      return {
        ...state,
        grid: createGrid(action.width, action.height),
        genCount: 0,
        running: false,
        dimensions: { width: action.width, height: action.height },
      };
    case 'RESET':
      return {
        ...state,
        grid: createGrid(state.dimensions.width, state.dimensions.height),
        genCount: 0,
        running: false,
      };
    case 'TICK':
      return {
        ...state,
        grid: step(state.grid),
        genCount: state.genCount + 1,
      };
    case 'TOGGLE_CELL':
      return {
        ...state,
        grid: toggleCell(state.grid, action.x, action.y),
      };
    case 'PLAY':
      return { ...state, running: true };
    case 'PAUSE':
      return { ...state, running: false };
    case 'STEP':
      if (state.running) return state;
      return {
        ...state,
        grid: step(state.grid),
        genCount: state.genCount + 1,
      };
    case 'CLEAR':
      return {
        ...state,
        grid: clearGrid(state.grid),
        genCount: 0,
        running: false,
      };
    case 'RANDOMIZE':
      return {
        ...state,
        grid: randomizeGrid(state.grid),
        genCount: 0,
        running: false,
      };
    default:
      return state;
  }
}

function initState(): State {
  return {
    grid: createGrid(DEFAULT_WIDTH, DEFAULT_HEIGHT),
    genCount: 0,
    running: false,
    dimensions: { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT },
  };
}

export default function SimulationPage() {
  const [state, dispatch] = useReducer(reducer, undefined, initState);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const [windowHeight, setWindowHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 600
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxHeight = windowHeight - 80;
  const cellSize =
    containerWidth > 0
      ? Math.max(1, Math.min(
          Math.floor(containerWidth / state.grid.width),
          Math.floor(maxHeight / state.grid.height)
        ))
      : 10;

  const handleTick = useCallback(() => {
    dispatch({ type: 'TICK' });
  }, []);

  useSimulationLoop({
    running: state.running,
    genPerSec: DEFAULT_GEN_PER_SEC,
    step: handleTick,
  });

  const handlePlay = useCallback(() => {
    dispatch({ type: 'PLAY' });
  }, []);

  const handlePause = useCallback(() => {
    dispatch({ type: 'PAUSE' });
  }, []);

  const handleStep = useCallback(() => {
    dispatch({ type: 'STEP' });
  }, []);

  const handleClear = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const handleRandomize = useCallback(() => {
    dispatch({ type: 'RANDOMIZE' });
  }, []);

  const handleCellToggle = useCallback(
    (x: number, y: number) => {
      if (state.running) return;
      dispatch({ type: 'TOGGLE_CELL', x, y });
    },
    [state.running]
  );

  const handleResize = useCallback(
    (width: number, height: number) => {
      dispatch({ type: 'SET_DIMENSIONS', width, height });
    },
    []
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4">
      <div className="mx-auto max-w-6xl flex flex-col lg:flex-row gap-6">
        <div ref={containerRef} className={`flex-1 min-w-0 ${state.running ? 'cursor-default' : 'cursor-pointer'}`}>
          <Canvas grid={state.grid} cellSize={cellSize} onCellToggle={handleCellToggle} />
        </div>

        <div className="lg:w-72 flex flex-col gap-4">
          <h1 className="text-xl font-semibold">Conway&apos;s Game of Life</h1>

          <div
            data-testid="gen-count"
            className="text-sm text-neutral-400"
          >
            Generation: {state.genCount}
          </div>

          <Controls
            running={state.running}
            onPlay={handlePlay}
            onPause={handlePause}
            onStep={handleStep}
            onClear={handleClear}
            onRandomize={handleRandomize}
          />

          <GridSizeForm
            currentWidth={state.dimensions.width}
            currentHeight={state.dimensions.height}
            onResize={handleResize}
          />
        </div>
      </div>
    </div>
  );
}
