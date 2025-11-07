import { serverDB } from '@lobechat/database';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

export const auth = betterAuth({
  database: drizzleAdapter(serverDB, {
    provider: 'pg',
  }),
  // custom database fields
  emailAndPassword: {
    enabled: true,
  },
  user: {
    fields: {
      image: 'avatar',
      name: 'username',
    },
    modelName: 'users',
  },
});
