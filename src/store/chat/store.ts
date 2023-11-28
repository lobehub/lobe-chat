import { PersistOptions, devtools, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createHyperStorage } from '@/store/middleware/createHyperStorage';
import { isDev } from '@/utils/env';

import { ChatEnhanceAction, chatEnhance } from './actions/enhance';
import { ChatMessageAction, chatMessage } from './actions/message';
import { ChatPluginAction, chatPlugin } from './actions/plugin';
import { ShareAction, chatShare } from './actions/share';
import { ChatTopicAction, chatTopic } from './actions/topic';
import { ChatStoreState, initialState } from './initialState';

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

  storage: createHyperStorage({
    localStorage: false,
    url: {
      mode: 'hash',
      selectors: [{ activeTopicId: 'topic' }],
    },
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
