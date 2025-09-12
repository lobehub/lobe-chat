import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { ChatGroupAction, chatGroupAction } from './action';
import { ChatGroupState, initialChatGroupState } from './initialState';

export type ChatGroupStore = ChatGroupAction & ChatGroupState;

const createStore: StateCreator<ChatGroupStore, [['zustand/devtools', never]]> = (...params) => ({
  ...initialChatGroupState,
  ...chatGroupAction(...params),
});

export const useChatGroupStore = createWithEqualityFn<ChatGroupStore>()(
  subscribeWithSelector(devtools(createStore)),
  shallow,
);
