'use client';

import { useResponsive } from 'antd-style';
import { PropsWithChildren, memo } from 'react';

import { useEffectAfterSessionHydrated } from '@/store/session/hooks';

import MobileLayout from '../../(mobile)/layout';
import DesktopLayout from './Desktop';

const Chat = memo<PropsWithChildren>(({ children }) => {
  const { mobile } = useResponsive();

  const RenderLayout = mobile ? MobileLayout : DesktopLayout;

  useEffectAfterSessionHydrated(
    (store) => {
      store.setState({ isMobile: mobile });
    },
    [mobile],
  );

  return <RenderLayout>{children}</RenderLayout>;
});
export default Chat;
