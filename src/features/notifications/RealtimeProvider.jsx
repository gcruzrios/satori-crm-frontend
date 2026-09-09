import { createContext, useContext, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { toast } from '@/components/ui/toast';

const RealtimeContext = createContext({ connected: false });

/**
 * Bridges the notifications WebSocket to TanStack Query (spec §12): the socket
 * ONLY invalidates queries — it never writes into the cache directly.
 */
export function RealtimeProvider({ children }) {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const socket = useWebSocket('/notifications', {
    token: accessToken,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    const offs = [
      socket.on('new_notification', (payload) => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        if (payload?.title) {
          toast(payload.title, { description: payload.body ?? undefined });
        }
      }),
      socket.on('new_communication', () => {
        queryClient.invalidateQueries({ queryKey: ['communications'] });
      }),
      socket.on('entity_updated', (payload) => {
        if (payload?.entity_type) {
          queryClient.invalidateQueries({ queryKey: [payload.entity_type] });
        }
      }),
    ];
    return () => offs.forEach((off) => off?.());
  }, [socket, queryClient]);

  return (
    <RealtimeContext.Provider value={{ connected: socket.connected }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
