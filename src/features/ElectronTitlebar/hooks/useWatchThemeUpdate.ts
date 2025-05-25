import { useWatchBroadcast } from '@lobechat/electron-client-ipc';
import { useTheme } from 'antd-style';
import { rgba } from 'polished';
import { useEffect } from 'react';

import { useGlobalStore } from '@/store/global';

export const useWatchThemeUpdate = () => {
  const switchThemeMode = useGlobalStore((s) => s.switchThemeMode);

  const token = useTheme();

  useWatchBroadcast('themeChanged', ({ themeMode }) => {
    switchThemeMode(themeMode, { skipBroadcast: true });
  });

  useEffect(() => {
    document.documentElement.style.background = 'none';
    document.body.style.background = rgba(token.colorBgLayout, 0.66);
  }, [token]);
};
