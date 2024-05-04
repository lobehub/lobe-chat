'use client';

import { ActionIcon, MobileNavBar } from '@lobehub/ui';
import { useScroll } from 'ahooks';
import { useTheme } from 'antd-style';
import { Moon, Sun } from 'lucide-react';
import { memo } from 'react';

import { MOBILE_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useUserStore } from '@/store/user';
import { mobileHeaderFixed } from '@/styles/mobileHeader';

const Header = memo(() => {
  const theme = useTheme();
  const scroll = useScroll(() => document.querySelector('#lobe-mobile-scroll-container'));
  const switchThemeMode = useUserStore((s) => s.switchThemeMode);
  const showBackground = (scroll as any)?.top > 44;

  return (
    <MobileNavBar
      right={
        <ActionIcon
          color={showBackground ? undefined : theme.colorBgLayout}
          icon={theme.isDarkMode ? Moon : Sun}
          onClick={() => switchThemeMode(theme.isDarkMode ? 'light' : 'dark')}
          size={MOBILE_HEADER_ICON_SIZE}
        />
      }
      style={{
        ...mobileHeaderFixed,
        background: showBackground ? undefined : 'transparent',
      }}
    />
  );
});

export default Header;
