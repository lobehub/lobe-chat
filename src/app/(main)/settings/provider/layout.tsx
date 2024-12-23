import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import { serverFeatureFlags } from '@/config/featureFlags';

import ProviderMenu from './ProviderMenu';

const Layout = ({ children }: PropsWithChildren) => {
  const showLLM = serverFeatureFlags().showProvider;
  if (!showLLM) return notFound();

  return (
    <Flexbox horizontal>
      <ProviderMenu />
      {children}
    </Flexbox>
  );
};
export default Layout;
