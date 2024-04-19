import { t } from 'i18next';
import { produce } from 'immer';
import useSWR, { SWRResponse, mutate } from 'swr';
import { DeepPartial } from 'utility-types';
import { StateCreator } from 'zustand/vanilla';

import { message } from '@/components/AntdStaticMethods';
import { INBOX_SESSION_ID } from '@/const/session';
import { SWRRefreshParams, useClientDataSWR } from '@/libs/swr';
import { sessionService } from '@/services/session';
import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';
import { SessionStore } from '@/store/session';
import { ChatSessionList, LobeAgentSession, LobeSessionType, LobeSessions } from '@/types/session';
import { merge } from '@/utils/merge';
import { setNamespace } from '@/utils/storeDebug';

import { agentSelectors } from '../agent/selectors';
import { initLobeSession } from './initialState';
import { sessionSelectors } from './selectors';

const n = setNamespace('session');

const FETCH_SESSIONS_KEY = 'fetchSessions';
const SEARCH_SESSIONS_KEY = 'searchSessions';

export interface SessionAction {
  /**
   * active the session
   * @param sessionId
   */
  activeSession: (sessionId: string) => void;
  /**
   * reset sessions to default
   */
  clearSessions: () => Promise<void>;
  /**
   * create a new session
   * @param agent
   * @returns sessionId
   */
  createSession: (
    session?: DeepPartial<LobeAgentSession>,
    isSwitchSession?: boolean,
  ) => Promise<string>;
  duplicateSession: (id: string) => Promise<void>;
  /**
   * Pins or unpins a session.
   */
  pinSession: (id: string, pinned: boolean) => Promise<void>;
  /**
   * re-fetch the data
   */
  refreshSessions: (params?: SWRRefreshParams<ChatSessionList>) => Promise<void>;

  /**
   * remove session
   * @param id - sessionId
   */
  removeSession: (id: string) => void;
  /**
   * A custom hook that uses SWR to fetch sessions data.
   */
  useFetchSessions: () => SWRResponse<ChatSessionList>;
  useSearchSessions: (keyword?: string) => SWRResponse<any>;
}

export const createSessionSlice: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  SessionAction
> = (set, get) => ({
  activeSession: (sessionId) => {
    if (get().activeId === sessionId) return;

    set({ activeId: sessionId }, false, n(`activeSession/${sessionId}`));
  },

  clearSessions: async () => {
    await sessionService.removeAllSessions();
    await get().refreshSessions();
  },

  createSession: async (agent, isSwitchSession = true) => {
    const { activeSession, refreshSessions } = get();

    // merge the defaultAgent in settings
    const defaultAgent = merge(
      initLobeSession,
      settingsSelectors.defaultAgent(useGlobalStore.getState()),
    );

    const newSession: LobeAgentSession = merge(defaultAgent, agent);

    const id = await sessionService.createSession(LobeSessionType.Agent, newSession);
    await refreshSessions();

    // Whether to goto  to the new session after creation, the default is to switch to
    if (isSwitchSession) activeSession(id);

    return id;
  },

  duplicateSession: async (id) => {
    const { activeSession, refreshSessions } = get();
    const session = sessionSelectors.getSessionById(id)(get());

    if (!session) return;
    const title = agentSelectors.getTitle(session.meta);

    const newTitle = t('duplicateSession.title', { ns: 'chat', title: title });

    const messageLoadingKey = 'duplicateSession.loading';

    message.loading({
      content: t('duplicateSession.loading', { ns: 'chat' }),
      duration: 0,
      key: messageLoadingKey,
    });

    const newId = await sessionService.cloneSession(id, newTitle);

    // duplicate Session Error
    if (!newId) {
      message.destroy(messageLoadingKey);
      message.error(t('copyFail', { ns: 'common' }));
      return;
    }

    await refreshSessions();
    message.destroy(messageLoadingKey);
    message.success(t('duplicateSession.success', { ns: 'chat' }));

    activeSession(newId);
  },

  pinSession: async (sessionId, pinned) => {
    await get().refreshSessions({
      action: async () => {
        await sessionService.updateSession(sessionId, { pinned });
      },
      // 乐观更新
      optimisticData: produce((draft) => {
        if (!draft) return;

        const session = draft.all.find((i) => i.id === sessionId);
        if (!session) return;

        session.pinned = pinned;

        if (pinned) {
          draft.pinned.unshift(session);

          if (session.group === 'default') {
            const index = draft.default.findIndex((i) => i.id === sessionId);
            draft.default.splice(index, 1);
          } else {
            const customGroup = draft.customGroup.find((group) => group.id === session.group);

            if (customGroup) {
              const index = customGroup.children.findIndex((i) => i.id === sessionId);
              customGroup.children.splice(index, 1);
            }
          }
        } else {
          const index = draft.pinned.findIndex((i) => i.id === sessionId);
          if (index !== -1) {
            draft.pinned.splice(index, 1);
          }

          if (session.group === 'default') {
            draft.default.push(session);
          } else {
            const customGroup = draft.customGroup.find((group) => group.id === session.group);
            if (customGroup) {
              customGroup.children.push(session);
            }
          }
        }
      }),
    });
  },

  refreshSessions: async (params) => {
    if (params) {
      // @ts-ignore
      await mutate(FETCH_SESSIONS_KEY, params.action, {
        optimisticData: params.optimisticData,
        // we won't need to make the action's data go into cache ,or the display will be
        // old -> optimistic -> undefined -> new
        populateCache: false,
      });
    } else await mutate(FETCH_SESSIONS_KEY);
  },

  removeSession: async (sessionId) => {
    await sessionService.removeSession(sessionId);
    await get().refreshSessions();

    // If the active session deleted, switch to the inbox session
    if (sessionId === get().activeId) {
      get().activeSession(INBOX_SESSION_ID);
    }
  },

  // TODO: 这里的逻辑需要优化，后续不应该是直接请求一个大的 sessions 数据
  // 最好拆成一个 all 请求，然后在前端完成 groupBy 的分组逻辑
  useFetchSessions: () =>
    useClientDataSWR<ChatSessionList>(FETCH_SESSIONS_KEY, sessionService.getGroupedSessions, {
      onSuccess: (data) => {
        // 由于 https://github.com/lobehub/lobe-chat/pull/541 的关系
        // 只有触发了 refreshSessions 才会更新 sessions，进而触发页面 rerender
        // 因此这里不能补充 equal 判断，否则会导致页面不更新
        // if (get().isSessionsFirstFetchFinished && isEqual(get().sessions, data)) return;

        // TODO：后续的根本解法应该是解除 inbox 和 session 的数据耦合
        // 避免互相依赖的情况出现

        set(
          {
            customSessionGroups: data.customGroup,
            defaultSessions: data.default,
            isSessionsFirstFetchFinished: true,
            pinnedSessions: data.pinned,
            sessions: data.all,
          },
          false,
          n('useFetchSessions/onSuccess', data),
        );
      },
    }),

  useSearchSessions: (keyword) =>
    useSWR<LobeSessions>(
      [SEARCH_SESSIONS_KEY, keyword],
      async () => {
        if (!keyword) return [];

        return sessionService.searchSessions(keyword);
      },
      { revalidateOnFocus: false, revalidateOnMount: false },
    ),
});
