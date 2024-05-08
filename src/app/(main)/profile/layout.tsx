import { PropsWithChildren } from 'react';

import { isMobileDevice } from '@/utils/responsive';

import MobileLayout from './_layout/Mobile';

const Layout = ({ children }: PropsWithChildren) => {
  const mobile = isMobileDevice();

  if (mobile) return <MobileLayout>{children}</MobileLayout>;

  return children;
};

export default Layout;
