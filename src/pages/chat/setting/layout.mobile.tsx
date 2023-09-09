import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AppMobileLayout from '@/layout/AppMobileLayout';

import Header from './features/Header';

const MobileLayout = memo<PropsWithChildren>(({ children }) => {
  return (
    <AppMobileLayout navBar={<Header />}>
      <Flexbox gap={16} padding={16}>
        {children}
      </Flexbox>
    </AppMobileLayout>
  );
});

export default MobileLayout;
