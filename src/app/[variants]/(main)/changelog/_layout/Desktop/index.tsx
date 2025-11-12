import { Outlet } from 'react-router-dom';

import Hero from '../../features/Hero';
import Container from './Container';

const Layout = () => {
  return (
    <Container>
      <Hero />
      <Outlet />
    </Container>
  );
};

Layout.displayName = 'DesktopChangelogLayout';

export default Layout;
