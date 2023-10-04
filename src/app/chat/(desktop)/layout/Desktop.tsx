import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AppLayout from '@/layout/AppLayout';
import { useSwitchSideBarOnInit } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';

import ResponsiveSessionList from '../features/SessionList';

const Desktop = memo<PropsWithChildren>(({ children }) => {
  useSwitchSideBarOnInit(SidebarTabKey.Chat);

  return (
    <AppLayout>
      <ResponsiveSessionList />
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

export default Desktop;
