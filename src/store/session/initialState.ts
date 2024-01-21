import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { LobeAgentSession } from '@/types/session';

export type SessionStoreState = SessionState;

export interface SessionState {
  /**
   * @title 当前活动的会话
   * @description 当前正在编辑或查看的会话
   */
  activeId: string;
  isMobile?: boolean;
  isSearching: boolean;
  isSessionsFirstFetchFinished: boolean;
  /**
   * 后续看看是否可以将 router 部分的逻辑移出去
   * @deprecated
   */
  router?: AppRouterInstance;
  searchKeywords: string;
  searchSessions: LobeAgentSession[];
  sessions: LobeAgentSession[];
}

export const initialState: SessionStoreState = {
  activeId: 'inbox',
  isMobile: false,
  isSearching: false,
  isSessionsFirstFetchFinished: false,
  searchKeywords: '',
  searchSessions: [],
  sessions: [],
};
