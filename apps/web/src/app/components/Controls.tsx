interface ControlsProps {
  running: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onClear: () => void;
  onRandomize: () => void;
}

const btnBase =
  'rounded px-4 py-2 text-sm font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-colors';

export default function Controls({
  running,
  onPlay,
  onPause,
  onStep,
  onClear,
  onRandomize,
}: ControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {running ? (
        <button
          className={btnBase}
          onClick={onPause}
          aria-label="Pause simulation"
        >
          ⏸ Pause
        </button>
      ) : (
        <button
          className={btnBase}
          onClick={onPlay}
          aria-label="Play simulation"
        >
          ▶ Play
        </button>
      )}

      <button
        className={`${btnBase} ${running ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={onStep}
        disabled={running}
        aria-label="Step one generation"
      >
        ⏭ Step
      </button>

      <button
        className={btnBase}
        onClick={onClear}
        aria-label="Clear grid"
      >
        ✕ Clear
      </button>

      <button
        className={btnBase}
        onClick={onRandomize}
        aria-label="Randomize grid"
      >
        🎲 Randomize
      </button>
    </div>
  );
}
