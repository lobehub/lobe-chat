import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AppLayout from '@/layout/AppLayout';
import { useSwitchSideBarOnInit } from '@/store/global';

import { Sessions } from './features/SessionList';

const ChatLayout = memo<PropsWithChildren>(({ children }) => {
  useSwitchSideBarOnInit('chat');

  return (
    <AppLayout>
      <Sessions />
      <Flexbox
        flex={1}
        height={'100vh'}
        id={'lobe-conversion-container'}
        style={{ position: 'relative' }}
      >
        {children}
      </Flexbox>
    </AppLayout>
  );
});

export default ChatLayout;
