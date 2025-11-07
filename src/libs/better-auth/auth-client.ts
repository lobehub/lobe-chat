import { createAuthClient } from 'better-auth/react';

import { getAuthConfig } from '@/envs/auth';

const { BETTER_AUTH_URL } = getAuthConfig();

export const { signIn, signUp, useSession } = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: BETTER_AUTH_URL,
});
