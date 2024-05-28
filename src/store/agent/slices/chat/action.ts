import isEqual from 'fast-deep-equal';
import { produce } from 'immer';
import useSWR, { SWRResponse, mutate } from 'swr';
import { DeepPartial } from 'utility-types';
import { StateCreator } from 'zustand/vanilla';

import { INBOX_SESSION_ID } from '@/const/session';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { useClientDataSWR } from '@/libs/swr';
import { sessionService } from '@/services/session';
import { AgentState } from '@/store/agent/slices/chat/initialState';
import { useSessionStore } from '@/store/session';
import { LobeAgentChatConfig, LobeAgentConfig } from '@/types/agent';
import { merge } from '@/utils/merge';

import { AgentStore } from '../../store';
import { agentSelectors } from './selectors';

/**
 * 助手接口
 */
export interface AgentChatAction {
  removePlugin: (id: string) => void;
  togglePlugin: (id: string, open?: boolean) => Promise<void>;
  updateAgentChatConfig: (config: Partial<LobeAgentChatConfig>) => Promise<void>;
  updateAgentConfig: (config: DeepPartial<LobeAgentConfig>) => Promise<void>;

  useFetchAgentConfig: (id: string) => SWRResponse<LobeAgentConfig>;
  useInitAgentStore: (
    defaultAgentConfig?: DeepPartial<LobeAgentConfig>,
  ) => SWRResponse<DeepPartial<LobeAgentConfig>>;

  /* eslint-disable typescript-sort-keys/interface */

  internal_updateAgentConfig: (
    id: string,
    data: DeepPartial<LobeAgentConfig>,
    signal?: AbortSignal,
  ) => Promise<void>;
  internal_refreshAgentConfig: (id: string) => Promise<void>;
  internal_dispatchAgentMap: (
    id: string,
    config: DeepPartial<LobeAgentConfig>,
    actions?: string,
  ) => void;
  internal_createAbortController: (key: keyof AgentState) => AbortController;
  /* eslint-enable */
}

const FETCH_AGENT_CONFIG_KEY = 'FETCH_AGENT_CONFIG';

export const createChatSlice: StateCreator<
  AgentStore,
  [['zustand/devtools', never]],
  [],
  AgentChatAction
> = (set, get) => ({
  removePlugin: async (id) => {
    await get().togglePlugin(id, false);
  },

  togglePlugin: async (id, open) => {
    const originConfig = agentSelectors.currentAgentConfig(get());

    const config = produce(originConfig, (draft) => {
      draft.plugins = produce(draft.plugins || [], (plugins) => {
        const index = plugins.indexOf(id);
        const shouldOpen = open !== undefined ? open : index === -1;

        if (shouldOpen) {
          // 如果 open 为 true 或者 id 不存在于 plugins 中，则添加它
          if (index === -1) {
            plugins.push(id);
          }
        } else {
          // 如果 open 为 false 或者 id 存在于 plugins 中，则移除它
          if (index !== -1) {
            plugins.splice(index, 1);
          }
        }
      });
    });

    await get().updateAgentConfig(config);
  },
  updateAgentChatConfig: async (config) => {
    const { activeId } = get();

    if (!activeId) return;

    await get().updateAgentConfig({ chatConfig: config });
  },
  updateAgentConfig: async (config) => {
    const { activeId } = get();

    if (!activeId) return;

    const controller = get().internal_createAbortController('updateAgentConfigSignal');

    await get().internal_updateAgentConfig(activeId, config, controller.signal);
  },
  useFetchAgentConfig: (sessionId) =>
    useClientDataSWR<LobeAgentConfig>(
      [FETCH_AGENT_CONFIG_KEY, sessionId],
      ([, id]: string[]) => sessionService.getSessionConfig(id),
      {
        fallbackData: DEFAULT_AGENT_CONFIG,
        onSuccess: (data) => {
          get().internal_dispatchAgentMap(sessionId, data, 'fetch');
        },
        suspense: true,
      },
    ),
  useInitAgentStore: (defaultAgentConfig) =>
    useSWR<DeepPartial<LobeAgentConfig>>(
      'fetchInboxAgentConfig',
      () => sessionService.getSessionConfig(INBOX_SESSION_ID),
      {
        onSuccess: (data) => {
          set(
            {
              defaultAgentConfig: merge(get().defaultAgentConfig, defaultAgentConfig),
              isInboxAgentConfigInit: true,
            },
            false,
            'initDefaultAgent',
          );

          if (data) {
            get().internal_dispatchAgentMap(INBOX_SESSION_ID, data, 'initInbox');
          }
        },
        revalidateOnFocus: false,
      },
    ),

  /* eslint-disable sort-keys-fix/sort-keys-fix */

  internal_dispatchAgentMap: (id, config, actions) => {
    const agentMap = produce(get().agentMap, (draft) => {
      if (!draft[id]) {
        draft[id] = config;
      } else {
        draft[id] = merge(draft[id], config);
      }
    });

    if (isEqual(get().agentMap, agentMap)) return;

    set({ agentMap }, false, 'dispatchAgent' + (actions ? `/${actions}` : ''));
  },

  internal_updateAgentConfig: async (id, data, signal) => {
    const prevModel = agentSelectors.currentAgentModel(get());
    // optimistic update at frontend
    get().internal_dispatchAgentMap(id, data, 'optimistic_updateAgentConfig');

    await sessionService.updateSessionConfig(id, data, signal);
    await get().internal_refreshAgentConfig(id);

    // refresh sessions to update the agent config if the model has changed
    if (prevModel !== data.model) await useSessionStore.getState().refreshSessions();
  },

  internal_refreshAgentConfig: async (id) => {
    await mutate([FETCH_AGENT_CONFIG_KEY, id]);
  },

  internal_createAbortController: (key) => {
    const abortController = get()[key] as AbortController;
    if (abortController) abortController.abort('canceled');
    const controller = new AbortController();
    set({ [key]: controller }, false, 'internal_createAbortController');

    return controller;
  },
});
