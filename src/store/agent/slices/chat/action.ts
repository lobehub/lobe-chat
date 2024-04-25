import { produce } from 'immer';
import { SWRResponse, mutate } from 'swr';
import { DeepPartial } from 'utility-types';
import { StateCreator } from 'zustand/vanilla';

import { useClientDataSWR } from '@/libs/swr';
import { sessionService } from '@/services/session';
import { LobeAgentConfig } from '@/types/agent';
import { merge } from '@/utils/merge';

import { AgentStore } from '../../store';
import { agentSelectors } from './selectors';

/**
 * 助手接口
 */
export interface AgentChatAction {
  removePlugin: (id: string) => void;
  togglePlugin: (id: string, open?: boolean) => Promise<void>;
  updateAgentConfig: (config: Partial<LobeAgentConfig>) => Promise<void>;

  useFetchAgentConfig: (id: string) => SWRResponse<LobeAgentConfig>;

  /* eslint-disable typescript-sort-keys/interface */

  internal_updateAgentConfig: (id: string, data: DeepPartial<LobeAgentConfig>) => Promise<void>;
  internal_refreshAgentConfig: (id: string) => Promise<void>;
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
  updateAgentConfig: async (config) => {
    const { activeId } = get();

    if (!activeId) return;

    await get().internal_updateAgentConfig(activeId, config);
  },

  useFetchAgentConfig: (sessionId) =>
    useClientDataSWR<LobeAgentConfig>(
      [FETCH_AGENT_CONFIG_KEY, sessionId],
      ([, id]: string[]) => sessionService.getSessionConfig(id),
      {
        onSuccess: (data) => {
          set({ agentConfig: data, isAgentConfigInit: true }, false, 'fetchAgentConfig');
        },
      },
    ),

  /* eslint-disable sort-keys-fix/sort-keys-fix */

  internal_updateAgentConfig: async (id, data) => {
    // optimistic update at frontend
    set({ agentConfig: merge(get().agentConfig, data) }, false, 'temp_updateAgentConfig');

    await sessionService.updateSessionConfig(id, data);
    await get().internal_refreshAgentConfig(id);
    // await get().refreshSessions();
  },

  internal_refreshAgentConfig: async (id) => {
    await mutate([FETCH_AGENT_CONFIG_KEY, id]);
  },
});
