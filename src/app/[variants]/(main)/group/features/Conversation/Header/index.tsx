'use client';

import { Flexbox } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo } from 'react';

import NavHeader from '@/features/NavHeader';
import WideScreenButton from '@/features/WideScreenContainer/WideScreenButton';

import ShareButton from './ShareButton';

const Header = memo(() => {
  const theme = useTheme();
  return (
    <NavHeader
      right={
        <Flexbox horizontal style={{ backgroundColor: theme.colorBgContainer }}>
          <WideScreenButton />
          <ShareButton />
        </Flexbox>
      }
    />
  );
});

export default Header;
