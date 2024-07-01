import React, { Suspense, lazy } from 'react';

import Loading from '@/components/CircleLoading';
import { isMobileDevice } from '@/utils/responsive';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';

const InspectorContent = lazy(() => import('./index'));

const Inspector = () => {
  const mobile = isMobileDevice();

  const Layout = mobile ? Mobile : Desktop;

  return (
    <Layout>
      <Suspense fallback={<Loading />}>
        <InspectorContent />
      </Suspense>
    </Layout>
  );
};

Inspector.displayName = 'ChatInspector';

export default Inspector;
