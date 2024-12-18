'use client';

import { useRouter } from 'next/navigation';
import { memo, useEffect } from 'react';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

import { AppLoadingStage } from './type';

interface RedirectProps {
  setLoadingStage: (value: AppLoadingStage) => void;
}

const Redirect = memo<RedirectProps>(({ setLoadingStage }) => {
  const router = useRouter();
  const [isLogin, isLoaded, isUserStateInit, isOnboard] = useUserStore((s) => [
    authSelectors.isLogin(s),
    authSelectors.isLoaded(s),
    s.isUserStateInit,
    s.isOnboard,
  ]);
  const isPgliteNotEnabled = useGlobalStore(systemStatusSelectors.isPgliteNotEnabled);

  const navToChat = () => {
    setLoadingStage(AppLoadingStage.GoToChat);
    router.replace('/chat');
  };

  useEffect(() => {
    // if pglite is not enabled, redirect to chat
    if (isPgliteNotEnabled) {
      navToChat();
      return;
    }

    // if user auth state is not ready, wait for loading
    if (!isLoaded) {
      setLoadingStage(AppLoadingStage.InitAuth);
      return;
    }

    // this mean user is definitely not login
    if (!isLogin) {
      navToChat();
      return;
    }

    // if user state not init, wait for loading
    if (!isUserStateInit) {
      setLoadingStage(AppLoadingStage.InitUser);
      return;
    }

    // user need to onboard
    if (!isOnboard) {
      router.replace('/onboard');
      return;
    }

    // finally check the conversation status
    navToChat();
  }, [isUserStateInit, isLoaded, isOnboard, isLogin, isPgliteNotEnabled]);

  return null;
});

export default Redirect;
