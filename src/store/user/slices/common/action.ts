import useSWR, { SWRResponse, mutate } from 'swr';
import { DeepPartial } from 'utility-types';
import type { StateCreator } from 'zustand/vanilla';

import { DEFAULT_PREFERENCE } from '@/const/user';
import { useOnlyFetchOnceSWR } from '@/libs/swr';
import { userService } from '@/services/user';
import type { UserStore } from '@/store/user';
import type { GlobalServerConfig } from '@/types/serverConfig';
import { LobeUser, UserInitializationState } from '@/types/user';
import type { UserSettings } from '@/types/user/settings';
import { merge } from '@/utils/merge';
import { setNamespace } from '@/utils/storeDebug';

import { preferenceSelectors } from '../preference/selectors';

const n = setNamespace('common');

const GET_USER_STATE_KEY = 'initUserState';
/**
 * 设置操作
 */
export interface CommonAction {
  refreshUserState: () => Promise<void>;

  updateAvatar: (avatar: string) => Promise<void>;
  useCheckTrace: (shouldFetch: boolean) => SWRResponse;
  useInitUserState: (
    isLogin: boolean | undefined,
    serverConfig: GlobalServerConfig,
    options?: {
      onSuccess: (data: UserInitializationState) => void;
    },
  ) => SWRResponse;
}

export const createCommonSlice: StateCreator<
  UserStore,
  [['zustand/devtools', never]],
  [],
  CommonAction
> = (set, get) => ({
  refreshUserState: async () => {
    await mutate(GET_USER_STATE_KEY);
  },
  updateAvatar: async (avatar) => {
    // 1. 更新服务端/数据库中的头像
    await userService.updateAvatar(avatar);

    // 2. 手动获取完整的最新用户状态
    const newUserState = await userService.getUserState();

    // 3. 使用完整用户状态更新缓存，确保所有相关字段都更新
    await mutate(GET_USER_STATE_KEY, newUserState, { revalidate: false });

    // 4. 强制更新 Zustand store 中的用户数据
    if (newUserState && newUserState.avatar) {
      set(
        (state: UserStore) => ({
          user: {
            ...state.user,
            avatar: newUserState.avatar,
          } as UserStore['user'],
        }),
        false,
        n('updateAvatarInStore'),
      );
    }
  },

  useCheckTrace: (shouldFetch) =>
    useSWR<boolean>(
      shouldFetch ? 'checkTrace' : null,
      () => {
        const userAllowTrace = preferenceSelectors.userAllowTrace(get());

        // if user have set the trace, return false
        if (typeof userAllowTrace === 'boolean') return Promise.resolve(false);

        return Promise.resolve(get().isUserCanEnableTrace);
      },
      {
        revalidateOnFocus: false,
      },
    ),

  useInitUserState: (isLogin, serverConfig, options) =>
    useOnlyFetchOnceSWR<UserInitializationState>(
      !!isLogin ? GET_USER_STATE_KEY : null,
      () => userService.getUserState(),
      {
        onSuccess: (data) => {
          options?.onSuccess?.(data);

          if (data) {
            // merge settings
            const serverSettings: DeepPartial<UserSettings> = {
              defaultAgent: serverConfig.defaultAgent,
              languageModel: serverConfig.languageModel,
              systemAgent: serverConfig.systemAgent,
            };

            const defaultSettings = merge(get().defaultSettings, serverSettings);

            // merge preference
            const isEmpty = Object.keys(data.preference || {}).length === 0;
            const preference = isEmpty ? DEFAULT_PREFERENCE : data.preference;

            // if there is avatar or userId (from client DB), update it into user
            const user =
              data.avatar || data.userId
                ? merge(get().user, {
                    avatar: data.avatar,
                    firstName: data.firstName,
                    fullName: data.fullName,
                    id: data.userId,
                    latestName: data.lastName,
                    username: data.username,
                  } as LobeUser)
                : get().user;
            // console.log('user', user);
            set(
              {
                defaultSettings,
                isOnboard: data.isOnboard,
                isShowPWAGuide: data.canEnablePWAGuide,
                isUserCanEnableTrace: data.canEnableTrace,
                isUserHasConversation: data.hasConversation,
                isUserStateInit: true,
                preference,
                serverLanguageModel: serverConfig.languageModel,
                settings: data.settings || {},
                user,
              },
              false,
              n('initUserState'),
            );

            get().refreshDefaultModelProviderList({ trigger: 'fetchUserState' });
          }
        },
      },
    ),
});
