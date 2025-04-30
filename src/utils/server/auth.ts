import { enableClerk, enableNextAuth } from '@/const/auth';
import { DESKTOP_USER_ID } from '@/const/desktop';
import { isDesktop } from '@/const/version';

export const getUserAuth = async () => {
  if (enableClerk) {
    const { ClerkAuth } = await import('@/libs/clerk-auth');

    const clerkAuth = new ClerkAuth();

    return await clerkAuth.getAuth();
  }

  if (enableNextAuth) {
    const { default: NextAuthEdge } = await import('@/libs/next-auth/edge');

    const session = await NextAuthEdge.auth();

    const userId = session?.user.id;

    return { nextAuth: session, userId };
  }

  if (isDesktop) {
    return { userId: DESKTOP_USER_ID };
  }

  throw new Error('Auth method is not enabled');
};

/**
 * 从授权头中提取 Bearer Token
 * @param authHeader - 授权头 (例如 "Bearer xxx")
 * @returns Bearer Token 或 null（如果授权头无效或不存在）
 */
export const extractBearerToken = (authHeader?: string | null): string | null => {
  if (!authHeader) return null;

  const trimmedHeader = authHeader.trim(); // Trim leading/trailing spaces

  // Check if it starts with 'Bearer ' (case-insensitive check might be desired depending on spec)
  if (!trimmedHeader.toLowerCase().startsWith('bearer ')) {
    return null;
  }

  // Extract the token part after "Bearer " and trim potential spaces around the token itself
  const token = trimmedHeader.slice(7).trim();

  // Return the token only if it's not an empty string after trimming
  return token || null;
};
