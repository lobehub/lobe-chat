import { Outlet } from 'react-router-dom';

import { Locales } from '@/locales/resources';

import Hero from '../../features/Hero';
import Container from './Container';

const Layout = (props: { locale: Locales }) => {
  const { locale } = props;
  return (
    <Container>
      <Hero />
      <Outlet context={{ locale }} />
    </Container>
  );
};

Layout.displayName = 'DesktopChangelogLayout';

export default Layout;
