'use client';

import { useSessionStore } from '@/store/session';
import { useUrlHydrationStore } from '@/store/urlHydration';

export const usePinnedAgentState = () => {
  const isPinned = useSessionStore((s) => s.isAgentPinned);
  const setAgentPinned = useSessionStore((s) => s.setAgentPinned);
  const toggleAgentPinned = useSessionStore((s) => s.toggleAgentPinned);
  const syncToUrl = useUrlHydrationStore((s) => s.syncAgentPinnedToUrl);

  const withSync = <T extends (...args: any[]) => void>(fn: T) => {
    return (...args: Parameters<T>) => {
      fn(...args);
      syncToUrl();
    };
  };

  return [
    isPinned,
    {
      pinAgent: withSync(() => setAgentPinned(true)),
      setIsPinned: withSync(setAgentPinned),
      togglePinAgent: withSync(toggleAgentPinned),
      unpinAgent: withSync(() => setAgentPinned(false)),
    },
  ] as const;
};
