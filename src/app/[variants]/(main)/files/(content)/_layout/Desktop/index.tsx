import { Flexbox } from 'react-layout-kit';

import FilePanel from '@/features/FileSidePanel';

import { LayoutProps } from '../type';
import Container from './Container';

const Layout = ({ children, menu, modal }: LayoutProps) => {
  return (
    <>
      <Flexbox
        height={'100%'}
        horizontal
        style={{ maxWidth: 'calc(100vw - 64px)', overflow: 'hidden', position: 'relative' }}
        width={'100%'}
      >
        <FilePanel>{menu}</FilePanel>
        <Container>{children}</Container>
      </Flexbox>
      {modal}
    </>
  );
};

Layout.displayName = 'DesktopFileLayout';

export default Layout;
