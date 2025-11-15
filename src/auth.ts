import { serverDB } from '@lobechat/database';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { authEnv } from '@/envs/auth';
import {
  getResetPasswordEmailTemplate,
  getVerificationEmailTemplate,
} from '@/libs/better-auth/email-templates';
import { emailService } from '@/server/services/email';

// Email verification link expiration time (in seconds)
// Default is 1 hour (3600 seconds) as per Better Auth documentation
const VERIFICATION_LINK_EXPIRES_IN = 3600;

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

  user: {
    fields: {
      image: 'avatar',
      name: 'username',
    },
    modelName: 'users',
  },
});
