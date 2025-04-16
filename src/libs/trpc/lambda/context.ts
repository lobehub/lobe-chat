import debug from 'debug';
import { User } from 'next-auth';
import { NextRequest } from 'next/server';

import { JWTPayload, LOBE_CHAT_AUTH_HEADER, enableClerk, enableNextAuth } from '@/const/auth';
import { oidcEnv } from '@/envs/oidc';
import { ClerkAuth, IClerkAuth } from '@/libs/clerk-auth';
import { extractBearerToken } from '@/utils/server/auth';

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
  jwtPayload?: JWTPayload | null;
  nextAuth?: User;
  // Add OIDC authentication information
  oidcAuth?: OIDCAuth | null;
  userId?: string | null;
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export const createContextInner = async (params?: {
  authorizationHeader?: string | null;
  clerkAuth?: IClerkAuth;
  nextAuth?: User;
  oidcAuth?: OIDCAuth | null;
  userId?: string | null;
}): Promise<AuthContext> => {
  log('createContextInner called with params: %O', params);
  return {
    authorizationHeader: params?.authorizationHeader,
    clerkAuth: params?.clerkAuth,
    nextAuth: params?.nextAuth,
    oidcAuth: params?.oidcAuth,
    userId: params?.userId,
  };
};

export type LambdaContext = Awaited<ReturnType<typeof createContextInner>>;

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/v11/context
 */
export const createLambdaContext = async (request: NextRequest): Promise<LambdaContext> => {
  log('createLambdaContext called for request');
  // for API-response caching see https://trpc.io/docs/v11/caching

  const authorization = request.headers.get(LOBE_CHAT_AUTH_HEADER);
  log('LobeChat Authorization header: %s', authorization ? 'exists' : 'not found');

  let userId;
  let auth;
  let oidcAuth = null;

  // Prioritize checking the standard Authorization header for OIDC Bearer Token validation
  if (oidcEnv.ENABLE_OIDC) {
    log('OIDC enabled, attempting OIDC authentication');
    const standardAuthorization = request.headers.get('Authorization');
    log('Standard Authorization header: %s', standardAuthorization ? 'exists' : 'not found');

    try {
      // Use extractBearerToken from utils
      const bearerToken = extractBearerToken(standardAuthorization);

      log('Extracted Bearer Token: %s', bearerToken ? 'valid' : 'invalid');
      if (bearerToken) {
        const { OIDCService } = await import('@/server/services/oidc');

        // Initialize OIDC service
        log('Initializing OIDC service');
        const oidcService = await OIDCService.initialize();
        // Validate token using OIDCService
        log('Validating OIDC token');
        const tokenInfo = await oidcService.validateToken(bearerToken);
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
          // Preserve original LobeChat Authorization Header (if any)
          authorizationHeader: authorization,
          oidcAuth,
          userId,
        });
      }
    } catch (error) {
      // If OIDC authentication fails, log error and continue with other authentication methods
      if (standardAuthorization?.startsWith('Bearer ')) {
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

    return createContextInner({ authorizationHeader: authorization, clerkAuth: auth, userId });
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
      return createContextInner({ authorizationHeader: authorization, nextAuth: auth, userId });
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
  return createContextInner({ authorizationHeader: authorization, userId });
};
