import { useWatchBroadcast } from '@lobechat/electron-client-ipc';

import { useGlobalStore } from '@/store/global';

export const useWatchThemeUpdate = () => {
  const switchThemeMode = useGlobalStore((s) => s.switchThemeMode);

  useWatchBroadcast('themeChanged', ({ theme }) => {
    switchThemeMode(theme, { skipBroadcast: true });
  });
};
