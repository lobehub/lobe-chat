import ServerLayout from '@/components/server/ServerLayout';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';
import { LayoutProps } from './_layout/type';

const AiImageLayout = ServerLayout({ Desktop, Mobile });

AiImageLayout.displayName = 'AiImageLayout';

const Layout = (props: LayoutProps) => {
  return <AiImageLayout {...props} />;
};

export default Layout;
