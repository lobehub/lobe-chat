// sort-imports-ignore
import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { ChatStoreState, initialState } from './initialState';
import { ChatMessageAction, chatMessage } from './slices/message/action';
import { ChatTopicAction, chatTopic } from './slices/topic/action';
import { devtools } from '@csark0812/zustand-expo-devtools';
import { ChatThreadAction, chatThreadMessage } from './slices/thread/action';
import { chatAiChat, ChatAIChatAction } from '@/store/chat/slices/aiChat/actions';

export interface ChatStoreAction
  extends ChatMessageAction,
    ChatAIChatAction,
    ChatTopicAction,
    ChatThreadAction {}

export type ChatStore = ChatStoreAction & ChatStoreState;

//  ===============  聚合 createStoreFn ============ //

const createStore: StateCreator<ChatStore, [['zustand/devtools', never]]> = (...params) => ({
  ...initialState,
  ...chatMessage(...params),
  ...chatAiChat(...params),
  ...chatThreadMessage(...params),
  ...chatTopic(...params),

  // cloud
});

//  ===============  实装 useStore ============ //
// const devtools = createDevtools('chat');

export const useChatStore = createWithEqualityFn<ChatStore>()(
  subscribeWithSelector(devtools(createStore)),
  shallow,
);

export const getChatStoreState = () => useChatStore.getState();
