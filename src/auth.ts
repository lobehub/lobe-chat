/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
import { createNanoId, idGenerator, serverDB } from '@lobechat/database';
import { emailHarmony } from 'better-auth-harmony';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth/minimal';
import { admin, genericOAuth, magicLink } from 'better-auth/plugins';

import { authEnv } from '@/envs/auth';
import {
  getMagicLinkEmailTemplate,
  getResetPasswordEmailTemplate,
  getVerificationEmailTemplate,
} from '@/libs/better-auth/email-templates';
import { initBetterAuthSSOProviders } from '@/libs/better-auth/sso';
import { createSecondaryStorage, getTrustedOrigins } from '@/libs/better-auth/utils/config';
import { parseSSOProviders } from '@/libs/better-auth/utils/server';
import { EmailService } from '@/server/services/email';
import { UserService } from '@/server/services/user';

// Email verification link expiration time (in seconds)
// Default is 1 hour (3600 seconds) as per Better Auth documentation
const VERIFICATION_LINK_EXPIRES_IN = 3600;
const MAGIC_LINK_EXPIRES_IN = 900;
const enableMagicLink = authEnv.NEXT_PUBLIC_ENABLE_MAGIC_LINK;
const enabledSSOProviders = parseSSOProviders(authEnv.AUTH_SSO_PROVIDERS);

const { socialProviders, genericOAuthProviders } = initBetterAuthSSOProviders();

export const auth = betterAuth({
  account: {
    accountLinking: {
      allowDifferentEmails: true,
      enabled: true,
      trustedProviders: enabledSSOProviders,
    },
  },

  // Use renamed env vars (fallback to next-auth vars is handled in src/envs/auth.ts)
  baseURL: authEnv.NEXT_PUBLIC_AUTH_URL,
  secret: authEnv.AUTH_SECRET,
  trustedOrigins: getTrustedOrigins(enabledSSOProviders),

  emailAndPassword: {
    autoSignIn: true,
    enabled: true,
    maxPasswordLength: 64,
    minPasswordLength: 8,
    requireEmailVerification: authEnv.NEXT_PUBLIC_AUTH_EMAIL_VERIFICATION,

    sendResetPassword: async ({ user, url }) => {
      const template = getResetPasswordEmailTemplate({ url });

      const emailService = new EmailService();
      await emailService.sendMail({
        to: user.email,
        ...template,
      });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    expiresIn: VERIFICATION_LINK_EXPIRES_IN,
    sendVerificationEmail: async ({ user, url }) => {
      const template = getVerificationEmailTemplate({
        expiresInSeconds: VERIFICATION_LINK_EXPIRES_IN,
        url,
        userName: user.name,
      });

      const emailService = new EmailService();
      await emailService.sendMail({
        to: user.email,
        ...template,
      });
    },
  },
  onAPIError: {
    errorURL: '/auth-error',
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 10 * 60, // Cache duration in seconds
    },
  },
  database: drizzleAdapter(serverDB, {
    provider: 'pg',
  }),
  secondaryStorage: createSecondaryStorage(),
  /**
   * Database joins is useful when Better-Auth needs to fetch related data from multiple tables in a single query.
   * Endpoints like /get-session, /get-full-organization and many others benefit greatly from this feature,
   * seeing upwards of 2x to 3x performance improvements depending on database latency.
   * Ref: https://www.better-auth.com/docs/adapters/drizzle#joins-experimental
   */
  experimental: { joins: true },
  /**
   * Run user bootstrap for every newly created account (email, magic link, OAuth/social, etc.).
   * Using Better Auth database hooks ensures we catch social flows that bypass /sign-up/* routes.
   * Ref: https://www.better-auth.com/docs/reference/options#databasehooks
   */
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const userService = new UserService(serverDB);
          await userService.initUser({
            email: user.email,
            id: user.id,
            username: user.username as string | null,
            // TODO: if add phone plugin, we should fill phone here
          });
        },
      },
    },
  },
  user: {
    additionalFields: {
      username: {
        required: false,
        type: 'string',
      },
    },
    fields: {
      image: 'avatar',
      // NOTE: use drizzle filed instead of db field, so use fullName instead of full_name
      name: 'fullName',
    },
    modelName: 'users',
  },

  socialProviders,
  advanced: {
    database: {
      /**
       * Align Better Auth user IDs with our shared idGenerator for consistency.
       * Other models use the shared nanoid generator (12 chars) to keep IDs consistent project-wide.
       */
      generateId: ({ model }) => {
        // Better Auth passes the model name; handle both singular and plural for safety.
        if (model === 'user' || model === 'users') {
          // clerk id length is 32
          return idGenerator('user', 32 - 'user_'.length);
        }

        // Other models: use shared nanoid generator (12 chars) to keep consistency.
        return createNanoId(12)();
      },
    },
  },
  plugins: [
    emailHarmony({ allowNormalizedSignin: false }),
    admin(),
    ...(genericOAuthProviders.length > 0
      ? [
          genericOAuth({
            config: genericOAuthProviders,
          }),
        ]
      : []),
    ...(enableMagicLink
      ? [
          magicLink({
            expiresIn: MAGIC_LINK_EXPIRES_IN,
            sendMagicLink: async ({ email, url }) => {
              const template = getMagicLinkEmailTemplate({
                expiresInSeconds: MAGIC_LINK_EXPIRES_IN,
                url,
              });

              const emailService = new EmailService();
              await emailService.sendMail({
                to: email,
                ...template,
              });
            },
          }),
        ]
      : []),
  ],
});
