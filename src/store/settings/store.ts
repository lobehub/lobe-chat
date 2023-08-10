import { StateCreator } from 'zustand/vanilla';

import { type AppSettingsState, initialState } from './initialState';
import { type AgentAction, createAgentSlice } from './slices/agent';
import { type CommonAction, createCommonSlice } from './slices/common';

export type SettingsStore = CommonAction & AppSettingsState & AgentAction;

export const createStore: StateCreator<SettingsStore, [['zustand/devtools', never]]> = (
  ...parameters
) => ({
  ...initialState,
  ...createCommonSlice(...parameters),
  ...createAgentSlice(...parameters),
});
