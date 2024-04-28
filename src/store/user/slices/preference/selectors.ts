import { UserStore } from '@/store/user';

const useCmdEnterToSend = (s: UserStore): boolean => s.preference.useCmdEnterToSend || false;

const userAllowTrace = (s: UserStore) => s.preference.telemetry;

const hideSyncAlert = (s: UserStore) => s.preference.hideSyncAlert;

export const preferenceSelectors = {
  hideSyncAlert,
  useCmdEnterToSend,
  userAllowTrace,
};
