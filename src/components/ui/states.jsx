import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api';
import { Button } from './button';
import { Spinner } from './spinner';
import { Skeleton } from './skeleton';

/** Loading state (spec §21 DoD: not just the happy path). */
export function LoadingState({ label = 'Cargando…', className, rows = 0 }) {
  if (rows > 0) {
    return (
      <div className={cn('space-y-3', className)} aria-busy="true">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 text-gray-500 dark:text-gray-400',
        className,
      )}
    >
      <Spinner className="size-6" />
      <p className="text-theme-sm">{label}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title = 'Sin resultados',
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 px-6 py-14 text-center dark:border-gray-800',
        className,
      )}
    >
      <span className="mb-1 flex size-12 items-center justify-center rounded-xl bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        <Icon className="size-6" />
      </span>
      <h3 className="text-theme-sm font-semibold text-gray-800 dark:text-white/90">
        {title}
      </h3>
      {description && (
        <p className="max-w-sm text-theme-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry, className, title = 'No se pudieron cargar los datos' }) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-2xl border border-error-100 bg-error-25 px-6 py-14 text-center dark:border-error-500/30 dark:bg-error-500/5',
        className,
      )}
    >
      <span className="mb-1 flex size-12 items-center justify-center rounded-xl bg-error-50 text-error-500 dark:bg-error-500/15">
        <AlertTriangle className="size-6" />
      </span>
      <h3 className="text-theme-sm font-semibold text-gray-800 dark:text-white/90">
        {title}
      </h3>
      <p className="max-w-sm text-theme-sm text-gray-500 dark:text-gray-400">
        {getErrorMessage(error)}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
          <RefreshCw className="size-4" />
          Reintentar
        </Button>
      )}
    </div>
  );
}

/**
 * Convenience: render the right state for a react-query result, else children.
 */
export function QueryBoundary({
  query,
  children,
  loading,
  empty,
  isEmpty,
  errorTitle,
}) {
  if (query.isLoading) return loading ?? <LoadingState />;
  if (query.isError)
    return <ErrorState error={query.error} onRetry={query.refetch} title={errorTitle} />;
  if (isEmpty?.(query.data)) return empty ?? <EmptyState />;
  return typeof children === 'function' ? children(query.data) : children;
}
