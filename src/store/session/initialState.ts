import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { LobeAgentSession } from '@/types/session';

export type SessionStoreState = SessionState;

export interface SessionState {
  /**
   * @title 当前活动的会话
   * @description 当前正在编辑或查看的会话
   */
  activeId: string;
  fetchSessionsLoading: boolean;
  isMobile?: boolean;
  isSearching: boolean;
  router?: AppRouterInstance;
  searchKeywords: string;
  searchSessions: LobeAgentSession[];
  sessions: LobeAgentSession[];
}

export const initialState: SessionStoreState = {
  activeId: 'inbox',
  fetchSessionsLoading: true,
  isMobile: false,
  isSearching: false,
  searchKeywords: '',
  searchSessions: [],
  sessions: [],
};
