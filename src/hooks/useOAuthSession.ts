import { User } from '@auth/core/types';
import { SessionContextValue, useSession } from 'next-auth/react';
import { useMemo } from 'react';

interface OAuthSession {
  isOAuthLoggedIn: boolean;
  user?: User | null;
}

export const useOAuthSession = () => {
  let authSession: SessionContextValue | null;
  try {
    // refs: https://github.com/lobehub/lobe-chat/pull/1286
    // eslint-disable-next-line react-hooks/rules-of-hooks
    authSession = useSession();
  } catch {
    authSession = null;
  }

  const { data: session, status } = authSession || {};
  const isOAuthLoggedIn = (status === 'authenticated' && session && !!session.user) || false;

  return useMemo<OAuthSession>(() => ({ isOAuthLoggedIn, user: session?.user }), [session, status]);
};
