import { isMobileDevice } from '@/utils/responsive';

import Desktop from './(desktop)/layout.desktop';
import Mobile from './(mobile)/layout.mobile';

const mobile = isMobileDevice();

const Layout = mobile ? Mobile : Desktop;

export default Layout;
