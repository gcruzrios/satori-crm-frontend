import { act, renderHook } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { useIdleTimer } from '../useIdleTimer';

describe('useIdleTimer', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('fires onWarn then onIdle after the configured delays', () => {
    const onWarn = vi.fn();
    const onIdle = vi.fn();
    renderHook(() =>
      useIdleTimer({ timeoutMs: 1000, warningMs: 600, onWarn, onIdle }),
    );

    act(() => vi.advanceTimersByTime(600));
    expect(onWarn).toHaveBeenCalledTimes(1);
    expect(onIdle).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(400));
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it('does not fire when disabled', () => {
    const onIdle = vi.fn();
    renderHook(() =>
      useIdleTimer({ timeoutMs: 1000, warningMs: 600, onIdle, enabled: false }),
    );
    act(() => vi.advanceTimersByTime(5000));
    expect(onIdle).not.toHaveBeenCalled();
  });

  it('resets the countdown on user activity', () => {
    const onIdle = vi.fn();
    renderHook(() => useIdleTimer({ timeoutMs: 1000, warningMs: 600, onIdle }));

    act(() => vi.advanceTimersByTime(500));
    act(() => window.dispatchEvent(new Event('mousedown')));
    act(() => vi.advanceTimersByTime(700));
    expect(onIdle).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(400));
    expect(onIdle).toHaveBeenCalledTimes(1);
  });
});
