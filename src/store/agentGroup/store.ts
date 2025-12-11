import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { chatGroupAction } from './action';
import { ChatGroupStore, initialChatGroupState } from './initialState';

const createStore: StateCreator<ChatGroupStore, [['zustand/devtools', never]]> = (...params) => {
  const actions = chatGroupAction(...params);

  return {
    ...initialChatGroupState,
    ...actions,
  };
};

export const useAgentGroupStore = createWithEqualityFn<ChatGroupStore>()(
  devtools(createStore),
  shallow,
);

export const getChatGroupStoreState = () => useAgentGroupStore.getState();
