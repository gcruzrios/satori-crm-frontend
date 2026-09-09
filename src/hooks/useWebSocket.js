import { useEffect, useRef, useState } from 'react';

const WS_BASE = import.meta.env.VITE_WS_URL || '';

/**
 * Native WebSocket wrapper (spec §12). The socket only triggers cache
 * invalidation upstream — it never writes into the query cache directly.
 *
 * Usage:
 *   const socket = useWebSocket('/notifications', { token });
 *   useEffect(() => socket.on('new_notification', handler), [socket]);
 *
 * Degrades silently (with capped backoff) when the server has no WS endpoint.
 */
export function useWebSocket(path, { token, enabled = true } = {}) {
  const [connected, setConnected] = useState(false);
  const listeners = useRef(new Map()); // event -> Set<fn>
  const wsRef = useRef(null);
  const attemptsRef = useRef(0);
  const closedByUs = useRef(false);

  useEffect(() => {
    if (!enabled || !WS_BASE || !token) return undefined;
    closedByUs.current = false;
    let retryTimer;

    const url = () => {
      const base = `${WS_BASE}${path}`.replace(/([^:])\/\/+/g, '$1/');
      return `${base}${base.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;
    };

    const connect = () => {
      let ws;
      try {
        ws = new WebSocket(url());
      } catch {
        scheduleRetry();
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => {
        attemptsRef.current = 0;
        setConnected(true);
      };
      ws.onclose = () => {
        setConnected(false);
        if (!closedByUs.current) scheduleRetry();
      };
      ws.onerror = () => ws.close();
      ws.onmessage = (event) => {
        let msg;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }
        const type = msg?.type ?? msg?.event;
        emit('message', msg);
        if (type) emit(type, msg?.data ?? msg?.payload ?? msg);
      };
    };

    const scheduleRetry = () => {
      const n = (attemptsRef.current = Math.min(attemptsRef.current + 1, 6));
      // 2s, 4s, 8s ... capped at ~60s. Stop trying after too many failures.
      if (n > 6) return;
      retryTimer = setTimeout(connect, Math.min(1000 * 2 ** n, 60_000));
    };

    const emit = (event, payload) => {
      listeners.current.get(event)?.forEach((fn) => {
        try {
          fn(payload);
        } catch (err) {
          console.error('[useWebSocket] listener error', err);
        }
      });
    };

    connect();

    return () => {
      closedByUs.current = true;
      clearTimeout(retryTimer);
      wsRef.current?.close();
      wsRef.current = null;
      setConnected(false);
    };
  }, [path, token, enabled]);

  // Stable API object — `connected` is a plain field refreshed each render.
  const apiRef = useRef(null);
  if (apiRef.current === null) {
    apiRef.current = {
      connected: false,
      on(event, fn) {
        if (!listeners.current.has(event)) listeners.current.set(event, new Set());
        listeners.current.get(event).add(fn);
        return () => listeners.current.get(event)?.delete(fn);
      },
      send(data) {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(typeof data === 'string' ? data : JSON.stringify(data));
        }
      },
    };
  }
  apiRef.current.connected = connected;

  return apiRef.current;
}
