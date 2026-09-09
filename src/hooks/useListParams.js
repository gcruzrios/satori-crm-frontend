import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Sync list state (page, search term, arbitrary filters) to the URL query
 * string so lists are shareable and survive back/forward.
 *
 * @param {{ filterKeys?: string[], defaultPageSize?: number }} opts
 */
export function useListParams({ filterKeys = [], defaultPageSize = 20 } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const q = searchParams.get('q') ?? '';

  const filters = useMemo(() => {
    const out = {};
    for (const key of filterKeys) {
      const v = searchParams.get(key);
      if (v) out[key] = v;
    }
    return out;
  }, [searchParams, filterKeys]);

  const setParam = useCallback(
    (patch, { resetPage = true } = {}) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (v === null || v === undefined || v === '') next.delete(k);
            else next.set(k, String(v));
          }
          if (resetPage && !('page' in patch)) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return {
    page,
    pageSize: defaultPageSize,
    q,
    filters,
    setPage: (p) => setParam({ page: p }, { resetPage: false }),
    setSearch: (term) => setParam({ q: term }),
    setFilter: (key, value) => setParam({ [key]: value }),
    setFilters: (patch) => setParam(patch),
    reset: () => setSearchParams({}, { replace: true }),
    hasActiveFilters: Boolean(q) || Object.keys(filters).length > 0,
  };
}
