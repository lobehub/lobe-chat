'use client';

import { ChatHeader } from '@lobehub/ui/chat';
import { useTheme } from 'antd-style';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import HeaderAction from './HeaderAction';
import Tags from './Tags';

const Header = () => {
  const theme = useTheme();
  const showHeader = useGlobalStore(systemStatusSelectors.showChatHeader);

  return (
    showHeader && (
      <ChatHeader
        left={<Tags />}
        right={<HeaderAction />}
        style={{
          background: theme.colorBgContainer,
          border: 'none',
          height: 'unset',
          maxHeight: 'unset',
          minHeight: 'unset',
          padding: 8,
          position: 'relative',
          zIndex: 11,
        }}
      />
    )
  );
};

export default Header;
