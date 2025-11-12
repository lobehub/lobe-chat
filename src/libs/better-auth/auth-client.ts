import { createAuthClient } from 'better-auth/react';

import { getAuthConfig } from '@/envs/auth';

const { NEXT_PUBLIC_BETTER_AUTH_URL } = getAuthConfig();

export const { signIn, signUp, useSession } = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: NEXT_PUBLIC_BETTER_AUTH_URL,
});
