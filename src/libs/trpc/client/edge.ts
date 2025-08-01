import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

import { isDesktop } from '@/const/version';
import type { EdgeRouter } from '@/server/routers/edge';
import { withBasePath } from '@/utils/basePath';
import { fetchWithDesktopRemoteRPC } from '@/utils/electron/desktopRemoteRPCFetch';

export const edgeClient = createTRPCClient<EdgeRouter>({
  links: [
    httpBatchLink({
      fetch: isDesktop
        ? // eslint-disable-next-line no-undef
          (input, init) => fetchWithDesktopRemoteRPC(input as string, init as RequestInit)
        : undefined,
      headers: async () => {
        // dynamic import to avoid circular dependency
        const { createHeaderWithAuth } = await import('@/services/_auth');

        return createHeaderWithAuth();
      },
      maxURLLength: 2083,
      transformer: superjson,
      url: withBasePath('/trpc/edge'),
    }),
  ],
});
