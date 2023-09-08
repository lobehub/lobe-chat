import { merge } from 'lodash-es';

import { DEFAULT_AGENT_META, DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { LobeAgentConfig, LobeAgentSession, LobeSessionType } from '@/types/session';

import { initialLobeAgentConfig } from '../agentConfig/initialState';

export interface SessionState {
  /**
   * @title 当前活动的会话
   * @description 当前正在编辑或查看的会话
   */
  activeId: string | undefined;
  // 默认会话
  inbox: LobeAgentSession;
  isMobile?: boolean;
  searchKeywords: string;
  sessions: Record<string, LobeAgentSession>;
}

export const initLobeSession: LobeAgentSession = {
  chats: {},
  config: initialLobeAgentConfig,
  createAt: Date.now(),
  id: '',
  meta: DEFAULT_AGENT_META,
  type: LobeSessionType.Agent,
  updateAt: Date.now(),
};

export const initInbox = merge({}, initLobeSession, {
  config: {
    systemRole: '你是一名 AI 助理',
  } as LobeAgentConfig,
  id: 'inbox',
  meta: {
    avatar: DEFAULT_INBOX_AVATAR,
  },
} as Partial<LobeAgentSession>);

export const initialSessionState: SessionState = {
  activeId: undefined,
  inbox: initInbox,
  isMobile: false,
  searchKeywords: '',
  sessions: {},
};
