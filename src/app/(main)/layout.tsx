import ServerLayout from '@/components/server/ServerLayout';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';
import { LayoutProps } from './_layout/type';

const MainLayout = ServerLayout<LayoutProps>({ Desktop, Mobile });

MainLayout.displayName = 'MainLayout';

export default MainLayout;
