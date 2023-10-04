import { isMobileDevice } from '@/utils/responsive';

import Desktop from './(desktop)/layout';
import Mobile from './(mobile)/layout';

const mobile = isMobileDevice();

const Layout = mobile ? Mobile : Desktop;

export default Layout;
