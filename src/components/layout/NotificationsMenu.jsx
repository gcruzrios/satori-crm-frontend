import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { fromNow } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  isUnread,
} from '@/features/notifications/api';

export function NotificationsMenu() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', { unread: false, page: 1 }],
    queryFn: () => listNotifications({ page: 1, pageSize: 20 }),
    refetchInterval: 60_000, // polling fallback if the WS is down (spec §12)
  });

  const items = data?.items ?? [];
  const unread = items.filter(isUnread);

  const readOne = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
  const readAll = useMutation({
    mutationFn: () => markAllNotificationsRead(unread.map((n) => n.id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex size-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label={`Notificaciones${unread.length ? ` (${unread.length} sin leer)` : ''}`}
        >
          <Bell className="size-5" />
          {unread.length > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-orange-500" />
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <p className="text-theme-sm font-semibold text-gray-800 dark:text-white/90">
            Notificaciones
          </p>
          {unread.length > 0 && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={() => readAll.mutate()}
              loading={readAll.isPending}
            >
              <CheckCheck className="size-4" />
              Marcar todas
            </Button>
          )}
        </div>
        <div className="custom-scrollbar max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : items.length === 0 ? (
            <p className="px-4 py-8 text-center text-theme-sm text-gray-500 dark:text-gray-400">
              No tienes notificaciones.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => isUnread(n) && readOne.mutate(n.id)}
                    className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    <span
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${
                        isUnread(n) ? 'bg-brand-500' : 'bg-transparent'
                      }`}
                    />
                    <span className="min-w-0">
                      <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">
                        {n.title}
                      </span>
                      {n.body && (
                        <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
                          {n.body}
                        </span>
                      )}
                      <span className="mt-0.5 block text-theme-xs text-gray-400">
                        {fromNow(n.created_at)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
