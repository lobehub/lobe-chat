/* eslint-disable @typescript-eslint/no-unused-vars */
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

import { JWTPayload, LOBE_CHAT_AUTH_HEADER, enableClerk } from '@/const/auth';

type ClerkAuth = ReturnType<typeof getAuth>;

export interface AuthContext {
  auth?: ClerkAuth;
  authorizationHeader?: string | null;
  jwtPayload?: JWTPayload | null;
  userId?: string | null;
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export const createContextInner = async (params?: {
  auth?: ClerkAuth;
  authorizationHeader?: string | null;
  userId?: string | null;
}): Promise<AuthContext> => ({
  auth: params?.auth,
  authorizationHeader: params?.authorizationHeader,
  userId: params?.userId,
});

export type Context = Awaited<ReturnType<typeof createContextInner>>;

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/v11/context
 */
export const createContext = async (request: NextRequest): Promise<Context> => {
  // for API-response caching see https://trpc.io/docs/v11/caching

  const authorization = request.headers.get(LOBE_CHAT_AUTH_HEADER);

  let userId;
  let auth;

  if (enableClerk) {
    auth = getAuth(request);

    userId = auth.userId;
  }

  return createContextInner({ auth, authorizationHeader: authorization, userId });
};
