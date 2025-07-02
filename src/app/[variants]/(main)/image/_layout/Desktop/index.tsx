import { Flexbox } from 'react-layout-kit';

import ImagePanel from '@/features/ImageSidePanel';
import ImageTopicPanel from '@/features/ImageTopicPanel';

import { LayoutProps } from '../type';
import Container from './Container';
import RegisterHotkeys from './RegisterHotkeys';

const Layout = ({ children, menu, topic }: LayoutProps) => {
  return (
    <>
      <Flexbox
        height={'100%'}
        horizontal
        style={{ maxWidth: '100%', overflow: 'hidden', position: 'relative' }}
        width={'100%'}
      >
        <ImagePanel>{menu}</ImagePanel>
        <Container>{children}</Container>
        <ImageTopicPanel>{topic}</ImageTopicPanel>
      </Flexbox>
      <RegisterHotkeys />
    </>
  );
};

Layout.displayName = 'DesktopAiImageLayout';

export default Layout;
