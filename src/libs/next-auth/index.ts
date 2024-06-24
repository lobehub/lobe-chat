import NextAuth from 'next-auth';

import { getServerDBConfig } from '@/config/db';
import { serverDB } from '@/database/server';

import { LobeNextAuthDbAdapter } from './adapter';
import config from './auth.config';

const { NEXT_PUBLIC_ENABLED_SERVER_SERVICE } = getServerDBConfig();

// Use split config to avoid db connection init on edge runtime
// ref: https://authjs.dev/guides/edge-compatibility#split-config

// NextAuth with DB
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...config,
  adapter: NEXT_PUBLIC_ENABLED_SERVER_SERVICE ? LobeNextAuthDbAdapter(serverDB) : undefined,
  session: {
    strategy: 'jwt',
  },
});

// The middleware no longer export from here for 2 reasons:
// 1. NextAuth middleware only run on edge runtime.
// 2. LobeNextAuthDbAdapter use db instance which not available on edge runtime
// So the initialize at `src/middleware.ts` with the config defined at `./auth.config.ts`,
// Ref: https://authjs.dev/guides/edge-compatibility#middleware
