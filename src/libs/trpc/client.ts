import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

import type { EdgeRouter } from '@/server/routers';
import { createHeaderWithAuth } from '@/services/_auth';

export const edgeClient = createTRPCClient<EdgeRouter>({
  links: [
    httpBatchLink({
      headers: async () => createHeaderWithAuth(),
      transformer: superjson,
      url: '/trpc/edge',
    }),
  ],
});
