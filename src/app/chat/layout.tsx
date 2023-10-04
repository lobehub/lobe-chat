import { isMobileDevice } from '@/utils/responsive';

import Desktop from './(desktop)/layout';
import Mobile from './(mobile)/layout';

const Layout = () => {
  const mobile = isMobileDevice();

  return mobile ? <Mobile /> : <Desktop />;
};

export default Layout;
