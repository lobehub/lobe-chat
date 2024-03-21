import { GlobalStore } from '@/store/global';

const sessionGroupKeys = (s: GlobalStore): string[] => s.preference.expandSessionGroupKeys || [];

const useCmdEnterToSend = (s: GlobalStore): boolean => s.preference.useCmdEnterToSend || false;

const userAllowTrace = (s: GlobalStore) => s.preference.telemetry;

const hideSyncAlert = (s: GlobalStore) => s.preference.hideSyncAlert;

export const preferenceSelectors = {
  hideSyncAlert,
  sessionGroupKeys,
  useCmdEnterToSend,
  userAllowTrace,
};
