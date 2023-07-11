import Router from 'next/router';
import { StateCreator } from 'zustand/vanilla';

import { SessionStore } from '@/store/session';
import { LanguageModel } from '@/types/llm';
import { LobeAgentSession, LobeSessionType } from '@/types/session';
import { uuid } from '@/utils/uuid';

import { SessionDispatch, sessionsReducer } from './reducers/session';

export interface SessionAction {
  /**
   * @title 添加会话
   * @param session - 会话信息
   * @returns void
   */
  createSession: () => Promise<void>;
  /**
   * @title 删除会话
   * @param index - 会话索引
   * @returns void
   */
  removeSession: (sessionId: string) => void;

  /**
   * @title 切换会话
   * @param sessionId - 会话索引
   * @returns void
   */
  switchSession: (sessionId?: string | 'new') => void;

  /**
   * 分发聊天记录
   * @param payload - 聊天记录
   */
  dispatchSession: (payload: SessionDispatch) => void;

  /**
   * 生成压缩后的消息
   * @returns 压缩后的消息
   */
  // genShareUrl: () => string;
}

export const createSessionSlice: StateCreator<SessionStore, [['zustand/devtools', never]], [], SessionAction> = (
  set,
  get,
) => ({
  dispatchSession: (payload) => {
    const { type, ...res } = payload;
    set({ sessions: sessionsReducer(get().sessions, payload) }, false, {
      type: `dispatchChat/${type}`,
      payload: res,
    });
  },

  createSession: async () => {
    const { dispatchSession, switchSession } = get();

    const timestamp = Date.now();

    const newSession: LobeAgentSession = {
      id: uuid(),
      createAt: timestamp,
      updateAt: timestamp,
      type: LobeSessionType.Agent,
      chats: {},
      meta: {
        title: '默认对话',
      },
      config: {
        model: LanguageModel.GPT3_5,
        systemRole: '',
        params: {
          temperature: 0.6,
        },
      },
    };

    dispatchSession({ type: 'addSession', session: newSession });

    switchSession(newSession.id);
  },

  removeSession: (sessionId) => {
    get().dispatchSession({ type: 'removeSession', id: sessionId });
    Router.push('/');
  },

  switchSession: (sessionId) => {
    if (get().activeId === sessionId) return;

    set({ activeId: sessionId });

    // 新会话
    Router.push(`/chat/${sessionId}`);
  },

  // genShareUrl: () => {
  //   const session = sessionSelectors.currentSession(get());
  //   if (!session) return '';
  //
  //   const agent = session.config;
  //   return genShareMessagesUrl(session.chats, agent.systemRole);
  // },
});
