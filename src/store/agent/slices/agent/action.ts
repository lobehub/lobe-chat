import { getSingletonAnalyticsOptional } from '@lobehub/analytics';
import isEqual from 'fast-deep-equal';
import { produce } from 'immer';
import { SWRResponse, mutate } from 'swr';
import type { PartialDeep } from 'type-fest';
import { StateCreator } from 'zustand/vanilla';

import { MESSAGE_CANCEL_FLAT } from '@/const/message';
import { useClientDataSWR } from '@/libs/swr';
import { CreateAgentParams, CreateAgentResult, agentService } from '@/services/agent';
import { getUserStoreState } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';
import { LobeAgentChatConfig, LobeAgentConfig } from '@/types/agent';
import { MetaData } from '@/types/meta';
import { merge } from '@/utils/merge';

import type { AgentStore } from '../../store';
import { AgentSliceState } from './initialState';

const FETCH_AGENT_CONFIG_KEY = 'FETCH_AGENT_CONFIG';

/**
 * Agent Slice Actions
 * Handles agent CRUD operations (config/meta updates)
 */
export interface AgentSliceAction {
  /**
   * Append content chunk to streaming system role
   */
  appendStreamingSystemRole: (chunk: string) => void;
  /**
   * Create a new agent with session
   * @returns Created agent result with agentId and sessionId
   */
  createAgent: (params: CreateAgentParams) => Promise<CreateAgentResult>;
  /**
   * Finish streaming and save final content to agent config
   */
  finishStreamingSystemRole: (agentId: string) => Promise<void>;
  internal_createAbortController: (key: keyof AgentSliceState) => AbortController;
  internal_dispatchAgentMap: (id: string, config: PartialDeep<LobeAgentConfig>) => void;
  internal_refreshAgentConfig: (id: string) => Promise<void>;
  optimisticUpdateAgentConfig: (
    id: string,
    data: PartialDeep<LobeAgentConfig>,
    signal?: AbortSignal,
  ) => Promise<void>;
  optimisticUpdateAgentMeta: (
    id: string,
    meta: Partial<MetaData>,
    signal?: AbortSignal,
  ) => Promise<void>;
  /**
   * Set the agent panel pinned state
   */
  setAgentPinned: (pinned: boolean | ((prev: boolean) => boolean)) => void;
  /**
   * Start streaming system role update
   */
  startStreamingSystemRole: () => void;
  /**
   * Toggle the agent panel pinned state
   */
  toggleAgentPinned: () => void;
  updateAgentChatConfig: (config: Partial<LobeAgentChatConfig>) => Promise<void>;
  updateAgentChatConfigById: (
    agentId: string,
    config: Partial<LobeAgentChatConfig>,
  ) => Promise<void>;
  updateAgentConfig: (config: PartialDeep<LobeAgentConfig>) => Promise<void>;
  updateAgentConfigById: (agentId: string, config: PartialDeep<LobeAgentConfig>) => Promise<void>;
  updateAgentMeta: (meta: Partial<MetaData>) => Promise<void>;
  useFetchAgentConfig: (isLogin: boolean | undefined, id: string) => SWRResponse<LobeAgentConfig>;
}

export const createAgentSlice: StateCreator<
  AgentStore,
  [['zustand/devtools', never]],
  [],
  AgentSliceAction
> = (set, get) => ({
  appendStreamingSystemRole: (chunk) => {
    const currentContent = get().streamingSystemRole || '';
    set({ streamingSystemRole: currentContent + chunk }, false, 'appendStreamingSystemRole');
  },

  createAgent: async (params) => {
    const result = await agentService.createAgent(params);

    // Track new agent creation analytics
    const analytics = getSingletonAnalyticsOptional();
    if (analytics) {
      const userStore = getUserStoreState();
      const userId = userProfileSelectors.userId(userStore);

      analytics.track({
        name: 'new_agent_created',
        properties: {
          agent_id: result.agentId,
          assistant_name: params.config?.title || 'Untitled Agent',
          assistant_tags: params.config?.tags || [],
          session_id: result.sessionId,
          user_id: userId || 'anonymous',
        },
      });
    }

    return result;
  },

  finishStreamingSystemRole: async (agentId) => {
    const { streamingSystemRole } = get();

    if (!streamingSystemRole) {
      set({ streamingSystemRoleInProgress: false }, false, 'finishStreamingSystemRole');
      return;
    }

    // Save the final content to agent config
    await get().optimisticUpdateAgentConfig(agentId, {
      systemRole: streamingSystemRole,
    });

    // Reset streaming state
    set(
      {
        streamingSystemRole: undefined,
        streamingSystemRoleInProgress: false,
      },
      false,
      'finishStreamingSystemRole',
    );
  },

  setAgentPinned: (value) => {
    set(
      (state) => ({
        isAgentPinned: typeof value === 'function' ? value(state.isAgentPinned) : value,
      }),
      false,
      'setAgentPinned',
    );
  },

  startStreamingSystemRole: () => {
    set(
      {
        streamingSystemRole: '',
        streamingSystemRoleInProgress: true,
      },
      false,
      'startStreamingSystemRole',
    );
  },

  toggleAgentPinned: () => {
    set((state) => ({ isAgentPinned: !state.isAgentPinned }), false, 'toggleAgentPinned');
  },

  updateAgentChatConfig: async (config) => {
    const { activeAgentId } = get();

    if (!activeAgentId) return;

    await get().updateAgentConfig({ chatConfig: config });
  },

  updateAgentChatConfigById: async (agentId, config) => {
    if (!agentId) return;

    await get().updateAgentConfigById(agentId, { chatConfig: config });
  },

  updateAgentConfig: async (config) => {
    const { activeAgentId } = get();

    if (!activeAgentId) return;

    const controller = get().internal_createAbortController('updateAgentConfigSignal');

    await get().optimisticUpdateAgentConfig(activeAgentId, config, controller.signal);
  },

  updateAgentConfigById: async (agentId, config) => {
    if (!agentId) return;

    const controller = get().internal_createAbortController('updateAgentConfigSignal');

    await get().optimisticUpdateAgentConfig(agentId, config, controller.signal);
  },

  updateAgentMeta: async (meta) => {
    const { activeAgentId } = get();

    if (!activeAgentId) return;

    const controller = get().internal_createAbortController('updateAgentMetaSignal');

    await get().optimisticUpdateAgentMeta(activeAgentId, meta, controller.signal);
  },

  useFetchAgentConfig: (isLogin, agentId) =>
    useClientDataSWR<LobeAgentConfig>(
      // Only fetch when login status is explicitly true (not null/undefined)
      isLogin === true && agentId && !agentId.startsWith('cg_')
        ? ([FETCH_AGENT_CONFIG_KEY, agentId] as const)
        : null,
      async ([, id]: readonly [string, string]) => {
        const data = await agentService.getAgentConfigById(id);
        return data as LobeAgentConfig;
      },
      {
        onSuccess: (data) => {
          get().internal_dispatchAgentMap(agentId, data);

          set(
            {
              activeAgentId: data.id,
              agentConfigInitMap: { ...get().agentConfigInitMap, [agentId]: true },
            },
            false,
            'fetchAgentConfig',
          );
        },
      },
    ),

  /* eslint-disable sort-keys-fix/sort-keys-fix */

  internal_dispatchAgentMap: (id, config) => {
    const agentMap = produce(get().agentMap, (draft) => {
      if (!draft[id]) {
        draft[id] = config;
      } else {
        draft[id] = merge(draft[id], config);
      }
    });

    if (isEqual(get().agentMap, agentMap)) return;

    set({ agentMap }, false, 'dispatchAgentMap');
  },

  optimisticUpdateAgentConfig: async (id, data, signal) => {
    // 1. Optimistic update (instant UI feedback)
    get().internal_dispatchAgentMap(id, data);

    // 2. API call returns updated agent data
    const result = await agentService.updateAgentConfig(id, data, signal);

    // 3. Use returned data directly (no refetch needed!)
    if (result?.success && result.agent) {
      get().internal_dispatchAgentMap(id, result.agent);
    }
  },

  optimisticUpdateAgentMeta: async (id, meta, signal) => {
    // 1. Optimistic update - meta fields are at the top level of agent config
    get().internal_dispatchAgentMap(id, meta as PartialDeep<LobeAgentConfig>);

    // 2. API call returns updated agent data
    const result = await agentService.updateAgentMeta(id, meta, signal);

    // 3. Use returned data directly (no refetch needed!)
    if (result?.success && result.agent) {
      get().internal_dispatchAgentMap(id, result.agent);
    }
  },

  internal_refreshAgentConfig: async (id) => {
    await mutate([FETCH_AGENT_CONFIG_KEY, id]);
  },

  internal_createAbortController: (key) => {
    const abortController = get()[key] as AbortController;
    if (abortController) abortController.abort(MESSAGE_CANCEL_FLAT);
    const controller = new AbortController();
    set({ [key]: controller }, false, 'internal_createAbortController');

    return controller;
  },
});
