'use client';

import { useState } from 'react';

const MIN_SIZE = 5;
const MAX_SIZE = 100;

interface GridSizeFormProps {
  currentWidth: number;
  currentHeight: number;
  onResize: (width: number, height: number) => void;
}

function validate(value: string): string | null {
  if (value.trim() === '') return 'Required';
  const num = Number(value);
  if (!Number.isFinite(num) || !Number.isInteger(num)) return 'Must be an integer';
  if (num < MIN_SIZE) return `Min ${MIN_SIZE}`;
  if (num > MAX_SIZE) return `Max ${MAX_SIZE}`;
  return null;
}

export default function GridSizeForm({
  currentWidth,
  currentHeight,
  onResize,
}: GridSizeFormProps) {
  const [width, setWidth] = useState(String(currentWidth));
  const [height, setHeight] = useState(String(currentHeight));
  const [widthError, setWidthError] = useState<string | null>(null);
  const [heightError, setHeightError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const wErr = validate(width);
    const hErr = validate(height);
    setWidthError(wErr);
    setHeightError(hErr);
    if (wErr || hErr) return;
    onResize(Number(width), Number(height));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col">
        <label
          htmlFor="grid-width"
          className="text-sm text-neutral-400 mb-1"
        >
          Width
        </label>
        <input
          id="grid-width"
          data-testid="grid-width"
          type="number"
          aria-label="Grid width"
          value={width}
          onChange={(e) => {
            setWidth(e.target.value);
            setWidthError(null);
          }}
          className="w-20 rounded bg-neutral-800 border border-neutral-600 px-2 py-1 text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        />
        {widthError && (
          <span className="text-xs text-red-400 mt-0.5">{widthError}</span>
        )}
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="grid-height"
          className="text-sm text-neutral-400 mb-1"
        >
          Height
        </label>
        <input
          id="grid-height"
          data-testid="grid-height"
          type="number"
          aria-label="Grid height"
          value={height}
          onChange={(e) => {
            setHeight(e.target.value);
            setHeightError(null);
          }}
          className="w-20 rounded bg-neutral-800 border border-neutral-600 px-2 py-1 text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        />
        {heightError && (
          <span className="text-xs text-red-400 mt-0.5">{heightError}</span>
        )}
      </div>

      <button
        type="submit"
        data-testid="grid-submit"
        className="rounded bg-cyan-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      >
        Resize
      </button>
    </form>
  );
}
