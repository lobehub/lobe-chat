import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { isDev } from '@/utils/env';

import { ChatMessageAction, chatMessage } from './actions/message';
import { ChatPluginAction, chatPlugin } from './actions/plugin';
import { ShareAction, chatShare } from './actions/share';
import { ChatTopicAction, chatTopic } from './actions/topic';
import { ChatTranslateAction, chatTranslate } from './actions/translate';
import { ChatStoreState, initialState } from './initialState';

export interface ChatStoreAction
  extends ChatMessageAction,
    ChatTopicAction,
    ShareAction,
    ChatTranslateAction,
    ChatPluginAction {}

export type ChatStore = ChatStoreAction & ChatStoreState;

//  ===============  聚合 createStoreFn ============ //

const createStore: StateCreator<ChatStore, [['zustand/devtools', never]]> = (...params) => ({
  ...initialState,

  ...chatMessage(...params),
  ...chatTopic(...params),
  ...chatShare(...params),
  ...chatTranslate(...params),
  ...chatPlugin(...params),
});

//  ===============  实装 useStore ============ //

export const useChatStore = createWithEqualityFn<ChatStore>()(
  devtools(createStore, {
    name: 'LOBE_MESSAGES' + (isDev ? '_DEV' : ''),
  }),
  shallow,
);
