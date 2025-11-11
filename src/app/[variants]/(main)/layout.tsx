import ServerLayout from '@/components/server/ServerLayout';

import Desktop from './layouts/desktop';
import Mobile from './layouts/mobile';

const MainLayout = ServerLayout({ Desktop, Mobile });

MainLayout.displayName = 'MainLayout';

export default MainLayout;
