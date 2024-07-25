import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

import type { EdgeRouter } from '@/server/routers/edge';
import { withBasePath } from '@/utils/basePath';

export const edgeClient = createTRPCClient<EdgeRouter>({
  links: [
    httpBatchLink({
      headers: async () => {
        // dynamic import to avoid circular dependency
        const { createHeaderWithAuth } = await import('@/services/_auth');

        return createHeaderWithAuth();
      },
      transformer: superjson,
      url: withBasePath('/trpc/edge'),
    }),
  ],
});
