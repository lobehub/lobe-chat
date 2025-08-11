import { parseAsBoolean, useQueryState } from 'nuqs';
import { useMemo } from 'react';

export const usePinnedAgentState = () => {
  const [isPinned, setIsPinned] = useQueryState(
    'pinned',
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true }),
  );

  const actions = useMemo(
    () => ({
      pinAgent: () => setIsPinned(true),
      setIsPinned,
      togglePinAgent: () => setIsPinned((prev) => !prev),
      unpinAgent: () => setIsPinned(false),
    }),
    [],
  );

  return [isPinned, actions] as const;
};
