import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { ChatGroupAction, chatGroupAction } from './action';
import { ChatGroupState, initialChatGroupState } from './initialState';

export type ChatGroupStore = ChatGroupState & ChatGroupAction;

const createStore: StateCreator<ChatGroupStore, [['zustand/devtools', never]]> = (...params) => ({
  ...initialChatGroupState,
  ...chatGroupAction(...params),
});

export const useAgentGroupStore = createWithEqualityFn<ChatGroupStore>()(
  devtools(createStore),
  shallow,
);

export const getChatGroupStoreState = () => useAgentGroupStore.getState();
