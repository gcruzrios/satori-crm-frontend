import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

/**
 * Guard against losing unsaved form work (spec §9).
 * - Blocks in-app navigation (<Link> / navigate()) via the data router.
 * - Adds a `beforeunload` listener for tab close / reload.
 *
 * Render <UnsavedChangesPrompt blocker={blocker} /> to show the confirm UI.
 *
 * @param {boolean} isDirty
 * @returns {import('react-router-dom').Blocker}
 */
export function useUnsavedChangesGuard(isDirty) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!isDirty) return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  return blocker;
}
