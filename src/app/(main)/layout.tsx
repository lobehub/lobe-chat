import { isMobileDevice } from '@/utils/responsive';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';
import { LayoutProps } from './_layout/type';

const MainLayout = ({ children, nav }: LayoutProps) => {
  const mobile = isMobileDevice();

  const Layout = mobile ? Mobile : Desktop;

  return <Layout nav={nav}>{children}</Layout>;
};

MainLayout.displayName = 'MainLayout';

export default MainLayout;
