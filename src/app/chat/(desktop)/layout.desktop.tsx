import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AppLayoutDesktop from '@/layout/AppLayout.desktop';

import ResponsiveSessionList from './features/SessionList';

export default memo(({ children }: PropsWithChildren) => (
  <AppLayoutDesktop>
    <ResponsiveSessionList />
    <Flexbox
      flex={1}
      height={'100vh'}
      id={'lobe-conversion-container'}
      style={{ position: 'relative' }}
    >
      {children}
    </Flexbox>
  </AppLayoutDesktop>
));
