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
   * 分发聊天记录
   * @param payload - 聊天记录
   */
  dispatchSession: (payload: SessionDispatch) => void;

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
   * 生成压缩后的消息
   * @returns 压缩后的消息
   */
  // genShareUrl: () => string;
}

export const createSessionSlice: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  SessionAction
> = (set, get) => ({
  createSession: async () => {
    const { dispatchSession, switchSession } = get();

    const timestamp = Date.now();

    const newSession: LobeAgentSession = {
      chats: {},
      config: {
        model: LanguageModel.GPT3_5,
        params: {
          temperature: 0.6,
        },
        systemRole: '',
      },
      createAt: timestamp,
      id: uuid(),
      meta: {
        title: '默认对话',
      },
      type: LobeSessionType.Agent,
      updateAt: timestamp,
    };

    dispatchSession({ session: newSession, type: 'addSession' });

    switchSession(newSession.id);
  },

  dispatchSession: (payload) => {
    const { type, ...res } = payload;
    set({ sessions: sessionsReducer(get().sessions, payload) }, false, {
      payload: res,
      type: `dispatchChat/${type}`,
    });
  },

  removeSession: (sessionId) => {
    get().dispatchSession({ id: sessionId, type: 'removeSession' });

    if (sessionId === get().activeId) {
      Router.push('/');
    }
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
