import { StateCreator } from 'zustand/vanilla';

import { type SettingsAction, createSettings } from './action';
import { type SettingsState, initialState } from './initialState';

export type SettingsStore = SettingsAction & SettingsState;

export const createStore: StateCreator<SettingsStore, [['zustand/devtools', never]]> = (
  ...parameters
) => ({
  ...initialState,
  ...createSettings(...parameters),
});
