import { notFound } from 'next/navigation';
import { ReactNode } from 'react';

import ServerLayout from '@/components/server/ServerLayout';
import { isDesktop } from '@/const/version';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';

const Layout = ServerLayout({ Desktop, Mobile });

const MainLayout = (props: { children: ReactNode }) => {
  if (isDesktop) return notFound();

  return <Layout {...props} />;
};

MainLayout.displayName = 'ChangelogLayout';

export default MainLayout;
