import { auth } from '@clerk/nextjs/server';

import { enableClerk, enableNextAuth } from '@/const/auth';
import NextAuthEdge from '@/libs/next-auth/edge';

export const getUserAuth = async () => {
  if (enableClerk) {
    const clerkAuth = await auth();

    const userId = clerkAuth.userId;
    return { clerkAuth: auth, userId };
  }

  if (enableNextAuth) {
    const session = await NextAuthEdge.auth();

    const userId = session?.user.id;

    if (session?.error === 'RefreshTokenError') {
      // If we fail to refresh the token,
      // don't return the userId
      return { nextAuth: session };
    }

    return { nextAuth: session, userId };
  }

  throw new Error('Auth method is not enabled');
};
