import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

import { isDesktop } from '@/const/version';
import { AsyncRouter } from '@/server/routers/async';
import { fetchWithDesktopRemoteRPC } from '@/utils/electron/desktopRemoteRPCFetch';

export const asyncClient = createTRPCClient<AsyncRouter>({
  links: [
    httpBatchLink({
      fetch: isDesktop
        ? (input, init) => fetchWithDesktopRemoteRPC(input as string, init)
        : undefined,
      maxURLLength: 2083,
      transformer: superjson,
      url: '/trpc/async',
    }),
  ],
});
