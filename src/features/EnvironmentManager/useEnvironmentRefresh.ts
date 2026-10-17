import { useRef, useState } from 'react';

interface RefreshActions {
  environments: () => Promise<unknown>;
  instances: () => Promise<unknown>;
  usage: () => Promise<unknown>;
}

// Manual refresh owns its spinner and per-resource errors; background SWR reads do not.
export const useEnvironmentRefresh = (actions: RefreshActions) => {
  const [refreshing, setRefreshing] = useState(false);
  const [usageError, setUsageError] = useState(false);

  const latestRefresh = useRef(0);

  const refresh = async () => {
    const invocation = ++latestRefresh.current;
    setRefreshing(true);
    const results = await Promise.allSettled([
      Promise.resolve().then(actions.environments),
      Promise.resolve().then(actions.instances),
      Promise.resolve().then(actions.usage),
    ]);
    for (const result of results) {
      if (result.status === 'rejected') console.error('Environment refresh failed', result.reason);
    }
    if (invocation !== latestRefresh.current) return;
    setUsageError(results[2].status === 'rejected');
    setRefreshing(false);
  };

  return { refresh, refreshing, usageError };
};
