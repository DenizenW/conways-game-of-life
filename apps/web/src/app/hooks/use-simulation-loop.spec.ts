import { renderHook } from '@testing-library/react';
import { useSimulationLoop } from './use-simulation-loop';

describe('useSimulationLoop', () => {
  let rafCallbacks: Map<number, FrameRequestCallback>;
  let nextRafId: number;
  let originalRAF: typeof requestAnimationFrame;
  let originalCAF: typeof cancelAnimationFrame;

  beforeEach(() => {
    rafCallbacks = new Map();
    nextRafId = 1;
    originalRAF = globalThis.requestAnimationFrame;
    originalCAF = globalThis.cancelAnimationFrame;

    globalThis.requestAnimationFrame = jest.fn((cb: FrameRequestCallback) => {
      const id = nextRafId++;
      rafCallbacks.set(id, cb);
      return id;
    }) as unknown as typeof requestAnimationFrame;

    globalThis.cancelAnimationFrame = jest.fn((id: number) => {
      rafCallbacks.delete(id);
    });

    jest.spyOn(performance, 'now').mockReturnValue(0);
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRAF;
    globalThis.cancelAnimationFrame = originalCAF;
    jest.restoreAllMocks();
  });

  function flushRAF(time: number) {
    const callbacks = Array.from(rafCallbacks.entries());
    for (const [id, cb] of callbacks) {
      rafCallbacks.delete(id);
      cb(time);
    }
  }

  it('starts the rAF loop when running is true', () => {
    const step = jest.fn();
    renderHook(() => useSimulationLoop({ running: true, genPerSec: 10, step }));
    expect(globalThis.requestAnimationFrame).toHaveBeenCalled();
  });

  it('does not start the loop when running is false', () => {
    const step = jest.fn();
    renderHook(() => useSimulationLoop({ running: false, genPerSec: 10, step }));
    expect(globalThis.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it('calls step after enough time has elapsed for one tick', () => {
    const step = jest.fn();
    renderHook(() => useSimulationLoop({ running: true, genPerSec: 10, step }));

    // 10 gen/sec → 100ms per tick. Flush at 100ms should trigger one step.
    flushRAF(100);
    expect(step).toHaveBeenCalledTimes(1);
  });

  it('does not call step before a full tick interval elapses', () => {
    const step = jest.fn();
    renderHook(() => useSimulationLoop({ running: true, genPerSec: 10, step }));

    flushRAF(50);
    expect(step).not.toHaveBeenCalled();
  });

  it('cancels animation frame on unmount', () => {
    const step = jest.fn();
    const { unmount } = renderHook(() =>
      useSimulationLoop({ running: true, genPerSec: 10, step })
    );

    unmount();
    expect(globalThis.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('does not restart the loop when genPerSec changes (ref-fresh read)', () => {
    const step = jest.fn();
    const { rerender } = renderHook(
      ({ genPerSec }) =>
        useSimulationLoop({ running: true, genPerSec, step }),
      { initialProps: { genPerSec: 10 } }
    );

    const rafCallCountBefore = (
      globalThis.requestAnimationFrame as jest.Mock
    ).mock.calls.length;

    rerender({ genPerSec: 30 });

    // cancelAnimationFrame should NOT have been called (no teardown)
    expect(globalThis.cancelAnimationFrame).not.toHaveBeenCalled();
    // No additional rAF calls from re-setup — existing loop continues
    expect(
      (globalThis.requestAnimationFrame as jest.Mock).mock.calls.length
    ).toBe(rafCallCountBefore);
  });
});
