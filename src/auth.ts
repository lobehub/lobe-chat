import { serverDB } from '@lobechat/database';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import {
  getResetPasswordEmailTemplate,
  getVerificationEmailTemplate,
} from '@/libs/better-auth/email-templates';
import { emailService } from '@/server/services/email';

export const auth = betterAuth({
  database: drizzleAdapter(serverDB, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,

    sendResetPassword: async ({ user, url }) => {
      const template = getResetPasswordEmailTemplate({ url });

      await emailService.sendMail({
        to: user.email,
        ...template,
      });
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const template = getVerificationEmailTemplate({ url, userName: user.name });

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
