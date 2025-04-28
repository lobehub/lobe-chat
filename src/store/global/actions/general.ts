import { ThemeMode } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { gt, parse, valid } from 'semver';
import { SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { LOBE_THEME_APPEARANCE } from '@/const/theme';
import { CURRENT_VERSION, isDesktop } from '@/const/version';
import { useOnlyFetchOnceSWR } from '@/libs/swr';
import { globalService } from '@/services/global';
import type { SystemStatus } from '@/store/global/initialState';
import { LocaleMode } from '@/types/locale';
import { setCookie } from '@/utils/client/cookie';
import { switchLang } from '@/utils/client/switchLang';
import { merge } from '@/utils/merge';
import { setNamespace } from '@/utils/storeDebug';

import type { GlobalStore } from '../store';

const n = setNamespace('g');

export interface GlobalGeneralAction {
  switchLocale: (locale: LocaleMode) => void;
  switchThemeMode: (themeMode: ThemeMode) => void;
  updateSystemStatus: (status: Partial<SystemStatus>, action?: any) => void;
  useCheckLatestVersion: (enabledCheck?: boolean) => SWRResponse<string>;
  useInitSystemStatus: () => SWRResponse;
}

export const generalActionSlice: StateCreator<
  GlobalStore,
  [['zustand/devtools', never]],
  [],
  GlobalGeneralAction
> = (set, get) => ({
  switchLocale: (locale) => {
    get().updateSystemStatus({ language: locale });

    switchLang(locale);

    if (isDesktop) {
      (async () => {
        try {
          const { dispatch } = await import('@lobechat/electron-client-ipc');

          await dispatch('updateLocale', locale);
        } catch (error) {
          console.error('Failed to update locale in main process:', error);
        }
      })();
    }
  },
  switchThemeMode: (themeMode) => {
    get().updateSystemStatus({ themeMode });

    setCookie(LOBE_THEME_APPEARANCE, themeMode === 'auto' ? undefined : themeMode);
  },
  updateSystemStatus: (status, action) => {
    if (!get().isStatusInit) return;

    const nextStatus = merge(get().status, status);

    if (isEqual(get().status, nextStatus)) return;

    set({ status: nextStatus }, false, action || n('updateSystemStatus'));
    get().statusStorage.saveToLocalStorage(nextStatus);
  },

  useCheckLatestVersion: (enabledCheck = true) =>
    useOnlyFetchOnceSWR(
      enabledCheck ? 'checkLatestVersion' : null,
      async () => globalService.getLatestVersion(),
      {
        focusThrottleInterval: 1000 * 60 * 30,
        onSuccess: (data: string) => {
          if (!valid(CURRENT_VERSION) || !valid(data)) return;

          const currentVersion = parse(CURRENT_VERSION);
          const latestVersion = parse(data);

          if (!currentVersion || !latestVersion) return;

          const currentMajorMinor = `${currentVersion.major}.${currentVersion.minor}.0`;
          const latestMajorMinor = `${latestVersion.major}.${latestVersion.minor}.0`;

          if (gt(latestMajorMinor, currentMajorMinor)) {
            set({ hasNewVersion: true, latestVersion: data }, false, n('checkLatestVersion'));
          }
        },
      },
    ),

  useInitSystemStatus: () =>
    useOnlyFetchOnceSWR<SystemStatus>(
      'initSystemStatus',
      () => get().statusStorage.getFromLocalStorage(),
      {
        onSuccess: (status) => {
          set({ isStatusInit: true }, false, 'setStatusInit');

          get().updateSystemStatus(status, 'initSystemStatus');
        },
      },
    ),
});
