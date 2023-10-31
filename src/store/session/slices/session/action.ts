import { produce } from 'immer';
import { merge } from 'lodash-es';
import { DeepPartial } from 'utility-types';
import { StateCreator } from 'zustand/vanilla';

import { INBOX_SESSION_ID } from '@/const/session';
import { SESSION_CHAT_URL } from '@/const/url';
import { useGlobalStore } from '@/store/global';
import { SessionStore } from '@/store/session';
import { LobeAgentSession, LobeAgentSettings, LobeSessions } from '@/types/session';
import { setNamespace } from '@/utils/storeDebug';
import { uuid } from '@/utils/uuid';

import { initInbox, initLobeSession } from './initialState';
import { SessionDispatch, sessionsReducer } from './reducers/session';

const t = setNamespace('session');

export interface SessionAction {
  activeSession: (sessionId: string) => void;
  clearSessions: () => void;
  /**
   * @title 添加会话
   * @param session - 会话信息
   * @returns void
   */
  createSession: (agent?: DeepPartial<LobeAgentSettings>) => Promise<string>;
  /**
   * 变更session
   * @param payload - 聊天记录
   */
  dispatchSession: (payload: SessionDispatch) => void;
  importInbox: (inbox: LobeAgentSession) => void;
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

  switchBackToChat: () => void;

  /**
   * @title 切换会话
   * @param sessionId - 会话索引
   * @returns void
   */
  switchSession: (sessionId?: string) => void;
}

export const createSessionSlice: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  SessionAction
> = (set, get) => ({
  activeSession: (sessionId) => {
    set({ activeId: sessionId, activeTopicId: undefined }, false, t('activeSession'));
  },

  clearSessions: () => {
    set({ inbox: initInbox, sessions: {} }, false, t('clearSessions'));
  },

  createSession: async (agent) => {
    const { dispatchSession, switchSession } = get();

    const timestamp = Date.now();

    // 合并 settings 里的 defaultAgent
    const globalDefaultAgent = useGlobalStore.getState().settings.defaultAgent;
    const newSession: LobeAgentSession = merge({}, initLobeSession, globalDefaultAgent, {
      ...agent,
      createAt: timestamp,
      id: uuid(),
      updateAt: timestamp,
    });

    dispatchSession({ session: newSession, type: 'addSession' });

    switchSession(newSession.id);

    return newSession.id;
  },

  dispatchSession: (payload) => {
    const { type, ...res } = payload;

    // 如果是 inbox 类型的 session
    if ('id' in res && res.id === INBOX_SESSION_ID) {
      const nextInbox = sessionsReducer({ inbox: get().inbox }, payload) as {
        inbox: LobeAgentSession;
      };
      set({ inbox: nextInbox.inbox }, false, t(`dispatchInbox/${type}`, res));
    } else {
      // 常规类型的session
      set(
        { sessions: sessionsReducer(get().sessions, payload) },
        false,
        t(`dispatchSessions/${type}`, res),
      );
    }
  },
  // TODO：暂时先不实现导入 inbox 的功能
  importInbox: () => {},
  importSessions: (importSessions) => {
    const { sessions } = get();
    set(
      {
        sessions: produce(sessions, (draft) => {
          for (const [id, session] of Object.entries(importSessions)) {
            // 如果已经存在，则跳过
            if (draft[id]) continue;

            draft[id] = session;
          }
        }),
      },
      false,
      t('importSessions', importSessions),
    );
  },

  pinSession: (sessionId, pinned) => {
    const nextValue = typeof pinned === 'boolean' ? pinned : !get().sessions[sessionId].pinned;

    get().dispatchSession({ id: sessionId, pinned: nextValue, type: 'toggleSessionPinned' });
  },

  removeSession: (sessionId) => {
    get().dispatchSession({ id: sessionId, type: 'removeSession' });

    if (sessionId === get().activeId) {
      get().switchSession();
    }
  },

  switchBackToChat: () => {
    const { activeId, router } = get();

    const id = activeId || INBOX_SESSION_ID;

    get().activeSession(id);

    router?.push(SESSION_CHAT_URL(id, get().isMobile));
  },
  switchSession: (sessionId = INBOX_SESSION_ID) => {
    const { isMobile, router } = get();

    get().activeSession(sessionId);

    router?.push(SESSION_CHAT_URL(sessionId, isMobile));
  },
});
