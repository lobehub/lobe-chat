import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

import { isDesktop } from '@/const/version';
import { AsyncRouter } from '@/server/routers/async';
import { fetchWithDesktopRemoteRPC } from '@/utils/electron/desktopRemoteRPCFetch';

export const asyncClient = createTRPCClient<AsyncRouter>({
  links: [
    httpBatchLink({
      fetch: isDesktop
        ? // eslint-disable-next-line no-undef
          (input, init) => fetchWithDesktopRemoteRPC(input as string, init as RequestInit)
        : undefined,
      maxURLLength: 2083,
      transformer: superjson,
      url: '/trpc/async',
    }),
  ],
});
