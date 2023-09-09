import type { StateCreator } from 'zustand/vanilla';

import { type StoreAction, createSettings } from './action';
import { type StroeState, initialState } from './initialState';

export type Store = StoreAction & StroeState;

export const createStore: StateCreator<Store, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createSettings(...parameters),
});
