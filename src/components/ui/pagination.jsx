import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

/**
 * @param {{page:number,pageSize:number,total:number,onPageChange:(p:number)=>void}} props
 */
export function Pagination({ page, pageSize, total, onPageChange, className }) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));
  if (totalPages <= 1) return null;

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const pages = pageWindow(page, totalPages);

  return (
    <nav
      className={cn(
        'flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-1 pt-4 sm:flex-row dark:border-gray-800',
        className,
      )}
      aria-label="Paginación"
    >
      <p className="text-theme-xs text-gray-500 dark:text-gray-400">
        {from}–{to} de {total}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="secondary"
          size="icon-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" />
        </Button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`gap-${i}`} className="px-2 text-gray-400">
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? 'primary' : 'secondary'}
              size="icon-sm"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </Button>
          ),
        )}
        <Button
          variant="secondary"
          size="icon-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Página siguiente"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </nav>
  );
}

function pageWindow(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push('…');
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push('…');
  out.push(total);
  return out;
}
