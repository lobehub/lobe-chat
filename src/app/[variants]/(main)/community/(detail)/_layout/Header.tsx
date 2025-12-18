'use client';

import { useTheme } from 'antd-style';
import { memo } from 'react';

import StoreSearchBar from '@/app/[variants]/(main)/community/features/Search';
import UserAvatar from '@/app/[variants]/(main)/community/features/UserAvatar';
import NavHeader from '@/features/NavHeader';

const Header = memo(() => {
  const theme = useTheme();

  return (
    <NavHeader
      left={<StoreSearchBar />}
      right={<UserAvatar />}
      style={{
        borderBottom: `1px solid ${theme.colorBorderSecondary}`,
      }}
      styles={{
        left: { flex: 1 },
      }}
    />
  );
});

export default Header;
