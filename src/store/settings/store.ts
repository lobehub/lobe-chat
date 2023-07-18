import { StateCreator } from 'zustand/vanilla';

import { type SettingsAction, createSettings } from './action';
import { type GlobalSettingsState, initialState } from './initialState';

export type SettingsStore = SettingsAction & GlobalSettingsState;

export const createStore: StateCreator<SettingsStore, [['zustand/devtools', never]]> = (
  ...parameters
) => ({
  ...initialState,
  ...createSettings(...parameters),
});
