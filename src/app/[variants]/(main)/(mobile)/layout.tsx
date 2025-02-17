import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';

import { isDesktop } from '@/const/version';

const Layout = ({ children }: PropsWithChildren) => {
  if (isDesktop) return notFound();

  return children;
};

export default Layout;
