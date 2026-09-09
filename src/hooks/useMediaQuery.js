import { useEffect, useState } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Spec §6: the table→card breakpoint is Tailwind `md` (768px). */
export function useIsMobile() {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)');
}
