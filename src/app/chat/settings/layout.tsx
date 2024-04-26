import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';

import { serverFeatureFlags } from '@/config/server/featureFlags';

const Layout = ({ children }: PropsWithChildren) => {
  const isAgentEditable = serverFeatureFlags().isAgentEditable;

  if (!isAgentEditable) return notFound();

  return children;
};

export default Layout;
