import { UserStore } from '@/store/user';

const useCmdEnterToSend = (s: UserStore): boolean => s.preference.useCmdEnterToSend || false;

const userAllowTrace = (s: UserStore) => s.preference.telemetry;

const hideSyncAlert = (s: UserStore) => s.preference.hideSyncAlert;
const isPreferenceInit = (s: UserStore) => s.isPreferenceInit;

export const preferenceSelectors = {
  hideSyncAlert,
  isPreferenceInit,
  useCmdEnterToSend,
  userAllowTrace,
};
