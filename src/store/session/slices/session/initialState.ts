import { LobeSessions } from '@/types/session';

export interface SessionState {
  /**
   * @title 当前活动的会话
   * @description 当前正在编辑或查看的会话
   */
  activeId: string;
  defaultSessions: LobeSessions;
  isSearching: boolean;
  isSessionsFirstFetchFinished: boolean;
  pinnedSessions: LobeSessions;
  searchKeywords: string;
  sessionSearchKeywords?: string;
  /**
   * it means defaultSessions
   */
  sessions: LobeSessions;
  signalSessionMeta?: AbortController;
}

export const initialSessionState: SessionState = {
  activeId: 'inbox',
  defaultSessions: [],
  isSearching: false,
  isSessionsFirstFetchFinished: false,
  pinnedSessions: [],
  searchKeywords: '',
  sessions: [],
};
