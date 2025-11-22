import { StateCreator } from 'zustand/vanilla';

import { useSessionStore } from '@/store/session';

import type { UrlHydrationStore } from './store';

export interface UrlHydrationAction {
  /**
   * Initialize store state from URL (one-time on app load)
   */
  initAgentPinnedFromUrl: () => void;

  /**
   * Sync agent pinned state to URL (call after state change)
   */
  syncAgentPinnedToUrl: () => void;
}

export const urlHydrationAction: StateCreator<
  UrlHydrationStore,
  [['zustand/devtools', never]],
  [],
  UrlHydrationAction
> = (set, get) => ({
  initAgentPinnedFromUrl: () => {
    if (get().isAgentPinnedInitialized) return;

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pinnedParam = params.get('pinned');

      console.log('pinnedParam', pinnedParam);

      if (pinnedParam === 'true') {
        useSessionStore.setState({ isAgentPinned: true });
      }

      set({ isAgentPinnedInitialized: true });
    }
  },

  syncAgentPinnedToUrl: () => {
    if (typeof window === 'undefined') return;

    const isAgentPinned = useSessionStore.getState().isAgentPinned;
    const url = new URL(window.location.href);

    if (isAgentPinned) {
      url.searchParams.set('pinned', 'true');
    } else {
      url.searchParams.delete('pinned');
    }

    window.history.replaceState(null, '', `${url.pathname}${url.search}`);
  },
});
