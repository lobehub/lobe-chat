import React, { Suspense, lazy } from 'react';

import Loading from '@/components/CircleLoading';
import { isMobileDevice } from '@/utils/server/responsive';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';

const PortalBody = lazy(() => import('@/features/Portal/router'));

const Inspector = async () => {
  const mobile = await isMobileDevice();

  const Layout = mobile ? Mobile : Desktop;

  return (
    <Suspense fallback={<Loading />}>
      <Layout>
        <PortalBody />
      </Layout>
    </Suspense>
  );
};

Inspector.displayName = 'ChatInspector';

export default Inspector;
