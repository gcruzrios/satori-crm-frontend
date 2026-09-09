import { useEffect, useState } from 'react';
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants';

/** Debounced copy of a fast-changing value (spec §17: 300ms search debounce). */
export function useDebounce(value, delay = SEARCH_DEBOUNCE_MS) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
