import { CheckCircle2, Circle } from 'lucide-react';
import { cn, formatDateTime, fromNow } from '@/lib/utils';
import {
  ACTIVITY_TYPE_OPTIONS,
  ACTIVITY_STATUS_OPTIONS,
  COMM_CHANNEL_OPTIONS,
  COMM_DIRECTION_OPTIONS,
} from '@/lib/constants';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { useCompleteActivity } from '@/features/activities/hooks';

export function RelatedActivities({ query, canComplete }) {
  const complete = useCompleteActivity();
  if (query.isLoading) return <LoadingState rows={3} />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (!query.items.length)
    return <EmptyState title="Sin actividades" description="No hay actividades vinculadas." />;

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {query.items.map((a) => {
        const done = a.status === 'completed';
        return (
          <li key={a.id} className="flex items-start gap-3 py-3">
            <button
              type="button"
              disabled={done || !canComplete}
              onClick={() => complete.mutate(a.id)}
              className="mt-0.5 text-gray-300 enabled:hover:text-success-500 disabled:opacity-60"
              aria-label={done ? 'Completada' : 'Marcar como completada'}
            >
              {done ? (
                <CheckCircle2 className="size-5 text-success-500" />
              ) : (
                <Circle className="size-5" />
              )}
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'text-theme-sm font-medium text-gray-800 dark:text-white/90',
                    done && 'text-gray-400 line-through',
                  )}
                >
                  {a.title}
                </span>
                <StatusBadge value={a.type} options={ACTIVITY_TYPE_OPTIONS} />
                <StatusBadge value={a.status} options={ACTIVITY_STATUS_OPTIONS} />
              </div>
              {a.description && (
                <p className="mt-0.5 text-theme-sm text-gray-500 dark:text-gray-400">
                  {a.description}
                </p>
              )}
              <p className="mt-0.5 text-theme-xs text-gray-400">
                {a.due_at ? `Vence ${formatDateTime(a.due_at)}` : fromNow(a.created_at)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function RelatedCommunications({ query }) {
  if (query.isLoading) return <LoadingState rows={3} />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (!query.items.length)
    return <EmptyState title="Sin comunicaciones" description="No hay mensajes vinculados." />;

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {query.items.map((c) => (
        <li key={c.id} className="py-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={c.channel} options={COMM_CHANNEL_OPTIONS} />
            <StatusBadge value={c.direction} options={COMM_DIRECTION_OPTIONS} />
            {c.subject && (
              <span className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                {c.subject}
              </span>
            )}
            <span className="ml-auto text-theme-xs text-gray-400">
              {formatDateTime(c.created_at || c.sent_at)}
            </span>
          </div>
          {c.body && (
            <p className="mt-1 whitespace-pre-line text-theme-sm text-gray-600 dark:text-gray-300">
              {c.body}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
