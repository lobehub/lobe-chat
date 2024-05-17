import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

import type { EdgeRouter } from '@/server/routers';

export const edgeClient = createTRPCClient<EdgeRouter>({
  links: [
    httpBatchLink({
      transformer: superjson,
      url: '/trpc/edge',
    }),
  ],
});
