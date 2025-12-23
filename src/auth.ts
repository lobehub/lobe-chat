/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
import { expo } from '@better-auth/expo';
import { passkey } from '@better-auth/passkey';
import { createNanoId, idGenerator, serverDB } from '@lobechat/database';
import * as schema from '@lobechat/database/schemas';
import { emailHarmony } from 'better-auth-harmony';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth/minimal';
import { admin, emailOTP, genericOAuth, magicLink } from 'better-auth/plugins';

import { authEnv } from '@/envs/auth';
import {
  getMagicLinkEmailTemplate,
  getResetPasswordEmailTemplate,
  getVerificationEmailTemplate,
  getVerificationOTPEmailTemplate,
} from '@/libs/better-auth/email-templates';
import { initBetterAuthSSOProviders } from '@/libs/better-auth/sso';
import { createSecondaryStorage, getTrustedOrigins } from '@/libs/better-auth/utils/config';
import { parseSSOProviders } from '@/libs/better-auth/utils/server';
import { EmailService } from '@/server/services/email';
import { UserService } from '@/server/services/user';

// Email verification link expiration time (in seconds)
// Default is 1 hour (3600 seconds) as per Better Auth documentation
const VERIFICATION_LINK_EXPIRES_IN = 3600;

/**
 * Safely extract hostname from AUTH_URL for passkey rpID.
 * Returns undefined if AUTH_URL is not set (e.g., in e2e tests).
 */
const getPasskeyRpID = (): string | undefined => {
  if (!authEnv.NEXT_PUBLIC_AUTH_URL) return undefined;
  try {
    return new URL(authEnv.NEXT_PUBLIC_AUTH_URL).hostname;
  } catch {
    return undefined;
  }
};

/**
 * Get passkey origins array.
 * Returns undefined if AUTH_URL is not set (e.g., in e2e tests).
 */
const getPasskeyOrigins = (): string[] | undefined => {
  if (!authEnv.NEXT_PUBLIC_AUTH_URL) return undefined;
  return [
    // Web origin
    authEnv.NEXT_PUBLIC_AUTH_URL,
    // Android APK key hashes (SHA256 fingerprints in base64url format)
    // Production: D7:54:DB:A3:78:D5:8B:8F:20:01:ED:7B:9B:18:D3:B0:5B:D1:22:AA:97:2B:59:E1:A6:8E:31:24:21:44:0D:2B
    'android:apk-key-hash:11TbozjVi48gAe17mxjTsFvRIqqXK1nhpo4xJCFEDSs',
    // Debug: FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C
    'android:apk-key-hash:-sYXRdwJA3hvue3mKpYrOZ9zSPC7b4mbgzJmdZEDO5w',
    // EAS Build: 1B:21:38:5D:72:40:65:F5:16:20:1D:C9:D2:6B:04:63:C3:33:F1:97:AB:6A:06:66:0E:3E:F0:7E:60:82:7E:E7
    'android:apk-key-hash:GyE4XXJAZfUWIB3J0msEY8Mz8ZerageGDj7wfmCCfuc',
    // EAS Build 2: 1B:BE:D4:A0:AE:43:56:E5:58:01:74:C4:B9:A0:0B:0E:5A:B9:5E:0F:A9:C0:65:18:68:CF:1F:AA:3E:8F:4F:DB
    'android:apk-key-hash:G77UoK5DVuVYAXTEuaALDlq5Xg-pwGUYaM8fqj6PT9s',
  ];
};
const MAGIC_LINK_EXPIRES_IN = 900;
// OTP expiration time (in seconds) - 5 minutes for mobile OTP verification
const OTP_EXPIRES_IN = 300;
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
    // experimental joins feature needs schema to pass full relation
    schema,
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
    expo(),
    emailHarmony({ allowNormalizedSignin: false }),
    admin(),
    // Email OTP plugin for mobile verification
    emailOTP({
      expiresIn: OTP_EXPIRES_IN,
      otpLength: 6,
      allowedAttempts: 3,
      // Don't automatically send OTP on sign up - let mobile client manually trigger it
      sendVerificationOnSignUp: false,
      async sendVerificationOTP({ email, otp }) {
        const emailService = new EmailService();

        // For all OTP types, use the same template
        // userName is optional and will be null since we don't have user context here
        const template = getVerificationOTPEmailTemplate({
          expiresInSeconds: OTP_EXPIRES_IN,
          otp,
          userName: null,
        });

        await emailService.sendMail({
          to: email,
          ...template,
        });
      },
    }),
    passkey({
      rpName: 'LobeHub',
      // Extract rpID from auth URL (e.g., 'lobehub.com' from 'https://lobehub.com')
      // Returns undefined if AUTH_URL is not set (e.g., in e2e tests)
      rpID: getPasskeyRpID(),
      // Support multiple origins: web + Android APK key hashes
      // Android origin format: android:apk-key-hash:<base64url-sha256-fingerprint>
      // Returns undefined if AUTH_URL is not set (e.g., in e2e tests)
      origin: getPasskeyOrigins(),
    }),
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
