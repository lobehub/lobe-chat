import { ReactNode } from 'react';

import Hero from '../../features/Hero';
import Container from './Container';

type Props = { children: ReactNode };

const Layout = ({ children }: Props) => {
  return (
    <Container>
      <Hero />
      {children}
    </Container>
  );
};

Layout.displayName = 'DesktopChangelogLayout';

export default Layout;
