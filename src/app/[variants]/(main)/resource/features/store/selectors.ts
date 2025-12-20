import { State } from './initialState';

export const selectors = {
  category: (s: State) => s.category,
  currentViewItemId: (s: State) => s.currentViewItemId,
  mode: (s: State) => s.mode,
};
