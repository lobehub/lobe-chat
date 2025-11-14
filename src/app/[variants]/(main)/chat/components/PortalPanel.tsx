import { Suspense, lazy, memo } from 'react';

import Loading from '@/components/Loading/BrandTextLoading';

import DesktopLayout from './portal/_layout/Desktop';
import MobileLayout from './portal/_layout/Mobile';

const PortalBody = lazy(() => import('@/features/Portal/router'));

interface PortalPanelProps {
  mobile?: boolean;
}

const PortalPanel = memo<PortalPanelProps>(({ mobile }) => {
  const Layout = mobile ? MobileLayout : DesktopLayout;

  return (
    <Suspense fallback={<Loading />}>
      <Layout>
        <PortalBody />
      </Layout>
    </Suspense>
  );
});

PortalPanel.displayName = 'PortalPanel';

export default PortalPanel;
