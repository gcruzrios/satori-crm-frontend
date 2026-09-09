import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export function SectionCard({ title, actions, children, className, bodyClassName }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          {title && (
            <h3 className="text-theme-sm font-semibold text-gray-800 dark:text-white/90">
              {title}
            </h3>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn('px-5 py-4', bodyClassName)}>{children}</div>
    </Card>
  );
}

/**
 * Renders label/value pairs, skipping entries with no value so a detail view
 * doesn't become a wall of "—" while the API returns a trimmed object.
 * Pass `keepEmpty` on an item to force it to show as "—".
 *
 * @param {{ items: {label:string, value:React.ReactNode, full?:boolean, keepEmpty?:boolean}[] }} props
 */
export function DescriptionList({ items, columns = 2 }) {
  const visible = items.filter((i) => {
    if (!i) return false;
    if (i.keepEmpty) return true;
    return i.value !== undefined && i.value !== null && i.value !== '';
  });

  if (!visible.length) {
    return (
      <p className="text-theme-sm text-gray-400">
        Sin información adicional disponible.
      </p>
    );
  }

  return (
    <dl
      className={cn(
        'grid gap-x-6 gap-y-4',
        columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3',
      )}
    >
      {visible.map((item, i) => (
        <div key={i} className={item.full ? 'sm:col-span-full' : ''}>
          <dt className="text-theme-xs font-medium uppercase tracking-wide text-gray-400">
            {item.label}
          </dt>
          <dd className="mt-1 text-theme-sm text-gray-800 dark:text-gray-200">
            {item.value === null || item.value === undefined || item.value === '' ? (
              <span className="text-gray-400">—</span>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function DetailGrid({ children, className }) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6', className)}>
      {children}
    </div>
  );
}
