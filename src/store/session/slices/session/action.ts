import Router from 'next/router';
import { StateCreator } from 'zustand/vanilla';

import { genShareMessagesUrl } from '@/helpers/url';
import { promptSummaryDescription, promptSummaryTitle } from '@/prompts/chat';
import { SessionStore } from '@/store/session';
import { LanguageModel } from '@/types/llm';
import { LobeAgentSession, LobeSessionType } from '@/types/session';
import { fetchPresetTaskResult } from '@/utils/fetch';
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
   * @title 删除会话
   * @param index - 会话索引
   * @returns void
   */
  removeChat: (sessionId: string) => void;

  /**
   * @title 切换会话
   * @param sessionId - 会话索引
   * @returns void
   */
  switchChat: (sessionId?: string | 'new') => void;

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

  autoAddChatBasicInfo: (chatId: string) => void;

  updateLoadingState: (key: keyof SessionLoadingState, value: boolean) => void;
}

export const createSessionSlice: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  SessionAction
> = (set, get) => ({
  dispatchSession: (payload) => {
    const { type, ...res } = payload;

    set({ sessions: sessionsReducer(get().sessions, payload) }, false, {
      type: `dispatchChat/${type}`,
      payload: res,
    });
  },

  createSession: async () => {
    const { dispatchSession, switchChat } = get();

    const timestamp = Date.now();

    const newSession: LobeAgentSession = {
      id: uuid(),
      createAt: timestamp,
      updateAt: timestamp,
      type: LobeSessionType.Agent,
      chats: [],
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

    switchChat(newSession.id);
  },

  removeChat: (sessionId) => {
    get().dispatchSession({ type: 'removeSession', id: sessionId });
    get().switchChat();
  },

  switchChat: (sessionId) => {
    if (get().activeId === sessionId) return;

    set({ activeId: sessionId });

    // 新会话
    Router.push(`/chat/${sessionId}`);
  },

  genShareUrl: () => {
    const session = sessionSelectors.currentChat(get());
    if (!session) return '';

    const agent = session.config;
    return genShareMessagesUrl(session.chats, agent.systemRole);
  },

  autoAddChatBasicInfo: (chatId) => {
    const chat = sessionSelectors.getSessionById(chatId)(get());
    const updateMeta = (key: 'title' | 'description') => {
      let value = '';
      return (text: string) => {
        value += text;
        get().dispatchSession({
          type: 'updateSessionMeta',
          id: chatId,
          key,
          value,
        });
      };
    };

    if (!chat) return;
    if (!chat.meta.title) {
      fetchPresetTaskResult({
        params: promptSummaryTitle(chat.chats),
        onLoadingChange: (loading) => {
          get().updateLoadingState('summarizingTitle', loading);
        },
        onMessageHandle: updateMeta('title'),
      });
    }

    if (!chat.meta.description) {
      fetchPresetTaskResult({
        params: promptSummaryDescription(chat.chats),
        onLoadingChange: (loading) => {
          get().updateLoadingState('summarizingTitle', loading);
        },
        onMessageHandle: updateMeta('description'),
      });
    }
  },

  updateLoadingState: (key, value) => {
    set({ loading: { ...get().loading, [key]: value } });
  },
});
