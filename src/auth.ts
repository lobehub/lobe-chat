import { serverDB } from '@lobechat/database';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { SocialProviders } from 'better-auth/social-providers';

import { authEnv } from '@/envs/auth';
import {
  getResetPasswordEmailTemplate,
  getVerificationEmailTemplate,
} from '@/libs/better-auth/email-templates';
import { parseSSOProviders } from '@/libs/better-auth/utils';
import { pino } from '@/libs/logger';
import { emailService } from '@/server/services/email';

// Email verification link expiration time (in seconds)
// Default is 1 hour (3600 seconds) as per Better Auth documentation
const VERIFICATION_LINK_EXPIRES_IN = 3600;

/**
 * Initialize Better-Auth SSO providers based on environment variables
 * Reads BETTER_AUTH_SSO_PROVIDERS and validates credentials
 */
const initBetterAuthSSOProviders = () => {
  const enabledProviders = parseSSOProviders(authEnv.BETTER_AUTH_SSO_PROVIDERS);

  if (enabledProviders.length === 0) {
    return {};
  }

  const socialProviders: SocialProviders = {};

  for (const provider of enabledProviders) {
    switch (provider) {
      case 'google': {
        if (authEnv.GOOGLE_CLIENT_ID && authEnv.GOOGLE_CLIENT_SECRET) {
          socialProviders.google = {
            clientId: authEnv.GOOGLE_CLIENT_ID,
            clientSecret: authEnv.GOOGLE_CLIENT_SECRET,
          };
        } else {
          pino.warn(`[Better-Auth] Google OAuth enabled but missing credentials`);
        }
        break;
      }

      case 'github': {
        if (authEnv.GITHUB_CLIENT_ID && authEnv.GITHUB_CLIENT_SECRET) {
          socialProviders.github = {
            clientId: authEnv.GITHUB_CLIENT_ID,
            clientSecret: authEnv.GITHUB_CLIENT_SECRET,
          };
        } else {
          pino.warn(`[Better-Auth] GitHub OAuth enabled but missing credentials`);
        }
        break;
      }

      case 'cognito': {
        if (
          authEnv.COGNITO_CLIENT_ID &&
          authEnv.COGNITO_CLIENT_SECRET &&
          authEnv.COGNITO_DOMAIN &&
          authEnv.COGNITO_REGION &&
          authEnv.COGNITO_USERPOOL_ID
        ) {
          socialProviders.cognito = {
            clientId: authEnv.COGNITO_CLIENT_ID,
            clientSecret: authEnv.COGNITO_CLIENT_SECRET,
            domain: authEnv.COGNITO_DOMAIN,
            region: authEnv.COGNITO_REGION,
            userPoolId: authEnv.COGNITO_USERPOOL_ID,
          };
        } else {
          pino.warn(`[Better-Auth] AWS Cognito OAuth enabled but missing credentials`);
        }
        break;
      }

      case 'microsoft': {
        if (authEnv.MICROSOFT_CLIENT_ID && authEnv.MICROSOFT_CLIENT_SECRET) {
          socialProviders.microsoft = {
            clientId: authEnv.MICROSOFT_CLIENT_ID,
            clientSecret: authEnv.MICROSOFT_CLIENT_SECRET,
          };
        } else {
          pino.warn(`[Better-Auth] Microsoft OAuth enabled but missing credentials`);
        }
        break;
      }

      default: {
        pino.warn(`[Better-Auth] Unknown SSO provider: ${provider}`);
      }
    }
  }

  return socialProviders;
};

export const auth = betterAuth({
  database: drizzleAdapter(serverDB, {
    provider: 'pg',
  }),

  emailAndPassword: {
    autoSignIn: true,
    enabled: true,
    maxPasswordLength: 64,
    minPasswordLength: 8,
    requireEmailVerification: authEnv.NEXT_PUBLIC_BETTER_AUTH_REQUIRE_EMAIL_VERIFICATION,

    sendResetPassword: async ({ user, url }) => {
      const template = getResetPasswordEmailTemplate({ url });

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

      await emailService.sendMail({
        to: user.email,
        ...template,
      });
    },
  },

  socialProviders: initBetterAuthSSOProviders(),

  user: {
    fields: {
      image: 'avatar',
      name: 'username',
    },
    modelName: 'users',
  },
});
