import { GlobalStore } from '@/store/global';
import { SessionDefaultGroup } from '@/types/session';

const sessionGroupKeys = (s: GlobalStore): string[] =>
  s.preference.expandSessionGroupKeys || [SessionDefaultGroup.Pinned, SessionDefaultGroup.Default];

const useCmdEnterToSend = (s: GlobalStore): boolean => s.preference.useCmdEnterToSend || false;

const userAllowTrace = (s: GlobalStore) => s.preference.telemetry;

const hideSyncAlert = (s: GlobalStore) => s.preference.hideSyncAlert;

export const preferenceSelectors = {
  hideSyncAlert,
  sessionGroupKeys,
  useCmdEnterToSend,
  userAllowTrace,
};
