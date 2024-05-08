import { CustomSessionGroup, LobeAgentSession, LobeSessionGroups } from '@/types/session';

export interface SessionState {
  /**
   * @title 当前活动的会话
   * @description 当前正在编辑或查看的会话
   */
  activeId: string;
  customSessionGroups: CustomSessionGroup[];
  defaultSessions: LobeAgentSession[];
  isMobile?: boolean;
  isSearching: boolean;
  isSessionsFirstFetchFinished: boolean;
  pinnedSessions: LobeAgentSession[];
  searchKeywords: string;
  sessionGroups: LobeSessionGroups;
  sessionSearchKeywords?: string;
  /**
   * it means defaultSessions
   */
  sessions: LobeAgentSession[];
}

export const initialSessionState: SessionState = {
  activeId: 'inbox',
  customSessionGroups: [],
  defaultSessions: [],
  isMobile: false,
  isSearching: false,
  isSessionsFirstFetchFinished: false,
  pinnedSessions: [],
  searchKeywords: '',
  sessionGroups: [],
  sessions: [],
};
