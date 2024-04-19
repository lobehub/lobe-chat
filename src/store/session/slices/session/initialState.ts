import { DEFAULT_AGENT_META } from '@/const/meta';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { CustomSessionGroup, LobeAgentSession, LobeSessionType } from '@/types/session';

export const initLobeSession: LobeAgentSession = {
  config: DEFAULT_AGENT_CONFIG,
  createdAt: Date.now(),
  id: '',
  meta: DEFAULT_AGENT_META,
  type: LobeSessionType.Agent,
  updatedAt: Date.now(),
};

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
  sessions: [],
};
