/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
import { serverDB } from '@lobechat/database';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { genericOAuth, magicLink } from 'better-auth/plugins';

import { authEnv } from '@/envs/auth';
import {
  getMagicLinkEmailTemplate,
  getResetPasswordEmailTemplate,
  getVerificationEmailTemplate,
} from '@/libs/better-auth/email-templates';
import { initBetterAuthSSOProviders } from '@/libs/better-auth/sso';
import { EmailService } from '@/server/services/email';

// Email verification link expiration time (in seconds)
// Default is 1 hour (3600 seconds) as per Better Auth documentation
const VERIFICATION_LINK_EXPIRES_IN = 3600;
const MAGIC_LINK_EXPIRES_IN = 900;
const enableMagicLink = authEnv.NEXT_PUBLIC_ENABLE_MAGIC_LINK;

const { socialProviders, genericOAuthProviders } = initBetterAuthSSOProviders();

export const auth = betterAuth({
  account: {
    accountLinking: {
      allowDifferentEmails: true,
      enabled: true,
    },
  },

  // Use renamed env vars (fallback to next-auth vars is handled in src/envs/auth.ts)
  baseURL: authEnv.NEXT_PUBLIC_AUTH_URL,
  secret: authEnv.AUTH_SECRET,

  database: drizzleAdapter(serverDB, {
    provider: 'pg',
  }),

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

  plugins: [
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
  socialProviders,

  user: {
    additionalFields: {
      fullName: {
        required: false,
        type: 'string',
      },
    },
    fields: {
      image: 'avatar',
      name: 'username',
    },
    modelName: 'users',
  },
});
