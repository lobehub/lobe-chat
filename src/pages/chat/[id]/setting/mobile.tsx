import { PropsWithChildren, memo } from 'react';

import AppMobileLayout from '@/layout/AppMobileLayout';

import Header from './Header';

const MobileLayout = memo<PropsWithChildren>(({ children }) => {
  return <AppMobileLayout navBar={<Header mobile />}>{children}</AppMobileLayout>;
});

export default MobileLayout;
