import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';
import { Outlet } from 'react-router-dom';

import Topic from '@/app/[variants]/(main)/image/_layout/TopicGallery';
import ImageTopicPanel from '@/features/ImageTopicPanel';

import RegisterHotkeys from './RegisterHotkeys';
import Sidebar from './Sidebar';

const Layout = memo(() => {
  const theme = useTheme();
  return (
    <>
      <Flexbox
        height={'100%'}
        horizontal
        style={{ maxWidth: '100%', overflow: 'hidden', position: 'relative' }}
        width={'100%'}
      >
        <Sidebar />
        <Center
          flex={1}
          style={{
            background: theme.colorBgContainerSecondary,
            overflowX: 'hidden',
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          <Flexbox
            gap={16}
            height={'100%'}
            padding={24}
            style={{
              maxWidth: 906,
            }}
            width={'100%'}
          >
            <Outlet />
          </Flexbox>
        </Center>
        <ImageTopicPanel>
          <Topic />
        </ImageTopicPanel>
      </Flexbox>
      <RegisterHotkeys />
    </>
  );
});

Layout.displayName = 'DesktopAiImageLayout';

export default Layout;
