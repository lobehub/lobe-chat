import { Flexbox } from 'react-layout-kit';

import { LayoutProps } from '../type';

const Layout = ({ children }: LayoutProps) => {
  return (
    <Flexbox
      height={'100%'}
      horizontal
      style={{ maxWidth: 'calc(100vw - 64px)', overflow: 'hidden', position: 'relative' }}
      width={'100%'}
    >
      {children}
    </Flexbox>
  );
};

Layout.displayName = 'DesktopRepoLayout';

export default Layout;
