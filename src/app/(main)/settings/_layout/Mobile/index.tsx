import MobileContentLayout from '@/components/server/MobileNavLayout';
import Footer from '@/features/Setting/Footer';

import { LayoutProps } from '../type';
import Header from './Header';

const Layout = ({ children }: LayoutProps) => {
  return (
    <MobileContentLayout header={<Header />}>
      {children}
      <Footer />
    </MobileContentLayout>
  );
};

Layout.displayName = 'MobileSettingsLayout';

export default Layout;
