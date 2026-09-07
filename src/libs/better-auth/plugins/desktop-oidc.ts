import { APIError, createAuthMiddleware } from 'better-auth/api';
import { type BetterAuthPlugin } from 'better-auth/types';

import { appEnv } from '@/envs/app';
import { authEnv, LOBE_CHAT_OIDC_AUTH_HEADER } from '@/envs/auth';
import { isOIDCUserBanned } from '@/libs/oidc-provider/access-control';
import { validateOIDCJWT } from '@/libs/oidc-provider/jwt';

/** Desktop OAuth credentials authorize only these account operations, not a web session. */
export const desktopOIDC = (): BetterAuthPlugin => ({
  id: 'desktop-oidc',
  hooks: {
    before: [
      {
        matcher: (ctx) =>
          authEnv.ENABLE_OIDC &&
          ((ctx.path === '/change-email' && ctx.method === 'POST') ||
            (ctx.path === '/list-accounts' && ctx.method === 'GET')) &&
          !!ctx.headers?.get(LOBE_CHAT_OIDC_AUTH_HEADER),
        handler: createAuthMiddleware(async (ctx) => {
          const token = ctx.headers!.get(LOBE_CHAT_OIDC_AUTH_HEADER)!;
          let identity;
          try {
            identity = await validateOIDCJWT(token);
          } catch (error) {
            if ((error as { code?: string }).code !== 'UNAUTHORIZED') throw error;
            throw new APIError('UNAUTHORIZED');
          }

          const { payload, userId } = identity;
          const now = Date.now();
          const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
          if (
            payload.client_id !== 'lobehub-desktop' ||
            payload.purpose !== undefined ||
            payload.iss !== `${appEnv.APP_URL?.replace(/\/$/, '')}/oidc` ||
            !audiences.includes('urn:lobehub:chat') ||
            typeof payload.exp !== 'number' ||
            payload.exp * 1000 <= now ||
            typeof payload.iat !== 'number' ||
            payload.iat * 1000 > now
          ) {
            throw new APIError('UNAUTHORIZED');
          }

          const user = await ctx.context.internalAdapter.findUserById(userId);
          const ban = user as typeof user & { banExpires?: Date | null; banned?: boolean | null };
          if (
            !user ||
            isOIDCUserBanned({ banExpires: ban?.banExpires ?? null, banned: ban?.banned ?? false })
          ) {
            throw new APIError('UNAUTHORIZED');
          }

          // This bridge must never enable an immediate email update for an unverified account.
          if (
            ctx.path === '/change-email' &&
            ctx.context.options.user?.changeEmail?.updateEmailWithoutVerification
          ) {
            throw new APIError('FORBIDDEN');
          }

          // Request-local only: no session row or cookie is minted, and token expiry is preserved.
          // The allowlist above keeps this out of password, deletion and session-management APIs.
          return {
            context: {
              context: {
                session: {
                  user,
                  session: {
                    id: `desktop-oidc:${userId}`,
                    token: '',
                    userId,
                    createdAt: new Date(payload.iat * 1000),
                    updatedAt: new Date(payload.iat * 1000),
                    expiresAt: new Date(payload.exp * 1000),
                  },
                },
              },
            },
          };
        }),
      },
    ],
  },
});
