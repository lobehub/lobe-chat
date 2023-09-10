import type { StateCreator } from 'zustand/vanilla';

import { type StoreAction, createMarketAction } from './action';
import { type StroeState, initialState } from './initialState';

export type Store = StoreAction & StroeState;

export const createStore: StateCreator<Store, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createMarketAction(...parameters),
});
