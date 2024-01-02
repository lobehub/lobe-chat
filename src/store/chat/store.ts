import { PersistOptions, devtools, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createHyperStorage } from '@/store/middleware/createHyperStorage';
import { isDev } from '@/utils/env';
import { isInStandaloneMode } from '@/utils/matchMedia';
import { isMobileScreen } from '@/utils/screen';

import { ChatStoreState, initialState } from './initialState';
import { ChatEnhanceAction, chatEnhance } from './slices/enchance/action';
import { ChatMessageAction, chatMessage } from './slices/message/action';
import { ShareAction, chatShare } from './slices/share/action';
import { ChatPluginAction, chatPlugin } from './slices/tool/action';
import { ChatTopicAction, chatTopic } from './slices/topic/action';

export interface ChatStoreAction
  extends ChatMessageAction,
    ChatTopicAction,
    ShareAction,
    ChatEnhanceAction,
    ChatPluginAction {}

export type ChatStore = ChatStoreAction & ChatStoreState;

//  ===============  聚合 createStoreFn ============ //

const createStore: StateCreator<ChatStore, [['zustand/devtools', never]]> = (...params) => ({
  ...initialState,

  ...chatMessage(...params),
  ...chatTopic(...params),
  ...chatShare(...params),
  ...chatEnhance(...params),
  ...chatPlugin(...params),
});

const persistOptions: PersistOptions<ChatStore> = {
  name: 'LobeChat_Chat',

  // 手动控制 Hydration ，避免 ssr 报错
  skipHydration: true,

  storage: createHyperStorage(() => {
    const isMobileAndPWA = isMobileScreen() && isInStandaloneMode();
    const selectors = [{ activeTopicId: 'topic' }];

    if (isMobileAndPWA)
      return {
        localStorage: {
          selectors,
        },
      };

    return {
      localStorage: false,
      url: {
        mode: 'hash',
        selectors,
      },
    };
  }),
  version: 0,
};

//  ===============  实装 useStore ============ //

export const useChatStore = createWithEqualityFn<ChatStore>()(
  persist(
    devtools(createStore, {
      name: 'LobeChat_Chat' + (isDev ? '_DEV' : ''),
    }),
    persistOptions,
  ),
  shallow,
);
