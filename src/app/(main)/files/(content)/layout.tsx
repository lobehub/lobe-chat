import ServerLayout from '@/components/server/ServerLayout';
import { isServerMode } from '@/const/version';

import NotSupportClient from './NotSupportClient';
import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';
import { LayoutProps } from './_layout/type';

const Layout = ServerLayout<LayoutProps>({ Desktop, Mobile });

Layout.displayName = 'FileLayout';

export default (props: LayoutProps) => {
  // if there is client db mode , tell user to switch to server mode
  if (!isServerMode) return <NotSupportClient />;

  return <Layout {...props} />;
};
