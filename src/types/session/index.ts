import { LobeSessions } from '@/types/session/agentSession';
import { LobeSessionGroups, SessionGroupId } from '@/types/session/sessionGroup';

export * from './agentSession';
export * from './sessionGroup';

export interface ChatSessionList {
  sessionGroups: LobeSessionGroups;
  sessions: LobeSessions;
}

export interface UpdateSessionParams {
  group?: SessionGroupId;
  meta?: any;
  pinned?: boolean;
  updatedAt: Date;
}
