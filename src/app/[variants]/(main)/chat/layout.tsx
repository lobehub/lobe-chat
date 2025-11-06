import { ReactNode } from 'react';

import { serverFeatureFlags } from '@/config/featureFlags';

import { FeatureFlagsProvider } from './_layout/FeatureFlagsProvider';
import { LayoutProps } from './_layout/type';

const Layout = (props: LayoutProps & { children: ReactNode }) => {
  const { hideDocs, showChangelog } = serverFeatureFlags();

  return (
    <FeatureFlagsProvider hideDocs={hideDocs} showChangelog={showChangelog}>
      {props?.children}
    </FeatureFlagsProvider>
  );
};

Layout.displayName = 'ChatLayout';

export default Layout;
