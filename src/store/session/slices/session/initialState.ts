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
  // 默认会话
  inbox: LobeAgentSession;
  isMobile?: boolean;
  router?: AppRouterInstance;
  searchKeywords: string;
  sessions: Record<string, LobeAgentSession>;
  topicSearchKeywords: string;
}

export const initLobeSession: LobeAgentSession = {
  chats: {},
  config: DEFAULT_AGENT_CONFIG,
  createAt: Date.now(),
  files: [],
  id: '',
  meta: DEFAULT_AGENT_META,
  type: LobeSessionType.Agent,
  updateAt: Date.now(),
};
export const initInbox: LobeAgentSession = merge(initLobeSession, {
  id: 'inbox',
  meta: {
    avatar: DEFAULT_INBOX_AVATAR,
  },
});

export const initialSessionState: SessionState = {
  activeId: 'inbox',
  inbox: initInbox,
  isMobile: false,
  searchKeywords: '',
  sessions: {},
  topicSearchKeywords: '',
};
