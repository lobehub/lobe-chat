import { UserStore } from '@/store/user';
import { SessionDefaultGroup } from '@/types/session';

const sessionGroupKeys = (s: UserStore): string[] =>
  s.preference.expandSessionGroupKeys || [SessionDefaultGroup.Pinned, SessionDefaultGroup.Default];

const useCmdEnterToSend = (s: UserStore): boolean => s.preference.useCmdEnterToSend || false;

const userAllowTrace = (s: UserStore) => s.preference.telemetry;

const hideSyncAlert = (s: UserStore) => s.preference.hideSyncAlert;

export const preferenceSelectors = {
  hideSyncAlert,
  sessionGroupKeys,
  useCmdEnterToSend,
  userAllowTrace,
};
