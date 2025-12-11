'use client';

import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useLocation } from 'react-router-dom';

import StoreSearchBar from '@/app/[variants]/(main)/discover/features/Search';
import UserAvatar from '@/app/[variants]/(main)/discover/features/UserAvatar';
import NavHeader from '@/features/NavHeader';
import { DiscoverTab } from '@/types/discover';

import { useNav } from '../../features/useNav';
import MarketSourceSwitch from '../assistant/features/MarketSourceSwitch';
import SortButton from '../features/SortButton';

const Header = memo(() => {
  const theme = useTheme();
  const location = useLocation();
  const { activeKey } = useNav();
  const isHome = location.pathname === '/';

  return (
    <NavHeader
      left={<StoreSearchBar />}
      right={
        !isHome && (
          <>
            {activeKey === DiscoverTab.Assistants && <MarketSourceSwitch />}
            <SortButton />
            <UserAvatar />
          </>
        )
      }
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
