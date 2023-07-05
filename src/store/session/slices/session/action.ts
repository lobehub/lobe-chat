import Router from 'next/router';
import { StateCreator } from 'zustand/vanilla';

import { genShareMessagesUrl } from '@/helpers/url';
import { SessionStore } from '@/store/session';
import { LanguageModel } from '@/types/llm';
import { LobeAgentSession, LobeSessionType } from '@/types/session';
import { uuid } from '@/utils/uuid';

import { SessionLoadingState } from './initialState';
import { SessionDispatch, sessionsReducer } from './reducers/session';
import { sessionSelectors } from './selectors';

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
   * 生成压缩后的消息
   * @returns 压缩后的消息
   */
  genShareUrl: () => string;

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

  updateLoadingState: (key: keyof SessionLoadingState, value: boolean) => void;
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

  genShareUrl: () => {
    const session = sessionSelectors.currentChat(get());
    if (!session) return '';

    const agent = session.config;
    return genShareMessagesUrl(session.chats, agent.systemRole);
  },

  removeSession: (sessionId) => {
    get().dispatchSession({ id: sessionId, type: 'removeSession' });
    Router.push('/');
  },

  switchSession: (sessionId) => {
    if (get().activeId === sessionId) return;

    set({ activeId: sessionId });

    // 新会话
    Router.push(`/chat/${sessionId}`);
  },

  updateLoadingState: (key, value) => {
    set({ loading: { ...get().loading, [key]: value } });
  },
});
