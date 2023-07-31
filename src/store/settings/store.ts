import { StateCreator } from 'zustand/vanilla';

import { type SettingsAction, createSettings } from './action';
import { type AppSettingsState, initialState } from './initialState';

export type SettingsStore = SettingsAction & AppSettingsState;

export const createStore: StateCreator<SettingsStore, [['zustand/devtools', never]]> = (
  ...parameters
) => ({
  ...initialState,
  ...createSettings(...parameters),
});
