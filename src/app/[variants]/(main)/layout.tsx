import ServerLayout from '@/components/server/NewServerLayout';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';

const Layout = async (props: any) => <ServerLayout Desktop={Desktop} Mobile={Mobile} {...props} />;

Layout.displayName = 'Layout';

export default Layout;
