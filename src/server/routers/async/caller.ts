import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import urlJoin from 'url-join';

import { appEnv } from '@/config/app';
import { serverDBEnv } from '@/config/db';
import { LOBE_CHAT_AUTH_HEADER } from '@/const/auth';
import { KeyVaultsGateKeeper } from '@/server/modules/KeyVaultsEncrypt';

import type { AsyncRouter } from './index';

export const createAsyncServerClient = async (userId: string) => {
  const gateKeeper = await KeyVaultsGateKeeper.initWithEnvKey();

  return createTRPCClient<AsyncRouter>({
    links: [
      httpBatchLink({
        headers: {
          Authorization: `Bearer ${serverDBEnv.KEY_VAULTS_SECRET}`,
          [LOBE_CHAT_AUTH_HEADER]: await gateKeeper.encrypt(userId),
        },
        transformer: superjson,
        url: urlJoin(appEnv.APP_URL!, '/trpc/async'),
      }),
    ],
  });
};
