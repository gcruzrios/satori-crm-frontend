import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @param {{
 *  title: string,
 *  description?: string,
 *  breadcrumbs?: {label:string, to?:string}[],
 *  actions?: React.ReactNode,
 * }} props
 */
export function PageHeader({ title, description, breadcrumbs, actions, className }) {
  return (
    <div className={cn('mb-5 flex flex-col gap-3 sm:mb-6', className)}>
      {breadcrumbs?.length > 0 && (
        <nav aria-label="Ruta de navegación">
          <ol className="flex flex-wrap items-center gap-1.5 text-theme-xs text-gray-500 dark:text-gray-400">
            {breadcrumbs.map((crumb, i) => {
              const last = i === breadcrumbs.length - 1;
              return (
                <li key={i} className="flex items-center gap-1.5">
                  {crumb.to && !last ? (
                    <Link
                      to={crumb.to}
                      className="hover:text-brand-500"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={last ? 'text-gray-700 dark:text-gray-300' : ''}>
                      {crumb.label}
                    </span>
                  )}
                  {!last && <ChevronRight className="size-3.5" />}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title-sm font-bold text-gray-800 dark:text-white/90">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}
