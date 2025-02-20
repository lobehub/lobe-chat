'use client';

import { ActionIcon } from '@lobehub/ui';
import { MobileNavBar } from '@lobehub/ui/mobile';
import { useTheme } from 'antd-style';
import { Moon, Sun } from 'lucide-react';
import { memo } from 'react';

import { MOBILE_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useUserStore } from '@/store/user';
import { mobileHeaderSticky } from '@/styles/mobileHeader';

const Header = memo(() => {
  const theme = useTheme();
  const switchThemeMode = useUserStore((s) => s.switchThemeMode);

  return (
    <MobileNavBar
      right={
        <ActionIcon
          icon={theme.isDarkMode ? Moon : Sun}
          onClick={() => switchThemeMode(theme.isDarkMode ? 'light' : 'dark')}
          size={MOBILE_HEADER_ICON_SIZE}
        />
      }
      style={mobileHeaderSticky}
    />
  );
});

export default Header;
