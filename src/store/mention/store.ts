import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '../middleware/createDevtools';
import { MentionAction, createMentionSlice } from './action';
import { MentionState, initialMentionState } from './initialState';

export type MentionStore = MentionState & MentionAction;

const createStore: StateCreator<MentionStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialMentionState,
  ...createMentionSlice(...parameters),
});

const devtools = createDevtools('mention');

export const useMentionStore = createWithEqualityFn<MentionStore>()(devtools(createStore), shallow);

export const getMentionStoreState = () => useMentionStore.getState();
