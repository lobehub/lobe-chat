import { LobeAgentSession } from '@/types/session';

export interface SessionState {
  /**
   * @title 当前活动的会话
   * @description 当前正在编辑或查看的会话
   */
  activeId: string;
  /**
   * @title 并行会话IDs
   * @description 并行打开的多个会话的ID列表
   */
  parallelSessionIds: string[];
  defaultSessions: LobeAgentSession[];
  isSearching: boolean;
  isSessionsFirstFetchFinished: boolean;
  pinnedSessions: LobeAgentSession[];
  searchKeywords: string;
  sessionSearchKeywords?: string;
  /**
   * it means defaultSessions
   */
  sessions: LobeAgentSession[];
  signalSessionMeta?: AbortController;
}

export const initialSessionState: SessionState = {
  activeId: 'inbox',
  parallelSessionIds: [],
  defaultSessions: [],
  isSearching: false,
  isSessionsFirstFetchFinished: false,
  pinnedSessions: [],
  searchKeywords: '',
  sessions: [],
};
