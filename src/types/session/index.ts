import { LobeSessions } from '@/types/session/agentSession';
import { LobeSessionGroups } from '@/types/session/sessionGroup';

export * from './agentSession';
export * from './sessionGroup';

export interface ChatSessionList {
  sessionGroups: LobeSessionGroups;
  sessions: LobeSessions;
}
