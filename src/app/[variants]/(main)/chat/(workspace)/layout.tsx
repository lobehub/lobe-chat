import ServerLayout from '@/components/server/NewServerLayout';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';
import { LayoutProps } from './_layout/type';

const Layout = async (props: LayoutProps) => (
  <ServerLayout Desktop={Desktop} Mobile={Mobile} {...props} />
);

Layout.displayName = 'ChatConversationLayout';

export default Layout;
