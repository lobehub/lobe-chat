import { and, eq } from 'drizzle-orm/expressions';
import type { NextAuthConfig } from 'next-auth';

import { authEnv, getAuthConfig } from '@/config/auth';
import { getServerDBConfig } from '@/config/db';
import { serverDB } from '@/database/core/dbForEdge';
import { nextauthAccounts } from '@/database/schemas';

import { LobeNextAuthDbAdapter } from './adapter';
import { ssoProviders } from './sso-providers';

const { NEXT_PUBLIC_ENABLED_SERVER_SERVICE } = getServerDBConfig();
const { NEXT_AUTH_SSO_SESSION_STRATEGY } = getAuthConfig();

export const initSSOProviders = () => {
  return authEnv.NEXT_PUBLIC_ENABLE_NEXT_AUTH
    ? authEnv.NEXT_AUTH_SSO_PROVIDERS.split(/[,，]/).map((provider: string) => {
        const validProvider = ssoProviders.find((item) => item.id === provider.trim());

        if (validProvider) return validProvider.provider;

        throw new Error(`[NextAuth] provider ${provider} is not supported`);
      })
    : [];
};

const setExpiresAt = (expires_in?: number): number => {
  // if expires_in is not provided, set it to 12 hour
  let expiresIn = expires_in ?? Date.now() / 1000 + 12 * 60 * 60;
  const REFRESH_THRESHOLD = 30;
  // If refresh interval set, use it to calculate the expires_at
  if (authEnv.NEXT_AUTH_SSO_REFRESH_TOKEN_INTERVAL) {
    return Math.floor(
      Date.now() / 1000 + authEnv.NEXT_AUTH_SSO_REFRESH_TOKEN_INTERVAL - REFRESH_THRESHOLD,
    );
  }
  return Math.floor(Date.now() / 1000 + expiresIn - REFRESH_THRESHOLD);
};

// Notice this is only an object, not a full Auth.js instance
export default {
  callbacks: {
    // Note: Data processing order of callback: authorize --> jwt --> session
    async jwt({ token, user, account, profile }) {
      // ref: https://authjs.dev/guides/extending-the-session#with-jwt
      if (user?.id) {
        token.userId = user?.id;
      }

      // First-time login, save the `access_token`, its expiry and the `refresh_token`
      if (account) {
        return {
          ...token,
          access_token: account?.access_token,
          // Refresh token every 30 seconds
          expires_at: setExpiresAt(account?.expires_at),
          iss: profile?.iss,
          provider: account.provider,
          providerAccountId: profile?.id ?? undefined,
          refresh_token: account?.refresh_token,
        };
      }

      // If the refresh token is enabled, try refresh token to the JWT
      // Only Casdoor & logto are supported
      // ref: https://authjs.dev/guides/refresh-token-rotation
      if (authEnv?.NEXT_AUTH_SSO_ENABLE_REFRESH_TOKEN && NEXT_AUTH_SSO_SESSION_STRATEGY === 'jwt') {
        if (!account && token?.expires_at && Date.now() < token.expires_at * 1000) {
          // Subsequent logins, but the `access_token` is still valid
          return token;
        } else {
          // Subsequent logins, but the `access_token` has expired, try to refresh it
          if (!token?.refresh_token) throw new TypeError('Missing refresh_token');
          if (!token?.iss) throw new TypeError('Missing issuer');
          if (!token?.provider) throw new TypeError('Missing provider');

          try {
            const { default: p } = await import(`./sso-providers/${token.provider}`);

            if (!p?.refreshToken)
              throw new TypeError(
                `Provider ${token.provider} does not support backend token refresh`,
              );

            const newTokens = (await p.refreshToken(token.iss, token.refresh_token)) as {
              access_token: string;
              expires_in: number;
              refresh_token?: string;
            };

            return {
              ...token,
              access_token: newTokens.access_token,
              expires_at: setExpiresAt(newTokens.expires_in),
              // Preserve the refresh token for two reasons:
              // - Some providers (e.g. logto) only issue refresh tokens once,
              //   so preserve if we did not get a new one
              // - If user enable token rotation,
              //   we need to use the new token
              refresh_token: newTokens?.refresh_token ?? token.refresh_token,
            };
          } catch (error) {
            console.error('Error refreshing access_token', error);
            // If we fail to refresh the token, return an error so we can handle it on the page
            token.error = 'RefreshTokenError';
            return token;
          }
        }
      }

      return token;
    },
    async session({ session, token, user }) {
      if (session.user) {
        // ref: https://authjs.dev/guides/extending-the-session#with-database
        if (user) {
          session.user.id = user.id;
        } else {
          session.user.id = (token.userId ?? session.user.id) as string;
        }
      }

      if (
        NEXT_PUBLIC_ENABLED_SERVER_SERVICE &&
        NEXT_AUTH_SSO_SESSION_STRATEGY === 'database' &&
        token
      ) {
        try {
          // Subsequent logins, but the `access_token` has expired, try to refresh it
          if (!token?.refresh_token) throw new TypeError('Missing refresh_token');
          if (!token?.iss) throw new TypeError('Missing issuer');
          if (!token?.provider) throw new TypeError('Missing provider');
          if (!token?.providerAccountId) throw new TypeError('Missing providerAccountId');

          const dbAdapter = LobeNextAuthDbAdapter(serverDB);
          // @ts-expect-error: type infer error
          const account = await dbAdapter.getAccount(token.provider, token.providerAccountId);
          if (!account)
            throw new TypeError(`Account ${token.provider} : ${token.providerAccountId} not found`);
          if (!account.refresh_token)
            throw new TypeError(
              `Account ${token.provider} : ${token.providerAccountId} has no refresh_token`,
            );
          if (!account.expires_at)
            throw new TypeError(
              `Account ${token.provider} : ${token.providerAccountId} has no expires_at`,
            );
          // Only refresh the token if it has expired
          if (account.expires_at * 1000 < Date.now()) {
            const { default: p } = await import(`./sso-providers/${token.provider}`);

            if (!p?.refreshToken)
              throw new TypeError(
                `Provider ${token.provider} does not support backend token refresh`,
              );

            const newTokens = (await p.refreshToken(token.iss, token.refresh_token)) as {
              access_token: string;
              expires_in: number;
              refresh_token?: string;
            };

            // update the account with the new tokens
            await serverDB
              .update(nextauthAccounts)
              .set({
                access_token: newTokens.access_token,
                expires_at: setExpiresAt(newTokens.expires_in),
                refresh_token: newTokens?.refresh_token ?? account.refresh_token,
              })
              .where(
                and(
                  eq(nextauthAccounts.provider, token.provider),
                  eq(nextauthAccounts.providerAccountId, token.providerAccountId),
                ),
              );
          }
        } catch (error) {
          console.error('Error refreshing access_token', error);
          // If we fail to refresh the token, return an error so we can handle it on the page
          token.error = 'RefreshTokenError';
        }
      }

      if (token?.error) {
        // @ts-ignore: type infer error
        session.error = token.error;
      }
      return session;
    },
  },
  debug: authEnv.NEXT_AUTH_DEBUG,
  pages: {
    error: '/next-auth/error',
    signIn: '/next-auth/signin',
  },
  providers: initSSOProviders(),
  secret: authEnv.NEXT_AUTH_SECRET,
  session: {
    strategy: NEXT_AUTH_SSO_SESSION_STRATEGY,
  },
  trustHost: process.env?.AUTH_TRUST_HOST ? process.env.AUTH_TRUST_HOST === 'true' : true,
} satisfies NextAuthConfig;
