import { useResponsive } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AppLayout from '@/layout/AppLayout';
import { useSwitchSideBarOnInit } from '@/store/global';
import { usePluginStore } from '@/store/plugin';

import { Sessions } from './features/SessionList';

const ChatLayout = memo<PropsWithChildren>(({ children }) => {
  const { mobile } = useResponsive();

  useSwitchSideBarOnInit('chat');

  const useFetchPluginList = usePluginStore((s) => s.useFetchPluginList);
  useFetchPluginList();

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
