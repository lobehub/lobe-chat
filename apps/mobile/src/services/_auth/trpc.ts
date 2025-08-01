import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import superjson from 'superjson';

import { createHeaderWithAuth } from './header';
import { OFFICIAL_URL } from '@/const/url';

// Local type reference to server router
import type { LambdaRouter } from '../../../../../src/server/routers/lambda';

const remoteUrl = process.env.EXPO_PUBLIC_OFFICIAL_CLOUD_SERVER || OFFICIAL_URL;

const links = [
  httpBatchLink({
    headers: async () => await createHeaderWithAuth(),
    transformer: superjson,
    url: `${remoteUrl}/trpc/mobile`,
  }),
];

export const trpcClient = createTRPCClient<LambdaRouter>({
  links,
});

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<LambdaRouter>();
