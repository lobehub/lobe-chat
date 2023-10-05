'use client';

import { PropsWithChildren, memo } from 'react';

import { useEffectAfterSessionHydrated } from '@/store/session';

const ChatMobileLayout = memo<PropsWithChildren>(({ children }) => {
  useEffectAfterSessionHydrated((store) => {
    store.setState({ isMobile: true });
  }, []);

  return children;
});

export default ChatMobileLayout;
