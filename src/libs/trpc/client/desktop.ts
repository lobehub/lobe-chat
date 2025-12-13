import { createTRPCClient, httpLink } from '@trpc/client';
import superjson from 'superjson';

import { withElectronProtocolIfElectron } from '@/const/protocol';
import type { DesktopRouter } from '@/server/routers/desktop';

export const desktopClient = createTRPCClient<DesktopRouter>({
  links: [
    httpLink({
      transformer: superjson,
      url: withElectronProtocolIfElectron('/trpc/desktop'),
    }),
  ],
});
