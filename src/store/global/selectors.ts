import { GlobalStore } from '@/store/global';
import { SessionDefaultGroup } from '@/types/session';

const sessionGroupKeys = (s: GlobalStore): string[] =>
  s.preference.expandSessionGroupKeys || [SessionDefaultGroup.Pinned, SessionDefaultGroup.Default];

const hidePWAInstaller = (s: GlobalStore): boolean => s.preference.hidePWAInstaller || false;

export const preferenceSelectors = {
  hidePWAInstaller,
  sessionGroupKeys,
};
