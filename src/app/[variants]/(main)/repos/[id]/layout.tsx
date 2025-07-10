import ServerLayout from '@/components/server/ServerLayout';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';
import { LayoutProps } from './_layout/type';

const Layout = ServerLayout<LayoutProps>({ Desktop, Mobile });

Layout.displayName = 'RepoLayout';

export default (props: LayoutProps) => <Layout {...props} />;

export const dynamic = 'force-static';
