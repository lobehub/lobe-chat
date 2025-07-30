import debug from 'debug';
import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { LOBE_CHAT_AUTH_HEADER } from '@/const/auth';
import { oidcEnv } from '@/envs/oidc';
import { validateOIDCJWT } from '@/libs/oidc-provider/jwt';
import { extractBearerToken } from '@/utils/server/auth';

// Create context logger namespace
const log = debug('lobe-hono:auth-middleware');

/**
 * Standard Hono authentication middleware
 * Supports both OIDC tokens and API keys via Bearer token
 */
export const userAuthMiddleware = async (c: Context, next: Next) => {
  // Development mode debug bypass
  const isDebugApi = c.req.header('lobe-auth-dev-backend-api') === '1';
  if (process.env.NODE_ENV === 'development' && isDebugApi) {
    log('Development debug mode, using mock user ID');
    c.set('userId', process.env.MOCK_DEV_USER_ID);
    c.set('authType', 'debug');
    return next();
  }

  log('Processing authentication for request: %s %s', c.req.method, c.req.url);

  // Get Authorization header (standard Bearer token)
  const authorizationHeader = c.req.header('Authorization');
  const bearerToken = extractBearerToken(authorizationHeader);

  // Get LobeChat custom header (for backward compatibility)
  const lobeChatAuth = c.req.header(LOBE_CHAT_AUTH_HEADER);

  log('Authorization header: %s', authorizationHeader ? 'provided' : 'not provided');
  log('Bearer token extracted: %s', bearerToken ? 'yes' : 'no');
  log('LobeChat auth header: %s', lobeChatAuth ? 'provided' : 'not provided');

  let userId: string | null = null;
  let authType: string | null = null;
  let authData: any = null;

  // Try Bearer token authentication (OIDC first, then API Key)
  if (bearerToken && oidcEnv.ENABLE_OIDC) {
    log('Attempting OIDC authentication with Bearer token');

    try {
      // Use direct JWT validation instead of OIDCService
      const tokenInfo = await validateOIDCJWT(bearerToken);

      userId = tokenInfo.userId;
      authType = 'oidc';
      authData = tokenInfo.tokenData;

      log('OIDC authentication successful, userId: %s', userId);
    } catch (error) {
      log('OIDC authentication failed: %O', error);
      // Continue to try API Key authentication
    }
  }

  // Set authentication context in Hono context
  if (userId) {
    c.set('userId', userId);
    c.set('authType', authType);
    c.set('authData', authData);
    c.set('authorizationHeader', authorizationHeader);
    c.set('lobeChatAuth', lobeChatAuth);

    log('Authentication successful - userId: %s, authType: %s', userId, authType);
  } else {
    log('Authentication failed - no valid credentials found');
    // Don't throw error here, let individual routes decide if auth is required
    c.set('userId', null);
    c.set('authType', null);
  }

  await next();
};

/**
 * Helper middleware to require authentication
 * Throws 401 error if user is not authenticated
 */
export const requireAuth = async (c: Context, next: Next) => {
  const userId = c.get('userId');

  if (!userId) {
    log('Authentication required but user not authenticated');
    throw new HTTPException(401, { message: 'Authentication required' });
  }

  return next();
};
