import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';

import { enableClerk } from '@/const/auth';
import { isMobileDevice } from '@/utils/server/responsive';

import MobileLayout from './_layout/Mobile';

const Layout = async ({ children }: PropsWithChildren) => {
  if (!enableClerk) return notFound();

  const mobile = await isMobileDevice();

  if (mobile) return <MobileLayout>{children}</MobileLayout>;

  return children;
};

Layout.displayName = 'ProfileLayout';

export default Layout;
