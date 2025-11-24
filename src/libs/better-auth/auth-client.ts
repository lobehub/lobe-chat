import {
  genericOAuthClient,
  inferAdditionalFields,
  magicLinkClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import type { auth } from '@/auth';
import { getAuthConfig } from '@/envs/auth';

const { NEXT_PUBLIC_BETTER_AUTH_URL } = getAuthConfig();
const enableMagicLink = getAuthConfig().NEXT_PUBLIC_ENABLE_MAGIC_LINK;

export const { sendVerificationEmail, signIn, signOut, signUp, useSession } = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    inferAdditionalFields<typeof auth>(),
    genericOAuthClient(),
    ...(enableMagicLink ? [magicLinkClient()] : []),
  ],
});
