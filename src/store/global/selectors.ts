import { GlobalStore } from '@/store/global';
import { SessionDefaultGroup } from '@/types/session';

const sessionGroupKeys = (s: GlobalStore): string[] =>
  s.preference.expandSessionGroupKeys || [SessionDefaultGroup.Pinned, SessionDefaultGroup.Default];

export const preferenceSelectors = {
  sessionGroupKeys,
};
