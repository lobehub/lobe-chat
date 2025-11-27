import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '../middleware/createDevtools';
import { AgentStoreState, initialState } from './initialState';
import { AgentSliceAction, createAgentSlice } from './slices/agent';
import { KnowledgeSliceAction, createKnowledgeSlice } from './slices/knowledge';
import { PluginSliceAction, createPluginSlice } from './slices/plugin';

//  ===============  aggregate createStoreFn ============ //

export interface AgentStore
  extends AgentSliceAction,
    KnowledgeSliceAction,
    PluginSliceAction,
    AgentStoreState {}

const createStore: StateCreator<AgentStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createAgentSlice(...parameters),
  ...createKnowledgeSlice(...parameters),
  ...createPluginSlice(...parameters),
});

//  ===============  implement useStore ============ //

const devtools = createDevtools('agent');

export const useAgentStore = createWithEqualityFn<AgentStore>()(devtools(createStore), shallow);

export const getAgentStoreState = () => useAgentStore.getState();
