/* eslint-disable @typescript-eslint/no-unused-vars */
import { getAuth } from '@clerk/nextjs/server';
import { User } from 'next-auth';
import { NextRequest } from 'next/server';

import { JWTPayload, LOBE_CHAT_AUTH_HEADER, enableClerk, enableNextAuth } from '@/const/auth';
import NextAuthEdge from '@/libs/next-auth/edge';

type ClerkAuth = ReturnType<typeof getAuth>;

export interface AuthContext {
  authorizationHeader?: string | null;
  clerkAuth?: ClerkAuth;
  jwtPayload?: JWTPayload | null;
  nextAuth?: User;
  userId?: string | null;
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export const createContextInner = async (params?: {
  authorizationHeader?: string | null;
  clerkAuth?: ClerkAuth;
  nextAuth?: User;
  userId?: string | null;
}): Promise<AuthContext> => ({
  authorizationHeader: params?.authorizationHeader,
  clerkAuth: params?.clerkAuth,
  nextAuth: params?.nextAuth,
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
    return createContextInner({ authorizationHeader: authorization, clerkAuth: auth, userId });
  }

  if (enableNextAuth) {
    try {
      const session = await NextAuthEdge.auth();
      if (session && session?.user?.id) {
        auth = session.user;
        userId = session.user.id;
      }
      return createContextInner({ authorizationHeader: authorization, nextAuth: auth, userId });
    } catch {}
  }

  return createContextInner({ authorizationHeader: authorization, userId });
};
