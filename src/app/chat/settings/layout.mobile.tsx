import { PropsWithChildren, memo } from 'react';

import AppMobileLayout from '@/layout/AppMobileLayout';

import Header from './features/Header';

const MobileLayout = memo<PropsWithChildren>(({ children }) => {
  return <AppMobileLayout navBar={<Header />}>{children}</AppMobileLayout>;
});

export default MobileLayout;
