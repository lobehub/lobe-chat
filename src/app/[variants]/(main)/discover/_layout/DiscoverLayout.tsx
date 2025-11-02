'use client';

import { notFound } from 'next/navigation';
import { PropsWithChildren, memo } from 'react';

import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import Desktop from './Desktop';
import Mobile from './Mobile';

interface DiscoverLayoutProps extends PropsWithChildren {
  mobile?: boolean;
}

const DiscoverLayout = memo<DiscoverLayoutProps>(({ children, mobile }) => {
  const { showMarket } = useServerConfigStore(featureFlagsSelectors);

  if (!showMarket) {
    notFound();
  }

  if (mobile) {
    return <Mobile>{children}</Mobile>;
  }

  return <Desktop>{children}</Desktop>;
});

DiscoverLayout.displayName = 'DiscoverLayout';

export default DiscoverLayout;
