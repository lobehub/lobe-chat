import { useLayoutEffect, useRef } from 'react';

import { useActiveLocation } from './useActiveLocation';

/**
 * Closes a floating host (popover, panel) once the active location changes, so
 * any link or `navigate()` call inside its content leaves the host behind
 * without wiring a close callback through every entry.
 *
 * The identity combines `key` with the path: web navigations always mint a new
 * `key` (also for same-path pushes), while the desktop tab mirror keeps a fixed
 * key and only changes its URL.
 *
 * Only for hosts whose every navigation should dismiss them; a click that does
 * not commit a navigation (for example re-selecting the current item) still
 * needs an explicit close.
 */
export const useCloseOnNavigate = (open: boolean, close: () => void) => {
  const { key, pathname, search } = useActiveLocation();
  const identity = `${key}|${pathname}${search}`;
  const lastIdentity = useRef(identity);

  // Layout effect so the destination's first paint is not covered by the host.
  useLayoutEffect(() => {
    if (lastIdentity.current === identity) return;
    lastIdentity.current = identity;
    if (open) close();
    // Keyed on the location only: a new `close` identity must not trigger it.
  }, [identity]);
};
