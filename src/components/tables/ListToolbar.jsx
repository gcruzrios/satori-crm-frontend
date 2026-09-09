import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { inputClasses } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const ALL = '__all__';

/**
 * Search + filter bar for list pages.
 *
 * @param {{
 *   search: string, onSearchChange: (v:string)=>void, searchPlaceholder?: string,
 *   filters?: { key:string, label:string, value:string, options:{value:string,label:string}[] }[],
 *   onFilterChange?: (key:string, value:string)=>void,
 *   onClear?: () => void, hasActiveFilters?: boolean,
 *   children?: React.ReactNode,
 * }} props
 */
export function ListToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Buscar…',
  filters = [],
  onFilterChange,
  onClear,
  hasActiveFilters,
  children,
  className,
}) {
  const [local, setLocal] = useState(search ?? '');
  const debounced = useDebounce(local, 300);

  useEffect(() => {
    if (debounced !== (search ?? '')) onSearchChange(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    setLocal(search ?? '');
  }, [search]);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center',
        className,
      )}
    >
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className={cn(inputClasses(), 'pl-11')}
        />
      </div>

      {filters.map((f) => (
        <div key={f.key} className="w-full sm:w-44">
          <Select
            aria-label={f.label}
            value={f.value || ALL}
            onChange={(v) => onFilterChange?.(f.key, v === ALL ? '' : v)}
            options={[{ value: ALL, label: `${f.label}: todos` }, ...f.options]}
          />
        </div>
      ))}

      {children}

      {hasActiveFilters && onClear && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="size-4" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
