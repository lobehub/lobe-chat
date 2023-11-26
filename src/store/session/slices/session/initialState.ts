import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { DEFAULT_AGENT_META, DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { LobeAgentSession, LobeSessionType } from '@/types/session';
import { merge } from '@/utils/merge';

export interface SessionState {
  /**
   * @title 当前活动的会话
   * @description 当前正在编辑或查看的会话
   */
  activeId: string | undefined;
  fetchSessionsLoading: boolean;
  isMobile?: boolean;
  router?: AppRouterInstance;
  searchKeywords: string;
  sessions: LobeAgentSession[];
  topicSearchKeywords: string;
}

export const initLobeSession: LobeAgentSession = {
  config: DEFAULT_AGENT_CONFIG,
  createdAt: Date.now(),
  id: '',
  meta: DEFAULT_AGENT_META,
  type: LobeSessionType.Agent,
  updatedAt: Date.now(),
};
export const initInboxSession: LobeAgentSession = merge(initLobeSession, {
  id: 'inbox',
  meta: {
    avatar: DEFAULT_INBOX_AVATAR,
  },
});

export const initialSessionState: SessionState = {
  activeId: 'inbox',
  fetchSessionsLoading: true,
  isMobile: false,
  searchKeywords: '',
  sessions: [],
  topicSearchKeywords: '',
};
