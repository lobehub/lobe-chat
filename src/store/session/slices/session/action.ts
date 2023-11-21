import { produce } from 'immer';
import useSWR, { SWRResponse } from 'swr';
import { DeepPartial } from 'utility-types';
import { StateCreator } from 'zustand/vanilla';

import { INBOX_SESSION_ID } from '@/const/session';
import { SESSION_CHAT_URL } from '@/const/url';
import { sessionService } from '@/services/session';
import { settingsSelectors, useGlobalStore } from '@/store/global';
import { SessionStore } from '@/store/session';
import {
  LobeAgentSession,
  LobeAgentSettings,
  LobeSessionType,
  LobeSessions,
} from '@/types/session';
import { merge } from '@/utils/merge';
import { setNamespace } from '@/utils/storeDebug';

import { initLobeSession } from './initialState';
import { SessionDispatch, sessionsReducer } from './reducers/session';

const t = setNamespace('session');

export interface SessionAction {
  /**
   * active the session
   * TODO: 这个方法应该放在 chatStore 中
   * @param sessionId
   */
  activeSession: (sessionId: string) => void;
  /**
   * TODO: 待改造
   */
  clearSessions: () => void;
  /**
   * create a new session
   * @param agent
   * @returns sessionId
   */
  createSession: (agent?: DeepPartial<LobeAgentSettings>) => Promise<string>;
  /**
   * TODO: Need to be removed
   * dispatch session
   */
  dispatchSession: (payload: SessionDispatch) => void;
  /**
   * TODO: 待改造为更新 inbox 信息
   * 导入会话
   * @param sessions
   */
  importInbox: (inbox: LobeAgentSession) => void;
  /**
   * TODO: 待改造为批量添加
   * 导入会话
   * @param sessions
   */
  importSessions: (sessions: LobeSessions) => void;

  /**
   * TODO: 待改造为更新 item
   * 置顶会话
   * @param sessionId
   */
  pinSession: (sessionId: string, pinned?: boolean) => void;

  /**
   * remove session
   * @param id - sessionId
   */
  removeSession: (id: string) => void;

  switchBackToChat: () => void;

  /**
   * switch session url
   */
  switchSession: (sessionId?: string) => void;
  useFetchSessions: () => SWRResponse<any>;
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

  clearSessions: async () => {
    await sessionService.removeAllSessions();
    // set({ inbox: initInbox, sessions: {} }, false, t('clearSessions'));
  },

  createSession: async (agent) => {
    const { switchSession } = get();

    // 合并 settings 里的 defaultAgent
    const defaultAgent = merge(
      initLobeSession,
      settingsSelectors.defaultAgent(useGlobalStore.getState()),
    );

    const newSession: LobeAgentSession = merge(defaultAgent, agent);

    const id = await sessionService.createNewSession(LobeSessionType.Agent, newSession);

    switchSession(id);

    return id;
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

  removeSession: async (sessionId) => {
    await sessionService.removeSession(sessionId);

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
  useFetchSessions: () =>
    useSWR('fetchSessions', sessionService.getSessions, {
      onSuccess: () => {},
    }),
});
