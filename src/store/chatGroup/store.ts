import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { chatGroupAction } from './action';
import { ChatGroupStore, initialChatGroupState } from './initialState';

const createStore: StateCreator<ChatGroupStore, [['zustand/devtools', never]]> = (...params) => ({
  ...initialChatGroupState,
  ...chatGroupAction(...params),
});

export const useChatGroupStore = createWithEqualityFn<ChatGroupStore>()(
  subscribeWithSelector(devtools(createStore)),
  shallow,
);

export const getChatGroupStoreState = () => useChatGroupStore.getState();
