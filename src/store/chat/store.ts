import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { isDev } from '@/utils/env';

import { ChatStoreState, initialState } from './initialState';
import { ChatEnhanceAction, chatEnhance } from './slices/enchance/action';
import { ChatMessageAction, chatMessage } from './slices/message/action';
import { ChatPluginAction, chatPlugin } from './slices/plugin/action';
import { ShareAction, chatShare } from './slices/share/action';
import { ChatToolAction, chatToolSlice } from './slices/tool/action';
import { ChatTopicAction, chatTopic } from './slices/topic/action';

export interface ChatStoreAction
  extends ChatMessageAction,
    ChatTopicAction,
    ShareAction,
    ChatEnhanceAction,
    ChatPluginAction,
    ChatToolAction {}

export type ChatStore = ChatStoreAction & ChatStoreState;

//  ===============  聚合 createStoreFn ============ //

const createStore: StateCreator<ChatStore, [['zustand/devtools', never]]> = (...params) => ({
  ...initialState,

  ...chatMessage(...params),
  ...chatTopic(...params),
  ...chatShare(...params),
  ...chatEnhance(...params),
  ...chatToolSlice(...params),
  ...chatPlugin(...params),
});

//  ===============  实装 useStore ============ //

export const useChatStore = createWithEqualityFn<ChatStore>()(
  subscribeWithSelector(
    devtools(createStore, {
      name: 'LobeChat_Chat' + (isDev ? '_DEV' : ''),
    }),
  ),
  shallow,
);
