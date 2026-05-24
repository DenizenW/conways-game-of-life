import { useEffect, useRef } from 'react';

export function useSimulationLoop(opts: {
  running: boolean;
  genPerSec: number;
  step: () => void;
}) {
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);
  const genPerSecRef = useRef(opts.genPerSec);
  genPerSecRef.current = opts.genPerSec;

  useEffect(() => {
    if (!opts.running) return;
    lastTimeRef.current = performance.now();
    accumulatorRef.current = 0;

    const tick = (now: number) => {
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;
      accumulatorRef.current += dt;
      const tickInterval = 1000 / genPerSecRef.current;
      while (accumulatorRef.current >= tickInterval) {
        opts.step();
        accumulatorRef.current -= tickInterval;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [opts.running, opts.step]);
}
