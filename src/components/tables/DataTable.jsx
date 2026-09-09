import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { Card } from '@/components/ui/card';

/**
 * Reusable table that collapses to cards below Tailwind's `md` breakpoint
 * (spec §6). One column definition drives both layouts.
 *
 * column = {
 *   key: string,
 *   header: string,
 *   cell: (row) => ReactNode,
 *   accessor?: (row) => any,      // primitive value; enables `autoHideEmpty`
 *   align?: 'left'|'right'|'center',
 *   className?: string,           // <td>/<th> extra classes
 *   headerClassName?: string,
 *   primary?: boolean,            // card title on mobile
 *   actions?: boolean,           // rendered without a label on the card
 *   alwaysShow?: boolean,        // never auto-hidden even if empty
 *   hideOnMobile?: boolean,
 * }
 *
 * `autoHideEmpty`: while the API returns a trimmed projection (no email / phone /
 * industry on list rows), drop columns whose `accessor` is empty for every row
 * so the table shows only real data. Columns reappear automatically once the
 * backend fills those fields.
 */
export function DataTable({
  columns: allColumns,
  rows,
  getRowId = (r) => r.id,
  onRowClick,
  isLoading,
  error,
  onRetry,
  autoHideEmpty = false,
  emptyTitle = 'Sin resultados',
  emptyDescription,
  emptyAction,
  emptyIcon,
  className,
  caption,
}) {
  const isMobile = useIsMobile();

  if (isLoading) return <LoadingState rows={6} />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;

  const columns =
    autoHideEmpty && rows?.length
      ? allColumns.filter((c) => {
          if (c.alwaysShow || c.primary || c.actions || !c.accessor) return true;
          return rows.some((row) => {
            const v = c.accessor(row);
            return v !== null && v !== undefined && v !== '';
          });
        })
      : allColumns;

  if (!rows?.length)
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        icon={emptyIcon}
      />
    );

  if (isMobile) {
    const primary = columns.find((c) => c.primary) ?? columns[0];
    const actionCols = columns.filter((c) => c.actions);
    const detailCols = columns.filter(
      (c) => c !== primary && !c.actions && !c.hideOnMobile,
    );
    return (
      <div className={cn('space-y-3', className)}>
        {rows.map((row) => (
          <Card
            key={getRowId(row)}
            className={cn('p-4', onRowClick && 'cursor-pointer active:bg-gray-50 dark:active:bg-white/[0.02]')}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 text-theme-sm font-medium text-gray-800 dark:text-white/90">
                {primary.cell(row)}
              </div>
              {actionCols.map((c) => (
                <div key={c.key} onClick={(e) => e.stopPropagation()}>
                  {c.cell(row)}
                </div>
              ))}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
              {detailCols.map((c) => (
                <div key={c.key} className="min-w-0">
                  <dt className="text-theme-xs text-gray-400">{c.header}</dt>
                  <dd className="truncate text-theme-sm text-gray-700 dark:text-gray-300">
                    {c.cell(row)}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="min-w-full">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-y border-gray-100 dark:border-gray-800">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cn(
                  'px-4 py-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400',
                  c.align === 'right' && 'text-right',
                  c.align === 'center' && 'text-center',
                  c.headerClassName,
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map((row) => (
            <tr
              key={getRowId(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'transition-colors',
                onRowClick &&
                  'cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]',
              )}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    'px-4 py-3 text-theme-sm text-gray-700 dark:text-gray-300',
                    c.align === 'right' && 'text-right',
                    c.align === 'center' && 'text-center',
                    c.className,
                  )}
                  onClick={c.actions ? (e) => e.stopPropagation() : undefined}
                >
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
