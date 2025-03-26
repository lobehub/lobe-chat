import { enableClerk, enableNextAuth } from '@/const/auth';
import { ClerkAuth } from '@/libs/clerk-auth';
import NextAuthEdge from '@/libs/next-auth/edge';

export const getUserAuth = async () => {
  if (enableClerk) {
    const clerkAuth = new ClerkAuth();

    return await clerkAuth.getAuth();
  }

  if (enableNextAuth) {
    const session = await NextAuthEdge.auth();

    const userId = session?.user.id;

    return { nextAuth: session, userId };
  }

  throw new Error('Auth method is not enabled');
};
