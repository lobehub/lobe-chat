import { GlobalStore } from '@/store/global';

import { initialState } from '../initialState';

const sessionGroupKeys = (s: GlobalStore): string[] =>
  s.preference.sessionGroupKeys || initialState.preference.sessionGroupKeys;

export const preferenceSelectors = {
  sessionGroupKeys: sessionGroupKeys,
};
