import { parse } from 'cookie';
import debug from 'debug';
import { User } from 'next-auth';
import { NextRequest } from 'next/server';

import {
  ClientSecretPayload,
  LOBE_CHAT_AUTH_HEADER,
  LOBE_CHAT_OIDC_AUTH_HEADER,
  enableClerk,
  enableNextAuth,
} from '@/const/auth';
import { oidcEnv } from '@/envs/oidc';
import { ClerkAuth, IClerkAuth } from '@/libs/clerk-auth';
import { validateOIDCJWT } from '@/libs/oidc-provider/jwt';

// Create context logger namespace
const log = debug('lobe-trpc:lambda:context');

export interface OIDCAuth {
  // Other OIDC information that might be needed (optional, as payload contains all info)
  [key: string]: any;
  // OIDC token data (now the complete payload)
  payload: any;
  // User ID
  sub: string;
}

export interface AuthContext {
  authorizationHeader?: string | null;
  clerkAuth?: IClerkAuth;
  jwtPayload?: ClientSecretPayload | null;
  marketAccessToken?: string;
  nextAuth?: User;
  // Add OIDC authentication information
  oidcAuth?: OIDCAuth | null;
  resHeaders?: Headers;
  userAgent?: string;
  userId?: string | null;
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export const createContextInner = async (params?: {
  authorizationHeader?: string | null;
  clerkAuth?: IClerkAuth;
  marketAccessToken?: string;
  nextAuth?: User;
  oidcAuth?: OIDCAuth | null;
  userAgent?: string;
  userId?: string | null;
}): Promise<AuthContext> => {
  log('createContextInner called with params: %O', params);
  const responseHeaders = new Headers();

  return {
    authorizationHeader: params?.authorizationHeader,
    clerkAuth: params?.clerkAuth,
    marketAccessToken: params?.marketAccessToken,
    nextAuth: params?.nextAuth,
    oidcAuth: params?.oidcAuth,
    resHeaders: responseHeaders,
    userAgent: params?.userAgent,
    userId: params?.userId,
  };
};

export type LambdaContext = Awaited<ReturnType<typeof createContextInner>>;

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/v11/context
 */
export const createLambdaContext = async (request: NextRequest): Promise<LambdaContext> => {
  // we have a special header to debug the api endpoint in development mode
  // IT WON'T GO INTO PRODUCTION ANYMORE
  const isDebugApi = request.headers.get('lobe-auth-dev-backend-api') === '1';
  if (process.env.NODE_ENV === 'development' && isDebugApi) {
    return { userId: process.env.MOCK_DEV_USER_ID };
  }

  log('createLambdaContext called for request');
  // for API-response caching see https://trpc.io/docs/v11/caching

  const authorization = request.headers.get(LOBE_CHAT_AUTH_HEADER);
  const userAgent = request.headers.get('user-agent') || undefined;

  // get marketAccessToken from cookies
  const cookieHeader = request.headers.get('cookie');
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const marketAccessToken = cookies['mp_token'];

  log('marketAccessToken from cookie:', marketAccessToken ? '[HIDDEN]' : 'undefined');
  const commonContext = {
    authorizationHeader: authorization,
    marketAccessToken,
    userAgent,
  };
  log('LobeChat Authorization header: %s', authorization ? 'exists' : 'not found');

  let userId;
  let auth;
  let oidcAuth = null;

  // Prioritize checking for OIDC authentication (both standard Authorization and custom Oidc-Auth headers)
  if (oidcEnv.ENABLE_OIDC) {
    log('OIDC enabled, attempting OIDC authentication');
    const standardAuthorization = request.headers.get('Authorization');
    const oidcAuthToken = request.headers.get(LOBE_CHAT_OIDC_AUTH_HEADER);
    log('Standard Authorization header: %s', standardAuthorization ? 'exists' : 'not found');
    log('Oidc-Auth header: %s', oidcAuthToken ? 'exists' : 'not found');

    try {
      if (oidcAuthToken) {
        // Use direct JWT validation instead of database lookup
        const tokenInfo = await validateOIDCJWT(oidcAuthToken);

        oidcAuth = {
          payload: tokenInfo.tokenData,
          ...tokenInfo.tokenData, // Spread payload into oidcAuth
          sub: tokenInfo.userId, // Use tokenData as payload
        };
        userId = tokenInfo.userId;
        log('OIDC authentication successful, userId: %s', userId);

        // If OIDC authentication is successful, return context immediately
        log('OIDC authentication successful, creating context and returning');
        return createContextInner({
          oidcAuth,
          ...commonContext,
          userId,
        });
      }
    } catch (error) {
      // If OIDC authentication fails, log error and continue with other authentication methods
      if (oidcAuthToken) {
        log('OIDC authentication failed, error: %O', error);
        console.error('OIDC authentication failed, trying other methods:', error);
      }
    }
  }

  // If OIDC is not enabled or validation fails, try LobeChat custom Header and other authentication methods
  if (enableClerk) {
    log('Attempting Clerk authentication');
    const clerkAuth = new ClerkAuth();
    const result = clerkAuth.getAuthFromRequest(request);
    auth = result.clerkAuth;
    userId = result.userId;
    log('Clerk authentication result, userId: %s', userId || 'not authenticated');

    return createContextInner({
      clerkAuth: auth,
      ...commonContext,
      userId,
    });
  }

  if (enableNextAuth) {
    log('Attempting NextAuth authentication');
    try {
      const { default: NextAuthEdge } = await import('@/libs/next-auth/edge');

      const session = await NextAuthEdge.auth();
      if (session && session?.user?.id) {
        auth = session.user;
        userId = session.user.id;
        log('NextAuth authentication successful, userId: %s', userId);
      } else {
        log('NextAuth authentication failed, no valid session');
      }
      return createContextInner({
        nextAuth: auth,
        ...commonContext,
        userId,
      });
    } catch (e) {
      log('NextAuth authentication error: %O', e);
      console.error('next auth err', e);
    }
  }

  // Final return, userId may be undefined
  log(
    'All authentication methods attempted, returning final context, userId: %s',
    userId || 'not authenticated',
  );
  return createContextInner({ ...commonContext, userId });
};
