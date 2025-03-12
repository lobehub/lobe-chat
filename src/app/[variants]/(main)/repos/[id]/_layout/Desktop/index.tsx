import { Flexbox } from 'react-layout-kit';

import FilePanel from '@/features/FileSidePanel';

import { LayoutProps } from '../type';

const Layout = ({ children, menu }: LayoutProps) => {
  return (
    <Flexbox
      height={'100%'}
      horizontal
      style={{ maxWidth: 'calc(100vw - 64px)', overflow: 'hidden', position: 'relative' }}
      width={'100%'}
    >
      <FilePanel>{menu}</FilePanel>
      <Flexbox flex={1} style={{ overflow: 'hidden', position: 'relative' }}>
        {children}
      </Flexbox>
    </Flexbox>
  );
};

Layout.displayName = 'DesktopRepoLayout';

export default Layout;
