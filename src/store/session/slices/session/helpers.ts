import { LobeAgentSession, SessionGroupDefaultKeys } from '@/types/session';

export const getSessionPinned = (session: LobeAgentSession) =>
  session.group === SessionGroupDefaultKeys.Pinned;

export const sessionHelpers = {
  getSessionPinned,
};
