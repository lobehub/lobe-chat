import { GlobalStore } from '@/store/global';

import { initialState } from '../../initialState';

const sessionGroupKeys = (s: GlobalStore): string[] =>
  s.preference.sessionGroupKeys || initialState.preference.sessionGroupKeys;

const useCmdEnterToSend = (s: GlobalStore): boolean => s.preference.useCmdEnterToSend || false;

export const preferenceSelectors = {
  sessionGroupKeys,
  useCmdEnterToSend,
};
