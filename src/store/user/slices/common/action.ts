import useSWR, { SWRResponse } from 'swr';
import { DeepPartial } from 'utility-types';
import type { StateCreator } from 'zustand/vanilla';

import { globalService } from '@/services/global';
import { messageService } from '@/services/message';
import { userService } from '@/services/user';
import type { UserStore } from '@/store/user';
import type { GlobalServerConfig } from '@/types/serverConfig';
import type { GlobalSettings } from '@/types/settings';
import { merge } from '@/utils/merge';
import { setNamespace } from '@/utils/storeDebug';

import { preferenceSelectors } from '../preference/selectors';

const n = setNamespace('common');

/**
 * 设置操作
 */
export interface CommonAction {
  updateAvatar: (avatar: string) => Promise<void>;
  useCheckTrace: (shouldFetch: boolean) => SWRResponse;
  useFetchServerConfig: () => SWRResponse;
}

export const createCommonSlice: StateCreator<
  UserStore,
  [['zustand/devtools', never]],
  [],
  CommonAction
> = (set, get) => ({
  updateAvatar: async (avatar) => {
    await userService.updateAvatar(avatar);
    await get().refreshUserConfig();
  },

  useCheckTrace: (shouldFetch) =>
    useSWR<boolean>(
      ['checkTrace', shouldFetch],
      () => {
        const userAllowTrace = preferenceSelectors.userAllowTrace(get());
        // if not init with server side, return false
        if (!shouldFetch) return Promise.resolve(false);

        // if user have set the trace, return false
        if (typeof userAllowTrace === 'boolean') return Promise.resolve(false);

        return messageService.messageCountToCheckTrace();
      },
      {
        revalidateOnFocus: false,
      },
    ),

  useFetchServerConfig: () =>
    useSWR<GlobalServerConfig>('fetchGlobalConfig', globalService.getGlobalConfig, {
      onSuccess: (data) => {
        if (data) {
          const serverSettings: DeepPartial<GlobalSettings> = {
            defaultAgent: data.defaultAgent,
            languageModel: data.languageModel,
          };

          const defaultSettings = merge(get().defaultSettings, serverSettings);

          set({ defaultSettings, serverConfig: data }, false, n('initGlobalConfig'));

          get().refreshDefaultModelProviderList({ trigger: 'fetchServerConfig' });
        }
      },
      revalidateOnFocus: false,
    }),
});
