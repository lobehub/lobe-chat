import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

import type { DesktopRouter } from '@/server/routers/desktop';

export const desktopClient = createTRPCClient<DesktopRouter>({
  links: [
    httpBatchLink({
      maxURLLength: 2083,
      transformer: superjson,
      url: '/trpc/desktop',
    }),
  ],
});
