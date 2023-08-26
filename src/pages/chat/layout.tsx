import { useResponsive } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AppLayout from '@/layout/AppLayout';
import { useSwitchSideBarOnInit } from '@/store/global';

import { Sessions } from './SessionList';

const ChatLayout = memo<PropsWithChildren>(({ children }) => {
  const { mobile } = useResponsive();
  useSwitchSideBarOnInit('chat');

  return (
    <AppLayout>
      <Sessions />
      {!mobile && (
        <Flexbox
          flex={1}
          height={'100vh'}
          id={'lobe-conversion-container'}
          style={{ position: 'relative' }}
        >
          {children}
        </Flexbox>
      )}
    </AppLayout>
  );
});

export default ChatLayout;
