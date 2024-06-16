import Footer from '@/app/(main)/settings/features/Footer';
import MobileContentLayout from '@/components/server/MobileNavLayout';

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
