import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

import type { AppRouter } from '@/server/routers';

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      transformer: superjson,
      url: '/trpc',
    }),
  ],
});
