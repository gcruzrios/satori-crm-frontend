import { useCallback, useEffect, useRef, useState } from 'react';

const ACTIVITY_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
];

/**
 * Auto-logout on inactivity (spec §2).
 *
 * @param {object}   opts
 * @param {number}   opts.timeoutMs   idle time before onIdle fires
 * @param {number}   [opts.warningMs] idle time before onWarn fires (< timeoutMs)
 * @param {() => void} opts.onIdle
 * @param {() => void} [opts.onWarn]
 * @param {boolean}  [opts.enabled=true]
 * @returns {{ warning: boolean, continueSession: () => void }}
 */
export function useIdleTimer({
  timeoutMs,
  warningMs,
  onIdle,
  onWarn,
  enabled = true,
}) {
  const [warning, setWarning] = useState(false);

  const warnTimer = useRef(null);
  const idleTimer = useRef(null);
  const warningRef = useRef(false);
  const cbs = useRef({ onIdle, onWarn });
  cbs.current = { onIdle, onWarn };

  const clearTimers = useCallback(() => {
    clearTimeout(warnTimer.current);
    clearTimeout(idleTimer.current);
  }, []);

  const setWarn = useCallback((next) => {
    warningRef.current = next;
    setWarning(next);
  }, []);

  const schedule = useCallback(() => {
    clearTimers();
    setWarn(false);
    if (warningMs && warningMs < timeoutMs) {
      warnTimer.current = setTimeout(() => {
        setWarn(true);
        cbs.current.onWarn?.();
      }, warningMs);
    }
    idleTimer.current = setTimeout(() => {
      setWarn(false);
      cbs.current.onIdle?.();
    }, timeoutMs);
  }, [clearTimers, setWarn, timeoutMs, warningMs]);

  const continueSession = useCallback(() => schedule(), [schedule]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      setWarn(false);
      return undefined;
    }

    schedule();

    const onActivity = () => {
      // While the warning modal is open, ambient events must NOT silently keep
      // the session alive — only an explicit "seguir conectado" (continueSession).
      if (warningRef.current) return;
      schedule();
    };

    ACTIVITY_EVENTS.forEach((e) =>
      window.addEventListener(e, onActivity, { passive: true }),
    );
    document.addEventListener('visibilitychange', onActivity);

    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener('visibilitychange', onActivity);
      clearTimers();
    };
  }, [enabled, schedule, clearTimers, setWarn]);

  return { warning, continueSession };
}
