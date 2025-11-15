import { useMemo } from 'react';

import { parseAsBoolean, useQueryParam } from './useQueryParam';

export const usePinnedAgentState = () => {
  const [isPinned, setIsPinned] = useQueryParam('pinned', parseAsBoolean.withDefault(false), {
    clearOnDefault: true,
  });

  const actions = useMemo(
    () => ({
      pinAgent: () => setIsPinned(true),
      setIsPinned,
      togglePinAgent: () => setIsPinned((prev) => !prev),
      unpinAgent: () => setIsPinned(false),
    }),
    [setIsPinned],
  );

  return [isPinned, actions] as const;
};
