import isEqual from 'fast-deep-equal';
import { produce } from 'immer';
import useSWR, { SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { marketService } from '@/services/market';
import { globalHelpers } from '@/store/user/helpers';
import { AgentsMarketItem, LobeChatAgentsMarketIndex } from '@/types/market';

import type { Store } from './store';

export interface StoreAction {
  activateAgent: (identifier: string) => void;
  deactivateAgent: () => void;
  setSearchKeywords: (keywords: string) => void;
  updateAgentMap: (key: string, value: AgentsMarketItem) => void;
  useFetchAgent: (identifier: string) => SWRResponse<AgentsMarketItem>;
  useFetchAgentList: () => SWRResponse<LobeChatAgentsMarketIndex>;
}

export const createMarketAction: StateCreator<
  Store,
  [['zustand/devtools', never]],
  [],
  StoreAction
> = (set, get) => ({
  activateAgent: (identifier) => {
    set({ currentIdentifier: identifier });
  },
  deactivateAgent: () => {
    set({ currentIdentifier: '' }, false, 'deactivateAgent');
  },
  setSearchKeywords: (keywords) => {
    set({ searchKeywords: keywords });
  },
  updateAgentMap: (key, value) => {
    const { agentMap } = get();

    const nextAgentMap = produce(agentMap, (draft) => {
      draft[key] = value;
    });

    if (isEqual(nextAgentMap, agentMap)) return;

    set({ agentMap: nextAgentMap }, false, `setAgentMap/${key}`);
  },
  useFetchAgent: (identifier) =>
    useSWR<AgentsMarketItem>(
      [identifier, globalHelpers.getCurrentLanguage()],
      ([id, locale]) => marketService.getAgentManifest(id, locale as string),
      {
        onError: () => {
          get().deactivateAgent();
        },
        onSuccess: (data) => {
          get().updateAgentMap(identifier, data);
        },
      },
    ),
  useFetchAgentList: () =>
    useSWR<LobeChatAgentsMarketIndex>(
      globalHelpers.getCurrentLanguage(),
      marketService.getAgentList,
      {
        onSuccess: (agentMarketIndex) => {
          set(
            { agentList: agentMarketIndex.agents, tagList: agentMarketIndex.tags },
            false,
            'useFetchAgentList',
          );
        },
        revalidateOnFocus: false,
      },
    ),
});
