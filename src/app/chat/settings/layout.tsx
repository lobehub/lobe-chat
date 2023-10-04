import { isMobileDevice } from '@/utils/responsive';

import Desktop from './(desktop)/layout.desktop';
import Mobile from './(mobile)/layout.mobile';

const Layout = () => {
  const mobile = isMobileDevice();

  return mobile ? <Mobile /> : <Desktop />;
};

export default Layout;
