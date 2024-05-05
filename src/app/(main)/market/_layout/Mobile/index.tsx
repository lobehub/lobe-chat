import MobileContentLayout from '@/components/server/MobileNavLayout';

import { LayoutProps } from '../type';
import DetailModal from './DetailModal';
import Header from './Header';

const Layout = ({ children, detail }: LayoutProps) => {
  return (
    <>
      <MobileContentLayout
        gap={16}
        header={<Header />}
        style={{ paddingInline: 16, paddingTop: 8 }}
        withNav
      >
        {children}
      </MobileContentLayout>
      <DetailModal>{detail}</DetailModal>
    </>
  );
};

Layout.displayName = 'MobileMarketLayout';

export default Layout;
