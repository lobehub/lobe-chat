import { produce } from 'immer';
import { merge } from 'lodash-es';
import Router from 'next/router';
import { StateCreator } from 'zustand/vanilla';

import { SessionStore, initLobeSession } from '@/store/session';
import { LobeAgentSession, LobeSessions } from '@/types/session';
import { uuid } from '@/utils/uuid';

import { SessionDispatch, sessionsReducer } from './reducers/session';

export interface SessionAction {
  activeSession: (sessionId: string) => void;
  clearSessions: () => void;

  /**
   * @title 添加会话
   * @param session - 会话信息
   * @returns void
   */
  createSession: () => Promise<string>;
  /**
   * 变更session
   * @param payload - 聊天记录
   */
  dispatchSession: (payload: SessionDispatch) => void;

  /**
   * 导入会话
   * @param sessions
   */
  importSessions: (sessions: LobeSessions) => void;

  /**
   * 置顶会话
   * @param sessionId
   */
  pinSession: (sessionId: string, pinned?: boolean) => void;
  /**
   * 生成压缩后的消息
   * @returns 压缩后的消息
   */
  // genShareUrl: () => string;
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
  switchSession: (sessionId?: string) => Promise<void>;
}

export const createSessionSlice: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  SessionAction
> = (set, get) => ({
  activeSession: (sessionId) => {
    set({ activeId: sessionId });
  },

  clearSessions: () => {
    set({ sessions: {} });
  },

  createSession: async () => {
    const { dispatchSession, switchSession } = get();

    const timestamp = Date.now();

    // TODO: 等 settings 里的 defaultAgent 都改好以后，做个合并即可
    const newSession: LobeAgentSession = merge({}, initLobeSession, {
      createAt: timestamp,
      id: uuid(),
      updateAt: timestamp,
    });

    dispatchSession({ session: newSession, type: 'addSession' });

    await switchSession(newSession.id);

    return newSession.id;
  },

  dispatchSession: (payload) => {
    const { type, ...res } = payload;
    set({ sessions: sessionsReducer(get().sessions, payload) }, false, {
      payload: res,
      type: `dispatchChat/${type}`,
    });
  },

  importSessions: (importSessions) => {
    const { sessions } = get();
    set({
      sessions: produce(sessions, (draft) => {
        for (const [id, session] of Object.entries(importSessions)) {
          // 如果已经存在，则跳过
          if (draft[id]) continue;

          draft[id] = session;
        }
      }),
    });
  },
  // genShareUrl: () => {
  //   const session = sessionSelectors.currentSession(get());
  //   if (!session) return '';
  //
  //   const agent = session.config;
  //   return genShareMessagesUrl(session.chats, agent.systemRole);
  // },
  pinSession: (sessionId, pinned) => {
    const nextValue = typeof pinned === 'boolean' ? pinned : !get().sessions[sessionId].pinned;

    get().dispatchSession({ id: sessionId, pinned: nextValue, type: 'toggleSessionPinned' });
  },

  removeSession: (sessionId) => {
    get().dispatchSession({ id: sessionId, type: 'removeSession' });

    if (sessionId === get().activeId) {
      Router.push('/');
    }
  },

  switchSession: async (sessionId) => {
    if (get().activeId === sessionId) return;

    if (sessionId) {
      get().activeSession(sessionId);
    }

    // 新会话
    await Router.push(`/chat/${sessionId}`);
  },
});
