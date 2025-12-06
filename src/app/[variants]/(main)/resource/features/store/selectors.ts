import { State } from './initialState';

export const selectors = {
  currentViewItemId: (s: State) => s.currentViewItemId,
  mode: (s: State) => s.mode,
};
