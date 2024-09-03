import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import urlJoin from 'url-join';

import { appEnv } from '@/config/app';
import { serverDBEnv } from '@/config/db';
import { JWTPayload, LOBE_CHAT_AUTH_HEADER } from '@/const/auth';
import { KeyVaultsGateKeeper } from '@/server/modules/KeyVaultsEncrypt';

import type { AsyncRouter } from './index';

export const createAsyncServerClient = async (userId: string, payload: JWTPayload) => {
  const gateKeeper = await KeyVaultsGateKeeper.initWithEnvKey();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${serverDBEnv.KEY_VAULTS_SECRET}`,
    [LOBE_CHAT_AUTH_HEADER]: await gateKeeper.encrypt(JSON.stringify({ payload, userId })),
  };

  if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
    headers['x-vercel-protection-bypass'] = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  }

  return createTRPCClient<AsyncRouter>({
    links: [
      httpBatchLink({
        headers,
        transformer: superjson,
        url: urlJoin(appEnv.APP_URL!, '/trpc/async'),
      }),
    ],
  });
};
