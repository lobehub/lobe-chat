import React, { Suspense, lazy } from 'react';

import Loading from '@/components/CircleLoading';
import { isMobileDevice } from '@/utils/responsive';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';

const PortalView = lazy(() => import('./router'));

const Inspector = () => {
  const mobile = isMobileDevice();

  const Layout = mobile ? Mobile : Desktop;

  return (
    <Suspense fallback={<Loading />}>
      <Layout>
        <PortalView />
      </Layout>
    </Suspense>
  );
};

Inspector.displayName = 'ChatInspector';

export default Inspector;
