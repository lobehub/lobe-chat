import { NextRequest } from 'next/server';

import { LOBE_CHAT_AUTH_HEADER } from '@/const/auth';
import { KeyVaultsGateKeeper } from '@/server/modules/KeyVaultsEncrypt';

export interface AsyncAuthContext {
  secret: string;
  userId?: string | null;
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export const createAsyncContextInner = async (params?: {
  secret?: string;
  userId?: string | null;
}): Promise<AsyncAuthContext> => ({
  secret: params?.secret || '',
  userId: params?.userId,
});

export type AsyncContext = Awaited<ReturnType<typeof createAsyncContextInner>>;

export const createAsyncRouteContext = async (request: NextRequest): Promise<AsyncContext> => {
  // for API-response caching see https://trpc.io/docs/v11/caching

  const authorization = request.headers.get('Authorization');
  const lobeChatAuthorization = request.headers.get(LOBE_CHAT_AUTH_HEADER);

  const secret = authorization?.split(' ')[1];
  const gateKeeper = await KeyVaultsGateKeeper.initWithEnvKey();
  const result = await gateKeeper.decrypt(lobeChatAuthorization || '');

  return createAsyncContextInner({ secret, userId: result.plaintext });
};
