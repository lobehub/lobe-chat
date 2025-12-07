'use client';

import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import NavHeader from '@/features/NavHeader';

import WideScreenButton from '../../../../../../../features/WideScreenContainer/WideScreenButton';
import ShareButton from './ShareButton';
import Tags from './Tags';

const Header = memo(() => {
  const theme = useTheme();
  return (
    <NavHeader
      left={
        <Flexbox style={{ backgroundColor: theme.colorBgContainer }}>
          <Tags />
        </Flexbox>
      }
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
