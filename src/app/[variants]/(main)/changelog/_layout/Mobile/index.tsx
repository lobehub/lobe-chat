import { Outlet } from 'react-router-dom';

import MobileContentLayout from '@/components/server/MobileNavLayout';
import { Locales } from '@/locales/resources';

import Hero from '../../features/Hero';
import Header from './Header';

const Layout = (props: { locale: Locales }) => {
  const { locale } = props;
  return (
    <MobileContentLayout header={<Header />} padding={16}>
      <Hero />
      <Outlet context={{ locale }} />
    </MobileContentLayout>
  );
};

Layout.displayName = 'MobileChangelogLayout';

export default Layout;
