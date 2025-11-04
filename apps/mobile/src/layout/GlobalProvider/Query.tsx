import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren, useState } from 'react';

import { TRPCProvider, trpcClient } from '@/services/_auth/trpc';

const QUERY_CACHE_MAX_AGE = 1000 * 60 * 60 * 24; // 24 hours
const DEFAULT_STALE_TIME = 1000 * 60 * 5; // 5 minutes

/**
 * Query Provider
 * - QueryClientProvider: React Query for data fetching
 * - TRPCProvider: Type-safe API client
 */
const Query = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: QUERY_CACHE_MAX_AGE,
            staleTime: DEFAULT_STALE_TIME,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider queryClient={queryClient} trpcClient={trpcClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
};

export default Query;
