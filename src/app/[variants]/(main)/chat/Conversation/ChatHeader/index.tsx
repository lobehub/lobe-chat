'use client';

import { ChatHeader } from '@lobehub/ui/chat';
import { useTheme } from 'antd-style';
import { memo } from 'react';

import HeaderAction from './HeaderAction';
import Tags from './Tags';

const Header = memo(() => {
  const theme = useTheme();

  return (
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
  );
});

export default Header;
