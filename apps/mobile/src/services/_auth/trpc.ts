import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import superjson from 'superjson';
import { authExpired } from '@/features/Error/AuthExpired';
import { createHeaderWithAuth } from './header';
import { OFFICIAL_URL } from '@/const/url';

// Local type reference to server router
import type { MobileRouter } from '../../../../../src/server/routers/mobile';

const remoteUrl = process.env.EXPO_PUBLIC_OFFICIAL_CLOUD_SERVER || OFFICIAL_URL;

const links = [
  httpBatchLink({
    fetch: async (input, init) => {
      const response = await fetch(input as any, init as any);
      if (response.ok) return response;

      if (response.status === 401) {
        try {
          authExpired.redirect();
        } catch {
          console.error('Failed to redirect to login');
        }
      }
      return response;
    },
    headers: async () => await createHeaderWithAuth(),
    transformer: superjson,
    url: `${remoteUrl}/trpc/mobile`,
  }),
];

export const trpcClient = createTRPCClient<MobileRouter>({
  links,
});

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<MobileRouter>();
