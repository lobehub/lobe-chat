import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';

import ServerLayout from '@/components/server/ServerLayout';
import { serverFeatureFlags } from '@/config/featureFlags';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';

const Layout = ServerLayout({ Desktop, Mobile });

const ProviderSettingsLayout = ({ children, ...res }: PropsWithChildren) => {
  const showLLM = serverFeatureFlags().showProvider;
  if (!showLLM) return notFound();

  return <Layout {...res}>{children}</Layout>;
};

ProviderSettingsLayout.displayName = 'ProviderSettingsLayout';

export default ProviderSettingsLayout;
