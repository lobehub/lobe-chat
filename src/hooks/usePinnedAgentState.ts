'use client';

import { useSessionStore } from '@/store/session';

export const usePinnedAgentState = () => {
  const isPinned = useSessionStore((s) => s.isAgentPinned);
  const setAgentPinned = useSessionStore((s) => s.setAgentPinned);
  const toggleAgentPinned = useSessionStore((s) => s.toggleAgentPinned);

  return [
    isPinned,
    {
      pinAgent: () => setAgentPinned(true),
      setIsPinned: setAgentPinned,
      togglePinAgent: toggleAgentPinned,
      unpinAgent: () => setAgentPinned(false),
    },
  ] as const;
};
