import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import NProgress from '@/components/NProgress';
import { serverFeatureFlags } from '@/config/featureFlags';
import { MAX_WIDTH } from '@/const/layoutTokens';

import ProviderMenu from './ProviderMenu';

const Layout = ({ children }: PropsWithChildren) => {
  const showLLM = serverFeatureFlags().showProvider;
  if (!showLLM) return notFound();

  return (
    <>
      <NProgress />
      <Flexbox horizontal width={'100%'}>
        <ProviderMenu />
        <Flexbox horizontal justify={'center'} paddingBlock={24} width={'100%'}>
          <Flexbox style={{ maxWidth: MAX_WIDTH, width: '100%' }}>{children}</Flexbox>
        </Flexbox>
      </Flexbox>
    </>
  );
};
export default Layout;
