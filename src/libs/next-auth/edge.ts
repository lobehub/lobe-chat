import NextAuth from 'next-auth';

import { getServerDBConfig } from '@/config/db';
import { serverDB } from '@/database/core/dbForEdge';

import { LobeNextAuthDbAdapter } from './adapter';
import config from './auth.config';

const { NEXT_PUBLIC_ENABLED_SERVER_SERVICE } = getServerDBConfig();

/**
 * NextAuth initialization without node Database adapter
 *
 * @example
 * ```ts
 * import NextAuthEdge from '@/libs/next-auth/edge';
 * const { auth } = NextAuthEdge;
 * ```
 *
 * @note
 * We currently use `jwt` strategy for session management.
 * So you don't need to import `signIn` or `signOut` from
 * this module, just import from `next-auth` directly.
 *
 * Inside react component
 * @example
 * ```ts
 * import { signOut } from 'next-auth/react';
 * signOut();
 * ```
 */
export default NextAuth({
  ...config,
  adapter: NEXT_PUBLIC_ENABLED_SERVER_SERVICE ? LobeNextAuthDbAdapter(serverDB) : undefined,
});
