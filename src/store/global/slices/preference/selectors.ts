import { GlobalStore } from '@/store/global';

const sessionGroupKeys = (s: GlobalStore): string[] => s.preference.expandSessionGroupKeys || [];

const useCmdEnterToSend = (s: GlobalStore): boolean => s.preference.useCmdEnterToSend || false;

const userAllowTrace = (s: GlobalStore) => s.preference.telemetry;

const showSyncAlert = (s: GlobalStore) => s.preference.showSyncAlert;

export const preferenceSelectors = {
  sessionGroupKeys,
  showSyncAlert,
  useCmdEnterToSend,
  userAllowTrace,
};
