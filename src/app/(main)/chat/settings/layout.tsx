import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';

import ServerLayout from '@/components/server/ServerLayout';
import { serverFeatureFlags } from '@/config/server/featureFlags';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';

const SessionSettingsLayout = ServerLayout({ Desktop, Mobile });

const Layout = ({ children }: PropsWithChildren) => {
  const isAgentEditable = serverFeatureFlags().isAgentEditable;
  if (!isAgentEditable) return notFound();

  return <SessionSettingsLayout>{children}</SessionSettingsLayout>;
};

Layout.displayName = 'SessionSettingsLayout';

export default Layout;
