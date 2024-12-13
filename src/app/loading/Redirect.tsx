'use client';

import { useRouter } from 'next/navigation';
import { memo, useEffect } from 'react';

import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

const Redirect = memo(() => {
  const router = useRouter();
  const [isLogin, isLoaded, isUserStateInit, isOnboard] = useUserStore(
    (s) => [
      authSelectors.isLogin(s),
      authSelectors.isLoaded(s),
      s.isUserStateInit,
      s.isOnboard,
    ],
  );

  useEffect(() => {
    // if user auth state is not ready, wait for loading
    if (!isLoaded) return;

    // this mean user is definitely not login
    if (!isLogin) {
      router.replace('/chat');
      return;
    }

    // if user state not init, wait for loading
    if (!isUserStateInit) return;

    // user need to onboard
    if (!isOnboard) {
      router.replace('/onboard');
      return;
    }

    // finally check the conversation status
    router.replace('/chat');
  }, [isUserStateInit, isLoaded, isOnboard, isLogin]);

  return null;
});

export default Redirect;
