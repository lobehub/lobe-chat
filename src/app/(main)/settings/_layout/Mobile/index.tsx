import MobileContentLayout from '@/components/server/MobileNavLayout';

import { LayoutProps } from '../type';
import Header from './Header';

const Layout = ({ children }: LayoutProps) => {
  return <MobileContentLayout header={<Header />}>{children}</MobileContentLayout>;
};

Layout.displayName = 'MobileSettingsLayout';

export default Layout;
