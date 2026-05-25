import { memo } from 'react';

interface SpeedSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default memo(function SpeedSlider({ value, onChange }: SpeedSliderProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-neutral-400">
        Speed: {value} gen/s
      </label>
      <input
        type="range"
        min={1}
        max={60}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Generations per second"
        aria-valuemin={1}
        aria-valuemax={60}
        aria-valuenow={value}
        className="w-full accent-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded"
      />
    </div>
  );
});
