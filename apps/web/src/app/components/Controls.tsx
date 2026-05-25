interface ControlsProps {
  running: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
}

const btnBase =
  'rounded px-4 py-2 text-sm font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-colors';

export default function Controls({
  running,
  onPlay,
  onPause,
  onStep,
}: ControlsProps) {
  return (
    <div className="flex gap-2">
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
    </div>
  );
}
