/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest } from 'next/server';

interface AuthContext {
  userId?: string | null;
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export function createContextInner(): AuthContext {
  return {
    userId: null,
  };
}

export type Context = Awaited<ReturnType<typeof createContextInner>>;

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/v11/context
 */
export const createContext = async (request: NextRequest): Promise<Context> => {
  // for API-response caching see https://trpc.io/docs/v11/caching

  return createContextInner();
};
