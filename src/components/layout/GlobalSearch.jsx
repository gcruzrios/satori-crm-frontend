import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Popover from '@radix-ui/react-popover';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { inputClasses } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  LEAD_STATUS_OPTIONS,
  QUOTE_STATUS_OPTIONS,
  INVOICE_STATUS_OPTIONS,
  OPPORTUNITY_STATUS_OPTIONS,
} from '@/lib/constants';
import { globalSearch, ENTITY_META } from '@/features/search/api';

const STATUS_OPTS = {
  lead: LEAD_STATUS_OPTIONS,
  quote: QUOTE_STATUS_OPTIONS,
  invoice: INVOICE_STATUS_OPTIONS,
  opportunity: OPPORTUNITY_STATUS_OPTIONS,
};

export function GlobalSearch() {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const debounced = useDebounce(term.trim(), 300);
  const enabled = debounced.length >= 2;

  const { data = [], isFetching } = useQuery({
    queryKey: ['search', debounced],
    queryFn: ({ signal }) => globalSearch(debounced, signal),
    enabled,
    staleTime: 10_000,
  });

  const groups = useMemo(() => {
    const by = {};
    for (const r of data) (by[r.entity_type] ??= []).push(r);
    return Object.entries(by);
  }, [data]);

  useEffect(() => {
    if (enabled) setOpen(true);
  }, [enabled, data]);

  // ⌘K / Ctrl+K focus shortcut (spec §19 / template header).
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (entityType, id) => {
    const meta = ENTITY_META[entityType] ?? ENTITY_META.other;
    setOpen(false);
    setTerm('');
    navigate(meta.to(id));
  };

  return (
    <Popover.Root open={open && enabled} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onFocus={() => enabled && setOpen(true)}
            placeholder="Buscar en Clínica Satori…"
            aria-label="Búsqueda global"
            className={cn(inputClasses(), 'h-10 pl-11 pr-16')}
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 sm:inline-flex dark:border-gray-700 dark:bg-white/5 dark:text-gray-400">
            ⌘K
          </kbd>
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="z-99999 max-h-[70vh] w-[min(28rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
        >
          {isFetching && !data.length ? (
            <p className="flex items-center gap-2 px-3 py-4 text-theme-sm text-gray-500">
              <Loader2 className="size-4 animate-spin" /> Buscando…
            </p>
          ) : !data.length ? (
            <p className="px-3 py-4 text-theme-sm text-gray-500">
              Sin resultados para “{debounced}”.
            </p>
          ) : (
            groups.map(([type, rows]) => (
              <div key={type} className="mb-1 last:mb-0">
                <p className="px-3 py-1.5 text-theme-xs font-medium uppercase tracking-wide text-gray-400">
                  {(ENTITY_META[type] ?? ENTITY_META.other).label}
                </p>
                <ul>
                  {rows.map((r) => (
                    <li key={`${type}-${r.id}`}>
                      <button
                        type="button"
                        onClick={() => go(type, r.id)}
                        className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-theme-sm font-medium text-gray-800 dark:text-white/90">
                            {r.title}
                          </span>
                          {r.subtitle && (
                            <span className="block truncate text-theme-xs text-gray-500 dark:text-gray-400">
                              {r.subtitle}
                            </span>
                          )}
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          {r.status && STATUS_OPTS[type] && (
                            <StatusBadge value={r.status} options={STATUS_OPTS[type]} />
                          )}
                          <CornerDownLeft className="size-3.5 text-gray-300" />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
