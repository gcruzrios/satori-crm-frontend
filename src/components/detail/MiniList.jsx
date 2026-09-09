import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';

/**
 * Compact list of related records for a detail sidebar/section.
 * `rows` = [{ id, to, title, meta?, right? }]
 */
export function MiniList({ query, rows, emptyTitle = 'Sin registros', emptyDescription }) {
  if (query?.isLoading) return <LoadingState rows={2} />;
  if (query?.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (!rows?.length)
    return <EmptyState title={emptyTitle} description={emptyDescription} />;

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {rows.map((r) => (
        <li key={r.id}>
          <Link
            to={r.to}
            className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-brand-500"
          >
            <span className="min-w-0">
              <span className="block truncate text-theme-sm font-medium text-gray-800 dark:text-white/90">
                {r.title}
              </span>
              {r.meta && (
                <span className="block truncate text-theme-xs text-gray-500 dark:text-gray-400">
                  {r.meta}
                </span>
              )}
            </span>
            <span className="flex shrink-0 items-center gap-2">
              {r.right}
              <ChevronRight className="size-4 text-gray-300" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
